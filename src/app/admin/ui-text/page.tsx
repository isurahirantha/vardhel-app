import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { DEFAULT_UI_STRINGS } from "@/lib/default-ui-strings";
import { UiTextClient, type UiStringRow } from "@/components/admin/ui-text-client";

export default async function AdminUiTextPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const dbStrings = await prisma.uiString.findMany().catch(() => []);
  const byKey = new Map<string, { en?: string; si?: string; needsReview?: boolean }>();

  for (const s of dbStrings) {
    const entry = byKey.get(s.key) ?? {};
    if (s.locale === "en") entry.en = s.value;
    if (s.locale === "si") {
      entry.si = s.value;
      entry.needsReview = s.needsReview;
    }
    byKey.set(s.key, entry);
  }

  const rows: UiStringRow[] = DEFAULT_UI_STRINGS.map((d) => {
    const db = byKey.get(d.key);
    return {
      key: d.key,
      group: d.group,
      description: d.description,
      en: db?.en ?? d.en,
      si: db?.si ?? d.si,
      needsReview: db?.needsReview ?? true,
    };
  });

  return <UiTextClient csrfToken={session.csrfToken} initialRows={rows} />;
}
