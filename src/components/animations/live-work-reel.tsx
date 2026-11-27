"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pause,
  Play,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type {
  PublicProductDTO,
  PublicProjectDTO,
} from "@/server/services/public-content.service";

interface LiveWorkReelProps {
  products?: PublicProductDTO[];
  projects?: PublicProjectDTO[];
  videoUrl?: string;
  locale?: "en" | "si";
}

interface ClientSlide {
  id: string;
  code: string;
  name: string;
  url: string;
  displayUrl: string;
  logo: string;
  category: string;
  categorySi: string;
  image: string;
  highlight: string;
  highlightSi: string;
}

const CLIENT_SLIDES: ClientSlide[] = [
  {
    id: "ransan",
    code: "RB",
    name: "Ransan Boat House",
    url: "https://ransanboathouse.com/",
    displayUrl: "ransanboathouse.com",
    logo: "",
    category: "CLIENT BUILD · RIVER SAFARI BOOKING",
    categorySi: "සංචාරක හා බෝට්ටු වෙන්කිරීමේ පද්ධතිය",
    image: "/images/reel/ransanboathouse.jpg",
    highlight: "Custom Booking Flow · WhatsApp Pier Desk · Direct Reservations",
    highlightSi: "සෘජු වෙන්කිරීම් · WhatsApp සම්බන්ධතාව · නවීන වෙබ් අත්දැකීම",
  },
  {
    id: "signature-tours",
    code: "ST",
    name: "Sri Lanka Signature Tours",
    url: "https://srilankasignaturetours.com/",
    displayUrl: "srilankasignaturetours.com",
    logo: "",
    category: "CLIENT BUILD · LUXURY TRAVEL",
    categorySi: "සුඛෝපභෝගී සංචාරක සහ ගමන් සැලසුම්",
    image: "/images/reel/srilankasignaturetours.jpg",
    highlight: "Tailor-Made Journeys · Lead Capture · High-Speed Web Architecture",
    highlightSi: "විශේෂිත සංචාරක සැලසුම් · පාරිභෝගික ආකර්ෂණය · වේගවත් වෙබ් පද්ධතිය",
  },
  {
    id: "sakwa-canneries",
    code: "SC",
    name: "Sakwa Canneries",
    url: "https://sakwacanneries.com/",
    displayUrl: "sakwacanneries.com",
    logo: "",
    category: "CLIENT BUILD · EXPORT & FOOD MANUFACTURING",
    categorySi: "අපනයන සහ ආහාර නිෂ්පාදන වෙබ් පද්ධතිය",
    image: "/images/reel/sakwacanneries.jpg",
    highlight: "Global Export Showcase · Product Catalog · B2B Inquiry Flow",
    highlightSi: "ගෝලීය අපනයන ප්‍රදර්ශනය · නිෂ්පාදන නාමාවලිය · B2B සම්බන්ධතා",
  },
];

const SLIDE_DURATION_MS = 10000;
const TICK_MS = 100;

interface WorkspaceItem {
  kind: "client" | "product";
  id: string;
  code: string;
  name: string;
  url: string;
  isExternal: boolean;
  displayUrl: string;
  category: string;
  highlight: string;
  ctaLabel: string;
  image: string;
  video?: string;
  pan: boolean;
}

function formatHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Unified Vardhel Desktop Workspace:
 * ~75% interactive browser showcase + ~25% Vardhel Products & Client Work navigator.
 */
