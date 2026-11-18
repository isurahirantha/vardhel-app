import { getAboutCompanyData } from "@/server/services/public-content.service";
import { CheckCircle2 } from "lucide-react";

export const revalidate = 60;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const data = await getAboutCompanyData(validLocale);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 space-y-20">
      {/* Story & Specialist Roles */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            Vardhel &bull; Sri Lanka
          </span>
          <h1 className="text-[length:var(--text-h1)] font-bold text-white">
            {data.about.title}
          </h1>
          <div
            className="space-y-4 text-base leading-relaxed text-slate-300"
            dangerouslySetInnerHTML={{ __html: data.about.bodyHtml }}
          />
        </div>

        <div className="lg:col-span-5 glass-card rounded-3xl p-8 space-y-4">
          <h2 className="text-lg font-bold text-white">
            {validLocale === "si"
              ? "අපගේ විශේෂඥ අංශ"
              : "Our Engineering & Growth Disciplines"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.team.map((role) => (
              <div
                key={role.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-slate-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500" />
                <span>{role.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="glass-card rounded-3xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-orange-400">
            {data.vision.title}
          </h2>
          <div
            className="text-base leading-relaxed text-slate-200"
            dangerouslySetInnerHTML={{ __html: data.vision.bodyHtml }}
          />
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-4">
          <h2 className="text-2xl font-bold text-indigo-400">
            {data.mission.title}
          </h2>
          <div
            className="text-base leading-relaxed text-slate-200"
            dangerouslySetInnerHTML={{ __html: data.mission.bodyHtml }}
          />
        </div>
      </section>

      {/* 5 Core Values */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-[length:var(--text-h2)] font-bold text-white">
            {validLocale === "si" ? "අපගේ මූලික වටිනාකම්" : "Our Core Values"}
          </h2>
          <p className="mt-2 text-sm italic text-slate-400">
            {validLocale === "si"
              ? "අප ලියන සෑම කේත පේළියකටම මඟපෙන්වන ප්‍රතිපත්ති"
              : "The principles that guide every line of code we write"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.values.map((val) => (
            <div
              key={val.id}
              className="glass-card glass-card-hover rounded-3xl p-6 space-y-3"
            >
              <span className="font-mono text-3xl font-light text-orange-500/40">
                {val.codeNumber}
              </span>
              <h3 className="text-xl font-bold text-indigo-400">{val.title}</h3>
              {val.motto && (
                <p className="text-xs italic text-slate-300">{val.motto}</p>
              )}
              <ul className="space-y-2 pt-2 text-xs text-slate-300">
                {val.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-500">&bull;</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
