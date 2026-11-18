"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateHomeSectionsAction } from "@/server/actions/admin-content.actions";
import { ArrowUp, ArrowDown, CheckCircle2 } from "lucide-react";

export interface AdminHomeSectionItem {
  id: string;
  key: string;
  sortOrder: number;
  isVisible: boolean;
  enTitle: string;
  enSubtitle: string;
  siTitle: string;
  siSubtitle: string;
}

export function HomeBuilderClient({
  csrfToken,
  initialSections,
}: {
  csrfToken: string;
  initialSections: AdminHomeSectionItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sections, setSections] = useState(initialSections);
  const [saved, setSaved] = useState(false);

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    const a = next[idx]!;
    const b = next[target]!;
    next[idx] = { ...b, sortOrder: idx + 1 };
    next[target] = { ...a, sortOrder: target + 1 };
    setSections(next);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateHomeSectionsAction({ csrfToken, sections });
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Home Page Builder &amp; Section Ordering
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Show/hide and reorder Home page sections, and edit their English &amp; Sinhala headings.
          </p>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
        >
          {isPending ? "Saving..." : "Save Home Composition"}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>Home page layout &amp; bilingual headings updated!</span>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((s, idx) => (
          <div
            key={s.id}
            className="rounded-2xl border border-white/10 bg-[#0d1326] p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-orange-600/20 px-2.5 py-1 font-mono text-xs font-bold text-orange-400">
                  #{idx + 1} &bull; {s.key}
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.isVisible}
                    onChange={(e) => {
                      const next = [...sections];
                      next[idx] = { ...s, isVisible: e.target.checked };
                      setSections(next);
                    }}
                    className="h-4 w-4 accent-orange-600"
                  />
                  <span>Visible on Home Page</span>
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 disabled:opacity-30"
                  aria-label="Move section up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === sections.length - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 disabled:opacity-30"
                  aria-label="Move section down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-orange-400">
                  Heading &amp; Subtitle (English)
                </label>
                <input
                  type="text"
                  value={s.enTitle}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = { ...s, enTitle: e.target.value };
                    setSections(next);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={s.enSubtitle}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = { ...s, enSubtitle: e.target.value };
                    setSections(next);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-indigo-400">
                  Heading &amp; Subtitle (සිංහල - Sinhala)
                </label>
                <input
                  type="text"
                  value={s.siTitle}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = { ...s, siTitle: e.target.value };
                    setSections(next);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  value={s.siSubtitle}
                  onChange={(e) => {
                    const next = [...sections];
                    next[idx] = { ...s, siSubtitle: e.target.value };
                    setSections(next);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
}
