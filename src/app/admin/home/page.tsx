import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { HomeBuilderClient } from "@/components/admin/home-builder-client";

const ALIGNED_HOME_SECTIONS = [
  {
    key: "hero",
    sortOrder: 1,
    enTitle: "Intelligence-Led Business Growth.",
    enSubtitle: "Hero + Interactive Growth Engine Staircase",
    siTitle: "බුද්ධිමය ව්‍යාපාර වර්ධනය.",
    siSubtitle: "මුල් කොටස සහ වර්ධන පද්ධතිය",
  },
  {
    key: "proof_ticker",
    sortOrder: 2,
    enTitle: "Industries We Power",
    enSubtitle: "Unified Proof Stats & Industries Ticker",
    siTitle: "ඉලක්කගත ක්ෂේත්‍ර",
    siSubtitle: "සංඛ්‍යාත්මක දත්ත සහ ක්ෂේත්‍ර",
  },
  {
    key: "how_it_works",
    sortOrder: 3,
    enTitle: "We start by understanding your business — not by asking what to post.",
    enSubtitle: "How VARDHEL Works · Capabilities & Advantage",
    siTitle: "අපි ආරම්භ කරන්නේ ඔබේ ව්‍යාපාරය තේරුම් ගැනීමෙනි",
    siSubtitle: "VARDHEL ක්‍රියා කරන ආකාරය · හැකියාවන් සහ විශේෂත්වය",
  },
  {
    key: "platforms",
    sortOrder: 4,
    enTitle: "Platforms Engineered by Vardhel",
    enSubtitle: "Flagship Platforms + Live Work Reel",
    siTitle: "Vardhel විසින් නිර්මාණය කළ මෘදුකාංග පද්ධති",
    siSubtitle: "ප්‍රධාන මෘදුකාංග පද්ධති සහ සජීවී දර්ශනය",
  },
  {
    key: "feedback",
    sortOrder: 5,
    enTitle: "Customer Experiences",
    enSubtitle: "Verified Partner Reviews Carousel",
    siTitle: "පාරිභෝගික අදහස්",
    siSubtitle: "සත්‍යාපිත පාරිභෝගික අත්දැකීම්",
  },
  {
    key: "faq",
    sortOrder: 6,
    enTitle: "Frequently Asked Questions",
    enSubtitle: "Expandable FAQ Accordion",
    siTitle: "නිතර අසන ප්‍රශ්න (FAQ)",
    siSubtitle: "නිතර අසන ප්‍රශ්න",
  },
  {
    key: "final_cta",
    sortOrder: 7,
    enTitle: "Your Next Stage of Growth Starts Here.",
    enSubtitle: "Final Obsidian Call to Action",
    siTitle: "ඔබේ වර්ධනයේ ඊළඟ අදියර මෙතැනින් අරඹන්න.",
    siSubtitle: "අවසාන ආරාධනා කොටස",
  },
];

export default async function AdminHomeBuilderPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Ensure the 7 aligned homepage section keys exist without overwriting custom edits
  try {
    const existing = await prisma.homeSection.findMany({ select: { key: true } });
    const existingKeys = new Set(existing.map((e) => e.key));

    for (const def of ALIGNED_HOME_SECTIONS) {
      if (!existingKeys.has(def.key)) {
        await prisma.homeSection.create({
          data: {
            key: def.key,
            sortOrder: def.sortOrder,
            isVisible: true,
            translations: {
              create: [
                { locale: "en", title: def.enTitle, subtitle: def.enSubtitle },
                { locale: "si", title: def.siTitle, subtitle: def.siSubtitle },
              ],
            },
          },
        });
      }
    }
  } catch {
    // Fallback gracefully if DB is temporarily unavailable
  }

  const alignedKeys = ALIGNED_HOME_SECTIONS.map((s) => s.key);
  const sections = await prisma.homeSection
    .findMany({
      where: { key: { in: alignedKeys } },
      include: { translations: true },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => []);

  return (
    <HomeBuilderClient
      csrfToken={session.csrfToken}
      initialSections={sections.map((s) => {
        const en = s.translations.find((t) => t.locale === "en");
        const si = s.translations.find((t) => t.locale === "si");
        return {
          id: s.id,
          key: s.key,
          sortOrder: s.sortOrder,
          isVisible: s.isVisible,
          enTitle: en?.title ?? s.key,
          enSubtitle: en?.subtitle ?? "",
          siTitle: si?.title ?? "",
          siSubtitle: si?.subtitle ?? "",
        };
      })}
    />
  );
}
