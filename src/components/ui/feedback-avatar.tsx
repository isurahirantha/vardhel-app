"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface FeedbackAvatarProps {
  name: string;
  avatarUrl?: string | null;
}

/**
 * Displays a customer's profile image (from uploaded media or Gravatar) and
 * falls back to a clean profile avatar placeholder when unavailable.
 */
export function FeedbackAvatar({ name, avatarUrl }: FeedbackAvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        loading="lazy"
        onError={() => setImgError(true)}
        className="h-10 w-10 shrink-0 rounded-full border border-[var(--border-subtle)] object-cover shadow-2xs"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-slate-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 shadow-2xs"
    >
      <User className="h-5 w-5" strokeWidth={1.8} />
    </span>
  );
}
