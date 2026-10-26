# VibeZone

> Everything your campus needs, in one place — announcements, chat, events, notes, polls,
> moderated anonymity and gamified participation. Built solo, **$0 infrastructure**.

**Docs:** [`VibeZone - PRD v2.md`](./VibeZone%20-%20PRD%20v2.md) (requirements) · [`VibeZone - 8-Week Delivery Plan.md`](./VibeZone%20-%208-Week%20Delivery%20Plan.md) (execution) · [`docs/NEON.md`](./docs/NEON.md) (database setup)

## Stack (locked decisions D1–D12)

| Layer | Choice |
|---|---|
| App | Next.js 15 (App Router) on **Vercel Hobby**, region `bom1` (Mumbai) |
| DB | **Neon Postgres** (free tier) — pooled URL for the app, direct URL for Prisma |
| Realtime | Socket.IO gateway on the OCI Always Free VM (WSS via `sslip.io`) |
| Email | Gmail SMTP :587 via the VM mailer (`vibezoneioi25@gmail.com`) |
| Schedulers | node-cron on the VM (Vercel Hobby cron is daily-only) |
| URLs | `vibezone.vercel.app` + `wss://<VM_IP>.sslip.io` |

> **D12 (25 Oct 2026):** the database moved from the VM's Postgres container to **Neon**.
> The VM now runs only mailer, realtime gateway and scheduler. See [`docs/NEON.md`](./docs/NEON.md).

## What's implemented

- [x] App shell: mobile-first layout, bottom nav, dark/light theme
- [x] Public landing page + public announcement board (SSR, cached 60 s)
- [x] OTP auth: campus emails only (`@pwioi.com`), 6-digit code, 10-min TTL, resend caps, ban check, session cookie (7-day sliding), sign-out-everywhere
- [x] Onboarding + profile pages, super-admin bootstrapping via `SUPER_ADMIN_EMAILS`
- [x] Full Prisma schema (PRD §10 + moderation/report extensions) + `sql/harden.sql` CHECKs
- [x] Announcements: moderator composer, scheduling, pin/expire/archive, view/click tracking
- [x] Chat: global channels, DMs, persistent aliases, profanity filter, reports, edit/delete, rate limits, Socket.IO + polling fallback
- [x] Events: public list/detail, RSVP with capacity, `.ics`, T-24 h/T-1 h reminders, attendance points
- [x] Notes: submit/search/filter/sort, upvotes, `note_open`, broken-link reports
- [x] Polls + points engine + weekly/all-time leaderboard (IST boundaries)
- [x] Moderation: report queue, warn ×3 auto-ban, delete, reveal-alias with audit log
- [x] Anonymous feedback portal with honeypot + 1/day ip-hash limit + admin queue
- [x] Notifications: in-app inbox, preferences, Web Push (VAPID)
- [x] Lost & Found + Seniors Connect (P1) — request → accept → mentorship DM
- [x] Admin dashboard: reports, feedback, users/roles, events, polls, announcements
- [x] PWA manifest/service worker, GA4 taxonomy, security headers

## Local development

```bash
# 1. Install
npm install

# 2. Env — copy and fill (LOCAL dev works with MAILER_URL empty:
#    OTP codes are printed in the terminal instead of emailed)
cp .env.example .env.local
#    → set DATABASE_URL + DIRECT_URL (Neon) and SESSION_SECRET at minimum

# 3. Database (Neon)
npm run db:push          # create/update tables
npm run db:harden        # add CHECK constraints (idempotent)
npm run db:seed          # channels + announcements + events + notes + polls

# 4. Run
npm run dev              # http://localhost:3000
```

Sign in with any `@pwioi.com` address — in dev the code appears in the terminal
(and in the login form as "Dev mode").

## Deploying

**Vercel (app):** import repo → set region **`bom1`** → add env vars from `.env.example`
(`DATABASE_URL` pooled, `DIRECT_URL` direct, `SESSION_SECRET`, `CAMPUS_EMAIL_DOMAINS=pwioi.com`,
`SUPER_ADMIN_EMAILS`, `MAILER_URL=https://<VM_IP>.sslip.io/send`, `MAILER_SECRET`,
`NEXT_PUBLIC_REALTIME_URL=https://<VM_IP>.sslip.io`, `REALTIME_SECRET`, VAPID keys,
`NEXT_PUBLIC_APP_URL`).

**VM (mail + realtime + scheduler):** see [`docs/RUNBOOK.md`](./docs/RUNBOOK.md) —
copy `vm/.env.example` → `vm/.env`, fill secrets, `docker compose up -d --build`.

## 🔐 Secrets policy

Real values go **only** into `.env.local` / `vm/.env` (gitignored) and the Vercel
env UI. Never commit them, never paste them in chat. (The Gmail App Password
shared in chat must be rotated before launch — plan §3 Week 1.)
