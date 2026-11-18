"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface VideoFacadeProps {
  videoType: string | null;
  videoUrl: string | null;
  posterUrl?: string;
  title: string;
  watchLabel: string;
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    const v = parsed.searchParams.get("v");
    if (v) {
      return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1&rel=0`;
    }
    if (parsed.pathname.includes("/embed/")) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}

export function VideoFacade({
  videoType,
  videoUrl,
  posterUrl,
  title,
  watchLabel,
}: VideoFacadeProps) {
  const [activated, setActivated] = useState(false);

  if (!videoUrl) return null;

  const isYoutube =
    videoType === "youtube" ||
    videoUrl.includes("youtube.com") ||
    videoUrl.includes("youtu.be");
  const isVimeo = videoType === "vimeo" || videoUrl.includes("vimeo.com");

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/15 bg-[#0d1326] shadow-2xl">
      {!activated ? (
        <button
          type="button"
          onClick={() => setActivated(true)}
          className="group relative flex h-full w-full flex-col items-center justify-center p-6 text-center"
          aria-label={`${watchLabel}: ${title}`}
        >
          {posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-orange-600 text-white shadow-2xl shadow-orange-600/40 transition-transform group-hover:scale-110">
            <Play className="ml-1 h-8 w-8 fill-white" />
          </div>
          <span className="relative z-10 mt-4 rounded-full border border-white/15 bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            {watchLabel} (~2 Min)
          </span>
        </button>
      ) : isYoutube ? (
        <iframe
          src={getYoutubeEmbedUrl(videoUrl) ?? videoUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : isVimeo ? (
        <iframe
          src={videoUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <video
          src={videoUrl}
          controls
          autoPlay
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}
