"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface StageCapabilityCard {
  code: string;
  title: string;
  desc: string;
  href: string;
}

export interface WorkStepItem {
  title: string;
  desc: string;
  tag?: string;
  advantageLabel?: string;
  advantageTitle?: string;
  advantageQuote?: string;
  activeCapIds?: string[];
  cards?: StageCapabilityCard[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface CapabilityBadgeItem {
  id: string;
  label: string;
  href: string;
}

interface HowVardhelWorksGridProps {
  steps: WorkStepItem[];
  allCapabilities?: CapabilityBadgeItem[];
  capabilitiesLabel?: string;
}

interface BoxRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Interactive 5-card grid with an AirDrop-style gliding aura, transfer signal,
 * concentric arrival ripple, and a synchronized Stage Workflow & Capabilities panel.
 */
export function HowVardhelWorksGrid({
  steps,
  allCapabilities = [],
  capabilitiesLabel = "Capabilities Activated:",
}: HowVardhelWorksGridProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [pulseKey, setPulseKey] = useState<number>(0);
  const [beam, setBeam] = useState<{ fromX: number; toX: number; y: number } | null>(
    null
  );
  const [activeRect, setActiveRect] = useState<BoxRect | null>(null);

  const measureCard = (idx: number): BoxRect | null => {
    const el = cardRefs.current[idx];
    if (!el) return null;
    return {
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
  };

  const handleActivate = (nextIdx: number) => {
    setSelectedIdx(nextIdx);
    if (activeIdx === nextIdx) return;

    const nextRect = measureCard(nextIdx);
    const prevRect = activeIdx !== null ? measureCard(activeIdx) : null;

    if (prevRect && nextRect) {
      setBeam({
        fromX: prevRect.left + prevRect.width / 2,
        toX: nextRect.left + nextRect.width / 2,
        y: nextRect.top + 36,
      });
      if (auraRef.current) {
        auraRef.current.classList.remove("airdrop-aura-leap");
        void auraRef.current.offsetWidth;
        auraRef.current.classList.add("airdrop-aura-leap");
      }
    } else {
      setBeam(null);
    }

    setActiveRect(nextRect);
    setActiveIdx(nextIdx);
    setPulseKey((k) => k + 1);
  };

  const handleDeactivate = () => {
    setActiveIdx(null);
    setActiveRect(null);
    setBeam(null);
  };

  const scrollStage = (dir: number) => {
    const nextIdx = Math.max(0, Math.min(steps.length - 1, selectedIdx + dir));
    setSelectedIdx(nextIdx);
    const listEl = listRef.current;
    const target = cardRefs.current[nextIdx];
    if (listEl && target) {
      listEl.scrollTo({
        left: Math.max(0, target.offsetLeft - 16),
        behavior: "smooth",
      });
    }
  };

  // Re-measure active card on resize so the gliding frame stays aligned
  useEffect(() => {
    if (activeIdx === null) return;
    const onResize = () => {
      if (window.innerWidth < 1024) {
        setActiveRect(null);
        setBeam(null);
        return;
      }
      setActiveRect(measureCard(activeIdx));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIdx]);

  const currentStage = steps[selectedIdx] ?? steps[0];
  const hasLinkedPanel = Boolean(currentStage?.advantageTitle && currentStage?.cards?.length);

  return (
    <div className="mt-8 lg:mt-10">
      <div className="mb-2.5 flex items-center justify-between lg:hidden">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Swipe stages
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollStage(-1)}
            aria-label="Previous stage"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] dark:bg-[#111114] text-xs font-bold text-[var(--text-primary)] shadow-2xs transition-colors hover:border-emerald-500/45"
          >
            &laquo;
          </button>
          <button
            type="button"
            onClick={() => scrollStage(1)}
            aria-label="Next stage"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] dark:bg-[#111114] text-xs font-bold text-[var(--text-primary)] shadow-2xs transition-colors hover:border-emerald-500/45"
          >
            &raquo;
          </button>
        </div>
      </div>

      <div className="relative" onMouseLeave={handleDeactivate}>
        {/* Desktop horizontal connecting track behind the 5 step nodes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[10%] right-[10%] top-9 hidden h-px bg-[var(--border-subtle)] lg:block"
        />

        {/* AirDrop transfer pulse traveling along the track from previous card to active card */}
        {beam && (
          <div
            key={`beam-${pulseKey}`}
            aria-hidden="true"
            className="pointer-events-none absolute hidden lg:block z-10 h-0.5 rounded-full bg-gradient-to-r from-transparent via-emerald-500/60 to-teal-500/60 airdrop-beam"
            style={
              {
                top: `${beam.y - 1}px`,
                "--beam-from": `${beam.fromX}px`,
                "--beam-to": `${beam.toX}px`,
              } as React.CSSProperties
            }
          />
        )}

        {/* Gliding AirDrop shared aura following the active card (desktop only) */}
        {activeRect && (
          <div
            ref={auraRef}
            aria-hidden="true"
            className="pointer-events-none absolute z-0 hidden lg:block rounded-2xl bg-emerald-500/[0.05] ring-1 ring-emerald-500/30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              left: `${activeRect.left - 4}px`,
              top: `${activeRect.top - 4}px`,
              width: `${activeRect.width + 8}px`,
              height: `${activeRect.height + 8}px`,
            }}
          />
        )}

        <ol
          ref={listRef}
          className="no-scrollbar relative z-10 flex overflow-x-auto snap-x snap-mandatory gap-3 pt-2 pb-3 -mx-4 px-4 scroll-px-4 lg:mx-0 lg:px-0 lg:pt-0 lg:pb-0 lg:overflow-visible lg:grid lg:grid-cols-5 lg:gap-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {steps.map((step, i) => {
            const isActive = activeIdx === i;
            const isSelected = selectedIdx === i;

            return (
              <li
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                tabIndex={0}
                onMouseEnter={() => handleActivate(i)}
                onFocus={() => handleActivate(i)}
                onClick={() => handleActivate(i)}
                className={`relative w-[68vw] max-w-[230px] shrink-0 snap-start lg:w-auto lg:max-w-none cursor-pointer rounded-2xl border bg-[var(--bg-surface)] dark:bg-[#111114] p-5 outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-emerald-500/45 hover:shadow-[0_12px_28px_-12px_rgba(14,25,44,0.14)] ${isSelected
                    ? "border-emerald-500/45 shadow-sm"
                    : "border-[var(--border-subtle)]"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="relative inline-flex items-center justify-center">
                    {/* Concentric AirDrop arrival ripple on the active step badge */}
                    {isActive && (
                      <span
                        key={`ripple-${pulseKey}-${i}`}
                        aria-hidden="true"
                        className="airdrop-ripple pointer-events-none absolute inset-0 rounded-xl border-2 border-emerald-400"
                      />
                    )}
                    <span
                      className={`relative flex h-9 w-9 items-center justify-center rounded-xl border font-mono text-sm font-bold transition-all duration-300 ${isActive || isSelected
                          ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm"
                          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        }`}
                    >
                      0{i + 1}
                    </span>
                  </div>

                  {step.tag && (
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-wider ${isSelected
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-[var(--text-muted)]"
                        }`}
                    >
                      {step.tag}
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-base font-bold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {step.desc}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Synchronized Stage Workflow & Capabilities Panel (700ms Crossfade Stack) */}
      {hasLinkedPanel && currentStage && (
        <div className="mt-6 grid grid-cols-1 rounded-2xl border border-[var(--border-subtle)] border-l-4 border-l-[#0E192C] dark:border-l-emerald-400 bg-[var(--bg-surface)] dark:bg-[#111114] p-6 sm:p-7 transition-all duration-300 hover:border-emerald-500/45 hover:shadow-[0_12px_28px_-12px_rgba(14,25,44,0.14)]">
          {steps.map((stage, idx) => {
            if (!stage.advantageTitle || !stage.cards?.length) return null;
            const isSelected = idx === selectedIdx;

            return (
              <div
                key={idx}
                aria-hidden={!isSelected}
                className={`col-start-1 row-start-1 flex flex-col justify-between transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isSelected
                    ? "opacity-100 translate-y-0 pointer-events-auto z-10"
                    : "opacity-0 translate-y-2 pointer-events-none z-0"
                }`}
              >
                <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-5 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-6 items-center rounded-md bg-emerald-500/15 px-2 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                        STAGE 0{idx + 1} · {stage.title.toUpperCase()}
                      </span>
                      {stage.advantageLabel && (
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          {stage.advantageLabel}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold leading-snug text-[var(--text-primary)]">
                      {stage.advantageTitle}
                    </h3>

                    {stage.advantageQuote && (
                      <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
                        {stage.advantageQuote}
                      </p>
                    )}

                    {stage.ctaLabel && stage.ctaHref && (
                      <div className="pt-1">
                        <Link
                          href={stage.ctaHref}
                          tabIndex={isSelected ? 0 : -1}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          <span>{stage.ctaLabel}</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {stage.cards.map((card) => (
                      <Link
                        key={card.title}
                        href={card.href}
                        tabIndex={isSelected ? 0 : -1}
                        className="group flex h-full flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] p-4 transition-colors hover:border-emerald-500/45"
                      >
                        <div>
                          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                            <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                              {card.code}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                          <h4 className="mt-2 text-sm font-bold text-[var(--text-primary)]">
                            {card.title}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                            {card.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {allCapabilities.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {capabilitiesLabel}
                    </span>
                    <div className="no-scrollbar flex flex-nowrap overflow-x-auto gap-1.5 pb-1 lg:flex-wrap lg:pb-0">
                      {allCapabilities
                        .filter((cap) => stage.activeCapIds?.includes(cap.id))
                        .map((cap) => (
                          <Link
                            key={cap.id}
                            href={cap.href}
                            tabIndex={isSelected ? 0 : -1}
                            className="whitespace-nowrap shrink-0 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20"
                          >
                            ✓ {cap.label}
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
