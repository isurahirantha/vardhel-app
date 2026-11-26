"use client";

import { useEffect, useRef, useState } from "react";

export interface WorkStepItem {
  title: string;
  desc: string;
}

interface HowVardhelWorksGridProps {
  steps: WorkStepItem[];
}

interface BoxRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Interactive 5-card grid with an AirDrop-style gliding aura, transfer signal,
 * and concentric arrival ripple when moving the pointer from card to card.
 */
export function HowVardhelWorksGrid({ steps }: HowVardhelWorksGridProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
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
    if (activeIdx === nextIdx) return;

    const nextRect = measureCard(nextIdx);
    const prevRect = activeIdx !== null ? measureCard(activeIdx) : null;

    if (prevRect && nextRect) {
      setBeam({
        fromX: prevRect.left + prevRect.width / 2,
        toX: nextRect.left + nextRect.width / 2,
        y: nextRect.top + 36,
      });
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

  // Re-measure active card on resize so the gliding frame stays aligned
  useEffect(() => {
    if (activeIdx === null) return;
    const onResize = () => {
      setActiveRect(measureCard(activeIdx));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIdx]);

  return (
    <div className="relative mt-10" onMouseLeave={handleDeactivate}>
      {/* Desktop horizontal connecting track behind the 5 step nodes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[10%] right-[10%] top-[36px] hidden h-0.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/25 to-emerald-500/10 lg:block"
      />

      {/* AirDrop transfer pulse traveling along the track from previous card to active card */}
      {beam && (
        <div
          key={`beam-${pulseKey}`}
          aria-hidden="true"
          className="pointer-events-none absolute hidden lg:block z-10 h-1 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.75)] airdrop-beam"
          style={
            {
              top: `${beam.y - 1}px`,
              "--beam-from": `${beam.fromX}px`,
              "--beam-to": `${beam.toX}px`,
            } as React.CSSProperties
          }
        />
      )}

      {/* Gliding AirDrop shared glass aura following the active card */}
      {activeRect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-0 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent shadow-[0_14px_34px_-10px_rgba(16,185,129,0.28)] ring-1 ring-emerald-500/40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            left: `${activeRect.left - 3}px`,
            top: `${activeRect.top - 3}px`,
            width: `${activeRect.width + 6}px`,
            height: `${activeRect.height + 6}px`,
          }}
        />
      )}

      <ol
        ref={listRef}
        className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        {steps.map((step, i) => {
          const isActive = activeIdx === i;
          const isDimmed = activeIdx !== null && !isActive;

          return (
            <li
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              tabIndex={0}
              onMouseEnter={() => handleActivate(i)}
              onFocus={() => handleActivate(i)}
              className={`glass-card relative rounded-2xl p-5 outline-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isActive
                  ? "-translate-y-1.5 scale-[1.02] border-emerald-500/50 bg-[var(--bg-surface)] shadow-xl"
                  : isDimmed
                  ? "opacity-85 scale-[0.99]"
                  : ""
              }`}
            >
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
                  className={`relative flex h-9 w-9 items-center justify-center rounded-xl border font-mono text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                      : "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  0{i + 1}
                </span>
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
  );
}

