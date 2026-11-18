import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getUiStringsDictionary } from "@/server/services/ui-strings.service";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "si")) {
    locale = routing.defaultLocale;
  }

  const messages = await getUiStringsDictionary(locale as "en" | "si");

  return {
    locale,
    messages,
  };
});
