import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { HomeBuilderClient } from "@/components/admin/home-builder-client";

export default async function AdminHomeBuilderPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const sections = await prisma.homeSection
    .findMany({
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => []);

  return (
    <HomeBuilderClient
      csrfToken={session.csrfToken}
      initialSections={sections.map((s) => {
        const en = s.translations.find((t) => t.locale === "en");
        const si = s.translations.find((t) => t.locale === "si");
        return {
          id: s.id,
          key: s.key,
          sortOrder: s.sortOrder,
          isVisible: s.isVisible,
          enTitle: en?.title ?? s.key,
          enSubtitle: en?.subtitle ?? "",
          siTitle: si?.title ?? "",
          siSubtitle: si?.subtitle ?? "",
        };
      })}
    />
  );
}
