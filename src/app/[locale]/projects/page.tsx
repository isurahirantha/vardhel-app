import { getPublishedProjects } from "@/server/services/public-content.service";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import { ArrowUpRight, ExternalLink, Share2, MessageCircle } from "lucide-react";

export const revalidate = 60;

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const [projects, siteConfig] = await Promise.all([
    getPublishedProjects(validLocale),
    getGlobalSiteConfig(validLocale),
  ]);

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    siteConfig.whatsappDefaultMessage
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 space-y-14">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
          {validLocale === "si" ? "සජීවී ව්‍යාපෘති" : "Live Work & Portfolio"}
        </span>
        <h1 className="mt-2 text-[length:var(--text-h1)] font-bold text-white">
          {validLocale === "si"
            ? "අප විසින් ගොඩනඟන ලද මෘදුකාංග සහ සමාජ මාධ්‍ය වර්ධන ව්‍යාපෘති"
            : "Live Systems & Social Media Growth Case Studies"}
        </h1>
        <p className="mt-4 text-base text-slate-300">
          {validLocale === "si"
            ? "සැබෑ ව්‍යාපාර සඳහා අප නිර්මාණය කළ වෙබ් අඩවි, මෘදුකාංග සහ සමාජ මාධ්‍ය ජාල."
            : "Explore how we engineer custom software and establish high-performing social media channels for our clients."}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card mx-auto max-w-3xl rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">
            {validLocale === "si"
              ? "අපගේ පූර්ණ වර්ධන ආදර්ශ කතාව (Tourism Guide Start-Up)"
              : "Featured Growth Partnership Story: Tourism Guide Start-Up"}
          </h2>
          <p className="text-sm leading-relaxed text-slate-300">
            {validLocale === "si"
              ? "සංචාරක මාර්ගෝපදේශක ව්‍යාපාරයක් සඳහා සංචාරක වෙන්කිරීමේ වෙබ් අඩවිය නිර්මාණය කර, Facebook, TikTok, TripAdvisor සහ Instagram ගිණුම් පිහිටුවා වීඩියෝ සහ පෝස්ට් මඟින් ව්‍යාපාරය වර්ධනය කිරීමේ සම්පූර්ණ සැලැස්ම අපි ලබා දුන්නෙමු."
              : "For a tourism guide start-up, we built their custom tour booking website/system, then created and set up their Facebook page, TikTok, TripAdvisor, and Instagram—producing and publishing posts and short videos while transferring the knowledge and continuous roadmap so they keep growing."}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/growth"
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white"
            >
              <span>
                {validLocale === "si"
                  ? "වර්ධන හවුල්කාරිත්වය කියවන්න"
                  : "Read Full Partnership Model"}
              </span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-6 py-2.5 text-xs font-semibold text-emerald-300"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="glass-card glass-card-hover flex flex-col justify-between rounded-3xl p-8 space-y-5"
            >
              <div className="space-y-3">
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                  {proj.industry}
                </span>
                <h2 className="text-2xl font-bold text-white">{proj.title}</h2>
                <p className="text-sm leading-relaxed text-slate-300">
                  {proj.summary}
                </p>

                {proj.socialWork.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Share2 className="h-4 w-4" />
                      <span>Social Media Growth Delivered:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {proj.socialWork.map((sw) => (
                        <span
                          key={sw.id}
                          className="rounded-full bg-black/40 px-2.5 py-1 text-xs text-slate-200"
                        >
                          <strong className="capitalize">{sw.platform}:</strong>{" "}
                          {sw.summary}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                <Link
                  href={`/projects/${proj.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-5 py-2 text-xs font-semibold text-white hover:bg-orange-500"
                >
                  <span>Case Study</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                {proj.links.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200 hover:bg-white/10"
                  >
                    <span>{l.label}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
