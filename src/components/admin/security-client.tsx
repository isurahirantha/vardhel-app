"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  changeAdminPasswordAction,
  confirmTotpSetupAction,
  disableTotpAction,
  initiateTotpSetupAction,
  revokeSessionByIdAction,
} from "@/server/actions/auth.actions";
import { Shield, KeyRound, Smartphone, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface SessionItem {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
  isCurrent: boolean;
}

interface SecurityClientProps {
  csrfToken: string;
  mustChangePassword: boolean;
  totpEnabled: boolean;
  sessions: SessionItem[];
}

export function SecurityClient({
  csrfToken,
  mustChangePassword,
  totpEnabled,
  sessions,
}: SecurityClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // TOTP state
  const [totpSetup, setTotpSetup] = useState<{
    secret: string;
    qrDataUrl: string;
  } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpPassword, setTotpPassword] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [totpMsg, setTotpMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "err", text: "New passwords do not match." });
      return;
    }

    startTransition(async () => {
      const res = await changeAdminPasswordAction({
        currentPassword,
        newPassword,
        csrfToken,
      });
      if (!res.ok) {
        setPwMsg({ type: "err", text: res.error ?? "Failed to update password." });
        return;
      }
      setPwMsg({
        type: "ok",
        text: "Password updated and sessions rotated!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    });
  };

  const handleStartTotp = () => {
    setTotpMsg(null);
    startTransition(async () => {
      const res = await initiateTotpSetupAction(csrfToken);
      if (res.ok && res.secret && res.qrDataUrl) {
        setTotpSetup({ secret: res.secret, qrDataUrl: res.qrDataUrl });
      } else {
        setTotpMsg({ type: "err", text: res.error ?? "Failed to initiate 2FA." });
      }
    });
  };

  const handleConfirmTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpSetup) return;
    setTotpMsg(null);
    startTransition(async () => {
      const res = await confirmTotpSetupAction({
        secret: totpSetup.secret,
        code: totpCode,
        currentPassword: totpPassword,
        csrfToken,
      });
      if (!res.ok) {
        setTotpMsg({ type: "err", text: res.error ?? "Failed to verify 2FA." });
        return;
      }
      setRecoveryCodes(res.recoveryCodes ?? []);
      setTotpSetup(null);
      setTotpCode("");
      setTotpPassword("");
      setTotpMsg({ type: "ok", text: "Two-Factor Authentication (TOTP) enabled!" });
      router.refresh();
    });
  };

  const handleDisableTotp = () => {
    if (!totpPassword) {
      setTotpMsg({ type: "err", text: "Enter your current password to disable 2FA." });
      return;
    }
    startTransition(async () => {
      const res = await disableTotpAction({
        currentPassword: totpPassword,
        csrfToken,
      });
      if (!res.ok) {
        setTotpMsg({ type: "err", text: res.error ?? "Failed to disable 2FA." });
        return;
      }
      setTotpPassword("");
      setTotpMsg({ type: "ok", text: "2FA disabled." });
      router.refresh();
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    startTransition(async () => {
      await revokeSessionByIdAction({ sessionId, csrfToken });
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Security, Password &amp; Two-Factor Authentication
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your Master Admin credentials, TOTP 2FA, recovery codes, and active sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Change Password Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-bold text-white">
              {mustChangePassword
                ? "Set Your New Master Admin Password (Required)"
                : "Change Master Password"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Minimum 12 characters, zxcvbn strength score &ge; 3, must not contain brand/email.
          </p>

          {pwMsg && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs ${
                pwMsg.type === "ok"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {pwMsg.type === "ok" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{pwMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                New Password (&ge; 12 chars, strong passphrase)
              </label>
              <input
                type="password"
                required
                minLength={12}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={12}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
            >
              Update Password &amp; Rotate Sessions
            </button>
          </form>
        </div>

        {/* TOTP 2FA Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">
                Two-Factor Authentication (TOTP)
              </h2>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                totpEnabled
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300"
              }`}
            >
              {totpEnabled ? "Enabled" : "Not Enabled"}
            </span>
          </div>

          {totpMsg && (
            <div
              className={`mt-4 rounded-xl border p-3 text-xs ${
                totpMsg.type === "ok"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}
            >
              {totpMsg.text}
            </div>
          )}

          {recoveryCodes && (
            <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <p className="text-xs font-bold text-amber-300">
                Save Your 10 One-Time Recovery Codes Now (Shown Once Only):
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs text-white">
                {recoveryCodes.map((c) => (
                  <div key={c} className="rounded bg-black/40 px-2 py-1">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!totpEnabled && !totpSetup && (
            <div className="mt-5">
              <p className="text-xs text-slate-300">
                Protect the Master Admin account with Google Authenticator, Authy, or 1Password.
              </p>
              <button
                type="button"
                onClick={handleStartTotp}
                disabled={isPending}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Generate 2FA QR Code
              </button>
            </div>
          )}

          {totpSetup && (
            <form onSubmit={handleConfirmTotp} className="mt-5 space-y-4">
              <div className="flex flex-col items-center rounded-xl bg-white p-4">
                <Image
                  src={totpSetup.qrDataUrl}
                  alt="TOTP QR Code"
                  width={180}
                  height={180}
                  unoptimized
                />
                <p className="mt-2 font-mono text-xs text-slate-800">
                  Secret: {totpSetup.secret}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  Confirm Current Password
                </label>
                <input
                  type="password"
                  required
                  value={totpPassword}
                  onChange={(e) => setTotpPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">
                  6-Digit Code from Authenticator App
                </label>
                <input
                  type="text"
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="123456"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm tracking-widest text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Verify &amp; Enable 2FA
              </button>
            </form>
          )}

          {totpEnabled && (
            <div className="mt-5 space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Enter Current Password to Disable 2FA
              </label>
              <input
                type="password"
                value={totpPassword}
                onChange={(e) => setTotpPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
              />
              <button
                type="button"
                onClick={handleDisableTotp}
                disabled={isPending}
                className="rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/25"
              >
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions List */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Active Admin Sessions</h2>
        </div>
        <div className="mt-4 divide-y divide-white/10">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-4 py-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    IP: {s.ip ?? "127.0.0.1"}
                  </span>
                  {s.isCurrent && (
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Current Session
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-slate-400">{s.userAgent}</p>
                <p className="mt-0.5 text-slate-500">
                  Last active: {new Date(s.lastSeenAt).toLocaleString()}
                </p>
              </div>
              {!s.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRevokeSession(s.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Revoke</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
