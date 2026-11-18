import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  ServicesAdminClient,
  type AdminServiceItem,
} from "@/components/admin/services-admin-client";

export default async function AdminServicesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [categories, services] = await Promise.all([
    prisma.serviceCategory
      .findMany({
        where: { deletedAt: null },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
    prisma.service
      .findMany({
        where: { deletedAt: null },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
  ]);

  const catList = categories.map((c) => ({
    id: c.id,
    name:
      c.translations.find((t) => t.locale === "en")?.name ?? c.slug,
  }));

  const svcList: AdminServiceItem[] = services.map((s) => {
    const en = s.translations.find((t) => t.locale === "en");
    const si = s.translations.find((t) => t.locale === "si");
    return {
      id: s.id,
      categoryId: s.categoryId,
      slug: s.slug,
      isFeatured: s.isFeatured,
      isPublished: s.isPublished,
      sortOrder: s.sortOrder,
      en: {
        title: en?.title ?? s.slug,
        shortDescription: en?.shortDescription ?? "",
        longDescription: en?.longDescription ?? "",
        features: Array.isArray(en?.featuresJson)
          ? (en.featuresJson as string[])
          : [],
      },
      si: {
        title: si?.title ?? "",
        shortDescription: si?.shortDescription ?? "",
        longDescription: si?.longDescription ?? "",
        features: Array.isArray(si?.featuresJson)
          ? (si.featuresJson as string[])
          : [],
      },
    };
  });

  return (
    <ServicesAdminClient
      csrfToken={session.csrfToken}
      categories={catList}
      initialServices={svcList}
    />
  );
}
