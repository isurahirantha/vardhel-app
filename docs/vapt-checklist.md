# Code Loom — VAPT Checklist & Control Mapping

> Target: **OWASP Top 10 (2021) + OWASP ASVS Level 2**

---

## Self-Assessment & Evidence Table

| ID | Security Control | Status | Implementation File & Evidence |
|---|---|---|---|
| **11.1.1** | Argon2id password hashing + server pepper | ✅ PASS | [`src/lib/auth/password.ts`](../src/lib/auth/password.ts) (`hashPassword`, `verifyPassword`, 64 MiB memory cost) |
| **11.1.2** | Password policy (≥ 12 chars, zxcvbn ≥ 3, no brand/email) | ✅ PASS | [`src/lib/auth/password.ts`](../src/lib/auth/password.ts) (`checkPasswordStrength`) |
| **11.1.3** | No hard-coded admin password in repo/seed | ✅ PASS | [`prisma/seed.ts`](../prisma/seed.ts) (reads `process.env.SEED_ADMIN_PASSWORD` only; sets `mustChangePassword = true`) |
| **11.1.4** | Uniform timing + generic login errors + lockout | ✅ PASS | [`src/server/actions/auth.actions.ts`](../src/server/actions/auth.actions.ts) (`verifyDummyPassword`, 5 failures → 15m lock) |
| **11.1.5** | TOTP 2FA + AES-256-GCM encrypted secret + hashed recovery codes | ✅ PASS | [`src/lib/auth/totp.ts`](../src/lib/auth/totp.ts) & [`src/components/admin/security-client.tsx`](../src/components/admin/security-client.tsx) |
| **11.1.6** | Opaque 256-bit session token, SHA-256 hash in DB, `__Host-` cookie, 30m idle / 8h absolute timeout, rotation | ✅ PASS | [`src/lib/auth/session.ts`](../src/lib/auth/session.ts) (`createAdminSession`, `getAdminSession`) |
| **11.1.7** | CLI-only password recovery (`npm run admin:reset-password`) | ✅ PASS | [`scripts/reset-admin-password.ts`](../scripts/reset-admin-password.ts) |
| **11.2.1** | Server-side AuthN + AuthZ + CSRF (Origin + timingSafeEqual token) on all mutations | ✅ PASS | [`src/lib/auth/session.ts`](../src/lib/auth/session.ts) (`requireAdminMutationAuth`) |
| **11.2.2** | Public queries filter `isPublished = true && deletedAt = null`; feedback never exposes email/IP | ✅ PASS | [`src/server/services/public-content.service.ts`](../src/server/services/public-content.service.ts) (`getApprovedFeedback`) |
| **11.3.1** | Parameterized Prisma queries only (no SQLi) | ✅ PASS | [`prisma/schema.prisma`](../prisma/schema.prisma) & `src/server/**` |
| **11.3.2** | Strict Zod schemas on public & admin inputs | ✅ PASS | [`src/app/api/enquiry/route.ts`](../src/app/api/enquiry/route.ts), [`src/app/api/feedback/route.ts`](../src/app/api/feedback/route.ts) |
| **11.3.3** | Rich-text & plain-text XSS sanitization on save AND render + safe JSON-LD | ✅ PASS | [`src/lib/security/sanitize.ts`](../src/lib/security/sanitize.ts) (`sanitizeRichText`, `sanitizePlainText`, `safeJsonLd`) |
| **11.3.4** | SSRF protection (DNS lookup + private/loopback/metadata IP blocking) | ✅ PASS | [`src/lib/security/ssrf.ts`](../src/lib/security/ssrf.ts) (`isPrivateOrReservedIp`, `checkExternalLinkSafety`) |
| **11.4.1** | Upload magic-byte sniffing, size limits, sharp WebP re-encoding (EXIF stripped), outside web root | ✅ PASS | [`src/lib/storage/local-storage.ts`](../src/lib/storage/local-storage.ts) & [`src/app/api/media/[id]/route.ts`](../src/app/api/media/[id]/route.ts) |
| **11.5.1** | CSP (nonce-based), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `poweredByHeader: false` | ✅ PASS | [`src/middleware.ts`](../src/middleware.ts) & [`next.config.ts`](../next.config.ts) |
| **11.5.2** | Boot-time environment validation via Zod + PII-redacted structured logs | ✅ PASS | [`src/lib/env.ts`](../src/lib/env.ts) & [`src/lib/logger.ts`](../src/lib/logger.ts) |
| **11.6.1** | DB-backed rate limiting + Honeypot + Time-trap on public forms | ✅ PASS | [`src/lib/rate-limit.ts`](../src/lib/rate-limit.ts), [`src/components/sections/enquiry-form.tsx`](../src/components/sections/enquiry-form.tsx) |
| **11.8.1** | Multi-stage non-root `Dockerfile` + automated security test suite | ✅ PASS | [`Dockerfile`](../Dockerfile), [`tests/security/auth-and-security.test.ts`](../tests/security/auth-and-security.test.ts) |

---

## Running OWASP ZAP Baseline Scan

```bash
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://host.docker.internal:3000/en \
  -I
```
