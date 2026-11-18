import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { FeedbackAdminClient } from "@/components/admin/feedback-admin-client";

export default async function AdminFeedbackPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const feedback = await prisma.feedback
    .findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <FeedbackAdminClient
      csrfToken={session.csrfToken}
      initialFeedback={feedback.map((f) => ({
        id: f.id,
        status: f.status,
        name: f.name,
        company: f.company,
        role: f.role,
        email: f.email,
        rating: f.rating,
        message: f.message,
        messageSi: f.messageSi,
        source: f.source,
        locale: f.locale,
        isFeatured: f.isFeatured,
        createdAt: f.createdAt.toISOString(),
      }))}
    />
  );
}
