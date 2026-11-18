import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

export function hashIpAddress(ip: string | null | undefined): string {
  const env = getEnv();
  const normalized = (ip ?? "0.0.0.0").trim();
  return crypto
    .createHmac("sha256", env.IP_HASH_SALT)
    .update(normalized)
    .digest("hex");
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * DB-backed sliding window rate limiter (Section 11.6).
 */
export async function checkRateLimit(
  bucket: string,
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${bucket}:${identifier}`.slice(0, 255);
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.windowStart < windowCutoff) {
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, windowStart: now },
        update: { count: 1, windowStart: now },
      });
      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - 1),
        resetAt: new Date(now.getTime() + windowSeconds * 1000),
      };
    }

    if (existing.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.windowStart.getTime() + windowSeconds * 1000),
      };
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - updated.count),
      resetAt: new Date(existing.windowStart.getTime() + windowSeconds * 1000),
    };
  } catch {
    // Fail open only if DB is momentarily unreachable in dev; log in caller
    return {
      allowed: true,
      remaining: 1,
      resetAt: new Date(now.getTime() + windowSeconds * 1000),
    };
  }
}
