import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    locales,
    siteSettings,
    socialLinks,
    navItems,
    homeSections,
    uiStrings,
    serviceCategories,
    services,
    productCategories,
    products,
    projects,
    faqs,
    offers,
    teamMembers,
    coreValues,
    processSteps,
    stats,
    pagesContent,
    approvedFeedback,
  ] = await Promise.all([
    prisma.locale.findMany(),
    prisma.siteSetting.findMany({ include: { translations: true } }),
    prisma.socialLink.findMany({ include: { translations: true } }),
    prisma.navItem.findMany({ include: { translations: true } }),
    prisma.homeSection.findMany({ include: { translations: true } }),
    prisma.uiString.findMany(),
    prisma.serviceCategory.findMany({ include: { translations: true } }),
    prisma.service.findMany({ include: { translations: true } }),
    prisma.productCategory.findMany({ include: { translations: true } }),
    prisma.product.findMany({
      include: { translations: true, features: { include: { translations: true } }, links: true },
    }),
    prisma.project.findMany({
      include: { translations: true, links: true, socialWork: { include: { translations: true } } },
    }),
    prisma.faq.findMany({ include: { translations: true } }),
    prisma.offer.findMany({ include: { translations: true } }),
    prisma.teamMember.findMany({ include: { translations: true } }),
    prisma.coreValue.findMany({ include: { translations: true } }),
    prisma.processStep.findMany({ include: { translations: true } }),
    prisma.stat.findMany({ include: { translations: true } }),
    prisma.pageContent.findMany({ include: { translations: true } }),
    prisma.feedback.findMany({
      where: { status: "APPROVED", deletedAt: null },
      select: {
        id: true,
        name: true,
        company: true,
        role: true,
        rating: true,
        message: true,
        messageSi: true,
        createdAt: true,
      },
    }),
  ]);

  await writeAuditLog({
    adminId: session.adminId,
    action: "CONTENT_BACKUP_EXPORTED",
    entity: "system",
  });

  const payload = {
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
    data: {
      locales,
      siteSettings,
      socialLinks,
      navItems,
      homeSections,
      uiStrings,
      serviceCategories,
      services,
      productCategories,
      products,
      projects,
      faqs,
      offers,
      teamMembers,
      coreValues,
      processSteps,
      stats,
      pagesContent,
      approvedFeedback,
    },
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="codeloom-content-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
