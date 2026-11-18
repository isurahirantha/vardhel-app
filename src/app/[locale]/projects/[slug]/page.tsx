import { notFound } from "next/navigation";
import { getPublishedProjects } from "@/server/services/public-content.service";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ExternalLink, Share2 } from "lucide-react";

export const revalidate = 60;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const projects = await getPublishedProjects(validLocale);
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{validLocale === "si" ? "සියලුම ව්‍යාපෘති" : "Back to Live Work"}</span>
      </Link>

      <div className="space-y-4">
        <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
          {project.industry}
        </span>
        <h1 className="text-[length:var(--text-h1)] font-bold text-white">
          {project.title}
        </h1>
        <p className="text-base text-slate-300">{project.summary}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {project.links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white"
            >
              <span>{l.label}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <h2 className="text-sm font-bold text-orange-400">The Challenge</h2>
          <div
            className="text-xs leading-relaxed text-slate-300"
            dangerouslySetInnerHTML={{ __html: project.challengeHtml }}
          />
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <h2 className="text-sm font-bold text-indigo-400">Our Solution</h2>
          <div
            className="text-xs leading-relaxed text-slate-300"
            dangerouslySetInnerHTML={{ __html: project.solutionHtml }}
          />
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <h2 className="text-sm font-bold text-emerald-400">The Outcome</h2>
          <div
            className="text-xs leading-relaxed text-slate-300"
            dangerouslySetInnerHTML={{ __html: project.resultHtml }}
          />
        </div>
      </div>

      {project.socialWork.length > 0 && (
        <div className="glass-card rounded-3xl border border-indigo-500/30 p-8 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Share2 className="h-5 w-5" />
            <h2 className="text-xl font-bold text-white">
              Social Media Growth Delivered
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {project.socialWork.map((sw) => (
              <div
                key={sw.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-sm font-bold capitalize text-orange-400">
                  {sw.platform}
                </p>
                <p className="mt-1 text-xs text-slate-300">{sw.summary}</p>
                {sw.profileUrl && (
                  <a
                    href={sw.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-300 hover:underline"
                  >
                    <span>Visit Channel</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
