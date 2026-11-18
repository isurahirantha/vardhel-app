# Code Loom — Design Decisions Log

> This document records architectural and design decisions made during the build.

---

## D001 — No DaisyUI in the new build

**Context:** Old project used DaisyUI 5 (beta) which gives a generic look.
**Decision:** Drop DaisyUI entirely. Use custom Tailwind design tokens + shadcn/ui (Radix primitives) for admin UI.
**Rationale:** The brand needs a premium, distinctive feel. DaisyUI's opinionated defaults conflict with the custom dark-first, glassmorphism aesthetic. shadcn/ui provides accessible primitives without imposing visual style.

## D002 — Translation tables per entity (not a single polymorphic table)

**Context:** Could use either per-entity translation tables or a single `translations` table with `entity_type` + `entity_id`.
**Decision:** Per-entity translation tables (`products_translations`, `services_translations`, etc.).
**Rationale:** Type safety with Prisma, referential integrity with proper FKs, better query performance (no polymorphic joins), clearer schema documentation. The trade-off is more tables, but Prisma's codegen handles this cleanly.

## D003 — Opaque DB sessions instead of JWT

**Context:** Could use JWTs (stateless) or opaque DB sessions (stateful).
**Decision:** Opaque 256-bit random tokens with SHA-256 hash stored in DB.
**Rationale:** For a single-admin system, stateless JWT advantages are negligible. DB sessions provide immediate revocation, session listing, and simpler security. No need for `jose` library complexity.

## D004 — DB-backed rate limiting (no Redis)

**Context:** Rate limiting can be done via Redis, in-memory stores, or database.
**Decision:** DB-backed rate limiting tables (`login_attempts`, `rate_limits`).
**Rationale:** Avoids an additional infrastructure dependency (Redis). For a single-admin site with moderate traffic, MySQL can handle rate-limit queries efficiently. Can be migrated to Redis later if needed.

## D005 — Local file storage with pluggable interface

**Context:** Uploads need storage. Could use S3 from day one or local filesystem.
**Decision:** Local filesystem storage behind an interface (`StorageDriver`), with S3 implementation ready to add.
**Rationale:** Simpler local development and VPS deployment. The interface (`upload`, `delete`, `getUrl`, `getStream`) makes switching to S3 a configuration change.

## D006 — next-intl for internationalisation

**Context:** Several i18n options: `next-intl`, `next-i18next`, custom solution.
**Decision:** `next-intl` with locale-prefixed routes.
**Rationale:** Best App Router integration, supports server components, middleware-based locale detection, and the pattern of `/en/...` + `/si/...` routes.

## D007 — Sinhala font: Noto Sans Sinhala

**Context:** Need a reliable Sinhala-capable font that handles conjuncts and diacritics.
**Decision:** Noto Sans Sinhala (via `next/font`) for body, with appropriate line-height (1.8+ for Sinhala).
**Rationale:** Google's Noto family has excellent Sinhala support, is well-maintained, and is available through `next/font/google`. Tested for conjunct rendering.

## D008 — TipTap for rich text editing

**Context:** Admin needs a rich text editor for product descriptions, project case studies, legal pages.
**Decision:** TipTap (built on ProseMirror).
**Rationale:** React-native, extensible, outputs clean HTML, and the output can be sanitized with a strict allowlist on both save and render.

## D009 — Single 3D hero element (R3F), desktop-only with fallback

**Context:** The spec calls for premium 3D visuals but performance must stay high.
**Decision:** One React Three Fiber canvas in the hero, lazy-loaded with `dynamic import` and `ssr: false`. Desktop-first with static/animated fallback for mobile, low-power devices, and `prefers-reduced-motion`.
**Rationale:** Balances visual impact with performance. WebGL detection gates the 3D render. Mobile users (~60% of Sri Lankan traffic) get a lightweight animated alternative.

## D010 — Content versioning: last 10 revisions for rich text

**Context:** Full version control (every field, every save) vs. lightweight revisions.
**Decision:** Store last 10 revisions of rich-text fields only (products, services, projects, pages) in a `content_revisions` table.
**Rationale:** Covers the most common "I want to undo that edit" scenario without the storage overhead of versioning every field. Implemented as a simple JSON snapshot with admin_id and timestamp.
