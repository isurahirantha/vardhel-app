import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPublishedServiceCategories } from "@/server/services/public-content.service";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import { CheckCircle2, MessageCircle, ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = locale === "si" ? "si" : "en";

  const [categories, siteConfig, tCta] = await Promise.all([
    getPublishedServiceCategories(validLocale),
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
  ]);

  const allServices = categories.flatMap((c) => c.services);
  const service = allServices.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    `Hi Vardhel, I'd like to discuss ${service.title}.`
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{validLocale === "si" ? "සියලුම සේවාවන්" : "Back to Services"}</span>
      </Link>

      <div className="space-y-4">
        <span className="rounded-full bg-orange-600/20 px-3 py-1 text-xs font-semibold text-orange-400">
          {service.categoryName}
        </span>
        <h1 className="text-[length:var(--text-h1)] font-bold text-white">
          {service.title}
        </h1>
        <p className="text-lg text-indigo-300">{service.shortDescription}</p>
      </div>

      <div
        className="glass-card rounded-3xl p-8 text-base leading-relaxed text-slate-200 space-y-4"
        dangerouslySetInnerHTML={{ __html: service.longDescriptionHtml }}
      />

      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-xl font-bold text-white">
          {validLocale === "si" ? "ඇතුළත් විශේෂාංග" : "What Is Included"}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {service.features.map((f, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-slate-200">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-orange-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-orange-600/25 hover:bg-orange-500"
        >
          <MessageCircle className="h-5 w-5" />
          <span>
            {tCta("enquire_now")} ({service.title})
          </span>
        </a>
        <Link
          href="/contact"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          <span>{tCta("start_project")}</span>
        </Link>
      </div>
    </div>
  );
}
