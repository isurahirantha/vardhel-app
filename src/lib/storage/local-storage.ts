import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getEnv } from "@/lib/env";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

export interface ProcessedUploadResult {
  storagePath: string;
  publicUrl: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  checksum: string;
  type: "image" | "video";
}

/**
 * Sniffs file magic bytes to verify genuine image or MP4/WebM video (Section 11.4).
 */
export function sniffMagicBytes(buf: Buffer): "jpeg" | "png" | "webp" | "mp4" | "webm" | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  // WebP: RIFF....WEBP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  // MP4: ....ftyp
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    return "mp4";
  }
  // WebM: 1A 45 DF A3
  if (
    buf[0] === 0x1a &&
    buf[1] === 0x45 &&
    buf[2] === 0xdf &&
    buf[3] === 0xa3
  ) {
    return "webm";
  }

  return null;
}

export async function processAndStoreUpload(
  fileBuffer: Buffer,
  declaredMime: string,
  mediaId: string
): Promise<ProcessedUploadResult> {
  const env = getEnv();
  const magic = sniffMagicBytes(fileBuffer);
  if (!magic) {
    throw new Error("Unsupported or unrecognized file signature (magic bytes check failed).");
  }

  await fs.mkdir(STORAGE_ROOT, { recursive: true });

  const isImage = magic === "jpeg" || magic === "png" || magic === "webp";
  const maxBytes = isImage
    ? env.UPLOAD_MAX_IMAGE_MB * 1024 * 1024
    : env.UPLOAD_MAX_VIDEO_MB * 1024 * 1024;

  if (fileBuffer.length > maxBytes) {
    throw new Error(`File exceeds maximum allowed size (${isImage ? env.UPLOAD_MAX_IMAGE_MB : env.UPLOAD_MAX_VIDEO_MB} MB).`);
  }

  if (isImage) {
    // Re-encode with sharp to WebP, stripping all EXIF/metadata and any embedded payloads (Section 11.4)
    const pipeline = sharp(fileBuffer).rotate();
    const metadata = await pipeline.metadata();
    const cleanWebpBuffer = await pipeline
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();

    const filename = `${crypto.randomUUID()}.webp`;
    const fullPath = path.join(STORAGE_ROOT, filename);
    await fs.writeFile(fullPath, cleanWebpBuffer, { mode: 0o600 });

    const checksum = crypto.createHash("sha256").update(cleanWebpBuffer).digest("hex");

    return {
      storagePath: filename,
      publicUrl: `/api/media/${mediaId}`,
      mime: "image/webp",
      size: cleanWebpBuffer.length,
      width: metadata.width,
      height: metadata.height,
      checksum,
      type: "image",
    };
  }

  // Video (MP4 / WebM)
  if (
    (magic === "mp4" && declaredMime !== "video/mp4") ||
    (magic === "webm" && declaredMime !== "video/webm")
  ) {
    throw new Error("Video MIME type does not match binary signature.");
  }

  const ext = magic === "mp4" ? "mp4" : "webm";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const fullPath = path.join(STORAGE_ROOT, filename);
  await fs.writeFile(fullPath, fileBuffer, { mode: 0o600 });

  const checksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  return {
    storagePath: filename,
    publicUrl: `/api/media/${mediaId}`,
    mime: magic === "mp4" ? "video/mp4" : "video/webm",
    size: fileBuffer.length,
    checksum,
    type: "video",
  };
}

export async function readStoredMediaBuffer(storagePath: string): Promise<Buffer> {
  const safeName = path.basename(storagePath);
  const fullPath = path.join(STORAGE_ROOT, safeName);
  return fs.readFile(fullPath);
}
