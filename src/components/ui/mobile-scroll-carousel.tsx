"use client";

import { useRef } from "react";

interface MobileScrollCarouselProps {
  children: React.ReactNode;
  gridClassName?: string;
  wrapperClassName?: string;
  prevLabel?: string;
  nextLabel?: string;
  alwaysCarousel?: boolean;
}

/**
 * Horizontal snap-scroll carousel with ‹ / › buttons on mobile (< md),
 * seamlessly rendering as a standard grid on md+ viewports unless alwaysCarousel is true.
 */
export function MobileScrollCarousel({
  children,
  gridClassName = "md:grid md:grid-cols-3 md:gap-6",
  wrapperClassName = "mt-8",
  prevLabel = "Previous item",
  nextLabel = "Next item",
  alwaysCarousel = false,
}: MobileScrollCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByDir = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(260, el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className={wrapperClassName}>
      <div className={`mb-2 flex items-center justify-end gap-1.5 ${alwaysCarousel ? "" : "md:hidden"}`}>
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          aria-label={prevLabel}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] dark:bg-[#111114] text-xs font-bold text-[var(--text-primary)] shadow-2xs transition-colors hover:border-emerald-500/45"
        >
          &lsaquo;
        </button>
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label={nextLabel}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] dark:bg-[#111114] text-xs font-bold text-[var(--text-primary)] shadow-2xs transition-colors hover:border-emerald-500/45"
        >
          &rsaquo;
        </button>
      </div>

      <div
        ref={scrollerRef}
        className={`no-scrollbar flex overflow-x-auto snap-x snap-mandatory gap-4 pt-2 pb-3 -mx-4 px-4 scroll-px-4 md:mx-0 md:px-0 md:pt-0 md:pb-0 ${alwaysCarousel ? "" : "md:overflow-visible"} ${gridClassName}`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </div>
  );
}

