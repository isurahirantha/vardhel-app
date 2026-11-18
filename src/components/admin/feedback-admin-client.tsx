"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  moderateFeedbackAction,
  createAdminFeedbackAction,
} from "@/server/actions/admin-content.actions";
import { Check, X, EyeOff, Star, Plus } from "lucide-react";

export interface AdminFeedbackItem {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  rating: number;
  message: string;
  messageSi: string | null;
  source: string;
  locale: string;
  isFeatured: boolean;
  createdAt: string;
}

export function FeedbackAdminClient({
  csrfToken,
  initialFeedback,
}: {
  csrfToken: string;
  initialFeedback: AdminFeedbackItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<string>("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [newFb, setNewFb] = useState({
    name: "",
    company: "",
    role: "",
    rating: 5,
    message: "",
    messageSi: "",
    status: "APPROVED" as "APPROVED" | "PENDING",
  });

  const filtered = initialFeedback.filter((f) =>
    filter === "ALL" ? true : f.status === filter
  );

  const handleModerate = (
    id: string,
    status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN"
  ) => {
    startTransition(async () => {
      await moderateFeedbackAction({ csrfToken, id, status });
      router.refresh();
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createAdminFeedbackAction({ csrfToken, ...newFb });
      setShowAdd(false);
      setNewFb({
        name: "",
        company: "",
        role: "",
        rating: 5,
        message: "",
        messageSi: "",
        status: "APPROVED",
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Customer Feedback Moderation
          </h1>
          <p className="text-sm text-slate-400">
            Nothing is shown on the public site until you approve it here. Submitter emails are kept strictly private.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add Verified Client Feedback</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "HIDDEN"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold ${
              filter === st
                ? "bg-orange-600 text-white"
                : "border border-white/10 bg-[#0d1326] text-slate-300"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-orange-500/40 bg-[#0d1326] p-6"
        >
          <h2 className="text-sm font-bold text-white">
            Add Client Feedback Manually (ADMIN_ENTERED)
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input
              type="text"
              required
              placeholder="Client Name"
              value={newFb.name}
              onChange={(e) => setNewFb({ ...newFb, name: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Company"
              value={newFb.company}
              onChange={(e) => setNewFb({ ...newFb, company: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Role / Title"
              value={newFb.role}
              onChange={(e) => setNewFb({ ...newFb, role: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
            <select
              value={newFb.rating}
              onChange={(e) =>
                setNewFb({ ...newFb, rating: Number(e.target.value) })
              }
              className="rounded-xl border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Stars
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              required
              rows={3}
              placeholder="Feedback message (English)"
              value={newFb.message}
              onChange={(e) => setNewFb({ ...newFb, message: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
            />
            <textarea
              rows={3}
              placeholder="Feedback translation (සිංහල - optional)"
              value={newFb.messageSi}
              onChange={(e) =>
                setNewFb({ ...newFb, messageSi: e.target.value })
              }
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            Save &amp; Approve Feedback
          </button>
        </form>
      )}

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-8 text-center text-sm text-slate-400">
            No customer feedback in this status yet.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#0d1326] p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-white">{item.name}</span>
                  {(item.role || item.company) && (
                    <span className="ml-2 text-xs text-slate-400">
                      {item.role} {item.company ? `@ ${item.company}` : ""}
                    </span>
                  )}
                  {item.email && (
                    <span className="ml-2 rounded bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-400">
                      Private Email: {item.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{item.rating}/5</span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      item.status === "APPROVED"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : item.status === "PENDING"
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-200">{item.message}</p>
              {item.messageSi && (
                <p className="text-xs text-indigo-300">{item.messageSi}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleModerate(item.id, "APPROVED")}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve &amp; Publish</span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleModerate(item.id, "HIDDEN")}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Hide</span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleModerate(item.id, "REJECTED")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
