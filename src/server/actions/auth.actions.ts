"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit, hashIpAddress } from "@/lib/rate-limit";
import {
  hashPassword,
  verifyPassword,
  verifyDummyPassword,
  checkPasswordStrength,
} from "@/lib/auth/password";
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateRecoveryCodes,
  generateTotpQrDataUrl,
  generateTotpSecret,
  hashRecoveryCode,
  verifyTotpCode,
} from "@/lib/auth/totp";
import {
  createAdminSession,
  requireAdminMutationAuth,
  revokeAllAdminSessions,
  revokeCurrentSession,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(256),
  totpCode: z.string().optional(),
});

export interface LoginResult {
  ok: boolean;
  requiresTotp?: boolean;
  mustChangePassword?: boolean;
  error?: string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function adminLoginAction(
  rawInput: z.infer<typeof loginSchema>
): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "Invalid credentials" };
  }

  const hdrs = await headers();
  const clientIp =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "127.0.0.1";
  const userAgent = hdrs.get("user-agent") ?? "unknown";
  const ipHash = hashIpAddress(clientIp);

  // Per-IP rate limit: max 10 login attempts per 15 min
  const rate = await checkRateLimit("admin_login_ip", ipHash, 10, 15 * 60);
  if (!rate.allowed) {
    await writeAuditLog({
      action: "LOGIN_RATE_LIMITED",
      entity: "admin_users",
      diff: { ipHash },
    });
    return {
      ok: false,
      error: "Too many login attempts. Please wait 15 minutes and try again.",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin) {
    // Run dummy Argon2 verification to prevent timing user-enumeration (Section 11.1)
    await verifyDummyPassword(parsed.data.password);
    await writeAuditLog({
      action: "LOGIN_FAILED_UNKNOWN_EMAIL",
      entity: "admin_users",
    });
    return { ok: false, error: "Invalid credentials" };
  }

  const now = new Date();
  if (admin.lockedUntil && admin.lockedUntil > now) {
    await verifyDummyPassword(parsed.data.password);
    return {
      ok: false,
      error: "Invalid credentials", // Generic message per Section 11.1
    };
  }

  const validPass = await verifyPassword(
    parsed.data.password,
    admin.passwordHash
  );

  if (!validPass) {
    const newFailed = admin.failedAttempts + 1;
    const lockedUntil =
      newFailed >= MAX_FAILED_ATTEMPTS
        ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedAttempts: newFailed,
        lockedUntil,
      },
    });

    await writeAuditLog({
      adminId: admin.id,
      action: lockedUntil ? "ACCOUNT_LOCKED" : "LOGIN_FAILED_BAD_PASSWORD",
      entity: "admin_users",
      entityId: admin.id,
      diff: { failedAttempts: newFailed },
    });

    return { ok: false, error: "Invalid credentials" };
  }

  // Check TOTP 2FA if enabled
  if (admin.totpEnabled && admin.totpSecretEnc) {
    const code = parsed.data.totpCode?.trim() ?? "";
    if (!code) {
      return { ok: false, requiresTotp: true };
    }

    const secret = decryptTotpSecret(admin.totpSecretEnc);
    let totpValid = verifyTotpCode(code, secret);

    // Also allow one-time recovery code
    if (!totpValid && Array.isArray(admin.recoveryCodesJson)) {
      const codeHash = hashRecoveryCode(code);
      const list = admin.recoveryCodesJson as string[];
      if (list.includes(codeHash)) {
        totpValid = true;
        const remaining = list.filter((c) => c !== codeHash);
        await prisma.adminUser.update({
          where: { id: admin.id },
          data: { recoveryCodesJson: remaining },
        });
        await writeAuditLog({
          adminId: admin.id,
          action: "LOGIN_RECOVERY_CODE_USED",
          entity: "admin_users",
          entityId: admin.id,
        });
      }
    }

    if (!totpValid) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { failedAttempts: { increment: 1 } },
      });
      await writeAuditLog({
        adminId: admin.id,
        action: "LOGIN_FAILED_BAD_TOTP",
        entity: "admin_users",
        entityId: admin.id,
      });
      return { ok: false, requiresTotp: true, error: "Invalid 2FA code" };
    }
  }

  // Successful login: reset failed attempts & rotate session
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: now,
      lastLoginIp: clientIp.slice(0, 64),
    },
  });

  await createAdminSession(admin.id, clientIp, userAgent);

  await writeAuditLog({
    adminId: admin.id,
    action: "LOGIN_SUCCESS",
    entity: "admin_users",
    entityId: admin.id,
  });

  return {
    ok: true,
    mustChangePassword: admin.mustChangePassword,
  };
}

