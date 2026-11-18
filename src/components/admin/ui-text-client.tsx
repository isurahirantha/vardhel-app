"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUiStringAction } from "@/server/actions/admin-content.actions";
import { Search, Check, AlertTriangle } from "lucide-react";

export interface UiStringRow {
  key: string;
  group: string;
  description: string;
  en: string;
  si: string;
  needsReview: boolean;
}

export function UiTextClient({
  csrfToken,
  initialRows,
}: {
  csrfToken: string;
  initialRows: UiStringRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = rows.filter((r) => {
    if (onlyMissing && r.si.trim() && !r.needsReview) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.key.toLowerCase().includes(q) ||
      r.en.toLowerCase().includes(q) ||
      r.si.toLowerCase().includes(q) ||
      r.group.toLowerCase().includes(q)
    );
  });

  const handleSaveRow = (row: UiStringRow) => {
    setSavingKey(row.key);
    startTransition(async () => {
      await updateUiStringAction({
        csrfToken,
        key: row.key,
        enValue: row.en,
        siValue: row.si,
      });
      setRows((prev) =>
        prev.map((item) =>
          item.key === row.key ? { ...item, needsReview: false } : item
        )
      );
      setSavingKey(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            UI Text &amp; Labels Manager (EN | සිංහල)
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Edit every button label, CTA, form field, and message across English and Sinhala without code.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-[#0d1326] p-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search key, English text, or Sinhala text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyMissing}
            onChange={(e) => setOnlyMissing(e.target.checked)}
            className="h-4 w-4 accent-orange-600"
          />
          <span>Show only Sinhala drafts needing review / missing</span>
        </label>
      </div>

      {/* Table */}
      <div className="space-y-3">
        {filtered.map((row) => (
          <div
            key={row.key}
            className="rounded-2xl border border-white/10 bg-[#0d1326] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-orange-300">
                  {row.key}
                </span>
                <span className="text-xs text-slate-400">{row.description}</span>
              </div>
              {row.needsReview && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Sinhala Draft — Needs Review</span>
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12 items-start">
              <div className="md:col-span-5">
                <label className="block text-[11px] font-semibold text-orange-400">
                  English (EN)
                </label>
                <input
                  type="text"
                  value={row.en}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.key === row.key ? { ...r, en: e.target.value } : r
                      )
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-[11px] font-semibold text-indigo-400">
                  Sinhala (සිංහල - SI)
                </label>
                <input
                  type="text"
                  value={row.si}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.key === row.key ? { ...r, si: e.target.value } : r
                      )
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="md:col-span-2 flex items-end pt-5">
                <button
                  type="button"
                  onClick={() => handleSaveRow(row)}
                  disabled={savingKey === row.key}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-500"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{savingKey === row.key ? "Saving..." : "Save"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
