import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { SmoothScrollProgress } from "@/components/animations/smooth-scroll-progress";

export const dynamic = "force-dynamic";

export default async function LocalePublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "si")) {
    notFound();
  }

  const validLocale = locale as "en" | "si";
  const [messages, siteConfig, tCta, tFooter] = await Promise.all([
    getMessages(),
    getGlobalSiteConfig(validLocale),
    getTranslations({ locale: validLocale, namespace: "cta" }),
    getTranslations({ locale: validLocale, namespace: "footer" }),
  ]);

  return (
    <NextIntlClientProvider locale={validLocale} messages={messages}>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root, html, html.dark, html.light { --brand-primary: ${siteConfig.primaryColor} !important; --brand-secondary: ${siteConfig.secondaryColor} !important; }`,
        }}
      />
      <div
        lang={validLocale}
        className="flex min-h-dvh flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]"
      >
        <SmoothScrollProgress />
        <PublicHeader
          brandName={siteConfig.brandName}
          logoUrl={siteConfig.logoDarkUrl}
          whatsappNumber={siteConfig.whatsappNumber}
          whatsappMessage={siteConfig.whatsappDefaultMessage}
          navItems={siteConfig.headerNav}
          labels={{
            chatWhatsapp: tCta("chat_whatsapp"),
            startProject: tCta("start_project"),
          }}
        />
        <main className="flex-1">{children}</main>
        <PublicFooter
          brandName={siteConfig.brandName}
          tagline={siteConfig.tagline}
          logoUrl={siteConfig.logoDarkUrl}
          email={siteConfig.contactEmail}
          phone={siteConfig.phone}
          address={siteConfig.address}
          rightsText={tFooter("rights")}
          companyLinks={siteConfig.footerCompanyNav}
          serviceLinks={siteConfig.footerServicesNav}
          legalLinks={siteConfig.footerLegalNav}
          socialLinks={siteConfig.socialLinks}
        />
        <FloatingWhatsApp
          phone={siteConfig.whatsappNumber}
          defaultMessage={siteConfig.whatsappDefaultMessage}
          label={tCta("chat_whatsapp")}
          enabled={siteConfig.enableFloatingWhatsapp}
        />
      </div>
    </NextIntlClientProvider>
  );
}
