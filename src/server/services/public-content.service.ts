import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { sanitizeRichText } from "@/lib/security/sanitize";

function pickLocalized<T extends { locale: string }>(
  items: T[],
  locale: "en" | "si"
): T | undefined {
  return items.find((i) => i.locale === locale) ?? items.find((i) => i.locale === "en");
}

function nonEmpty(primary: string | null | undefined, fallback: string | null | undefined): string {
  if (primary && primary.trim().length > 0) return primary;
  return fallback ?? "";
}

export interface PublicProductDTO {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescriptionHtml: string;
  targetAudience: string;
  logoUrl: string;
  coverUrl: string;
  videoType: string | null;
  videoUrl: string | null;
  status: string;
  techStack: string[];
  features: { id: string; title: string; description: string }[];
  links: { id: string; label: string; url: string; type: string; isPrimary: boolean }[];
}

export interface PublicServiceCategoryDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  services: PublicServiceDTO[];
}

export interface PublicServiceDTO {
  id: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  shortDescription: string;
  longDescriptionHtml: string;
  features: string[];
  isFeatured: boolean;
}

export interface PublicProjectDTO {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  industry: string;
  summary: string;
  challengeHtml: string;
  solutionHtml: string;
  resultHtml: string;
  coverUrl: string;
  logoUrl: string;
  techStack: string[];
  isFeatured: boolean;
  isDemo: boolean;
  links: { id: string; label: string; url: string; type: string }[];
  socialWork: {
    id: string;
    platform: string;
    handle: string | null;
    profileUrl: string | null;
    summary: string;
  }[];
}

// ============================================================================
// Default Fallbacks (Match Seed Data if DB is cold during static build)
// ============================================================================

const FALLBACK_PRODUCTS_EN: PublicProductDTO[] = [
  {
    id: "prod-eventloom",
    slug: "eventloom",
    name: "EventLoom",
    tagline: "Your one-stop solution for managing events, inventory, and more.",
    shortDescription:
      "Streamline wedding, birthday, and corporate event operations with customizable packages, slip payment tracking, and 3D blueprint previews.",
    longDescriptionHtml:
      "<p>EventLoom is a comprehensive event management platform designed to streamline the planning and execution of events such as weddings and birthdays. The system caters to three key user roles: Customers, Administrators, and Event Organizers.</p><p>With predefined packages (Basic, Pro, Premium), district-based delivery fee calculation, slip upload payment verification, and refundable inventory tracking, EventLoom gives event businesses complete operational control.</p>",
    targetAudience: "Event planners, rental inventory companies, wedding & party organizers.",
    logoUrl: "/assets/img/eventloom_logo.png",
    coverUrl: "/assets/img/eventloom_cover.png",
    videoType: null,
    videoUrl: null,
    status: "LIVE",
    techStack: ["React", "TypeScript", "Node.js", "MySQL", "3D Blueprint Preview"],
    features: [
      { id: "ef-1", title: "Multi-Role Access", description: "Three user types: Customers, Admins, and Event Organizers with tailored dashboards." },
      { id: "ef-2", title: "Event Package Customization", description: "Predefined Birthday & Wedding packages (Basic, Pro, Premium) with configurable add-ons." },
      { id: "ef-3", title: "Order & Payment Management", description: "Request approval workflow, partial/full payment via slip upload, and refund tracking." },
      { id: "ef-4", title: "Dynamic Delivery Pricing", description: "Automatic delivery fee calculation based on district." },
      { id: "ef-5", title: "Inventory & Refund Tracking", description: "Real-time stock monitoring with refundable item management." },
      { id: "ef-6", title: "Blueprint Designer", description: "Visualize your perfect event setup with live 3D previews that update as you make changes." },
    ],
    links: [],
  },
  {
    id: "prod-captureloom",
    slug: "captureloom",
    name: "CaptureLoom",
    tagline: "Weave Perfection into Every Shoot – The Photographer’s Command Center",
    shortDescription:
      "Built for photography studios and freelancers to automate team assignments, equipment tracking, and client review workflows.",
    longDescriptionHtml:
      "<p>CaptureLoom redefines photography business management by merging granular role-based control with end-to-end workflow automation. Designed for both solo photographers and large studios, our platform eliminates chaotic spreadsheets with tools for team assignments, gear tracking, and AI-driven booking reminders.</p>",
    targetAudience: "Wedding & event photography studios, commercial photographers, and videography teams.",
    logoUrl: "/assets/img/captureloom_logo.png",
    coverUrl: "/assets/img/captureloom_cover.jpg",
    videoType: null,
    videoUrl: null,
    status: "LIVE",
    techStack: ["React", "TypeScript", "Node.js", "Cloud Storage", "RBAC"],
    features: [
      { id: "cf-1", title: "Role-Based Workflow Control", description: "Predefined roles (Admin, Photographer, Assistant) with tiered permissions." },
      { id: "cf-2", title: "Smart Package Builder", description: "Create customizable packages (Gold/Silver/Bronze) with add-ons and galleries." },
      { id: "cf-3", title: "Team-Centric Job Assignments", description: "Assign shoots to teams or individuals with equipment requirements and deadlines." },
      { id: "cf-4", title: "Equipment Tracking System", description: "Track gear usage, assign tools to teams, and receive low-inventory alerts." },
      { id: "cf-5", title: "Photo Delivery & Reviews", description: "Securely share files with clients and collect public/private feedback." },
    ],
    links: [],
  },
  {
    id: "prod-promoloom",
    slug: "promoloom",
    name: "PromoLoom",
    tagline: "Go Viral or Go Home – AI-Powered Event Promotion & Ticketing",
    shortDescription:
      "Built for clubs, artists, promoters, and venues to merge social virality with dynamic ticketing and real-time ROI tracking.",
    longDescriptionHtml:
      "<p>PromoLoom is the all-in-one event marketing platform designed to turn every event into a viral sensation. Powered by AI-driven hype tools, dynamic ticketing, and real-time analytics, we help promoters, artists, and brands cut through the noise and sell out events faster.</p>",
    targetAudience: "Event promoters, concert organizers, hospitality venues, artists, and marketing agencies.",
    logoUrl: "/assets/img/promoloom_logo.png",
    coverUrl: "/assets/img/promoloom_cover.png",
    videoType: null,
    videoUrl: null,
    status: "LIVE",
    techStack: ["Next.js", "TypeScript", "AI Campaign Engine", "Social APIs", "Dynamic Ticketing"],
    features: [
      { id: "pf-1", title: "Viral Ticketing Campaigns", description: "Gamified tools like ‘Tag 3 Friends to Unlock Discounts’ to boost organic shares." },
      { id: "pf-2", title: "Dynamic Pricing Engine", description: "Auto-adjusts ticket prices (early bird, surge pricing) based on demand." },
      { id: "pf-3", title: "Influencer Collaboration Hub", description: "Connect with promoters/DJs to share affiliate codes and track sales commissions." },
      { id: "pf-4", title: "Real-Time Social ROI", description: "Dashboards show ticket conversions per hashtag, post, or influencer campaign." },
      { id: "pf-5", title: "One-Click Multi-Posting", description: "Schedule promo content across Instagram, TikTok, and Facebook simultaneously." },
    ],
    links: [],
  },
];

