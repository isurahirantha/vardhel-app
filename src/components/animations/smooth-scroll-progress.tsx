"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export function SmoothScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Detect touch-only mobile devices where native 120Hz scrolling is superior
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;

    const updateBar = (ratio: number) => {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
      }
    };

    const onNativeScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      updateBar(total > 0 ? window.scrollY / total : 0);
    };

    if (prefersReducedMotion || isTouchOnly) {
      onNativeScroll();
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => window.removeEventListener("scroll", onNativeScroll);
    }

    const lenis = new Lenis({
      lerp: 0.06,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1,
      anchors: true,
    });

    lenis.on("scroll", ({ progress }) => {
      updateBar(progress);
    });

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-orange-500 via-orange-600 to-indigo-500 will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
