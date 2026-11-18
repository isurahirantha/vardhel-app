"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Copy, Check } from "lucide-react";

interface MediaItem {
  id: string;
  type: string;
  publicUrl: string;
  mime: string;
  size: number;
  altText: string;
  createdAt: string;
}

export function MediaLibraryClient({
  csrfToken,
  initialMedia,
}: {
  csrfToken: string;
  initialMedia: MediaItem[];
}) {
  const router = useRouter();
  const [altText, setAltText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !altText.trim()) return;
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("csrfToken", csrfToken);
      fd.append("altText", altText);
      fd.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
        headers: {
          "x-csrf-token": csrfToken,
        },
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        setAltText("");
        setFile(null);
        router.refresh();
      }
    } catch {
      setError("Network error while uploading");
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Media Library (Auto-WebP Optimization &amp; Magic-Byte Verification)
        </h1>
        <p className="text-sm text-slate-400">
          Images are automatically stripped of EXIF metadata and re-encoded to WebP via sharp. Alt text is mandatory for WCAG 2.2 AA accessibility.
        </p>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="rounded-2xl border border-white/10 bg-[#0d1326] p-6 space-y-4"
      >
        <h2 className="text-base font-bold text-white">
          Upload Image (JPEG/PNG/WebP) or Video (MP4/WebM)
        </h2>
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-end">
          <div>
            <label className="block text-xs text-slate-300">
              Select File (Image &le; 8MB, Video &le; 100MB)
            </label>
            <input
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300">
              Alt Text (Required for Accessibility)
            </label>
            <input
              type="text"
              required
              placeholder="Describe the image or video clearly..."
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            <span>{uploading ? "Processing & Stripping EXIF..." : "Upload & Optimize"}</span>
          </button>
        </div>
      </form>

      {/* Media Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {initialMedia.map((m) => (
          <div
            key={m.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d1326] p-4"
          >
            <div>
              <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl bg-black/40 p-2">
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.publicUrl}
                    alt={m.altText}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-mono text-orange-400">
                    VIDEO ({m.mime})
                  </span>
                )}
              </div>
              <p className="mt-3 truncate text-xs font-semibold text-white">
                {m.altText}
              </p>
              <p className="text-[11px] text-slate-400">
                {m.mime} &bull; {Math.round(m.size / 1024)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(m.id, m.publicUrl)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-1.5 text-xs text-slate-300 hover:bg-white/10"
            >
              {copiedId === m.id ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-300">URL Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
