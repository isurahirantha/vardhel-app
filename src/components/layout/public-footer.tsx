import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Mail, Phone, MapPin } from "lucide-react";

export interface FooterSocialItem {
  id: string;
  platform: string;
  label: string;
  url: string;
}

interface PublicFooterProps {
  brandName: string;
  tagline: string;
  logoUrl: string;
  email: string;
  phone: string;
  address: string;
  rightsText: string;
  companyLinks: { id: string; href: string; label: string }[];
  serviceLinks: { id: string; href: string; label: string }[];
  legalLinks: { id: string; href: string; label: string }[];
  socialLinks: FooterSocialItem[];
}

export function PublicFooter({
  brandName,
  tagline,
  logoUrl,
  email,
  phone,
  address,
  rightsText,
  companyLinks,
  serviceLinks,
  legalLinks,
  socialLinks,
}: PublicFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src={logoUrl || "/SVG/1n1fulllogo.svg"}
                alt={brandName}
                width={170}
                height={44}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">
              {brandName}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--text-muted)]">
              {tagline}
            </p>

            <div className="mt-6 space-y-2.5 text-sm text-[var(--text-secondary)]">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-orange-500"
              >
                <Mail className="h-4 w-4 text-orange-500" />
                <span>{email}</span>
              </a>
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2.5 transition-colors hover:text-orange-500"
              >
                <Phone className="h-4 w-4 text-orange-500" />
                <span>{phone}</span>
              </a>
              {address && (
                <div className="flex items-center gap-2.5 text-[var(--text-muted)]">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span>{address}</span>
                </div>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-orange-500/50 hover:text-orange-500"
                  >
                    {soc.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
              Services &amp; Growth
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {serviceLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-muted)] transition-colors hover:text-orange-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {companyLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-muted)] transition-colors hover:text-orange-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-sm font-bold tracking-wider text-[var(--text-primary)]">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {legalLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="text-[var(--text-muted)] transition-colors hover:text-orange-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-8 text-xs text-[var(--text-muted)] sm:flex-row">
          <p>
            &copy; {currentYear} {brandName}. {rightsText}
          </p>
          <p>Sri Lanka &bull; Global Delivery</p>
        </div>
      </div>
    </footer>
  );
}
