import "server-only";
import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (Section 11.1)
const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours (Section 11.1)

export function getSessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Host-codeloom_admin"
    : "codeloom_admin";
}

export function getCsrfCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Host-codeloom_csrf"
    : "codeloom_csrf";
}

export function hashSessionToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function deriveCsrfToken(csrfSecret: string): string {
  const env = getEnv();
  return crypto
    .createHmac("sha256", env.SESSION_SECRET)
    .update(csrfSecret)
    .digest("hex");
}

export interface AuthenticatedAdminContext {
  sessionId: string;
  adminId: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  totpEnabled: boolean;
  csrfToken: string;
}

/**
 * Creates a new opaque 256-bit random session token, stores only its SHA-256 hash in DB,
 * and sets strict cookies (rotates session on login & privilege changes — Section 11.1).
 */
export async function createAdminSession(
  adminId: string,
  ip?: string | null,
  userAgent?: string | null
): Promise<{ rawToken: string; csrfToken: string }> {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 256-bit
  const tokenHash = hashSessionToken(rawToken);
  const csrfSecret = crypto.randomBytes(32).toString("hex");
  const csrfToken = deriveCsrfToken(csrfSecret);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ABSOLUTE_TIMEOUT_MS);

  await prisma.adminSession.create({
    data: {
      adminId,
      tokenHash,
      csrfSecret,
      ip: ip?.slice(0, 64) ?? null,
      userAgent: userAgent?.slice(0, 512) ?? null,
      lastSeenAt: now,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set(getSessionCookieName(), rawToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });

  cookieStore.set(getCsrfCookieName(), csrfToken, {
    httpOnly: false, // Readable by admin client JS to attach as X-CSRF-Token
    secure: isProd,
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });

  return { rawToken, csrfToken };
}

/**
 * Validates the current admin session from cookies, enforcing both 30-min idle timeout
 * and 8-hour absolute timeout (Section 11.1).
 */
export async function getAdminSession(): Promise<AuthenticatedAdminContext | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(getSessionCookieName())?.value;
  if (!rawToken) return null;

  const tokenHash = hashSessionToken(rawToken);
  const now = new Date();

  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash },
      include: { admin: true },
    });

    if (!session || session.revokedAt || session.expiresAt < now) {
      return null;
    }

    // Idle timeout check (30 min)
    if (now.getTime() - session.lastSeenAt.getTime() > IDLE_TIMEOUT_MS) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { revokedAt: now },
      });
      return null;
    }

    // Update last_seen_at if older than 60 seconds
    if (now.getTime() - session.lastSeenAt.getTime() > 60_000) {
      await prisma.adminSession.update({
        where: { id: session.id },
        data: { lastSeenAt: now },
      });
    }

    return {
      sessionId: session.id,
      adminId: session.admin.id,
      email: session.admin.email,
      role: session.admin.role,
      mustChangePassword: session.admin.mustChangePassword,
      totpEnabled: session.admin.totpEnabled,
      csrfToken: deriveCsrfToken(session.csrfSecret),
    };
  } catch {
    return null;
  }
}

/**
 * Enforces authentication + CSRF verification (Origin/Host + double-submit token) on mutating admin actions (Section 11.2).
 */
export async function requireAdminMutationAuth(
  submittedCsrfToken?: string | null
): Promise<AuthenticatedAdminContext> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const hdrs = await headers();
  const origin = hdrs.get("origin");
  const host = hdrs.get("host");

  if (origin && host) {
    const originHost = new URL(origin).host;
    if (originHost !== host) {
      throw new Error("CSRF_ORIGIN_MISMATCH");
    }
  }

  const csrfFromHeader = hdrs.get("x-csrf-token") || submittedCsrfToken;
  if (!csrfFromHeader) {
    throw new Error("CSRF_TOKEN_MISSING");
  }

  const a = Buffer.from(csrfFromHeader);
  const b = Buffer.from(session.csrfToken);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("CSRF_TOKEN_INVALID");
  }

  return session;
}

export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(getSessionCookieName())?.value;
  if (rawToken) {
    const tokenHash = hashSessionToken(rawToken);
    await prisma.adminSession
      .updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }
  cookieStore.delete(getSessionCookieName());
  cookieStore.delete(getCsrfCookieName());
}

export async function revokeAllAdminSessions(adminId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { adminId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
