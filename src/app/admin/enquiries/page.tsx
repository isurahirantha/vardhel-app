import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { EnquiriesAdminClient } from "@/components/admin/enquiries-admin-client";

export default async function AdminEnquiriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const enquiries = await prisma.enquiry
    .findMany({
      where: { deletedAt: null },
      include: { notes: { orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <EnquiriesAdminClient
      csrfToken={session.csrfToken}
      initialEnquiries={enquiries.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        phone: e.phone,
        businessName: e.businessName,
        interest: e.interest,
        budgetRange: e.budgetRange,
        message: e.message,
        status: e.status,
        locale: e.locale,
        createdAt: e.createdAt.toISOString(),
        notes: e.notes.map((n) => ({
          id: n.id,
          note: n.note,
          createdAt: n.createdAt.toISOString(),
        })),
      }))}
    />
  );
}
