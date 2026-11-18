import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getPublishedProducts } from "@/server/services/public-content.service";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const [products, tCta] = await Promise.all([
    getPublishedProducts(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
  ]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
          {validLocale === "si" ? "අපගේ නිෂ්පාදන" : "Flagship Products"}
        </span>
        <h1 className="mt-2 text-[length:var(--text-h1)] font-bold text-white">
          {validLocale === "si"
            ? "Vardhel මෘදුකාංග නිෂ්පාදන"
            : "Software Platforms Engineered by Vardhel"}
        </h1>
        <p className="mt-4 text-base text-slate-300">
          {validLocale === "si"
            ? "උත්සව කළමනාකරණය, ඡායාරූපකරණ ව්‍යාපාර පාලනය සහ AI උත්සව ප්‍රවර්ධනය සඳහා අප නිර්මාණය කළ පද්ධති."
            : "Explore our vertical SaaS platforms built for event organizers, photography studios, and entertainment promoters."}
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="glass-card glass-card-hover flex flex-col justify-between rounded-3xl p-6"
          >
            <div>
              <Link href={`/products/${prod.slug}`} className="block">
                <div className="relative h-52 overflow-hidden rounded-2xl bg-black/40 p-3">
                  <Image
                    src={prod.coverUrl}
                    alt={prod.name}
                    width={460}
                    height={280}
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white hover:text-orange-400">
                    {prod.name}
                  </h2>
                  <span className="rounded-full bg-orange-600/20 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
                    {prod.status}
                  </span>
                </div>
              </Link>
              <p className="mt-1 text-xs font-semibold text-indigo-400">
                {prod.tagline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {prod.shortDescription}
              </p>

              {prod.techStack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {prod.techStack.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <Link
                href={`/products/${prod.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:underline"
              >
                <span>{tCta("read_more")}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>

              {prod.links[0] && (
                <a
                  href={prod.links[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30"
                >
                  <span>{prod.links[0].label}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
