import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { PagesAdminClient } from "@/components/admin/pages-admin-client";

export default async function AdminPagesEditorPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const pages = await prisma.pageContent
    .findMany({
      include: { translations: true },
      orderBy: { slug: "asc" },
    })
    .catch(() => []);

  return (
    <PagesAdminClient
      csrfToken={session.csrfToken}
      initialPages={pages.map((p) => {
        const en = p.translations.find((t) => t.locale === "en");
        const si = p.translations.find((t) => t.locale === "si");
        return {
          slug: p.slug,
          enTitle: en?.title ?? p.slug,
          enSubtitle: en?.subtitle ?? "",
          enBody: en?.body ?? "",
          siTitle: si?.title ?? "",
          siSubtitle: si?.subtitle ?? "",
          siBody: si?.body ?? "",
        };
      })}
    />
  );
}
