import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import {
  getPublishedProducts,
  getPublishedProjects,
  getApprovedFeedback,
  getPublishedFaqs,
  getPublishedOffers,
  getAboutCompanyData,
} from "@/server/services/public-content.service";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import { safeJsonLd } from "@/lib/security/sanitize";
import { HeroVisual } from "@/components/animations/hero-visual";
import {
  ArrowUpRight,
  MessageCircle,
  Code2,
  TrendingUp,
  CheckCircle2,
  Star,
  Sparkles,
  ExternalLink,
  Compass,
  Share2,
  MessageSquareHeart,
  Globe,
  Palette,
  Megaphone,
  Cpu,
  Target,
  ShieldCheck,
  Lightbulb,
  Users,
  Handshake,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";

  const [
    siteConfig,
    tCta,
    tHome,
    products,
    projects,
    feedbackList,
    faqs,
    offers,
    companyData,
  ] = await Promise.all([
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
    getTranslations({ locale: validLocale, namespace: "home" }),
    getPublishedProducts(validLocale),
    getPublishedProjects(validLocale),
    getApprovedFeedback(validLocale),
    getPublishedFaqs(validLocale),
    getPublishedOffers(validLocale),
    getAboutCompanyData(validLocale),
  ]);

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    siteConfig.whatsappDefaultMessage
  );

  // 5-Stage Core Business Process (UNDERSTAND -> BUILD -> CONNECT -> ENGAGE -> GROW)
  const fiveStages = [
    {
      step: "01",
      code: "UNDERSTAND",
      title: validLocale === "si" ? "හඳුනාගැනීම (UNDERSTAND)" : "UNDERSTAND",
      desc:
        validLocale === "si"
          ? "ව්‍යාපාරය, එහි අභියෝග, නව අවස්ථා සහ වර්ධන ඉලක්ක ගැඹුරින් අධ්‍යයනය කිරීම."
          : "Understand the business, its challenges, opportunities, and growth objectives.",
      icon: Compass,
    },
    {
      step: "02",
      code: "BUILD",
      title: validLocale === "si" ? "ගොඩනැගීම (BUILD)" : "BUILD",
      desc:
        validLocale === "si"
          ? "සුවිශේෂී මෘදුකාංග, වෙබ් අඩවි, ඩිජිටල් වේදිකා සහ තාක්ෂණික විසඳුම් නිර්මාණය කිරීම."
          : "Develop custom software, websites, digital platforms, and technology solutions.",
      icon: Code2,
    },
    {
      step: "03",
      code: "CONNECT",
      title: validLocale === "si" ? "සම්බන්ධ කිරීම (CONNECT)" : "CONNECT",
      desc:
        validLocale === "si"
          ? "අර්ථවත් ඩිජිටල් අත්දැකීම් හරහා ව්‍යාපාරය සහ පාරිභෝගිකයින් එකිනෙකට සමීප කිරීම."
          : "Connect businesses with their customers through meaningful digital experiences.",
      icon: Share2,
    },
    {
      step: "04",
      code: "ENGAGE",
      title: validLocale === "si" ? "ආකර්ෂණය (ENGAGE)" : "ENGAGE",
      desc:
        validLocale === "si"
          ? "ඩිජිටල් අලෙවිකරණය, ස්වයංක්‍රීයකරණය සහ ඵලදායී සන්නිවේදනය මඟින් පාරිභෝගික බැඳීම වර්ධනය කිරීම."
          : "Improve customer engagement through digital marketing, automation, and effective communication.",
      icon: MessageSquareHeart,
    },
    {
      step: "05",
      code: "GROW",
      title: validLocale === "si" ? "වර්ධනය (GROW)" : "GROW",
      desc:
        validLocale === "si"
          ? "තාක්ෂණය, උපායමාර්ග සහ අඛණ්ඩ ඩිජිටල් වැඩිදියුණු කිරීම් හරහා තිරසාර ව්‍යාපාර වර්ධනයක් අත්කර දීම."
          : "Help businesses achieve sustainable growth through technology, strategy, and continuous digital improvement.",
      icon: TrendingUp,
    },
  ];

  // 7 Interconnected Digital Capabilities
  const capabilities = [
    {
      stage: "BUILD",
      icon: Code2,
      title:
        validLocale === "si"
          ? "සුවිශේෂී මෘදුකාංග සංවර්ධනය (Custom Software Development)"
          : "Custom Software Development",
      desc:
        validLocale === "si"
          ? "ඔබේ ව්‍යාපාරික මෙහෙයුම් කාර්යක්ෂම කරන සහ පුළුල් කළ හැකි වෙබ්, ජංගම සහ ව්‍යාපාරික මෘදුකාංග පද්ධති."
          : "Tailored web, mobile, and operational software engineered around how your business actually works.",
      href: "/services/software-product-development",
    },
    {
      stage: "BUILD & CONNECT",
      icon: Globe,
      title:
        validLocale === "si"
          ? "වෙබ් අඩවි නිර්මාණය සහ සංවර්ධනය (Website Design & Development)"
          : "Website Design & Development",
      desc:
        validLocale === "si"
          ? "වේගවත්, ආකර්ෂණීය සහ අමුත්තන් ගනුදෙනුකරුවන් බවට පත් කරන නවීන වෙබ් අත්දැකීම්."
          : "High-converting, fast, and responsive digital storefronts that turn visitors into loyal customers.",
      href: "/services/web-application-development",
    },
    {
      stage: "CONNECT",
      icon: Palette,
      title:
        validLocale === "si"
          ? "ඩිජිටල් සන්නාමකරණය සහ නිර්මාණාත්මක විසඳුම් (Digital Branding & Creative)"
          : "Digital Branding & Creative Solutions",
      desc:
        validLocale === "si"
          ? "පාරිභෝගික විශ්වාසය දිනාගන්නා UI/UX නිර්මාණ, කෙටි වීඩියෝ සහ දෘශ්‍ය සන්නාම අනන්‍යතාව."
          : "Human-centered UI/UX, visual storytelling, and short-form video assets that make your brand unforgettable.",
      href: "/services/content-short-video-production",
    },
    {
      stage: "ENGAGE",
      icon: Megaphone,
      title:
        validLocale === "si"
          ? "ඩිජිටල් අලෙවිකරණය සහ ප්‍රවර්ධන කළමනාකරණය (Digital Marketing & Campaigns)"
          : "Digital Marketing & Campaign Management",
      desc:
        validLocale === "si"
          ? "Facebook, Instagram, TikTok සහ TripAdvisor හරහා ඉලක්කගත පාරිභෝගිකයින් වෙත ළඟා වන ප්‍රවර්ධන."
          : "Strategic social presence and multi-channel campaigns across Facebook, Instagram, TikTok, and TripAdvisor.",
      href: "/services/social-media-setup-management",
    },
    {
      stage: "CONNECT & ENGAGE",
      icon: MessageSquareHeart,
      title:
        validLocale === "si"
          ? "පාරිභෝගික සබඳතා විසඳුම් (Customer Engagement Solutions)"
          : "Customer Engagement Solutions",
      desc:
        validLocale === "si"
          ? "වෙබ් අඩවියේ සිට WhatsApp සහ සමාජ මාධ්‍ය දක්වා පාරිභෝගිකයින් සමඟ අඛණ්ඩව සම්බන්ධ වන පද්ධති."
          : "Seamless booking flows, WhatsApp lead routing, and retention systems that keep customers coming back.",
      href: "/growth",
    },
    {
      stage: "BUILD & ENGAGE",
      icon: Cpu,
      title:
        validLocale === "si"
          ? "ව්‍යාපාර ස්වයංක්‍රීයකරණය සහ AI ඒකාබද්ධකරණය (Automation & AI Integration)"
          : "Business Automation & AI Integration",
      desc:
        validLocale === "si"
          ? "එදිනෙදා කාර්යයන් ස්වයංක්‍රීය කර කාලය ඉතිරි කරන ස්මාර්ට් තාක්ෂණික සහ AI විසඳුම්."
          : "Eliminate manual bottlenecks with intelligent workflows, smart notifications, and practical AI tools.",
      href: "/services/iot-development",
    },
    {
      stage: "UNDERSTAND & GROW",
      icon: Target,
      title:
        validLocale === "si"
          ? "ඩිජිටල් උපායමාර්ග සහ ව්‍යාපාර පරිවර්තනය (Digital Strategy & Transformation)"
          : "Digital Strategy & Business Transformation",
      desc:
        validLocale === "si"
          ? "නිවැරදි තාක්ෂණික මඟපෙන්වීම, දැනුම හුවමාරුව සහ දිගුකාලීන ව්‍යාපාර වර්ධන සැලසුම්."
          : "End-to-end roadmap, technology consulting, and hands-on knowledge transfer for sustainable scaling.",
      href: "/services/digital-growth-strategy",
    },
  ];

  // 5 Key Differentiators (Why Businesses Work With Us)
  const differentiators = [
    {
      icon: Compass,
      title:
        validLocale === "si"
          ? "තාක්ෂණයට පෙර ව්‍යාපාරික ගැටලුව හඳුනාගැනීම"
          : "We understand business problems before proposing technology.",
      desc:
        validLocale === "si"
          ? "අපි කේත ලිවීමට පෙර ඔබේ ව්‍යාපාරික ආකෘතිය, පාරිභෝගිකයින් සහ සැබෑ අභියෝග ගැඹුරින් අධ්‍යයනය කරන්නෙමු."
          : "We never push technology for its own sake. Every recommendation starts with your commercial reality and growth goals.",
    },
    {
      icon: Lightbulb,
      title:
        validLocale === "si"
          ? "සැබෑ ව්‍යාපාරික අවශ්‍යතා මත පදනම් වූ විසඳුම්"
          : "We create solutions based on actual business needs.",
      desc:
        validLocale === "si"
          ? "සෑම ව්‍යාපාරයක්ම එකිනෙකට වෙනස්ය. ඔබේ මෙහෙයුම් සහ අරමුණුවලට හරියටම ගැළපෙන විසඳුම් අපි ගොඩනඟන්නෙමු."
          : "No generic templates. We engineer custom platforms and digital workflows tailored to your stage of growth.",
    },
    {
      icon: Sparkles,
      title:
        validLocale === "si"
          ? "තාක්ෂණය, නිර්මාණශීලීත්වය සහ උපායමාර්ග එකම තැනකින්"
          : "We combine technology, creativity, and digital strategy.",
      desc:
        validLocale === "si"
          ? "මෘදුකාංග ඉංජිනේරුකරණය, ආකර්ෂණීය නිර්මාණ සහ සමාජ මාධ්‍ය වර්ධන උපායමාර්ග එකම කණ්ඩායමක් යටතේ ක්‍රියාත්මක වේ."
          : "Software engineering, brand design, and customer acquisition work in harmony under one unified team.",
    },
    {
      icon: Users,
      title:
        validLocale === "si"
          ? "පාරිභෝගික අත්දැකීම සහ ආකර්ෂණය කෙරෙහි විශේෂ අවධානය"
          : "We focus on customer experience and engagement.",
      desc:
        validLocale === "si"
          ? "ඔබේ පාරිභෝගිකයින්ට පහසුවෙන් භාවිතා කළ හැකි සහ ඔවුන්ව නිරන්තරයෙන් ව්‍යාපාරය සමඟ බැඳ තබාගන්නා අත්දැකීම් අපි නිර්මාණය කරන්නෙමු."
          : "Digital tools only succeed when customers love using them. We design every touchpoint for clarity and conversion.",
    },
    {
      icon: Handshake,
      title:
        validLocale === "si"
          ? "ව්‍යාපෘතියක් අවසන් කිරීමට වඩා දිගුකාලීන ව්‍යාපාරික වටිනාකම"
          : "We aim for long-term business value rather than simply completing projects.",
      desc:
        validLocale === "si"
          ? "ව්‍යාපෘතිය දියත් කිරීමෙන් පසුවද අඛණ්ඩව වර්ධනය වීමට අවශ්‍ය දැනුම, සහාය සහ මඟපෙන්වීම අපි ලබා දෙන්නෙමු."
          : "Launch is just the beginning. We stay with you to optimize, engage customers, and compound your digital momentum.",
    },
  ];

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brandName,
    description: tHome("philosophy_supporting"),
    email: siteConfig.contactEmail,
    telephone: siteConfig.phone,
    inLanguage: validLocale,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <div className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />

      {/* Soft Ambient Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[960px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/10 via-orange-500/10 to-transparent blur-3xl"
      />

      {/* A. HERO SECTION — A Digital Business Growth Partner */}
      <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{tHome("positioning_badge")}</span>
            </span>

            <h1 className="mt-6 text-[length:var(--text-hero)] font-bold leading-[1.12] tracking-tight text-[var(--text-primary)]">
              {validLocale === "si" ? (
                <>
                  ඔබේ ව්‍යාපාරය සතු හැකියාව,{" "}
                  <span className="brand-gradient-text">
                    සැබෑ ප්‍රගතියක් බවට පත් කරමු.
                  </span>
                </>
              ) : (
                <>
                  Your Business Has Potential.{" "}
                  <span className="brand-gradient-text">
                    Let&apos;s Turn It Into Progress.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              {tHome("hero_subheadline")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="keep-white inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-orange-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-500"
              >
                <span className="keep-white">{tCta("grow_business")}</span>
                <ArrowUpRight className="keep-white h-4 w-4" />
              </Link>
              <a
                href="#capabilities"
                className="inline-flex min-h-[50px] items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-xs transition-all hover:border-orange-500/40"
              >
                <span>{tCta("explore_what_we_do")}</span>
                <ArrowUpRight className="h-4 w-4 text-orange-500" />
              </a>
            </div>

            {companyData.stats.length > 0 && (
              <div className="mt-12 grid grid-cols-2 gap-6 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-3">
                {companyData.stats.map((st) => (
                  <div key={st.id}>
                    <p className="text-3xl font-bold text-orange-500">
                      {st.value}
                      {st.suffix}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {st.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <HeroVisual
              enable3d={siteConfig.enable3dHero}
              locale={validLocale}
            />
          </div>
        </div>
      </section>

      {/* B. OUR ACTUAL PURPOSE & CENTRAL BRAND PHILOSOPHY */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                {tHome("positioning_badge")}
              </span>
              <h2 className="text-[length:var(--text-h2)] font-bold leading-tight text-[var(--text-primary)]">
                {tHome("purpose_title")}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                {tHome("purpose_desc")}
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/80 p-6 sm:p-8 space-y-4">
                <blockquote className="text-lg font-bold leading-snug text-[var(--text-primary)] sm:text-xl">
                  &ldquo;{tHome("philosophy_quote")}&rdquo;
                </blockquote>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {tHome("philosophy_supporting")}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[
                    validLocale === "si" ? "ඩිජිටල් යටිතල පහසුකම්" : "Digital Infrastructure",
                    validLocale === "si" ? "පාරිභෝගික සබඳතා" : "Customer Connections",
                    validLocale === "si" ? "තිරසාර වර්ධනය" : "Sustainable Growth",
                  ].map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-500"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C. FIVE-STAGE GROWTH PROCESS (UNDERSTAND -> BUILD -> CONNECT -> ENGAGE -> GROW) */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
            UNDERSTAND &rarr; BUILD &rarr; CONNECT &rarr; ENGAGE &rarr; GROW
          </span>
          <h2 className="mt-2 text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
            {tHome("process_title")}
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] sm:text-base">
            {tHome("process_subtitle")}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {fiveStages.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.code}
                className="glass-card glass-card-hover relative flex flex-col justify-between rounded-3xl p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-500">
                      STAGE {st.step}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-wide text-[var(--text-primary)]">
                    {st.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                    {st.desc}
                  </p>
                </div>
                <div className="mt-6 h-1 w-12 rounded-full bg-orange-500/40" />
              </div>
            );
          })}
        </div>
      </section>

      {/* D. OUR INTERCONNECTED DIGITAL CAPABILITIES */}
      <section
        id="capabilities"
        className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
              {validLocale === "si"
                ? "එකිනෙකට බැඳුණු ඩිජිටල් පද්ධතිය"
                : "Integrated Growth Capabilities"}
            </span>
            <h2 className="mt-2 text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
              {tHome("capabilities_title")}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {tHome("capabilities_subtitle")}
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:underline"
          >
            <span>{tCta("read_more")}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.title}
                href={cap.href}
                className="glass-card glass-card-hover group flex flex-col justify-between rounded-3xl p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-0.5 font-mono text-[10px] font-bold text-indigo-500">
                      {cap.stage}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[var(--text-primary)] group-hover:text-orange-500">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                    {cap.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs font-semibold text-orange-500">
                  <span>{tCta("read_more")}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* E. WHY BUSINESSES WORK WITH US */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
            {validLocale === "si" ? "අපගේ විශේෂත්වය" : "The Vardhel Advantage"}
          </span>
          <h2 className="mt-2 text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
            {tHome("why_us_title")}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((diff, idx) => {
            const Icon = diff.icon;
            return (
              <div
                key={idx}
                className="glass-card rounded-3xl p-6 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--text-muted)]">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {diff.title}
                </h3>
                <p className="text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                  {diff.desc}
                </p>
              </div>
            );
          })}

          {/* Partnership Guarantee Card */}
          <div className="glass-card flex flex-col justify-between rounded-3xl border border-orange-500/30 p-6">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {validLocale === "si"
                  ? "ඔබේ දිගුකාලීන ඩිජිටල් වර්ධන හවුල්කරු"
                  : "Built for Long-Term Business Momentum"}
              </h3>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                {validLocale === "si"
                  ? "ඔබේ ව්‍යාපාරයේ ඊළඟ අදියර සඳහා අවශ්‍ය තාක්ෂණය සහ පාරිභෝගික ආකර්ෂණය අපි එක්ව ගොඩනඟමු."
                  : "Let's evaluate where your business is today and map out the exact digital capabilities needed to move forward."}
              </p>
            </div>
            <div className="mt-4 pt-2">
              <Link
                href="/growth"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:underline"
              >
                <span>
                  {validLocale === "si"
                    ? "අපගේ වර්ධන හවුල්කාරිත්වය ගැන කියවන්න"
                    : "Learn How Our Partnership Works"}
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED FLAGSHIP PRODUCTS (Proof of Engineering Capability) */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-500">
              {validLocale === "si" ? "අපගේ නිෂ්පාදන" : "Flagship Platforms"}
            </span>
            <h2 className="mt-2 text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
              {validLocale === "si"
                ? "Vardhel විසින් නිර්මාණය කළ මෘදුකාංග පද්ධති"
                : "Platforms Engineered by Vardhel"}
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:underline"
          >
            <span>{tCta("explore_products")}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {products.map((prod) => (
            <Link
              key={prod.id}
              href={`/products/${prod.slug}`}
              className="glass-card glass-card-hover group flex flex-col justify-between overflow-hidden rounded-3xl p-6"
            >
              <div>
                <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-slate-900/60 p-3">
                  <Image
                    src={prod.coverUrl}
                    alt={prod.name}
                    width={420}
                    height={240}
                    className="h-full w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-orange-500">
                    {prod.name}
                  </h3>
                  <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-orange-500">
                    {prod.status}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-indigo-500">
                  {prod.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {prod.shortDescription}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs font-semibold text-orange-500">
                <span>{tCta("read_more")}</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* LIVE PROJECTS (if any published) */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
            {validLocale === "si" ? "සජීවී ව්‍යාපෘති" : "Live Work & Case Studies"}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="glass-card rounded-3xl p-6 space-y-4"
              >
                <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-500">
                  {proj.industry}
                </span>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  {proj.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {proj.summary}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/projects/${proj.slug}`}
                    className="keep-white inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    <span className="keep-white">Case Study</span>
                    <ArrowUpRight className="keep-white h-3.5 w-3.5" />
                  </Link>
                  {proj.links.map((l) => (
                    <a
                      key={l.id}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--text-primary)]"
                    >
                      <span>{l.label}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* OFFERS */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
          {validLocale === "si" ? "විශේෂ දීමනා" : "Tailored Growth Tracks"}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="glass-card glass-card-hover flex flex-col justify-between rounded-3xl p-8"
            >
              <div>
                {offer.badge && (
                  <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-500">
                    {offer.badge}
                  </span>
                )}
                <h3 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
                  {offer.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {offer.description}
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href={offer.ctaHref}
                  className="keep-white inline-flex min-h-[44px] items-center gap-2 rounded-full bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
                >
                  <span className="keep-white">{offer.ctaLabel}</span>
                  <ArrowUpRight className="keep-white h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOMER FEEDBACK (Only approved reviews shown; zero fake stats/reviews) */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
              {validLocale === "si" ? "පාරිභෝගික අදහස්" : "Customer Experiences"}
            </h2>
          </div>
          <Link
            href="/feedback"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-orange-500/35 bg-orange-500/10 px-5 py-2.5 text-xs font-semibold text-orange-500 hover:bg-orange-500/20"
          >
            <span>{tCta("share_experience")}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {feedbackList.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {feedbackList.slice(0, 6).map((fb) => (
              <div key={fb.id} className="glass-card rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: fb.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  &ldquo;{fb.message}&rdquo;
                </p>
                <div className="pt-2 text-xs">
                  <p className="font-bold text-[var(--text-primary)]">
                    {fb.name}
                  </p>
                  {(fb.role || fb.company) && (
                    <p className="text-[var(--text-muted)]">
                      {fb.role} {fb.company ? `@ ${fb.company}` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ ACCORDION */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
          {validLocale === "si"
            ? "නිතර අසන ප්‍රශ්න (FAQ)"
            : "Frequently Asked Questions"}
        </h2>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="glass-card group rounded-2xl p-5 open:border-orange-500/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[var(--text-primary)]">
                <span>{faq.question}</span>
                <span className="ml-4 text-orange-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* F. FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-[1440px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="brand-gradient-bg keep-white rounded-3xl p-8 text-center text-white shadow-xl sm:p-14">
          <span className="keep-white inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white">
            <CheckCircle2 className="keep-white h-3.5 w-3.5" />
            <span className="keep-white">{tHome("positioning_badge")}</span>
          </span>
          <h2 className="keep-white mt-4 text-3xl font-bold text-white sm:text-4xl">
            {tHome("final_cta_title")}
          </h2>
          <p className="keep-white mx-auto mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
            {tHome("final_cta_subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition-transform hover:scale-105"
            >
              <span>{tCta("start_conversation")}</span>
              <ArrowUpRight className="h-4 w-4 text-orange-600" />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="keep-white inline-flex min-h-[50px] items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20"
            >
              <MessageCircle className="keep-white h-5 w-5 text-emerald-400" />
              <span className="keep-white">{tCta("chat_whatsapp")}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
