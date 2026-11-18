"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSiteSettingsAction } from "@/server/actions/admin-content.actions";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface SettingsClientProps {
  csrfToken: string;
  initial: {
    brandName: string;
    taglineEn: string;
    taglineSi: string;
    primaryColor: string;
    secondaryColor: string;
    contactEmail: string;
    notifyEmail: string;
    whatsappNumber: string;
    whatsappMsgEn: string;
    whatsappMsgSi: string;
    phone: string;
    addressEn: string;
    addressSi: string;
    workingHoursEn: string;
    workingHoursSi: string;
    enableFloatingWhatsapp: boolean;
    enable3dHero: boolean;
    enableCustomCursor: boolean;
    enableFeedback: boolean;
    socialLinks: { platform: string; labelEn: string; labelSi: string; url: string }[];
  };
}

export function SettingsClient({ csrfToken, initial }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await updateSiteSettingsAction({ csrfToken, ...form });
        setSaved(true);
        router.refresh();
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Failed to save settings. Please refresh the page and try again."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Site Settings, Contact Details &amp; Feature Toggles
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Every change here updates the public site immediately in both English and Sinhala.
          </p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-600/25 hover:bg-orange-500 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Settings saved and public site colours updated immediately!</span>
        </div>
      )}
      {errorMsg && (
        <div className="rounded-xl border border-red-400 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Brand & Colours */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-5">
        <h2 className="text-base font-bold text-white">Brand &amp; Theme Colours</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-300">Brand Name</label>
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Primary Colour (Hex)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="h-9 w-12 rounded border border-white/10 bg-transparent"
              />
              <input
                type="text"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Secondary Colour (Hex)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="color"
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                className="h-9 w-12 rounded border border-white/10 bg-transparent"
              />
              <input
                type="text"
                value={form.secondaryColor}
                onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-sm text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-orange-400">
              Tagline (English)
            </label>
            <input
              type="text"
              value={form.taglineEn}
              onChange={(e) => setForm({ ...form, taglineEn: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-indigo-400">
              Tagline (සිංහල - Sinhala)
            </label>
            <input
              type="text"
              value={form.taglineSi}
              onChange={(e) => setForm({ ...form, taglineSi: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* Contact & WhatsApp */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-5">
        <h2 className="text-base font-bold text-white">
          Contact Details &amp; WhatsApp Integration
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Public Contact Email
            </label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Lead Notification Email
            </label>
            <input
              type="email"
              value={form.notifyEmail}
              onChange={(e) => setForm({ ...form, notifyEmail: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-emerald-400">
              WhatsApp Number (with country code)
            </label>
            <input
              type="text"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Display Phone Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-orange-400">
              Default WhatsApp Prefilled Message (EN)
            </label>
            <input
              type="text"
              value={form.whatsappMsgEn}
              onChange={(e) => setForm({ ...form, whatsappMsgEn: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-indigo-400">
              Default WhatsApp Prefilled Message (සිංහල)
            </label>
            <input
              type="text"
              value={form.whatsappMsgSi}
              onChange={(e) => setForm({ ...form, whatsappMsgSi: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-orange-400">
              Location / Address (EN)
            </label>
            <input
              type="text"
              value={form.addressEn}
              onChange={(e) => setForm({ ...form, addressEn: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-indigo-400">
              Location / Address (සිංහල)
            </label>
            <input
              type="text"
              value={form.addressSi}
              onChange={(e) => setForm({ ...form, addressSi: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-orange-400">
              Working Hours (EN)
            </label>
            <input
              type="text"
              value={form.workingHoursEn}
              onChange={(e) => setForm({ ...form, workingHoursEn: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-indigo-400">
              Working Hours (සිංහල)
            </label>
            <input
              type="text"
              value={form.workingHoursSi}
              onChange={(e) => setForm({ ...form, workingHoursSi: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Layout &amp; Experience Toggles</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enableFloatingWhatsapp}
              onChange={(e) =>
                setForm({ ...form, enableFloatingWhatsapp: e.target.checked })
              }
              className="h-4 w-4 accent-orange-600"
            />
            <span>Floating WhatsApp Button</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enable3dHero}
              onChange={(e) => setForm({ ...form, enable3dHero: e.target.checked })}
              className="h-4 w-4 accent-orange-600"
            />
            <span>Interactive 3D Hero Loom</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enableCustomCursor}
              onChange={(e) => setForm({ ...form, enableCustomCursor: e.target.checked })}
              className="h-4 w-4 accent-orange-600"
            />
            <span>Desktop Spotlight Cursor</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enableFeedback}
              onChange={(e) => setForm({ ...form, enableFeedback: e.target.checked })}
              className="h-4 w-4 accent-orange-600"
            />
            <span>Customer Feedback Module</span>
          </label>
        </div>
      </div>

      {/* Social Links Manager */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Social Media Links</h2>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                socialLinks: [
                  ...form.socialLinks,
                  { platform: "instagram", labelEn: "Instagram", labelSi: "Instagram", url: "https://" },
                ],
              })
            }
            className="inline-flex items-center gap-1 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Social Link</span>
          </button>
        </div>
        <div className="space-y-3">
          {form.socialLinks.map((sl, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/5 p-3 md:grid-cols-5"
            >
              <input
                type="text"
                placeholder="Platform (facebook/tiktok...)"
                value={sl.platform}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[idx] = { ...sl, platform: e.target.value };
                  setForm({ ...form, socialLinks: next });
                }}
                className="rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Label (EN)"
                value={sl.labelEn}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[idx] = { ...sl, labelEn: e.target.value };
                  setForm({ ...form, socialLinks: next });
                }}
                className="rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Label (සිංහල)"
                value={sl.labelSi}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[idx] = { ...sl, labelSi: e.target.value };
                  setForm({ ...form, socialLinks: next });
                }}
                className="rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
              <input
                type="url"
                placeholder="https://..."
                value={sl.url}
                onChange={(e) => {
                  const next = [...form.socialLinks];
                  next[idx] = { ...sl, url: e.target.value };
                  setForm({ ...form, socialLinks: next });
                }}
                className="rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    socialLinks: form.socialLinks.filter((_, i) => i !== idx),
                  })
                }
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
