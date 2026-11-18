import { getLegalPageBySlug } from "@/server/services/public-content.service";

export const revalidate = 60;

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const page = await getLegalPageBySlug(slug, validLocale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-[length:var(--text-h1)] font-bold text-white">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="mt-2 text-sm text-slate-400">{page.subtitle}</p>
        )}
      </div>

      <div
        className="glass-card rounded-3xl p-8 text-sm leading-relaxed text-slate-200 space-y-4"
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
    </div>
  );
}
