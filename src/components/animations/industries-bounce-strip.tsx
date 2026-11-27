"use client";

interface IndustriesBounceStripProps {
  locale?: "en" | "si";
}

const INDUSTRIES_EN = [
  "Hospitality & Tourism",
  "E-Commerce & Retail",
  "Healthcare & Wellness",
  "Real Estate & Architecture",
  "Professional Services",
  "Events & Entertainment",
];

const INDUSTRIES_SI = [
  "සංචාරක සහ ආගන්තුක සත්කාර",
  "ඊ-වාණිජ්‍යය සහ සිල්ලර",
  "සෞඛ්‍ය සහ සායනික",
  "නිශ්චල දේපල සහ ඉදිකිරීම්",
  "වෘත්තීය සේවා සහ ආයතනික",
  "උත්සව සහ විනෝදාස්වාදය",
];

const CYCLE_SECONDS = 21;

/**
 * Centered "Industries We Power" header above a nonstop left-to-right stage
 * where every pill spring-bounces in from the left edge and joins the flow.
 */
export function IndustriesBounceStrip({ locale = "en" }: IndustriesBounceStripProps) {
  const industries = locale === "si" ? INDUSTRIES_SI : INDUSTRIES_EN;
  const stepSeconds = CYCLE_SECONDS / industries.length;

  return (
    <div className="space-y-3">
      {/* Centered Top Label */}
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {locale === "si" ? "ඉලක්කගත ක්ෂේත්‍ර" : "Industries We Power"}
        </span>
      </div>

      {/* Nonstop Left-Entry Bounce-In -> Continuous Flowing Stage */}
      <div
        className="industry-flow-stage ticker-mask relative h-14 overflow-hidden"
        style={{ containerType: "inline-size" }}
      >
        {industries.map((ind, i) => (
          <span
            key={ind}
            style={{ animationDelay: `${-(i * stepSeconds)}s` }}
            className="animate-industry-bounce-pill absolute left-0 top-1/2 -mt-[17px] inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-2xs transition-colors hover:border-emerald-500/50"
          >
            <span className="text-[10px] text-emerald-500">▸</span>
            <span>{ind}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
