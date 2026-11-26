import { Link } from "@/i18n/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  ArrowUpRight,
  ArrowUp,
  ShieldCheck,
} from "lucide-react";

export interface FooterSocialItem {
  id: string;
  platform: string;
  label: string;
  url: string;
}

interface PublicFooterProps {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
  rightsText: string;
  companyLinks: { id: string; href: string; label: string }[];
  serviceLinks: { id: string; href: string; label: string }[];
  legalLinks: { id: string; href: string; label: string }[];
  socialLinks?: FooterSocialItem[];
}

export function PublicFooter({
  brandName,
  tagline,
  email,
  phone,
  address,
  rightsText,
  companyLinks,
  serviceLinks,
  legalLinks,
  socialLinks = [],
}: PublicFooterProps) {
  const currentYear = new Date().getFullYear();

  const displayEmail =
    email && !email.toLowerCase().endsWith("@gmail.com") ? email : "hello@vardhel.com";
  const displayAddress =
    address && address !== "Sri Lanka · Global Delivery"
      ? address
      : "Colombo, Sri Lanka · Global Delivery";

  const findSocialUrl = (platform: string, fallback: string) => {
    const match = socialLinks?.find(
      (s) =>
        s.platform?.toLowerCase() === platform.toLowerCase() ||
        s.label?.toLowerCase() === platform.toLowerCase()
    );
    return match ? match.url : fallback;
  };

  const fbUrl = findSocialUrl("facebook", "https://facebook.com");
  const linkedinUrl = findSocialUrl("linkedin", "https://linkedin.com");
  const instaUrl = findSocialUrl("instagram", "https://instagram.com");
  const ytUrl = findSocialUrl("youtube", "https://youtube.com");
  const waUrl = findSocialUrl("whatsapp", "https://wa.me/94767996381");

  return (
    <footer className="relative border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)]">
      {/* Subtle Top Emerald Accent Bar */}
      <div
        aria-hidden="true"
        className="h-0.5 w-full bg-gradient-to-r from-emerald-600/30 via-emerald-500 to-teal-500/30"
      />

      <div className="mx-auto max-w-[1360px] px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        {/* 4 Balanced Columns */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
          {/* Col 1: Brand + Trust Signals */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#0e192c] to-[#228870] text-base font-bold text-white shadow-inner font-serif">
                V
              </span>
              <div>
                <span className="block text-[15px] font-bold tracking-[0.08em] text-[var(--text-primary)]">
                  {brandName || "VARDHEL"}
                </span>
                <span className="block text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {tagline || "Your Vision, Our Framework"}
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
              A digital business growth partner. We transform business potential into digital capability, meaningful customer connections and sustainable growth.
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                100% IP Ownership
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-1">
                AI-Led Engineering
              </span>
            </div>
          </div>

          {/* Col 2: Services & Growth */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-400">
              Services &amp; Growth
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {serviceLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-400">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {companyLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact & Direct Info */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-emerald-700 dark:text-emerald-400">
              Get in Touch
            </h4>
            <div className="mt-4 space-y-3 text-sm">
              <a
                href={`mailto:${displayEmail}`}
                className="flex items-center gap-2.5 text-[var(--text-secondary)] transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                <Mail className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{displayEmail}</span>
              </a>
              <a
                href={`tel:${phone || "+94767996381"}`}
                className="flex items-center gap-2.5 text-[var(--text-secondary)] transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                <Phone className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{phone || "+94 76 799 6381"}</span>
              </a>
              <div className="flex items-start gap-2.5 text-[var(--text-muted)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{displayAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion CTA Bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-4 shadow-2xs sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Let&rsquo;s grow your business with VARDHEL.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Book a free consultation to map your software, web, and growth roadmap.
            </p>
          </div>
          <Link
            href="/contact"
            className="keep-white inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0E192C] dark:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white dark:text-[#04261f] shadow-sm transition-all hover:opacity-90"
          >
            <span className="keep-white dark:text-[#04261f]">Book a Free Consultation</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400 dark:text-[#04261f]" />
          </Link>
        </div>

        {/* Footer Bottom Utility & Social Row (Includes Legal Links & Back to Top) */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-6 text-xs text-[var(--text-muted)] lg:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start">
            <p>
              &copy; {currentYear} {brandName || "Vardhel"}. {rightsText || "All rights reserved."}
            </p>
            <span className="hidden sm:inline text-[var(--border-subtle)]">|</span>
            <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {legalLinks.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <a
                href={fbUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={ytUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[#25D366] transition-all hover:-translate-y-0.5 hover:border-[#25D366]/60"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>

            <a
              href="#"
              aria-label="Back to top"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold text-[var(--text-primary)] transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              <span>Top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
