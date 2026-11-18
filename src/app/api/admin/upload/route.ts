import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { requireAdminMutationAuth } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";
import { prisma } from "@/lib/db";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { processAndStoreUpload } from "@/lib/storage/local-storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const csrfToken = formData.get("csrfToken")?.toString() ?? "";
    const session = await requireAdminMutationAuth(csrfToken);

    const file = formData.get("file");
    const altText = sanitizePlainText(formData.get("altText")?.toString() ?? "");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "File is required." }, { status: 400 });
    }
    if (!altText) {
      return NextResponse.json(
        { ok: false, error: "Alt text is required for accessibility (WCAG 2.2 AA)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mediaId = crypto.randomUUID();

    const processed = await processAndStoreUpload(buffer, file.type, mediaId);

    const media = await prisma.media.create({
      data: {
        id: mediaId,
        type: processed.type,
        storagePath: processed.storagePath,
        publicUrl: processed.publicUrl,
        mime: processed.mime,
        size: processed.size,
        width: processed.width ?? null,
        height: processed.height ?? null,
        altText,
        checksum: processed.checksum,
        uploadedBy: session.adminId,
      },
    });

    await writeAuditLog({
      adminId: session.adminId,
      action: "MEDIA_UPLOADED",
      entity: "media",
      entityId: media.id,
      diff: { mime: media.mime, size: media.size, altText: media.altText },
    });

    return NextResponse.json({ ok: true, media });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 400 }
    );
  }
}
