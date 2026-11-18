"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePageContentAction } from "@/server/actions/admin-content.actions";
import { CheckCircle2 } from "lucide-react";

export interface AdminPageContentItem {
  slug: string;
  enTitle: string;
  enSubtitle: string;
  enBody: string;
  siTitle: string;
  siSubtitle: string;
  siBody: string;
}

export function PagesAdminClient({
  csrfToken,
  initialPages,
}: {
  csrfToken: string;
  initialPages: AdminPageContentItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminPageContentItem>(
    initialPages[0] ?? {
      slug: "about",
      enTitle: "About Vardhel",
      enSubtitle: "",
      enBody: "<p></p>",
      siTitle: "",
      siSubtitle: "",
      siBody: "<p></p>",
    }
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await savePageContentAction({ csrfToken, ...selected });
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Pages &amp; Legal Content Editor (About, Vision, Mission, Terms, Privacy, Cookies)
        </h1>
        <p className="text-sm text-slate-400">
          Edit rich-text content for company pages and legal policies in both English and Sinhala.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {initialPages.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => {
              setSelected(p);
              setSaved(false);
            }}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${
              selected.slug === p.slug
                ? "border-orange-500 bg-orange-600 text-white"
                : "border-white/10 bg-[#0d1326] text-slate-300"
            }`}
          >
            /{p.slug} ({p.enTitle})
          </button>
        ))}
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>Page content saved &amp; revalidated!</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-white/10 bg-[#0d1326] p-6"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* English */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs font-bold text-orange-400">English (EN)</h3>
            <div>
              <label className="block text-xs text-slate-300">Title (EN)</label>
              <input
                type="text"
                required
                value={selected.enTitle}
                onChange={(e) =>
                  setSelected({ ...selected, enTitle: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">Subtitle (EN)</label>
              <input
                type="text"
                value={selected.enSubtitle}
                onChange={(e) =>
                  setSelected({ ...selected, enSubtitle: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Rich HTML Body (Sanitized on save &amp; render) (EN)
              </label>
              <textarea
                rows={8}
                value={selected.enBody}
                onChange={(e) =>
                  setSelected({ ...selected, enBody: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] p-3 font-mono text-xs text-white"
              />
            </div>
          </div>

          {/* Sinhala */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs font-bold text-indigo-400">
              සිංහල (Sinhala - SI)
            </h3>
            <div>
              <label className="block text-xs text-slate-300">Title (සිංහල)</label>
              <input
                type="text"
                value={selected.siTitle}
                onChange={(e) =>
                  setSelected({ ...selected, siTitle: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Subtitle (සිංහල)
              </label>
              <input
                type="text"
                value={selected.siSubtitle}
                onChange={(e) =>
                  setSelected({ ...selected, siSubtitle: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Rich HTML Body (සිංහල)
              </label>
              <textarea
                rows={8}
                value={selected.siBody}
                onChange={(e) =>
                  setSelected({ ...selected, siBody: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] p-3 font-mono text-xs text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
        >
          {isPending ? "Saving..." : "Save Page Content"}
        </button>
      </form>
    </div>
  );
}
