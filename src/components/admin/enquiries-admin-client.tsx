"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateEnquiryStatusAction } from "@/server/actions/admin-content.actions";
import { buildWhatsAppUrl } from "@/lib/utils";
import { MessageCircle, Mail, Download } from "lucide-react";

export interface AdminEnquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  businessName: string | null;
  interest: string;
  budgetRange: string | null;
  message: string;
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "WON" | "CLOSED";
  locale: string;
  createdAt: string;
  notes: { id: string; note: string; createdAt: string }[];
}

export function EnquiriesAdminClient({
  csrfToken,
  initialEnquiries,
}: {
  csrfToken: string;
  initialEnquiries: AdminEnquiryItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState("ALL");
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  const filtered = initialEnquiries.filter((e) =>
    filter === "ALL" ? true : e.status === filter
  );

  const handleStatusChange = (
    id: string,
    status: AdminEnquiryItem["status"]
  ) => {
    const note = noteInput[id] ?? "";
    startTransition(async () => {
      await updateEnquiryStatusAction({ csrfToken, id, status, note });
      setNoteInput((prev) => ({ ...prev, [id]: "" }));
      router.refresh();
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "Date",
      "Status",
      "Name",
      "Email",
      "Phone",
      "Business",
      "Interest",
      "Budget",
      "Message",
    ];
    const rows = filtered.map((e) => [
      e.createdAt,
      e.status,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.email.replace(/"/g, '""')}"`,
      `"${(e.phone ?? "").replace(/"/g, '""')}"`,
      `"${(e.businessName ?? "").replace(/"/g, '""')}"`,
      `"${e.interest.replace(/"/g, '""')}"`,
      `"${(e.budgetRange ?? "").replace(/"/g, '""')}"`,
      `"${e.message.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `codeloom-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Enquiries (Leads) Inbox
          </h1>
          <p className="text-sm text-slate-400">
            Manage incoming project and social-growth enquiries, add internal notes, and reply directly via WhatsApp or Email.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "NEW", "CONTACTED", "IN_PROGRESS", "WON", "CLOSED"].map(
          (st) => (
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
          )
        )}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d1326] p-8 text-center text-sm text-slate-400">
            No enquiries matching this filter yet.
          </div>
        ) : (
          filtered.map((enq) => (
            <div
              key={enq.id}
              className="rounded-2xl border border-white/10 bg-[#0d1326] p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-base font-bold text-white">
                    {enq.name}
                  </span>
                  {enq.businessName && (
                    <span className="ml-2 text-xs text-orange-400">
                      ({enq.businessName})
                    </span>
                  )}
                  <p className="text-xs text-slate-400">
                    {enq.email} {enq.phone ? `• ${enq.phone}` : ""} • Interest:{" "}
                    <strong>{enq.interest}</strong> •{" "}
                    {new Date(enq.createdAt).toLocaleString()}
                  </p>
                </div>
                <select
                  value={enq.status}
                  disabled={isPending}
                  onChange={(e) =>
                    handleStatusChange(
                      enq.id,
                      e.target.value as AdminEnquiryItem["status"]
                    )
                  }
                  className="rounded-xl border border-orange-500/40 bg-[#060913] px-3 py-1.5 text-xs font-semibold text-orange-300"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="WON">WON</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <p className="rounded-xl bg-white/5 p-3.5 text-sm text-slate-200">
                {enq.message}
              </p>

              {/* Quick Reply Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {enq.phone && (
                  <a
                    href={buildWhatsAppUrl(
                      enq.phone,
                      `Hi ${enq.name}, thank you for contacting Vardhel regarding ${enq.interest}!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Reply via WhatsApp</span>
                  </a>
                )}
                <a
                  href={`mailto:${enq.email}?subject=Re: Your Vardhel Enquiry`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Reply via Email</span>
                </a>
                <div className="flex flex-1 items-center gap-2 min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Add internal note..."
                    value={noteInput[enq.id] ?? ""}
                    onChange={(e) =>
                      setNoteInput((prev) => ({
                        ...prev,
                        [enq.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleStatusChange(enq.id, enq.status)}
                    className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              {enq.notes.length > 0 && (
                <div className="space-y-1 border-t border-white/10 pt-2 text-xs text-slate-400">
                  {enq.notes.map((n) => (
                    <div key={n.id}>
                      &bull; {n.note}{" "}
                      <span className="text-slate-500">
                        ({new Date(n.createdAt).toLocaleString()})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
