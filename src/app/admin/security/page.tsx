import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { SecurityClient } from "@/components/admin/security-client";

export default async function AdminSecurityPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const activeSessions = await prisma.adminSession
    .findMany({
      where: {
        adminId: session.adminId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastSeenAt: "desc" },
    })
    .catch(() => []);

  return (
    <SecurityClient
      csrfToken={session.csrfToken}
      mustChangePassword={session.mustChangePassword}
      totpEnabled={session.totpEnabled}
      sessions={activeSessions.map((s) => ({
        id: s.id,
        ip: s.ip,
        userAgent: s.userAgent,
        createdAt: s.createdAt.toISOString(),
        lastSeenAt: s.lastSeenAt.toISOString(),
        isCurrent: s.id === session.sessionId,
      }))}
    />
  );
}
