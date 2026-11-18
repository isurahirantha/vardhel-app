import "server-only";
import crypto from "node:crypto";

type LogLevel = "info" | "warn" | "error" | "security";

const REDACTED_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "tokenHash",
  "secret",
  "totpSecret",
  "totpSecretEnc",
  "authorization",
  "cookie",
  "csrfSecret",
]);

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (REDACTED_KEYS.has(k) || k.toLowerCase().includes("password") || k.toLowerCase().includes("secret")) {
      clean[k] = "[REDACTED]";
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function logEvent(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: sanitizeMeta(meta) } : {}),
  };

  if (level === "error" || level === "security") {
    console.error(JSON.stringify(payload));
  } else if (level === "warn") {
    console.warn(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
}
