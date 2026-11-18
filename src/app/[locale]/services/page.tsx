import { getTranslations } from "next-intl/server";
import { getPublishedServiceCategories } from "@/server/services/public-content.service";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import { CheckCircle2, ArrowUpRight, MessageCircle } from "lucide-react";

export const revalidate = 60;

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const [categories, siteConfig, tCta] = await Promise.all([
    getPublishedServiceCategories(validLocale),
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
  ]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
          {validLocale === "si" ? "අපගේ සේවාවන්" : "End-to-End Capabilities"}
        </span>
        <h1 className="mt-2 text-[length:var(--text-h1)] font-bold text-white">
          {validLocale === "si"
            ? "මෘදුකාංග ඉංජිනේරුකරණය සහ සමාජ මාධ්‍ය වර්ධන සේවා"
            : "Software Engineering & Digital Growth Services"}
        </h1>
        <p className="mt-4 text-base text-slate-300">
          {validLocale === "si"
            ? "වෙබ් සහ ජංගම යෙදුම් නිර්මාණයේ සිට Facebook, TikTok, Instagram සහ TripAdvisor හරහා ඔබේ ව්‍යාපාරය වර්ධනය කිරීම දක්වා සම්පූර්ණ විසඳුම්."
            : "From custom web and mobile software development to full social media setup, video production, and continuous business growth."}
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat.id} className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-orange-400">{cat.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{cat.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cat.services.map((svc) => {
              const waHref = buildWhatsAppUrl(
                siteConfig.whatsappNumber,
                `Hi Vardhel, I'd like to enquire about ${svc.title}.`
              );
              return (
                <div
                  key={svc.id}
                  className="glass-card glass-card-hover flex flex-col justify-between rounded-3xl p-6"
                >
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {svc.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {svc.shortDescription}
                    </p>
                    <ul className="mt-4 space-y-2 text-xs text-slate-400">
                      {svc.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4">
                    <Link
                      href={`/services/${svc.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:underline"
                    >
                      <span>{tCta("read_more")}</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
