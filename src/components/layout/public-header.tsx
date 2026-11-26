"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Layers,
  Sparkles,
  Building2,
  MessageSquareQuote,
  Code2,
} from "lucide-react";

export interface HeaderNavItem {
  id: string;
  href: string;
  label: string;
}

interface PublicHeaderProps {
  brandName: string;
  logoUrl: string;
  whatsappNumber: string;
  whatsappMessage: string;
  navItems: HeaderNavItem[];
  labels: {
    chatWhatsapp: string;
    startProject: string;
  };
}

export function PublicHeader({
  brandName,
  logoUrl: _logoUrl,
  whatsappNumber: _whatsappNumber,
  whatsappMessage: _whatsappMessage,
  navItems: _navItems,
  labels,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);

  const servicesRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
      if (
        companyRef.current &&
        !companyRef.current.contains(event.target as Node)
      ) {
        setCompanyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isServicesActive = pathname.startsWith("/services");
  const isProductsActive = pathname.startsWith("/products");
  const isWorkActive = pathname.startsWith("/projects");
  const isGrowthActive = pathname.startsWith("/growth");
  const isCompanyActive = pathname.startsWith("/about") || pathname.startsWith("/feedback");

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full px-4 pt-3 transition-all duration-300 sm:px-6 lg:px-8">
        <div
          className={`mx-auto flex h-14 max-w-[1360px] items-center justify-between rounded-full px-4 transition-all duration-300 sm:px-6 ${scrolled
              ? "glass-nav-capsule scale-[0.99]"
              : "border border-[var(--border-subtle)] bg-[var(--bg-canvas)]/90 shadow-sm backdrop-blur-md"
            }`}
        >

          {/* Brand Logo & Name */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={brandName || "Vardhel"}
          >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 p-1">
              <Image
                src="/SVG/iconlogo.svg"
                alt="Vardhel Monogram"
                width={28}
                height={28}
                className="h-6 w-6 object-contain"
                priority
              />
            </div>
            <span className="text-lg font-black tracking-wider text-[var(--text-primary)]">
              VARDHEL
            </span>
          </Link>

          {/* Streamlined Desktop Navigation (Centered Capsule) */}
          <nav
            className="hidden lg:flex lg:items-center lg:gap-1"
            aria-label="Main navigation"
          >
            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                type="button"
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setCompanyOpen(false);
                }}
                onMouseEnter={() => setServicesOpen(true)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${isServicesActive
                    ? "bg-emerald-500/15 font-semibold text-emerald-400"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                aria-expanded={servicesOpen}
              >
                <span>Services</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${servicesOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                />
              </button>

              {servicesOpen && (
                <div
                  onMouseLeave={() => setServicesOpen(false)}
                  className="absolute left-0 top-full mt-2 w-72 origin-top-left rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                >
                  <Link
                    href="/services"
                    onClick={() => setServicesOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--bg-surface-elevated)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        All Capabilities
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Full-suite digital solutions
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/services/web-development"
                    onClick={() => setServicesOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--bg-surface-elevated)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400">
                      <Code2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Custom Software & Web
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Scalable architectures & platforms
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/services/social-media-setup-management"
                    onClick={() => setServicesOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--bg-surface-elevated)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Marketing & Engagement
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Multi-channel campaign management
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Products Link */}
            <Link
              href="/products"
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${isProductsActive
                  ? "bg-emerald-500/15 font-semibold text-emerald-400"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                }`}
            >
              Products
            </Link>

            {/* Live Work Link */}
            <Link
              href="/#platforms"
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${isWorkActive
                  ? "bg-emerald-500/15 font-semibold text-emerald-400"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                }`}
            >
              Live Work
            </Link>

            {/* Growth Link */}
            <Link
              href="/growth"
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${isGrowthActive
                  ? "bg-emerald-500/15 font-semibold text-emerald-400"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                }`}
            >
              Growth
            </Link>

            {/* Company Dropdown */}
            <div className="relative" ref={companyRef}>
              <button
                type="button"
                onClick={() => {
                  setCompanyOpen(!companyOpen);
                  setServicesOpen(false);
                }}
                onMouseEnter={() => setCompanyOpen(true)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${isCompanyActive
                    ? "bg-emerald-500/15 font-semibold text-emerald-400"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                aria-expanded={companyOpen}
              >
                <span>Company</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${companyOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                />
              </button>

              {companyOpen && (
                <div
                  onMouseLeave={() => setCompanyOpen(false)}
                  className="absolute left-0 top-full mt-2 w-60 origin-top-left rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                >
                  <Link
                    href="/about"
                    onClick={() => setCompanyOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--bg-surface-elevated)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        About Vardhel
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Vision & team
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/feedback"
                    onClick={() => setCompanyOpen(false)}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--bg-surface-elevated)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-400">
                      <MessageSquareQuote className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">
                        Client Feedback
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Testimonials & ratings
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Right Controls: Compact Language + Theme + Primary CTA */}
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href="/contact"
              className="keep-white inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-[#0E192C] dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#162744]"
            >
              <span className="keep-white">{labels.startProject}</span>
              <ArrowUpRight className="keep-white h-3.5 w-3.5 text-emerald-400 dark:text-white" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="mx-auto mt-2 max-w-[1400px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-2xl lg:hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                Home
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                Services
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                Products
              </Link>
              <Link
                href="/#platforms"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                Live Work
              </Link>
              <Link
                href="/growth"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                Growth Partnership
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                About
              </Link>
              <Link
                href="/feedback"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]"
              >
                Feedback
              </Link>
            </nav>

            <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="keep-white flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20"
              >
                <span className="keep-white">{labels.startProject}</span>
                <ArrowUpRight className="keep-white h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
      {/* Spacer so the fixed header does not cover the top content */}
      <div className="h-[68px] w-full shrink-0" aria-hidden="true" />
    </>
  );
}
