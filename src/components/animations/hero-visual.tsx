"use client";

import Image from "next/image";
import {
  Compass,
  Code2,
  Share2,
  MessageSquareHeart,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const FIVE_PILLARS = [
  { key: "UNDERSTAND", icon: Compass },
  { key: "BUILD", icon: Code2 },
  { key: "CONNECT", icon: Share2 },
  { key: "ENGAGE", icon: MessageSquareHeart },
  { key: "GROW", icon: TrendingUp },
];

export function HeroVisual({
  enable3d = true,
  locale = "en",
}: {
  enable3d?: boolean;
  locale?: "en" | "si";
}) {
  return (
    <div className="glass-card relative overflow-hidden rounded-3xl p-5 sm:p-6">
      {enable3d && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-500/15 blur-2xl"
        />
      )}

      {/* Top Identity Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold tracking-wide text-[var(--text-primary)]">
            {locale === "si"
              ? "ඩිජිටල් ව්‍යාපාර වර්ධන හවුල්කරු"
              : "Digital Business Growth Partner"}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-semibold text-orange-500">
          <Sparkles className="h-3 w-3" />
          <span>Vardhel Framework</span>
        </span>
      </div>

      {/* Main Hero Brand Graphic */}
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-slate-900/50 p-2">
        <Image
          src="/assets/hero_image.png"
          alt="Vardhel Digital Business Growth Partner Visual"
          width={640}
          height={420}
          className="h-auto w-full rounded-xl object-cover"
          priority
        />
      </div>

      {/* 5-Stage Connected Flow Strip */}
      <div className="mt-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/70 p-3.5">
        <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {locale === "si"
            ? "අපගේ පියවර 5ක වර්ධන ප්‍රවේශය"
            : "Our 5-Stage Growth Architecture"}
        </p>
        <div className="mt-2.5 grid grid-cols-5 gap-1.5 text-center">
          {FIVE_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 py-2"
              >
                <Icon className="h-4 w-4 text-orange-500" />
                <span className="mt-1 font-mono text-[9px] font-bold tracking-tight text-[var(--text-primary)] sm:text-[10px]">
                  {item.key}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
