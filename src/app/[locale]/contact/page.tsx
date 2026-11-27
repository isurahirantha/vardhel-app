import { getTranslations } from "next-intl/server";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { EnquiryForm } from "@/components/sections/enquiry-form";
import { buildWhatsAppUrl } from "@/lib/utils";
import { MessageCircle, Mail, Phone, Clock, MapPin, ArrowUpRight } from "lucide-react";

export const revalidate = 60;

/**
 * Normalizes Sri Lankan/international phone numbers for clean visual display.
 */
function formatPhoneDisplay(raw: string): string {
  const trimmed = raw.trim();
  if (/^\+94\d{9}$/.test(trimmed)) {
    return `+94 ${trimmed.slice(3, 5)} ${trimmed.slice(5, 8)} ${trimmed.slice(8)}`;
  }
  return trimmed;
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "si" ? "si" : "en";

  const [siteConfig, tForm, tCta] = await Promise.all([
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "form" }),
    getTranslations({ locale: validLocale, namespace: "cta" }),
  ]);

  const waHref = buildWhatsAppUrl(
    siteConfig.whatsappNumber,
    siteConfig.whatsappDefaultMessage
  );
  const formattedPhone = formatPhoneDisplay(siteConfig.phone);

  return (
    <section className="relative overflow-hidden bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)]">
      {/* Subtle Ambient Emerald Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1360px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9 space-y-5">
        {/* Compact Centered Header aligned with Vardhel Emerald Theme */}
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {validLocale === "si" ? "සම්බන්ධ වන්න" : "Let's Connect"}
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {validLocale === "si" ? "අප හා සම්බන්ධ වන්න" : "Contact Us"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            {validLocale === "si"
              ? "ඕනෑම ගැටළුවක් හෝ ව්‍යාපෘති අදහසක් තිබේද? අපට පණිවිඩයක් එවන්න!"
              : "Any question or project idea? Just write us a message!"}
          </p>
        </div>

        {/* Unified Split-Card Architectural Container */}
        <div className="mx-auto max-w-[1120px] rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 sm:p-3 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:items-stretch">
            {/* Left ~40%: Deep Obsidian Contact Information Panel */}
            <div className="keep-white relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e192c] via-[#111827] to-[#09090b] p-6 sm:p-8 text-[#ffffff] lg:col-span-5 flex flex-col justify-between gap-8">
              {/* Decorative Subtle Ambient Circles (Bottom-Right) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-emerald-500/15"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-12 right-12 h-24 w-24 rounded-full bg-white/[0.06]"
              />

              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight !text-[#ffffff]">
                  {validLocale === "si" ? "සම්බන්ධතා තොරතුරු" : "Contact Information"}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#cbd5e1]">
                  {validLocale === "si"
                    ? "සජීවී කතාබහක් ආරම්භ කිරීමට පණිවිඩයක් එවන්න!"
                    : "Say something to start a live chat!"}
                </p>
              </div>

              {/* Clean Contact Rows */}
              <div className="relative z-10 space-y-4 text-xs sm:text-sm text-[#e2e8f0]">
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-center gap-3.5 text-[#f1f5f9] hover:text-[#6ee7b7] transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#34d399]" />
                  <span>{formattedPhone}</span>
                </a>

                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="flex items-center gap-3.5 text-[#f1f5f9] hover:text-[#6ee7b7] transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#34d399]" />
                  <span className="truncate">{siteConfig.contactEmail}</span>
                </a>

                <div className="flex items-start gap-3.5 text-[#e2e8f0]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399]" />
                  <span>{siteConfig.address}</span>
                </div>

                <div className="flex items-start gap-3.5 text-xs text-[#cbd5e1]">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399]" />
                  <span>{siteConfig.workingHours}</span>
                </div>
              </div>

              {/* Bottom WhatsApp Quick Action */}
              <div className="relative z-10 pt-2">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-[#6ee7b7] hover:bg-emerald-500/25 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{tCta("chat_whatsapp")}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Right ~60%: Minimalist Underline Enquiry Form */}
            <div className="lg:col-span-7 p-5 sm:p-7 lg:p-8 flex flex-col justify-center">
              <EnquiryForm
                locale={validLocale}
                sourcePage={`/${validLocale}/contact`}
                whatsappHref={waHref}
                labels={{
                  name: tForm("name"),
                  email: tForm("email"),
                  phone: tForm("phone"),
                  businessName: tForm("business_name"),
                  interest: tForm("interest"),
                  budget: tForm("budget"),
                  message: tForm("message"),
                  consent: tForm("consent_enquiry"),
                  submit: tForm("submit_enquiry"),
                  success: tForm("enquiry_success"),
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
