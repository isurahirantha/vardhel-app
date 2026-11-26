"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { adminLoginAction } from "@/server/actions/auth.actions";
import { Shield, Lock, KeyRound, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await adminLoginAction({
        email,
        password,
        totpCode: requiresTotp ? totpCode : undefined,
      });

      if (res.requiresTotp && !res.ok) {
        setRequiresTotp(true);
        if (res.error) setError(res.error);
        return;
      }

      if (!res.ok) {
        setError(res.error ?? "Invalid credentials");
        return;
      }

      if (res.mustChangePassword) {
        router.push("/admin/security?forceChange=1");
      } else {
        router.push("/admin");
      }
      router.refresh();
    });
  };

  return (
    <div className="admin-workspace flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/SVG/1n1fulllogo.svg"
            alt="Vardhel"
            width={160}
            height={40}
            className="h-10 w-auto"
          />
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Shield className="h-3.5 w-3.5" />
            <span>Master Admin Control Centre</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Sign in to Vardhel
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Protected by Argon2id &amp; session rotation
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 flex items-center gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-xs font-medium text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Master Admin Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
              placeholder="contact@vardhel.com"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                placeholder="••••••••••••"
              />
              <Lock className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {requiresTotp && (
            <div>
              <label
                htmlFor="admin-totp"
                className="block text-xs font-semibold text-emerald-700"
              >
                Two-Factor Authenticator Code (or Recovery Code)
              </label>
              <div className="relative mt-1.5">
                <input
                  id="admin-totp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full rounded-xl border border-emerald-400 bg-white px-4 py-3 text-base tracking-widest text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  placeholder="123456"
                />
                <KeyRound className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-emerald-600" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="keep-white mt-2 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {isPending
              ? "Verifying..."
              : requiresTotp
                ? "Verify 2FA & Sign In"
                : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
