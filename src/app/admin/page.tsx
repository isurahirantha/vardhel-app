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

  const formatActionName = (action: string) => {
    return action
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const cards = [
    {
      label: "New Enquiries",
      value: counts.newEnquiries,
      href: "/admin/enquiries",
      icon: Inbox,
      accent: "text-emerald-600 bg-emerald-500/15 border border-emerald-500/20",
    },
    {
      label: "Pending Feedback",
      value: counts.pendingFeedback,
      href: "/admin/feedback",
      icon: MessageSquareQuote,
      accent: "text-amber-600 bg-amber-500/15 border border-amber-500/20",
    },
    {
      label: "Products",
      value: counts.products,
      href: "/admin/products",
      icon: Package,
      accent: "text-slate-700 bg-slate-100 border border-slate-200",
    },
    {
      label: "Services",
      value: counts.services,
      href: "/admin/services",
      icon: Briefcase,
      accent: "text-slate-700 bg-slate-100 border border-slate-200",
    },
    {
      label: "Projects / Case Studies",
      value: counts.projects,
      href: "/admin/projects",
      icon: FolderKanban,
      accent: "text-slate-700 bg-slate-100 border border-slate-200",
    },
    {
      label: "Sinhala Drafts to Review",
      value: counts.needsReviewTranslations,
      href: "/admin/translations",
      icon: Languages,
      accent: "text-indigo-600 bg-indigo-500/15 border border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Master Admin Control Centre
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage 100% of Vardhel&apos;s bilingual content, products, live links, and customer leads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors"
          >
            <span>+ Add / Edit Products</span>
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-400 transition-colors"
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
              className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-md"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">{c.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{c.value}</p>
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
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Enquiries</h2>
              <Link
                href="/admin/enquiries"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentEnquiries.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Inbox className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">No enquiries received yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  New customer submissions from the website contact form will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {recentEnquiries.map((enq) => (
                  <div key={enq.id} className="flex items-center justify-between py-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{enq.name}</p>
                      <p className="text-slate-500">
                        {enq.email} &bull; {enq.interest}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-700">
                      {enq.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Recent Audit Trail</h2>
              </div>
              <Link
                href="/admin/audit-log"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                <span>Full log</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentAudits.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400">No audit events recorded yet.</p>
              </div>
            ) : (
              <div className="mt-3 divide-y divide-slate-100">
                {recentAudits.map((log) => {
                  const isApproved = log.action.includes("APPROVED") || log.action.includes("SUCCESS");
                  const isRejected = log.action.includes("REJECTED") || log.action.includes("DELETE");
                  return (
                    <div key={log.id} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            isApproved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isRejected
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {formatActionName(log.action)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">({log.entity})</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
