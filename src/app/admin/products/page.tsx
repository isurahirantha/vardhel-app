import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  ProductsAdminClient,
  type AdminProductItem,
} from "@/components/admin/products-admin-client";

export default async function AdminProductsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const products = await prisma.product
    .findMany({
      where: { deletedAt: null },
      include: {
        translations: true,
        features: {
          include: { translations: true },
          orderBy: { sortOrder: "asc" },
        },
        links: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => []);

  const mapped: AdminProductItem[] = products.map((p) => {
    const en = p.translations.find((t) => t.locale === "en");
    const si = p.translations.find((t) => t.locale === "si");
    return {
      id: p.id,
      slug: p.slug,
      status: p.status,
      isFeatured: p.isFeatured,
      isPublished: p.isPublished,
      sortOrder: p.sortOrder,
      videoType: p.videoType ?? "youtube",
      videoUrl: p.videoUrl ?? "",
      techStack: Array.isArray(p.techStackJson)
        ? (p.techStackJson as string[])
        : [],
      en: {
        name: en?.name ?? p.slug,
        tagline: en?.tagline ?? "",
        shortDescription: en?.shortDescription ?? "",
        longDescription: en?.longDescription ?? "",
        targetAudience: en?.targetAudience ?? "",
      },
      si: {
        name: si?.name ?? en?.name ?? p.slug,
        tagline: si?.tagline ?? "",
        shortDescription: si?.shortDescription ?? "",
        longDescription: si?.longDescription ?? "",
        targetAudience: si?.targetAudience ?? "",
      },
      features: p.features.map((f) => {
        const fen = f.translations.find((t) => t.locale === "en");
        const fsi = f.translations.find((t) => t.locale === "si");
        return {
          enTitle: fen?.title ?? "",
          enDesc: fen?.description ?? "",
          siTitle: fsi?.title ?? "",
          siDesc: fsi?.description ?? "",
        };
      }),
      links: p.links.map((l) => ({
        label: l.label,
        url: l.url,
        type: l.type,
        isPrimary: l.isPrimary,
      })),
    };
  });

  return (
    <ProductsAdminClient
      csrfToken={session.csrfToken}
      initialProducts={mapped}
    />
  );
}
