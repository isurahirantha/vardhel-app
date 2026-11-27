"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, AlertCircle, Send, ArrowUpRight, Lock } from "lucide-react";

interface EnquiryFormProps {
  locale: "en" | "si";
  sourcePage?: string;
  defaultInterest?: string;
  whatsappHref?: string;
  labels: {
    name: string;
    email: string;
    phone: string;
    businessName: string;
    interest: string;
    budget: string;
    message: string;
    consent: string;
    submit: string;
    success: string;
  };
}

type ReplyChannel = "WhatsApp" | "Email" | "Phone Call";

export function EnquiryForm({
  locale,
  sourcePage = "/contact",
  defaultInterest = "",
  whatsappHref = "https://wa.me/94767996381",
  labels,
}: EnquiryFormProps) {
  const [renderedAt, setRenderedAt] = useState<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [interest, setInterest] = useState(defaultInterest);
  const [replyChannel, setReplyChannel] = useState<ReplyChannel>("WhatsApp");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedName, setSubmittedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isInterestValid = interest.trim().length > 0;
  const isMessageValid = message.trim().length >= 10;

  const markTouched = (field: string) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  const subjectOptions =
    locale === "si"
      ? [
          { value: "Website or Custom Software", label: "වෙබ් / මෘදුකාංග" },
          { value: "Social Media Growth", label: "සමාජ මාධ්‍ය වර්ධනය" },
          { value: "Software & Growth", label: "දෙකම (Software + Growth)" },
          { value: "Vardhel Product Enquiry", label: "Vardhel නිෂ්පාදන" },
          { value: "General Question", label: "සාමාන්‍ය විමසීමක්" },
        ]
      : [
          { value: "Website or Custom Software", label: "Website / Software" },
          { value: "Social Media Growth", label: "Social Media Growth" },
          { value: "Software & Growth", label: "Both Software & Growth" },
          { value: "Vardhel Product Enquiry", label: "Vardhel Products" },
          { value: "General Question", label: "General Question" },
        ];

  const getMessagePlaceholder = () => {
    if (interest === "Website or Custom Software") {
      return locale === "si"
        ? "ඔබේ වෙබ්/මෘදුකාංග අවශ්‍යතා කෙටියෙන් සඳහන් කරන්න..."
        : "Write about your website, app, or custom software idea...";
    }
    if (interest === "Social Media Growth") {
      return locale === "si"
        ? "ඔබේ සමාජ මාධ්‍ය ගිණුම් සහ අරමුණු සඳහන් කරන්න..."
        : "Write about your brand channels and growth goals...";
    }
    return locale === "si"
      ? "ඔබේ පණිවිඩය මෙහි ලියන්න..."
      : "Write your message...";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      interest: true,
      message: true,
      consent: true,
    });

    if (!isNameValid || !isEmailValid || !isInterestValid || !isMessageValid || !consent) {
      return;
    }

    setSubmitting(true);
    setStatus("idle");

    try {
      const enrichedMessage = `[Preferred Reply: ${replyChannel}]\n\n${message.trim()}`;
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          businessName: businessName.trim(),
          interest,
          message: enrichedMessage,
          consent: true,
          locale,
          sourcePage,
          honeypot,
          renderedAt,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setStatus("err");
        setErrorMsg(data.error ?? "Submission failed.");
      } else {
        setSubmittedName(name.trim());
        setStatus("ok");
        setName("");
        setEmail("");
        setPhone("");
        setBusinessName("");
        setInterest(defaultInterest);
        setMessage("");
        setConsent(false);
        setTouched({});
      }
    } catch {
      setStatus("err");
      setErrorMsg("Network error. Please try again or message us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "ok") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="py-8 text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/30">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          {submittedName
            ? `Thanks, ${submittedName} — we'll reply via ${replyChannel} within 24h!`
            : labels.success}
        </h3>
        <p className="mx-auto max-w-md text-sm text-[var(--text-secondary)]">
          {labels.success}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="keep-white inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            <span>{locale === "si" ? "WhatsApp හරහා කතා කරන්න" : "Message on WhatsApp Now"}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="rounded-full border border-[var(--border-subtle)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-emerald-500/40 transition-colors"
          >
            {locale === "si" ? "තවත් විමසීමක් යවන්න" : "Send Another Message"}
          </button>
        </div>
      </div>
    );
  }

  const underlineInput =
    "mt-1 w-full border-0 border-b border-[var(--border-subtle)] bg-transparent px-0 py-2 text-base sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-emerald-600 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot anti-bot field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website-url-hp">Website</label>
        <input
          id="website-url-hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {status === "err" && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="enq-name"
              className="block text-xs font-semibold text-[var(--text-muted)]"
            >
              {labels.name} *
            </label>
            {isNameValid && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ✓
              </span>
            )}
          </div>
          <input
            id="enq-name"
            type="text"
            required
            autoComplete="name"
            placeholder={locale === "si" ? "උදා: කසුන් පෙරේරා" : "Kasun Perera"}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              markTouched("name");
            }}
            onBlur={() => markTouched("name")}
            className={underlineInput}
          />
          {touched.name && !isNameValid && (
            <p className="mt-1 text-[11px] font-medium text-rose-500">
              {locale === "si" ? "කරුණාකර ඔබේ නම ඇතුළත් කරන්න." : "Please enter your name."}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="enq-email"
              className="block text-xs font-semibold text-[var(--text-muted)]"
            >
              {labels.email} *
            </label>
            {isEmailValid && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ✓
              </span>
            )}
          </div>
          <input
            id="enq-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              markTouched("email");
            }}
            onBlur={() => markTouched("email")}
            className={underlineInput}
          />
          {touched.email && !isEmailValid && (
            <p className="mt-1 text-[11px] font-medium text-rose-500">
              {locale === "si"
                ? "කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න."
                : "Please enter a valid email address."}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Phone & Business */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="enq-phone"
            className="block text-xs font-semibold text-[var(--text-muted)]"
          >
            {labels.phone}
          </label>
          <input
            id="enq-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 7X XXX XXXX"
            className={underlineInput}
          />
        </div>
        <div>
          <label
            htmlFor="enq-biz"
            className="block text-xs font-semibold text-[var(--text-muted)]"
          >
            {labels.businessName}
          </label>
          <input
            id="enq-biz"
            type="text"
            autoComplete="organization"
            placeholder={locale === "si" ? "ඔබේ ව්‍යාපාරයේ නම" : "Your company"}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={underlineInput}
          />
        </div>
      </div>

      {/* Row 3: Select Subject? (Approachable Radio Pills matching reference) */}
      <div>
        <div className="flex items-center justify-between">
          <span className="block text-xs font-semibold text-[var(--text-primary)]">
            {labels.interest} *
          </span>
          {isInterestValid && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ✓
            </span>
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {subjectOptions.map((opt) => {
            const active = interest === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setInterest(opt.value);
                  markTouched("interest");
                }}
                className={`inline-flex min-h-[34px] items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? "border-emerald-500 bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:border-emerald-500/40"
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                    active
                      ? "border-emerald-600 bg-emerald-600"
                      : "border-[var(--text-muted)]"
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
        {touched.interest && !isInterestValid && (
          <p className="mt-1.5 text-[11px] font-medium text-rose-500">
            {locale === "si" ? "කරුණාකර විකල්පයක් තෝරන්න." : "Please select how we can help."}
          </p>
        )}
      </div>

      {/* Row 4: Message (Underline Textarea) */}
      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="enq-message"
            className="block text-xs font-semibold text-[var(--text-muted)]"
          >
            {labels.message} *
          </label>
          {isMessageValid && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ✓
            </span>
          )}
        </div>
        <textarea
          id="enq-message"
          rows={2}
          required
          minLength={10}
          value={message}
          placeholder={getMessagePlaceholder()}
          onChange={(e) => {
            setMessage(e.target.value);
            markTouched("message");
          }}
          onBlur={() => markTouched("message")}
          className={`${underlineInput} resize-none`}
        />
        {touched.message && !isMessageValid && (
          <p className="mt-1 text-[11px] font-medium text-rose-500">
            {locale === "si"
              ? "කරුණාකර අවම වශයෙන් අක්ෂර 10ක් ඇතුළත් කරන්න."
              : "Please enter at least 10 characters."}
          </p>
        )}
      </div>

      {/* Row 5: Preferred Reply + Consent */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            {locale === "si" ? "පිළිතුරු ලබා ගැනීමට කැමති මාධ්‍යය" : "Preferred Reply"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(["WhatsApp", "Email", "Phone Call"] as ReplyChannel[]).map((ch) => {
              const active = replyChannel === ch;
              return (
                <button
                  key={ch}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setReplyChannel(ch)}
                  className={`min-h-[32px] rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-emerald-500/40"
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                markTouched("consent");
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
            />
            <span>
              {labels.consent}{" "}
              <Link
                href="/privacy"
                className="font-semibold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:opacity-80"
              >
                {locale === "si" ? "රහස්‍යතා ප්‍රතිපත්තිය" : "Privacy Policy"}
              </Link>
              .
            </span>
          </label>
          {touched.consent && !consent && (
            <p className="mt-1 text-[11px] font-medium text-rose-500">
              {locale === "si"
                ? "ඉදිරියට යාමට කරුණාකර එකඟතාවය තහවුරු කරන්න."
                : "Please accept the consent checkbox to continue."}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Bar: Trust Note + Right-Aligned Send Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <Lock className="h-3 w-3 shrink-0" />
          <span>
            {locale === "si"
              ? "පැය 24ක් ඇතුළත පිළිතුරු ලැබෙනු ඇත."
              : "Replies within 24 hours, Mon–Fri."}
          </span>
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="keep-white inline-flex min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span>
            {submitting ? (locale === "si" ? "යවමින්..." : "Sending...") : labels.submit}
          </span>
        </button>
      </div>
    </form>
  );
}
