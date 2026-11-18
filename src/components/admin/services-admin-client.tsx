"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveServiceAction } from "@/server/actions/admin-content.actions";
import { Plus, CheckCircle2 } from "lucide-react";

export interface AdminServiceItem {
  id: string;
  categoryId: string;
  slug: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  en: {
    title: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
  };
  si: {
    title: string;
    shortDescription: string;
    longDescription: string;
    features: string[];
  };
}

export function ServicesAdminClient({
  csrfToken,
  categories,
  initialServices,
}: {
  csrfToken: string;
  categories: { id: string; name: string }[];
  initialServices: AdminServiceItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminServiceItem>(
    initialServices[0] ?? {
      id: "",
      categoryId: categories[0]?.id ?? "",
      slug: "new-service",
      isFeatured: true,
      isPublished: true,
      sortOrder: initialServices.length + 1,
      en: { title: "", shortDescription: "", longDescription: "", features: [] },
      si: { title: "", shortDescription: "", longDescription: "", features: [] },
    }
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await saveServiceAction({
        csrfToken,
        id: selected.id || undefined,
        categoryId: selected.categoryId,
        slug: selected.slug || selected.en.title,
        isFeatured: selected.isFeatured,
        isPublished: selected.isPublished,
        sortOrder: selected.sortOrder,
        en: selected.en,
        si: selected.si,
      });
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Services Manager (Software Development &amp; Social Media Growth)
          </h1>
          <p className="text-sm text-slate-400">
            Edit the 8 software engineering services and 3 social media growth services in EN &amp; SI.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelected({
              id: "",
              categoryId: categories[0]?.id ?? "",
              slug: "",
              isFeatured: true,
              isPublished: true,
              sortOrder: initialServices.length + 1,
              en: { title: "", shortDescription: "", longDescription: "<p></p>", features: [] },
              si: { title: "", shortDescription: "", longDescription: "<p></p>", features: [] },
            });
            setSaved(false);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Service Selector */}
      <div className="flex flex-wrap gap-2">
        {initialServices.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSelected(s);
              setSaved(false);
            }}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              selected.id === s.id
                ? "border-orange-500 bg-orange-600 text-white"
                : "border-white/10 bg-[#0d1326] text-slate-300 hover:bg-white/5"
            }`}
          >
            {s.en.title}
          </button>
        ))}
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>Service saved &amp; published!</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-2xl border border-white/10 bg-[#0d1326] p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-300">Category</label>
            <select
              value={selected.categoryId}
              onChange={(e) =>
                setSelected({ ...selected, categoryId: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-300">Slug</label>
            <input
              type="text"
              required
              value={selected.slug}
              onChange={(e) => setSelected({ ...selected, slug: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white"
            />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.isPublished}
                onChange={(e) =>
                  setSelected({ ...selected, isPublished: e.target.checked })
                }
                className="h-4 w-4 accent-orange-600"
              />
              <span>Published</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.isFeatured}
                onChange={(e) =>
                  setSelected({ ...selected, isFeatured: e.target.checked })
                }
                className="h-4 w-4 accent-orange-600"
              />
              <span>Featured on Home</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* English Column */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs font-bold text-orange-400">English (EN)</h3>
            <div>
              <label className="block text-xs text-slate-300">Title (EN)</label>
              <input
                type="text"
                required
                value={selected.en.title}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: { ...selected.en, title: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Short Description (EN)
              </label>
              <input
                type="text"
                value={selected.en.shortDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: { ...selected.en, shortDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Long Description (HTML) (EN)
              </label>
              <textarea
                rows={4}
                value={selected.en.longDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: { ...selected.en, longDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] p-2.5 font-mono text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Bullet Features (one per line) (EN)
              </label>
              <textarea
                rows={5}
                value={selected.en.features.join("\n")}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: {
                      ...selected.en,
                      features: e.target.value.split("\n"),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] p-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Sinhala Column */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs font-bold text-indigo-400">
              සිංහල (Sinhala - SI)
            </h3>
            <div>
              <label className="block text-xs text-slate-300">Title (සිංහල)</label>
              <input
                type="text"
                value={selected.si.title}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: { ...selected.si, title: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Short Description (සිංහල)
              </label>
              <input
                type="text"
                value={selected.si.shortDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: { ...selected.si, shortDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Long Description (HTML) (සිංහල)
              </label>
              <textarea
                rows={4}
                value={selected.si.longDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: { ...selected.si, longDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] p-2.5 font-mono text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300">
                Bullet Features (one per line) (සිංහල)
              </label>
              <textarea
                rows={5}
                value={selected.si.features.join("\n")}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: {
                      ...selected.si,
                      features: e.target.value.split("\n"),
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Service"}
        </button>
      </form>
    </div>
  );
}