export function LiveWorkReel({
  products = [],
  projects = [],
  videoUrl = "",
  locale = "en",
}: LiveWorkReelProps) {
  const hasUploadedVideo = Boolean(videoUrl && videoUrl.trim().length > 0);

  const clientSlides: ClientSlide[] = useMemo(() => {
    if (projects.length === 0) return CLIENT_SLIDES;

    const findFallback = (slug: string, name: string) => {
      const hay = `${slug} ${name}`.toLowerCase();
      return CLIENT_SLIDES.find(
        (c) =>
          (c.id === "ransan" && hay.includes("ransan")) ||
          (c.id === "signature-tours" && hay.includes("signature")) ||
          (c.id === "sakwa-canneries" && hay.includes("sakwa"))
      );
    };

    const mapped = projects.map((proj) => {
      const liveLink =
        proj.links.find((l) => l.type === "LIVE_SITE" || l.type === "DEMO" || l.type === "APP") ??
        proj.links[0];
      const href = liveLink?.url || `/projects/${proj.slug}`;
      const displayName = proj.clientName || proj.title;
      const fallback = findFallback(proj.slug, displayName);
      return {
        id: proj.id,
        code: fallback?.code ?? displayName.slice(0, 2).toUpperCase(),
        name: displayName,
        url: href,
        displayUrl: liveLink?.url ? formatHost(liveLink.url) : `vardhel.com/projects/${proj.slug}`,
        logo: proj.logoUrl || fallback?.logo || "",
        category: proj.industry
          ? `CLIENT BUILD · ${proj.industry.toUpperCase()}`
          : fallback?.category ?? "CLIENT BUILD",
        categorySi: proj.industry
          ? `පාරිභෝගික ව්‍යාපෘතිය · ${proj.industry}`
          : fallback?.categorySi ?? "පාරිභෝගික ව්‍යාපෘතිය",
        image: proj.coverUrl || fallback?.image || "",
        highlight: proj.summary || proj.title,
        highlightSi: proj.summary || proj.title,
      };
    });

    // Ensure all 3 built-in client reels appear even if DB only has partial projects
    const extras = CLIENT_SLIDES.filter(
      (c) => !mapped.some((m) => findFallback(m.name, m.name)?.id === c.id)
    );
    return [...mapped, ...extras];
  }, [projects]);

  const items: WorkspaceItem[] = useMemo(() => {
    const clientItems: WorkspaceItem[] = clientSlides.map((s) => {
      const isExternal = s.url.startsWith("http://") || s.url.startsWith("https://");
      return {
        kind: "client",
        id: s.id,
        code: s.code,
        name: s.name,
        url: s.url,
        isExternal,
        displayUrl: s.displayUrl,
        category: locale === "si" ? s.categorySi : s.category,
        highlight: locale === "si" ? s.highlightSi : s.highlight,
        ctaLabel: isExternal
          ? locale === "si"
            ? "වෙබ් අඩවිය බලන්න"
            : "Visit Live Site"
          : locale === "si"
            ? "ව්‍යාපෘතිය බලන්න"
            : "View Case Study",
        image: s.image,
        pan: Boolean(s.image),
      };
    });

    const productItems: WorkspaceItem[] = products.map((prod) => {
      const isCaptureDefault =
        prod.slug.includes("capture") &&
        (!prod.coverUrl || prod.coverUrl === "/assets/img/captureloom_cover.jpg");
      const image = isCaptureDefault
        ? "/images/reel/captureloom.jpg"
        : prod.coverUrl || "";
      return {
        kind: "product",
        id: prod.id,
        code: "APP",
        name: prod.name,
        url: `/products/${prod.slug}`,
        isExternal: false,
        displayUrl: `vardhel.com/products/${prod.slug}`,
        category:
          locale === "si"
            ? `VARDHEL නිෂ්පාදන · ${prod.status}`
            : `VARDHEL PRODUCT · ${prod.status}`,
        highlight: prod.tagline || prod.shortDescription,
        ctaLabel: locale === "si" ? `${prod.name} බලන්න` : `Explore ${prod.name}`,
        image,
        video: prod.videoType === "video" && prod.videoUrl ? prod.videoUrl : undefined,
        pan: isCaptureDefault,
      };
    });

    return [...clientItems, ...productItems];
  }, [clientSlides, products, locale]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [showCustomVideo, setShowCustomVideo] = useState(hasUploadedVideo);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [logoFailed, setLogoFailed] = useState<Record<string, boolean>>({});

  const productsRailRef = useRef<HTMLDivElement>(null);
  const clientsRailRef = useRef<HTMLDivElement>(null);

  const [productsScroll, setProductsScroll] = useState({ prev: false, next: false });
  const [clientsScroll, setClientsScroll] = useState({ prev: false, next: false });

  const syncOverflowControls = useCallback(() => {
    const dock = productsRailRef.current;
    if (dock) {
      const hasX = dock.scrollWidth > dock.clientWidth + 4;
      setProductsScroll({
        prev: hasX && dock.scrollLeft > 2,
        next: hasX && dock.scrollLeft + dock.clientWidth < dock.scrollWidth - 2,
      });
    }

    const clients = clientsRailRef.current;
    if (clients) {
      const hasY = clients.scrollHeight > clients.clientHeight + 4;
      setClientsScroll({
        prev: hasY && clients.scrollTop > 2,
        next: hasY && clients.scrollTop + clients.clientHeight < clients.scrollHeight - 2,
      });
    }
  }, []);

  useEffect(() => {
    syncOverflowControls();
    window.addEventListener("resize", syncOverflowControls);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncOverflowControls) : null;
    if (ro) {
      if (productsRailRef.current) ro.observe(productsRailRef.current);
      if (clientsRailRef.current) ro.observe(clientsRailRef.current);
    }
    return () => {
      window.removeEventListener("resize", syncOverflowControls);
      ro?.disconnect();
    };
  }, [syncOverflowControls, items.length]);

  useEffect(() => {
    CLIENT_SLIDES.forEach((s) => {
      if (s.image) {
        const img = new window.Image();
        img.src = s.image;
      }
    });
  }, []);

  useEffect(() => {
    if (showCustomVideo || !isPlaying || isHoverPaused || items.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + TICK_MS;
        if (next >= SLIDE_DURATION_MS) {
          setActiveIdx((curr) => (curr + 1) % items.length);
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [showCustomVideo, isPlaying, isHoverPaused, items.length]);

  const activeItem = items[activeIdx] ?? items[0]!;
  const isActivelyCycling = !showCustomVideo && isPlaying && !isHoverPaused;
  const progressPct = Math.min(100, (elapsedMs / SLIDE_DURATION_MS) * 100);

  const selectItem = (idx: number, pauseOnSelect = true) => {
    setShowCustomVideo(false);
    setActiveIdx(idx);
    setElapsedMs(0);
    if (pauseOnSelect) setIsPlaying(false);
  };

  const scrollSidebarList = (axis: "x" | "y", dir: number) => {
    const el = axis === "x" ? productsRailRef.current : clientsRailRef.current;
    if (!el) return;
    if (axis === "x") {
      el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.7), behavior: "smooth" });
    } else {
      el.scrollBy({ top: dir * Math.max(96, el.clientHeight * 0.7), behavior: "smooth" });
    }
  };

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#0e192c] via-[#111827] to-[#09090b] shadow-xl">
      {/* Slim macOS-style Top Menu Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0b1220]/90 px-3.5 py-1.5 text-xs text-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isActivelyCycling || showCustomVideo ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#6ee7b7]">
            {locale === "si" ? "Vardhel වැඩබිම" : "Vardhel Workspace"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasUploadedVideo && !showCustomVideo && (
            <button
              type="button"
              onClick={() => setShowCustomVideo(true)}
              className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] text-[#6ee7b7] hover:bg-emerald-500/20 transition-colors"
            >
              Back to Showreel
            </button>
          )}
        </div>
      </div>

      {/* Desktop Body: ~75% Browser Showcase + ~25% Workspace Sidebar */}
      <div className="relative p-2.5 sm:p-3.5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.16),transparent_60%)]"
        />

        <div className="relative z-10 grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch">
          {/* ~75% Left: Active Browser Window */}
          <div
            onMouseEnter={() => setIsHoverPaused(true)}
            onMouseLeave={() => setIsHoverPaused(false)}
            className="lg:col-span-9 flex flex-col overflow-hidden rounded-xl border border-white/15 bg-[#111114] shadow-2xl"
          >
            {/* Browser Chrome */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#18181b] px-3.5 py-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>

              {showCustomVideo ? (
                <span className="font-mono text-[11px] text-[#e2e8f0]">vardhel.com/showreel</span>
              ) : activeItem.isExternal ? (
                <a
                  href={activeItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-0 max-w-[200px] sm:max-w-none items-center gap-1.5 rounded-md bg-black/40 px-3 py-0.5 font-mono text-[11px] text-[#e2e8f0] hover:text-[#6ee7b7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span className="truncate">{activeItem.displayUrl}</span>
                  <ArrowUpRight className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <Link
                  href={activeItem.url}
                  className="inline-flex min-w-0 max-w-[200px] sm:max-w-none items-center gap-1.5 rounded-md bg-black/40 px-3 py-0.5 font-mono text-[11px] text-[#e2e8f0] hover:text-[#6ee7b7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span className="truncate">{activeItem.displayUrl}</span>
                  <ArrowUpRight className="h-3 w-3 shrink-0" />
                </Link>
              )}

              <span className="hidden sm:inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-[#34d399]">
                {showCustomVideo
                  ? "SHOWREEL"
                  : activeItem.kind === "client"
                    ? "LIVE CLIENT"
                    : "VARDHEL PRODUCT"}
              </span>
            </div>

            {/* Viewport */}
            <div className="group/player relative h-[280px] sm:h-[360px] lg:h-[400px] [--reel-vh:280px] sm:[--reel-vh:360px] lg:[--reel-vh:400px] w-full overflow-hidden bg-slate-950">
              {showCustomVideo ? (
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
                <div className="relative h-full w-full overflow-hidden">
                  {activeItem.video ? (
                    <video
                      key={activeItem.id}
                      src={activeItem.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : activeItem.image && !logoFailed[`cover-${activeItem.id}`] ? (
                    <img
                      key={activeItem.id}
                      src={activeItem.image}
                      alt={activeItem.name}
                      onError={() =>
                        setLogoFailed((prev) => ({
                          ...prev,
                          [`cover-${activeItem.id}`]: true,
                        }))
                      }
                      className={
                        activeItem.pan
                          ? "animate-client-reel w-full h-auto min-h-full object-cover object-top"
                          : "animate-product-reel w-full h-full object-cover"
                      }
                      style={
                        isHoverPaused || !isPlaying
                          ? { animationPlayState: "paused" }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0e192c] via-[#111827] to-[#064e3b] px-6 pb-16 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 font-mono text-lg font-extrabold text-[#6ee7b7] shadow-lg">
                        {activeItem.code}
                      </div>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-emerald-300/80">
                        {activeItem.displayUrl}
                      </p>
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#09090b]/60 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-transparent" />

                  {/* Center Video Player Play / Pause Button */}
                  <button
                    type="button"
                    aria-label={isPlaying ? "Pause showcase reel" : "Play showcase reel"}
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className={`keep-white absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-[#09090b]/75 text-white shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-emerald-400/70 hover:bg-[#09090b]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      isPlaying
                        ? "opacity-0 group-hover/player:opacity-100 focus-visible:opacity-100"
                        : "opacity-100"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 translate-x-0.5" />
                    )}
                  </button>

                  <div className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-end justify-between gap-3 px-4 pb-3.5 sm:px-6 sm:pb-4">
                    <div className="max-w-xl">
                      <span className="inline-block font-mono text-[11px] font-bold uppercase tracking-widest text-[#6ee7b7]">
                        {activeItem.category}
                      </span>
                      <h3 className="mt-0.5 text-sm sm:text-base font-bold text-[#ffffff]">
                        {activeItem.name}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-xs font-medium text-[#f1f5f9]">
                        {activeItem.highlight}
                      </p>
                    </div>

                    {activeItem.isExternal ? (
                      <a
                        href={activeItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-[#09090b]/90 px-3.5 py-1.5 text-xs font-semibold text-[#34d399] hover:bg-emerald-500/20 transition-colors"
                      >
                        <span>{activeItem.ctaLabel}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={activeItem.url}
                        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-[#09090b]/90 px-3.5 py-1.5 text-xs font-semibold text-[#34d399] hover:bg-emerald-500/20 transition-colors"
                      >
                        <span>{activeItem.ctaLabel}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2px Cycle Progress Indicator */}
            {!showCustomVideo && (
              <div className="h-0.5 w-full bg-white/10">
                <div
                  className="h-full bg-emerald-400 transition-all duration-100 ease-linear"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </div>

          {/* ~25% Right: Horizontal Vardhel Products Icons + Vertical Client Work */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
            <div className="flex flex-1 flex-col gap-3">
              {/* Top: Horizontal Desktop Icons for Vardhel Products */}
              {products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                      Vardhel Products
                    </span>
                  </div>

                  <div className="relative">
                    {productsScroll.prev && (
                      <button
                        type="button"
                        aria-label="Scroll products left"
                        onClick={() => scrollSidebarList("x", -1)}
                        className="absolute inset-y-0 left-0 z-20 flex w-7 items-center justify-start bg-gradient-to-r from-[#0e192c] via-[#0e192c]/90 to-transparent pl-0.5 text-[#cbd5e1] transition-colors hover:text-[#6ee7b7] focus-visible:outline-none"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-[#0b1220]/95 shadow-md backdrop-blur-md">
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    )}

                    <div
                      ref={productsRailRef}
                      data-lenis-prevent
                      onScroll={syncOverflowControls}
                      className="no-scrollbar flex gap-1.5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth pb-0.5"
                    >
                      {products.map((prod, idx) => {
                        const slideIndex = clientSlides.length + idx;
                        const isSelected = !showCustomVideo && activeIdx === slideIndex;
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => selectItem(slideIndex, true)}
                            className={`snap-start w-[calc((100%-12px)/3)] shrink-0 group flex flex-col items-center text-center gap-1.5 rounded-xl border px-1 py-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                              isSelected
                                ? "border-emerald-400/60 bg-emerald-500/15"
                                : "border-transparent bg-white/[0.04] hover:border-emerald-400/40 hover:bg-white/[0.08]"
                            }`}
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95 p-1.5 shadow-md ring-1 ring-white/20 transition-transform group-hover:scale-105">
                              {prod.logoUrl && !logoFailed[`prod-${prod.id}`] ? (
                                <img
                                  src={prod.logoUrl}
                                  alt={prod.name}
                                  className="h-full w-full object-contain"
                                  onError={() =>
                                    setLogoFailed((prev) => ({
                                      ...prev,
                                      [`prod-${prod.id}`]: true,
                                    }))
                                  }
                                />
                              ) : (
                                <span className="font-mono text-xs font-bold text-[#0f172a]">
                                  {prod.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span
                              className={`w-full truncate text-[11px] font-bold ${
                                isSelected ? "text-[#6ee7b7]" : "text-[#ffffff] group-hover:text-[#6ee7b7]"
                              }`}
                            >
                              {prod.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {productsScroll.next && (
                      <button
                        type="button"
                        aria-label="Scroll products right"
                        onClick={() => scrollSidebarList("x", 1)}
                        className="absolute inset-y-0 right-0 z-20 flex w-7 items-center justify-end bg-gradient-to-l from-[#0e192c] via-[#0e192c]/90 to-transparent pr-0.5 text-[#cbd5e1] transition-colors hover:text-[#6ee7b7] focus-visible:outline-none"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-[#0b1220]/95 shadow-md backdrop-blur-md">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom: Vertical Client Work List */}
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    Client Work
                  </span>
                </div>

                <div className="relative flex-1">
                  {clientsScroll.prev && (
                    <button
                      type="button"
                      aria-label="Scroll client work up"
                      onClick={() => scrollSidebarList("y", -1)}
                      className="absolute inset-x-0 top-0 z-20 flex h-7 items-start justify-center bg-gradient-to-b from-[#0e192c] via-[#0e192c]/90 to-transparent pt-0.5 text-[#cbd5e1] transition-colors hover:text-[#6ee7b7] focus-visible:outline-none"
                    >
                      <span className="flex h-5 items-center justify-center rounded-full border border-white/15 bg-[#0b1220]/95 px-2.5 shadow-md backdrop-blur-md">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  )}

                  <div
                    ref={clientsRailRef}
                    data-lenis-prevent
                    onScroll={syncOverflowControls}
                    className="no-scrollbar flex max-h-[268px] flex-col gap-2 overflow-y-auto overscroll-y-contain snap-y snap-mandatory scroll-smooth"
                  >
                    {clientSlides.map((client, idx) => {
                      const isSelected = !showCustomVideo && activeIdx === idx;
                      const showFallback = !client.logo || logoFailed[client.id];
                      return (
                        <button
                          key={client.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => selectItem(idx, true)}
                          className={`group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                            isSelected
                              ? "border-emerald-400/60 bg-emerald-500/15 text-[#ffffff]"
                              : "border-transparent bg-white/[0.04] text-[#cbd5e1] hover:border-emerald-400/40 hover:bg-white/[0.08]"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/95 p-1 shadow-sm ring-1 ring-white/20">
                            {showFallback ? (
                              <span className="font-mono text-[11px] font-bold text-[#0f172a]">
                                {client.code}
                              </span>
                            ) : (
                              <img
                                src={client.logo}
                                alt={`${client.name} logo`}
                                className="h-full w-full object-contain"
                                onError={() =>
                                  setLogoFailed((prev) => ({ ...prev, [client.id]: true }))
                                }
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold text-[#ffffff]">
                              {client.name}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-[11px] text-[#94a3b8]">
                              {client.displayUrl}
                            </span>
                          </div>
                          <span
                            className={`text-xs ${
                              isSelected ? "text-[#6ee7b7]" : "text-[#64748b] group-hover:text-[#6ee7b7]"
                            }`}
                          >
                            ▶
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {clientsScroll.next && (
                    <button
                      type="button"
                      aria-label="Scroll client work down"
                      onClick={() => scrollSidebarList("y", 1)}
                      className="absolute inset-x-0 bottom-0 z-20 flex h-7 items-end justify-center bg-gradient-to-t from-[#0e192c] via-[#0e192c]/90 to-transparent pb-0.5 text-[#cbd5e1] transition-colors hover:text-[#6ee7b7] focus-visible:outline-none"
                    >
                      <span className="flex h-5 items-center justify-center rounded-full border border-white/15 bg-[#0b1220]/95 px-2.5 shadow-md backdrop-blur-md">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Minimal Workspace Footer */}
            <div className="hidden lg:flex items-center justify-end border-t border-white/10 pt-2.5 text-[11px] text-[#94a3b8]">
              <Link href="/products" className="font-semibold text-[#6ee7b7] hover:underline">
                View All ↗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