export async function getPublishedProducts(locale: "en" | "si"): Promise<PublicProductDTO[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { isPublished: true, deletedAt: null },
      include: {
        logo: true,
        cover: true,
        translations: true,
        features: {
          include: { translations: true },
          orderBy: { sortOrder: "asc" },
        },
        links: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (rows.length === 0) return FALLBACK_PRODUCTS_EN;

    return rows.map((p) => {
      const en = p.translations.find((t) => t.locale === "en");
      const loc = pickLocalized(p.translations, locale);
      return {
        id: p.id,
        slug: p.slug,
        name: nonEmpty(loc?.name, en?.name) || p.slug,
        tagline: nonEmpty(loc?.tagline, en?.tagline),
        shortDescription: nonEmpty(loc?.shortDescription, en?.shortDescription),
        longDescriptionHtml: sanitizeRichText(
          nonEmpty(loc?.longDescription, en?.longDescription)
        ),
        targetAudience: nonEmpty(loc?.targetAudience, en?.targetAudience),
        logoUrl: p.logo?.publicUrl ?? `/assets/img/${p.slug}_logo.png`,
        coverUrl: p.cover?.publicUrl ?? `/assets/img/${p.slug}_cover.png`,
        videoType: p.videoType,
        videoUrl: p.videoUrl,
        status: p.status,
        techStack: Array.isArray(p.techStackJson) ? (p.techStackJson as string[]) : [],
        features: p.features.map((f) => {
          const fen = f.translations.find((t) => t.locale === "en");
          const floc = pickLocalized(f.translations, locale);
          return {
            id: f.id,
            title: nonEmpty(floc?.title, fen?.title),
            description: nonEmpty(floc?.description, fen?.description),
          };
        }),
        links: p.links.map((l) => ({
          id: l.id,
          label: l.label,
          url: l.url,
          type: l.type,
          isPrimary: l.isPrimary,
        })),
      };
    });
  } catch {
    return FALLBACK_PRODUCTS_EN;
  }
}

