"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface LiveWorkReelProps {
  videoUrl?: string;
  locale?: "en" | "si";
}

interface ReelSlide {
  id: string;
  code: string;
  name: string;
  url: string;
  displayUrl: string;
  category: string;
  categorySi: string;
  image: string;
  highlight: string;
  highlightSi: string;
}

const REEL_SLIDES: ReelSlide[] = [
  {
    id: "ransan",
    code: "01",
    name: "Ransan Boat House",
    url: "https://ransanboathouse.com/",
    displayUrl: "ransanboathouse.com",
    category: "Hospitality & River Safari Booking",
    categorySi: "සංචාරක හා බෝට්ටු වෙන්කිරීමේ පද්ධතිය",
    image: "/images/reel/ransanboathouse.jpg",
    highlight: "Custom Booking Flow · WhatsApp Pier Desk · Direct Reservations",
    highlightSi: "සෘජු වෙන්කිරීම් · WhatsApp සම්බන්ධතාව · නවීන වෙබ් අත්දැකීම",
  },
  {
    id: "signature-tours",
    code: "02",
    name: "Sri Lanka Signature Tours",
    url: "https://srilankasignaturetours.com/",
    displayUrl: "srilankasignaturetours.com",
    category: "Luxury Travel & Bespoke Itineraries",
    categorySi: "සුඛෝපභෝගී සංචාරක සහ ගමන් සැලසුම්",
    image: "/images/reel/srilankasignaturetours.jpg",
    highlight: "Tailor-Made Journeys · Lead Capture · High-Speed Web Architecture",
    highlightSi: "විශේෂිත සංචාරක සැලසුම් · පාරිභෝගික ආකර්ෂණය · වේගවත් වෙබ් පද්ධතිය",
  },
];

const SLIDE_DURATION_MS = 3500;

/**
 * Displays the admin-uploaded looping MP4/WebM showreel when available,
 * or falls back to an animated multi-site client showcase reel with smooth panning.
 */
export function LiveWorkReel({ videoUrl = "", locale = "en" }: LiveWorkReelProps) {
  const hasUploadedVideo = Boolean(videoUrl && videoUrl.trim().length > 0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (hasUploadedVideo || isPaused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % REEL_SLIDES.length);
    }, SLIDE_DURATION_MS);

    return () => window.clearInterval(timer);
  }, [hasUploadedVideo, isPaused]);

  const activeSlide = REEL_SLIDES[activeIdx] ?? REEL_SLIDES[0]!;

  return (
    <div
      className="mt-5 overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#09090b] shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Status & Scene Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#111114] px-4 py-2.5 text-xs text-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#6ee7b7]">
            {locale === "si" ? "සජීවී ව්‍යාපෘති දර්ශනය" : "Live Work Reel · Auto-Loop"}
          </span>
        </div>

        {hasUploadedVideo ? (
          <span className="font-mono text-[11px] text-[#94a3b8]">Custom Showreel</span>
        ) : (
          <div className="flex items-center gap-1.5">
            {REEL_SLIDES.map((slide, idx) => {
              const isCurrent = idx === activeIdx;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-colors ${
                    isCurrent
                      ? "bg-emerald-500/20 font-bold text-[#6ee7b7] ring-1 ring-emerald-500/40"
                      : "text-[#94a3b8] hover:text-[#f8fafc]"
                  }`}
                >
                  {slide.code} / {slide.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Viewport */}
      <div className="relative aspect-[21/9] min-h-[220px] max-h-[260px] sm:max-h-[320px] lg:max-h-[340px] w-full overflow-hidden bg-[#09090b]">
        {hasUploadedVideo ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            {/* Subtle Radial Backdrop */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_65%)]"
            />

            {/* Floating Browser Showcase Window */}
            <div className="relative mx-auto flex h-full max-w-[1040px] flex-col px-4 pt-4 sm:px-8 sm:pt-5">
              <div className="relative flex flex-1 flex-col overflow-hidden rounded-t-xl border border-b-0 border-white/15 bg-[#111114] shadow-2xl">
                {/* Browser Top Chrome */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#18181b] px-3.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <a
                    href={activeSlide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-black/40 px-3 py-0.5 font-mono text-[11px] text-[#e2e8f0] transition-colors hover:text-[#6ee7b7]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{activeSlide.displayUrl}</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                  <span className="hidden sm:inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-[#34d399]">
                    LIVE CLIENT
                  </span>
                </div>

                {/* Animated Panning Website Screenshots */}
                <div className="relative flex-1 overflow-hidden bg-slate-950">
                  {REEL_SLIDES.map((slide, idx) => {
                    const isCurrent = idx === activeIdx;
                    return (
                      <div
                        key={slide.id}
                        aria-hidden={!isCurrent}
                        className={`absolute inset-0 transition-all duration-500 ease-out ${
                          isCurrent
                            ? "opacity-100 translate-y-0 scale-100"
                            : "pointer-events-none opacity-0 translate-y-2 scale-[1.01]"
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={`${slide.name} — ${slide.displayUrl}`}
                          className="w-full h-[145%] object-cover object-top transition-transform duration-[3200ms] ease-linear"
                          style={{
                            transform: isCurrent && !isPaused ? "translateY(-22%)" : "translateY(0%)",
                          }}
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-transparent" />
                      </div>
                    );
                  })}

                  {/* Lower-Third Client Caption Overlay */}
                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-3 px-4 pb-3.5 sm:px-6 sm:pb-4">
                    <div className="max-w-xl">
                      <span className="inline-block font-mono text-[10px] font-bold uppercase tracking-widest text-[#6ee7b7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        {locale === "si" ? activeSlide.categorySi : activeSlide.category}
                      </span>
                      <h3 className="mt-0.5 text-sm sm:text-base font-bold text-[#ffffff] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                        {activeSlide.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-[#f1f5f9] drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                        {locale === "si" ? activeSlide.highlightSi : activeSlide.highlight}
                      </p>
                    </div>
                    <a
                      href={activeSlide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-[#09090b]/90 px-3.5 py-1.5 text-xs font-semibold text-[#34d399] shadow-lg backdrop-blur-md transition-colors hover:bg-emerald-500/20"
                    >
                      <span>{locale === "si" ? "වෙබ් අඩවිය බලන්න" : "Visit Live Site"}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
