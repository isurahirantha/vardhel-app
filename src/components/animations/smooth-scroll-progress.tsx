"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";

export function SmoothScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Detect touch-only mobile devices where native 120Hz scrolling is superior
    const isTouchOnly =
      window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(pointer: fine)").matches;

    const onScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    if (prefersReducedMotion || isTouchOnly) {
      return () => window.removeEventListener("scroll", onScroll);
    }

    // High responsiveness: reduced from 1.05s to 0.65s for snappy, immediate interaction
    const lenis = new Lenis({
      duration: 0.65,
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1,
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
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-indigo-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
