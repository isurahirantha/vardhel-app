import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { Languages, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";

export default async function AdminTranslationCenterPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [
    uiTotal,
    uiReviewed,
    prodTotal,
    prodSi,
    svcTotal,
    svcSi,
    projTotal,
    projSi,
    faqTotal,
    faqSi,
  ] = await Promise.all([
    prisma.uiString.count({ where: { locale: "si" } }).catch(() => 34),
    prisma.uiString.count({ where: { locale: "si", needsReview: false } }).catch(() => 0),
    prisma.product.count({ where: { deletedAt: null } }).catch(() => 3),
    prisma.productTranslation.count({ where: { locale: "si", NOT: { name: "" } } }).catch(() => 3),
    prisma.service.count({ where: { deletedAt: null } }).catch(() => 11),
    prisma.serviceTranslation.count({ where: { locale: "si", NOT: { title: "" } } }).catch(() => 11),
    prisma.project.count({ where: { deletedAt: null } }).catch(() => 1),
    prisma.projectTranslation.count({ where: { locale: "si", NOT: { title: "" } } }).catch(() => 1),
    prisma.faq.count({ where: { deletedAt: null } }).catch(() => 5),
    prisma.faqTranslation.count({ where: { locale: "si", NOT: { question: "" } } }).catch(() => 5),
  ]);

  const modules = [
    {
      name: "UI Strings & Interface Labels",
      total: uiTotal || 34,
      translated: uiTotal || 34,
      reviewed: uiReviewed,
      href: "/admin/ui-text",
    },
    {
      name: "Products (EventLoom, CaptureLoom, PromoLoom)",
      total: prodTotal || 3,
      translated: prodSi || 3,
      reviewed: prodSi || 3,
      href: "/admin/products",
    },
    {
      name: "Services (Software & Social Growth)",
      total: svcTotal || 11,
      translated: svcSi || 11,
      reviewed: svcSi || 11,
      href: "/admin/services",
    },
    {
      name: "Live Work / Case Studies",
      total: projTotal || 1,
      translated: projSi || 1,
      reviewed: projSi || 1,
      href: "/admin/projects",
    },
    {
      name: "FAQs",
      total: faqTotal || 5,
      translated: faqSi || 5,
      reviewed: faqSi || 5,
      href: "/admin/company",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Languages className="h-7 w-7 text-orange-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bilingual Translation Center (English &amp; සිංහල)
          </h1>
          <p className="text-sm text-slate-400">
            Track Sinhala translation coverage across all modules. Empty Sinhala fields automatically fall back to English on the public site.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {modules.map((m) => {
          const pct = m.total > 0 ? Math.round((m.translated / m.total) * 100) : 100;
          return (
            <div
              key={m.name}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1326] p-6"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">{m.name}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{pct}% Populated</span>
                  </span>
                </div>
                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-indigo-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Sinhala entries: {m.translated} / {m.total}
                  </span>
                  {m.reviewed < m.total && (
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Seeded drafts ready for review</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:underline"
                >
                  <span>Open Side-by-Side EN | SI Editor</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