export async function getPublishedProductBySlug(
  slug: string,
  locale: "en" | "si"
): Promise<PublicProductDTO | null> {
  const list = await getPublishedProducts(locale);
  const normalized = slug.toLowerCase();
  return list.find((p) => p.slug.toLowerCase() === normalized) ?? null;
}

export async function getPublishedServiceCategories(
  locale: "en" | "si"
): Promise<PublicServiceCategoryDTO[]> {
  try {
    const cats = await prisma.serviceCategory.findMany({
      where: { isPublished: true, deletedAt: null },
      include: {
        translations: true,
        services: {
          where: { isPublished: true, deletedAt: null },
          include: { translations: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    if (cats.length > 0) {
      return cats.map((c) => {
        const cen = c.translations.find((t) => t.locale === "en");
        const cloc = pickLocalized(c.translations, locale);
        const catName = nonEmpty(cloc?.name, cen?.name) || c.slug;
        return {
          id: c.id,
          slug: c.slug,
          name: catName,
          description: nonEmpty(cloc?.description, cen?.description),
          services: c.services.map((s) => {
            const sen = s.translations.find((t) => t.locale === "en");
            const sloc = pickLocalized(s.translations, locale);
            const feats = Array.isArray(sloc?.featuresJson) && (sloc.featuresJson as string[]).length > 0
              ? (sloc.featuresJson as string[])
              : Array.isArray(sen?.featuresJson)
                ? (sen.featuresJson as string[])
                : [];
            return {
              id: s.id,
              slug: s.slug,
              categorySlug: c.slug,
              categoryName: catName,
              title: nonEmpty(sloc?.title, sen?.title) || s.slug,
              shortDescription: nonEmpty(sloc?.shortDescription, sen?.shortDescription),
              longDescriptionHtml: sanitizeRichText(
                nonEmpty(sloc?.longDescription, sen?.longDescription)
              ),
              features: feats,
              isFeatured: s.isFeatured,
            };
          }),
        };
      });
    }
  } catch {
    // Fallback below
  }

  return [
    {
      id: "cat-software",
      slug: "software-development",
      name: locale === "si" ? "මෘදුකාංග සංවර්ධනය" : "Software Development",
      description:
        locale === "si"
          ? "ඔබේ ව්‍යාපාරික අවශ්‍යතාවලට ගැළපෙන වෙබ්, ජංගම සහ මෘදුකාංග පද්ධති."
          : "Custom web, mobile, and product engineering tailored to your operations.",
      services: [
        {
          id: "svc-web",
          slug: "web-application-development",
          categorySlug: "software-development",
          categoryName: "Software Development",
          title: locale === "si" ? "වෙබ් යෙදුම් සංවර්ධනය" : "Web Application Development",
          shortDescription: "Custom web apps for businesses and enterprises",
          longDescriptionHtml:
            "<p>We build responsive, high-performance web applications tailored to your unique business needs.</p>",
          features: [
            "Custom frontend interfaces",
            "Scalable backend systems",
            "Third-party service connections",
            "Cloud hosting solutions",
            "Data protection measures",
          ],
          isFeatured: true,
        },
        {
          id: "svc-prod",
          slug: "software-product-development",
          categorySlug: "software-development",
          categoryName: "Software Development",
          title: locale === "si" ? "මෘදුකාංග නිෂ්පාදන සංවර්ධනය" : "Software Product Development",
          shortDescription: "End-to-end solutions from idea to product",
          longDescriptionHtml:
            "<p>Turn your vision into a market-ready product with our comprehensive development process.</p>",
          features: [
            "Minimum viable product creation",
            "Multiple platform compatibility",
            "Flexible development approach",
            "Speed and efficiency enhancements",
          ],
          isFeatured: true,
        },
        {
          id: "svc-mobile",
          slug: "mobile-application-development",
          categorySlug: "software-development",
          categoryName: "Software Development",
          title: locale === "si" ? "ජංගම යෙදුම් සංවර්ධනය" : "Mobile Application Development",
          shortDescription: "iOS & Android apps with native/hybrid approaches",
          longDescriptionHtml:
            "<p>We craft applications that users love and engage with daily.</p>",
          features: [
            "Platform-specific app development",
            "Cross-platform solutions",
            "Offline operation capabilities",
          ],
          isFeatured: true,
        },
      ],
    },
    {
      id: "cat-growth",
      slug: "social-media-marketing-growth",
      name:
        locale === "si"
          ? "සමාජ මාධ්‍ය අලෙවිකරණය සහ ව්‍යාපාර වර්ධනය"
          : "Social Media Marketing & Growth",
      description:
        "End-to-end social setup, short-video production, and continuous engagement.",
      services: [
        {
          id: "svc-social",
          slug: "social-media-setup-management",
          categorySlug: "social-media-marketing-growth",
          categoryName: "Social Media Marketing & Growth",
          title:
            locale === "si"
              ? "සමාජ මාධ්‍ය ගිණුම් පිහිටුවීම සහ කළමනාකරණය"
              : "Social Media Setup & Management",
          shortDescription:
            "End-to-end setup and management across Facebook, Instagram, TikTok & TripAdvisor",
          longDescriptionHtml:
            "<p>We create, brand, optimize, and manage your official business profiles across Facebook, Instagram, TikTok, and TripAdvisor.</p>",
          features: [
            "Facebook, Instagram, TikTok & TripAdvisor setup",
            "Brand identity & profile optimization",
            "Content calendar & consistent publishing",
          ],
          isFeatured: true,
        },
        {
          id: "svc-video",
          slug: "content-short-video-production",
          categorySlug: "social-media-marketing-growth",
          categoryName: "Social Media Marketing & Growth",
          title:
            locale === "si"
              ? "අන්තර්ගත සහ කෙටි වීඩියෝ නිර්මාණය"
              : "Content & Short-Video Production",
          shortDescription:
            "Engaging Reels, TikToks, and visual posts designed to attract real customers",
          longDescriptionHtml:
            "<p>Our creative team plans, edits, and publishes attention-grabbing Reels, TikTok videos, and carousel posts.</p>",
          features: [
            "Short-form video editing (Reels / TikTok)",
            "Branded graphic posts & carousels",
            "Multi-platform publishing workflow",
          ],
          isFeatured: true,
        },
      ],
    },
  ];
}

export async function getPublishedProjects(locale: "en" | "si"): Promise<PublicProjectDTO[]> {
  try {
    const rows = await prisma.project.findMany({
      where: { isPublished: true, deletedAt: null },
      include: {
        clientLogo: true,
        cover: true,
        translations: true,
        links: { orderBy: { sortOrder: "asc" } },
        socialWork: {
          include: { translations: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return rows.map((p) => {
      const en = p.translations.find((t) => t.locale === "en");
      const loc = pickLocalized(p.translations, locale);
      return {
        id: p.id,
        slug: p.slug,
        title: nonEmpty(loc?.title, en?.title) || p.slug,
        clientName: nonEmpty(loc?.clientName, en?.clientName),
        industry: nonEmpty(loc?.industry, en?.industry),
        summary: nonEmpty(loc?.summary, en?.summary),
        challengeHtml: sanitizeRichText(nonEmpty(loc?.challenge, en?.challenge)),
        solutionHtml: sanitizeRichText(nonEmpty(loc?.solution, en?.solution)),
        resultHtml: sanitizeRichText(nonEmpty(loc?.result, en?.result)),
        coverUrl: p.cover?.publicUrl ?? "",
        logoUrl: p.clientLogo?.publicUrl ?? "",
        techStack: Array.isArray(p.techStackJson) ? (p.techStackJson as string[]) : [],
        isFeatured: p.isFeatured,
        isDemo: p.isDemo,
        links: p.links.map((l) => ({
          id: l.id,
          label: l.label,
          url: l.url,
          type: l.type,
        })),
        socialWork: p.socialWork.map((sw) => {
          const swEn = sw.translations.find((t) => t.locale === "en");
          const swLoc = pickLocalized(sw.translations, locale);
          return {
            id: sw.id,
            platform: sw.platform,
            handle: sw.handle,
            profileUrl: sw.profileUrl,
            summary: nonEmpty(swLoc?.summary, swEn?.summary),
          };
        }),
      };
    });
  } catch {
    return [];
  }
}

export interface PublicHomeSectionDTO {
  key: string;
  sortOrder: number;
  isVisible: boolean;
  title: string;
  subtitle: string;
}

const DEFAULT_HOME_SECTIONS: Record<"en" | "si", PublicHomeSectionDTO[]> = {
  en: [
    { key: "hero", sortOrder: 1, isVisible: true, title: "Intelligence-Led Business Growth.", subtitle: "" },
    { key: "proof_ticker", sortOrder: 2, isVisible: true, title: "Industries We Power", subtitle: "" },
    { key: "how_it_works", sortOrder: 3, isVisible: true, title: "We start by understanding your business — not by asking what to post.", subtitle: "How VARDHEL Works · Capabilities & Advantage" },
    { key: "platforms", sortOrder: 4, isVisible: true, title: "Platforms Engineered by Vardhel", subtitle: "Flagship Platforms" },
    { key: "feedback", sortOrder: 5, isVisible: true, title: "Customer Experiences", subtitle: "" },
    { key: "faq", sortOrder: 6, isVisible: true, title: "Frequently Asked Questions", subtitle: "" },
    { key: "final_cta", sortOrder: 7, isVisible: true, title: "Your Next Stage of Growth Starts Here.", subtitle: "" },
  ],
  si: [
    { key: "hero", sortOrder: 1, isVisible: true, title: "බුද්ධිමය ව්‍යාපාර වර්ධනය.", subtitle: "" },
    { key: "proof_ticker", sortOrder: 2, isVisible: true, title: "ඉලක්කගත ක්ෂේත්‍ර", subtitle: "" },
    { key: "how_it_works", sortOrder: 3, isVisible: true, title: "අපි ආරම්භ කරන්නේ ඔබේ ව්‍යාපාරය තේරුම් ගැනීමෙනි", subtitle: "VARDHEL ක්‍රියා කරන ආකාරය · අපගේ හැකියාවන් සහ විශේෂත්වය" },
    { key: "platforms", sortOrder: 4, isVisible: true, title: "Vardhel විසින් නිර්මාණය කළ මෘදුකාංග පද්ධති", subtitle: "අපගේ නිෂ්පාදන" },
    { key: "feedback", sortOrder: 5, isVisible: true, title: "පාරිභෝගික අදහස්", subtitle: "" },
    { key: "faq", sortOrder: 6, isVisible: true, title: "නිතර අසන ප්‍රශ්න (FAQ)", subtitle: "" },
    { key: "final_cta", sortOrder: 7, isVisible: true, title: "ඔබේ වර්ධනයේ ඊළඟ අදියර මෙතැනින් අරඹන්න.", subtitle: "" },
  ],
};

export async function getHomeSections(locale: "en" | "si"): Promise<PublicHomeSectionDTO[]> {
  const defaults = DEFAULT_HOME_SECTIONS[locale];
  const alignedKeys = defaults.map((d) => d.key);

  try {
    const rows = await prisma.homeSection.findMany({
      where: { key: { in: alignedKeys } },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    });

    if (rows.length === 0) return defaults;

    const byKey = new Map(rows.map((r) => [r.key, r]));
    const merged: PublicHomeSectionDTO[] = defaults.map((def) => {
      const row = byKey.get(def.key);
      if (!row) return def;
      const en = row.translations.find((t) => t.locale === "en");
      const loc = pickLocalized(row.translations, locale);
      return {
        key: def.key,
        sortOrder: row.sortOrder,
        isVisible: row.isVisible,
        title: nonEmpty(loc?.title, en?.title || def.title),
        subtitle: nonEmpty(loc?.subtitle, en?.subtitle || def.subtitle),
      };
    });

    return merged.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return defaults;
  }
}

export async function getApprovedFeedback(locale: "en" | "si") {
  try {
    // STRICT VAPT RULE (Section 8.4): Only APPROVED feedback is returned; raw email & submittedIpHash are NEVER returned to clients.
    const rows = await prisma.feedback.findMany({
      where: { status: "APPROVED", deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        role: true,
        rating: true,
        message: true,
        messageSi: true,
        isFeatured: true,
        createdAt: true,
        photo: { select: { publicUrl: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return rows.map((r) => {
      const normalizedEmail = r.email?.trim().toLowerCase() ?? "";
      const gravatarUrl = normalizedEmail
        ? `https://www.gravatar.com/avatar/${createHash("sha256").update(normalizedEmail).digest("hex")}?s=96&d=404`
        : null;

      return {
        id: r.id,
        name: r.name,
        company: r.company,
        role: r.role,
        rating: r.rating,
        avatarUrl: r.photo?.publicUrl ?? gravatarUrl,
        message: locale === "si" && r.messageSi?.trim() ? r.messageSi : r.message,
        createdAt: r.createdAt.toISOString(),
      };
    });
  } catch {
    return [];
  }
}

export async function getPublishedFaqs(locale: "en" | "si") {
  try {
    const rows = await prisma.faq.findMany({
      where: { isPublished: true, deletedAt: null },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    });

    if (rows.length > 0) {
      return rows.map((f) => {
        const en = f.translations.find((t) => t.locale === "en");
        const loc = pickLocalized(f.translations, locale);
        return {
          id: f.id,
          group: f.group,
          question: nonEmpty(loc?.question, en?.question),
          answer: nonEmpty(loc?.answer, en?.answer),
        };
      });
    }
  } catch {
    // Fallback below
  }

  return [
    {
      id: "faq-1",
      group: "general",
      question:
        locale === "si"
          ? "Vardhel මඟින් ලබාදෙන සේවාවන් මොනවාද?"
          : "What services does Vardhel offer?",
      answer:
        locale === "si"
          ? "අපි වෙබ් සහ ජංගම යෙදුම් සංවර්ධනය, මෘදුකාංග නිෂ්පාදන ඉංජිනේරුකරණය මෙන්ම Facebook, TikTok, Instagram සහ TripAdvisor හරහා ව්‍යාපාර වර්ධනය කිරීමේ සේවාවන්ද ලබා දෙන්නෙමු."
          : "We deliver custom web/mobile app development, AI/ML integration, cloud solutions, UI/UX design—plus end-to-end social media setup, video production, and business growth support.",
    },
    {
      id: "faq-2",
      group: "growth",
      question:
        locale === "si"
          ? "මෘදුකාංග සහ සමාජ මාධ්‍ය වර්ධන හවුල්කාරිත්වය ක්‍රියාත්මක වන්නේ කෙසේද?"
          : "How does your Software + Social Media Growth partnership work?",
      answer:
        locale === "si"
          ? "අපි ඔබේ ව්‍යාපාරය අධ්‍යයනය කර, අවශ්‍ය මෘදුකාංග පද්ධතිය ගොඩනඟා, Facebook, Instagram, TikTok සහ TripAdvisor ගිණුම් ආරම්භ කර ආකර්ෂණීය වීඩියෝ සහ පෝස්ට් පළ කරමින් ව්‍යාපාරය වර්ධනය කරගැනීමට අවශ්‍ය දැනුමද ඔබට ලබා දෙන්නෙමු."
          : "We study your business, build the software or booking system you need, and then set up and run your social media accounts (Facebook, Instagram, TikTok, TripAdvisor) with engaging videos and posts.",
    },
    {
      id: "faq-3",
      group: "general",
      question:
        locale === "si"
          ? "සාමාන්‍යයෙන් ව්‍යාපෘතියක් සඳහා කොපමණ කාලයක් ගතවේද?"
          : "How long does a typical project take?",
      answer:
        locale === "si"
          ? "මූලික නිෂ්පාදනයක් (MVP) සඳහා සති 3–6ක් පමණද, මධ්‍යම ප්‍රමාණයේ මෘදුකාංග පද්ධතියක් සඳහා මාස 3–6ක් පමණද ගතවේ."
          : "MVP (Minimum Viable Product): 3–6 weeks. Mid-size application: 3–6 months. Enterprise ecosystems: Phased rollout.",
    },
  ];
}

export async function getPublishedOffers(locale: "en" | "si") {
  try {
    const rows = await prisma.offer.findMany({
      where: { isPublished: true, deletedAt: null },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((o) => {
        const en = o.translations.find((t) => t.locale === "en");
        const loc = pickLocalized(o.translations, locale);
        return {
          id: o.id,
          ctaHref: o.ctaHref,
          title: nonEmpty(loc?.title, en?.title),
          description: nonEmpty(loc?.description, en?.description),
          badge: nonEmpty(loc?.badge, en?.badge),
          ctaLabel: nonEmpty(loc?.ctaLabel, en?.ctaLabel) || "Contact Us",
        };
      });
    }
  } catch {
    // Fallback below
  }

  return [
    {
      id: "offer-1",
      ctaHref: "/contact",
      title: locale === "si" ? "අධ්‍යාපනික මෘදුකාංග ව්‍යාපෘති සඳහා" : "For an Academic Project",
      description:
        "Custom software solutions for student projects—from concept to functional prototype with documented code perfect for coursework.",
      badge: locale === "si" ? "සිසුන් සඳහා" : "Students & Researchers",
      ctaLabel: locale === "si" ? "සම්බන්ධ වන්න" : "Contact Us",
    },
    {
      id: "offer-2",
      ctaHref: "/contact",
      title:
        locale === "si"
          ? "කුඩා සහ මධ්‍ය පරිමාණ ව්‍යාපාර වර්ධන පැකේජය"
          : "For Small Business Boost (Software + Growth)",
      description:
        "Budget-friendly software applications paired with social media growth setup tailored for growing businesses.",
      badge: locale === "si" ? "ව්‍යාපාර සඳහා" : "Growing Businesses",
      ctaLabel: locale === "si" ? "අදම අරඹන්න" : "Start Growing",
    },
  ];
}

export async function getPublishedProcessSteps(
  stepType: "dev_cycle" | "growth_journey",
  locale: "en" | "si"
) {
  try {
    const rows = await prisma.processStep.findMany({
      where: { stepType, isPublished: true },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    });
    if (rows.length > 0) {
      return rows.map((s) => {
        const en = s.translations.find((t) => t.locale === "en");
        const loc = pickLocalized(s.translations, locale);
        const bullets =
          Array.isArray(loc?.bulletsJson) && (loc.bulletsJson as string[]).length > 0
            ? (loc.bulletsJson as string[])
            : Array.isArray(en?.bulletsJson)
              ? (en.bulletsJson as string[])
              : [];
        return {
          id: s.id,
          title: nonEmpty(loc?.title, en?.title),
          bullets,
        };
      });
    }
  } catch {
    // Fallback
  }

  if (stepType === "growth_journey") {
    return [
      { id: "gj-1", title: "1. Understand Your Business", bullets: ["Deep-dive into your business model, customers, and revenue goals"] },
      { id: "gj-2", title: "2. Gather Requirements", bullets: ["Map operational workflows, pain points, and customer touchpoints"] },
      { id: "gj-3", title: "3. Recommend New Technology", bullets: ["Select the right scalable architecture, tools, and digital channels"] },
      { id: "gj-4", title: "4. Build the Software", bullets: ["Engineer a fast, secure, mobile-ready web or software platform"] },
      { id: "gj-5", title: "5. Launch with Confidence", bullets: ["Deploy to production with SEO, analytics, and WhatsApp lead routing"] },
      { id: "gj-6", title: "6. Set Up & Run Social Media", bullets: ["Create & manage Facebook, TikTok, Instagram & TripAdvisor with posts and videos"] },
      { id: "gj-7", title: "7. Keep Growing Together", bullets: ["Transfer knowledge, provide a continuous plan, and support your long-term growth"] },
    ];
  }

  return [
    { id: "dc-1", title: "Discovery Workshop", bullets: ["Requirement gathering", "Goal alignment", "Scope definition"] },
    { id: "dc-2", title: "Strategic Design", bullets: ["Wireframe", "UI/UX mockups", "Client approvals"] },
    { id: "dc-3", title: "Agile Development", bullets: ["Sprint planning", "Weekly builds", "Continuous feedback"] },
    { id: "dc-4", title: "Quality Assurance", bullets: ["Automated testing", "User acceptance testing", "Performance optimization"] },
    { id: "dc-5", title: "Launch & Scale", bullets: ["Deployment", "Training", "Ongoing support"] },
  ];
}

export async function getAboutCompanyData(locale: "en" | "si") {
  try {
    const [pages, values, team, stats] = await Promise.all([
      prisma.pageContent.findMany({
        where: { isPublished: true },
        include: { translations: true },
      }),
      prisma.coreValue.findMany({
        where: { isPublished: true },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.teamMember.findMany({
        where: { isVisible: true, deletedAt: null },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.stat.findMany({
        where: { isPublished: true },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    const getPage = (slug: string, defaultTitle: string, defaultBody: string) => {
      const p = pages.find((pg) => pg.slug === slug);
      if (!p) return { title: defaultTitle, bodyHtml: defaultBody };
      const en = p.translations.find((t) => t.locale === "en");
      const loc = pickLocalized(p.translations, locale);
      return {
        title: nonEmpty(loc?.title, en?.title) || defaultTitle,
        bodyHtml: sanitizeRichText(nonEmpty(loc?.body, en?.body) || defaultBody),
      };
    };

    return {
      about: getPage(
        "about",
        "Meet Our Digital Specialists",
        "<p>At Vardhel, we've assembled a powerhouse of technical and creative talent in Sri Lanka dedicated to crafting exceptional software and helping businesses grow.</p><p><strong>We transform ideas into measurable growth.</strong> Backed by <strong>VARDHEL, our AI-driven business growth system</strong>, we pinpoint high-impact opportunities, design and build custom software that solves real business challenges, and manage your digital presence so customers find, trust, and choose you.</p>"
      ),
      vision: getPage(
        "vision",
        "Our Vision",
        "<p>To be the most trusted partner for transformative digital solutions where technology meets human potential.</p>"
      ),
      mission: getPage(
        "mission",
        "Our Mission",
        "<p>To engineer transformative digital solutions that empower businesses and exceed expectations through technical mastery, relentless innovation, and partnership-driven development.</p>"
      ),
      values:
        values.length > 0
          ? values.map((v) => {
              const en = v.translations.find((t) => t.locale === "en");
              const loc = pickLocalized(v.translations, locale);
              return {
                id: v.id,
                codeNumber: v.codeNumber,
                title: nonEmpty(loc?.title, en?.title),
                motto: nonEmpty(loc?.motto, en?.motto),
                bullets: Array.isArray(loc?.bulletsJson)
                  ? (loc.bulletsJson as string[])
                  : Array.isArray(en?.bulletsJson)
                    ? (en.bulletsJson as string[])
                    : [],
              };
            })
          : [
              {
                id: "v1",
                codeNumber: "01",
                title: "Excellence in Execution",
                motto: "Good enough isn't in our vocabulary",
                bullets: [
                  "Obsession with clean, maintainable code",
                  "Rigorous QA and performance optimization",
                  "Continuous learning and tech stack evolution",
                ],
              },
              {
                id: "v2",
                codeNumber: "02",
                title: "Client Success First",
                motto: "We win when you win",
                bullets: [
                  "Deep collaboration from day one",
                  "Transparent communication at all stages",
                  "ROI-driven development priorities",
                ],
              },
              {
                id: "v3",
                codeNumber: "03",
                title: "Innovation with Purpose",
                motto: "Solving real problems, not chasing trends",
                bullets: [
                  "Practical application of AI/ML, cloud, IoT",
                  "Fail-fast experimentation mindset",
                  "Future-proof architectural decisions",
                ],
              },
              {
                id: "v4",
                codeNumber: "04",
                title: "Ownership Mentality",
                motto: "Every team member acts like a founder",
                bullets: [
                  "End-to-end accountability for projects",
                  "Proactive problem solving",
                  "Pride in craftsmanship",
                ],
              },
              {
                id: "v5",
                codeNumber: "05",
                title: "Human-Centric Technology",
                motto: "Code should serve people, not the other way around",
                bullets: [
                  "Accessibility-focused design",
                  "Ethical AI implementation",
                  "Intuitive user experiences",
                ],
              },
            ],
      team:
        team.length > 0
          ? team.map((tm) => {
              const en = tm.translations.find((t) => t.locale === "en");
              const loc = pickLocalized(tm.translations, locale);
              return {
                id: tm.id,
                name: nonEmpty(loc?.name, en?.name),
                role: nonEmpty(loc?.role, en?.role),
              };
            })
          : [
              { id: "t1", name: "AI & Business Intelligence", role: "Specialist Discipline" },
              { id: "t2", name: "Full-Stack Product Engineering", role: "Specialist Discipline" },
              { id: "t3", name: "Conversion UI/UX Architecture", role: "Specialist Discipline" },
              { id: "t4", name: "Automated Workflows & APIs", role: "Specialist Discipline" },
              { id: "t5", name: "Growth & Funnel Strategy", role: "Specialist Discipline" },
              { id: "t6", name: "Cloud & Security Engineering", role: "Specialist Discipline" },
            ],
      stats: stats.map((st) => {
        const en = st.translations.find((t) => t.locale === "en");
        const loc = pickLocalized(st.translations, locale);
        return {
          id: st.id,
          value: st.value,
          suffix: st.suffix ?? "",
          label: nonEmpty(loc?.label, en?.label),
        };
      }),
    };
  } catch {
    return {
      about: {
        title: "Meet Our Digital Specialists",
        bodyHtml:
          "<p>At Vardhel, we've assembled a powerhouse of technical and creative talent in Sri Lanka dedicated to crafting exceptional software and helping businesses grow.</p><p><strong>We transform ideas into measurable growth.</strong> Backed by <strong>VARDHEL, our AI-driven business growth system</strong>, we pinpoint high-impact opportunities, design and build custom software that solves real business challenges, and manage your digital presence so customers find, trust, and choose you.</p>",
      },
      vision: {
        title: "Our Vision",
        bodyHtml:
          "<p>To be the most trusted partner for transformative digital solutions where technology meets human potential.</p>",
      },
      mission: {
        title: "Our Mission",
        bodyHtml:
          "<p>To engineer transformative digital solutions that empower businesses and exceed expectations.</p>",
      },
      values: [],
      team: [],
      stats: [],
    };
  }
}

export async function getLegalPageBySlug(slug: string, locale: "en" | "si") {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { slug },
      include: { translations: true },
    });
    if (page && page.isPublished) {
      const en = page.translations.find((t) => t.locale === "en");
      const loc = pickLocalized(page.translations, locale);
      return {
        title: nonEmpty(loc?.title, en?.title) || slug,
        subtitle: nonEmpty(loc?.subtitle, en?.subtitle),
        bodyHtml: sanitizeRichText(nonEmpty(loc?.body, en?.body)),
      };
    }
  } catch {
    // Fallback
  }

  return {
    title: slug === "privacy" ? "Privacy Policy" : slug === "cookies" ? "Cookie Policy" : "Terms of Use",
    subtitle: "Vardhel Legal Information",
    bodyHtml:
      "<p>Vardhel respects your privacy and protects all information submitted through our platform. Edit this legal page at any time from the Master Admin panel.</p>",
  };
}
