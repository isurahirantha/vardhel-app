import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import {
  getPublishedProducts,
  getPublishedProjects,
  getApprovedFeedback,
  getPublishedFaqs,
  getAboutCompanyData,
} from "@/server/services/public-content.service";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import { safeJsonLd } from "@/lib/security/sanitize";
import { HeroGrowthStaircase } from "@/components/animations/hero-growth-staircase";
import { HeroParticleSection } from "@/components/animations/hero-particle-section";
import { HowVardhelWorksGrid } from "@/components/animations/how-vardhel-works-grid";
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
    companyData,
  ] = await Promise.all([
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
    getTranslations({ locale: validLocale, namespace: "home" }),
    getPublishedProducts(validLocale),
    getPublishedProjects(validLocale),
    getApprovedFeedback(validLocale),
    getPublishedFaqs(validLocale),
    getAboutCompanyData(validLocale),
  ]);

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    siteConfig.whatsappDefaultMessage
  );

  // 7 Interconnected Digital Capabilities
  const capabilities = [
    {
      stage: "BUILD · FEATURED",
      icon: Code2,
      title:
        validLocale === "si"
          ? "සුවිශේෂී මෘදුකාංග සංවර්ධනය (Custom Software Development)"
          : "Custom Software Development",
      desc:
        validLocale === "si"
          ? "ඔබේ ව්‍යාපාරික මෙහෙයුම් කාර්යක්ෂම කරන සහ පුළුල් කළ හැකි වෙබ්, ජංගම සහ ව්‍යාපාරික මෘදුකාංග පද්ධති."
          : "Tailored web, mobile, and operational software engineered around how your business actually works — never generic templates.",
      href: "/services/software-product-development",
      ctaLabel:
        validLocale === "si"
          ? "සුවිශේෂී මෘදුකාංග විසඳුම් බලන්න"
          : "Explore Custom Software Development",
      gridSpan: "lg:col-span-12",
    },
    {
      stage: "BUILD · CONNECT",
      icon: Globe,
      title:
        validLocale === "si"
          ? "වෙබ් අඩවි නිර්මාණය සහ සංවර්ධනය (Website Design & Development)"
          : "Website Design & Development",
      desc:
        validLocale === "si"
          ? "වේගවත්, SEO හා AI සෙවුම්වලට ගැළපෙන, අමුත්තන් ගනුදෙනුකරුවන් බවට පත් කරන නවීන වෙබ් අත්දැකීම්."
          : "High-converting, fast websites built with technical SEO and AI search readiness to turn visitors into customers.",
      href: "/services/web-application-development",
      ctaLabel:
        validLocale === "si"
          ? "වෙබ් සංවර්ධනය ගැන කියවන්න"
          : "Explore Website Development",
      gridSpan: "lg:col-span-6",
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
      ctaLabel:
        validLocale === "si"
          ? "සන්නාමකරණ විසඳුම් බලන්න"
          : "Explore Branding & Creative",
      gridSpan: "lg:col-span-6",
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
          ? "Facebook, Instagram, TikTok, TripAdvisor සහ SEO හරහා ඉලක්කගත පාරිභෝගිකයින් වෙත ළඟා වන ප්‍රවර්ධන."
          : "Strategic social presence, SEO/AI visibility, and multi-channel campaigns across Facebook, Instagram, TikTok, and TripAdvisor.",
      href: "/services/social-media-setup-management",
      ctaLabel:
        validLocale === "si"
          ? "ඩිජිටල් අලෙවිකරණය බලන්න"
          : "Explore Digital Marketing",
      gridSpan: "lg:col-span-4",
    },
    {
      stage: "CONNECT · ENGAGE",
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
      ctaLabel:
        validLocale === "si"
          ? "පාරිභෝගික සබඳතා විසඳුම් බලන්න"
          : "Explore Engagement Solutions",
      gridSpan: "lg:col-span-4",
    },
    {
      stage: "BUILD · ENGAGE",
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
      ctaLabel:
        validLocale === "si"
          ? "AI හා ස්වයංක්‍රීයකරණය බලන්න"
          : "Explore Automation & AI",
      gridSpan: "lg:col-span-4",
    },
    {
      stage: "UNDERSTAND · GROW",
      icon: Target,
      title:
        validLocale === "si"
          ? "ඩිජිටල් උපායමාර්ග සහ ව්‍යාපාර පරිවර්තනය (Digital Strategy & Transformation)"
          : "Digital Strategy & Business Transformation",
      desc:
        validLocale === "si"
          ? "නිවැරදි තාක්ෂණික මඟපෙන්වීම, දැනුම හුවමාරුව සහ දිගුකාලීන ව්‍යාපාර වර්ධන සැලසුම්. තාක්ෂණයට පෙර ව්‍යාපාරික අවශ්‍යතාව හඳුනාගැනීම."
          : "End-to-end roadmap, technology consulting, and hands-on knowledge transfer for sustainable scaling. Every engagement begins here — we understand your commercial reality before proposing any technology.",
      href: "/growth",
      ctaLabel:
        validLocale === "si"
          ? "වර්ධන හවුල්කාරිත්වය ගැන කියවන්න"
          : "Explore Growth Partnership",
      gridSpan: "lg:col-span-12",
    },
  ];

  // 5 Key Differentiators (Why Businesses Work With Us)
  const differentiators = [
    {
      icon: Compass,
      title:
        validLocale === "si"
          ? "පළමුව ව්‍යාපාරය ගැඹුරින් අධ්‍යයනය කර සම්බන්ධ කර ගැනීම"
          : "We onboard your business into an active intelligence system.",
      desc:
        validLocale === "si"
          ? "අපි ඔබේ ව්‍යාපාරික ආකෘතිය, ඉලක්ක, වෙළඳපල තරඟකාරිත්වය සහ පාරිභෝගික හැසිරීම් ගැඹුරින් අධ්‍යයනය කර VARDHEL පද්ධතියට සම්බන්ධ කර ගන්නෙමු."
          : "We don't start by asking what to post. We establish deep structured intelligence on your business, market, audience, and commercial capacity before recommending any action.",
    },
    {
      icon: Lightbulb,
      title:
        validLocale === "si"
          ? "කෘත්‍රිම බුද්ධි පාදක සාක්ෂි සහිත වර්ධන උපායමාර්ග"
          : "Evidence-led AI strategy, not generic marketing advice.",
      desc:
        validLocale === "si"
          ? "සාමාන්‍ය හෝ පුස්සක් වූ උපදෙස් වෙනුවට, සැබෑ දත්ත සහ වෙළඳපල අවස්ථා මත පදනම් වූ විශේෂිත වර්ධන සැලැස්මක් අපි සකස් කරන්නෙමු."
          : "Every strategic move combines deep business context, platform-specific behavior, and AI-driven analysis tailored to your specific commercial reality.",
    },
    {
      icon: Sparkles,
      title:
        validLocale === "si"
          ? "ක්‍රියාකාරී නාලිකා ලෙස මෘදුකාංග, වෙබ් සහ සමාජ මාධ්‍ය"
          : "Execution channels aligned to a single intelligence core.",
      desc:
        validLocale === "si"
          ? "මෘදුකාංග පද්ධති, වෙබ් අඩවි සහ සමාජ මාධ්‍ය යනු හුදකලා සේවා නොවේ — ඒවා ඔබේ ව්‍යාපාරික වර්ධන උපායමාර්ගයේ ප්‍රායෝගික මෙවලම් වේ."
          : "Custom software, high-converting websites, and managed social channels act as coordinated execution engines driven by verified business intelligence.",
    },
    {
      icon: Users,
      title:
        validLocale === "si"
          ? "අඛණ්ඩ ක්‍රියාකාරීත්ව නිරීක්ෂණය සහ තීරණ ගැනීම"
          : "Continuous performance tracking and proactive guidance.",
      desc:
        validLocale === "si"
          ? "අපි නිරන්තරයෙන් ව්‍යාපාරික ප්‍රතිඵල අධීක්ෂණය කරමින්, නව අවස්ථා හඳුනාගෙන, උපායමාර්ගය තවදුරටත් සාර්ථක කර ගැනීමට මඟ පෙන්වන්නෙමු."
          : "We track digital performance indicators, identify emerging market opportunities, and use evidence to guide your next strategic moves.",
    },
    {
      icon: Handshake,
      title:
        validLocale === "si"
          ? "ව්‍යාපෘතියක් භාරදී ඉවත් වීමට වඩා අඛණ්ඩ වර්ධන හවුල්කාරිත්වයක්"
          : "Ongoing partnership for sustainable, compounding growth.",
      desc:
        validLocale === "si"
          ? "වෙබ් අඩවියක් සාදා හෝ සමාජ මාධ්‍ය පෝස්ට් කිහිපයක් දමා අපි ඉවත් නොවෙමු. ඔබේ ව්‍යාපාරයේ අඛණ්ඩ වර්ධනය වෙනුවෙන් අපි ඔබ සමඟ රැඳී සිටින්නෙමු."
          : "Your business evolves, and so does our support. We provide ongoing intelligence and optimization rather than simply delivering a project and walking away.",
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
    <div className="relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />

      {/* =========================================================================
        UI DESIGN & PALETTE GUIDELINES FOR CONTRIBUTORS
        -------------------------------------------------------------------------
        If you are modifying or extending the UI in this page or any other public
        view, you MUST adhere to the following architectural styling rules:

        1. BRAND COLOR SYSTEM:
           - NEVER hardcode arbitrary RGB/HEX colors or unmapped Tailwind shades
             (e.g. blue-*, purple-*, gray-*) for brand elements.
           - Vardhel's brand palette is driven by dynamic CSS custom properties:
             * var(--brand-primary): Vardhel Emerald/Teal (#228870 default or from Admin Settings)
             * var(--brand-secondary): Deep Obsidian Navy (#0e192c)
             * var(--brand-accent-glow): Luminous Emerald Glow (#10b981)
           - Note: Tailwind's orange-* utility classes (bg-orange-*, text-orange-*,
             border-orange-*) are dynamically mapped in globals.css to var(--brand-primary).
             Similarly, indigo-* is mapped to var(--brand-secondary). Use these utilities
             or CSS variables directly to maintain consistency with Admin Settings.

        2. LIGHT & DARK MODE CONTRAST (WCAG AA COMPLIANCE):
           - Light theme background is warm pearl (--bg-canvas: #fafaf8), text is #0e192c.
           - Dark theme background is midnight obsidian (--bg-canvas: #0a111f), text is #f4f2eb.
           - Text Gradients (.brand-gradient-text): Must fade into luminous tones in dark
             mode (html.dark) and never into dark navy/black, which causes text invisibility.
           - Surface elements: Always use var(--bg-surface) or var(--bg-surface-elevated)
             instead of hardcoded bg-slate-900 or bg-white to ensure seamless adaptation.

        3. GLASSMORPHISM & ELEVATION:
           - Use .glass-card for elevated content panels with subtle border (var(--border-subtle)).
           - Ambient glows should blend var(--brand-primary) and var(--brand-accent-glow) at
             controlled opacity (8-15%) with heavy blur (blur-3xl).

        4. BILINGUAL & TYPOGRAPHY INTEGRITY:
           - All headings must accommodate both English and Sinhala without line-breaking glitches.
           - When adding short badge pills or dense grid items, prevent text overflow with
             proper padding, shrink-0 on icons, and min-width awareness.
        ========================================================================= */}

      {/* Soft Ambient Background Glow (Aligned with Vardhel Brand Palette) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[960px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[var(--brand-primary)]/10 via-[var(--brand-accent-glow)]/10 to-transparent blur-3xl"
      />

      {/* A. HERO SECTION — Clean Pure White Surface (extends seamlessly behind floating navbar) */}
      <HeroParticleSection className="bg-[var(--bg-surface)] -mt-[76px] pt-[92px] pb-8 sm:pt-[96px] sm:pb-10 lg:pt-[100px] lg:pb-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{tHome("positioning_badge")}</span>
            </span>

            <h1 className="mt-4 text-[length:var(--text-hero)] font-bold leading-[1.1] tracking-tight text-[var(--text-primary)] [text-wrap:balance]">
              {validLocale === "si" ? (
                <span className="brand-gradient-text">
                  බුද්ධිමය ව්‍යාපාර වර්ධනය.
                </span>
              ) : (
                <span className="brand-gradient-text">
                  Intelligence-Led Business Growth.
                </span>
              )}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
              {tHome("hero_subheadline")}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="keep-white inline-flex min-h-[50px] items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:opacity-95 hover:shadow-emerald-500/40"
              >
                <span className="keep-white">{tCta("grow_business")}</span>
                <ArrowUpRight className="keep-white h-4 w-4" />
              </Link>
              <a
                href="#capabilities"
                className="inline-flex min-h-[50px] items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-xs transition-all hover:border-emerald-500/50 hover:bg-[var(--bg-surface-elevated)]"
              >
                <span>{tCta("explore_what_we_do")}</span>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </a>
            </div>

            {/* Micro Social-Proof Trust Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex -space-x-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-canvas)] bg-[var(--bg-surface-elevated)] font-mono text-[10px] font-bold text-emerald-500"
                  >
                    ★
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">5.0 Rating</span>
                <span>•</span>
                <span>
                  {validLocale === "si"
                    ? "ව්‍යාපාර 20+ ක විශ්වාසය දිනූ තාක්ෂණික හවුල්කරු"
                    : "Trusted by 20+ ambitious businesses"}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroGrowthStaircase locale={validLocale} />
          </div>
        </div>
      </div>
    </HeroParticleSection>

    {companyData.stats.length > 0 && (
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/60 py-6">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {companyData.stats.map((st) => (
            <div key={st.id} className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {st.value}
                {st.suffix}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{st.label}</p>
            </div>
          ))}
        </div>
      </section>
    )}

      {/* 2. CREDIBILITY & CLIENT SPECTRUM STRIP (Fade-Masked Auto-Scrolling Ticker) */}
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-3 sm:py-4">
        <div className="ticker-mask relative mx-auto max-w-[1440px] overflow-hidden px-4">
          <div className="animate-ticker flex items-center gap-3">
            <div className="flex items-center gap-2.5 pr-4 text-xs font-semibold text-[var(--text-secondary)]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="uppercase tracking-wider text-[var(--text-muted)] font-mono text-[11px] whitespace-nowrap">
                {validLocale === "si" ? "ඉලක්කගත ක්ෂේත්‍ර" : "Industries We Power"}
              </span>
            </div>

            {[
              validLocale === "si" ? "▸ සංචාරක සහ ආගන්තුක සත්කාර" : "▸ Hospitality & Tourism",
              validLocale === "si" ? "▸ ඊ-වාණිජ්‍යය සහ සිල්ලර" : "▸ E-Commerce & Retail",
              validLocale === "si" ? "▸ සෞඛ්‍ය සහ සායනික" : "▸ Healthcare & Wellness",
              validLocale === "si" ? "▸ නිශ්චල දේපල සහ ඉදිකිරීම්" : "▸ Real Estate & Architecture",
              validLocale === "si" ? "▸ වෘත්තීය සේවා සහ ආයතනික" : "▸ Professional Services",
              validLocale === "si" ? "▸ උත්සව සහ විනෝදාස්වාදය" : "▸ Events & Entertainment",
            ].map((ind, i) => (
              <span
                key={`ind-1-${i}`}
                className="whitespace-nowrap rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-2xs transition-colors hover:border-emerald-500/50"
              >
                {ind}
              </span>
            ))}

            {/* Seamless duplicate loop */}
            <div className="flex items-center gap-2.5 pl-4 pr-4 text-xs font-semibold text-[var(--text-secondary)]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="uppercase tracking-wider text-[var(--text-muted)] font-mono text-[11px] whitespace-nowrap">
                {validLocale === "si" ? "ඉලක්කගත ක්ෂේත්‍ර" : "Industries We Power"}
              </span>
            </div>

            {[
              validLocale === "si" ? "▸ සංචාරක සහ ආගන්තුක සත්කාර" : "▸ Hospitality & Tourism",
              validLocale === "si" ? "▸ ඊ-වාණිජ්‍යය සහ සිල්ලර" : "▸ E-Commerce & Retail",
              validLocale === "si" ? "▸ සෞඛ්‍ය සහ සායනික" : "▸ Healthcare & Wellness",
              validLocale === "si" ? "▸ නිශ්චල දේපල සහ ඉදිකිරීම්" : "▸ Real Estate & Architecture",
              validLocale === "si" ? "▸ වෘත්තීය සේවා සහ ආයතනික" : "▸ Professional Services",
              validLocale === "si" ? "▸ උත්සව සහ විනෝදාස්වාදය" : "▸ Events & Entertainment",
            ].map((ind, i) => (
              <span
                key={`ind-2-${i}`}
                className="whitespace-nowrap rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-2xs transition-colors hover:border-emerald-500/50"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* C. HOW VARDHEL WORKS — Business Intelligence System cycle */}
      <section className="bg-[var(--bg-surface-elevated)] py-12 sm:py-16 border-b border-[var(--border-subtle)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              {validLocale === "si" ? "VARDHEL ක්‍රියා කරන ආකාරය" : "How VARDHEL Works"}
            </span>
            <h2 className="mt-2 text-[length:var(--text-h2)] font-bold text-[var(--text-primary)] [text-wrap:balance]">
              {validLocale === "si"
                ? "අපි ආරම්භ කරන්නේ ඔබේ ව්‍යාපාරය තේරුම් ගැනීමෙනි"
                : "We start by understanding your business — not by asking what to post."}
            </h2>
          </div>
          <HowVardhelWorksGrid
            steps={[
              {
                title: validLocale === "si" ? "ඇතුළත් කිරීම" : "Onboard",
                desc:
                  validLocale === "si"
                    ? "ඔබේ ව්‍යාපාරයේ ඉලක්ක, ගනුදෙනුකරුවන් සහ වෙළඳපල අපි පද්ධතියට ඇතුළත් කරමු."
                    : "We bring your business into VARDHEL: goals, audience, market and resources.",
              },
              {
                title: validLocale === "si" ? "පර්යේෂණය" : "Research",
                desc:
                  validLocale === "si"
                    ? "තරඟකරුවන්, වෙළඳපල සහ පාරිභෝගික හැසිරීම් සාක්ෂි මත පදනම්ව අධ්‍යයනය."
                    : "Competitors, market conditions and audience behaviour, grounded in evidence.",
              },
              {
                title: validLocale === "si" ? "උපායමාර්ගය" : "Strategy",
                desc:
                  validLocale === "si"
                    ? "ඔබේ ව්‍යාපාරයට ගැළපෙන වර්ධන සැලැස්මක්."
                    : "A growth plan tailored to your business, not generic social media advice.",
              },
              {
                title: validLocale === "si" ? "නිරීක්ෂණය" : "Monitor",
                desc:
                  validLocale === "si"
                    ? "ක්‍රියාකාරීත්ව දත්ත සහ අවස්ථා අඛණ්ඩව නිරීක්ෂණය."
                    : "Ongoing tracking of available performance signals and opportunities.",
              },
              {
                title: validLocale === "si" ? "ක්‍රියාත්මක කිරීම සහ දියුණු කිරීම" : "Execute & Improve",
                desc:
                  validLocale === "si"
                    ? "මෘදුකාංග, වෙබ් සහ සමාජ මාධ්‍ය ක්‍රියාත්මක කර ප්‍රතිඵල අනුව වැඩිදියුණු කරමු."
                    : "Software, websites and social channels delivered, then refined from results.",
              },
            ]}
          />
        </div>
      </section>

      {/* D. OUR INTERCONNECTED DIGITAL CAPABILITIES — Clean Surface (White) */}
      <section
        id="capabilities"
        className="bg-[var(--bg-surface)] py-10 sm:py-12 lg:py-14 scroll-mt-24 border-y border-[var(--border-subtle)]"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {validLocale === "si"
                  ? "එකිනෙකට බැඳුණු ඩිජිටල් පද්ධතිය"
                  : "Integrated Growth Capabilities"}
              </span>
              <h2 className="mt-1.5 text-[length:var(--text-h2)] font-bold text-[var(--text-primary)] [text-wrap:balance]">
                {tHome("capabilities_title")}
              </h2>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                {tHome("capabilities_subtitle")}
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>{tCta("read_more")}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Row 1: Core Engineering & Strategy (2 Featured Cards) */}
          <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-12">
            {[
              { cap: capabilities[0]!, span: "lg:col-span-7", isFlagship: true },
              { cap: capabilities[6]!, span: "lg:col-span-5", isFlagship: false },
            ].map(({ cap, span, isFlagship }) => {
              const Icon = cap.icon;
              return (
                <Link
                  key={cap.title}
                  href={cap.href}
                  className={`glass-card glass-card-hover group flex flex-col justify-between rounded-2xl p-5 sm:p-6 ${span}`}
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-[#04261f] shadow-sm shadow-emerald-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        {cap.stage}
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg sm:text-xl font-bold leading-snug text-[var(--text-primary)]">
                      {cap.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                      {cap.desc}
                    </p>
                  </div>

                  {isFlagship ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-emerald-500/15">
                      {[
                        validLocale === "si" ? "සැකිලි රහිත ගැළපුම" : "Custom Architecture",
                        validLocale === "si" ? "ඉහළ වේගය" : "High Speed & Conversion",
                        validLocale === "si" ? "සම්පූර්ණ IP අයිතිය" : "Full IP Ownership",
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200"
                        >
                          <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-1.5 pt-3 border-t border-emerald-500/15 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <span>{cap.ctaLabel}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Row 2: 5 Compact Execution Channels */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {capabilities.slice(1, 6).map((cap) => {
              const Icon = cap.icon;
              return (
                <Link
                  key={cap.title}
                  href={cap.href}
                  className="glass-card glass-card-hover group flex flex-col justify-between rounded-2xl p-5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-600" />
                    </div>
                    <h3 className="mt-3.5 text-sm font-bold leading-snug text-[var(--text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cap.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {cap.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    {/* E. WHY BUSINESSES WORK WITH US — Horizontal Spotlight + 3-over-2 Bento Grid */}
    <section className="bg-[var(--bg-surface-elevated)]/60 py-14 sm:py-16 lg:py-20 border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Centered Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{validLocale === "si" ? "අපගේ විශේෂත්වය" : "The Vardhel Advantage"}</span>
          </span>
          <h2 className="mt-3 text-[length:var(--text-h2)] font-bold leading-tight text-[var(--text-primary)] [text-wrap:balance]">
            {tHome("why_us_title")}
          </h2>
        </div>

        {/* Full-Width Horizontal Philosophy Spotlight */}
        <div className="glass-card mt-10 rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-8 space-y-2.5">
              <span className="block font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                {tHome("positioning_badge")}
              </span>
              <blockquote className="text-xl font-bold leading-snug text-[var(--text-primary)] sm:text-2xl [text-wrap:balance]">
                &ldquo;{tHome("philosophy_quote")}&rdquo;
              </blockquote>
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
                {tHome("philosophy_supporting")}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-between gap-5">
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {[
                  validLocale === "si" ? "ඩිජිටල් යටිතල පහසුකම්" : "Digital Infrastructure",
                  validLocale === "si" ? "පාරිභෝගික සබඳතා" : "Customer Connections",
                  validLocale === "si" ? "තිරසාර වර්ධනය" : "Sustainable Growth",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              <Link
                href="/growth"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-xs font-bold text-[#04261f] shadow-md shadow-emerald-500/20 transition-all hover:opacity-95"
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

        {/* 3-over-2 Balanced Bento Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {differentiators.map((diff, idx) => {
            const Icon = diff.icon;
            const spanClass =
              idx < 3
                ? "lg:col-span-2"
                : idx === 4
                ? "md:col-span-2 lg:col-span-3"
                : "lg:col-span-3";

            return (
              <div
                key={idx}
                className={`glass-card glass-card-hover group flex flex-col justify-between rounded-2xl p-5 ${spanClass}`}
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold leading-snug text-[var(--text-primary)]">
                      {diff.title}
                    </h3>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                    {diff.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* FEATURED FLAGSHIP PRODUCTS — Clean Surface (White) */}
    <section className="bg-[var(--bg-surface)] py-12 sm:py-16 lg:py-20 border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
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
          {products.map((prod) => {
            const hasCover = Boolean(prod.coverUrl);
            const isEventLoom = prod.slug.includes("event");
            const isCaptureLoom = prod.slug.includes("capture");
            const gradientBg = isEventLoom
              ? "from-[#10b981] to-[#14b8a6]"
              : isCaptureLoom
              ? "from-[#1E293B] to-[#334155]"
              : "from-[#4C1D95] to-[#831843]";

            return (
              <Link
                key={prod.id}
                href={`/products/${prod.slug}`}
                className="glass-card glass-card-hover group flex flex-col justify-between overflow-hidden rounded-3xl p-6"
              >
                <div>
                  <div className={`relative flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradientBg} p-3 shadow-inner`}>
                    <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#10B981] px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#06231B] shadow-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#06231B] animate-pulse" />
                      LIVE
                    </span>

                    {hasCover ? (
                      <div className="relative h-full w-full overflow-hidden rounded-xl">
                        <img
                          src={prod.coverUrl}
                          alt={prod.name}
                          loading="lazy"
                          className="h-full w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      /* Stylized Product Dashboard Mockup from template */
                      <div className="w-[85%] max-w-[240px] rounded-xl bg-white/95 p-3.5 shadow-lg backdrop-blur-xs">
                        <div className="h-1.5 w-full rounded-full bg-slate-200 mb-1.5" />
                        <div className="h-1.5 w-3/5 rounded-full bg-slate-200 mb-2" />
                        <div className="h-1.5 w-4/5 rounded-full bg-[#10B981] mb-2.5" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                            <span className="h-2 w-2 rounded-xs bg-[#10B981]" />
                            <span>Workflow &amp; Core Operations</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                            <span className="h-2 w-2 rounded-xs bg-slate-200" />
                            <span>Client Review &amp; Routing</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
                            <span className="h-2 w-2 rounded-xs bg-slate-200" />
                            <span>Analytics &amp; ROI Tracking</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                      {prod.name}
                    </h3>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-500">
                      {prod.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-indigo-500 font-mono">
                    {prod.tagline}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {prod.shortDescription}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-xs font-semibold text-emerald-500 group-hover:text-emerald-400">
                  <span>Explore {prod.name}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>

    {/* CUSTOMER FEEDBACK — Clean Surface (White) */}
    <section className="bg-[var(--bg-surface)] py-12 sm:py-16 lg:py-20 border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
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
      </div>
    </section>

    {/* FAQ ACCORDION — Soft Band Background */}
    <section className="bg-[var(--bg-surface-elevated)]/60 py-12 sm:py-16 lg:py-20 border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-[length:var(--text-h2)] font-bold text-[var(--text-primary)]">
          {validLocale === "si"
            ? "නිතර අසන ප්‍රශ්න (FAQ)"
            : "Frequently Asked Questions"}
        </h2>
        {/* Frequently Asked Questions */}
        <div className="mt-8 space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={faq.id}
              open={idx === 0}
              className="glass-card group rounded-2xl p-5 open:border-emerald-500/40 transition-colors"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-[var(--text-primary)]">
                <span>{faq.question}</span>
                <span className="ml-4 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-emerald-500 transition-transform group-open:rotate-45 group-open:bg-emerald-500 group-open:text-white">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>

      {/* F. FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-[1440px] px-4 pt-2 pb-12 sm:px-6 sm:pt-4 sm:pb-16 lg:px-8 lg:pt-4 lg:pb-16">
        <div className="brand-gradient-bg rounded-3xl p-8 text-center shadow-xl sm:p-14">
          <span className="cta-badge inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{tHome("positioning_badge")}</span>
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            {tHome("final_cta_title")}
          </h2>
          <p className="cta-subtitle mx-auto mt-3 max-w-2xl text-sm sm:text-base">
            {tHome("final_cta_subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="cta-primary-btn inline-flex min-h-[50px] items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition-transform hover:scale-105"
            >
              <span className="cta-btn-text">{tCta("start_conversation")}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary-btn inline-flex min-h-[50px] items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold backdrop-blur-md hover:bg-white/20"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{tCta("chat_whatsapp")}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
