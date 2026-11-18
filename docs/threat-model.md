# Code Loom — Threat Model (STRIDE-Lite)

---

## 1. Scope & Trust Boundaries

1. **Public Internet Visitor** → Untrusted (`/[locale]/*`, `POST /api/enquiry`, `POST /api/feedback`, `GET /api/media/[id]`)
2. **Master Admin Browser** → Authenticated via `__Host-codeloom_admin` + `x-csrf-token` (`/admin/*`, `/api/admin/*`)
3. **Next.js Application Server** → Trusted runtime (`src/server/*`, `src/lib/*`)
4. **MySQL 8 Database & `/storage` Volume** → Internal private network / filesystem

---

## 2. STRIDE Threat Matrix

| Component | Threat Category | Threat Scenario | Mitigation Implemented |
|---|---|---|---|
| **Admin Login** (`/admin/login`) | **Spoofing** | Credential stuffing or brute-forcing `codeloom.lk@gmail.com` | Argon2id (64 MiB) + server pepper, 5-attempt lockout (15m), per-IP rate limit, TOTP 2FA, uniform response timing |
| **Admin Mutations** | **Tampering / CSRF** | Cross-site request forgery tricking logged-in admin into modifying site content | `SameSite=Strict` cookies + `Origin`/`Host` header verification + constant-time double-submit CSRF token (`requireAdminMutationAuth`) |
| **Public Feedback** (`/api/feedback`) | **Repudiation / Privacy Leak** | Submitter email or IP leaked in public API/SSR payload, or unmoderated spam defacing site | Stored as `PENDING`; public query (`getApprovedFeedback`) filters `status: "APPROVED"` and explicitly omits `email` and `submittedIpHash` |
| **Rich-Text & Forms** | **Injection (XSS / SQLi)** | Stored XSS in product/project HTML or customer feedback; SQL injection in slugs | Prisma parameterized queries only; `sanitizeRichText` (strict allowlist) on save & render; `sanitizePlainText` strips all HTML on public forms |
| **Media Upload** (`/api/admin/upload`) | **Elevation of Privilege** | Uploading polyglot image/script or SVG with embedded JS | Magic-byte sniffing (`sniffMagicBytes`), SVG disallowed for uploads, images re-encoded to WebP via `sharp` (stripping EXIF/payloads), stored outside `/public` |
| **Link Health Checker** | **Information Disclosure (SSRF)** | Admin link checker pointed at `http://169.254.169.254` or internal `127.0.0.1` service | `checkExternalLinkSafety` enforces `https:`, resolves DNS via `dns.lookup`, and rejects all private/loopback/link-local/metadata IP ranges |
| **Public Forms** | **Denial of Service** | Automated bot flood on `/api/enquiry` or `/api/feedback` | DB-backed sliding-window rate limiter (`checkRateLimit`), hidden honeypot input, and client/server render time-trap |
