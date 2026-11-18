"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, AlertCircle, Send } from "lucide-react";

interface FeedbackFormProps {
  locale: "en" | "si";
  labels: {
    name: string;
    email: string;
    businessName: string;
    message: string;
    consent: string;
    submit: string;
    success: string;
  };
}

export function FeedbackForm({ locale, labels }: FeedbackFormProps) {
  const [renderedAt, setRenderedAt] = useState(0);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
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
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          role,
          email,
          rating,
          message,
          consentToPublish: true,
          locale,
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
      }
    } catch {
      setStatus("err");
      setErrorMsg("Network error.");
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
      <div className="hidden" aria-hidden="true">
        <input
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
          className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <span className="block text-xs font-semibold text-slate-200">
          {locale === "si" ? "ඔබේ ශ්‍රේණිගත කිරීම (Rating)" : "Your Rating"} *
        </span>
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setRating(num)}
              className="rounded-lg p-1.5 transition-transform hover:scale-110"
              aria-label={`Rate ${num} out of 5 stars`}
            >
              <Star
                className={`h-7 w-7 ${
                  num <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fb-name"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.name} *
          </label>
          <input
            id="fb-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white"
          />
        </div>
        <div>
          <label
            htmlFor="fb-company"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.businessName}
          </label>
          <input
            id="fb-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="fb-role"
            className="block text-xs font-semibold text-slate-200"
          >
            {locale === "si" ? "තනතුර (Optional)" : "Your Role / Title (Optional)"}
          </label>
          <input
            id="fb-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white"
          />
        </div>
        <div>
          <label
            htmlFor="fb-email"
            className="block text-xs font-semibold text-slate-200"
          >
            {labels.email} ({locale === "si" ? "ප්‍රසිද්ධ නොකෙරේ" : "Private, never shown"})
          </label>
          <input
            id="fb-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="fb-msg"
          className="block text-xs font-semibold text-slate-200"
        >
          {locale === "si" ? "ඔබේ අත්දැකීම" : "Your Experience with Vardhel"} *
        </label>
        <textarea
          id="fb-msg"
          rows={4}
          required
          minLength={15}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-base text-white"
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
