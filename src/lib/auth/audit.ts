import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { logEvent } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

export interface WriteAuditLogInput {
  adminId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  diff?: Record<string, unknown> | null;
}

/**
 * Append-only audit logger for all admin mutations and security events (Section 6.1 & 11.2).
 */
export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      "127.0.0.1";
    const userAgent = hdrs.get("user-agent") ?? "unknown";

    await prisma.auditLog.create({
      data: {
        adminId: input.adminId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        diffJson: (input.diff ?? undefined) as Prisma.InputJsonValue | undefined,
        ip: ip.slice(0, 64),
        userAgent: userAgent.slice(0, 512),
      },
    });
  } catch (err) {
    logEvent("error", "Failed to write audit log entry", {
      action: input.action,
      entity: input.entity,
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}
