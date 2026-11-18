import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { CompanyAdminClient } from "@/components/admin/company-admin-client";

export default async function AdminCompanyPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [faqs, stats] = await Promise.all([
    prisma.faq
      .findMany({
        where: { deletedAt: null },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
    prisma.stat
      .findMany({
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
  ]);

  return (
    <CompanyAdminClient
      csrfToken={session.csrfToken}
      faqs={faqs.map((f) => ({
        id: f.id,
        group: f.group,
        sortOrder: f.sortOrder,
        enQuestion:
          f.translations.find((t) => t.locale === "en")?.question ?? "",
        enAnswer: f.translations.find((t) => t.locale === "en")?.answer ?? "",
        siQuestion:
          f.translations.find((t) => t.locale === "si")?.question ?? "",
        siAnswer: f.translations.find((t) => t.locale === "si")?.answer ?? "",
      }))}
      stats={stats.map((s) => ({
        id: s.id,
        value: s.value,
        suffix: s.suffix ?? "",
        enLabel: s.translations.find((t) => t.locale === "en")?.label ?? "",
        siLabel: s.translations.find((t) => t.locale === "si")?.label ?? "",
      }))}
    />
  );
}
