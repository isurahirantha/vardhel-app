import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { MediaLibraryClient } from "@/components/admin/media-library-client";

export default async function AdminMediaPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const media = await prisma.media
    .findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <MediaLibraryClient
      csrfToken={session.csrfToken}
      initialMedia={media.map((m) => ({
        id: m.id,
        type: m.type,
        publicUrl: m.publicUrl,
        mime: m.mime,
        size: m.size,
        altText: m.altText,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
