"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMutationAuth } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";
import { prisma } from "@/lib/db";
import {
  sanitizePlainText,
  sanitizeRichText,
  isSafeExternalUrl,
  isValidHexColor,
} from "@/lib/security/sanitize";
import { checkExternalLinkSafety } from "@/lib/security/ssrf";
import { invalidateUiStringsCache } from "@/server/services/ui-strings.service";
import type { Prisma } from "@prisma/client";

function revalidateAllPublicRoutes() {
  invalidateUiStringsCache();
  revalidatePath("/", "layout");
  revalidatePath("/en", "layout");
  revalidatePath("/si", "layout");
}

async function saveContentRevision(
  entityType: string,
  entityId: string,
  locale: string | null,
  snapshot: Record<string, unknown>,
  adminId: string
) {
  await prisma.contentRevision.create({
    data: {
      entityType,
      entityId,
      locale,
      snapshot: snapshot as Prisma.InputJsonValue,
      adminId,
    },
  });

  // Keep only last 10 revisions per entity (Section 7.4)
  const oldRevisions = await prisma.contentRevision.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    skip: 10,
    select: { id: true },
  });
  if (oldRevisions.length > 0) {
    await prisma.contentRevision.deleteMany({
      where: { id: { in: oldRevisions.map((r) => r.id) } },
    });
  }
}

// ============================================================================
// 1. Site Settings & Social Links
// ============================================================================

