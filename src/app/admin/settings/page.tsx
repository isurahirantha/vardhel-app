import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getGlobalSiteConfig } from "@/server/services/settings.service";
import { SettingsClient } from "@/components/admin/settings-client";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [enConfig, siConfig] = await Promise.all([
    getGlobalSiteConfig("en"),
    getGlobalSiteConfig("si"),
  ]);

  return (
    <SettingsClient
      csrfToken={session.csrfToken}
      initial={{
        brandName: enConfig.brandName,
        taglineEn: enConfig.tagline,
        taglineSi: siConfig.tagline,
        primaryColor: enConfig.primaryColor,
        secondaryColor: enConfig.secondaryColor,
        contactEmail: enConfig.contactEmail,
        notifyEmail: enConfig.notifyEmail,
        whatsappNumber: enConfig.whatsappNumber,
        whatsappMsgEn: enConfig.whatsappDefaultMessage,
        whatsappMsgSi: siConfig.whatsappDefaultMessage,
        phone: enConfig.phone,
        addressEn: enConfig.address,
        addressSi: siConfig.address,
        workingHoursEn: enConfig.workingHours,
        workingHoursSi: siConfig.workingHours,
        enableFloatingWhatsapp: enConfig.enableFloatingWhatsapp,
        enable3dHero: enConfig.enable3dHero,
        enableCustomCursor: enConfig.enableCustomCursor,
        enableFeedback: enConfig.enableFeedback,
        socialLinks: enConfig.socialLinks.map((s, idx) => ({
          platform: s.platform,
          labelEn: s.label,
          labelSi: siConfig.socialLinks[idx]?.label ?? s.label,
          url: s.url,
        })),
      }}
    />
  );
}
