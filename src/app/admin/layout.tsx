import { getAdminSession } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    // Middleware redirects unauthenticated /admin/* requests to /admin/login;
    // when rendering /admin/login itself, session is null and AdminShell renders children cleanly.
    return <>{children}</>;
  }

  return (
    <AdminShell
      email={session.email}
      mustChangePassword={session.mustChangePassword}
      totpEnabled={session.totpEnabled}
      csrfToken={session.csrfToken}
    >
      {children}
    </AdminShell>
  );
}
