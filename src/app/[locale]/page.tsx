import { getTranslations } from "next-intl/server";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import {
  getPublishedProducts,
  getApprovedFeedback,
  getPublishedFaqs,
  getAboutCompanyData,
  getHomeSections,
} from "@/server/services/public-content.service";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import { safeJsonLd } from "@/lib/security/sanitize";
import { HeroGrowthStaircase } from "@/components/animations/hero-growth-staircase";
import { HeroParticleSection } from "@/components/animations/hero-particle-section";
import { HowVardhelWorksGrid } from "@/components/animations/how-vardhel-works-grid";
import { LiveWorkReel } from "@/components/animations/live-work-reel";
import { MobileScrollCarousel } from "@/components/ui/mobile-scroll-carousel";
import { FeedbackAvatar } from "@/components/ui/feedback-avatar";
import {
  ArrowUpRight,
  MessageCircle,
  CheckCircle2,
  Star,
  Sparkles,
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
    feedbackList,
    faqs,
    companyData,
    homeSections,
  ] = await Promise.all([
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
    getTranslations({ locale: validLocale, namespace: "home" }),
    getPublishedProducts(validLocale),
    getApprovedFeedback(validLocale),
    getPublishedFaqs(validLocale),
    getAboutCompanyData(validLocale),
    getHomeSections(validLocale),
  ]);

  const sectionMeta = new Map(
    homeSections.map((sec, idx) => [sec.key, { ...sec, order: idx + 1 }])
  );
  const isSecVisible = (key: string) => sectionMeta.get(key)?.isVisible !== false;
  const secOrderStyle = (key: string) => ({
    order: sectionMeta.get(key)?.order ?? 99,
  });

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    siteConfig.whatsappDefaultMessage
  );

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
    <div className="relative flex flex-col overflow-x-clip">
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
      {isSecVisible("hero") && (
        <div style={secOrderStyle("hero")}>
          <HeroParticleSection className="bg-[var(--bg-surface)] -mt-[68px] pt-24 pb-12 lg:pt-28 lg:pb-16">
            <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/25 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{tHome("positioning_badge")}</span>
                  </span>

                  <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.08] tracking-[-0.025em] text-[var(--text-primary)] [text-wrap:balance]">
                    {validLocale === "si" ? (
                      <>
                        බුද්ධිමය
                        <br />
                        <span className="text-emerald-700 dark:text-emerald-400">
                          ව්‍යාපාර වර්ධනය.
                        </span>
                      </>
                    ) : (
                      <>
                        Intelligence-Led
                        <br />
                        <span className="text-emerald-700 dark:text-emerald-400">
                          Business Growth.
                        </span>
                      </>
                    )}
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
                    {tHome("hero_subheadline")}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3.5">
                    <Link
                      href="/contact"
                      className="keep-white inline-flex min-h-[48px] items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:opacity-95"
                    >
                      <span className="keep-white">{tCta("grow_business")}</span>
                      <ArrowUpRight className="keep-white h-4 w-4" />
                    </Link>
                    <a
                      href="#capabilities"
                      className="glass-card inline-flex min-h-[48px] items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all hover:border-emerald-500/50"
                    >
                      <span>{tCta("explore_what_we_do")}</span>
                      <ArrowUpRight className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                    </a>
                  </div>

                  {/* Micro Social-Proof Trust Strip */}
                  <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                    <span className="flex tracking-tight text-amber-400" aria-hidden="true">
                      ★★★★★
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">5.0 Rating</span>
                    <span>•</span>
                    <span>
                      {validLocale === "si"
                        ? "ව්‍යාපාර 20+ ක විශ්වාසය දිනූ තාක්ෂණික හවුල්කරු"
                        : "Trusted by 20+ ambitious businesses"}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <HeroGrowthStaircase locale={validLocale} />
                </div>
              </div>
            </div>
          </HeroParticleSection>
        </div>
      )}

      {/* B. UNIFIED PROOF & CLIENT SPECTRUM BAND (Warm Stone) */}
      {isSecVisible("proof_ticker") && (
        <section
          style={secOrderStyle("proof_ticker")}
          className="relative overflow-hidden border-y border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] py-6"
        >
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-5">
            {(() => {
              const proofStats =
                companyData.stats.length > 0
                  ? companyData.stats
                  : [
                    {
                      id: "st-1",
                      value: "20",
                      suffix: "+",
                      label:
                        validLocale === "si"
                          ? "සම්බන්ධ වූ ව්‍යාපාර"
                          : "Businesses Onboarded",
                    },
                    {
                      id: "st-2",
                      value: "3",
                      suffix: "",
                      label:
                        validLocale === "si"
                          ? "ප්‍රධාන මෘදුකාංග පද්ධති"
                          : "Flagship SaaS Platforms",
                    },
                    {
                      id: "st-3",
                      value: "100",
                      suffix: "%",
                      label:
                        validLocale === "si"
                          ? "සම්පූර්ණ IP අයිතිය"
                          : "Full IP Ownership",
                    },
                  ];
              return (
                <div className="grid grid-cols-3 gap-4 border-b border-[var(--border-subtle)] pb-5 text-center">
                  {proofStats.map((st) => (
                    <div key={st.id}>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                        {st.value}
                        {st.suffix}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{st.label}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="ticker-mask relative overflow-hidden">
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
          </div>
        </section>
      )}

      {/* C. HOW VARDHEL WORKS · CAPABILITIES & ADVANTAGE — Pure White (5 AirDrop Cards + Linked Workflow Panel) */}
      {isSecVisible("how_it_works") && (
        <section
          id="how-it-works"
          style={secOrderStyle("how_it_works")}
          className="bg-[var(--bg-surface)] pt-9 pb-14 lg:pt-10 lg:pb-14 scroll-mt-24 border-b border-[var(--border-subtle)]"
        >
          <span id="capabilities" className="sr-only" />
          <span id="advantage" className="sr-only" />
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {validLocale === "si"
                  ? "VARDHEL ක්‍රියා කරන ආකාරය · අපගේ හැකියාවන් සහ විශේෂත්වය"
                  : "How VARDHEL Works · Capabilities & Advantage"}
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] [text-wrap:balance]">
                {validLocale === "si"
                  ? "අපි ආරම්භ කරන්නේ ඔබේ ව්‍යාපාරය තේරුම් ගැනීමෙනි"
                  : "We start by understanding your business — not by asking what to post."}
              </h2>
            </div>

            <HowVardhelWorksGrid
              capabilitiesLabel={
                validLocale === "si" ? "ක්‍රියාත්මක වන හැකියාවන්:" : "Capabilities Activated:"
              }
              allCapabilities={[
                {
                  id: "software",
                  label: validLocale === "si" ? "සුවිශේෂී මෘදුකාංග" : "Custom Software",
                  href: "/services/software-product-development",
                },
                {
                  id: "strategy",
                  label: validLocale === "si" ? "ඩිජිටල් උපායමාර්ග" : "Digital Strategy",
                  href: "/growth",
                },
                {
                  id: "web",
                  label: validLocale === "si" ? "වෙබ් අඩවි සහ SEO" : "Websites & SEO",
                  href: "/services/web-application-development",
                },
                {
                  id: "brand",
                  label: validLocale === "si" ? "සන්නාමකරණය සහ වීඩියෝ" : "Branding & Video",
                  href: "/services/content-short-video-production",
                },
                {
                  id: "marketing",
                  label: validLocale === "si" ? "ඩිජිටල් අලෙවිකරණය" : "Marketing",
                  href: "/services/social-media-setup-management",
                },
                {
                  id: "engage",
                  label: validLocale === "si" ? "පාරිභෝගික සබඳතා" : "Engagement & Leads",
                  href: "/growth",
                },
                {
                  id: "ai",
                  label: validLocale === "si" ? "AI සහ ස්වයංක්‍රීයකරණය" : "AI & Automation",
                  href: "/services/iot-development",
                },
              ]}
              steps={[
                {
                  title: validLocale === "si" ? "ඇතුළත් කිරීම" : "Onboard",
                  tag: validLocale === "si" ? "බුද්ධි පද්ධතිය" : "INTELLIGENCE CORE",
                  desc:
                    validLocale === "si"
                      ? "ඔබේ ව්‍යාපාරයේ ඉලක්ක, ගනුදෙනුකරුවන් සහ වෙළඳපල අපි පද්ධතියට ඇතුළත් කරමු."
                      : "We bring your business into VARDHEL: goals, audience, market and resources.",
                  advantageLabel:
                    validLocale === "si"
                      ? "සක්‍රීය ව්‍යාපාර බුද්ධිය"
                      : "ACTIVE BUSINESS INTELLIGENCE",
                  advantageTitle:
                    validLocale === "si"
                      ? "ඕනෑම පියවරකට පෙර ඔබේ ව්‍යාපාරය ගැඹුරින් අධ්‍යයනය කර සම්බන්ධ කර ගැනීම."
                      : "We establish deep structured context before recommending any action.",
                  advantageQuote:
                    validLocale === "si"
                      ? `“${tHome("philosophy_quote")}”`
                      : "“We don't start by asking what you want to post. We start by understanding your business.”",
                  activeCapIds: ["strategy", "software"],
                  cards: [
                    {
                      code: "CORE · AUDIT",
                      title:
                        validLocale === "si"
                          ? "ව්‍යාපාර සහ වෙළඳපල ඇතුළත් කිරීම"
                          : "Business & Commercial Onboarding",
                      desc:
                        validLocale === "si"
                          ? "ආදායම් ඉලක්ක, මෙහෙයුම් අභියෝග සහ ඩිජිටල් යටිතල පහසුකම් VARDHEL තුළ සිතියම්ගත කිරීම."
                          : "Map revenue goals, operational bottlenecks, and digital infrastructure gaps inside VARDHEL.",
                      href: "/growth",
                    },
                    {
                      code: "CORE · CONTEXT",
                      title:
                        validLocale === "si"
                          ? "පාරිභෝගික සහ නාලිකා සැලසුම"
                          : "Customer & Channel Architecture",
                      desc:
                        validLocale === "si"
                          ? "ඔබේ මෘදුකාංග, වෙබ් අඩවිය සහ සමාජ මාධ්‍ය එකම බුද්ධි මධ්‍යස්ථානයකට සම්බන්ධ කිරීම."
                          : "Align your software, website, and social touchpoints to a single intelligence core.",
                      href: "/services",
                    },
                  ],
                  ctaLabel:
                    validLocale === "si"
                      ? "ඇතුළත් කිරීමේ ක්‍රියාවලිය බලන්න"
                      : "Learn How Onboarding Works",
                  ctaHref: "/growth",
                },
                {
                  title: validLocale === "si" ? "පර්යේෂණය" : "Research",
                  tag: validLocale === "si" ? "සාක්ෂි සහ SEO" : "EVIDENCE & SEO",
                  desc:
                    validLocale === "si"
                      ? "තරඟකරුවන්, වෙළඳපල සහ පාරිභෝගික හැසිරීම් සාක්ෂි මත පදනම්ව අධ්‍යයනය."
                      : "Competitors, market conditions and audience behaviour, grounded in evidence.",
                  advantageLabel:
                    validLocale === "si"
                      ? "සාක්ෂි මත පදනම් වූ AI විශ්ලේෂණය"
                      : "EVIDENCE-LED AI ANALYSIS",
                  advantageTitle:
                    validLocale === "si"
                      ? "සෑම උපායමාර්ගික පියවරක්ම සැබෑ දත්ත මත පදනම් වේ — සාමාන්‍ය උපදෙස් නොවේ."
                      : "Every strategic move is backed by market data, not generic marketing advice.",
                  advantageQuote:
                    validLocale === "si"
                      ? "ඔබේ වෙළඳපලට ගැළපෙන තරඟකාරී විශ්ලේෂණ, සෙවුම් ඉල්ලුම සහ පාරිභෝගික හැසිරීම්."
                      : "Deep competitive benchmarking, search demand, and platform behavior tailored to your market.",
                  activeCapIds: ["strategy", "web", "marketing"],
                  cards: [
                    {
                      code: "01 · WEB & SEO",
                      title:
                        validLocale === "si"
                          ? "තාක්ෂණික SEO සහ AI සෙවුම් සූදානම"
                          : "Technical SEO & AI Search Readiness",
                      desc:
                        validLocale === "si"
                          ? "වෙබ් අඩවියේ වේගය, පරිවර්තන බාධා සහ AI සෙවුම් අවස්ථා පරීක්ෂා කිරීම."
                          : "Audit search visibility, conversion friction, and AI discovery opportunities across your web presence.",
                      href: "/services/web-application-development",
                    },
                    {
                      code: "03 · REACH",
                      title:
                        validLocale === "si"
                          ? "තරඟකරුවන් සහ ප්‍රේක්ෂක දත්ත"
                          : "Competitor & Audience Signals",
                      desc:
                        validLocale === "si"
                          ? "Facebook, Instagram, TikTok සහ TripAdvisor හරහා සාක්ෂි පාදක පර්යේෂණ."
                          : "Evidence-backed research across Facebook, Instagram, TikTok, and TripAdvisor.",
                      href: "/services/social-media-setup-management",
                    },
                  ],
                  ctaLabel:
                    validLocale === "si"
                      ? "පර්යේෂණ හා SEO විසඳුම් බලන්න"
                      : "Explore Research & SEO",
                  ctaHref: "/services",
                },
                {
                  title: validLocale === "si" ? "උපායමාර්ගය" : "Strategy",
                  tag: validLocale === "si" ? "වර්ධන සැලැස්ම" : "ROADMAP",
                  desc:
                    validLocale === "si"
                      ? "ඔබේ ව්‍යාපාරයට ගැළපෙන වර්ධන සැලැස්මක්."
                      : "A growth plan tailored to your business, not generic social media advice.",
                  advantageLabel:
                    validLocale === "si"
                      ? "ඒකාබද්ධ වර්ධන සැලැස්ම"
                      : "UNIFIED GROWTH ROADMAP",
                  advantageTitle:
                    validLocale === "si"
                      ? "සමාජ මාධ්‍ය සහ වෙබ් අඩවි යනු ක්‍රියාකාරී නාලිකා පමණි — සම්පූර්ණ උපායමාර්ගය නොවේ."
                      : "Social media and websites are execution channels — not the entire strategy.",
                  advantageQuote:
                    validLocale === "si"
                      ? "අප නිර්මාණය කරන සෑම පද්ධතියක්ම සහ ප්‍රවර්ධනයක්ම ඔබේ ව්‍යාපාරික වර්ධනයට ගැළපෙන බුද්ධිමය සැලසුමකින් මෙහෙයවනු ලැබේ."
                      : "Every platform we engineer and campaign we run is guided by business intelligence tailored to your growth.",
                  activeCapIds: ["strategy", "software", "web"],
                  cards: [
                    {
                      code: "UNDERSTAND · GROW",
                      title:
                        validLocale === "si"
                          ? "ඩිජිටල් උපායමාර්ග සහ ව්‍යාපාර පරිවර්තනය"
                          : "Digital Strategy & Business Transformation",
                      desc:
                        validLocale === "si"
                          ? "තිරසාර වර්ධනය සඳහා තාක්ෂණික මඟපෙන්වීම, දැනුම හුවමාරුව සහ දිගුකාලීන සැලසුම්."
                          : "End-to-end roadmap, technology consulting, and hands-on knowledge transfer for sustainable scaling.",
                      href: "/growth",
                    },
                    {
                      code: "BUILD · PLAN",
                      title:
                        validLocale === "si"
                          ? "පද්ධති සහ නාලිකා සැලසුම"
                          : "System & Channel Blueprint",
                      desc:
                        validLocale === "si"
                          ? "ප්‍රතිලාභ වැඩි මෘදුකාංග, වෙබ් ප්‍රවාහ සහ ප්‍රවර්ධන ප්‍රමුඛතාගත කිරීම."
                          : "Prioritized architecture deciding what custom software, web flows, and campaigns drive ROI first.",
                      href: "/services",
                    },
                  ],
                  ctaLabel:
                    validLocale === "si"
                      ? "වර්ධන හවුල්කාරිත්වය ගැන කියවන්න"
                      : "Explore Growth Partnership",
                  ctaHref: "/growth",
                },
                {
                  title: validLocale === "si" ? "නිරීක්ෂණය" : "Monitor",
                  tag: validLocale === "si" ? "දත්ත නිරීක්ෂණය" : "TRACKING",
                  desc:
                    validLocale === "si"
                      ? "ක්‍රියාකාරීත්ව දත්ත සහ අවස්ථා අඛණ්ඩව නිරීක්ෂණය."
                      : "Ongoing tracking of available performance signals and opportunities.",
                  advantageLabel:
                    validLocale === "si"
                      ? "අඛණ්ඩ නිරීක්ෂණය සහ මඟපෙන්වීම"
                      : "CONTINUOUS TRACKING & GUIDANCE",
                  advantageTitle:
                    validLocale === "si"
                      ? "ඊළඟ උපායමාර්ගික තීරණ ගැනීමට අපි සජීවී ප්‍රතිඵල නිරීක්ෂණය කරන්නෙමු."
                      : "We monitor live performance indicators to guide your next strategic moves.",
                  advantageQuote:
                    validLocale === "si"
                      ? "නව පාරිභෝගික අවස්ථා සහ වර්ධන බාධා කල්තියා හඳුනාගැනීම."
                      : "Spot emerging customer demand and conversion leaks early with structured signal tracking.",
                  activeCapIds: ["engage", "marketing", "ai"],
                  cards: [
                    {
                      code: "04 · RETAIN",
                      title:
                        validLocale === "si"
                          ? "පාරිභෝගික සබඳතා සහ WhatsApp යොමුකිරීම්"
                          : "Customer Engagement & Lead Routing",
                      desc:
                        validLocale === "si"
                          ? "වෙබ් අඩවියේ සිට WhatsApp සහ සමාජ මාධ්‍ය දක්වා පාරිභෝගිකයින් සම්බන්ධ කරන පද්ධති."
                          : "Seamless booking flows, WhatsApp lead routing, and retention systems that keep customers coming back.",
                      href: "/growth",
                    },
                    {
                      code: "03 · SIGNALS",
                      title:
                        validLocale === "si"
                          ? "ප්‍රවර්ධන ROI සහ පරිවර්තන දත්ත"
                          : "Campaign ROI & Conversion Signals",
                      desc:
                        validLocale === "si"
                          ? "සැබෑ ප්‍රතිඵල මත පදනම්ව තීරණ ගැනීමට අඛණ්ඩ දත්ත විශ්ලේෂණය."
                          : "Continuous tracking across campaigns and funnels so decisions are grounded in live results.",
                      href: "/products",
                    },
                  ],
                  ctaLabel:
                    validLocale === "si"
                      ? "නිරීක්ෂණ සහ සබඳතා විසඳුම් බලන්න"
                      : "Explore Engagement & Tracking",
                  ctaHref: "/growth",
                },
                {
                  title: validLocale === "si" ? "ක්‍රියාත්මක කිරීම සහ දියුණු කිරීම" : "Execute & Improve",
                  tag: validLocale === "si" ? "නිර්මාණය සහ වර්ධනය" : "BUILD & SCALE",
                  desc:
                    validLocale === "si"
                      ? "මෘදුකාංග, වෙබ් සහ සමාජ මාධ්‍ය ක්‍රියාත්මක කර ප්‍රතිඵල අනුව වැඩිදියුණු කරමු."
                      : "Software, websites and social channels delivered, then refined from results.",
                  advantageLabel:
                    validLocale === "si"
                      ? "අඛණ්ඩ හවුල්කාරිත්වය · සම්පූර්ණ IP අයිතිය"
                      : "ONGOING PARTNERSHIP · FULL IP OWNERSHIP",
                  advantageTitle:
                    validLocale === "si"
                      ? "ඔබේ ව්‍යාපාරය වර්ධනය වන විට අඛණ්ඩව වැඩිදියුණු වන තාක්ෂණික සහ නිර්මාණශීලී ක්‍රියාත්මක කිරීම."
                      : "Coordinated engineering and creative execution, refined continuously as you grow.",
                  advantageQuote:
                    validLocale === "si"
                      ? "සාමාන්‍ය සැකිලි නොව — 100% IP අයිතිය සහිත සුවිශේෂී ඩිජිටල් හැකියාවන්."
                      : "Never generic templates or one-off handoffs — compounding digital capability with 100% IP ownership.",
                  activeCapIds: ["software", "web", "brand", "marketing", "ai"],
                  cards: [
                    {
                      code: "BUILD · FEATURED",
                      title:
                        validLocale === "si"
                          ? "සුවිශේෂී මෘදුකාංග සංවර්ධනය"
                          : "Custom Software Development",
                      desc:
                        validLocale === "si"
                          ? "සම්පූර්ණ IP අයිතිය සහ ඉහළ වේගය සහිත වෙබ්, ජංගම සහ මෙහෙයුම් මෘදුකාංග පද්ධති."
                          : "Tailored web, mobile, and operational software with Custom Architecture, High Speed & Full IP Ownership.",
                      href: "/services/software-product-development",
                    },
                    {
                      code: "01–05 · EXECUTE",
                      title:
                        validLocale === "si"
                          ? "වෙබ් අඩවි, සන්නාමකරණය, අලෙවිකරණය සහ AI"
                          : "Websites, Branding, Marketing & AI Automation",
                      desc:
                        validLocale === "si"
                          ? "SEO සූදානම් වෙබ් අඩවි, කෙටි වීඩියෝ, ප්‍රවර්ධන සහ ප්‍රායෝගික AI ස්වයංක්‍රීයකරණය."
                          : "High-converting websites, visual storytelling, multi-channel campaigns, and practical AI workflows.",
                      href: "/services",
                    },
                  ],
                  ctaLabel: tCta("read_more"),
                  ctaHref: "/services",
                },
              ]}
            />
          </div>
        </section>
      )}

      {/* FEATURED FLAGSHIP PRODUCTS — Warm Stone + Live Work Reel */}
      {isSecVisible("platforms") && (
        <section
          id="platforms"
          style={secOrderStyle("platforms")}
          className="bg-[var(--bg-surface-elevated)] py-10 lg:py-12 scroll-mt-24 border-b border-[var(--border-subtle)]"
        >
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  {validLocale === "si" ? "අපගේ නිෂ්පාදන" : "Flagship Platforms"}
                </span>
                <h2 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {validLocale === "si"
                    ? "Vardhel විසින් නිර්මාණය කළ මෘදුකාංග පද්ධති"
                    : "Platforms Engineered by Vardhel"}
                </h2>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                <span>{tCta("explore_products")}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Option 1: Looping Live Work Showreel (admin-uploaded MP4/WebM overrides canvas fallback) */}
            <LiveWorkReel videoUrl={siteConfig.workReelVideoUrl} locale={validLocale} />

            <MobileScrollCarousel
              wrapperClassName="mt-5"
              gridClassName="md:grid md:grid-cols-3 md:gap-5"
              prevLabel="Previous platform"
              nextLabel="Next platform"
            >
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
                    className="glass-card glass-card-hover group flex w-[82vw] max-w-[320px] shrink-0 snap-center md:w-auto md:max-w-none flex-col justify-between overflow-hidden rounded-2xl p-4"
                  >
                    <div>
                      <div className={`relative flex h-32 md:h-36 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradientBg} p-3 shadow-inner`}>
                        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#10B981] px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#06231B] shadow-xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#06231B] animate-pulse" />
                          LIVE
                        </span>

                        {hasCover ? (
                          <div className="relative h-full w-full overflow-hidden rounded-lg">
                            <img
                              src={prod.coverUrl}
                              alt={prod.name}
                              loading="lazy"
                              className="h-full w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
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

                      <div className="mt-3 flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {prod.name}
                        </h3>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {prod.status}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                        {prod.tagline}
                      </p>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                        {prod.shortDescription}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <span>Explore {prod.name}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                );
              })}
            </MobileScrollCarousel>
          </div>
        </section>
      )}

      {/* CUSTOMER FEEDBACK — Clean Surface (White) */}
      {isSecVisible("feedback") && (
        <section
          style={secOrderStyle("feedback")}
          className="bg-[var(--bg-surface)] py-10 lg:py-12 border-b border-[var(--border-subtle)]"
        >
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {validLocale === "si" ? "පාරිභෝගික අදහස්" : "Customer Experiences"}
                </h2>
              </div>
              <Link
                href="/feedback"
                className="glass-card inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:border-emerald-500/40"
              >
                <span>{tCta("share_experience")}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {feedbackList.length > 0 && (
              <MobileScrollCarousel
                wrapperClassName="mt-4 md:mt-6"
                gridClassName="md:grid md:grid-cols-3 md:gap-5"
                prevLabel="Previous review"
                nextLabel="Next review"
              >
                {feedbackList.slice(0, 6).map((fb) => (
                  <div key={fb.id} className="glass-card w-[84vw] max-w-[330px] shrink-0 snap-center md:w-auto md:max-w-none rounded-2xl p-5 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: fb.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                        &ldquo;{fb.message}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-[var(--border-subtle)] text-xs">
                      <FeedbackAvatar name={fb.name} avatarUrl={fb.avatarUrl} />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-[var(--text-primary)]">
                          {fb.name}
                        </p>
                        {(fb.role || fb.company) && (
                          <p className="truncate text-[var(--text-muted)]">
                            {fb.role} {fb.company ? `@ ${fb.company}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </MobileScrollCarousel>
            )}
          </div>
        </section>
      )}

      {/* FAQ ACCORDION — Warm Stone Band */}
      {isSecVisible("faq") && (
        <section
          style={secOrderStyle("faq")}
          className="bg-[var(--bg-surface-elevated)] py-10 lg:py-12 border-b border-[var(--border-subtle)]"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {validLocale === "si"
                ? "නිතර අසන ප්‍රශ්න (FAQ)"
                : "Frequently Asked Questions"}
            </h2>
            {/* Frequently Asked Questions */}
            <div className="mt-6 space-y-3">
              {faqs.map((faq, idx) => (
                <details
                  key={faq.id}
                  open={idx === 0}
                  className="faq-details glass-card group rounded-2xl p-4 sm:p-5 open:border-emerald-500/40 transition-colors duration-500"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-[var(--text-primary)]">
                    <span>{faq.question}</span>
                    <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-emerald-500 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45 group-open:bg-emerald-500 group-open:text-white">
                      +
                    </span>
                  </summary>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* F. FINAL CALL TO ACTION — Pure White Band with Obsidian CTA Card */}
      {isSecVisible("final_cta") && (
        <section
          style={secOrderStyle("final_cta")}
          className="bg-[var(--bg-surface)] mx-auto w-full max-w-[1360px] px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
        >
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
      )}
    </div>
  );
}
