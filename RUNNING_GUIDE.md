# Code Loom Web Application — Setup & Run Guide

This project is built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Prisma ORM**, and **MySQL 8** (with Docker support).

---

## 1. Prerequisites

Before running the application, make sure you have installed:
- **Node.js**: v20 or v22 (recommended LTS)
- **npm** / **npx** (comes with Node.js)
- **Docker Desktop** (for running MySQL container locally)

---

## 2. Environment Configuration

The application uses environment variables for database connections, application URLs, and session secrets.

If you don't already have `.env` or `.env.local`, create one by copying the example:

```bash
# In PowerShell:
Copy-Item .env.example .env.local

# In Bash / macOS / Linux:
cp .env.example .env.local
```

### Essential Settings in `.env` / `.env.local`:
```env
# Database connection for local Docker MySQL (port 3307 as configured in docker-compose.yml):
DATABASE_URL="mysql://codeloom_app:codeloom_local_dev@localhost:3307/codeloom"

# Application Base URL
APP_URL="http://localhost:3000"

# Security & Sessions
SESSION_SECRET="replace-with-64-char-random-hex-secret-0123456789abcdef0123456789"
PASSWORD_PEPPER="replace-with-32-char-random-pepper-0123456789"
IP_HASH_SALT="replace-with-32-char-random-salt-0123456789"

# Admin Seed Account
SEED_ADMIN_EMAIL="codeloom.lk@gmail.com"
SEED_ADMIN_PASSWORD="SetYourInitialStrongPasswordHere2026!"
REQUIRE_ADMIN_2FA="false"
```

---

## 3. Starting the Local MySQL Database

The project comes with a ready-to-use MySQL 8 container in `docker-compose.yml` mapped to port `3307`:

```bash
# Start MySQL container in background
docker compose up -d mysql
```

Verify that the database container is running and healthy:
```bash
docker compose ps
```

---

## 4. Database Migration & Seeding

Once the MySQL service is up and healthy, initialize the schema and populate the default site data, services, products, and admin user:

```bash
# Run Prisma migrations
npm run db:migrate

# Seed default database content (products, services, and branding)
npm run db:seed
```

---

## 5. Starting the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be live at:
- **Public Website (English):** [http://localhost:3000/en](http://localhost:3000/en)
- **Public Website (Sinhala):** [http://localhost:3000/si](http://localhost:3000/si)
- **Master Admin Dashboard:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 6. Useful Commands & Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts local Next.js development server |
| `npm run build` | Generates Prisma client and builds for production |
| `npm run start` | Starts production server after build |
| `npm run db:migrate` | Applies Prisma migrations |
| `npm run db:seed` | Seeds database with initial data |
| `npx prisma studio` | Opens interactive database GUI in browser |
| `npm run admin:reset-password` | Resets admin password via CLI script |
| `npm run typecheck` | Runs TypeScript type verification |
| `npm run lint` | Runs ESLint checks |
