import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { Download, Database, ShieldCheck } from "lucide-react";

export default async function AdminBackupPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Content Backup &amp; Database Export
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Export a complete JSON snapshot of all public content, translations, products, services, and settings (zero secrets or password hashes included).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Download className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">
              One-Click JSON Content Backup
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Downloads a structured JSON file containing all bilingual (EN/SI) products, services, projects, FAQs, UI strings, and site settings.
          </p>
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
          >
            <Download className="h-4 w-4" />
            <span>Download Full Content JSON</span>
          </a>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              MySQL Server Backup (`mysqldump`)
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            For full server-level database backups on your VPS or Docker host, run:
          </p>
          <pre className="overflow-x-auto rounded-xl bg-black/50 p-3 font-mono text-xs text-emerald-300">
            {`docker exec codeloom-mysql mysqldump -u codeloom_app -p codeloom > backup-$(date +%F).sql`}
          </pre>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Store database dumps encrypted outside the public web root.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
