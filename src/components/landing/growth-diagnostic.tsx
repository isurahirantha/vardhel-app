"use client";

import { useState } from "react";
import {
  Code2,
  TrendingUp,
  Share2,
  MessageSquareHeart,
  Bot,
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface GrowthDiagnosticProps {
  locale: "en" | "si";
  waNumber?: string;
}

const BUSINESS_GOALS = [
  {
    id: "software",
    icon: Code2,
    titleEn: "Custom Software & Web Platform",
    titleSi: "සුවිශේෂී මෘදුකාංග හෝ වෙබ් පද්ධතියක්",
    descEn: "Automate operations, replace legacy tools, or launch a digital SaaS.",
    descSi: "ව්‍යාපාරික මෙහෙයුම් ස්වයංක්‍රීය කර නවීන මෘදුකාංග පද්ධතියක් දියත් කිරීම.",
    track: "BUILD & GROW",
    timelineEn: "3–6 Weeks Delivery",
    timelineSi: "සති 3–6 කාලයක්",
    recHref: "/services/software-product-development",
  },
  {
    id: "acquisition",
    icon: Share2,
    titleEn: "Customer Acquisition & Branding",
    titleSi: "නව පාරිභෝගිකයින් සහ සන්නාමකරණය",
    descEn: "High-converting modern website, visual branding, and multi-channel campaigns.",
    descSi: "පාරිභෝගිකයින් ආකර්ෂණය කරන වෙබ් අඩවිය සහ සමාජ මාධ්‍ය ප්‍රවර්ධන.",
    track: "CONNECT & ENGAGE",
    timelineEn: "1–3 Weeks Setup",
    timelineSi: "සති 1–3 කාලයක්",
    recHref: "/services/web-application-development",
  },
  {
    id: "automation",
    icon: Bot,
    titleEn: "AI Workflows & WhatsApp Routing",
    titleSi: "AI ස්වයංක්‍රීයකරණය සහ WhatsApp පද්ධති",
    descEn: "Zero-latency lead capture, WhatsApp routing, and repetitive task automation.",
    descSi: "WhatsApp පාරිභෝගික සබඳතා සහ AI කාර්ය ස්වයංක්‍රීයකරණ විසඳුම්.",
    track: "ENGAGE & SCALE",
    timelineEn: "1–2 Weeks Integration",
    timelineSi: "සති 1–2 කාලයක්",
    recHref: "/growth",
  },
];

const STAGES = [
  { id: "startup", labelEn: "Early Stage / Startup", labelSi: "ආරම්භක ව්‍යාපාර" },
  { id: "scaling", labelEn: "Growing SME", labelSi: "වර්ධනය වන ව්‍යාපාර" },
  { id: "enterprise", labelEn: "Established Enterprise", labelSi: "ස්ථාපිත විශාල ව්‍යාපාර" },
];

export function GrowthDiagnosticWidget({
  locale,
  waNumber = "+94767996381",
}: GrowthDiagnosticProps) {
  const [selectedGoal, setSelectedGoal] = useState<string>("software");
  const [selectedStage, setSelectedStage] = useState<string>("scaling");

  const currentGoal =
    BUSINESS_GOALS.find((g) => g.id === selectedGoal) ?? BUSINESS_GOALS[0]!;
  const currentStage =
    STAGES.find((s) => s.id === selectedStage) ?? STAGES[1]!;

  const waMessage = encodeURIComponent(
    locale === "si"
      ? `ආයුබෝවන් Vardhel, මම ${currentStage.labelSi} මට්ටමේ ව්‍යාපාරයක් සඳහා ${currentGoal.titleSi} සැලැස්ම පිළිබඳව උපදෙස් ලබාගැනීමට කැමැත්තෙමි.`
      : `Hi Vardhel, I am exploring the ${currentGoal.titleEn} track for a ${currentStage.labelEn}. I'd like to discuss the roadmap.`
  );
  const waUrl = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}?text=${waMessage}`;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-10 lg:p-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-orange-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {locale === "si"
                ? "ඩිජිටල් වර්ධන සැලසුම් මෙවලම"
                : "Interactive Growth Roadmap Diagnostic"}
            </span>
          </span>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {locale === "si"
              ? "ඔබේ ව්‍යාපාරයට ගැළපෙන ඩිජිටල් මඟපෙන්වීම සොයාගන්න"
              : "Discover Your Tailored Digital Growth Strategy"}
          </h3>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            {locale === "si"
              ? "ඔබේ ව්‍යාපාරික අරමුණ සහ මට්ටම තෝරා ක්ෂණික විසඳුම් සැලැස්ම බලන්න."
              : "Select your priority objective and business stage to preview our recommended architecture."}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Step 1 & Step 2 Selection Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Step 1: Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {locale === "si"
                ? "01. ඔබේ ප්‍රධාන ව්‍යාපාරික ඉලක්කය"
                : "Step 01: Select Your Primary Growth Focus"}
            </label>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {BUSINESS_GOALS.map((goal) => {
                const Icon = goal.icon;
                const active = goal.id === selectedGoal;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? "border-orange-500 bg-orange-500/10 shadow-sm"
                        : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-orange-500/40"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        active
                          ? "bg-orange-500 text-white"
                          : "bg-[var(--bg-surface-elevated)] text-orange-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="mt-3">
                      <span className="block text-xs font-bold text-[var(--text-primary)]">
                        {locale === "si" ? goal.titleSi : goal.titleEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Stage */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {locale === "si"
                ? "02. ඔබේ ව්‍යාපාරයේ වර්තමාන මට්ටම"
                : "Step 02: Business Scale"}
            </label>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {STAGES.map((st) => {
                const active = st.id === selectedStage;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStage(st.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "bg-orange-600 text-white shadow-xs"
                        : "border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-orange-500/40"
                    }`}
                  >
                    {locale === "si" ? st.labelSi : st.labelEn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Diagnostic Output Card */}
        <div className="lg:col-span-5">
          <div className="diag-result-card relative flex h-full flex-col justify-between overflow-hidden rounded-[22px] border border-emerald-500/30 p-7 sm:p-8 shadow-xl">
            {/* Ambient radial emerald glow from brand palette */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.3),transparent_70%)]"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] diag-accent-text">
                <span className="h-2 w-2 rounded-full bg-[var(--brand-accent-glow)] shadow-[0_0_8px_var(--brand-accent-glow)]" />
                <span className="diag-accent-text">Recommended Track · {currentGoal.track}</span>
              </div>

              <h4 className="mt-4 text-2xl sm:text-[26px] font-bold leading-tight text-[var(--text-primary)] tracking-tight">
                {locale === "si" ? currentGoal.titleSi : currentGoal.titleEn}
              </h4>
              <p className="mt-1.5 font-mono text-xs font-semibold diag-accent-text">
                {locale === "si" ? currentGoal.timelineSi : currentGoal.timelineEn} · {locale === "si" ? currentStage.labelSi : currentStage.labelEn}
              </p>
              <p className="mt-3 text-sm leading-relaxed diag-sub-text">
                {locale === "si" ? currentGoal.descSi : currentGoal.descEn}
              </p>

              <div className="mt-5 space-y-3 border-t border-emerald-500/20 pt-4">
                <div className="flex items-start gap-2.5 text-[13.5px]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span className="text-[var(--text-primary)]">
                    {locale === "si"
                      ? "අවශ්‍යතාව අනුව නිමවන නම්‍යශීලී ඉංජිනේරු විසඳුම්"
                      : "Architected around your unique commercial workflows"}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-[13.5px]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span className="text-[var(--text-primary)]">
                    {locale === "si"
                      ? "දින 14ක නොමිලේ තාක්ෂණික නඩත්තු සහාය"
                      : "Full handover + Post-launch optimization sprint"}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-[13.5px]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span className="text-[var(--text-primary)]">
                    {locale === "si"
                      ? "සෘජු තාක්ෂණික සහ ව්‍යාපාරික උපදේශනය"
                      : "Direct WhatsApp & Engineering line support"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3 border-t border-emerald-500/20 pt-5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="diag-btn-dark inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:opacity-90 hover:-translate-y-0.5"
              >
                <span>
                  {locale === "si"
                    ? "WhatsApp මඟින් විමසන්න"
                    : "Discuss on WhatsApp"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <Link
                href={currentGoal.recHref}
                className="inline-flex items-center justify-center rounded-full border border-emerald-600/40 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:border-emerald-600 hover:bg-white transition-all hover:-translate-y-0.5"
              >
                <span>{locale === "si" ? "විස්තර" : "Explore"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
