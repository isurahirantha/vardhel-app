import { getAboutCompanyData } from "@/server/services/public-content.service";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, CheckCircle2, Compass, Target } from "lucide-react";

export const revalidate = 60;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const data = await getAboutCompanyData(validLocale);

  return (
    <div className="flex flex-col">
      {/* BAND 1: STORY + COMPACT VISION/MISSION + OBSIDIAN DISCIPLINES (Warm Stone) */}
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] py-10 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
            {/* Left 7 cols: Story + Inline Vision & Mission Cards */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Vardhel &bull; Colombo, Sri Lanka
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                  {data.about.title}
                </h1>
                <div
                  className="space-y-2.5 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]"
                  dangerouslySetInnerHTML={{ __html: data.about.bodyHtml }}
                />
              </div>

              {/* Compact Vision & Mission Cards */}
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="glass-card rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      <Compass className="h-4 w-4" />
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                      {data.vision.title}
                    </h2>
                  </div>
                  <div
                    className="text-xs leading-relaxed text-[var(--text-secondary)]"
                    dangerouslySetInnerHTML={{ __html: data.vision.bodyHtml }}
                  />
                </div>

                <div className="glass-card rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      <Target className="h-4 w-4" />
                    </span>
                    <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                      {data.mission.title}
                    </h2>
                  </div>
                  <div
                    className="text-xs leading-relaxed text-[var(--text-secondary)]"
                    dangerouslySetInnerHTML={{ __html: data.mission.bodyHtml }}
                  />
                </div>
              </div>
            </div>

            {/* Right 5 cols: Deep Obsidian Disciplines & Approach Panel */}
            <div className="keep-white relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#0e192c] via-[#111827] to-[#09090b] p-6 sm:p-7 text-[#ffffff] shadow-xl lg:col-span-5 flex flex-col gap-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/15"
              />
              <div className="relative z-10 space-y-1">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#6ee7b7]">
                  {validLocale === "si"
                    ? "AI බලගැන්වූ ව්‍යාපාරික බුද්ධි පද්ධති"
                    : "AI-Driven Business Intelligence"}
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight !text-[#ffffff]">
                  {validLocale === "si"
                    ? "අපි සම්පූර්ණ විසඳුම් ලබා දෙන ආකාරය"
                    : "How We Deliver End-to-End"}
                </h2>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {(validLocale === "si"
                  ? [
                      "AI සහ ව්‍යාපාරික බුද්ධි පද්ධති",
                      "සම්පූර්ණ මෘදුකාංග සංවර්ධනය",
                      "UI/UX පද්ධති නිර්මාණය",
                      "ස්වයංක්‍රීය ක්‍රියාවලි සහ API",
                      "ඩිජිටල් වර්ධන උපායමාර්ග",
                      "Cloud සහ ආරක්ෂක පද්ධති",
                    ]
                  : [
                      "AI & Business Intelligence",
                      "Full-Stack Engineering",
                      "Conversion UI/UX",
                      "Workflow Automation",
                      "Growth & Funnel Strategy",
                      "Cloud & Security",
                    ]
                ).map((item) => (
                  <div
                    key={item}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-[#f1f5f9]"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#34d399]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-10 mt-auto flex items-center justify-between border-t border-white/10 pt-3.5 text-[11px] text-[#cbd5e1]">
                <span>100% Client IP Ownership</span>
                <span className="font-semibold text-[#6ee7b7]">
                  {validLocale === "si"
                    ? "උපායමාර්ග → දියත් කිරීම → වර්ධනය"
                    : "Strategy → Launch → Scale"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAND 2: CONCISE CORE VALUES + PARTNER CTA (Pure White Surface) */}
      <section className="bg-[var(--bg-surface)] py-10 lg:py-12">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                {validLocale === "si" ? "අපගේ ප්‍රතිපත්ති" : "How We Work"}
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {validLocale === "si" ? "අපගේ මූලික වටිනාකම්" : "Our Core Values"}
              </h2>
            </div>
            <p className="max-w-md text-xs sm:text-sm text-[var(--text-secondary)]">
              {validLocale === "si"
                ? "අප සේවය කරන සෑම ව්‍යාපාරයකටම ස්ථිර වර්ධනයක් ලබා දීමට මඟපෙන්වන ප්‍රතිපත්ති."
                : "The business standards behind every partnership and measurable growth outcome we deliver."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.values.map((val) => (
              <div
                key={val.id}
                className="glass-card glass-card-hover rounded-2xl p-5 space-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                      {val.title}
                    </h3>
                    <span className="font-mono text-sm font-bold text-emerald-600/50 dark:text-emerald-400/50">
                      {val.codeNumber}
                    </span>
                  </div>
                  {val.motto && (
                    <p className="text-xs italic text-emerald-700 dark:text-emerald-400">
                      {val.motto}
                    </p>
                  )}
                  {val.bullets.length > 0 && (
                    <ul className="space-y-1 pt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {val.bullets.slice(0, 2).map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                            ▸
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {/* 6th Card: Balanced Obsidian Partnership CTA */}
            <div className="keep-white relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0e192c] via-[#111827] to-[#09090b] p-5 text-[#ffffff] shadow-lg flex flex-col justify-between gap-4">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/15"
              />
              <div className="relative z-10 space-y-1.5">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#6ee7b7]">
                  {validLocale === "si" ? "එක්ව ගොඩනගමු" : "Partner With Vardhel"}
                </span>
                <h3 className="text-lg font-bold tracking-tight !text-[#ffffff]">
                  {validLocale === "si"
                    ? "ඔබේ ව්‍යාපාරය වර්ධනය කරමුද?"
                    : "Ready to Grow Your Business?"}
                </h3>
                <p className="text-xs leading-relaxed text-[#cbd5e1]">
                  {validLocale === "si"
                    ? "AI බලගැන්වූ ව්‍යාපාරික වර්ධන පද්ධති, මෘදුකාංග සහ ඩිජිටල් වර්ධනය එකම තැනකින්."
                    : "AI-driven growth intelligence, custom software, and brand growth under one roof."}
                </p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                <Link
                  href="/contact"
                  className="keep-white inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                >
                  <span>{validLocale === "si" ? "සම්බන්ධ වන්න" : "Start a Conversation"}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-[#e2e8f0] hover:border-emerald-400/40 hover:text-[#6ee7b7] transition-colors"
                >
                  <span>{validLocale === "si" ? "නිෂ්පාදන බලන්න" : "Explore Products"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
