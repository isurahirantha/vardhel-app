import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  ProjectsAdminClient,
  type AdminProjectItem,
} from "@/components/admin/projects-admin-client";

export default async function AdminProjectsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const projects = await prisma.project
    .findMany({
      where: { deletedAt: null },
      include: {
        translations: true,
        links: { orderBy: { sortOrder: "asc" } },
        socialWork: {
          include: { translations: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const mapped: AdminProjectItem[] = projects.map((p) => {
    const en = p.translations.find((t) => t.locale === "en");
    const si = p.translations.find((t) => t.locale === "si");
    return {
      id: p.id,
      slug: p.slug,
      isDemo: p.isDemo,
      isFeatured: p.isFeatured,
      isPublished: p.isPublished,
      videoType: p.videoType ?? "youtube",
      videoUrl: p.videoUrl ?? "",
      techStack: Array.isArray(p.techStackJson)
        ? (p.techStackJson as string[])
        : [],
      en: {
        title: en?.title ?? p.slug,
        clientName: en?.clientName ?? "",
        industry: en?.industry ?? "",
        summary: en?.summary ?? "",
        challenge: en?.challenge ?? "",
        solution: en?.solution ?? "",
        result: en?.result ?? "",
      },
      si: {
        title: si?.title ?? "",
        clientName: si?.clientName ?? "",
        industry: si?.industry ?? "",
        summary: si?.summary ?? "",
        challenge: si?.challenge ?? "",
        solution: si?.solution ?? "",
        result: si?.result ?? "",
      },
      links: p.links.map((l) => ({
        label: l.label,
        url: l.url,
        type: l.type,
      })),
      socialWork: p.socialWork.map((sw) => {
        const swEn = sw.translations.find((t) => t.locale === "en");
        const swSi = sw.translations.find((t) => t.locale === "si");
        return {
          platform: sw.platform,
          handle: sw.handle ?? "",
          profileUrl: sw.profileUrl ?? "",
          enSummary: swEn?.summary ?? "",
          siSummary: swSi?.summary ?? "",
        };
      }),
    };
  });

  return (
    <ProjectsAdminClient
      csrfToken={session.csrfToken}
      initialProjects={mapped}
    />
  );
}
