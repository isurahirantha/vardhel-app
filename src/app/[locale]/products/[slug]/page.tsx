import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPublishedProductBySlug } from "@/server/services/public-content.service";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { VideoFacade } from "@/components/sections/video-facade";
import { buildWhatsAppUrl } from "@/lib/utils";
import { safeJsonLd } from "@/lib/security/sanitize";
import {
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Users,
  Cpu,
} from "lucide-react";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = locale === "si" ? "si" : "en";

  const [product, siteConfig, tCta, tCommon] = await Promise.all([
    getPublishedProductBySlug(slug, validLocale),
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
    getTranslations({ locale: validLocale, namespace: "common" }),
  ]);

  if (!product) {
    notFound();
  }

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    `Hi Vardhel, I'd like to enquire about ${product.name}.`
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.shortDescription,
    applicationCategory: "BusinessApplication",
    inLanguage: validLocale,
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />

      {/* Hero Section */}
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-orange-600/20 px-3 py-1 text-xs font-bold text-orange-400">
              {product.status}
            </span>
            <span className="text-xs font-semibold text-indigo-400">
              {product.tagline}
            </span>
          </div>

          <h1 className="text-[length:var(--text-h1)] font-bold text-white">
            {product.name}
          </h1>

          <div
            className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base"
            dangerouslySetInnerHTML={{ __html: product.longDescriptionHtml }}
          />

          {/* Live App Links & Product-Specific WhatsApp Enquiry CTA */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {product.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex min-h-[46px] items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold transition-all ${
                  link.isPrimary
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/25 hover:bg-orange-500"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <span>{link.label}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-6 py-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25"
            >
              <MessageCircle className="h-4 w-4" />
              <span>
                {tCta("enquire_now")} ({product.name})
              </span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="glass-card overflow-hidden rounded-3xl p-4 shadow-2xl">
            <Image
              src={product.coverUrl}
              alt={product.name}
              width={600}
              height={420}
              className="h-auto w-full rounded-2xl object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* ~2-Min Overview Video (if configured in Admin) */}
      {product.videoUrl && (
        <section className="mx-auto max-w-4xl">
          <VideoFacade
            videoType={product.videoType}
            videoUrl={product.videoUrl}
            posterUrl={product.coverUrl}
            title={`${product.name} Overview`}
            watchLabel={tCommon("watch_video")}
          />
        </section>
      )}

      {/* Target Audience & Tech Stack */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {product.targetAudience && (
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2.5 text-orange-400">
              <Users className="h-5 w-5" />
              <h2 className="text-lg font-bold text-white">
                {tCommon("who_is_it_for")}
              </h2>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {product.targetAudience}
            </p>
          </div>
        )}

        {product.techStack.length > 0 && (
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Cpu className="h-5 w-5" />
              <h2 className="text-lg font-bold text-white">
                {tCommon("tech_stack")}
              </h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Features Grid */}
      <section>
        <h2 className="text-center text-[length:var(--text-h2)] font-bold text-white">
          {tCommon("key_features")}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {product.features.map((feat) => (
            <div
              key={feat.id}
              className="glass-card glass-card-hover rounded-2xl p-6"
            >
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-orange-500" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {feat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