export async function updateSiteSettingsAction(input: {
  csrfToken: string;
  brandName: string;
  taglineEn: string;
  taglineSi: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  notifyEmail: string;
  whatsappNumber: string;
  whatsappMsgEn: string;
  whatsappMsgSi: string;
  phone: string;
  addressEn: string;
  addressSi: string;
  workingHoursEn: string;
  workingHoursSi: string;
  enableFloatingWhatsapp: boolean;
  enable3dHero: boolean;
  enableCustomCursor: boolean;
  enableFeedback: boolean;
  workReelVideoUrl?: string;
  socialLinks: { id?: string; platform: string; labelEn: string; labelSi: string; url: string }[];
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  const primary = isValidHexColor(input.primaryColor) ? input.primaryColor : "#ea580c";
  const secondary = isValidHexColor(input.secondaryColor) ? input.secondaryColor : "#4f46e5";
  const rawReelUrl = (input.workReelVideoUrl ?? "").trim();
  const safeReelUrl =
    rawReelUrl.startsWith("/api/media/") || isSafeExternalUrl(rawReelUrl)
      ? rawReelUrl
      : "";

  const scalarUpdates = [
    { key: "brand_name", group: "brand", value: { value: sanitizePlainText(input.brandName) } },
    { key: "primary_color", group: "brand", value: { value: primary } },
    { key: "secondary_color", group: "brand", value: { value: secondary } },
    { key: "contact_email", group: "contact", value: { value: sanitizePlainText(input.contactEmail) } },
    { key: "notify_email", group: "contact", value: { value: sanitizePlainText(input.notifyEmail) } },
    { key: "whatsapp_number", group: "contact", value: { value: sanitizePlainText(input.whatsappNumber) } },
    { key: "phone", group: "contact", value: { value: sanitizePlainText(input.phone) } },
    { key: "work_reel_video_url", group: "features", value: { value: safeReelUrl } },
    {
      key: "feature_toggles",
      group: "features",
      value: {
        enableFloatingWhatsapp: Boolean(input.enableFloatingWhatsapp),
        enable3dHero: Boolean(input.enable3dHero),
        enableCustomCursor: Boolean(input.enableCustomCursor),
        enableFeedback: Boolean(input.enableFeedback),
      },
    },
  ];

  for (const s of scalarUpdates) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { valueJson: s.value },
      create: { key: s.key, group: s.group, valueJson: s.value },
    });
  }

  const bilingualSettings = [
    { key: "tagline", group: "brand", en: input.taglineEn, si: input.taglineSi },
    { key: "whatsapp_message", group: "contact", en: input.whatsappMsgEn, si: input.whatsappMsgSi },
    { key: "address", group: "contact", en: input.addressEn, si: input.addressSi },
    { key: "working_hours", group: "contact", en: input.workingHoursEn, si: input.workingHoursSi },
  ];

  for (const bs of bilingualSettings) {
    await prisma.siteSetting.upsert({
      where: { key: bs.key },
      update: { valueJson: { value: sanitizePlainText(bs.en) } },
      create: { key: bs.key, group: bs.group, valueJson: { value: sanitizePlainText(bs.en) } },
    });
    await prisma.siteSettingTranslation.upsert({
      where: { settingKey_locale: { settingKey: bs.key, locale: "en" } },
      update: { value: sanitizePlainText(bs.en), needsReview: false },
      create: { settingKey: bs.key, locale: "en", value: sanitizePlainText(bs.en), needsReview: false },
    });
    await prisma.siteSettingTranslation.upsert({
      where: { settingKey_locale: { settingKey: bs.key, locale: "si" } },
      update: { value: sanitizePlainText(bs.si), needsReview: false },
      create: { settingKey: bs.key, locale: "si", value: sanitizePlainText(bs.si), needsReview: false },
    });
  }

  // Update social links
  await prisma.socialLink.deleteMany({});
  for (let i = 0; i < input.socialLinks.length; i++) {
    const sl = input.socialLinks[i]!;
    if (!isSafeExternalUrl(sl.url)) continue;
    await prisma.socialLink.create({
      data: {
        platform: sanitizePlainText(sl.platform),
        url: sl.url.trim(),
        sortOrder: i + 1,
        isActive: true,
        translations: {
          create: [
            { locale: "en", label: sanitizePlainText(sl.labelEn || sl.platform), needsReview: false },
            { locale: "si", label: sanitizePlainText(sl.labelSi || sl.labelEn || sl.platform), needsReview: false },
          ],
        },
      },
    });
  }

  await writeAuditLog({
    adminId: session.adminId,
    action: "SITE_SETTINGS_UPDATED",
    entity: "site_settings",
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}

// ============================================================================
// 2. UI Strings & Labels (EN / SI)
// ============================================================================

export async function updateUiStringAction(input: {
  csrfToken: string;
  key: string;
  enValue: string;
  siValue: string;
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  await prisma.uiString.upsert({
    where: { key_locale: { key: input.key, locale: "en" } },
    update: { value: sanitizePlainText(input.enValue), needsReview: false },
    create: {
      key: input.key,
      locale: "en",
      value: sanitizePlainText(input.enValue),
      needsReview: false,
    },
  });

  await prisma.uiString.upsert({
    where: { key_locale: { key: input.key, locale: "si" } },
    update: { value: sanitizePlainText(input.siValue), needsReview: false },
    create: {
      key: input.key,
      locale: "si",
      value: sanitizePlainText(input.siValue),
      needsReview: false,
    },
  });

  await writeAuditLog({
    adminId: session.adminId,
    action: "UI_STRING_UPDATED",
    entity: "ui_strings",
    entityId: input.key,
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}

// ============================================================================
// 3. Products CRUD (with Video, Features, Live Links, Revisions)
// ============================================================================

function isSafeImageOrPath(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  return isSafeExternalUrl(trimmed);
}

async function resolveMediaIdForImageUrl(
  rawUrl: string | undefined,
  altText: string,
  adminId: string
): Promise<string | null> {
  const clean = rawUrl?.trim();
  if (!clean) return null;

  const existing = await prisma.media.findFirst({
    where: { publicUrl: clean, deletedAt: null },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.media.create({
    data: {
      type: "image",
      storagePath: clean,
      publicUrl: clean,
      mime: "image/jpeg",
      size: 0,
      altText: sanitizePlainText(altText) || "Product image",
      uploadedBy: adminId,
    },
    select: { id: true },
  });
  return created.id;
}

export async function saveProductAction(input: {
  csrfToken: string;
  id?: string;
  slug: string;
  status: "LIVE" | "BETA" | "COMING_SOON" | "ARCHIVED";
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  coverUrl?: string;
  logoUrl?: string;
  videoType?: string;
  videoUrl?: string;
  techStack: string[];
  en: {
    name: string;
    tagline: string;
    shortDescription: string;
    longDescription: string;
    targetAudience: string;
    seoTitle?: string;
    seoDescription?: string;
  };
  si: {
    name: string;
    tagline: string;
    shortDescription: string;
    longDescription: string;
    targetAudience: string;
    seoTitle?: string;
    seoDescription?: string;
  };
  features: {
    enTitle: string;
    enDesc: string;
    siTitle: string;
    siDesc: string;
  }[];
  links: {
    label: string;
    url: string;
    type: "LIVE_APP" | "DEMO" | "DOCS" | "API" | "PLAY_STORE" | "APP_STORE" | "REPO" | "OTHER";
    isPrimary: boolean;
  }[];
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  const cleanSlug = input.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (input.videoUrl && !isSafeExternalUrl(input.videoUrl)) {
    return { ok: false, error: "Video URL must be a valid HTTPS URL." };
  }

  if (input.coverUrl && !isSafeImageOrPath(input.coverUrl)) {
    return { ok: false, error: "Cover Image URL must be a relative path (/...) or HTTPS URL." };
  }

  if (input.logoUrl && !isSafeImageOrPath(input.logoUrl)) {
    return { ok: false, error: "Logo URL must be a relative path (/...) or HTTPS URL." };
  }

  for (const link of input.links) {
    if (!isSafeExternalUrl(link.url)) {
      return { ok: false, error: `Invalid link URL: ${link.url}. Only HTTPS URLs are permitted.` };
    }
  }

  const coverId = await resolveMediaIdForImageUrl(
    input.coverUrl,
    `${input.en.name || cleanSlug} Cover`,
    session.adminId
  );
  const logoId = await resolveMediaIdForImageUrl(
    input.logoUrl,
    `${input.en.name || cleanSlug} Logo`,
    session.adminId
  );

  const product = input.id
    ? await prisma.product.update({
        where: { id: input.id },
        data: {
          slug: cleanSlug,
          status: input.status,
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
          sortOrder: input.sortOrder,
          coverId,
          logoId,
          videoType: input.videoType || null,
          videoUrl: input.videoUrl?.trim() || null,
          techStackJson: input.techStack.map((t) => sanitizePlainText(t)).filter(Boolean),
        },
      })
    : await prisma.product.create({
        data: {
          slug: cleanSlug,
          status: input.status,
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
          sortOrder: input.sortOrder,
          coverId,
          logoId,
          videoType: input.videoType || null,
          videoUrl: input.videoUrl?.trim() || null,
          techStackJson: input.techStack.map((t) => sanitizePlainText(t)).filter(Boolean),
        },
      });

  const enClean = {
    name: sanitizePlainText(input.en.name),
    tagline: sanitizePlainText(input.en.tagline),
    shortDescription: sanitizePlainText(input.en.shortDescription),
    longDescription: sanitizeRichText(input.en.longDescription),
    targetAudience: sanitizePlainText(input.en.targetAudience),
    seoTitle: sanitizePlainText(input.en.seoTitle),
    seoDescription: sanitizePlainText(input.en.seoDescription),
  };

  const siClean = {
    name: sanitizePlainText(input.si.name || input.en.name),
    tagline: sanitizePlainText(input.si.tagline),
    shortDescription: sanitizePlainText(input.si.shortDescription),
    longDescription: sanitizeRichText(input.si.longDescription),
    targetAudience: sanitizePlainText(input.si.targetAudience),
    seoTitle: sanitizePlainText(input.si.seoTitle),
    seoDescription: sanitizePlainText(input.si.seoDescription),
  };

  await prisma.productTranslation.upsert({
    where: { productId_locale: { productId: product.id, locale: "en" } },
    update: { ...enClean, needsReview: false },
    create: { productId: product.id, locale: "en", ...enClean, needsReview: false },
  });

  await prisma.productTranslation.upsert({
    where: { productId_locale: { productId: product.id, locale: "si" } },
    update: { ...siClean, needsReview: false },
    create: { productId: product.id, locale: "si", ...siClean, needsReview: false },
  });

  // Replace features
  await prisma.productFeature.deleteMany({ where: { productId: product.id } });
  for (let i = 0; i < input.features.length; i++) {
    const f = input.features[i]!;
    if (!f.enTitle.trim()) continue;
    await prisma.productFeature.create({
      data: {
        productId: product.id,
        sortOrder: i + 1,
        translations: {
          create: [
            {
              locale: "en",
              title: sanitizePlainText(f.enTitle),
              description: sanitizePlainText(f.enDesc),
              needsReview: false,
            },
            {
              locale: "si",
              title: sanitizePlainText(f.siTitle || f.enTitle),
              description: sanitizePlainText(f.siDesc || f.enDesc),
              needsReview: false,
            },
          ],
        },
      },
    });
  }

  // Replace live links
  await prisma.productLink.deleteMany({ where: { productId: product.id } });
  for (let i = 0; i < input.links.length; i++) {
    const l = input.links[i]!;
    if (!l.url.trim()) continue;
    await prisma.productLink.create({
      data: {
        productId: product.id,
        label: sanitizePlainText(l.label || "Open Live App"),
        url: l.url.trim(),
        type: l.type,
        isPrimary: l.isPrimary,
        sortOrder: i + 1,
      },
    });
  }

  await saveContentRevision(
    "product",
    product.id,
    "all",
    { en: enClean, si: siClean },
    session.adminId
  );

  await writeAuditLog({
    adminId: session.adminId,
    action: input.id ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
    entity: "products",
    entityId: product.id,
  });

  revalidateAllPublicRoutes();
  return { ok: true, id: product.id };
}

export async function checkLinkHealthAction(input: {
  csrfToken: string;
  url: string;
}) {
  await requireAdminMutationAuth(input.csrfToken);
  return checkExternalLinkSafety(input.url);
}

// ============================================================================
// 4. Services CRUD
// ============================================================================

export async function saveServiceAction(input: {
  csrfToken: string;
  id?: string;
  categoryId: string;
  slug: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  en: {
    title: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
  };
  si: {
    title: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
  };
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);
  const cleanSlug = input.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  const service = input.id
    ? await prisma.service.update({
        where: { id: input.id },
        data: {
          categoryId: input.categoryId,
          slug: cleanSlug,
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          sortOrder: input.sortOrder,
        },
      })
    : await prisma.service.create({
        data: {
          categoryId: input.categoryId,
          slug: cleanSlug,
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          publishedAt: new Date(),
          sortOrder: input.sortOrder,
        },
      });

  await prisma.serviceTranslation.upsert({
    where: { serviceId_locale: { serviceId: service.id, locale: "en" } },
    update: {
      title: sanitizePlainText(input.en.title),
      shortDescription: sanitizePlainText(input.en.shortDescription),
      longDescription: sanitizeRichText(input.en.longDescription),
      featuresJson: input.en.features.map((f) => sanitizePlainText(f)).filter(Boolean),
      needsReview: false,
    },
    create: {
      serviceId: service.id,
      locale: "en",
      title: sanitizePlainText(input.en.title),
      shortDescription: sanitizePlainText(input.en.shortDescription),
      longDescription: sanitizeRichText(input.en.longDescription),
      featuresJson: input.en.features.map((f) => sanitizePlainText(f)).filter(Boolean),
      needsReview: false,
    },
  });

  await prisma.serviceTranslation.upsert({
    where: { serviceId_locale: { serviceId: service.id, locale: "si" } },
    update: {
      title: sanitizePlainText(input.si.title || input.en.title),
      shortDescription: sanitizePlainText(input.si.shortDescription),
      longDescription: sanitizeRichText(input.si.longDescription),
      featuresJson: input.si.features.map((f) => sanitizePlainText(f)).filter(Boolean),
      needsReview: false,
    },
    create: {
      serviceId: service.id,
      locale: "si",
      title: sanitizePlainText(input.si.title || input.en.title),
      shortDescription: sanitizePlainText(input.si.shortDescription),
      longDescription: sanitizeRichText(input.si.longDescription),
      featuresJson: input.si.features.map((f) => sanitizePlainText(f)).filter(Boolean),
      needsReview: false,
    },
  });

  await writeAuditLog({
    adminId: session.adminId,
    action: input.id ? "SERVICE_UPDATED" : "SERVICE_CREATED",
    entity: "services",
    entityId: service.id,
  });

  revalidateAllPublicRoutes();
  return { ok: true, id: service.id };
}

// ============================================================================
// 5. Projects / Live Work CRUD (with Live Links & Social Work Block)
// ============================================================================

export async function saveProjectAction(input: {
  csrfToken: string;
  id?: string;
  slug: string;
  isDemo: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  videoType?: string;
  videoUrl?: string;
  techStack: string[];
  en: {
    title: string;
    clientName: string;
    industry: string;
    summary: string;
    challenge: string;
    solution: string;
    result: string;
  };
  si: {
    title: string;
    clientName: string;
    industry: string;
    summary: string;
    challenge: string;
    solution: string;
    result: string;
  };
  links: { label: string; url: string; type: "LIVE_SITE" | "DEMO" | "APP" | "SOCIAL" | "OTHER" }[];
  socialWork: {
    platform: string;
    handle?: string;
    profileUrl?: string;
    enSummary: string;
    siSummary: string;
  }[];
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);
  const cleanSlug = input.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  for (const l of input.links) {
    if (l.url && !isSafeExternalUrl(l.url)) {
      return { ok: false, error: `Invalid link URL: ${l.url}. Only HTTPS URLs allowed.` };
    }
  }

  const project = input.id
    ? await prisma.project.update({
        where: { id: input.id },
        data: {
          slug: cleanSlug,
          isDemo: input.isDemo,
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
          videoType: input.videoType || null,
          videoUrl: input.videoUrl?.trim() || null,
          techStackJson: input.techStack.map((t) => sanitizePlainText(t)).filter(Boolean),
        },
      })
    : await prisma.project.create({
        data: {
          slug: cleanSlug,
          isDemo: input.isDemo,
          isFeatured: input.isFeatured,
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
          videoType: input.videoType || null,
          videoUrl: input.videoUrl?.trim() || null,
          techStackJson: input.techStack.map((t) => sanitizePlainText(t)).filter(Boolean),
        },
      });

  await prisma.projectTranslation.upsert({
    where: { projectId_locale: { projectId: project.id, locale: "en" } },
    update: {
      title: sanitizePlainText(input.en.title),
      clientName: sanitizePlainText(input.en.clientName),
      industry: sanitizePlainText(input.en.industry),
      summary: sanitizePlainText(input.en.summary),
      challenge: sanitizeRichText(input.en.challenge),
      solution: sanitizeRichText(input.en.solution),
      result: sanitizeRichText(input.en.result),
      needsReview: false,
    },
    create: {
      projectId: project.id,
      locale: "en",
      title: sanitizePlainText(input.en.title),
      clientName: sanitizePlainText(input.en.clientName),
      industry: sanitizePlainText(input.en.industry),
      summary: sanitizePlainText(input.en.summary),
      challenge: sanitizeRichText(input.en.challenge),
      solution: sanitizeRichText(input.en.solution),
      result: sanitizeRichText(input.en.result),
      needsReview: false,
    },
  });

  await prisma.projectTranslation.upsert({
    where: { projectId_locale: { projectId: project.id, locale: "si" } },
    update: {
      title: sanitizePlainText(input.si.title || input.en.title),
      clientName: sanitizePlainText(input.si.clientName || input.en.clientName),
      industry: sanitizePlainText(input.si.industry || input.en.industry),
      summary: sanitizePlainText(input.si.summary),
      challenge: sanitizeRichText(input.si.challenge),
      solution: sanitizeRichText(input.si.solution),
      result: sanitizeRichText(input.si.result),
      needsReview: false,
    },
    create: {
      projectId: project.id,
      locale: "si",
      title: sanitizePlainText(input.si.title || input.en.title),
      clientName: sanitizePlainText(input.si.clientName || input.en.clientName),
      industry: sanitizePlainText(input.si.industry || input.en.industry),
      summary: sanitizePlainText(input.si.summary),
      challenge: sanitizeRichText(input.si.challenge),
      solution: sanitizeRichText(input.si.solution),
      result: sanitizeRichText(input.si.result),
      needsReview: false,
    },
  });

  await prisma.projectLink.deleteMany({ where: { projectId: project.id } });
  for (let i = 0; i < input.links.length; i++) {
    const l = input.links[i]!;
    if (!l.url.trim()) continue;
    await prisma.projectLink.create({
      data: {
        projectId: project.id,
        label: sanitizePlainText(l.label || "Live Site"),
        url: l.url.trim(),
        type: l.type,
        sortOrder: i + 1,
      },
    });
  }

  await prisma.projectSocialWork.deleteMany({ where: { projectId: project.id } });
  for (let i = 0; i < input.socialWork.length; i++) {
    const sw = input.socialWork[i]!;
    if (!sw.platform.trim()) continue;
    await prisma.projectSocialWork.create({
      data: {
        projectId: project.id,
        platform: sanitizePlainText(sw.platform),
        handle: sw.handle ? sanitizePlainText(sw.handle) : null,
        profileUrl: sw.profileUrl && isSafeExternalUrl(sw.profileUrl) ? sw.profileUrl.trim() : null,
        sortOrder: i + 1,
        translations: {
          create: [
            { locale: "en", summary: sanitizePlainText(sw.enSummary), needsReview: false },
            { locale: "si", summary: sanitizePlainText(sw.siSummary || sw.enSummary), needsReview: false },
          ],
        },
      },
    });
  }

  await writeAuditLog({
    adminId: session.adminId,
    action: input.id ? "PROJECT_UPDATED" : "PROJECT_CREATED",
    entity: "projects",
    entityId: project.id,
  });

  revalidateAllPublicRoutes();
  return { ok: true, id: project.id };
}

// ============================================================================
// 6. Customer Feedback Moderation & Manual Entry (Section 8)
// ============================================================================

export async function moderateFeedbackAction(input: {
  csrfToken: string;
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  isFeatured?: boolean;
  message?: string;
  messageSi?: string;
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  const existing = await prisma.feedback.findUnique({ where: { id: input.id } });
  if (!existing) return { ok: false, error: "Not found" };

  await prisma.feedback.update({
    where: { id: input.id },
    data: {
      status: input.status,
      isFeatured: input.isFeatured ?? existing.isFeatured,
      message: input.message ? sanitizePlainText(input.message) : existing.message,
      messageSi: input.messageSi !== undefined ? sanitizePlainText(input.messageSi) : existing.messageSi,
      moderatedBy: session.adminId,
      moderatedAt: new Date(),
    },
  });

  await writeAuditLog({
    adminId: session.adminId,
    action: `FEEDBACK_${input.status}`,
    entity: "feedback",
    entityId: input.id,
    diff: {
      previousMessage: existing.message,
      newStatus: input.status,
    },
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}

export async function createAdminFeedbackAction(input: {
  csrfToken: string;
  name: string;
  company?: string;
  role?: string;
  rating: number;
  message: string;
  messageSi?: string;
  status: "APPROVED" | "PENDING";
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  const fb = await prisma.feedback.create({
    data: {
      name: sanitizePlainText(input.name),
      company: input.company ? sanitizePlainText(input.company) : null,
      role: input.role ? sanitizePlainText(input.role) : null,
      rating: Math.min(5, Math.max(1, Number(input.rating) || 5)),
      message: sanitizePlainText(input.message),
      messageSi: input.messageSi ? sanitizePlainText(input.messageSi) : null,
      consentToPublish: true,
      source: "ADMIN_ENTERED",
      status: input.status,
      moderatedBy: session.adminId,
      moderatedAt: new Date(),
    },
  });

  await writeAuditLog({
    adminId: session.adminId,
    action: "FEEDBACK_ADMIN_CREATED",
    entity: "feedback",
    entityId: fb.id,
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}

// ============================================================================
// 7. Enquiries Inbox Management (Section 5)
// ============================================================================

export async function updateEnquiryStatusAction(input: {
  csrfToken: string;
  id: string;
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "WON" | "CLOSED";
  note?: string;
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  await prisma.enquiry.update({
    where: { id: input.id },
    data: { status: input.status },
  });

  if (input.note && input.note.trim()) {
    await prisma.enquiryNote.create({
      data: {
        enquiryId: input.id,
        adminId: session.adminId,
        note: sanitizePlainText(input.note),
      },
    });
  }

  await writeAuditLog({
    adminId: session.adminId,
    action: "ENQUIRY_STATUS_UPDATED",
    entity: "enquiries",
    entityId: input.id,
    diff: { status: input.status },
  });

  return { ok: true };
}

// ============================================================================
// 8. Home Builder & Navigation Manager
// ============================================================================

export async function updateHomeSectionsAction(input: {
  csrfToken: string;
  sections: {
    id: string;
    sortOrder: number;
    isVisible: boolean;
    enTitle: string;
    enSubtitle: string;
    siTitle: string;
    siSubtitle: string;
  }[];
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  for (const s of input.sections) {
    await prisma.homeSection.update({
      where: { id: s.id },
      data: { sortOrder: s.sortOrder, isVisible: s.isVisible },
    });
    await prisma.homeSectionTranslation.upsert({
      where: { homeSectionId_locale: { homeSectionId: s.id, locale: "en" } },
      update: {
        title: sanitizePlainText(s.enTitle),
        subtitle: sanitizePlainText(s.enSubtitle),
        needsReview: false,
      },
      create: {
        homeSectionId: s.id,
        locale: "en",
        title: sanitizePlainText(s.enTitle),
        subtitle: sanitizePlainText(s.enSubtitle),
        needsReview: false,
      },
    });
    await prisma.homeSectionTranslation.upsert({
      where: { homeSectionId_locale: { homeSectionId: s.id, locale: "si" } },
      update: {
        title: sanitizePlainText(s.siTitle),
        subtitle: sanitizePlainText(s.siSubtitle),
        needsReview: false,
      },
      create: {
        homeSectionId: s.id,
        locale: "si",
        title: sanitizePlainText(s.siTitle),
        subtitle: sanitizePlainText(s.siSubtitle),
        needsReview: false,
      },
    });
  }

  await writeAuditLog({
    adminId: session.adminId,
    action: "HOME_BUILDER_UPDATED",
    entity: "home_sections",
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}

// ============================================================================
// 9. Pages & Legal Rich-Text Editor
// ============================================================================

export async function savePageContentAction(input: {
  csrfToken: string;
  slug: string;
  enTitle: string;
  enSubtitle: string;
  enBody: string;
  siTitle: string;
  siSubtitle: string;
  siBody: string;
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  const page = await prisma.pageContent.upsert({
    where: { slug: input.slug },
    update: { isPublished: true },
    create: { slug: input.slug, isPublished: true },
  });

  await prisma.pageContentTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale: "en" } },
    update: {
      title: sanitizePlainText(input.enTitle),
      subtitle: sanitizePlainText(input.enSubtitle),
      body: sanitizeRichText(input.enBody),
      needsReview: false,
    },
    create: {
      pageId: page.id,
      locale: "en",
      title: sanitizePlainText(input.enTitle),
      subtitle: sanitizePlainText(input.enSubtitle),
      body: sanitizeRichText(input.enBody),
      needsReview: false,
    },
  });

  await prisma.pageContentTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale: "si" } },
    update: {
      title: sanitizePlainText(input.siTitle || input.enTitle),
      subtitle: sanitizePlainText(input.siSubtitle),
      body: sanitizeRichText(input.siBody),
      needsReview: false,
    },
    create: {
      pageId: page.id,
      locale: "si",
      title: sanitizePlainText(input.siTitle || input.enTitle),
      subtitle: sanitizePlainText(input.siSubtitle),
      body: sanitizeRichText(input.siBody),
      needsReview: false,
    },
  });

  await saveContentRevision(
    "page_content",
    page.id,
    "all",
    { enBody: input.enBody, siBody: input.siBody },
    session.adminId
  );

  await writeAuditLog({
    adminId: session.adminId,
    action: "PAGE_CONTENT_UPDATED",
    entity: "pages_content",
    entityId: input.slug,
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}

// ============================================================================
// 10. Company Content (FAQs, Offers, Stats)
// ============================================================================

export async function saveFaqAction(input: {
  csrfToken: string;
  id?: string;
  group: string;
  sortOrder: number;
  enQuestion: string;
  enAnswer: string;
  siQuestion: string;
  siAnswer: string;
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  const faq = input.id
    ? await prisma.faq.update({
        where: { id: input.id },
        data: { group: input.group, sortOrder: input.sortOrder, isPublished: true },
      })
    : await prisma.faq.create({
        data: { group: input.group, sortOrder: input.sortOrder, isPublished: true },
      });

  await prisma.faqTranslation.upsert({
    where: { faqId_locale: { faqId: faq.id, locale: "en" } },
    update: {
      question: sanitizePlainText(input.enQuestion),
      answer: sanitizePlainText(input.enAnswer),
      needsReview: false,
    },
    create: {
      faqId: faq.id,
      locale: "en",
      question: sanitizePlainText(input.enQuestion),
      answer: sanitizePlainText(input.enAnswer),
      needsReview: false,
    },
  });

  await prisma.faqTranslation.upsert({
    where: { faqId_locale: { faqId: faq.id, locale: "si" } },
    update: {
      question: sanitizePlainText(input.siQuestion || input.enQuestion),
      answer: sanitizePlainText(input.siAnswer || input.enAnswer),
      needsReview: false,
    },
    create: {
      faqId: faq.id,
      locale: "si",
      question: sanitizePlainText(input.siQuestion || input.enQuestion),
      answer: sanitizePlainText(input.siAnswer || input.enAnswer),
      needsReview: false,
    },
  });

  await writeAuditLog({
    adminId: session.adminId,
    action: "FAQ_SAVED",
    entity: "faqs",
    entityId: faq.id,
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}

export async function saveStatCounterAction(input: {
  csrfToken: string;
  value: string;
  suffix: string;
  enLabel: string;
  siLabel: string;
  sortOrder: number;
}) {
  const session = await requireAdminMutationAuth(input.csrfToken);

  const stat = await prisma.stat.create({
    data: {
      value: sanitizePlainText(input.value),
      suffix: sanitizePlainText(input.suffix),
      sortOrder: input.sortOrder,
      isPublished: true,
      translations: {
        create: [
          { locale: "en", label: sanitizePlainText(input.enLabel), needsReview: false },
          { locale: "si", label: sanitizePlainText(input.siLabel || input.enLabel), needsReview: false },
        ],
      },
    },
  });

  await writeAuditLog({
    adminId: session.adminId,
    action: "STAT_CREATED",
    entity: "stats",
    entityId: stat.id,
  });

  revalidateAllPublicRoutes();
  return { ok: true };
}
