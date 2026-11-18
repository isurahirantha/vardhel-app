import "server-only";
import { prisma } from "@/lib/db";
import { isValidHexColor } from "@/lib/security/sanitize";

export interface GlobalSiteConfig {
  brandName: string;
  tagline: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  notifyEmail: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  phone: string;
  address: string;
  workingHours: string;
  mapEmbedUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  enableFloatingWhatsapp: boolean;
  enable3dHero: boolean;
  enableCustomCursor: boolean;
  enableFeedback: boolean;
  headerNav: { id: string; href: string; label: string }[];
  footerCompanyNav: { id: string; href: string; label: string }[];
  footerServicesNav: { id: string; href: string; label: string }[];
  footerLegalNav: { id: string; href: string; label: string }[];
  socialLinks: { id: string; platform: string; label: string; url: string }[];
}

const DEFAULT_HEADER_NAV = [
  { id: "nav-home", href: "/", en: "Home", si: "මුල් පිටුව" },
  { id: "nav-products", href: "/products", en: "Products", si: "අපගේ නිෂ්පාදන" },
  { id: "nav-services", href: "/services", en: "Services", si: "සේවාවන්" },
  { id: "nav-projects", href: "/projects", en: "Live Work", si: "සජීවී ව්‍යාපෘති" },
  { id: "nav-growth", href: "/growth", en: "Growth Partnership", si: "ව්‍යාපාර වර්ධනය" },
  { id: "nav-about", href: "/about", en: "About", si: "අප ගැන" },
  { id: "nav-feedback", href: "/feedback", en: "Feedback", si: "පාරිභෝගික අදහස්" },
  { id: "nav-contact", href: "/contact", en: "Contact", si: "සම්බන්ධ වන්න" },
];

