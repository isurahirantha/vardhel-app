"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = (nextLocale: "en" | "si") => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5 text-xs font-medium shadow-xs"
      role="group"
      aria-label="Language switcher"
    >
      <Globe className="ml-2 mr-1 h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
      <button
        type="button"
        disabled={isPending}
        onClick={() => toggleLocale("en")}
        className={`min-h-[32px] min-w-[36px] rounded-full px-2.5 py-1 transition-all ${
          locale === "en"
            ? "keep-white bg-orange-600 font-semibold text-white shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => toggleLocale("si")}
        className={`min-h-[32px] min-w-[40px] rounded-full px-2.5 py-1 transition-all ${
          locale === "si"
            ? "keep-white bg-orange-600 font-semibold text-white shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`}
        aria-pressed={locale === "si"}
      >
        සිං
      </button>
    </div>
  );
}
