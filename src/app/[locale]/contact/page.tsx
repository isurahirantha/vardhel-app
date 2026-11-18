import { getTranslations } from "next-intl/server";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { EnquiryForm } from "@/components/sections/enquiry-form";
import { buildWhatsAppUrl } from "@/lib/utils";
import { MessageCircle, Mail, Phone, Clock, MapPin } from "lucide-react";

export const revalidate = 60;

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

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 space-y-14">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
          {validLocale === "si" ? "අප හා සම්බන්ධ වන්න" : "Let's Connect"}
        </span>
        <h1 className="mt-2 text-[length:var(--text-h1)] font-bold text-white">
          {validLocale === "si"
            ? "ඔබේ මෘදුකාංග සහ ව්‍යාපාර වර්ධන සැලැස්ම අදම අරඹන්න"
            : "Start Your Project or Growth Partnership"}
        </h1>
        <p className="mt-3 text-base text-slate-300">
          {validLocale === "si"
            ? "වේගවත්ම ප්‍රතිචාරය සඳහා WhatsApp හරහා අපට පණිවිඩයක් එවන්න, නැතහොත් පහත පෝරමය පුරවන්න."
            : "Reach us instantly on WhatsApp, send an email, or submit your project brief below."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        {/* Direct Connection Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-3xl border border-emerald-500/30 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  WhatsApp (Fastest Response)
                </h2>
                <p className="text-xs text-slate-400">{siteConfig.phone}</p>
              </div>
            </div>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{tCta("chat_whatsapp")}</span>
            </a>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Email</h2>
                <p className="text-xs text-slate-400">
                  {siteConfig.contactEmail}
                </p>
              </div>
            </div>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-5 py-3 text-xs font-semibold text-indigo-200 hover:bg-indigo-500/25"
            >
              <Mail className="h-4 w-4" />
              <span>{siteConfig.contactEmail}</span>
            </a>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-orange-400" />
              <span>{siteConfig.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-orange-400" />
              <span>{siteConfig.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-orange-400" />
              <span>{siteConfig.workingHours}</span>
            </div>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="lg:col-span-7">
          <EnquiryForm
            locale={validLocale}
            sourcePage={`/${validLocale}/contact`}
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
  );
}
