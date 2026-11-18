"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";

interface EnquiryFormProps {
  locale: "en" | "si";
  sourcePage?: string;
  defaultInterest?: string;
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

export function EnquiryForm({
  locale,
  sourcePage = "/contact",
  defaultInterest = "Software + Social Media Growth",
  labels,
}: EnquiryFormProps) {
  const [renderedAt, setRenderedAt] = useState<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [interest, setInterest] = useState(defaultInterest);
  const [budgetRange, setBudgetRange] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSubmitting(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          businessName,
          interest,
          budgetRange,
          message,
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
        setStatus("ok");
        setName("");
        setEmail("");
        setPhone("");
        setBusinessName("");
        setMessage("");
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
        className="glass-card rounded-3xl border border-emerald-500/40 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <p className="mt-4 text-lg font-bold text-white">{labels.success}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card space-y-5 rounded-3xl p-6 sm:p-8"
    >
      {/* Honeypot anti-bot field (hidden from screen readers and visuals) */}
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
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="enq-name"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.name} *
          </label>
          <input
            id="enq-name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="enq-email"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.email} *
          </label>
          <input
            id="enq-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="enq-phone"
            className="block text-xs font-semibold text-slate-200"
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
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="enq-biz"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.businessName}
          </label>
          <input
            id="enq-biz"
            type="text"
            autoComplete="organization"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="enq-interest"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.interest} *
          </label>
          <select
            id="enq-interest"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d1326] px-4 py-3 text-base text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="Software + Social Media Growth">
              {locale === "si"
                ? "මෘදුකාංග + සමාජ මාධ්‍ය වර්ධනය (පූර්ණ විසඳුම)"
                : "Software + Social Media Growth (End-to-End)"}
            </option>
            <option value="Custom Software Development">
              {locale === "si"
                ? "වෙබ් / ජංගම / මෘදුකාංග සංවර්ධනය"
                : "Custom Web / Mobile / Software Development"}
            </option>
            <option value="Social Media Setup & Content">
              {locale === "si"
                ? "සමාජ මාධ්‍ය කළමනාකරණය සහ වීඩියෝ ප්‍රවර්ධනය"
                : "Social Media Setup, Content & Video Growth"}
            </option>
            <option value="Product Demo (EventLoom / CaptureLoom / PromoLoom)">
              {locale === "si"
                ? "නිෂ්පාදන පිළිබඳ විමසීමක් (EventLoom / CaptureLoom / PromoLoom)"
                : "Product Enquiry (EventLoom / CaptureLoom / PromoLoom)"}
            </option>
            <option value="Academic Project Support">
              {locale === "si"
                ? "අධ්‍යාපනික මෘදුකාංග ව්‍යාපෘති සහාය"
                : "Academic Software Project Support"}
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="enq-budget"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.budget}
          </label>
          <select
            id="enq-budget"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d1326] px-4 py-3 text-base text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="">
              {locale === "si" ? "සාකච්ඡා කර තීරණය කරමු" : "Let's discuss based on scope"}
            </option>
            <option value="Starter / MVP">Starter / MVP</option>
            <option value="Growth Partnership">Full Growth Partnership</option>
            <option value="Enterprise Custom">Enterprise Custom</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="enq-message"
          className="block text-xs font-semibold text-slate-200"
        >
          {labels.message} *
        </label>
        <textarea
          id="enq-message"
          rows={4}
          required
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-base text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
        />
      </div>

      <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-orange-600"
        />
        <span>{labels.consent}</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-orange-600/25 transition-all hover:bg-orange-500 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        <span>{submitting ? "..." : labels.submit}</span>
      </button>
    </form>
  );
}
