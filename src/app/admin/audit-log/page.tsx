import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { ScrollText } from "lucide-react";

export default async function AdminAuditLogPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const logs = await prisma.auditLog
    .findMany({
      orderBy: { createdAt: "desc" },
      take: 150,
    })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-orange-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Security &amp; Content Audit Log</h1>
          <p className="text-sm text-slate-400">
            Append-only audit trail of all admin actions, logins, and configuration changes.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d1326]">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-white/10 bg-white/5 text-slate-400">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Entity ID</th>
              <th className="px-4 py-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5">
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono font-semibold text-emerald-300">
                  {log.action}
                </td>
                <td className="px-4 py-3">{log.entity}</td>
                <td className="px-4 py-3 font-mono text-slate-400">
                  {log.entityId ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-slate-400">
                  {log.ip ?? "—"}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No audit entries recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
