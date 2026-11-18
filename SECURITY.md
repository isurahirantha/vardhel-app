# Code Loom — Security Policy (`SECURITY.md`)

## Supported Versions

| Version | Supported |
|---|---|
| `1.x` (Next.js App Router + MySQL 8) | ✅ Active |
| Legacy Vite SPA (`codeloom_web_fe`) | ❌ Deprecated |

---

## Reporting a Vulnerability

If you discover a security vulnerability on `codeloom.site`, please report it responsibly to:

- **Email:** `codeloom.lk@gmail.com`
- **Well-known endpoint:** `/.well-known/security.txt`

Please include steps to reproduce, affected URLs/parameters, and potential impact. We acknowledge reports within 48 hours and remediate critical/high findings immediately.

---

## Security Architecture Overview (OWASP Top 10 + ASVS Level 2)

1. **Authentication & Session Management (`src/lib/auth/`)**
   - Single Master Admin account (`SUPER_ADMIN`); no public registration, no web-based password reset, no user-management attack surface.
   - Passwords hashed with **Argon2id** (`memoryCost: 64 MiB`, `timeCost: 3`, `parallelism: 4`) + server-side HMAC-SHA256 `PASSWORD_PEPPER`.
   - Password strength enforced via `zxcvbn` (score ≥ 3, length ≥ 12, rejects brand/email substrings).
   - First login forces an immediate password change (`must_change_password = true`).
   - Uniform login response timing (runs dummy Argon2id verification on unknown email) + generic error message (`"Invalid credentials"`).
   - Brute-force lockout after 5 failed attempts (15-minute lock) + DB-backed per-IP rate limiting.
   - Optional **TOTP 2FA** (`otplib`) with AES-256-GCM encrypted secrets and 10 SHA-256 hashed one-time recovery codes.
   - Opaque 256-bit random session tokens; only the **SHA-256 hash** is stored in `admin_sessions`.
   - Cookies use `__Host-` prefix in production, `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/`, 30-minute idle timeout, and 8-hour absolute timeout. Sessions rotate on login and password change.

2. **Access Control & CSRF (`src/lib/auth/session.ts` & `src/middleware.ts`)**
   - Every mutating admin action verifies:
     1. Active DB session (`getAdminSession`)
     2. `Origin` / `Host` header match
     3. Constant-time (`crypto.timingSafeEqual`) double-submit CSRF token (`x-csrf-token`).
   - Public endpoints return strictly `is_published = true && deleted_at IS NULL` records. Customer feedback emails and IP hashes are never selected in public queries.

3. **Injection, XSS & SSRF Prevention (`src/lib/security/`)**
   - 100% parameterized Prisma ORM queries (zero raw SQL concatenation).
   - Strict Zod schemas (`.strict()`) on all API route handlers and Server Actions.
   - Rich-text HTML sanitized on save **and** on render via `sanitize-html` strict allowlist (`src/lib/security/sanitize.ts`).
   - JSON-LD safely serialized (`safeJsonLd`) escaping `<`, `>`, and `&`.
   - External URLs restricted to `https://` (`isSafeExternalUrl`), rejecting `javascript:` and `data:` URIs.
   - Server-side link health checker (`src/lib/security/ssrf.ts`) resolves DNS and blocks private, loopback, link-local, and cloud metadata IPs (`169.254.169.254`, `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`, `fc00::/7`, `fe80::/10`).

4. **Secure File Uploads (`src/lib/storage/local-storage.ts`)**
   - Binary magic-byte signature verification (`sniffMagicBytes`) + MIME check + size caps.
   - Images are re-encoded to WebP using `sharp`, stripping EXIF metadata and any embedded payloads.
   - Random UUID filenames stored outside `/public` in `/storage` with `0600` permissions and served via `/api/media/[id]` with `X-Content-Type-Options: nosniff`.
