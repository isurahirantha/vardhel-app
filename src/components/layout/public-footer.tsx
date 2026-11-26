import { Link } from "@/i18n/navigation";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube, MessageCircle } from "lucide-react";

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

  // Map known platforms or find URLs from passed socialLinks
  const findSocialUrl = (platform: string, fallback: string) => {
    const match = socialLinks?.find(
      (s) => s.platform?.toLowerCase() === platform.toLowerCase() || s.label?.toLowerCase() === platform.toLowerCase()
    );
    return match ? match.url : fallback;
  };

  const fbUrl = findSocialUrl("facebook", "https://facebook.com");
  const linkedinUrl = findSocialUrl("linkedin", "https://linkedin.com");
  const instaUrl = findSocialUrl("instagram", "https://instagram.com");
  const ytUrl = findSocialUrl("youtube", "https://youtube.com");
  const waUrl = findSocialUrl("whatsapp", "https://wa.me/94767996381");

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] pt-16 pb-8 text-[var(--text-secondary)]">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column (from template: 1.6fr of 4 columns -> 5 cols on 12-col grid) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-base font-bold text-white shadow-inner font-serif">
                V
              </span>
              <div>
                <span className="block text-[15px] font-bold tracking-[0.08em] text-[var(--text-primary)]">
                  {brandName || "VARDHEL"}
                </span>
                <span className="block font-mono text-[11px] text-[var(--text-muted)]">
                  {tagline || "Your Vision, Our Framework"}
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm text-[var(--text-muted)] leading-relaxed">
              A digital business growth partner. We transform business potential into digital capability, meaningful customer connections and sustainable growth.
            </p>

            <div className="space-y-2.5 pt-2 text-sm">
              <a
                href={`mailto:${email || "vardhel.official@gmail.com"}`}
                className="flex items-center gap-2.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
              >
                <Mail className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                <span>{email || "vardhel.official@gmail.com"}</span>
              </a>
              <a
                href={`tel:${phone || "+94767996381"}`}
                className="flex items-center gap-2.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
              >
                <Phone className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                <span>{phone || "+94 76 799 6381"}</span>
              </a>
              <div className="flex items-center gap-2.5 text-[var(--text-muted)]">
                <MapPin className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                <span>{address || "Sri Lanka · Global Delivery"}</span>
              </div>
            </div>
          </div>

          {/* Services & Growth Column */}
          <div className="lg:col-span-3">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Services &amp; Growth
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {serviceLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {companyLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legalLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-7 text-[13px] text-[var(--text-muted)] sm:flex-row">
          <p>
            &copy; {currentYear} {brandName || "Vardhel"}. {rightsText || "All rights reserved. · Sri Lanka • Global Delivery"}
          </p>

          {/* Always explicitly display FB, LinkedIn, Instagram, YouTube, WhatsApp */}
          <div className="flex items-center gap-2.5">
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:-translate-y-0.5"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:-translate-y-0.5"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:-translate-y-0.5"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:-translate-y-0.5"
            >
              <Youtube className="h-4 w-4" />
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