export async function getGlobalSiteConfig(locale: "en" | "si"): Promise<GlobalSiteConfig> {
  const defaults: GlobalSiteConfig = {
    brandName: "Vardhel",
    tagline:
      locale === "si"
        ? "ඔබේ දැක්ම, අපගේ තාක්ෂණික රාමුව"
        : "Your Vision, Our Framework",
    logoLightUrl: "/SVG/hlogo.svg",
    logoDarkUrl: "/SVG/hlogo.svg",
    primaryColor: "#228870",
    secondaryColor: "#0e192c",
    contactEmail: "vardhel.official@gmail.com",
    notifyEmail: "vardhel.official@gmail.com",
    whatsappNumber: "+94767996381",
    whatsappDefaultMessage:
      locale === "si"
        ? "ආයුබෝවන් Vardhel, ඔබගේ මෘදුකාංග සහ ව්‍යාපාර වර්ධන විසඳුම් පිළිබඳව දැනගැනීමට කැමැත්තෙමි."
        : "Hi Vardhel, I'd like to know more about your solutions.",
    phone: "+94 76 799 6381",
    address: locale === "si" ? "ශ්‍රී ලංකාව" : "Sri Lanka",
    workingHours:
      locale === "si"
        ? "සඳුදා - සිකුරාදා: පෙ.ව. 9:00 - ප.ව. 6:00"
        : "Mon – Fri: 9:00 AM – 6:00 PM (IST)",
    mapEmbedUrl: "",
    defaultSeoTitle: "Vardhel | Custom Software & Business Growth Partner",
    defaultSeoDescription:
      "We build custom software products and run your social media growth end-to-end.",
    enableFloatingWhatsapp: true,
    enable3dHero: true,
    enableCustomCursor: true,
    enableFeedback: true,
    headerNav: DEFAULT_HEADER_NAV.map((n) => ({
      id: n.id,
      href: n.href,
      label: locale === "si" ? n.si : n.en,
    })),
    footerCompanyNav: [
      { id: "fc-1", href: "/", label: locale === "si" ? "මුල් පිටුව" : "Home" },
      { id: "fc-2", href: "/products", label: locale === "si" ? "නිෂ්පාදන" : "Products" },
      { id: "fc-3", href: "/projects", label: locale === "si" ? "සජීවී ව්‍යාපෘති" : "Live Work" },
      { id: "fc-4", href: "/growth", label: locale === "si" ? "ව්‍යාපාර වර්ධනය" : "Growth Partnership" },
      { id: "fc-5", href: "/about", label: locale === "si" ? "අප ගැන" : "About Us" },
      { id: "fc-6", href: "/contact", label: locale === "si" ? "සම්බන්ධ වන්න" : "Contact Us" },
    ],
    footerServicesNav: [
      { id: "fs-1", href: "/services", label: locale === "si" ? "වෙබ් යෙදුම් සංවර්ධනය" : "Web Application Development" },
      { id: "fs-2", href: "/services", label: locale === "si" ? "මෘදුකාංග නිෂ්පාදන සංවර්ධනය" : "Software Product Development" },
      { id: "fs-3", href: "/services", label: locale === "si" ? "ජංගම යෙදුම් සංවර්ධනය" : "Mobile App Development" },
      { id: "fs-4", href: "/growth", label: locale === "si" ? "සමාජ මාධ්‍ය කළමනාකරණය" : "Social Media Setup & Growth" },
    ],
    footerLegalNav: [
      { id: "fl-1", href: "/legal/terms", label: locale === "si" ? "සේවා කොන්දේසි" : "Terms of Use" },
      { id: "fl-2", href: "/legal/privacy", label: locale === "si" ? "පෞද්ගලිකත්ව ප්‍රතිපත්තිය" : "Privacy Policy" },
      { id: "fl-3", href: "/legal/cookies", label: locale === "si" ? "කුකී ප්‍රතිපත්තිය" : "Cookie Policy" },
    ],
    socialLinks: [
      {
        id: "soc-fb",
        platform: "facebook",
        label: "Facebook",
        url: "https://www.facebook.com/profile.php?id=100051284685183",
      },
    ],
  };

  try {
    const [settings, navItems, socials] = await Promise.all([
      prisma.siteSetting.findMany({
        include: { translations: true },
      }),
      prisma.navItem.findMany({
        where: { isVisible: true },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.socialLink.findMany({
        where: { isActive: true },
        include: { translations: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    for (const s of settings) {
      const val = s.valueJson as Record<string, unknown>;
      const transLoc = s.translations.find((t) => t.locale === locale)?.value?.trim();
      const transEn = s.translations.find((t) => t.locale === "en")?.value?.trim();
      const translatedVal = transLoc || transEn;

      switch (s.key) {
        case "brand_name":
          if (typeof val.value === "string" && val.value) defaults.brandName = val.value;
          break;
        case "tagline":
          if (translatedVal) defaults.tagline = translatedVal;
          break;
        case "primary_color":
          if (typeof val.value === "string" && isValidHexColor(val.value)) {
            defaults.primaryColor = val.value;
          }
          break;
        case "secondary_color":
          if (typeof val.value === "string" && isValidHexColor(val.value)) {
            defaults.secondaryColor = val.value;
          }
          break;
        case "contact_email":
          if (typeof val.value === "string" && val.value) defaults.contactEmail = val.value;
          break;
        case "notify_email":
          if (typeof val.value === "string" && val.value) defaults.notifyEmail = val.value;
          break;
        case "whatsapp_number":
          if (typeof val.value === "string" && val.value) defaults.whatsappNumber = val.value;
          break;
        case "whatsapp_message":
          if (translatedVal) defaults.whatsappDefaultMessage = translatedVal;
          break;
        case "phone":
          if (typeof val.value === "string" && val.value) defaults.phone = val.value;
          break;
        case "address":
          if (translatedVal) defaults.address = translatedVal;
          break;
        case "working_hours":
          if (translatedVal) defaults.workingHours = translatedVal;
          break;
        case "feature_toggles":
          if (typeof val.enableFloatingWhatsapp === "boolean")
            defaults.enableFloatingWhatsapp = val.enableFloatingWhatsapp;
          if (typeof val.enable3dHero === "boolean")
            defaults.enable3dHero = val.enable3dHero;
          if (typeof val.enableCustomCursor === "boolean")
            defaults.enableCustomCursor = val.enableCustomCursor;
          if (typeof val.enableFeedback === "boolean")
            defaults.enableFeedback = val.enableFeedback;
          break;
      }
    }

    if (navItems.length > 0) {
      const resolveLabel = (item: (typeof navItems)[number]) => {
        const loc = item.translations.find((t) => t.locale === locale)?.label?.trim();
        const en = item.translations.find((t) => t.locale === "en")?.label?.trim();
        return loc || en || item.href;
      };

      const header = navItems.filter((n) => n.location === "header");
      if (header.length > 0) {
        defaults.headerNav = header.map((n) => ({
          id: n.id,
          href: n.href,
          label: resolveLabel(n),
        }));
      }
      const footerCompany = navItems.filter((n) => n.location === "footer_company");
      if (footerCompany.length > 0) {
        defaults.footerCompanyNav = footerCompany.map((n) => ({
          id: n.id,
          href: n.href,
          label: resolveLabel(n),
        }));
      }
      const footerLegal = navItems.filter((n) => n.location === "footer_legal");
      if (footerLegal.length > 0) {
        defaults.footerLegalNav = footerLegal.map((n) => ({
          id: n.id,
          href: n.href,
          label: resolveLabel(n),
        }));
      }
    }

    if (socials.length > 0) {
      defaults.socialLinks = socials.map((soc) => {
        const loc = soc.translations.find((t) => t.locale === locale)?.label?.trim();
        const en = soc.translations.find((t) => t.locale === "en")?.label?.trim();
        return {
          id: soc.id,
          platform: soc.platform,
          label: loc || en || soc.platform,
          url: soc.url,
        };
      });
    }
  } catch {
    // Return defaults if DB not initialized
  }

  return defaults;
}
