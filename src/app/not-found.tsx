import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm font-bold text-orange-500">404</p>
      <h1 className="mt-2 text-3xl font-bold text-white">
        Page Not Found / පිටුව හමු නොවීය
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/en"
          className="rounded-full bg-orange-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
        >
          Back to Home (EN)
        </Link>
        <Link
          href="/si"
          className="rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
        >
          මුල් පිටුවට (සිංහල)
        </Link>
      </div>
    </div>
  );
}