export async function adminLogoutAction(): Promise<void> {
  await revokeCurrentSession();
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(256),
  csrfToken: z.string().min(1),
});

export async function changeAdminPasswordAction(
  rawInput: z.infer<typeof changePasswordSchema>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const parsed = changePasswordSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { ok: false, error: "Invalid password input." };
    }

    const session = await requireAdminMutationAuth(parsed.data.csrfToken);
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
    });
    if (!admin) return { ok: false, error: "Unauthorized" };

    const isCurrentValid = await verifyPassword(
      parsed.data.currentPassword,
      admin.passwordHash
    );
    if (!isCurrentValid) {
      return { ok: false, error: "Current password is incorrect." };
    }

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return {
        ok: false,
        error: "New password must be different from the current password.",
      };
    }

    const strength = checkPasswordStrength(parsed.data.newPassword, admin.email);
    if (!strength.valid) {
      return { ok: false, error: strength.reason };
    }

    const newHash = await hashPassword(parsed.data.newPassword);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    // Rotate sessions on privilege/credential change (Section 11.1)
    await revokeAllAdminSessions(admin.id);
    const hdrs = await headers();
    await createAdminSession(
      admin.id,
      hdrs.get("x-forwarded-for") ?? "127.0.0.1",
      hdrs.get("user-agent") ?? "unknown"
    );

    await writeAuditLog({
      adminId: admin.id,
      action: "PASSWORD_CHANGED",
      entity: "admin_users",
      entityId: admin.id,
    });

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to change password",
    };
  }
}

export async function initiateTotpSetupAction(csrfToken: string): Promise<{
  ok: boolean;
  secret?: string;
  qrDataUrl?: string;
  error?: string;
}> {
  try {
    const session = await requireAdminMutationAuth(csrfToken);
    const secret = generateTotpSecret();
    const qrDataUrl = await generateTotpQrDataUrl(session.email, secret);
    return { ok: true, secret, qrDataUrl };
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
}

export async function confirmTotpSetupAction(input: {
  secret: string;
  code: string;
  currentPassword: string;
  csrfToken: string;
}): Promise<{
  ok: boolean;
  recoveryCodes?: string[];
  error?: string;
}> {
  try {
    const session = await requireAdminMutationAuth(input.csrfToken);
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
    });
    if (!admin) return { ok: false, error: "Unauthorized" };

    const validPass = await verifyPassword(
      input.currentPassword,
      admin.passwordHash
    );
    if (!validPass) {
      return { ok: false, error: "Current password is incorrect." };
    }

    if (!verifyTotpCode(input.code, input.secret)) {
      return {
        ok: false,
        error: "Invalid 6-digit verification code. Check your authenticator app.",
      };
    }

    const encryptedSecret = encryptTotpSecret(input.secret);
    const { plainCodes, hashedCodes } = generateRecoveryCodes();

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        totpSecretEnc: encryptedSecret,
        totpEnabled: true,
        recoveryCodesJson: hashedCodes,
      },
    });

    await writeAuditLog({
      adminId: admin.id,
      action: "TOTP_2FA_ENABLED",
      entity: "admin_users",
      entityId: admin.id,
    });

    return { ok: true, recoveryCodes: plainCodes };
  } catch {
    return { ok: false, error: "Failed to enable 2FA." };
  }
}

export async function disableTotpAction(input: {
  currentPassword: string;
  csrfToken: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await requireAdminMutationAuth(input.csrfToken);
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
    });
    if (!admin) return { ok: false, error: "Unauthorized" };

    const validPass = await verifyPassword(
      input.currentPassword,
      admin.passwordHash
    );
    if (!validPass) {
      return { ok: false, error: "Current password is incorrect." };
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        totpEnabled: false,
        totpSecretEnc: null,
        recoveryCodesJson: [],
      },
    });

    await writeAuditLog({
      adminId: admin.id,
      action: "TOTP_2FA_DISABLED",
      entity: "admin_users",
      entityId: admin.id,
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to disable 2FA." };
  }
}

export async function revokeSessionByIdAction(input: {
  sessionId: string;
  csrfToken: string;
}): Promise<{ ok: boolean }> {
  const session = await requireAdminMutationAuth(input.csrfToken);
  await prisma.adminSession.updateMany({
    where: { id: input.sessionId, adminId: session.adminId },
    data: { revokedAt: new Date() },
  });
  await writeAuditLog({
    adminId: session.adminId,
    action: "SESSION_REVOKED",
    entity: "admin_sessions",
    entityId: input.sessionId,
  });
  return { ok: true };
}
