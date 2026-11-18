import "server-only";
import { prisma } from "@/lib/db";
import { DEFAULT_UI_STRINGS } from "@/lib/default-ui-strings";

const cache = new Map<string, { data: Record<string, Record<string, string>>; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

export function invalidateUiStringsCache(): void {
  cache.clear();
}

/**
 * Returns a nested object of UI strings for `next-intl` (e.g. `{ nav: { home: "Home" } }`).
 * Implements Section 4A.5 fallback rule: if Sinhala is empty, falls back to English.
 */
export async function getUiStringsDictionary(
  locale: "en" | "si"
): Promise<Record<string, Record<string, string>>> {
  const now = Date.now();
  const cached = cache.get(locale);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // Start with default EN/SI fallback dictionary
  const flatMap = new Map<string, string>();
  for (const item of DEFAULT_UI_STRINGS) {
    const val = locale === "si" && item.si.trim() ? item.si : item.en;
    flatMap.set(item.key, val);
  }

  try {
    const rows = await prisma.uiString.findMany({
      where: { locale: { in: ["en", locale] } },
    });

    const enMap = new Map<string, string>();
    const locMap = new Map<string, string>();

    for (const r of rows) {
      if (r.locale === "en" && r.value.trim()) {
        enMap.set(r.key, r.value);
      } else if (r.locale === locale && r.value.trim()) {
        locMap.set(r.key, r.value);
      }
    }

    for (const [k, v] of enMap.entries()) {
      flatMap.set(k, v);
    }
    for (const [k, v] of locMap.entries()) {
      flatMap.set(k, v);
    }
  } catch {
    // Fallback to seed defaults if DB is not migrated yet during build
  }

  // Convert dotted keys (`nav.home`) into nested messages object for next-intl
  const nested: Record<string, Record<string, string>> = {};
  for (const [fullKey, val] of flatMap.entries()) {
    const [ns = "common", ...rest] = fullKey.split(".");
    const subKey = rest.join(".") || fullKey;
    if (!nested[ns]) nested[ns] = {};
    nested[ns][subKey] = val;
  }

  cache.set(locale, { data: nested, expiresAt: now + CACHE_TTL_MS });
  return nested;
}
