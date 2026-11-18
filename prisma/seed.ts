import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";
import { DEFAULT_UI_STRINGS } from "../src/lib/default-ui-strings";

const prisma = new PrismaClient();

async function hashSeedPassword(plainPassword: string): Promise<string> {
  const pepper = process.env.PASSWORD_PEPPER || "dev-fallback-pepper-minimum-16-chars";
  const peppered = crypto
    .createHmac("sha256", pepper)
    .update(plainPassword)
    .digest("hex");
  return hash(peppered, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    outputLen: 32,
  });
}

async function main() {
  console.info("🌱 Starting Vardhel database seed...");

  // 1. Seed Locales (EN + SI)
  await prisma.locale.upsert({
    where: { code: "en" },
    update: { name: "English", nativeName: "English", isDefault: true, isEnabled: true, sortOrder: 1 },
    create: { code: "en", name: "English", nativeName: "English", isDefault: true, isEnabled: true, sortOrder: 1 },
  });
  await prisma.locale.upsert({
    where: { code: "si" },
    update: { name: "Sinhala", nativeName: "සිංහල", isDefault: false, isEnabled: true, sortOrder: 2 },
    create: { code: "si", name: "Sinhala", nativeName: "සිංහල", isDefault: false, isEnabled: true, sortOrder: 2 },
  });

  // 2. Seed Master Admin from environment variables (Section 7.2 — NEVER hard-code password)
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "codeloom.lk@gmail.com").trim();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "";

  if (adminPassword.length >= 12) {
    const passwordHash = await hashSeedPassword(adminPassword);
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: {
        passwordHash,
        mustChangePassword: true,
        failedAttempts: 0,
        lockedUntil: null,
      },
      create: {
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
        mustChangePassword: true,
      },
    });
    console.info(`✅ Master Admin (${adminEmail}) seeded from SEED_ADMIN_PASSWORD with must_change_password=true.`);
  } else {
    console.warn(
      "⚠️ SEED_ADMIN_PASSWORD is not set or < 12 chars in .env.local. Skipping admin password update (set SEED_ADMIN_PASSWORD in .env.local and re-run npm run db:seed)."
    );
  }

  // 3. Seed UI Strings (EN + SI)
  for (const item of DEFAULT_UI_STRINGS) {
    await prisma.uiString.upsert({
      where: { key_locale: { key: item.key, locale: "en" } },
      update: { group: item.group, description: item.description, defaultVal: item.en },
      create: {
        key: item.key,
        locale: "en",
        value: item.en,
        defaultVal: item.en,
        group: item.group,
        description: item.description,
        needsReview: false,
      },
    });
    await prisma.uiString.upsert({
      where: { key_locale: { key: item.key, locale: "si" } },
      update: { group: item.group, description: item.description, defaultVal: item.si },
      create: {
        key: item.key,
        locale: "si",
        value: item.si,
        defaultVal: item.si,
        group: item.group,
        description: item.description,
        needsReview: true,
      },
    });
  }
  console.info(`✅ Seeded ${DEFAULT_UI_STRINGS.length * 2} UI strings (EN + SI).`);

  // 4. Seed Site Settings & Translations
  const siteSettingsSeed = [
    { key: "brand_name", group: "brand", value: { value: "Vardhel" } },
    {
      key: "tagline",
      group: "brand",
      value: { value: "Your Vision, Our Framework" },
      en: "Your Vision, Our Framework",
      si: "ඔබේ දැක්ම, අපගේ තාක්ෂණික රාමුව",
    },
    { key: "primary_color", group: "brand", value: { value: "#228870" } },
    { key: "secondary_color", group: "brand", value: { value: "#0e192c" } },
    { key: "contact_email", group: "contact", value: { value: "vardhel.official@gmail.com" } },
    { key: "notify_email", group: "contact", value: { value: "vardhel.official@gmail.com" } },
    { key: "whatsapp_number", group: "contact", value: { value: "+94767996381" } },
    {
      key: "whatsapp_message",
      group: "contact",
      value: { value: "Hi Vardhel, I'd like to know more about your solutions." },
      en: "Hi Vardhel, I'd like to know more about your solutions.",
      si: "ආයුබෝවන් Vardhel, ඔබගේ මෘදුකාංග සහ ව්‍යාපාර වර්ධන විසඳුම් පිළිබඳව දැනගැනීමට කැමැත්තෙමි.",
    },
    { key: "phone", group: "contact", value: { value: "+94 76 799 6381" } },
    {
      key: "address",
      group: "contact",
      value: { value: "Sri Lanka" },
      en: "Sri Lanka",
      si: "ශ්‍රී ලංකාව",
    },
    {
      key: "working_hours",
      group: "contact",
      value: { value: "Mon – Fri: 9:00 AM – 6:00 PM (IST)" },
      en: "Mon – Fri: 9:00 AM – 6:00 PM (IST)",
      si: "සඳුදා – සිකුරාදා: පෙ.ව. 9:00 – ප.ව. 6:00",
    },
    {
      key: "feature_toggles",
      group: "features",
      value: {
        enableFloatingWhatsapp: true,
        enable3dHero: true,
        enableCustomCursor: true,
        enableFeedback: true,
      },
    },
  ];

  for (const s of siteSettingsSeed) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { group: s.group, valueJson: s.value },
      create: { key: s.key, group: s.group, valueJson: s.value },
    });
    if (s.en) {
      await prisma.siteSettingTranslation.upsert({
        where: { settingKey_locale: { settingKey: s.key, locale: "en" } },
        update: { value: s.en },
        create: { settingKey: s.key, locale: "en", value: s.en, needsReview: false },
      });
    }
    if (s.si) {
      await prisma.siteSettingTranslation.upsert({
        where: { settingKey_locale: { settingKey: s.key, locale: "si" } },
        update: { value: s.si },
        create: { settingKey: s.key, locale: "si", value: s.si, needsReview: true },
      });
    }
  }

  // 5. Seed Social Links
  await prisma.socialLink.deleteMany({});
  await prisma.socialLink.create({
    data: {
      platform: "facebook",
      url: "https://www.facebook.com/profile.php?id=100051284685183",
      icon: "Facebook",
      sortOrder: 1,
      isActive: true,
      translations: {
        create: [
          { locale: "en", label: "Facebook", needsReview: false },
          { locale: "si", label: "Facebook", needsReview: false },
        ],
      },
    },
  });

  // 6. Seed Home Sections (Orderable / Toggleable)
  const homeSectionsSeed = [
    {
      key: "hero",
      sortOrder: 1,
      enTitle: "Transforming Ideas Into Powerful Software & Growing Businesses",
      enSubtitle:
        "We engineer custom software products and set up & run your social media presence end-to-end so your business thrives after launch.",
      siTitle: "ඔබේ අදහස සාර්ථක ව්‍යාපාරයක් බවට පත් කරන තාක්ෂණික හවුල්කරු",
      siSubtitle:
        "අපි ඔබේ ව්‍යාපාරයට අවශ්‍ය මෘදුකාංග පද්ධතිය නිර්මාණය කරනවා පමණක් නොව, සමාජ මාධ්‍ය හරහා ඔබේ ව්‍යාපාරය අඛණ්ඩව වර්ධනය කිරීමටද පූර්ණ සහාය ලබා දෙන්නෙමු.",
    },
    {
      key: "pillars",
      sortOrder: 2,
      enTitle: "Software Engineering + Social Media Growth",
      enSubtitle: "Why settle for just code when you need customers?",
      siTitle: "මෘදුකාංග ඉංජිනේරුකරණය + සමාජ මාධ්‍ය වර්ධනය",
      siSubtitle: "මෘදුකාංගය සමඟම පාරිභෝගිකයන් දිනාගන්නා සම්පූර්ණ විසඳුම",
    },
    {
      key: "featured_products",
      sortOrder: 3,
      enTitle: "Our Flagship Products",
      enSubtitle: "Purpose-built platforms engineered by Vardhel.",
      siTitle: "අපගේ ප්‍රධාන මෘදුකාංග නිෂ්පාදන",
      siSubtitle: "Vardhel විසින් නිර්මාණය කරන ලද සුවිශේෂී මෘදුකාංග පද්ධති.",
    },
    {
      key: "growth_journey",
      sortOrder: 4,
      enTitle: "From Idea to Continuous Growth",
      enSubtitle: "Our 7-stage end-to-end partnership journey.",
      siTitle: "අදහසේ සිට අඛණ්ඩ ව්‍යාපාර වර්ධනය දක්වා",
      siSubtitle: "අපගේ පියවර 7ක පූර්ණ හවුල්කාරිත්ව ක්‍රියාවලිය.",
    },
    {
      key: "services",
      sortOrder: 5,
      enTitle: "Comprehensive Capabilities",
      enSubtitle: "Custom software, product engineering, and digital growth services.",
      siTitle: "අපගේ සේවාවන්",
      siSubtitle: "මෘදුකාංග සංවර්ධනය, තාක්ෂණික උපදේශනය සහ සමාජ මාධ්‍ය ප්‍රවර්ධනය.",
    },
    {
      key: "projects",
      sortOrder: 6,
      enTitle: "Live Work & Case Studies",
      enSubtitle: "Real systems and social media ecosystems we have delivered.",
      siTitle: "සජීවී ව්‍යාපෘති සහ නිදසුන්",
      siSubtitle: "අප විසින් ගොඩනඟන ලද ව්‍යාපෘති සහ සමාජ මාධ්‍ය වර්ධන කතාන්දර.",
    },
    {
      key: "feedback",
      sortOrder: 7,
      enTitle: "What Our Partners Say",
      enSubtitle: "Verified experiences shared by our clients.",
      siTitle: "පාරිභෝගික අදහස්",
      siSubtitle: "අපගේ සේවාදායකයින් බෙදාගත් සැබෑ අත්දැකීම්.",
    },
    {
      key: "offers",
      sortOrder: 8,
      enTitle: "Tailored Packages & Offers",
      enSubtitle: "Dedicated tracks for growing businesses and academic innovators.",
      siTitle: "විශේෂ දීමනා සහ පැකේජ",
      siSubtitle: "ව්‍යාපාර සහ අධ්‍යාපනික ව්‍යාපෘති සඳහා විශේෂිත විසඳුම්.",
    },
    {
      key: "process",
      sortOrder: 9,
      enTitle: "Your Project, Our Process",
      enSubtitle: "Disciplined engineering from discovery workshop to scale.",
      siTitle: "ඔබේ ව්‍යාපෘතිය, අපගේ ක්‍රියාවලිය",
      siSubtitle: "මූලික සාකච්ඡාවේ සිට දියත් කිරීම දක්වා විධිමත් ඉංජිනේරු ක්‍රියාවලිය.",
    },
    {
      key: "faq",
      sortOrder: 10,
      enTitle: "Frequently Asked Questions",
      enSubtitle: "Everything you need to know about working with Vardhel.",
      siTitle: "නිතර අසන ප්‍රශ්න (FAQ)",
      siSubtitle: "Vardhel සමඟ කටයුතු කිරීම පිළිබඳ වැදගත් තොරතුරු.",
    },
  ];

  for (const hs of homeSectionsSeed) {
    const sec = await prisma.homeSection.upsert({
      where: { key: hs.key },
      update: { sortOrder: hs.sortOrder, isVisible: true },
      create: { key: hs.key, sortOrder: hs.sortOrder, isVisible: true },
    });
    await prisma.homeSectionTranslation.upsert({
      where: { homeSectionId_locale: { homeSectionId: sec.id, locale: "en" } },
      update: { title: hs.enTitle, subtitle: hs.enSubtitle },
      create: {
        homeSectionId: sec.id,
        locale: "en",
        title: hs.enTitle,
        subtitle: hs.enSubtitle,
        needsReview: false,
      },
    });
    await prisma.homeSectionTranslation.upsert({
      where: { homeSectionId_locale: { homeSectionId: sec.id, locale: "si" } },
      update: { title: hs.siTitle, subtitle: hs.siSubtitle },
      create: {
        homeSectionId: sec.id,
        locale: "si",
        title: hs.siTitle,
        subtitle: hs.siSubtitle,
        needsReview: true,
      },
    });
  }

  // 7. Seed Service Categories & 11 Services (8 migrated + 3 new Social Media & Growth)
  const catSoftware = await prisma.serviceCategory.upsert({
    where: { slug: "software-development" },
    update: { sortOrder: 1, icon: "Code2" },
    create: {
      slug: "software-development",
      icon: "Code2",
      sortOrder: 1,
      translations: {
        create: [
          {
            locale: "en",
            name: "Software Development",
            description: "Custom web, mobile, and product engineering tailored to your operations.",
          },
          {
            locale: "si",
            name: "මෘදුකාංග සංවර්ධනය",
            description: "ඔබේ ව්‍යාපාරික අවශ්‍යතාවලට ගැළපෙන වෙබ්, ජංගම සහ මෘදුකාංග පද්ධති.",
            needsReview: true,
          },
        ],
      },
    },
  });

  const catGrowth = await prisma.serviceCategory.upsert({
    where: { slug: "social-media-marketing-growth" },
    update: { sortOrder: 2, icon: "TrendingUp" },
    create: {
      slug: "social-media-marketing-growth",
      icon: "TrendingUp",
      sortOrder: 2,
      translations: {
        create: [
          {
            locale: "en",
            name: "Social Media Marketing & Growth",
            description: "End-to-end social setup, short-video production, and continuous engagement.",
          },
          {
            locale: "si",
            name: "සමාජ මාධ්‍ය අලෙවිකරණය සහ ව්‍යාපාර වර්ධනය",
            description: "සමාජ මාධ්‍ය ගිණුම් පිහිටුවීම, වීඩියෝ නිර්මාණය සහ අඛණ්ඩ ව්‍යාපාර ප්‍රවර්ධනය.",
            needsReview: true,
          },
        ],
      },
    },
  });

  const catConsulting = await prisma.serviceCategory.upsert({
    where: { slug: "consulting-support" },
    update: { sortOrder: 3, icon: "ShieldCheck" },
    create: {
      slug: "consulting-support",
      icon: "ShieldCheck",
      sortOrder: 3,
      translations: {
        create: [
          {
            locale: "en",
            name: "Consulting & Support",
            description: "Architecture advisory, QA, IoT, and long-term maintenance.",
          },
          {
            locale: "si",
            name: "තාක්ෂණික උපදේශනය සහ සහාය",
            description: "තාක්ෂණික උපදේශනය, තත්ත්ව පරීක්ෂාව සහ අඛණ්ඩ නඩත්තු සේවාවන්.",
            needsReview: true,
          },
        ],
      },
    },
  });

  const servicesData = [
    {
      slug: "web-application-development",
      catId: catSoftware.id,
      sortOrder: 1,
      isFeatured: true,
      enTitle: "Web Application Development",
      enShort: "Custom web apps for businesses and enterprises",
      enLong:
        "We build responsive, high-performance web applications tailored to your unique business needs. Our solutions deliver seamless user experiences across all devices, from e-commerce platforms to enterprise products, engineered for security, speed, and growth.",
      enFeatures: [
        "Custom frontend interfaces",
        "Scalable backend systems",
        "Third-party service connections",
        "Cloud hosting solutions",
        "Data protection measures",
      ],
      siTitle: "වෙබ් යෙදුම් සංවර්ධනය (Web Application Development)",
      siShort: "ව්‍යාපාර සහ ආයතන සඳහා සුවිශේෂී වෙබ් යෙදුම්",
      siLong:
        "ඔබේ ව්‍යාපාරික අවශ්‍යතාවලට ගැළපෙන වේගවත්, ආරක්ෂිත සහ ඕනෑම උපාංගයකට ඔරොත්තු දෙන නවීන වෙබ් යෙදුම් අපි නිර්මාණය කරන්නෙමු.",
      siFeatures: [
        "ආකර්ෂණීය පරිශීලක අතුරුමුහුණත්",
        "පුළුල් කළ හැකි පසුබිම් පද්ධති (Scalable Backends)",
        "බාහිර සේවා සම්බන්ධතා (API Integrations)",
        "ක්ලවුඩ් සත්කාරක විසඳුම් (Cloud Hosting)",
        "ඉහළ දත්ත ආරක්ෂාව",
      ],
    },
    {
      slug: "software-product-development",
      catId: catSoftware.id,
      sortOrder: 2,
      isFeatured: true,
      enTitle: "Software Product Development",
      enShort: "End-to-end solutions from idea to product",
      enLong:
        "Turn your vision into a market-ready product with our comprehensive development process. We specialize in taking concepts from initial ideation through prototype development to full-scale deployment, ensuring solutions that truly solve your target audience's needs.",
      enFeatures: [
        "Minimum viable product creation",
        "Multiple platform compatibility",
        "Flexible development approach",
        "Speed and efficiency enhancements",
        "Usage tracking and reporting",
      ],
      siTitle: "මෘදුකාංග නිෂ්පාදන සංවර්ධනය",
      siShort: "අදහසේ සිට වෙළඳපොළට සූදානම් නිෂ්පාදනයක් දක්වා",
      siLong:
        "ඔබේ නව අදහස මූලික ආකෘතියේ (MVP) සිට සම්පූර්ණ වාණිජ මෘදුකාංග නිෂ්පාදනයක් දක්වා ගොඩනැගීමට අපි පූර්ණ තාක්ෂණික දායකත්වය ලබා දෙන්නෙමු.",
      siFeatures: [
        "MVP ආකෘති නිර්මාණය",
        "බහු-වේදිකා අනුකූලතාව",
        "නම්‍යශීලී සංවර්ධන ක්‍රමවේදය",
        "ඉහළ වේගය සහ කාර්යක්ෂමතාව",
        "භාවිත වාර්තා සහ විශ්ලේෂණ",
      ],
    },
    {
      slug: "mobile-application-development",
      catId: catSoftware.id,
      sortOrder: 3,
      isFeatured: true,
      enTitle: "Mobile Application Development",
      enShort: "iOS & Android apps with native/hybrid approaches",
      enLong:
        "We craft applications that users love and engage with daily. Our apps are optimized for all device sizes, with offline capabilities and seamless backend integration, following platform-specific design guidelines for intuitive usability.",
      enFeatures: [
        "Platform-specific app development",
        "Cross-platform solutions",
        "Mobile user experience refinement",
        "Offline operation capabilities",
        "Store submission assistance",
      ],
      siTitle: "ජංගම යෙදුම් සංවර්ධනය (iOS & Android)",
      siShort: "iOS සහ Android සඳහා නවීන ජංගම යෙදුම්",
      siLong:
        "පරිශීලකයින් දිනපතා ප්‍රිය කරන වේගවත් සහ පහසු ජංගම යෙදුම් (Mobile Apps) අපි iOS සහ Android වේදිකා සඳහා නිර්මාණය කරන්නෙමු.",
      siFeatures: [
        "iOS සහ Android යෙදුම් නිර්මාණය",
        "Cross-platform විසඳුම්",
        "සුවිශේෂී ජංගම අත්දැකීම",
        "අන්තර්ජාලය නොමැතිව ක්‍රියාත්මක වීමේ හැකියාව",
        "App Store / Play Store පළ කිරීමේ සහාය",
      ],
    },
    {
      slug: "ux-engineering",
      catId: catSoftware.id,
      sortOrder: 4,
      isFeatured: false,
      enTitle: "UX Engineering",
      enShort: "Human-centered digital experiences",
      enLong:
        "We design interfaces that don't just work, but delight. Through user research, iterative prototyping, and accessibility-focused development, we create intuitive experiences that drive engagement and conversion across all devices and user scenarios.",
      enFeatures: [
        "User behavior analysis",
        "Interactive element design",
        "Universal access compliance",
        "Visual consistency systems",
        "Loading speed optimization",
      ],
      siTitle: "UX ඉංජිනේරුකරණය සහ අතුරුමුහුණත් නිර්මාණය",
      siShort: "පරිශීලක කේන්ද්‍රීය ඩිජිටල් අත්දැකීම්",
      siLong:
        "පරිශීලක පර්යේෂණ සහ නවීන මූලාකෘති හරහා ඕනෑම අයෙකුට පහසුවෙන් භාවිතා කළ හැකි ආකර්ෂණීය අතුරුමුහුණත් අපි නිර්මාණය කරන්නෙමු.",
      siFeatures: [
        "පරිශීලක හැසිරීම් විශ්ලේෂණය",
        "අන්තර්ක්‍රියාකාරී නිර්මාණ",
        "සැමට ප්‍රවේශ විය හැකි ප්‍රමිතීන් (Accessibility)",
        "Design Systems ගොඩනැගීම",
        "වේගවත් ක්‍රියාකාරිත්වය",
      ],
    },
    {
      slug: "social-media-setup-management",
      catId: catGrowth.id,
      sortOrder: 5,
      isFeatured: true,
      enTitle: "Social Media Setup & Management (Draft)",
      enShort: "End-to-end setup and management across Facebook, Instagram, TikTok & TripAdvisor",
      enLong:
        "Launching software is only step one. We create, brand, optimize, and manage your official business profiles across Facebook, Instagram, TikTok, and TripAdvisor—publishing consistent, high-converting posts so customers discover and trust your business.",
      enFeatures: [
        "Facebook, Instagram, TikTok & TripAdvisor setup",
        "Brand identity & profile optimization",
        "Content calendar & consistent publishing",
        "Community engagement & enquiry routing",
        "Monthly growth review & analytics",
      ],
      siTitle: "සමාජ මාධ්‍ය ගිණුම් පිහිටුවීම සහ කළමනාකරණය (Draft)",
      siShort: "Facebook, Instagram, TikTok සහ TripAdvisor හරහා ව්‍යාපාර ප්‍රවර්ධනය",
      siLong:
        "මෘදුකාංගය දියත් කිරීමෙන් පසු ඔබේ ව්‍යාපාරය පාරිභෝගිකයන් අතරට ගෙන යාමට Facebook, Instagram, TikTok සහ TripAdvisor ගිණුම් නිසි ලෙස සකස් කර අඛණ්ඩව කළමනාකරණය කරන්නෙමු.",
      siFeatures: [
        "Facebook, Instagram, TikTok සහ TripAdvisor පිහිටුවීම",
        "සන්නාමකරණය සහ පැතිකඩ ප්‍රශස්තකරණය",
        "සැලසුම්සහගත ලිපි සහ පෝස්ට් පළ කිරීම",
        "පාරිභෝගික ප්‍රතිචාර කළමනාකරණය",
        "මාසික වර්ධන වාර්තා",
      ],
    },
    {
      slug: "content-short-video-production",
      catId: catGrowth.id,
      sortOrder: 6,
      isFeatured: true,
      enTitle: "Content & Short-Video Production (Draft)",
      enShort: "Engaging Reels, TikToks, and visual posts designed to attract real customers",
      enLong:
        "Modern businesses grow through compelling short-form video and storytelling. Our creative team plans, scripts, edits, and publishes attention-grabbing Reels, TikTok videos, and carousel posts that showcase your services and drive bookings.",
      enFeatures: [
        "Short-form video editing (Reels / TikTok / Shorts)",
        "Branded graphic posts & carousels",
        "Product & service showcase storytelling",
        "Captions, hooks, and hashtag strategy",
        "Multi-platform publishing workflow",
      ],
      siTitle: "අන්තර්ගත සහ කෙටි වීඩියෝ නිර්මාණය (Draft)",
      siShort: "පාරිභෝගික ආකර්ෂණය දිනාගන්නා Reels, TikTok සහ නිර්මාණාත්මක පෝස්ට්",
      siLong:
        "ඔබේ සේවාවන් සහ නිෂ්පාදන පාරිභෝගිකයන් වෙත සමීප කරවන ආකර්ෂණීය කෙටි වීඩියෝ (Reels / TikTok) සහ ග්‍රැෆික් නිර්මාණ අපි සකස් කර පළ කරන්නෙමු.",
      siFeatures: [
        "කෙටි වීඩියෝ සංස්කරණය (Reels / TikTok)",
        "සන්නාමගත ග්‍රැෆික් පෝස්ට්",
        "සේවා සහ නිෂ්පාදන හඳුන්වාදීමේ වීඩියෝ",
        "ආකර්ෂණීය විස්තර සහ Hashtag උපායමාර්ග",
        "සියලුම සමාජ මාධ්‍ය ජාලවල පළ කිරීම",
      ],
    },
    {
      slug: "digital-growth-strategy",
      catId: catGrowth.id,
      sortOrder: 7,
      isFeatured: true,
      enTitle: "Digital Growth Strategy & Knowledge Transfer (Draft)",
      enShort: "A clear roadmap and hands-on training so your team can sustain momentum",
      enLong:
        "We study your market, recommend the right technology stack and digital channels, and equip you with a sustainable playbook. We transfer practical knowledge so your team can confidently engage customers and keep scaling.",
      enFeatures: [
        "Business & market discovery workshop",
        "Technology & channel recommendation",
        "Conversion funnel optimization (Website → WhatsApp)",
        "Hands-on owner & team training",
        "Continuous growth roadmap",
      ],
      siTitle: "ඩිජිටල් වර්ධන උපායමාර්ග සහ දැනුම හුවමාරුව (Draft)",
      siShort: "ඔබේ ව්‍යාපාරය අඛණ්ඩව ඉදිරියට ගෙන යාමට අවශ්‍ය මඟපෙන්වීම සහ පුහුණුව",
      siLong:
        "ඔබේ වෙළඳපොළ අධ්‍යයනය කර නිවැරදි තාක්ෂණය සහ අලෙවිකරණ මාර්ග හඳුන්වා දෙන අතර, ඔබේ කණ්ඩායමට එය ඉදිරියටම පවත්වාගෙන යාමට අවශ්‍ය දැනුම සහ සැලැස්ම ලබා දෙන්නෙමු.",
      siFeatures: [
        "ව්‍යාපාර සහ වෙළඳපොළ විශ්ලේෂණය",
        "නවීන තාක්ෂණික නිර්දේශ",
        "වෙබ් අඩවියේ සිට WhatsApp දක්වා පාරිභෝගික ප්‍රවාහය",
        "ප්‍රායෝගික පුහුණුව සහ මඟපෙන්වීම",
        "දිගුකාලීන වර්ධන සැලැස්ම",
      ],
    },
    {
      slug: "testing-quality-assurance",
      catId: catConsulting.id,
      sortOrder: 8,
      isFeatured: false,
      enTitle: "Testing & Quality Assurance",
      enShort: "Comprehensive quality assurance services",
      enLong:
        "Our rigorous process ensures your software performs flawlessly under all conditions. We combine automated checks with manual testing to identify issues early, while performance and security verification guarantee your application can handle real-world demands.",
      enFeatures: [
        "Automated test scripts",
        "System speed evaluation",
        "Vulnerability assessments",
        "Multi-device verification",
        "Development pipeline integration",
      ],
      siTitle: "මෘදුකාංග පරීක්ෂාව සහ තත්ත්ව සහතිකය (QA)",
      siShort: "විශ්වසනීය සහ දෝෂ රහිත මෘදුකාංග සඳහා පූර්ණ තත්ත්ව පරීක්ෂාව",
      siLong:
        "ස්වයංක්‍රීය සහ අත්හදාබැලීමේ පරීක්ෂණ හරහා ඔබේ මෘදුකාංගයේ වේගය, ආරක්ෂාව සහ ගුණාත්මකභාවය ඉහළම මට්ටමක පවතින බව අපි තහවුරු කරන්නෙමු.",
      siFeatures: [
        "ස්වයංක්‍රීය පරීක්ෂණ (Automated Testing)",
        "පද්ධති වේග පරීක්ෂාව",
        "ආරක්ෂක දුර්වලතා පරීක්ෂාව (VAPT mindset)",
        "සියලුම උපාංගවල ක්‍රියාකාරිත්වය තහවුරු කිරීම",
        "CI/CD පද්ධති සමඟ ඒකාබද්ධ කිරීම",
      ],
    },
    {
      slug: "maintenance-support",
      catId: catConsulting.id,
      sortOrder: 9,
      isFeatured: false,
      enTitle: "Maintenance & Support",
      enShort: "Ongoing software care and updates",
      enLong:
        "Our services ensure your software remains secure, current, and optimized as your business evolves. From critical updates to performance improvements and feature expansions, we provide reliable support tailored to your needs.",
      enFeatures: [
        "Continuous system monitoring",
        "Critical updates application",
        "Speed and efficiency improvements",
        "Priority assistance channels",
        "System documentation updates",
      ],
      siTitle: "නඩත්තු සහ අඛණ්ඩ තාක්ෂණික සහාය",
      siShort: "ඔබේ මෘදුකාංගය සැමවිටම යාවත්කාලීනව සහ ආරක්ෂිතව පවත්වා ගැනීම",
      siLong:
        "ඔබේ ව්‍යාපාරය වර්ධනය වන විට මෘදුකාංගයේ ආරක්ෂක යාවත්කාලීන කිරීම්, වේගය වැඩිදියුණු කිරීම් සහ නව විශේෂාංග එක් කිරීම් සඳහා අපි අඛණ්ඩව සහාය වන්නෙමු.",
      siFeatures: [
        "අඛණ්ඩ පද්ධති අධීක්ෂණය",
        "ආරක්ෂක යාවත්කාලීන කිරීම්",
        "කාර්යක්ෂමතාව වැඩිදියුණු කිරීම",
        "කඩිනම් තාක්ෂණික සහාය",
        "පද්ධති ලේඛන යාවත්කාලීන කිරීම",
      ],
    },
    {
      slug: "iot-development",
      catId: catConsulting.id,
      sortOrder: 10,
      isFeatured: false,
      enTitle: "IoT Development",
      enShort: "Connected solutions for smart environments",
      enLong:
        "Bridge the physical and digital worlds with our expertise. We develop complete ecosystems that collect, analyze, and act on data in real time, prioritizing reliability, security, and actionable insights from your connected devices.",
      enFeatures: [
        "Local data processing",
        "Device connectivity solutions",
        "Live monitoring interfaces",
        "Device network management",
        "Data pattern forecasting",
      ],
      siTitle: "IoT සහ ස්මාර්ට් උපාංග පද්ධති සංවර්ධනය",
      siShort: "භෞතික උපාංග සහ මෘදුකාංග යා කරන ස්මාර්ට් විසඳුම්",
      siLong:
        "සංවේදක සහ ස්මාර්ට් උපාංග හරහා සජීවීව දත්ත රැස් කරන, විශ්ලේෂණය කරන සහ පාලනය කරන ආරක්ෂිත IoT පද්ධති අපි ගොඩනඟන්නෙමු.",
      siFeatures: [
        "දත්ත සැකසුම් පද්ධති",
        "උපාංග සම්බන්ධතා විසඳුම්",
        "සජීවී නිරීක්ෂණ පුවරු (Live Dashboards)",
        "උපාංග ජාල කළමනාකරණය",
        "දත්ත විශ්ලේෂණය සහ පුරෝකථනය",
      ],
    },
    {
      slug: "technical-consulting",
      catId: catConsulting.id,
      sortOrder: 11,
      isFeatured: false,
      enTitle: "Technical Consulting",
      enShort: "Strategic guidance for technology initiatives",
      enLong:
        "Navigate complex technology decisions with confidence. Our services provide the expertise you need to evaluate system structures, select optimal solutions, and plan scalable growth while aligning with business goals.",
      enFeatures: [
        "System structure evaluation",
        "Technology stack analysis",
        "Growth planning",
        "Expert team supplementation",
        "Leadership-level guidance",
      ],
      siTitle: "තාක්ෂණික උපදේශන සේවා",
      siShort: "නිවැරදි තාක්ෂණික තීරණ ගැනීම සඳහා විශේෂඥ මඟපෙන්වීම",
      siLong:
        "ඔබේ ව්‍යාපාරික අරමුණුවලට ගැළපෙනම තාක්ෂණය තෝරා ගැනීමට, පද්ධති ව්‍යුහය පරීක්ෂා කිරීමට සහ ආරක්ෂිතව ව්‍යාපාරය පුළුල් කිරීමට අපි උපදේශනය ලබා දෙන්නෙමු.",
      siFeatures: [
        "පද්ධති ව්‍යුහ ඇගයීම",
        "තාක්ෂණික තේරීම් විශ්ලේෂණය",
        "වර්ධන සැලසුම්කරණය",
        "විශේෂඥ ඉංජිනේරු සහාය",
        "උපායමාර්ගික තාක්ෂණික මඟපෙන්වීම",
      ],
    },
  ];

  for (const s of servicesData) {
    const svc = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        categoryId: s.catId,
        sortOrder: s.sortOrder,
        isFeatured: s.isFeatured,
        isPublished: true,
      },
      create: {
        slug: s.slug,
        categoryId: s.catId,
        sortOrder: s.sortOrder,
        isFeatured: s.isFeatured,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    await prisma.serviceTranslation.upsert({
      where: { serviceId_locale: { serviceId: svc.id, locale: "en" } },
      update: {
        title: s.enTitle,
        shortDescription: s.enShort,
        longDescription: `<p>${s.enLong}</p>`,
        featuresJson: s.enFeatures,
      },
      create: {
        serviceId: svc.id,
        locale: "en",
        title: s.enTitle,
        shortDescription: s.enShort,
        longDescription: `<p>${s.enLong}</p>`,
        featuresJson: s.enFeatures,
        needsReview: false,
      },
    });

    await prisma.serviceTranslation.upsert({
      where: { serviceId_locale: { serviceId: svc.id, locale: "si" } },
      update: {
        title: s.siTitle,
        shortDescription: s.siShort,
        longDescription: `<p>${s.siLong}</p>`,
        featuresJson: s.siFeatures,
      },
      create: {
        serviceId: svc.id,
        locale: "si",
        title: s.siTitle,
        shortDescription: s.siShort,
        longDescription: `<p>${s.siLong}</p>`,
        featuresJson: s.siFeatures,
        needsReview: true,
      },
    });
  }
  console.info(`✅ Seeded 3 service categories and ${servicesData.length} services.`);

  // 8. Seed Media for Products & Brand
  const mediaItems = [
    {
      id: "media-eventloom-logo",
      publicUrl: "/assets/img/eventloom_logo.png",
      altText: "EventLoom Logo",
    },
    {
      id: "media-eventloom-cover",
      publicUrl: "/assets/img/eventloom_cover.png",
      altText: "EventLoom Event Management Platform Cover",
    },
    {
      id: "media-captureloom-logo",
      publicUrl: "/assets/img/captureloom_logo.png",
      altText: "CaptureLoom Logo",
    },
    {
      id: "media-captureloom-cover",
      publicUrl: "/assets/img/captureloom_cover.jpg",
      altText: "CaptureLoom Photography Studio Management Cover",
    },
    {
      id: "media-promoloom-logo",
      publicUrl: "/assets/img/promoloom_logo.png",
      altText: "PromoLoom Logo",
    },
    {
      id: "media-promoloom-cover",
      publicUrl: "/assets/img/promoloom_cover.png",
      altText: "PromoLoom AI Event Promotion & Ticketing Cover",
    },
  ];

  for (const m of mediaItems) {
    await prisma.media.upsert({
      where: { id: m.id },
      update: { publicUrl: m.publicUrl, altText: m.altText },
      create: {
        id: m.id,
        type: "image",
        storagePath: m.publicUrl,
        publicUrl: m.publicUrl,
        mime: m.publicUrl.endsWith(".jpg") ? "image/jpeg" : "image/png",
        size: 102400,
        altText: m.altText,
      },
    });
  }

  // 9. Seed Product Category & 3 Flagship Products (EventLoom, CaptureLoom, PromoLoom)
  const prodCat = await prisma.productCategory.upsert({
    where: { slug: "business-platforms" },
    update: { sortOrder: 1 },
    create: {
      slug: "business-platforms",
      icon: "Layers",
      sortOrder: 1,
      translations: {
        create: [
          {
            locale: "en",
            name: "SaaS & Business Platforms",
            description: "Vertical software platforms built by Vardhel.",
          },
          {
            locale: "si",
            name: "ව්‍යාපාරික මෘදුකාංග පද්ධති",
            description: "Vardhel විසින් නිර්මාණය කළ ව්‍යාපාර කළමනාකරණ පද්ධති.",
            needsReview: true,
          },
        ],
      },
    },
  });

  const productsSeed = [
    {
      slug: "eventloom",
      logoId: "media-eventloom-logo",
      coverId: "media-eventloom-cover",
      sortOrder: 1,
      techStack: ["React", "TypeScript", "Node.js", "MySQL", "Tailwind CSS", "3D Blueprint Preview"],
      en: {
        name: "EventLoom",
        tagline: "Your one-stop solution for managing events, inventory, and more.",
        short:
          "Our platform is designed to help you streamline your operations and make wedding, birthday, and corporate event planning a breeze.",
        long: `<p>EventLoom is a comprehensive event management platform designed to streamline the planning and execution of events such as weddings and birthdays. The system caters to three key user roles: Customers, who can browse and book customizable event packages; Administrators, who manage users, inventory, orders, and payments; and Event Organizers, who create and oversee event setups. With features like package customization, delivery fee calculations, payment tracking, and inventory management, EventLoom ensures a seamless experience for both clients and administrators.</p><p>EventLoom simplifies the entire event planning process by offering pre-defined packages (Basic, Pro, Premium) that customers can tailor to their needs. Once a booking request is submitted, admins review and approve it before processing payments and coordinating deliveries. The system also handles refundable items, sending email notifications at each stage—from order confirmation to payment verification and delivery completion.</p>`,
        audience: "Event planning companies, wedding & party organizers, rental inventory businesses, and venues.",
      },
      si: {
        name: "EventLoom",
        tagline: "උත්සව සැලසුම් කිරීම, භාණ්ඩ තොග සහ ඇණවුම් කළමනාකරණය සඳහා එකම විසඳුම.",
        short:
          "මංගල උත්සව, උපන්දින සාද සහ ආයතනික උත්සව සැලසුම් කිරීමේ සිට භාණ්ඩ බෙදාහැරීම දක්වා සියලුම කටයුතු පහසු කරන පද්ධතියකි.",
        long: `<p>EventLoom යනු මංගල උත්සව සහ උපන්දින සාද වැනි උත්සව සැලසුම් කිරීම සහ කළමනාකරණය පහසු කිරීම සඳහා නිර්මාණය කරන ලද පූර්ණ මෘදුකාංග පද්ධතියකි. පාරිභෝගිකයින්, පරිපාලකයින් (Admins) සහ උත්සව සංවිධායකයින් යන පාර්ශව තුනම එකම වේදිකාවකින් සම්බන්ධ කරයි.</p><p>පැකේජ තෝරාගැනීම, දිස්ත්‍රික්කය අනුව ප්‍රවාහන ගාස්තු ගණනය කිරීම, බැංකු රිසිට්පත් මඟින් ගෙවීම් තහවුරු කිරීම සහ 3D සැලසුම් පෙරදසුන ඇතුළු සුවිශේෂී පහසුකම් රැසකින් සමන්විත වේ.</p>`,
        audience: "උත්සව සංවිධායකයින්, උත්සව භාණ්ඩ කුලියට දෙන ආයතන සහ උත්සව ශාලා හිමියන් සඳහා.",
      },
      features: [
        {
          enTitle: "Multi-Role Access",
          enDesc: "Three user types: Customers, Admins, and Event Organizers with tailored dashboards.",
          siTitle: "බහු-පරිශීලක ප්‍රවේශය",
          siDesc: "පාරිභෝගිකයින්, පරිපාලකයින් සහ සංවිධායකයින් සඳහා වෙන්වූ පාලන පුවරු.",
        },
        {
          enTitle: "Event Package Customization",
          enDesc: "Predefined Birthday & Wedding packages (Basic, Pro, Premium) with configurable add-ons.",
          siTitle: "උත්සව පැකේජ අභිරුචිකරණය",
          siDesc: "මංගල සහ උපන්දින පැකේජ (Basic, Pro, Premium) අවශ්‍ය පරිදි වෙනස් කරගැනීමේ පහසුව.",
        },
        {
          enTitle: "Order & Payment Management",
          enDesc: "Request approval workflow, partial/full payment via slip upload, and refund tracking.",
          siTitle: "ඇණවුම් සහ ගෙවීම් කළමනාකරණය",
          siDesc: "බැංකු රිසිට්පත් (Slip Upload) මඟින් කොටස් වශයෙන් හෝ සම්පූර්ණ ගෙවීම් පරීක්ෂා කිරීම.",
        },
        {
          enTitle: "Dynamic Delivery Pricing",
          enDesc: "Automatic delivery fee calculation based on district.",
          siTitle: "ස්වයංක්‍රීය ප්‍රවාහන ගාස්තු ගණනය",
          siDesc: "දිස්ත්‍රික්කය පදනම් කරගෙන ස්වයංක්‍රීයව ප්‍රවාහන ගාස්තු ගණනය කිරීම.",
        },
        {
          enTitle: "Inventory & Refund Tracking",
          enDesc: "Real-time stock monitoring with refundable item management.",
          siTitle: "භාණ්ඩ තොග සහ ආපසු භාරදීම් නිරීක්ෂණය",
          siDesc: "තත්‍ය කාලීන තොග පරීක්ෂාව සහ නැවත ලබාදිය යුතු භාණ්ඩ කළමනාකරණය.",
        },
        {
          enTitle: "Automated Notifications",
          enDesc: "Email alerts for order status updates, payments, and refunds.",
          siTitle: "ස්වයංක්‍රීය දැනුම්දීම්",
          siDesc: "ඇණවුම් තත්ත්වය සහ ගෙවීම් පිළිබඳ ස්වයංක්‍රීය විද්‍යුත් තැපැල් පණිවිඩ.",
        },
        {
          enTitle: "Admin Control Panel",
          enDesc: "Centralized management for users, events, packages, orders, and reports.",
          siTitle: "ප්‍රධාන පරිපාලන පුවරුව",
          siDesc: "පරිශීලකයින්, පැකේජ, ඇණවුම් සහ මූල්‍ය වාර්තා එක් තැනකින් පාලනය කිරීම.",
        },
        {
          enTitle: "Reporting & Analytics",
          enDesc: "System user logs, inventory status, and financial insights.",
          siTitle: "වාර්තා සහ දත්ත විශ්ලේෂණය",
          siDesc: "භාණ්ඩ තොග සහ මූල්‍ය තත්ත්වය පිළිබඳ සවිස්තරාත්මක වාර්තා.",
        },
        {
          enTitle: "Secure Authentication",
          enDesc: "Role-based access, password policies, and user activity tracking.",
          siTitle: "ආරක්ෂිත පිවිසුම් පද්ධතිය",
          siDesc: "භූමිකාව අනුව අවසර ලබාදීම සහ ක්‍රියාකාරකම් සටහන් කිරීම.",
        },
        {
          enTitle: "CSV-Based Grouping Tool",
          enDesc: "Automated attendee grouping (Random, Age, Family, Job Role) with PDF export.",
          siTitle: "සහභාගිවන්නන් කාණ්ඩගත කිරීමේ මෙවලම",
          siDesc: "CSV දත්ත මඟින් අමුත්තන් කාණ්ඩගත කර PDF ලෙස ලබාගැනීමේ පහසුව.",
        },
        {
          enTitle: "Blueprint Designer",
          enDesc: "Visualize your perfect event setup with live 3D previews that update as you make changes.",
          siTitle: "3D උත්සව සැලසුම් නිර්මාණකරු",
          siDesc: "උත්සව භූමියේ සැකැස්ම සජීවී 3D පෙරදසුනක් ලෙස නිර්මාණය කිරීමේ හැකියාව.",
        },
      ],
    },
    {
      slug: "captureloom",
      logoId: "media-captureloom-logo",
      coverId: "media-captureloom-cover",
      sortOrder: 2,
      techStack: ["React", "TypeScript", "Node.js", "Cloud Storage", "RBAC", "Calendar Engine"],
      en: {
        name: "CaptureLoom",
        tagline: "Weave Perfection into Every Shoot – The Photographer’s Command Center",
        short:
          "Built for studios, freelancers, and event photographers to automate team assignments, gear tracking, and client review workflows.",
        long: `<p>CaptureLoom redefines photography business management by merging granular role-based control with end-to-end workflow automation. Designed for both solo photographers and large studios, our platform eliminates chaotic spreadsheets and miscommunication with tools for team assignments, inventory tracking, and AI-driven booking reminders. Whether you’re shooting weddings, corporate events, or portraits, CaptureLoom ensures every detail—from gear allocation to client invoices—is flawlessly orchestrated.</p><p>Unlike generic scheduling tools, CaptureLoom caters specifically to photography’s unique demands, like equipment dependencies, multi-member teams, and client review workflows. With features like dynamic package builders, team-based RBAC, and integrated photo delivery, we empower photographers to focus on creativity—not admin chaos.</p>`,
        audience: "Wedding & event photography studios, commercial photographers, and videography teams.",
      },
      si: {
        name: "CaptureLoom",
        tagline: "ඡායාරූපකරණ ව්‍යාපාර කළමනාකරණය සඳහාම නිර්මාණය වූ පද්ධතිය",
        short:
          "ඡායාරූප ශාලා (Studios) සහ ඡායාරූප ශිල්පීන් සඳහා කණ්ඩායම් අනුයුක්ත කිරීම, කැමරා උපකරණ නිරීක්ෂණය සහ පාරිභෝගික ඇණවුම් කළමනාකරණය.",
        long: `<p>CaptureLoom යනු තනි ඡායාරූප ශිල්පීන්ගේ සිට විශාල ඡායාරූප ආයතන දක්වා සියලුම පරිපාලන කටයුතු ස්වයංක්‍රීය කරන පද්ධතියකි. කණ්ඩායම් සඳහා රාජකාරි පැවරීම, කැමරා සහ උපකරණ තොග පරීක්ෂාව සහ ස්වයංක්‍රීය සිහිකැඳවීම් මඟින් ව්‍යාපාරික කටයුතු ඉතා විධිමත් කරයි.</p><p>පැකේජ නිර්මාණය, ඡායාරූප ආරක්ෂිතව පාරිභෝගිකයාට ලබාදීම සහ ආදායම් විශ්ලේෂණය ඇතුළු ඡායාරූපකරණ ක්ෂේත්‍රයටම ආවේණික විශේෂාංග රැසකින් සමන්විතයි.</p>`,
        audience: "මංගල සහ උත්සව ඡායාරූප ශිල්පීන්, ඡායාරූප ආයතන (Studios) සහ වීඩියෝකරණ කණ්ඩායම් සඳහා.",
      },
      features: [
        {
          enTitle: "Role-Based Workflow Control",
          enDesc: "Predefined roles (Admin, Photographer, Assistant) with tiered permissions for teams or solo pros.",
          siTitle: "භූමිකාවන් අනුව කාර්ය පාලනය",
          siDesc: "පරිපාලක, ප්‍රධාන ඡායාරූප ශිල්පී සහ සහායකයින් සඳහා වෙන්වූ අවසර මට්ටම්.",
        },
        {
          enTitle: "Smart Package Builder",
          enDesc: "Create customizable packages (Gold/Silver/Bronze) with add-ons, galleries, and dynamic pricing.",
          siTitle: "ස්මාර්ට් පැකේජ නිර්මාණය",
          siDesc: "Gold/Silver/Bronze පැකේජ සහ අමතර සේවාවන් පහසුවෙන් සකස් කිරීම.",
        },
        {
          enTitle: "Team-Centric Job Assignments",
          enDesc: "Assign shoots to teams or individuals with equipment requirements and deadlines.",
          siTitle: "කණ්ඩායම් සඳහා කාර්යයන් පැවරීම",
          siDesc: "අවශ්‍ය කැමරා උපකරණ සහ කාලසටහන් සමඟ කණ්ඩායම්වලට රූගත කිරීම් පැවරීම.",
        },
        {
          enTitle: "Equipment Tracking System",
          enDesc: "Track gear usage, assign tools to teams, and receive low-inventory alerts.",
          siTitle: "කැමරා සහ උපකරණ නිරීක්ෂණය",
          siDesc: "උපකරණ භාවිතය සහ කණ්ඩායම් වෙත නිකුත් කළ උපකරණ පිළිබඳ නිවැරදි සටහන්.",
        },
        {
          enTitle: "Unified Booking Hub",
          enDesc: "Client-facing calendar for appointments, with automated reminders and payment follow-ups.",
          siTitle: "ඒකාබද්ධ දින වෙන්කිරීමේ පද්ධතිය",
          siDesc: "පාරිභෝගික දින වෙන්කිරීම් සහ ස්වයංක්‍රීය සිහිකැඳවීම්.",
        },
        {
          enTitle: "Photo Delivery & Reviews",
          enDesc: "Securely share files with clients and collect public/private feedback.",
          siTitle: "ඡායාරූප ලබාදීම සහ පාරිභෝගික අදහස්",
          siDesc: "පාරිභෝගිකයින් වෙත ආරක්ෂිතව ඡායාරූප ලබාදීම සහ ප්‍රතිචාර රැස් කිරීම.",
        },
        {
          enTitle: "Revenue Analytics",
          enDesc: "Track earnings by session type, photographer, or time period with visual dashboards.",
          siTitle: "ආදායම් විශ්ලේෂණ පුවරුව",
          siDesc: "උත්සව වර්ගය, ඡායාරූප ශිල්පියා හෝ කාලසීමාව අනුව ආදායම් වාර්තා.",
        },
        {
          enTitle: "Integrated Messaging",
          enDesc: "In-app communication for teams and clients, with task reminders and shoot updates.",
          siTitle: "අභ්‍යන්තර පණිවිඩ හුවමාරුව",
          siDesc: "කණ්ඩායම සහ පාරිභෝගිකයින් අතර සන්නිවේදනය සහ කාර්ය යාවත්කාලීන කිරීම්.",
        },
      ],
    },
    {
      slug: "promoloom",
      logoId: "media-promoloom-logo",
      coverId: "media-promoloom-cover",
      sortOrder: 3,
      techStack: ["Next.js", "TypeScript", "AI Campaign Engine", "Social APIs", "Dynamic Ticketing"],
      en: {
        name: "PromoLoom",
        tagline: "Go Viral or Go Home – AI-Powered Event Promotion & Ticketing",
        short:
          "Built for clubs, artists, promoters, and venues to merge social virality with dynamic ticketing and real-time ROI tracking.",
        long: `<p>PromoLoom is the all-in-one event marketing platform designed to turn every event into a viral sensation. Powered by AI-driven hype tools, dynamic ticketing, and real-time analytics, we help clubs, promoters, artists, and brands cut through the noise and sell out events faster. Whether you're launching a music festival, hosting a corporate conference, or organizing a local party, PromoLoom automates the heavy lifting—from TikTok-style promo videos to smart audience targeting—so you can focus on delivering unforgettable experiences.</p><p>Unlike traditional event platforms, PromoLoom merges social virality with seamless ticketing, giving organizers the power to boost engagement, maximize ticket sales, and track ROI in real time. With features like VIP passes, influencer collaboration hubs, and AR filters, we bridge the gap between online hype and real-world attendance.</p>`,
        audience: "Event promoters, concert organizers, hospitality venues, artists, and marketing agencies.",
      },
      si: {
        name: "PromoLoom",
        tagline: "AI බලයෙන් ක්‍රියාත්මක වන උත්සව ප්‍රවර්ධන සහ ප්‍රවේශපත්‍ර පද්ධතිය",
        short:
          "සංගීත ප්‍රසංග, ආයතනික සම්මන්ත්‍රණ සහ විශේෂ උත්සව සමාජ මාධ්‍ය හරහා වේගයෙන් ප්‍රවර්ධනය කර ප්‍රවේශපත්‍ර අලෙවි කිරීමේ පද්ධතිය.",
        long: `<p>PromoLoom යනු ඕනෑම උත්සවයක් සමාජ මාධ්‍ය තුළ වේගයෙන් ප්‍රචලිත කර ප්‍රවේශපත්‍ර අලෙවිය ඉහළ නැංවීමට නිර්මාණය කළ AI පදනම් කරගත් අලෙවිකරණ සහ ප්‍රවේශපත්‍ර වේදිකාවකි.</p><p>සමාජ මාධ්‍ය ප්‍රවර්ධනය සහ ප්‍රවේශපත්‍ර නිකුත් කිරීම එකම පද්ධතියකට ගෙන එමින්, Influencer ප්‍රවර්ධන, ඉල්ලුම අනුව මිල වෙනස් වන ප්‍රවේශපත්‍ර සහ තත්‍ය කාලීන අලෙවි දත්ත සංවිධායකයින් වෙත ලබා දෙයි.</p>`,
        audience: "ප්‍රසංග සංවිධායකයින්, කලාකරුවන්, අලෙවිකරණ ආයතන සහ උත්සව සංවිධායකයින් සඳහා.",
      },
      features: [
        {
          enTitle: "Viral Ticketing Campaigns",
          enDesc: "Gamified tools like ‘Tag 3 Friends to Unlock Discounts’ to boost organic shares.",
          siTitle: "වෛරල් ප්‍රවේශපත්‍ර ප්‍රවර්ධන",
          siDesc: "මිතුරන් හඳුන්වාදීමෙන් වට්ටම් ලබාගත හැකි ප්‍රවර්ධන ක්‍රමවේද.",
        },
        {
          enTitle: "Dynamic Pricing Engine",
          enDesc: "Auto-adjusts ticket prices (early bird, surge pricing) based on demand and trends.",
          siTitle: "ඉල්ලුම අනුව ස්වයංක්‍රීය මිල කළමනාකරණය",
          siDesc: "Early-bird සහ ඉල්ලුම අනුව ප්‍රවේශපත්‍ර මිල ස්වයංක්‍රීයව සකස් වීම.",
        },
        {
          enTitle: "Influencer Collaboration Hub",
          enDesc: "Connect with promoters/DJs to share affiliate codes and track sales commissions.",
          siTitle: "Influencer සහ ප්‍රවර්ධක ජාලය",
          siDesc: "ප්‍රවර්ධකයින් සඳහා විශේෂ කේත (Affiliate Codes) සහ කොමිස් ගණනය කිරීම.",
        },
        {
          enTitle: "Real-Time Social ROI",
          enDesc: "Dashboards show ticket conversions per hashtag, post, or influencer campaign.",
          siTitle: "සමාජ මාධ්‍ය ප්‍රතිඵල විශ්ලේෂණය (Social ROI)",
          siDesc: "එක් එක් පෝස්ට් සහ ප්‍රවර්ධන වැඩසටහන් හරහා අලෙවි වූ ප්‍රවේශපත්‍ර නිරීක්ෂණය.",
        },
        {
          enTitle: "NFT & VIP Passes",
          enDesc: "Sell exclusive digital collectibles or backstage upgrades with blockchain-backed tickets.",
          siTitle: "සුවිශේෂී VIP සහ ඩිජිටල් අවසරපත්",
          siDesc: "විශේෂ ආරාධිතයින් සඳහා සුරක්ෂිත ඩිජිටල් ප්‍රවේශපත්‍ර.",
        },
        {
          enTitle: "One-Click Multi-Posting",
          enDesc: "Schedule promo content across Instagram, TikTok, and Facebook simultaneously.",
          siTitle: "එක් ක්ලික් කිරීමකින් සියලුම සමාජ මාධ්‍යවල පළ කිරීම",
          siDesc: "Instagram, TikTok සහ Facebook හි එකවර ප්‍රවර්ධන අන්තර්ගතයන් පළ කිරීම.",
        },
        {
          enTitle: "AR Event Filters",
          enDesc: "Branded Snapchat/Instagram filters to hype attendees pre-event.",
          siTitle: "AR උත්සව ෆිල්ටර්",
          siDesc: "ප්‍රේක්ෂක ආකර්ෂණය වැඩි කරන සන්නාමගත සමාජ මාධ්‍ය ෆිල්ටර්.",
        },
      ],
    },
  ];

  for (const p of productsSeed) {
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        categoryId: prodCat.id,
        logoId: p.logoId,
        coverId: p.coverId,
        techStackJson: p.techStack,
        sortOrder: p.sortOrder,
        isFeatured: true,
        isPublished: true,
      },
      create: {
        slug: p.slug,
        categoryId: prodCat.id,
        logoId: p.logoId,
        coverId: p.coverId,
        techStackJson: p.techStack,
        status: "LIVE",
        sortOrder: p.sortOrder,
        isFeatured: true,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: prod.id, locale: "en" } },
      update: {
        name: p.en.name,
        tagline: p.en.tagline,
        shortDescription: p.en.short,
        longDescription: p.en.long,
        targetAudience: p.en.audience,
      },
      create: {
        productId: prod.id,
        locale: "en",
        name: p.en.name,
        tagline: p.en.tagline,
        shortDescription: p.en.short,
        longDescription: p.en.long,
        targetAudience: p.en.audience,
        needsReview: false,
      },
    });

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: prod.id, locale: "si" } },
      update: {
        name: p.si.name,
        tagline: p.si.tagline,
        shortDescription: p.si.short,
        longDescription: p.si.long,
        targetAudience: p.si.audience,
      },
      create: {
        productId: prod.id,
        locale: "si",
        name: p.si.name,
        tagline: p.si.tagline,
        shortDescription: p.si.short,
        longDescription: p.si.long,
        targetAudience: p.si.audience,
        needsReview: true,
      },
    });

    await prisma.productFeature.deleteMany({ where: { productId: prod.id } });
    for (let idx = 0; idx < p.features.length; idx++) {
      const f = p.features[idx]!;
      await prisma.productFeature.create({
        data: {
          productId: prod.id,
          icon: "CheckCircle2",
          sortOrder: idx + 1,
          translations: {
            create: [
              { locale: "en", title: f.enTitle, description: f.enDesc, needsReview: false },
              { locale: "si", title: f.siTitle, description: f.siDesc, needsReview: true },
            ],
          },
        },
      });
    }
  }
  console.info("✅ Seeded 3 flagship products (EventLoom, CaptureLoom, PromoLoom) with 26 total features.");

  // 10. Seed Demo Case-Study Project (Tourism Guide Startup — is_demo = true, is_published = false per Section 14)
  const projCat = await prisma.projectCategory.upsert({
    where: { slug: "full-growth-partnerships" },
    update: { sortOrder: 1 },
    create: {
      slug: "full-growth-partnerships",
      sortOrder: 1,
      translations: {
        create: [
          { locale: "en", name: "Software + Social Growth", needsReview: false },
          { locale: "si", name: "මෘදුකාංග සහ සමාජ මාධ්‍ය වර්ධන ව්‍යාපෘති", needsReview: true },
        ],
      },
    },
  });

  const demoProject = await prisma.project.upsert({
    where: { slug: "sri-lanka-tourism-guide-growth-story" },
    update: {
      categoryId: projCat.id,
      isDemo: true,
      isFeatured: true,
      isPublished: false, // Unpublished draft per Section 14
      techStackJson: ["Next.js", "TypeScript", "MySQL", "WhatsApp Booking Flow", "Social Media Content Suite"],
    },
    create: {
      slug: "sri-lanka-tourism-guide-growth-story",
      categoryId: projCat.id,
      projectType: "CLIENT_PROJECT",
      isDemo: true,
      isFeatured: true,
      isPublished: false,
      techStackJson: ["Next.js", "TypeScript", "MySQL", "WhatsApp Booking Flow", "Social Media Content Suite"],
    },
  });

  await prisma.projectTranslation.upsert({
    where: { projectId_locale: { projectId: demoProject.id, locale: "en" } },
    update: {},
    create: {
      projectId: demoProject.id,
      locale: "en",
      title: "[DEMO TEMPLATE] Sri Lanka Tourism Guide Start-Up — Booking System & Social Growth",
      clientName: "Tourism Guide Start-Up (Editable in Admin)",
      industry: "Tourism & Hospitality",
      summary:
        "We built their custom tour booking platform, then launched and ran their Facebook, TikTok, Instagram, and TripAdvisor channels with videos and posts—handing over a continuous growth plan.",
      challenge:
        "<p>A local tourism guide start-up wanted to attract international travellers directly without losing high commissions to aggregators, but lacked both a booking website and an active social media footprint.</p>",
      solution:
        "<p>Vardhel studied their tour itineraries, engineered a mobile-first tour booking website with direct WhatsApp enquiry flows, and set up their official Facebook Page, TikTok, Instagram, and TripAdvisor profiles—producing engaging short-form videos and posts.</p>",
      result:
        "<p>Delivered a complete digital presence plus hands-on training and a repeatable content roadmap so the founder can continuously engage travellers and grow bookings.</p>",
      needsReview: true,
    },
  });

  await prisma.projectTranslation.upsert({
    where: { projectId_locale: { projectId: demoProject.id, locale: "si" } },
    update: {},
    create: {
      projectId: demoProject.id,
      locale: "si",
      title: "[DEMO නිදසුන] සංචාරක මාර්ගෝපදේශක ව්‍යාපාරය — වෙබ් අඩවිය සහ සමාජ මාධ්‍ය වර්ධනය",
      clientName: "සංචාරක ව්‍යාපාරය (Admin තුළින් සංස්කරණය කළ හැක)",
      industry: "සංචාරක ක්ෂේත්‍රය",
      summary:
        "සංචාරක වෙන්කිරීමේ වෙබ් අඩවිය නිර්මාණය කර, Facebook, TikTok, Instagram සහ TripAdvisor ගිණුම් පිහිටුවා වීඩියෝ සහ පෝස්ට් මඟින් ව්‍යාපාරය වර්ධනය කිරීමේ සැලැස්ම ලබා දුන්නෙමු.",
      challenge:
        "<p>විදේශීය සංචාරකයින් සෘජුවම සම්බන්ධ කරගැනීමට වෙබ් අඩවියක් හෝ විධිමත් සමාජ මාධ්‍ය ජාලයක් නොතිබීම.</p>",
      solution:
        "<p>Vardhel විසින් සංචාරක පැකේජ ඇතුළත් වෙබ් අඩවිය නිර්මාණය කර, Facebook, TikTok, Instagram සහ TripAdvisor ගිණුම් ආරම්භ කර ආකර්ෂණීය වීඩියෝ සහ පෝස්ට් නිර්මාණය කරන ලදී.</p>",
      result:
        "<p>සම්පූර්ණ ඩිජිටල් පද්ධතියක් සමඟ අඛණ්ඩව පාරිභෝගිකයින් දිනාගැනීමේ දැනුම සහ සැලැස්ම ව්‍යාපාරය වෙත ලබා දෙන ලදී.</p>",
      needsReview: true,
    },
  });

  await prisma.projectSocialWork.deleteMany({ where: { projectId: demoProject.id } });
  const socialPlatforms = [
    {
      platform: "facebook",
      en: "Page creation, branding, tour album posts, and WhatsApp lead routing.",
      si: "Facebook පිටුව ආරම්භ කිරීම, සන්නාමකරණය සහ සංචාරක පැකේජ පළ කිරීම.",
    },
    {
      platform: "tiktok",
      en: "Short-form destination highlight videos and travel tips to drive organic reach.",
      si: "සංචාරක ස්ථාන හඳුන්වාදෙන ආකර්ෂණීය TikTok කෙටි වීඩියෝ නිර්මාණය.",
    },
    {
      platform: "instagram",
      en: "Visual grid setup, Reels production, and story highlights for itineraries.",
      si: "Instagram Reels සහ සංචාරක අත්දැකීම් විදහා දක්වන ඡායාරූප පළ කිරීම.",
    },
    {
      platform: "tripadvisor",
      en: "Listing setup, itinerary optimization, and guest review collection playbook.",
      si: "TripAdvisor ලියාපදිංචිය සහ සංචාරක ප්‍රතිචාර ලබාගැනීමේ ක්‍රමවේදය සකස් කිරීම.",
    },
  ];
  for (let i = 0; i < socialPlatforms.length; i++) {
    const sp = socialPlatforms[i]!;
    await prisma.projectSocialWork.create({
      data: {
        projectId: demoProject.id,
        platform: sp.platform,
        sortOrder: i + 1,
        translations: {
          create: [
            { locale: "en", summary: sp.en, needsReview: false },
            { locale: "si", summary: sp.si, needsReview: true },
          ],
        },
      },
    });
  }

  // 11. Seed Process Steps (5 Dev Cycle + 7 Growth Journey)
  await prisma.processStep.deleteMany({});
  const devCycleSteps = [
    {
      icon: "Compass",
      enTitle: "Discovery Workshop",
      enBullets: ["Requirement gathering", "Goal alignment", "Scope definition"],
      siTitle: "මූලික අධ්‍යයනය (Discovery Workshop)",
      siBullets: ["අවශ්‍යතා හඳුනාගැනීම", "ව්‍යාපාරික අරමුණු පෙළගැස්වීම", "ව්‍යාපෘති පරාසය තීරණය කිරීම"],
    },
    {
      icon: "PenTool",
      enTitle: "Strategic Design",
      enBullets: ["Wireframe", "UI/UX mockups", "Client approvals"],
      siTitle: "උපායමාර්ගික නිර්මාණය (Strategic Design)",
      siBullets: ["මූලික සැකසුම් (Wireframes)", "UI/UX අතුරුමුහුණත් නිර්මාණය", "සේවාදායක අනුමැතිය"],
    },
    {
      icon: "Code",
      enTitle: "Agile Development",
      enBullets: ["Sprint planning", "Weekly builds", "Continuous feedback"],
      siTitle: "කඩිනම් මෘදුකාංග සංවර්ධනය (Agile Development)",
      siBullets: ["පියවරෙන් පියවර සැලසුම් කිරීම", "සතිපතා ප්‍රගතිය පරීක්ෂාව", "අඛණ්ඩ අදහස් හුවමාරුව"],
    },
    {
      icon: "ShieldCheck",
      enTitle: "Quality Assurance",
      enBullets: ["Automated testing", "User acceptance testing", "Performance optimization"],
      siTitle: "තත්ත්ව පරීක්ෂාව (Quality Assurance)",
      siBullets: ["ස්වයංක්‍රීය පරීක්ෂණ", "පරිශීලක පරීක්ෂාව (UAT)", "වේගය සහ ආරක්ෂාව තහවුරු කිරීම"],
    },
    {
      icon: "Rocket",
      enTitle: "Launch & Scale",
      enBullets: ["Deployment", "Training", "Ongoing support"],
      siTitle: "දියත් කිරීම සහ වර්ධනය (Launch & Scale)",
      siBullets: ["පද්ධතිය දියත් කිරීම", "පුහුණුව ලබාදීම", "අඛණ්ඩ තාක්ෂණික සහාය"],
    },
  ];

  for (let i = 0; i < devCycleSteps.length; i++) {
    const st = devCycleSteps[i]!;
    await prisma.processStep.create({
      data: {
        stepType: "dev_cycle",
        icon: st.icon,
        sortOrder: i + 1,
        isPublished: true,
        translations: {
          create: [
            { locale: "en", title: st.enTitle, bulletsJson: st.enBullets, needsReview: false },
            { locale: "si", title: st.siTitle, bulletsJson: st.siBullets, needsReview: true },
          ],
        },
      },
    });
  }

  const growthJourneySteps = [
    {
      enTitle: "1. Understand Your Business",
      enBullets: ["Deep-dive into your business model, customers, and revenue goals"],
      siTitle: "1. ඔබේ ව්‍යාපාරය හඳුනාගැනීම",
      siBullets: ["ඔබේ ව්‍යාපාරික ආකෘතිය, පාරිභෝගිකයින් සහ ඉලක්ක ගැඹුරින් අධ්‍යයනය කිරීම"],
    },
    {
      enTitle: "2. Gather Requirements",
      enBullets: ["Map operational workflows, pain points, and customer touchpoints"],
      siTitle: "2. අවශ්‍යතා පෙළගැස්වීම",
      siBullets: ["ව්‍යාපාරයේ එදිනෙදා ක්‍රියාවලිය සහ පාරිභෝගික අවශ්‍යතා නිවැරදිව සටහන් කිරීම"],
    },
    {
      enTitle: "3. Recommend Modern Technology",
      enBullets: ["Select the right scalable architecture, tools, and digital channels"],
      siTitle: "3. නවීන තාක්ෂණය නිර්දේශ කිරීම",
      siBullets: ["ඔබේ ව්‍යාපාරයට ගැළපෙනම නවීන තාක්ෂණික විසඳුම් සහ ඩිජිටල් නාලිකා තෝරාදීම"],
    },
    {
      enTitle: "4. Build the Software",
      enBullets: ["Engineer a fast, secure, mobile-ready web or software platform"],
      siTitle: "4. මෘදුකාංග පද්ධතිය නිර්මාණය",
      siBullets: ["ආරක්ෂිත, වේගවත් සහ ඕනෑම උපාංගයකින් භාවිතා කළ හැකි මෘදුකාංගය ගොඩනැගීම"],
    },
    {
      enTitle: "5. Launch with Confidence",
      enBullets: ["Deploy to production with SEO, analytics, and WhatsApp lead routing"],
      siTitle: "5. සාර්ථකව දියත් කිරීම",
      siBullets: ["SEO සහ WhatsApp සම්බන්ධතා සමඟින් පද්ධතිය සජීවීව දියත් කිරීම"],
    },
    {
      enTitle: "6. Set Up & Run Social Media",
      enBullets: ["Create & manage Facebook, TikTok, Instagram & TripAdvisor with posts and videos"],
      siTitle: "6. සමාජ මාධ්‍ය ජාල පිහිටුවීම සහ ප්‍රවර්ධනය",
      siBullets: ["Facebook, TikTok, Instagram සහ TripAdvisor ගිණුම් අරඹා වීඩියෝ සහ පෝස්ට් පළ කිරීම"],
    },
    {
      enTitle: "7. Keep Growing Together",
      enBullets: ["Transfer knowledge, provide a continuous plan, and support your long-term growth"],
      siTitle: "7. අඛණ්ඩ වර්ධනය සඳහා අත්වැල",
      siBullets: ["දැනුම ලබාදෙමින් දිගුකාලීනව ව්‍යාපාරය වර්ධනය කිරීමට අඛණ්ඩව සහාය වීම"],
    },
  ];

  for (let i = 0; i < growthJourneySteps.length; i++) {
    const gj = growthJourneySteps[i]!;
    await prisma.processStep.create({
      data: {
        stepType: "growth_journey",
        icon: "Sparkles",
        sortOrder: i + 1,
        isPublished: true,
        translations: {
          create: [
            { locale: "en", title: gj.enTitle, bulletsJson: gj.enBullets, needsReview: false },
            { locale: "si", title: gj.siTitle, bulletsJson: gj.siBullets, needsReview: true },
          ],
        },
      },
    });
  }

  // 12. Seed FAQs (3 Migrated + 3 Social Growth FAQs)
  await prisma.faq.deleteMany({});
  const faqsSeed = [
    {
      group: "general",
      enQ: "What services does Vardhel offer?",
      enA: "We deliver custom web and mobile application development, SaaS product engineering, UI/UX design, AI/ML & IoT integration, QA & maintenance—plus end-to-end social media setup, short-video production, and digital growth support.",
      siQ: "Vardhel මඟින් ලබාදෙන සේවාවන් මොනවාද?",
      siA: "අපි වෙබ් සහ ජංගම යෙදුම් සංවර්ධනය, මෘදුකාංග නිෂ්පාදන ඉංජිනේරුකරණය, UI/UX නිර්මාණය, තත්ත්ව පරීක්ෂාව මෙන්ම Facebook, TikTok, Instagram සහ TripAdvisor හරහා ඔබේ ව්‍යාපාරය වර්ධනය කිරීමේ සමාජ මාධ්‍ය ප්‍රවර්ධන සේවාවන්ද ලබා දෙන්නෙමු.",
    },
    {
      group: "growth",
      enQ: "How does your Software + Social Media Growth partnership work?",
      enA: "We don't just hand over code and disappear. We study your business, build the software or booking system you need, and then set up and run your social media accounts (Facebook, Instagram, TikTok, TripAdvisor) with engaging videos and posts—while training you with a sustainable plan to keep growing.",
      siQ: "මෘදුකාංග සහ සමාජ මාධ්‍ය වර්ධන හවුල්කාරිත්වය ක්‍රියාත්මක වන්නේ කෙසේද?",
      siA: "අපි මෘදුකාංගය නිර්මාණය කිරීමෙන් පමණක් නතර නොවෙමු. ඔබේ ව්‍යාපාරය අධ්‍යයනය කර, අවශ්‍ය වෙබ් අඩවිය හෝ පද්ධතිය ගොඩනඟා, Facebook, Instagram, TikTok සහ TripAdvisor ගිණුම් ආරම්භ කර ආකර්ෂණීය වීඩියෝ සහ පෝස්ට් පළ කරමින් ව්‍යාපාරය වර්ධනය කරගැනීමට අවශ්‍ය දැනුමද ඔබට ලබා දෙන්නෙමු.",
    },
    {
      group: "general",
      enQ: "Do you work with startups and students?",
      enA: "Yes! For startups, we offer MVP-focused packages with scalable architecture and social launch support. For university students, we provide academic software project guidance with clean, well-documented code.",
      siQ: "ඔබ නව ව්‍යාපාර (Startups) සහ සිසුන් සමඟ කටයුතු කරනවාද?",
      siA: "ඔව්! නව ව්‍යාපාර සඳහා MVP මෘදුකාංග සහ සමාජ මාධ්‍ය දියත් කිරීමේ පැකේජද, විශ්වවිද්‍යාල සිසුන්ගේ අධ්‍යාපනික ව්‍යාපෘති සඳහා විධිමත් ලේඛනගත කිරීම් සහිත මෘදුකාංග විසඳුම්ද අපි පිරිනමන්නෙමු.",
    },
    {
      group: "general",
      enQ: "How long does a typical project take?",
      enA: "An MVP (Minimum Viable Product) typically takes 3–6 weeks, a mid-size custom application takes 3–6 months, and larger enterprise ecosystems follow a phased rollout.",
      siQ: "සාමාන්‍යයෙන් ව්‍යාපෘතියක් සඳහා කොපමණ කාලයක් ගතවේද?",
      siA: "මූලික නිෂ්පාදනයක් (MVP) සඳහා සති 3–6ක් පමණද, මධ්‍යම ප්‍රමාණයේ මෘදුකාංග පද්ධතියක් සඳහා මාස 3–6ක් පමණද ගතවන අතර විශාල ව්‍යාපෘති අදියර වශයෙන් දියත් කෙරේ.",
    },
    {
      group: "growth",
      enQ: "Can we hire Vardhel for both our website/system and social media marketing?",
      enA: "Absolutely. That is our flagship partnership model—having one unified team build your platform and run your digital marketing ensures your branding, messaging, and booking flows work together seamlessly.",
      siQ: "අපගේ වෙබ් අඩවිය/මෘදුකාංගය සහ සමාජ මාධ්‍ය අලෙවිකරණය යන දෙකම සඳහා Vardhel සම්බන්ධ කරගත හැකිද?",
      siA: "අනිවාර්යයෙන්ම. අපගේ ප්‍රධානතම විශේෂත්වය එයයි. එකම කණ්ඩායමක් මඟින් ඔබේ මෘදුකාංග පද්ධතිය සහ සමාජ මාධ්‍ය ප්‍රවර්ධනය සිදු කිරීමෙන් ඉහළම ප්‍රතිඵල ලබාගත හැකිය.",
    },
  ];

  for (let i = 0; i < faqsSeed.length; i++) {
    const fq = faqsSeed[i]!;
    await prisma.faq.create({
      data: {
        group: fq.group,
        sortOrder: i + 1,
        isPublished: true,
        translations: {
          create: [
            { locale: "en", question: fq.enQ, answer: fq.enA, needsReview: false },
            { locale: "si", question: fq.siQ, answer: fq.siA, needsReview: true },
          ],
        },
      },
    });
  }

  // 13. Seed Offers (2 Migrated Offers)
  await prisma.offer.deleteMany({});
  await prisma.offer.create({
    data: {
      ctaHref: "/contact",
      sortOrder: 1,
      isPublished: true,
      translations: {
        create: [
          {
            locale: "en",
            title: "For an Academic Project",
            description:
              "Custom software solutions for student projects—from concept to functional prototype. We transform your ideas into deployable systems with documented code tailored for coursework and viva requirements.",
            badge: "Students & Researchers",
            ctaLabel: "Contact Us",
            needsReview: false,
          },
          {
            locale: "si",
            title: "අධ්‍යාපනික මෘදුකාංග ව්‍යාපෘති සඳහා",
            description:
              "විශ්වවිද්‍යාල සහ උසස් අධ්‍යාපන සිසුන්ගේ ව්‍යාපෘති සඳහා අදහසේ සිට ක්‍රියාකාරී මෘදුකාංග පද්ධතිය දක්වා විධිමත් කේත සහ ලේඛනගත කිරීම් සහිතව සහාය.",
            badge: "සිසුන් සඳහා",
            ctaLabel: "අප හා සම්බන්ධ වන්න",
            needsReview: true,
          },
        ],
      },
    },
  });

  await prisma.offer.create({
    data: {
      ctaHref: "/contact",
      sortOrder: 2,
      isPublished: true,
      translations: {
        create: [
          {
            locale: "en",
            title: "For Small Business Boost (Software + Social Growth)",
            description:
              "Budget-friendly software applications paired with social media setup tailored for growing businesses. We create tools that streamline operations, enhance customer engagement, and boost growth—with startup-appropriate timelines.",
            badge: "Growing Businesses",
            ctaLabel: "Start Growing",
            needsReview: false,
          },
          {
            locale: "si",
            title: "කුඩා සහ මධ්‍ය පරිමාණ ව්‍යාපාර වර්ධන පැකේජය",
            description:
              "වර්ධනය වන ව්‍යාපාර සඳහාම සැකසූ මෘදුකාංග සහ සමාජ මාධ්‍ය ප්‍රවර්ධන විසඳුම. ඔබේ එදිනෙදා කටයුතු පහසු කර නව පාරිභෝගිකයින් දිනාගැනීමට උපකාරී වේ.",
            badge: "ව්‍යාපාර සඳහා",
            ctaLabel: "අදම අරඹන්න",
            needsReview: true,
          },
        ],
      },
    },
  });

  // 14. Seed Team Roles (6 Roles from Team.tsx)
  await prisma.teamMember.deleteMany({});
  const teamRoles = [
    { en: "Frontend Developers", si: "Frontend මෘදුකාංග ඉංජිනේරුවන්" },
    { en: "Backend Engineers", si: "Backend පද්ධති ඉංජිනේරුවන්" },
    { en: "QA Analysts", si: "තත්ත්ව පරීක්ෂණ විශ්ලේෂකයින් (QA)" },
    { en: "UI/UX Designers", si: "UI/UX නිර්මාණ ශිල්පීන්" },
    { en: "Business Analysts & Growth Strategists", si: "ව්‍යාපාර විශ්ලේෂකයින් සහ වර්ධන උපායමාර්ගිකයින්" },
    { en: "Solution Architects", si: "පද්ධති ව්‍යුහ නිර්මාණකරුවන් (Solution Architects)" },
  ];

  for (let i = 0; i < teamRoles.length; i++) {
    const tr = teamRoles[i]!;
    await prisma.teamMember.create({
      data: {
        isRoleOnly: true,
        sortOrder: i + 1,
        isVisible: true,
        translations: {
          create: [
            { locale: "en", name: tr.en, role: "Specialist Discipline", needsReview: false },
            { locale: "si", name: tr.si, role: "විශේෂඥ අංශය", needsReview: true },
          ],
        },
      },
    });
  }

  // 15. Seed 5 Core Values (from VisionMission.tsx)
  await prisma.coreValue.deleteMany({});
  const coreValuesSeed = [
    {
      num: "01",
      enTitle: "Excellence in Execution",
      enMotto: "Good enough isn't in our vocabulary",
      enBullets: [
        "Obsession with clean, maintainable code",
        "Rigorous QA and performance optimization",
        "Continuous learning and tech stack evolution",
      ],
      siTitle: "විශිෂ්ට ක්‍රියාත්මක කිරීම",
      siMotto: "ඉහළම ප්‍රමිතියෙන් තොර කිසිවක් අපි අනුමත නොකරමු",
      siBullets: [
        "පිරිසිදු සහ නඩත්තු කළ හැකි කේතකරණය",
        "දැඩි තත්ත්ව පරීක්ෂාව සහ වේගය වැඩිදියුණු කිරීම",
        "නවීන තාක්ෂණයන් සමඟ නිරන්තරයෙන් යාවත්කාලීන වීම",
      ],
    },
    {
      num: "02",
      enTitle: "Client Success First",
      enMotto: "We win when you win",
      enBullets: [
        "Deep collaboration from day one",
        "Transparent communication at all stages",
        "ROI-driven development and growth priorities",
      ],
      siTitle: "සේවාදායකයාගේ සාර්ථකත්වය ප්‍රථමයෙන්",
      siMotto: "ඔබේ ජයග්‍රහණය අපගේ ජයග්‍රහණයයි",
      siBullets: [
        "පළමු දිනයේ සිටම සමීප සහයෝගීතාවය",
        "සෑම අදියරකදීම විනිවිදභාවයෙන් යුතු සන්නිවේදනය",
        "ව්‍යාපාරික ප්‍රතිලාභ (ROI) මූලික කරගත් ප්‍රමුඛතා",
      ],
    },
    {
      num: "03",
      enTitle: "Innovation with Purpose",
      enMotto: "Solving real problems, not chasing trends",
      enBullets: [
        "Practical application of AI/ML, cloud, and IoT",
        "Fail-fast experimentation mindset",
        "Future-proof architectural decisions",
      ],
      siTitle: "අරමුණක් සහිත නවෝත්පාදනය",
      siMotto: "සැබෑ ව්‍යාපාරික ගැටලු සඳහා ප්‍රායෝගික විසඳුම්",
      siBullets: [
        "AI, Cloud සහ IoT තාක්ෂණයන්හි ප්‍රායෝගික භාවිතය",
        "නිර්මාණශීලී අත්හදාබැලීම්",
        "අනාගතයට ඔරොත්තු දෙන පද්ධති නිර්මාණය",
      ],
    },
    {
      num: "04",
      enTitle: "Ownership Mentality",
      enMotto: "Every team member acts like a founder",
      enBullets: [
        "End-to-end accountability for projects",
        "Proactive problem solving",
        "Pride in craftsmanship",
      ],
      siTitle: "වගකීම් සහගත බව",
      siMotto: "සෑම ව්‍යාපෘතියක්ම අපගේම ව්‍යාපාරයක් ලෙස සලකා කටයුතු කිරීම",
      siBullets: [
        "ආරම්භයේ සිට අවසානය දක්වා පූර්ණ වගකීම",
        "ගැටලු කල්තියා හඳුනාගෙන විසඳුම් ලබාදීම",
        "නිර්මාණශීලීත්වය පිළිබඳ ආඩම්බරය",
      ],
    },
    {
      num: "05",
      enTitle: "Human-Centric Technology",
      enMotto: "Code should serve people, not the other way around",
      enBullets: [
        "Accessibility-focused design",
        "Ethical AI implementation",
        "Intuitive user experiences",
      ],
      siTitle: "මිනිසා කේන්ද්‍ර කරගත් තාක්ෂණය",
      siMotto: "තාක්ෂණය මිනිසුන්ගේ ජීවිත පහසු කිරීම සඳහාය",
      siBullets: [
        "සැමට පහසුවෙන් භාවිතා කළ හැකි නිර්මාණ",
        "සදාචාරාත්මක AI භාවිතය",
        "සරල සහ ආකර්ෂණීය පරිශීලක අත්දැකීම්",
      ],
    },
  ];

  for (let i = 0; i < coreValuesSeed.length; i++) {
    const cv = coreValuesSeed[i]!;
    await prisma.coreValue.create({
      data: {
        codeNumber: cv.num,
        sortOrder: i + 1,
        isPublished: true,
        translations: {
          create: [
            {
              locale: "en",
              title: cv.enTitle,
              motto: cv.enMotto,
              bulletsJson: cv.enBullets,
              needsReview: false,
            },
            {
              locale: "si",
              title: cv.siTitle,
              motto: cv.siMotto,
              bulletsJson: cv.siBullets,
              needsReview: true,
            },
          ],
        },
      },
    });
  }

  // 16. Seed Pages Content (About, Vision, Mission, Growth, Legal pages: Terms, Privacy, Cookies)
  const pagesSeed = [
    {
      slug: "about",
      group: "company",
      enTitle: "Meet Our Digital Specialists",
      enSub: "Your Vision, Our Framework",
      enBody: `<p>At Vardhel, we've assembled a powerhouse of technical and creative talent in Sri Lanka dedicated to crafting exceptional software and helping businesses grow.</p><p><strong>We transform ideas into powerful digital solutions.</strong> Our full-stack team designs, builds, and optimizes custom software that solves real business challenges—and then sets up and manages your social media presence so your customers find and engage with you.</p>`,
      siTitle: "අපගේ ඩිජිටල් විශේෂඥ කණ්ඩායම",
      siSub: "ඔබේ දැක්ම, අපගේ තාක්ෂණික රාමුව",
      siBody: `<p>Vardhel යනු විශිෂ්ට මෘදුකාංග නිර්මාණය කිරීමට සහ ව්‍යාපාර වර්ධනය කිරීමට කැපවූ තාක්ෂණික සහ නිර්මාණශීලී වෘත්තිකයන්ගෙන් සැදුම්ලත් කණ්ඩායමකි.</p><p>අපි ඔබේ අදහස් බලවත් ඩිජිටල් විසඳුම් බවට පත් කරන අතර, සමාජ මාධ්‍ය හරහා ඔබේ ව්‍යාපාරය පාරිභෝගිකයින් අතරට ගෙන යාමටද අඛණ්ඩව කටයුතු කරන්නෙමු.</p>`,
    },
    {
      slug: "vision",
      group: "company",
      enTitle: "Our Vision",
      enSub: "",
      enBody: `<p>To be the most trusted partner for transformative digital solutions where technology meets human potential.</p>`,
      siTitle: "අපගේ දැක්ම",
      siSub: "",
      siBody: `<p>තාක්ෂණය සහ මානව හැකියාවන් යා කරමින් පරිවර්තනීය ඩිජිටල් විසඳුම් සපයන වඩාත්ම විශ්වසනීය හවුල්කරුවා වීම.</p>`,
    },
    {
      slug: "mission",
      group: "company",
      enTitle: "Our Mission",
      enSub: "",
      enBody: `<p>To engineer transformative digital solutions that empower businesses and exceed expectations through technical mastery, relentless innovation, and partnership-driven development.</p>`,
      siTitle: "අපගේ මෙහෙවර",
      siSub: "",
      siBody: `<p>තාක්ෂණික විශිෂ්ටත්වය, අඛණ්ඩ නවෝත්පාදනය සහ සමීප හවුල්කාරිත්වය හරහා ව්‍යාපාර බලගන්වන ඩිජිටල් විසඳුම් නිර්මාණය කිරීම.</p>`,
    },
    {
      slug: "terms",
      group: "legal",
      enTitle: "Terms of Use",
      enSub: "Last updated: 2026",
      enBody: `<p>Welcome to Vardhel. By accessing this website, you agree to use its information and enquiry channels lawfully. All product names (EventLoom, CaptureLoom, PromoLoom) and brand assets are property of Vardhel.</p>`,
      siTitle: "භාවිත කොන්දේසි (Terms of Use)",
      siSub: "අවසන් යාවත්කාලීන කිරීම: 2026",
      siBody: `<p>Vardhel වෙබ් අඩවියට සාදරයෙන් පිළිගනිමු. මෙම වෙබ් අඩවියේ ඇති සියලුම නිෂ්පාදන නාමයන් (EventLoom, CaptureLoom, PromoLoom) සහ සන්නාම Vardhel සතු දේපළ වේ.</p>`,
    },
    {
      slug: "privacy",
      group: "legal",
      enTitle: "Privacy Policy",
      enSub: "How we handle enquiry and feedback data",
      enBody: `<p>Vardhel respects your privacy. Information submitted via our enquiry or customer feedback forms is used solely to respond to your request or, with your explicit consent, display approved testimonials. We never sell or expose your email address publicly.</p>`,
      siTitle: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය (Privacy Policy)",
      siSub: "ඔබේ දත්ත ආරක්ෂා කරන ආකාරය",
      siBody: `<p>Vardhel ඔබේ පෞද්ගලිකත්වයට ගරු කරයි. විමසීම් හෝ පාරිභෝගික අදහස් පෝරම හරහා ලබාදෙන තොරතුරු ඔබ හා සම්බන්ධ වීමට හෝ ඔබේ අනුමැතිය ඇතිව පමණක් වෙබ් අඩවියේ පළ කිරීමට භාවිතා කෙරේ. ඔබේ විද්‍යුත් තැපැල් ලිපිනය කිසිවිටෙක ප්‍රසිද්ධියේ පළ නොකෙරේ.</p>`,
    },
    {
      slug: "cookies",
      group: "legal",
      enTitle: "Cookie Policy",
      enSub: "Essential cookies only by default",
      enBody: `<p>We use strictly necessary cookies to remember your language preference (English / Sinhala) and theme choice. Optional analytics cookies are only activated if configured and consented to.</p>`,
      siTitle: "කුකී ප්‍රතිපත්තිය (Cookie Policy)",
      siSub: "අත්‍යවශ්‍ය කුකීස් පමණි",
      siBody: `<p>ඔබ තෝරාගත් භාෂාව (English / සිංහල) සහ තේමාව මතක තබා ගැනීමට පමණක් අපි අත්‍යවශ්‍ය කුකීස් භාවිතා කරන්නෙමු.</p>`,
    },
  ];

  for (const pg of pagesSeed) {
    const page = await prisma.pageContent.upsert({
      where: { slug: pg.slug },
      update: { pageGroup: pg.group, isPublished: true },
      create: { slug: pg.slug, pageGroup: pg.group, isPublished: true },
    });
    await prisma.pageContentTranslation.upsert({
      where: { pageId_locale: { pageId: page.id, locale: "en" } },
      update: { title: pg.enTitle, subtitle: pg.enSub, body: pg.enBody },
      create: {
        pageId: page.id,
        locale: "en",
        title: pg.enTitle,
        subtitle: pg.enSub,
        body: pg.enBody,
        needsReview: false,
      },
    });
    await prisma.pageContentTranslation.upsert({
      where: { pageId_locale: { pageId: page.id, locale: "si" } },
      update: { title: pg.siTitle, subtitle: pg.siSub, body: pg.siBody },
      create: {
        pageId: page.id,
        locale: "si",
        title: pg.siTitle,
        subtitle: pg.siSub,
        body: pg.siBody,
        needsReview: true,
      },
    });
  }

  // 17. Seed Enquiry Form Options (Interests & Budget Ranges)
  const formOptionsSeed = [
    { type: "interest", key: "software_and_growth", order: 1, en: "Custom Software + Social Media Growth (End-to-End)", si: "මෘදුකාංග + සමාජ මාධ්‍ය වර්ධනය (පූර්ණ විසඳුම)" },
    { type: "interest", key: "custom_software", order: 2, en: "Custom Web / Mobile / Software Development", si: "වෙබ් / ජංගම / මෘදුකාංග සංවර්ධනය" },
    { type: "interest", key: "social_media_growth", order: 3, en: "Social Media Setup, Content & Growth Only", si: "සමාජ මාධ්‍ය කළමනාකරණය සහ ප්‍රවර්ධනය" },
    { type: "interest", key: "product_demo", order: 4, en: "Product Enquiry (EventLoom / CaptureLoom / PromoLoom)", si: "අපගේ නිෂ්පාදන පිළිබඳ විමසීමක් (EventLoom / CaptureLoom / PromoLoom)" },
    { type: "interest", key: "academic_project", order: 5, en: "Academic Software Project Support", si: "අධ්‍යාපනික මෘදුකාංග ව්‍යාපෘති සහාය" },
    { type: "interest", key: "other", order: 6, en: "Other / General Consulting", si: "වෙනත් / තාක්ෂණික උපදේශනය" },
  ];

  for (const fo of formOptionsSeed) {
    const opt = await prisma.formOption.upsert({
      where: { optionType_valueKey: { optionType: fo.type, valueKey: fo.key } },
      update: { sortOrder: fo.order, isActive: true },
      create: { optionType: fo.type, valueKey: fo.key, sortOrder: fo.order, isActive: true },
    });
    await prisma.formOptionTranslation.upsert({
      where: { optionId_locale: { optionId: opt.id, locale: "en" } },
      update: { label: fo.en },
      create: { optionId: opt.id, locale: "en", label: fo.en, needsReview: false },
    });
    await prisma.formOptionTranslation.upsert({
      where: { optionId_locale: { optionId: opt.id, locale: "si" } },
      update: { label: fo.si },
      create: { optionId: opt.id, locale: "si", label: fo.si, needsReview: true },
    });
  }

  console.info("🎉 Vardhel seed completed! (Zero fake testimonials or fake stats seeded.)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
