"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveFaqAction,
  saveStatCounterAction,
} from "@/server/actions/admin-content.actions";
import { Plus, CheckCircle2 } from "lucide-react";

interface CompanyAdminClientProps {
  csrfToken: string;
  faqs: {
    id: string;
    group: string;
    sortOrder: number;
    enQuestion: string;
    enAnswer: string;
    siQuestion: string;
    siAnswer: string;
  }[];
  stats: {
    id: string;
    value: string;
    suffix: string;
    enLabel: string;
    siLabel: string;
  }[];
}

export function CompanyAdminClient({
  csrfToken,
  faqs,
  stats,
}: CompanyAdminClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newFaq, setNewFaq] = useState({
    group: "general",
    enQuestion: "",
    enAnswer: "",
    siQuestion: "",
    siAnswer: "",
  });
  const [newStat, setNewStat] = useState({
    value: "",
    suffix: "+",
    enLabel: "",
    siLabel: "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await saveFaqAction({
        csrfToken,
        sortOrder: faqs.length + 1,
        ...newFaq,
      });
      setNewFaq({
        group: "general",
        enQuestion: "",
        enAnswer: "",
        siQuestion: "",
        siAnswer: "",
      });
      setMsg("FAQ saved & revalidated!");
      router.refresh();
    });
  };

  const handleAddStat = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await saveStatCounterAction({
        csrfToken,
        sortOrder: stats.length + 1,
        ...newStat,
      });
      setNewStat({ value: "", suffix: "+", enLabel: "", siLabel: "" });
      setMsg("Stat counter added!");
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          FAQs, Trust Counters &amp; Company Content Manager
        </h1>
        <p className="text-sm text-slate-400">
          Manage bilingual FAQs and admin-defined trust counters (zero fake statistics seeded).
        </p>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Trust Strip Counters */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4">
        <h2 className="text-base font-bold text-white">
          Home Trust Strip Counters (Admin-Defined Only)
        </h2>
        <form
          onSubmit={handleAddStat}
          className="grid grid-cols-1 gap-3 md:grid-cols-5 items-end"
        >
          <input
            type="text"
            required
            placeholder="Value (e.g. 3)"
            value={newStat.value}
            onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Suffix (e.g. +)"
            value={newStat.suffix}
            onChange={(e) => setNewStat({ ...newStat, suffix: e.target.value })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            required
            placeholder="Label (EN) e.g. Flagship Products"
            value={newStat.enLabel}
            onChange={(e) => setNewStat({ ...newStat, enLabel: e.target.value })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          />
          <input
            type="text"
            placeholder="Label (සිංහල)"
            value={newStat.siLabel}
            onChange={(e) => setNewStat({ ...newStat, siLabel: e.target.value })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-600 px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Add Counter</span>
          </button>
        </form>

        {stats.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
            {stats.map((st) => (
              <div
                key={st.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs"
              >
                <p className="text-xl font-bold text-orange-400">
                  {st.value}
                  {st.suffix}
                </p>
                <p className="text-white">{st.enLabel}</p>
                <p className="text-indigo-300">{st.siLabel}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add FAQ */}
      <form
        onSubmit={handleAddFaq}
        className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4"
      >
        <h2 className="text-base font-bold text-white">Add New Bilingual FAQ</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <input
              type="text"
              required
              placeholder="Question (English)"
              value={newFaq.enQuestion}
              onChange={(e) =>
                setNewFaq({ ...newFaq, enQuestion: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
            <textarea
              required
              rows={3}
              placeholder="Answer (English)"
              value={newFaq.enAnswer}
              onChange={(e) =>
                setNewFaq({ ...newFaq, enAnswer: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
            />
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Question (සිංහල)"
              value={newFaq.siQuestion}
              onChange={(e) =>
                setNewFaq({ ...newFaq, siQuestion: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
            <textarea
              rows={3}
              placeholder="Answer (සිංහල)"
              value={newFaq.siAnswer}
              onChange={(e) =>
                setNewFaq({ ...newFaq, siAnswer: e.target.value })
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-semibold text-white"
        >
          Save FAQ
        </button>
      </form>

      {/* Existing FAQs */}
      <div className="space-y-3">
        {faqs.map((f) => (
          <div
            key={f.id}
            className="rounded-2xl border border-white/10 bg-[#0d1326] p-4 grid grid-cols-1 gap-4 md:grid-cols-2 text-xs"
          >
            <div>
              <p className="font-bold text-orange-400">{f.enQuestion}</p>
              <p className="mt-1 text-slate-300">{f.enAnswer}</p>
            </div>
            <div>
              <p className="font-bold text-indigo-400">{f.siQuestion}</p>
              <p className="mt-1 text-slate-300">{f.siAnswer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
