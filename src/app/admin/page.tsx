import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  Inbox,
  MessageSquareQuote,
  Package,
  FolderKanban,
  Briefcase,
  ShieldCheck,
  Languages,
  ArrowUpRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  if (session.mustChangePassword) {
    redirect("/admin/security?forceChange=1");
  }

  let counts = {
    newEnquiries: 0,
    pendingFeedback: 0,
    approvedFeedback: 0,
    products: 0,
    services: 0,
    projects: 0,
    needsReviewTranslations: 0,
  };

  let recentEnquiries: {
    id: string;
    name: string;
    email: string;
    interest: string;
    status: string;
    createdAt: Date;
  }[] = [];

  let recentAudits: {
    id: string;
    action: string;
    entity: string;
    ip: string | null;
    createdAt: Date;
  }[] = [];

  try {
    const [
      newEnq,
      pendFb,
      appFb,
      prodCount,
      svcCount,
      projCount,
      reviewUi,
      enqList,
      auditList,
    ] = await Promise.all([
      prisma.enquiry.count({ where: { status: "NEW", deletedAt: null } }),
      prisma.feedback.count({ where: { status: "PENDING", deletedAt: null } }),
      prisma.feedback.count({ where: { status: "APPROVED", deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.service.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.uiString.count({ where: { needsReview: true } }),
      prisma.enquiry.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

    counts = {
      newEnquiries: newEnq,
      pendingFeedback: pendFb,
      approvedFeedback: appFb,
      products: prodCount,
      services: svcCount,
      projects: projCount,
      needsReviewTranslations: reviewUi,
    };
    recentEnquiries = enqList;
    recentAudits = auditList;
  } catch {
    // Handle before DB is seeded
  }

  const cards = [
    {
      label: "New Enquiries",
      value: counts.newEnquiries,
      href: "/admin/enquiries",
      icon: Inbox,
      accent: "text-orange-400 bg-orange-500/15",
    },
    {
      label: "Pending Feedback",
      value: counts.pendingFeedback,
      href: "/admin/feedback",
      icon: MessageSquareQuote,
      accent: "text-amber-400 bg-amber-500/15",
    },
    {
      label: "Products",
      value: counts.products,
      href: "/admin/products",
      icon: Package,
      accent: "text-indigo-400 bg-indigo-500/15",
    },
    {
      label: "Services",
      value: counts.services,
      href: "/admin/services",
      icon: Briefcase,
      accent: "text-emerald-400 bg-emerald-500/15",
    },
    {
      label: "Projects / Case Studies",
      value: counts.projects,
      href: "/admin/projects",
      icon: FolderKanban,
      accent: "text-sky-400 bg-sky-500/15",
    },
    {
      label: "Sinhala Drafts to Review",
      value: counts.needsReviewTranslations,
      href: "/admin/translations",
      icon: Languages,
      accent: "text-purple-400 bg-purple-500/15",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Master Admin Control Centre
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage 100% of Vardhel&apos;s bilingual content, products, live links, and customer leads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
          >
            <span>+ Add / Edit Products</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
          >
            <span>Site Settings</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d1326] p-5 transition-all hover:border-orange-500/40"
            >
              <div>
                <p className="text-xs font-medium text-slate-400">{c.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{c.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.accent}`}>
                <Icon className="h-6 w-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Enquiries & Recent Security Audit */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Enquiries</h2>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1 text-xs text-orange-400 hover:underline"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">
              No enquiries received yet. Public leads from `/contact` will appear here.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-white/10">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <p className="font-semibold text-white">{enq.name}</p>
                    <p className="text-slate-400">
                      {enq.email} &bull; {enq.interest}
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-1 font-medium text-orange-300">
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Recent Audit Trail</h2>
            </div>
            <Link
              href="/admin/audit-log"
              className="inline-flex items-center gap-1 text-xs text-orange-400 hover:underline"
            >
              <span>Full log</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentAudits.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">No audit events recorded yet.</p>
          ) : (
            <div className="mt-4 divide-y divide-white/10">
              {recentAudits.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-emerald-300">
                      {log.action}
                    </span>
                    <span className="ml-2 text-slate-400">({log.entity})</span>
                  </div>
                  <span className="text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
