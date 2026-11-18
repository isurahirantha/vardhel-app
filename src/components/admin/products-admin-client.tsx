"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveProductAction,
  checkLinkHealthAction,
} from "@/server/actions/admin-content.actions";
import {
  Plus,
  Trash2,
  Video,
  Link2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export interface AdminProductItem {
  id: string;
  slug: string;
  status: "LIVE" | "BETA" | "COMING_SOON" | "ARCHIVED";
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  videoType: string;
  videoUrl: string;
  techStack: string[];
  en: {
    name: string;
    tagline: string;
    shortDescription: string;
    longDescription: string;
    targetAudience: string;
  };
  si: {
    name: string;
    tagline: string;
    shortDescription: string;
    longDescription: string;
    targetAudience: string;
  };
  features: {
    enTitle: string;
    enDesc: string;
    siTitle: string;
    siDesc: string;
  }[];
  links: {
    label: string;
    url: string;
    type: "LIVE_APP" | "DEMO" | "DOCS" | "API" | "PLAY_STORE" | "APP_STORE" | "REPO" | "OTHER";
    isPrimary: boolean;
  }[];
}

export function ProductsAdminClient({
  csrfToken,
  initialProducts,
}: {
  csrfToken: string;
  initialProducts: AdminProductItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminProductItem>(
    initialProducts[0] ?? {
      id: "",
      slug: "new-product",
      status: "LIVE",
      isFeatured: true,
      isPublished: true,
      sortOrder: initialProducts.length + 1,
      videoType: "youtube",
      videoUrl: "",
      techStack: ["Next.js", "TypeScript", "MySQL"],
      en: {
        name: "",
        tagline: "",
        shortDescription: "",
        longDescription: "",
        targetAudience: "",
      },
      si: {
        name: "",
        tagline: "",
        shortDescription: "",
        longDescription: "",
        targetAudience: "",
      },
      features: [],
      links: [],
    }
  );
  const [activeTab, setActiveTab] = useState<"en" | "si">("en");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [linkStatus, setLinkStatus] = useState<Record<string, string>>({});

  const handleCreateNew = () => {
    setSelected({
      id: "",
      slug: "",
      status: "LIVE",
      isFeatured: true,
      isPublished: true,
      sortOrder: initialProducts.length + 1,
      videoType: "youtube",
      videoUrl: "",
      techStack: ["React", "TypeScript", "Node.js"],
      en: {
        name: "",
        tagline: "",
        shortDescription: "",
        longDescription: "<p></p>",
        targetAudience: "",
      },
      si: {
        name: "",
        tagline: "",
        shortDescription: "",
        longDescription: "<p></p>",
        targetAudience: "",
      },
      features: [
        { enTitle: "", enDesc: "", siTitle: "", siDesc: "" },
      ],
      links: [],
    });
    setMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await saveProductAction({
        csrfToken,
        id: selected.id || undefined,
        slug: selected.slug || selected.en.name,
        status: selected.status,
        isFeatured: selected.isFeatured,
        isPublished: selected.isPublished,
        sortOrder: selected.sortOrder,
        videoType: selected.videoType,
        videoUrl: selected.videoUrl,
        techStack: selected.techStack,
        en: selected.en,
        si: selected.si,
        features: selected.features,
        links: selected.links,
      });

      if (!res.ok) {
        setMsg({ type: "err", text: res.error ?? "Failed to save product" });
        return;
      }

      setMsg({
        type: "ok",
        text: "Product saved & published to /products and Home immediately!",
      });
      router.refresh();
    });
  };

  const handleCheckLink = (url: string) => {
    setLinkStatus((prev) => ({ ...prev, [url]: "Checking..." }));
    startTransition(async () => {
      const res = await checkLinkHealthAction({ csrfToken, url });
      setLinkStatus((prev) => ({
        ...prev,
        [url]: res.ok ? `✅ OK (${res.status})` : `⚠️ ${res.error || res.status}`,
      }));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Products Manager (EventLoom, CaptureLoom, PromoLoom &amp; New)
          </h1>
          <p className="text-sm text-slate-400">
            Manage bilingual product descriptions, ~2-min overview videos, features, and multiple live links.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Product Selector Pills */}
      <div className="flex flex-wrap gap-2">
        {initialProducts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelected(p);
              setMsg(null);
            }}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
              selected.id === p.id
                ? "border-orange-500 bg-orange-600 text-white"
                : "border-white/10 bg-[#0d1326] text-slate-300 hover:bg-white/5"
            }`}
          >
            {p.en.name} ({p.status})
          </button>
        ))}
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3.5 text-xs ${
            msg.type === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          {msg.type === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Editor Form */}
      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-white/10 bg-[#0d1326] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${
                activeTab === "en"
                  ? "bg-orange-600 text-white"
                  : "bg-white/5 text-slate-300"
              }`}
            >
              English (EN)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("si")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${
                activeTab === "si"
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-slate-300"
              }`}
            >
              සිංහල (Sinhala - SI)
            </button>
          </div>
          <div className="flex items-center gap-3">
            {selected.slug && (
              <a
                href={`/en/products/${selected.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:text-orange-400"
              >
                <span>Live Preview</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save & Publish Product"}
            </button>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">
              URL Slug (ASCII)
            </label>
            <input
              type="text"
              required
              value={selected.slug}
              onChange={(e) => setSelected({ ...selected, slug: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">Status</label>
            <select
              value={selected.status}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  status: e.target.value as AdminProductItem["status"],
                })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
            >
              <option value="LIVE">LIVE</option>
              <option value="BETA">BETA</option>
              <option value="COMING_SOON">COMING_SOON</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Tech Stack (comma-separated)
            </label>
            <input
              type="text"
              value={selected.techStack.join(", ")}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  techStack: e.target.value.split(",").map((s) => s.trim()),
                })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
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

        {/* Bilingual Text Content */}
        {activeTab === "en" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  Product Name (EN)
                </label>
                <input
                  type="text"
                  required
                  value={selected.en.name}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      en: { ...selected.en, name: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  Tagline (EN)
                </label>
                <input
                  type="text"
                  required
                  value={selected.en.tagline}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      en: { ...selected.en, tagline: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-orange-400">
                Short Summary (EN)
              </label>
              <textarea
                rows={2}
                value={selected.en.shortDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: { ...selected.en, shortDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-orange-400">
                Full Description (Rich HTML — Sanitized on Save &amp; Render) (EN)
              </label>
              <textarea
                rows={5}
                value={selected.en.longDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: { ...selected.en, longDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-orange-400">
                Who Is It For? (Target Audience EN)
              </label>
              <input
                type="text"
                value={selected.en.targetAudience}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: { ...selected.en, targetAudience: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-indigo-400">
                  Product Name (සිංහල - keep Latin brand name)
                </label>
                <input
                  type="text"
                  value={selected.si.name}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      si: { ...selected.si, name: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-400">
                  Tagline (සිංහල)
                </label>
                <input
                  type="text"
                  value={selected.si.tagline}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      si: { ...selected.si, tagline: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-400">
                Short Summary (සිංහල)
              </label>
              <textarea
                rows={2}
                value={selected.si.shortDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: { ...selected.si, shortDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-400">
                Full Description (සිංහල)
              </label>
              <textarea
                rows={5}
                value={selected.si.longDescription}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: { ...selected.si, longDescription: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-400">
                Who Is It For? (සිංහල)
              </label>
              <input
                type="text"
                value={selected.si.targetAudience}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: { ...selected.si, targetAudience: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Video Configuration (~2-min Product Overview Video) */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">
              ~2-Minute Product Video (Click-to-Load Privacy Facade)
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs text-slate-300">Video Source Type</label>
              <select
                value={selected.videoType}
                onChange={(e) =>
                  setSelected({ ...selected, videoType: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              >
                <option value="youtube">YouTube (youtube-nocookie.com)</option>
                <option value="vimeo">Vimeo</option>
                <option value="upload">Uploaded MP4 / Media URL</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300">
                Video URL (HTTPS YouTube/Vimeo link or `/api/media/...` from Media Library)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={selected.videoUrl}
                onChange={(e) =>
                  setSelected({ ...selected, videoUrl: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Links Manager */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Live Application &amp; Demo Links (HTTPS enforced + SSRF Health Check)
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelected({
                  ...selected,
                  links: [
                    ...selected.links,
                    {
                      label: "Open Live App",
                      url: "https://",
                      type: "LIVE_APP",
                      isPrimary: selected.links.length === 0,
                    },
                  ],
                })
              }
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"
            >
              + Add Live Link
            </button>
          </div>
          {selected.links.map((l, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-[#060913] p-3 md:grid-cols-6 items-center"
            >
              <input
                type="text"
                placeholder="Label (e.g. Open Live App)"
                value={l.label}
                onChange={(e) => {
                  const next = [...selected.links];
                  next[idx] = { ...l, label: e.target.value };
                  setSelected({ ...selected, links: next });
                }}
                className="rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="url"
                placeholder="https://..."
                value={l.url}
                onChange={(e) => {
                  const next = [...selected.links];
                  next[idx] = { ...l, url: e.target.value };
                  setSelected({ ...selected, links: next });
                }}
                className="md:col-span-2 rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
              />
              <select
                value={l.type}
                onChange={(e) => {
                  const next = [...selected.links];
                  next[idx] = {
                    ...l,
                    type: e.target.value as AdminProductItem["links"][number]["type"],
                  };
                  setSelected({ ...selected, links: next });
                }}
                className="rounded border border-white/10 bg-[#0d1326] px-2.5 py-1.5 text-xs text-white"
              >
                <option value="LIVE_APP">LIVE_APP</option>
                <option value="DEMO">DEMO</option>
                <option value="DOCS">DOCS</option>
                <option value="PLAY_STORE">PLAY_STORE</option>
                <option value="APP_STORE">APP_STORE</option>
                <option value="REPO">REPO</option>
              </select>
              <button
                type="button"
                onClick={() => handleCheckLink(l.url)}
                className="rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] text-slate-300 hover:bg-white/10"
              >
                {linkStatus[l.url] || "Test Link Health"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelected({
                    ...selected,
                    links: selected.links.filter((_, i) => i !== idx),
                  })
                }
                className="inline-flex items-center justify-center rounded border border-red-500/30 bg-red-500/10 py-1.5 text-xs text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Key Features Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Key Features ({selected.features.length})
            </h3>
            <button
              type="button"
              onClick={() =>
                setSelected({
                  ...selected,
                  features: [
                    ...selected.features,
                    { enTitle: "", enDesc: "", siTitle: "", siDesc: "" },
                  ],
                })
              }
              className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300"
            >
              + Add Feature
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {selected.features.map((f, idx) => (
              <div
                key={idx}
                className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    Feature #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected({
                        ...selected,
                        features: selected.features.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-xs text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Title (EN)"
                  value={f.enTitle}
                  onChange={(e) => {
                    const next = [...selected.features];
                    next[idx] = { ...f, enTitle: e.target.value };
                    setSelected({ ...selected, features: next });
                  }}
                  className="w-full rounded border border-white/10 bg-[#060913] px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Description (EN)"
                  value={f.enDesc}
                  onChange={(e) => {
                    const next = [...selected.features];
                    next[idx] = { ...f, enDesc: e.target.value };
                    setSelected({ ...selected, features: next });
                  }}
                  className="w-full rounded border border-white/10 bg-[#060913] px-2.5 py-1.5 text-xs text-slate-300"
                />
                <input
                  type="text"
                  placeholder="Title (සිංහල)"
                  value={f.siTitle}
                  onChange={(e) => {
                    const next = [...selected.features];
                    next[idx] = { ...f, siTitle: e.target.value };
                    setSelected({ ...selected, features: next });
                  }}
                  className="w-full rounded border border-white/10 bg-[#060913] px-2.5 py-1.5 text-xs text-indigo-200"
                />
                <input
                  type="text"
                  placeholder="Description (සිංහල)"
                  value={f.siDesc}
                  onChange={(e) => {
                    const next = [...selected.features];
                    next[idx] = { ...f, siDesc: e.target.value };
                    setSelected({ ...selected, features: next });
                  }}
                  className="w-full rounded border border-white/10 bg-[#060913] px-2.5 py-1.5 text-xs text-indigo-200"
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
