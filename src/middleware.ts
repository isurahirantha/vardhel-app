import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

function buildSecurityHeaders(nonce: string, isAdmin: boolean): Headers {
  const headers = new Headers();
  const isProd = process.env.NODE_ENV === "production";

  // Strict CSP (Section 11.3 & 11.5)
  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://js.hcaptcha.com`
    : `'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://js.hcaptcha.com`;

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://i.ytimg.com https://vumbnail.com",
    "font-src 'self' data:",
    "connect-src 'self' https://challenges.cloudflare.com https://hcaptcha.com",
    "media-src 'self' blob:",
    "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://challenges.cloudflare.com https://newassets.hcaptcha.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  headers.set("Content-Security-Policy", csp);
  headers.set("x-nonce", nonce);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (isProd) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  if (isAdmin) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return headers;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isApiRoute =
    pathname.startsWith("/api") || pathname.startsWith("/.well-known");

  // Optional ADMIN_IP_ALLOWLIST check (Section 11.1)
  if (isAdminRoute && process.env.ADMIN_IP_ALLOWLIST) {
    const allowlist = process.env.ADMIN_IP_ALLOWLIST.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";
    if (allowlist.length > 0 && !allowlist.includes(clientIp)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // Server-side cookie presence check for protected /admin routes (full DB verification runs in layout/action)
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Host-codeloom_admin"
        : "codeloom_admin";
    const sessionToken = request.cookies.get(cookieName)?.value;
    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  let response: NextResponse;
  if (isAdminRoute || isApiRoute || pathname === "/sitemap.xml" || pathname === "/robots.txt") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  } else {
    response = handleI18nRouting(request);
  }

  const secHeaders = buildSecurityHeaders(nonce, isAdminRoute);
  secHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
