import type { MetadataRoute } from "next";
import {
  getPublishedProducts,
  getPublishedServiceCategories,
} from "@/server/services/public-content.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || "https://codeloom.site";
  const staticPaths = [
    "",
    "/products",
    "/services",
    "/projects",
    "/growth",
    "/about",
    "/feedback",
    "/contact",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
  ];

  const [products, serviceCats] = await Promise.all([
    getPublishedProducts("en"),
    getPublishedServiceCategories("en"),
  ]);

  const dynamicPaths = [
    ...products.map((p) => `/products/${p.slug}`),
    ...serviceCats.flatMap((c) => c.services.map((s) => `/services/${s.slug}`)),
  ];

  const allPaths = [...staticPaths, ...dynamicPaths];

  return allPaths.flatMap((p) =>
    (["en", "si"] as const).map((locale) => ({
      url: `${baseUrl}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1.0 : 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en${p}`,
          si: `${baseUrl}/si${p}`,
        },
      },
    }))
  );
}
