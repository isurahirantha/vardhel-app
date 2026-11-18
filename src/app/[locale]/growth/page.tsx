import { getTranslations } from "next-intl/server";
import { getPublishedProcessSteps } from "@/server/services/public-content.service";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/utils";
import {
  TrendingUp,
  CheckCircle2,
  MessageCircle,
  ArrowUpRight,
  Video,
  Share2,
  BookOpen,
} from "lucide-react";

export const revalidate = 60;

export default async function GrowthPartnershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";
  const [steps, siteConfig, tCta] = await Promise.all([
    getPublishedProcessSteps("growth_journey", validLocale),
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
  ]);

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    "Hi Vardhel, I'd like to discuss the Software + Social Media Growth Partnership for my business."
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>
            {validLocale === "si"
              ? "පූර්ණ ව්‍යාපාර වර්ධන හවුල්කාරිත්වය"
              : "End-to-End Growth Partnership"}
          </span>
        </span>
        <h1 className="mt-4 text-[length:var(--text-h1)] font-bold text-white">
          {validLocale === "si"
            ? "මෘදුකාංග නිර්මාණයේ සිට සමාජ මාධ්‍ය හරහා ව්‍යාපාරය වර්ධනය කිරීම දක්වා"
            : "We Build Your Software — Then We Grow Your Business"}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          {validLocale === "si"
            ? "බොහෝ ආයතන වෙබ් අඩවියක් හෝ මෘදුකාංගයක් සාදා දී ඉවත් වෙයි. Vardhel ඔබේ ව්‍යාපාරය අධ්‍යයනය කර, මෘදුකාංගය නිර්මාණය කර, Facebook, TikTok, Instagram සහ TripAdvisor ගිණුම් පිහිටුවා වීඩියෝ සහ පෝස්ට් මඟින් සැබෑ පාරිභෝගිකයින් දිනාගැනීම දක්වා ඔබ සමඟම සිටියි."
            : "Most agencies hand over a website and leave you wondering how to get customers. Vardhel studies your business, builds the software, and then sets up and runs your social media presence—transferring the playbook so you keep growing."}
        </p>
      </div>

      {/* 3 Pillars of the Growth Model */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card rounded-3xl p-8 space-y-3">
          <Share2 className="h-8 w-8 text-orange-400" />
          <h2 className="text-xl font-bold text-white">
            {validLocale === "si"
              ? "1. තාක්ෂණය සහ මෘදුකාංග පද්ධතිය"
              : "1. Right Tech & Custom Software"}
          </h2>
          <p className="text-sm text-slate-300">
            {validLocale === "si"
              ? "ඔබේ ව්‍යාපාරයේ අවශ්‍යතා හඳුනාගෙන වේගවත් වෙබ් අඩවියක්, වෙන්කිරීමේ පද්ධතියක් (Booking System) හෝ ජංගම යෙදුමක් නිර්මාණය කිරීම."
              : "We gather requirements, recommend the right modern tech stack, and engineer your booking platform, web app, or management system."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-3">
          <Video className="h-8 w-8 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">
            {validLocale === "si"
              ? "2. සමාජ මාධ්‍ය සහ වීඩියෝ නිර්මාණය"
              : "2. Social Media & Video Production"}
          </h2>
          <p className="text-sm text-slate-300">
            {validLocale === "si"
              ? "Facebook, Instagram, TikTok සහ TripAdvisor ගිණුම් ආරම්භ කර ආකර්ෂණීය වීඩියෝ (Reels/TikTok) සහ පෝස්ට් නිර්මාණය කර පළ කිරීම."
              : "We create and optimize your Facebook, Instagram, TikTok, and TripAdvisor profiles—producing and publishing engaging posts and short videos."}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-3">
          <BookOpen className="h-8 w-8 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            {validLocale === "si"
              ? "3. දැනුම හුවමාරුව සහ අඛණ්ඩ සැලැස්ම"
              : "3. Knowledge Transfer & Continuous Plan"}
          </h2>
          <p className="text-sm text-slate-300">
            {validLocale === "si"
              ? "ඔබට සහ ඔබේ කණ්ඩායමට අඛණ්ඩව පාරිභෝගිකයින් සමඟ සම්බන්ධ වෙමින් ව්‍යාපාරය වර්ධනය කරගැනීමට අවශ්‍ය දැනුම සහ සැලැස්ම ලබාදීම."
              : "We give you the practical knowledge and a repeatable engagement roadmap so your business keeps compounding after launch."}
          </p>
        </div>
      </div>

      {/* Reference Story Spotlight (Section 1) */}
      <div className="rounded-3xl border border-orange-500/30 bg-[#0d1326] p-8 sm:p-12 space-y-6">
        <span className="rounded-full bg-orange-600/20 px-3 py-1 text-xs font-bold text-orange-400">
          {validLocale === "si" ? "ආදර්ශ ව්‍යාපෘති කතාව" : "Flagship Partnership Example"}
        </span>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {validLocale === "si"
            ? "සංචාරක මාර්ගෝපදේශක ව්‍යාපාරයක් (Tourism Guide Start-Up) බිංදුවේ සිට ගොඩනැගූ ආකාරය"
            : "How We Take a Tourism Guide Start-Up from Zero to Bookings"}
        </h2>
        <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
          {validLocale === "si"
            ? "සංචාරක මාර්ගෝපදේශක නව ව්‍යාපාරයක් සඳහා අපි පළමුව සංචාරක පැකේජ වෙන්කිරීමේ වෙබ් අඩවිය (Tour Booking System) නිර්මාණය කළෙමු. ඉන්පසු ඔවුන්ගේ Facebook පිටුව, TikTok, TripAdvisor සහ Instagram ගිණුම් ආරම්භ කර, ආකර්ෂණීය වීඩියෝ සහ පෝස්ට් නිර්මාණය කර පළ කළෙමු. අවසානයේ ඔවුන්ටම අඛණ්ඩව සංචාරකයින් සමඟ සම්බන්ධ වෙමින් ව්‍යාපාරය ඉදිරියට ගෙන යාමට අවශ්‍ය දැනුම සහ සැලැස්ම ලබා දුන්නෙමු."
            : "A tourism guide start-up came to us with a vision. We built their custom tour booking website and system, then created and set up their Facebook page, TikTok, TripAdvisor, and Instagram—producing and publishing posts and short videos, and equipping them with the knowledge and a continuous plan so they can keep engaging travellers and growing the business."}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-2">
          {[
            "Tour Booking Website",
            "Facebook & Instagram",
            "TikTok Short Videos",
            "TripAdvisor Setup",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-white"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Step Timeline */}
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold text-white">
          {validLocale === "si"
            ? "අපගේ පියවර 7ක හවුල්කාරිත්ව ක්‍රියාවලිය"
            : "The 7-Stage Partnership Flow"}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((st) => (
            <div key={st.id} className="glass-card rounded-2xl p-6 space-y-2">
              <h3 className="text-base font-bold text-orange-400">{st.title}</h3>
              <ul className="space-y-1 text-xs text-slate-300">
                {st.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-orange-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-orange-600/25 hover:bg-orange-500"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{tCta("chat_whatsapp")}</span>
        </a>
        <Link
          href="/contact"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          <span>{tCta("start_project")}</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
