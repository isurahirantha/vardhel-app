"use client";

import { useState } from "react";
import {
  Compass,
  Code2,
  Share2,
  MessageSquareHeart,
  TrendingUp,
  Sparkles,
} from "lucide-react";

interface HeroGrowthStaircaseProps {
  locale?: "en" | "si";
}

const STAGES = [
  {
    step: "01",
    code: "UNDERSTAND",
    titleEn: "UNDERSTAND",
    titleSi: "හඳුනාගැනීම",
    descEn: "Understand the business, its challenges, opportunities, and growth objectives.",
    descSi: "ව්‍යාපාරය, අභියෝග, නව අවස්ථා සහ වර්ධන ඉලක්ක ගැඹුරින් අධ්‍යයනය කිරීම.",
    icon: Compass,
    accent: "#14b8a6",
  },
  {
    step: "02",
    code: "BUILD",
    titleEn: "BUILD",
    titleSi: "ගොඩනැගීම",
    descEn: "Develop custom software, websites, digital platforms, and technology solutions.",
    descSi: "සුවිශේෂී මෘදුකාංග, වෙබ් අඩවි, ඩිජිටල් වේදිකා සහ තාක්ෂණික විසඳුම් නිර්මාණය.",
    icon: Code2,
    accent: "#228870",
  },
  {
    step: "03",
    code: "CONNECT",
    titleEn: "CONNECT",
    titleSi: "සම්බන්ධ කිරීම",
    descEn: "Connect businesses with their customers through meaningful digital experiences.",
    descSi: "අර්ථවත් ඩිජිටල් අත්දැකීම් හරහා ව්‍යාපාරය සහ පාරිභෝගිකයින් එකිනෙකට සමීප කිරීම.",
    icon: Share2,
    accent: "#06b6d4",
  },
  {
    step: "04",
    code: "ENGAGE",
    titleEn: "ENGAGE",
    titleSi: "ආකර්ෂණය",
    descEn: "Improve customer engagement through digital marketing, automation, and communication.",
    descSi: "ඩිජිටල් අලෙවිකරණය, ස්වයංක්‍රීයකරණය සහ සන්නිවේදනය මඟින් පාරිභෝගික බැඳීම.",
    icon: MessageSquareHeart,
    accent: "#3b82f6",
  },
  {
    step: "05",
    code: "GROW",
    titleEn: "GROW",
    titleSi: "වර්ධනය",
    descEn: "Help businesses achieve sustainable growth through continuous technology & strategy.",
    descSi: "තාක්ෂණය සහ උපායමාර්ග හරහා තිරසාර ව්‍යාපාර වර්ධනයක් අත්කර දීම.",
    icon: TrendingUp,
    accent: "#10b981",
    isPinnacle: true,
  },
];

export function HeroGrowthStaircase({
  locale = "en",
}: HeroGrowthStaircaseProps) {
  const [activeStep, setActiveStep] = useState<number>(4); // Default to Stage 05 (GROW)

  const currentActiveStage = STAGES[activeStep] ?? STAGES[4]!;

  // Calibrated step heights so Step 01 has ample vertical room for tread bar, icon, label & dot
  const stepTreads = [
    { heightPercent: 44, colStart: 1 },
    { heightPercent: 57, colStart: 2 },
    { heightPercent: 70, colStart: 3 },
    { heightPercent: 83, colStart: 4 },
    { heightPercent: 96, colStart: 5 },
  ] as const;

  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/25 backdrop-blur-[2px] p-4 sm:p-5 shadow-2xl transition-all duration-300"
    >
      {/* Top Header Badge */}
      <div className="relative z-20 flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {locale === "si" ? "Vardhel වර්ධන සැලැස්ම" : "The Vardhel Growth Engine"}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
          <Sparkles className="h-3 w-3" />
          <span>Interactive Matrix</span>
        </span>
      </div>

      {/* 2D PHYSICAL ASCENDING STAIRCASE VISUAL */}
      <div className="relative z-20 mt-4 h-56 w-full px-1 sm:px-2 flex items-end justify-between gap-2 sm:gap-3">
        {/* Ascent Diagonal Connecting Guide Beam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-6 right-6 bottom-12 h-0.5 opacity-35 bg-gradient-to-r from-teal-500/20 via-emerald-500/40 to-emerald-400 -rotate-[16deg] origin-bottom-left"
        />

        {STAGES.map((st, idx) => {
          const tread = stepTreads[idx] ?? stepTreads[0];
          const isActive = activeStep === idx;
          const Icon = st.icon;

          return (
            <div
              key={st.code}
              style={{ height: `${tread.heightPercent}%` }}
              onMouseEnter={() => setActiveStep(idx)}
              onClick={() => setActiveStep(idx)}
              className={`group/step relative flex flex-1 min-w-0 cursor-pointer flex-col justify-between rounded-t-2xl border-t-2 border-x border-b-0 p-1.5 sm:p-2 backdrop-blur-sm transition-all duration-300 ${
                isActive
                  ? "border-t-emerald-500 border-x-emerald-500/40 bg-gradient-to-b from-emerald-500/25 via-[var(--bg-surface-elevated)]/90 to-[var(--bg-surface)]/95 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                  : "border-t-[var(--border-subtle)] border-x-[var(--border-subtle)]/60 bg-gradient-to-b from-[var(--bg-surface-elevated)]/85 to-[var(--bg-surface)]/65 hover:border-t-emerald-500/80 hover:bg-[var(--bg-surface-elevated)]/95"
              }`}
            >
              {/* Stepped Top Tread Plate (The Stair Surface) */}
              <div
                className={`h-1.5 w-full shrink-0 rounded-full transition-colors ${
                  isActive
                    ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    : "bg-[var(--border-subtle)] group-hover/step:bg-emerald-500/60"
                }`}
              />

              {/* Step Marker & Icon */}
              <div className="flex flex-col items-center justify-center my-auto py-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="mt-1 font-mono text-[11px] font-extrabold leading-none text-[var(--text-primary)]">
                  0{idx + 1}
                </span>
                <span
                  className={`mt-1 max-w-full truncate font-mono text-[9px] sm:text-[10px] font-bold leading-tight tracking-tight ${
                    isActive
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {st.code}
                </span>
              </div>

              {/* Step Base Indicator */}
              <div className="flex shrink-0 items-center justify-center pb-0.5">
                <span
                  className={`inline-block h-2 w-2 rounded-full transition-all ${
                    isActive
                      ? "bg-emerald-500 ring-2 ring-emerald-500/25"
                      : "bg-transparent group-hover/step:bg-emerald-500/40"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE STAGE DETAIL CARD (Synchronized with Stair Click / Hover) */}
      <div className="relative z-20 mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/95 backdrop-blur-md p-4 sm:p-5 shadow-inner transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
              0{activeStep + 1}
            </div>
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              STAGE • {locale === "si" ? currentActiveStage.titleSi : currentActiveStage.titleEn}
            </span>
          </div>

          {currentActiveStage.isPinnacle && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Target Climax</span>
            </span>
          )}
        </div>

        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
          {locale === "si" ? currentActiveStage.descSi : currentActiveStage.descEn}
        </p>

        {/* Stepped Progress Bar Indicator */}
        <div className="mt-3.5 flex items-center gap-1.5">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= activeStep ? "bg-emerald-500" : "bg-[var(--border-subtle)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
