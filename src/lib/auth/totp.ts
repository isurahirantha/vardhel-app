import "server-only";
import crypto from "node:crypto";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { getEnv } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const env = getEnv();
  return crypto.createHash("sha256").update(env.SESSION_SECRET).digest();
}

export function encryptTotpSecret(plainSecret: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainSecret, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptTotpSecret(encryptedPayload: string): string {
  const [ivHex, tagHex, dataHex] = encryptedPayload.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid encrypted TOTP secret payload");
  }
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function generateTotpSecret(): string {
  return authenticator.generateSecret(20);
}

export async function generateTotpQrDataUrl(
  email: string,
  secret: string
): Promise<string> {
  const otpauth = authenticator.keyuri(email, "Vardhel Admin", secret);
  return QRCode.toDataURL(otpauth);
}

export function verifyTotpCode(code: string, secret: string): boolean {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  return authenticator.check(cleaned, secret);
}

/**
 * Generates 10 one-time recovery codes and returns both plain codes (shown once) and SHA-256 hashes (stored in DB).
 */
export function generateRecoveryCodes(): {
  plainCodes: string[];
  hashedCodes: string[];
} {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
    const formatted = `${raw.slice(0, 5)}-${raw.slice(5, 10)}`;
    plainCodes.push(formatted);
    hashedCodes.push(hashRecoveryCode(formatted));
  }
  return { plainCodes, hashedCodes };
}

export function hashRecoveryCode(code: string): string {
  const normalized = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
