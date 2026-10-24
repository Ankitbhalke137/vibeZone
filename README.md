# VibeZone

> Everything your campus needs, in one place — announcements, chat, events, notes, polls,
> moderated anonymity and gamified participation. Built solo, **$0 infrastructure**.

**Docs:** [`VibeZone - PRD v2.md`](./VibeZone%20-%20PRD%20v2.md) (requirements) · [`VibeZone - 8-Week Delivery Plan.md`](./VibeZone%20-%208-Week%20Delivery%20Plan.md) (execution)

## Stack (locked decisions D1–D11)

| Layer | Choice |
|---|---|
| App | Next.js 15 (App Router) on **Vercel Hobby**, region `bom1` (Mumbai) |
| DB | PostgreSQL 16 (Docker) on **OCI Always Free VM**, `ap-mumbai-1`, TLS + SCRAM |
| Realtime | Socket.IO gateway on the VM (Week 3) |
| Email | Gmail SMTP :587 via VM mailer (`vibezoneioi25@gmail.com`) |
| Schedulers | node-cron on the VM (Vercel Hobby cron is daily-only) |
| URLs | `vibezone.vercel.app` + `wss://<VM_IP>.sslip.io` |

## Phase 1 status (done in this repo)

- [x] App shell: mobile-first layout, bottom nav, dark/light theme
- [x] Public landing page (SSR, no login required)
- [x] OTP auth: campus emails only (`@pwioi.com`), 6-digit code, 10-min TTL, resend caps, ban check, session cookie (7-day sliding)
- [x] Onboarding + profile pages, super-admin bootstrapping via `SUPER_ADMIN_EMAILS`
- [x] Full Prisma schema — all 24 tables (PRD §10) + `sql/harden.sql` CHECKs
- [x] Seed: system user, 5 channels, 5 announcements
- [x] VM compose: hardened Postgres (public TLS port 15432), Gmail mailer, Caddy TLS
- [ ] Weeks 2–8 per the delivery plan

## Local development

```bash
# 1. Install
npm install

# 2. Env — copy and fill (LOCAL dev works with MAILER_URL empty:
#    OTP codes are printed in the terminal instead of emailed)
cp .env.example .env.local
#    → set DATABASE_URL + SESSION_SECRET at minimum

# 3. Database (needs Docker running)
docker compose -f vm/docker-compose.yml up -d postgres   # or any local Postgres 16
npm run db:push          # create tables
npm run db:harden        # add CHECK constraints (idempotent)
npm run db:seed          # channels + announcements + system user

# 4. Run
npm run dev              # http://localhost:3000
```

Sign in with any `@pwioi.com` address — in dev the code appears in the terminal
(and in the login form as "Dev mode").

## Deploying

**Vercel (app):** import repo → set region **`bom1`** → add env vars from `.env.example`
(`DATABASE_URL`, `SESSION_SECRET`, `CAMPUS_EMAIL_DOMAINS=pwioi.com`, `SUPER_ADMIN_EMAILS`,
`MAILER_URL=https://<VM_IP>.sslip.io/send`, `MAILER_SECRET`, `NEXT_PUBLIC_APP_URL`).

**VM (data + services):** see [`docs/RUNBOOK.md`](./docs/RUNBOOK.md) —
copy `vm/.env.example` → `vm/.env`, fill secrets, `docker compose up -d --build`.

## 🔐 Secrets policy

Real values go **only** into `.env.local` / `vm/.env` (gitignored) and the Vercel
env UI. Never commit them, never paste them in chat. (The Gmail App Password
shared in chat must be rotated before launch — plan §3 Week 1.)
