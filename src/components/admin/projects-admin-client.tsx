"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveProjectAction } from "@/server/actions/admin-content.actions";
import { Plus, Trash2, CheckCircle2, Share2, Link2, Image as ImageIcon, Upload } from "lucide-react";

export interface AdminProjectItem {
  id: string;
  slug: string;
  isDemo: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  coverUrl: string;
  logoUrl: string;
  videoType: string;
  videoUrl: string;
  techStack: string[];
  en: {
    title: string;
    clientName: string;
    industry: string;
    summary: string;
    challenge: string;
    solution: string;
    result: string;
  };
  si: {
    title: string;
    clientName: string;
    industry: string;
    summary: string;
    challenge: string;
    solution: string;
    result: string;
  };
  links: {
    label: string;
    url: string;
    type: "LIVE_SITE" | "DEMO" | "APP" | "SOCIAL" | "OTHER";
  }[];
  socialWork: {
    platform: string;
    handle: string;
    profileUrl: string;
    enSummary: string;
    siSummary: string;
  }[];
}

export function ProjectsAdminClient({
  csrfToken,
  initialProjects,
}: {
  csrfToken: string;
  initialProjects: AdminProjectItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminProjectItem>(
    initialProjects[0] ?? {
      id: "",
      slug: "new-project",
      isDemo: false,
      isFeatured: true,
      isPublished: false,
      coverUrl: "",
      logoUrl: "",
      videoType: "youtube",
      videoUrl: "",
      techStack: ["Next.js", "TypeScript"],
      en: {
        title: "",
        clientName: "",
        industry: "",
        summary: "",
        challenge: "",
        solution: "",
        result: "",
      },
      si: {
        title: "",
        clientName: "",
        industry: "",
        summary: "",
        challenge: "",
        solution: "",
        result: "",
      },
      links: [],
      socialWork: [],
    }
  );
  const [tab, setTab] = useState<"en" | "si">("en");
  const [msg, setMsg] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<"coverUrl" | "logoUrl" | null>(null);

  const handleImageUpload = async (
    file: File | undefined,
    field: "coverUrl" | "logoUrl"
  ) => {
    if (!file) return;
    setUploadingField(field);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("csrfToken", csrfToken);
      fd.append("file", file);
      fd.append(
        "altText",
        `${selected.en.clientName || selected.en.title || selected.slug || "Client project"} ${field === "logoUrl" ? "logo" : "preview"
        }`
      );
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok: boolean;
        media?: { publicUrl: string };
        error?: string;
      };
      if (data.ok && data.media?.publicUrl) {
        setSelected((prev) => ({ ...prev, [field]: data.media!.publicUrl }));
        setMsg(
          field === "logoUrl"
            ? "Client logo uploaded! Click Save Project to apply."
            : "Preview image uploaded! Click Save Project to apply."
        );
      } else {
        setMsg(data.error ?? "Upload failed.");
      }
    } catch {
      setMsg("Upload failed. Check file type/size.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await saveProjectAction({
        csrfToken,
        id: selected.id || undefined,
        slug: selected.slug || selected.en.title,
        isDemo: selected.isDemo,
        isFeatured: selected.isFeatured,
        isPublished: selected.isPublished,
        coverUrl: selected.coverUrl,
        logoUrl: selected.logoUrl,
        videoType: selected.videoType,
        videoUrl: selected.videoUrl,
        techStack: selected.techStack,
        en: selected.en,
        si: selected.si,
        links: selected.links,
        socialWork: selected.socialWork,
      });
      if (res.ok) {
        setMsg("Project saved & public cache revalidated!");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Live Work &amp; Case Studies Manager (Software + Social Media Growth)
          </h1>
          <p className="text-sm text-slate-400">
            Showcase live client projects, challenge/solution/result case studies, and social media channels delivered.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelected({
              id: "",
              slug: "",
              isDemo: false,
              isFeatured: true,
              isPublished: true,
              coverUrl: "",
              logoUrl: "",
              videoType: "youtube",
              videoUrl: "",
              techStack: ["Next.js", "TypeScript"],
              en: {
                title: "",
                clientName: "",
                industry: "",
                summary: "",
                challenge: "<p></p>",
                solution: "<p></p>",
                result: "<p></p>",
              },
              si: {
                title: "",
                clientName: "",
                industry: "",
                summary: "",
                challenge: "<p></p>",
                solution: "<p></p>",
                result: "<p></p>",
              },
              links: [],
              socialWork: [
                {
                  platform: "facebook",
                  handle: "",
                  profileUrl: "",
                  enSummary: "",
                  siSummary: "",
                },
              ],
            });
            setMsg(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Selector */}
      <div className="flex flex-wrap gap-2">
        {initialProjects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setSelected(p);
              setMsg(null);
            }}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${selected.id === p.id
                ? "border-orange-500 bg-orange-600 text-white"
                : "border-white/10 bg-[#0d1326] text-slate-300"
              }`}
          >
            {p.en.title} {p.isPublished ? "(Published)" : "(Draft / Unpublished)"}
          </button>
        ))}
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>{msg}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-white/10 bg-[#0d1326] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("en")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === "en" ? "bg-orange-600 text-white" : "bg-white/5 text-slate-300"
                }`}
            >
              English (EN)
            </button>
            <button
              type="button"
              onClick={() => setTab("si")}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === "si" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-300"
                }`}
            >
              සිංහල (Sinhala - SI)
            </button>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
          >
            {isPending ? "Saving..." : "Save Project"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <div>
            <label className="block text-xs text-slate-300">
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
            <label className="flex items-center gap-2 text-xs text-emerald-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.isPublished}
                onChange={(e) =>
                  setSelected({ ...selected, isPublished: e.target.checked })
                }
                className="h-4 w-4 accent-orange-600"
              />
              <span>Published on Public Site</span>
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
              <span>Spotlight on Home</span>
            </label>
          </div>
        </div>

        {/* Client Work Images (Logo + Preview Image with Placeholder Fallback) */}
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Client Logo &amp; Showcase Preview Image
              </h3>
            </div>
            <span className="font-mono text-[11px] text-emerald-300">
              Vardhel Products &amp; Client Launches
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Showcase / Preview Image (Upload or URL){" "}
                  <span className="font-mono text-[11px] font-normal text-emerald-300">
                    · Optimal: 1440 × 1500 px (tall desktop capture, WebP/JPG &lt; 400 KB)
                  </span>
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={selected.coverUrl}
                    onChange={(e) =>
                      setSelected({ ...selected, coverUrl: e.target.value })
                    }
                    placeholder="/images/reel/ransanboathouse.jpg or https://..."
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingField === "coverUrl" ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files?.[0], "coverUrl")}
                    />
                  </label>
                  {selected.coverUrl && (
                    <button
                      type="button"
                      onClick={() => setSelected({ ...selected, coverUrl: "" })}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Leave empty to use the built-in placeholder card in the homepage showcase.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200">
                  Client Logo (Upload or URL){" "}
                  <span className="font-mono text-[11px] font-normal text-emerald-300">
                    · Optimal: 256 × 256 px or 512 × 512 px (1:1 PNG/WebP)
                  </span>
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={selected.logoUrl}
                    onChange={(e) =>
                      setSelected({ ...selected, logoUrl: e.target.value })
                    }
                    placeholder="/api/media/... or https://..."
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#060913] px-3 py-2 text-xs text-white"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingField === "logoUrl" ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files?.[0], "logoUrl")}
                    />
                  </label>
                  {selected.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setSelected({ ...selected, logoUrl: "" })}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Leave empty to display an automatic monogram placeholder badge.
                </p>
              </div>
            </div>

            {/* Live Client Work Preview */}
            <div className="lg:col-span-5 space-y-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0e192c] p-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/95 p-1">
                  {selected.logoUrl ? (
                    <img
                      src={selected.logoUrl}
                      alt={selected.en.clientName || selected.en.title || "Logo"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="font-mono text-[11px] font-bold text-[#0f172a]">
                      {(selected.en.clientName || selected.en.title || selected.slug || "CL")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">
                    {selected.en.clientName || selected.en.title || "Client Name"}
                  </p>
                  <p className="truncate font-mono text-[11px] text-slate-400">
                    {selected.links[0]?.url || `vardhel.com/projects/${selected.slug || "slug"}`}
                  </p>
                </div>
              </div>

              <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0e192c] via-[#111827] to-[#064e3b]">
                {selected.coverUrl ? (
                  <img
                    src={selected.coverUrl}
                    alt={selected.en.title || "Preview"}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="text-center px-3">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                      Default Placeholder Preview
                    </span>
                    <p className="mt-1 text-xs font-bold text-white">
                      {selected.en.title || "Client Launch"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {tab === "en" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  Project Title (EN)
                </label>
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
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  Client / Business Name (EN)
                </label>
                <input
                  type="text"
                  value={selected.en.clientName}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      en: { ...selected.en, clientName: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  Industry (EN)
                </label>
                <input
                  type="text"
                  value={selected.en.industry}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      en: { ...selected.en, industry: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-orange-400">
                Executive Summary (EN)
              </label>
              <textarea
                rows={2}
                value={selected.en.summary}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    en: { ...selected.en, summary: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  The Challenge (HTML) (EN)
                </label>
                <textarea
                  rows={4}
                  value={selected.en.challenge}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      en: { ...selected.en, challenge: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  Our Solution (Software + Growth) (EN)
                </label>
                <textarea
                  rows={4}
                  value={selected.en.solution}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      en: { ...selected.en, solution: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-orange-400">
                  The Outcome / Result (EN)
                </label>
                <textarea
                  rows={4}
                  value={selected.en.result}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      en: { ...selected.en, result: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-indigo-400">
                  Project Title (සිංහල)
                </label>
                <input
                  type="text"
                  value={selected.si.title}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      si: { ...selected.si, title: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-400">
                  Client Name (සිංහල)
                </label>
                <input
                  type="text"
                  value={selected.si.clientName}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      si: { ...selected.si, clientName: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-400">
                  Industry (සිංහල)
                </label>
                <input
                  type="text"
                  value={selected.si.industry}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      si: { ...selected.si, industry: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-400">
                Summary (සිංහල)
              </label>
              <textarea
                rows={2}
                value={selected.si.summary}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    si: { ...selected.si, summary: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Social Media Growth Delivered Block (Section 6.4) */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                Social Media Growth Delivered (Facebook, TikTok, Instagram, TripAdvisor…)
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelected({
                  ...selected,
                  socialWork: [
                    ...selected.socialWork,
                    {
                      platform: "facebook",
                      handle: "",
                      profileUrl: "",
                      enSummary: "",
                      siSummary: "",
                    },
                  ],
                })
              }
              className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300"
            >
              + Add Social Channel
            </button>
          </div>

          {selected.socialWork.map((sw, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-[#060913] p-3 md:grid-cols-6 items-center"
            >
              <input
                type="text"
                placeholder="Platform (facebook/tiktok...)"
                value={sw.platform}
                onChange={(e) => {
                  const next = [...selected.socialWork];
                  next[idx] = { ...sw, platform: e.target.value };
                  setSelected({ ...selected, socialWork: next });
                }}
                className="rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="url"
                placeholder="Profile URL (https://...)"
                value={sw.profileUrl}
                onChange={(e) => {
                  const next = [...selected.socialWork];
                  next[idx] = { ...sw, profileUrl: e.target.value };
                  setSelected({ ...selected, socialWork: next });
                }}
                className="rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="What we delivered (EN)"
                value={sw.enSummary}
                onChange={(e) => {
                  const next = [...selected.socialWork];
                  next[idx] = { ...sw, enSummary: e.target.value };
                  setSelected({ ...selected, socialWork: next });
                }}
                className="md:col-span-2 rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                placeholder="What we delivered (සිංහල)"
                value={sw.siSummary}
                onChange={(e) => {
                  const next = [...selected.socialWork];
                  next[idx] = { ...sw, siSummary: e.target.value };
                  setSelected({ ...selected, socialWork: next });
                }}
                className="rounded border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-indigo-200"
              />
              <button
                type="button"
                onClick={() =>
                  setSelected({
                    ...selected,
                    socialWork: selected.socialWork.filter((_, i) => i !== idx),
                  })
                }
                className="inline-flex items-center justify-center rounded border border-red-500/30 bg-red-500/10 py-1.5 text-xs text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Live URLs */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live Project URLs</h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setSelected({
                  ...selected,
                  links: [
                    ...selected.links,
                    { label: "Visit Live Website", url: "https://", type: "LIVE_SITE" },
                  ],
                })
              }
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300"
            >
              + Add URL
            </button>
          </div>
          {selected.links.map((l, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-[#060913] p-3 md:grid-cols-4"
            >
              <input
                type="text"
                placeholder="Button Label"
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
              <button
                type="button"
                onClick={() =>
                  setSelected({
                    ...selected,
                    links: selected.links.filter((_, i) => i !== idx),
                  })
                }
                className="rounded border border-red-500/30 bg-red-500/10 py-1.5 text-xs text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
