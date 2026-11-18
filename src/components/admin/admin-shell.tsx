"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogoutAction } from "@/server/actions/auth.actions";
import {
  LayoutDashboard,
  Settings,
  Layers,
  Package,
  Briefcase,
  FolderKanban,
  MessageSquareQuote,
  Inbox,
  HelpCircle,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Languages,
  Shield,
  ScrollText,
  Download,
  LogOut,
  Menu,
  X,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

interface AdminShellProps {
  email: string;
  mustChangePassword: boolean;
  totpEnabled: boolean;
  csrfToken: string;
  children: React.ReactNode;
}

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries (Leads)", icon: Inbox },
  { href: "/admin/feedback", label: "Customer Feedback", icon: MessageSquareQuote },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/projects", label: "Live Work / Projects", icon: FolderKanban },
  { href: "/admin/home", label: "Home & Navigation", icon: Layers },
  { href: "/admin/company", label: "FAQ, Offers, Team & Values", icon: Sparkles },
  { href: "/admin/pages", label: "Pages & Legal", icon: FileText },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/ui-text", label: "UI Text & Labels (EN/SI)", icon: HelpCircle },
  { href: "/admin/translations", label: "Translation Center", icon: Languages },
  { href: "/admin/settings", label: "Site Settings & Contact", icon: Settings },
  { href: "/admin/security", label: "Security & 2FA", icon: Shield },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/backup", label: "Backup & Export", icon: Download },
];

export function AdminShell({
  email,
  mustChangePassword,
  totpEnabled,
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Render login page without shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await adminLogoutAction();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin-workspace flex min-h-dvh bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden w-68 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <span className="text-sm font-bold tracking-wide text-slate-900">
              CODE <span className="text-orange-600">LOOM</span>
            </span>
            <span className="ml-2 rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
              ADMIN
            </span>
          </div>
          <Link
            href="/en"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-orange-600"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Admin sidebar">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? "keep-white bg-orange-600 text-white shadow-xs"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "keep-white text-white" : "text-slate-500"}`} />
                <span className={active ? "keep-white text-white" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="truncate text-xs font-semibold text-slate-800">{email}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
            <span>Master Admin</span>
            <span>&bull;</span>
            <span className={totpEnabled ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
              {totpEnabled ? "2FA Active" : "2FA Off"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 bg-slate-50">
        {/* Mobile Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-800"
              aria-label="Toggle admin menu"
            >
              {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm font-bold text-slate-900">Vardhel Admin</span>
          </div>
          <Link
            href="/en"
            target="_blank"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            <span>Site</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </header>

        {/* Mobile Drawer */}
        {drawerOpen && (
          <div className="border-b border-slate-200 bg-white p-4 lg:hidden">
            <nav className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                      active
                        ? "keep-white bg-orange-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "keep-white text-white" : "text-slate-500"}`} />
                    <span className={active ? "keep-white text-white" : ""}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out ({email})</span>
            </button>
          </div>
        )}

        {/* Forced Password Change Banner (Section 7.2) */}
        {mustChangePassword && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-50 px-6 py-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>Security Requirement:</strong> You are using the initial seeded password. Please change your Master Admin password now.
              </span>
            </div>
            <Link
              href="/admin/security"
              className="rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-slate-950 hover:bg-amber-400"
            >
              Change Password Now
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
