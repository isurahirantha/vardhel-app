# Code Loom — Dynamic Bilingual Showcase & Growth Platform

> *"Your Vision, Our Framework"* — Custom Software Engineering + End-to-End Social Media Growth Partner (Sri Lanka)

Built with **Next.js 15 (App Router) + TypeScript**, **Tailwind CSS v4**, **Prisma + MySQL 8**, **next-intl (`en` & `si`)**, **React Three Fiber**, and **VAPT-grade security controls** (OWASP Top 10 + ASVS Level 2).

---

## 1. Quick Start (Local Development with Docker)

### Step 1: Configure `.env.local`
Copy `.env.example` to `.env.local` and set your secrets (including `SEED_ADMIN_PASSWORD` — never committed to Git):

```bash
cp .env.example .env.local
```

Example `.env.local` for local dev:
```env
DATABASE_URL="mysql://codeloom_app:codeloom_local_dev@localhost:3306/codeloom"
APP_URL="http://localhost:3000"
SESSION_SECRET="replace-with-64-char-random-hex-secret-0123456789abcdef0123456789"
PASSWORD_PEPPER="replace-with-32-char-random-pepper-0123456789"
IP_HASH_SALT="replace-with-32-char-random-salt-0123456789"
SEED_ADMIN_EMAIL="codeloom.lk@gmail.com"
SEED_ADMIN_PASSWORD="SetYourInitialStrongPasswordHere2026!"
REQUIRE_ADMIN_2FA="false"
```

### Step 2: Start MySQL 8, Migrate & Seed
```bash
docker compose up -d mysql
npm run db:migrate
npm run db:seed
npm run dev
```

- **Public Website (English):** `http://localhost:3000/en`
- **Public Website (Sinhala - සිංහල):** `http://localhost:3000/si`
- **Master Admin Panel:** `http://localhost:3000/admin/login`

---

## 2. NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Generate Prisma Client and build production bundle |
| `npm run start` | Start production server |
| `npm run db:migrate` | Deploy Prisma migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Seed EN + SI content, products, services, FAQs, and Master Admin |
| `npm run admin:reset-password` | Server-side CLI recovery tool to reset Master Admin password |
| `npm run lint` | Run ESLint (`--max-warnings 0`) |
| `npm run typecheck` | Run TypeScript compiler verification (`tsc --noEmit`) |
| `npm run test` | Run Vitest unit & VAPT security test suite |
| `npm run e2e` | Run Playwright responsive & bilingual E2E matrix |
| `npm run audit` | Run `npm audit --audit-level=high` |

---

## 3. Documentation Index

- [`docs/00-existing-analysis.md`](./docs/00-existing-analysis.md) — Analysis of legacy Vite project & migrated content
- [`docs/architecture.md`](./docs/architecture.md) — ERD diagram, route map, and security architecture
- [`docs/decisions.md`](./docs/decisions.md) — Architectural decision records
- [`docs/admin-guide.md`](./docs/admin-guide.md) — Step-by-step Master Admin guide
- [`docs/vapt-checklist.md`](./docs/vapt-checklist.md) — VAPT control mapping & evidence table
- [`docs/threat-model.md`](./docs/threat-model.md) — STRIDE threat model
- [`SECURITY.md`](./SECURITY.md) — Security policy & vulnerability disclosure
"# vardhel-app" 
