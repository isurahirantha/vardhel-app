import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "si"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type SupportedLocale = (typeof routing.locales)[number];
