# VibeZone

> Everything your campus needs, in one moderated, gamified, mobile-first web app — announcements, chat, events, notes, polls, feedback, and more. Built solo, **$0 infrastructure**.

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Neon Postgres](https://img.shields.io/badge/DB-Neon%20Postgres-purple?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-red?style=flat-square&logo=socket.io)](https://socket.io/)
[![PWA](https://img.shields.io/badge/PWA-Yes-blue?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

**Docs:** [`VibeZone - PRD v2.md`](./VibeZone%20-%20PRD%20v2.md) (requirements + schema) · [`VibeZone - 8-Week Delivery Plan.md`](./VibeZone%20-%208-Week%20Delivery%20Plan.md) (execution) · [`docs/NEON.md`](./docs/NEON.md) (Neon setup) · [`docs/RUNBOOK.md`](./docs/RUNBOOK.md) (ops)

## Table of contents

- [About VibeZone](#about-vibezone)
- [Tech stack (locked decisions D1–D12)](#tech-stack-locked-decisions-d1-d12)
- [Status legend](#status-legend)
- [Features implemented](#features-implemented)
- [Architecture](#architecture)
- [Database schema overview](#database-schema-overview)
- [API reference](#api-reference)
- [Roadmap & milestones (M1–M3)](#roadmap--milestones-m1-m3)
- [Known issues & risks](#known-issues--risks)
- [Screenshots / demo](#screenshots--demo)
- [Local development](#local-development)
- [Deploying](#deploying)
- [🔐 Secrets policy](#-secrets-policy)
- [Contributing](#contributing)
- [License & acknowledgments](#license--acknowledgments)

## About VibeZone

**VibeZone** is a single-campus, mobile-first web platform that consolidates the scattered life of ~200 B.Tech students into one place: official announcements, real-time chat, events with RSVPs and reminders, a shared notes repository, daily polls with a gamified leaderboard, anonymous feedback to the admin team, a lost & found board, and a senior–junior mentorship portal.

**Why it exists:** today, campus information lives across WhatsApp groups, notice boards, and word of mouth. Official updates get buried, notes circulation is chaotic, events are missed, there is no safe channel for honest feedback, and senior–junior mentoring happens only by luck.

**Product one-liner:** *Everything your campus needs, in one moderated, gamified, mobile-friendly web app.*

- **Target audience:** ~200 B.Tech students (one campus, single-tenant).
- **Platform:** Responsive web app (installable PWA). No native app in v1.
- **Hosting (hard $0):** Vercel Hobby (Next.js, region `bom1` Mumbai) + OCI Always Free VM (`ap-mumbai-1`) for realtime, schedulers, and mail + Gmail SMTP. No paid tiers anywhere.
- **Demo logins (seed data):** `isha@pwioi.com` (student), `zoya@pwioi.com` (moderator), `ananya@pwioi.com` (senior). In dev, the OTP is printed in the terminal and shown in the login form as "Dev mode".

## Tech stack (locked decisions D1–D12)

All stack decisions are locked in the PRD decision log (D1–D12). The database moved to Neon under D12 (25 Oct 2026); the OCI VM now runs only mailer, realtime gateway, and scheduler.

| Layer | Choice | Notes |
|-------|--------|-------|
| App | Next.js 16 (App Router, Turbopack) on **Vercel Hobby**, region `bom1` (Mumbai) | Auto HTTPS + per-branch preview deploys |
| Database | **Neon Postgres** (free tier) — pooled `DATABASE_URL` for the app, direct `DIRECT_URL` for Prisma schema ops | VM no longer runs Postgres (D12) |
| Realtime | **Socket.IO gateway** on the OCI VM, WSS via `<vm-ip>.sslip.io` + Let's Encrypt | Polling fallback when WSS unavailable |
| Email | Gmail SMTP `:587` from the VM mailer (`vibezoneioi25@gmail.com`, 2FA App Password) | 500 mails/day free |
| Schedulers | `node-cron` on the VM (Asia/Kolkata) | Vercel Hobby cron is daily-only |
| URLs | `vibezone.vercel.app` + `wss://<vm-ip>.sslip.io` | Free URLs (DNS not editable for pwioi.com) |
| ORM | Prisma | Migrations, type safety, parameterized SQL |
| Compute | OCI Always Free Ampere A1 (≤ 2 OCPU / 12 GB, `ap-mumbai-1`) | Weekly keep-alive heartbeat |
| Auth | Custom OTP → httpOnly Secure SameSite=Lax session cookie (7-day sliding) | Campus email allow-list `@pwioi.com` |
| Styling | Tailwind CSS + shadcn/ui | Dark/light theme |
| Validation | Zod (shared client/server schemas) | Single source of truth |
| Analytics | GA4 + Sentry free tier + `points_ledger` | PRD §13 event taxonomy |
| Push | Web Push (VAPID keys) | iOS ≥ 16.4 PWA |
| Files | OCI Object Storage pre-signed URLs (fallback: VM volume) | Avatars, images, backup dumps |
| CI/CD | Vercel Git integration (app) + GitHub Actions → SSH `docker compose up -d` (VM) | Both free quotas |
| Monitoring | Uptime Kuma on VM + Sentry + logrotate | Free |

> **D12 (25 Oct 2026):** database moved from the VM's Postgres container to **Neon**. The VM now runs only mailer, realtime gateway and scheduler. See [`docs/NEON.md`](./docs/NEON.md).

## Status legend

| Emoji | Status | Meaning |
|-------|--------|---------|
| ✅ | Done | Implemented and shipped |
| ⏳ | In progress | Started, not yet complete |
| 🚫 | Not started | Planned but not begun |
| ⚠️ | Issue | Known problem / risk / blocked |

## Features implemented

Grouped by module. Statuses reflect the current branch `feat/professionalization`.

### Auth & Profiles
- [✅] Campus-email OTP auth (`@pwioi.com` only), 6-digit code, 10-min TTL, resend caps, lockout (FR-AUTH-001)
- [✅] One account per email; duplicate login returns existing account (FR-AUTH-002)
- [✅] Profile CRUD: unique `@handle`, display name, avatar, branch, year, bio (FR-AUTH-003)
- [✅] httpOnly Secure SameSite=Lax session cookie, 7-day sliding, sign-out-everywhere (FR-AUTH-004)
- [✅] Roles `student/senior/moderator/admin` enforced server-side (FR-AUTH-005, FR-MOD-001)
- [✅] Super-admin bootstrapping via `SUPER_ADMIN_EMAILS`; grant/revoke roles from dashboard (FR-AUTH-007, D10)
- [⚠️] Account deletion / data export (FR-AUTH-006) — P1, not yet built

### Announcements
- [✅] Moderator composer: create/edit/schedule/pin/expire/archive, sanitized rich text, optional image (FR-ANN-001)
- [✅] Public read access, SSR, cached 60 s (FR-ANN-002)
- [✅] Categories: Academic/Events/Placements/Hostel/Clubs/Urgent with Urgent badge (FR-ANN-004)
- [✅] Impressions + click-through tracking (FR-ANN-005)
- [⏳] Notify toggle → Web Push + email blast (FR-ANN-003) — P1

### Chat & DMs
- [✅] Seeded global channels `#general`, `#help`, `#placements`, `#memes`, `#random` (FR-CHAT-001)
- [✅] Socket.IO over WSS, p95 < 500 ms target; polling fallback (FR-CHAT-002)
- [✅] Message history, cursor pagination (50/page), soft-delete, edit ≤ 15 min (FR-CHAT-003)
- [✅] 1:1 DMs (FR-CHAT-004)
- [✅] Alias mode per channel with server-side mapping + audit-logged reveal (FR-CHAT-005)
- [✅] Rate limits 20 msg/min, 10 burst; max 10 new DM targets/day (FR-CHAT-006)
- [✅] Profanity/keyword filter; flagged messages enter review (FR-CHAT-007)
- [✅] One-tap report → moderation queue with ±10 message context (FR-CHAT-008)
- [⚠️] Typing indicators, presence, read receipts (FR-CHAT-010) — P1 / v1.5

### Events
- [✅] Moderator CRUD with capacity, cover image, external stream URL (FR-EVT-001)
- [✅] RSVP toggle going/maybe/not_going, capacity "Full", unique constraint (FR-EVT-002)
- [✅] T-24 h / T-1 h reminders via Web Push + email (FR-EVT-003)
- [⏳] `.ics` download per event (FR-EVT-004) — P1
- [⚠️] Admin RSVP list CSV export (FR-EVT-005) — P1

### Notes
- [✅] Submit resource (https links only), subject/branch/year/type filters, search/sort (FR-NOTES-001/002)
- [✅] Upvote once per user (FR-NOTES-003)
- [✅] `note_open` tracking, open in new tab (FR-NOTES-004)
- [✅] Broken-link report → moderation queue (FR-NOTES-005)
- [⚠️] Direct file upload to OCI Object Storage (FR-NOTES-006) — P1 / v1.5

### Polls, Games & Leaderboard
- [✅] Daily poll auto-publish 07:00 IST / close 23:00 IST (FR-PLAY-001)
- [✅] One vote per user per poll; percentages after voting (FR-PLAY-002)
- [✅] Admin draft/schedule polls (FR-PLAY-003)
- [✅] Server-side append-only `points_ledger` with daily caps + idempotency (FR-PLAY-004/006)
- [✅] Weekly (Mon 00:00 IST) + all-time leaderboard, top 10 + your rank (FR-PLAY-005)
- [⚠️] Weekly 5-question trivia quiz (FR-PLAY-007) — P1 / v1.5

### Moderation & Safety
- [✅] Report queue sorted by age, 24 h SLA (FR-MOD-002)
- [✅] Moderator actions: dismiss/delete/warn/soft-ban/restore, all audit-logged (FR-MOD-003)
- [✅] De-anonymization requires role ≥ moderator, mandatory reason, audit entry (FR-MOD-004)
- [✅] 3-strike warn → auto soft-ban; appeal screen (FR-MOD-005)
- [✅] Admin dashboard: open reports, feedback, DAU sparkline, recent bans (FR-MOD-006)

### Feedback
- [✅] Anonymous portal: category, 10–1000 char message, optional year/branch chips (FR-FB-001)
- [✅] True anonymity — no user/session linkage; salted `ip_hash` purged after 7 days (FR-FB-002)
- [✅] Honeypot + 1 submission per `ip_hash` per 24 h (FR-FB-003)
- [✅] Admin queue `open → in_review → resolved` (FR-FB-004)
- [✅] Copy: "goes to the VibeZone admin team" (D9)

### Notifications
- [✅] In-app inbox with unread count (FR-NOTIF-001)
- [✅] Web Push (VAPID) with per-category opt-in (FR-NOTIF-002)
- [⏳] Notification retention 90 days hard delete (FR-NOTIF-004) — P2

### Lost & Found (conditional — D6)
- [🚫] Posts lost/found with status open/resolved, 30-day archive (FR-LNF-001/002/003) — P1, default v1.5

### Seniors Connect (conditional — D6)
- [🚫] Expertise tags, requests, accept → auto DM channel (FR-MENT-001…004) — P1, default v1.5

### System & Experience
- [✅] Dark/light theme, system default, client-persisted (FR-SYS-001)
- [✅] Mobile-first responsive, installable PWA manifest + service worker (FR-SYS-002)
- [✅] GA4 taxonomy (§13), IP anonymization (FR-SYS-003)
- [✅] Sentry error tracking + structured logs + 5-min uptime check (FR-SYS-004)
- [⚠️] SEO/OG metadata (FR-SYS-005) — P1

### Additional modules (beyond PRD P0)
- [✅] Broadcast video streaming — live/upcoming/replay, embedded player, viewer counts
- [✅] Campus Arcade — weekly quiz, server-side scoring, one attempt/week, points
- [✅] Academic calendar, Q&A threads with accepted answers, study groups, placement resources
- [✅] Content automation — cached Daily Drop (joke API + offline fallback) on home feed

## Architecture

```mermaid
flowchart LR
    subgraph Browser["Browser / PWA"]
        A[vibezone.vercel.app HTTPS]
    end
    subgraph Vercel["Vercel Hobby — bom1 (Mumbai)"]
        B[Next.js 16 App Router · SSR · /api/* · Server Actions · Web Push · GA4 · Sentry]
    end
    subgraph Realtime["Realtime client WSS"]
        C[wss://<vm-ip>.sslip.io Socket.IO + polling fallback]
    end
    subgraph Neon["Neon Postgres — free tier"]
        D[(Pooled DATABASE_URL · Direct DIRECT_URL · TLS)]
    end
    subgraph VM["OCI Always Free VM — ap-mumbai-1 (A1 ≤2 OCPU/12GB)"]
        E[Caddy · WSS + Let's Encrypt]
        F[Socket.IO realtime gateway]
        G[node-cron scheduler Asia/Kolkata]
        H[Mailer → Gmail SMTP :587]
        I[Uptime Kuma · logrotate · keep-alive heartbeat]
    end
    subgraph ObjectStorage["OCI Object Storage (Always Free)"]
        J[Avatars · images · pg_dump backups]
    end
    subgraph Gmail["Gmail SMTP (500 mails/day)"]
        K[vibezoneioi25@gmail.com + App Password]
    end

    A -->|HTTPS| B
    C --> E
    B -->|pooled URL| D
    B -->|internal HTTP + secret| F
    B -->|/send + secret| H
    F -.-> D
    G -.-> D
    G --> H
    G -->|Web Push| Browser
    E --> F
    I --> J
    H --> K
```

**Why this split:** Vercel Hobby cannot run sub-daily cron or hold Socket.IO state, and outbound IPs are dynamic — so the OCI VM runs realtime, schedulers, and mail while Vercel serves the app. Meets every free-tier constraint at $0 (PRD §9.4).

## Database schema overview

24+ tables (Prisma schema in `prisma/schema.prisma`; CHECK constraints via `sql/harden.sql`, applied by `npm run db:harden`). Key tables:

| Table | Purpose |
|-------|---------|
| `users` | Identity, handle, role, status, expertise tags, session version |
| `email_otps` | OTP codes, attempts, TTL |
| `channels` / `channel_members` | Global/DM/mentorship channels + per-channel alias |
| `messages` / `message_reports` | Chat messages, soft-delete/edit, reports |
| `announcements` | Pin/expire/notify, view/click counts |
| `events` / `event_rsvps` | Events, capacity, reminders |
| `notes` / `note_votes` / `note_reviews` | Notes repository, upvotes, ratings |
| `polls` / `poll_votes` / `quizzes` / `quiz_attempts` | Daily polls + weekly trivia |
| `point_ledger` | Append-only gamification with daily caps + idempotency |
| `feedback` | Anonymous submissions (no `user_id`) |
| `lost_and_found` | Lost & Found posts |
| `mentorship_requests` | Seniors Connect requests |
| `notifications` / `notification_prefs` / `push_subscriptions` | In-app + Web Push |
| `user_warnings` / `content_reports` / `blocked_users` | Safety: warns, reports, blocks |
| `audit_logs` | Append-only tamper-evident log (incl. alias reveal) |
| `broadcasts` | Live/upcoming/replay streaming |
| `posts` / `post_likes` / `post_comments` / `post_bookmarks` | Social feed |
| `academic_calendar` / `questions` / `answers` / `study_groups` / `placement_resources` | Academic & Q&A modules |

Apply schema: `npm run db:push && npm run db:harden && npm run db:seed`.

## API reference

Main endpoints (App Router route handlers; all inputs Zod-validated). From PRD §11.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/request-otp` | public | Send OTP to campus email |
| POST | `/api/auth/verify-otp` | public | Verify → session cookie |
| POST | `/api/auth/logout` | session | Clear session |
| GET/PATCH | `/api/me` | session | Profile read/update |
| GET | `/api/announcements` | public | Feed (pinned first, cursor pagination) |
| POST/PATCH | `/api/announcements` | moderator+ | Create/update |
| GET/POST | `/api/channels` | session | List/join channels |
| GET | `/api/channels/:id/messages` | member | History (cursor) |
| POST | `/api/channels/:id/messages` | member | Send (rate-limited) |
| PATCH/DELETE | `/api/messages/:id` | author | Edit ≤ 15 min / soft delete |
| POST | `/api/messages/:id/report` | session | Report → queue |
| POST | `/api/dm/:userId` | session | Open/get DM channel |
| GET/POST | `/api/events`, `/api/events/:id/rsvp` | session (list public) | Events + RSVP |
| GET/POST | `/api/notes` | session (list public) | Notes CRUD + filters |
| POST | `/api/notes/:id/vote` | session | Toggle upvote |
| POST | `/api/notes/:id/open` | session | Count `note_open` |
| GET | `/api/polls/today` | session | Active poll (options only) |
| POST | `/api/polls/:id/vote` | session | Idempotent vote → percentages |
| GET | `/api/leaderboard?period=week\|all` | session | Top 10 + own rank |
| POST | `/api/feedback` | public | Anonymous submit (honeypot + rate limit) |
| GET/POST | `/api/lost-and-found` | session (list public) | CRUD-lite |
| GET/POST | `/api/mentorship/requests` | session | Browse seniors / send / respond |
| GET/POST | `/api/reports`, `/api/moderation/*` | moderator+ | Queue + actions |
| POST | `/api/moderation/reveal-alias` | moderator+ | Requires `reason` → audit log |
| GET | `/api/notifications`, POST `/read` | session | Inbox |
| POST | `/api/push/subscribe` | session | Store push subscription |

**Socket.IO events:** `join`/`leave`, `message:new` (C→S), `message:created`/`message:edited`/`message:deleted` (S→C), `typing`, `presence` (v1.5), `ack`/`error`. Auth via handshake session token.

## Roadmap & milestones (M1–M3)

Three milestones over 8 weeks (Mode A, ≈ 55 person-days P0). Status reflects branch `feat/professionalization`.

| Milestone | Window | Exit criteria | Status |
|-----------|--------|---------------|--------|
| **M1 — Core Platform** | End of Week 3 | Guest loads announcement board over HTTPS · campus-email signup → OTP → profile · super admin publishes pinned announcement · two browsers exchange realtime chat + one DM · Vercel auto-deploys on push | ✅ Done |
| **M2 — Social & Engagement** | In staging on a phone: alias mode → report → moderation queue → reveal writes audit row · RSVP + staging reminder arrives · notes search/upvote · daily poll auto-opens, leaderboard updates ≤ 5 s | ⏳ In progress |
| **M3 — Launch** | End of Week 8 | All PRD §17 acceptance criteria green · no open P0/P1 bugs · restore drill done · 5–10 student UAT signed off → go-live + tag `v1.0.0` | 🚫 Not started |

**Go/No-Go gates:** #1 end of W3 (realtime stable?) · #2 end of W5 (full report→reveal→ban chain proven) · #3 end of W6 (scope decision for W7: conditional modules yes/no).

### Conditional scope (D6)
Lost & Found, Seniors Connect, and weekly trivia default to **v1.5** unless Weeks 7–8 run ≥ 1 week ahead. Decided at Go/No-Go #3.

### Post-launch (v1.5 order)
① Lost & Found ② Seniors Connect ③ push notifications (if cut) ④ direct note uploads ⑤ typing/presence ⑥ DM block list + search ⑦ trivia + leaderboard seasons.

## Known issues & risks

- ⚠️ **Restore drill pending** — NFR-010 requires a backup restore drill before launch (RUNBOOK has a placeholder drill row; not yet executed).
- ⚠️ **Secrets unset** — several env vars still unset in Vercel/`vm/.env` (see secrets inventory in `docs/RUNBOOK.md` §6).
- ⚠️ **Gmail App Password rotation** — the App Password was shared in chat and must be rotated before launch (plan §3 Week 1; RUNBOOK §5).
- ⚠️ **No UAT yet** — 5–10 student UAT over 3 days on preview deployments is part of M3; not yet completed.
- ⚠️ **No `v1.0.0` tag** — launch tag not yet created.
- ⚠️ **Scope creep beyond P0** — Arcade, streaming, academic calendar/Q&A, study groups, placement resources, and Daily Drop are beyond PRD P0; track carefully to protect M3.
- ⚠️ **Neon autosuspend** — first query after ~5 min idle can take 1–2 s (acceptable; `DIRECT_URL` only for schema ops).
- ⚠️ **VM reclamation risk** — OCI may reclaim idle instances; weekly keep-alive heartbeat mitigates.

## Screenshots / demo

Actual image files don't exist yet — each is marked **[TODO: add screenshot]**. Place screenshots under `./screenshots/` and reference them here.

| Screen | Reference | Status |
|--------|-----------|--------|
| Landing / public announcement board | `./screenshots/landing.png` | [TODO: add screenshot] |
| Chat channel (aliases, realtime) | `./screenshots/chat.png` | [TODO: add screenshot] |
| Events list + RSVP | `./screenshots/events.png` | [TODO: add screenshot] |
| Notes repository | `./screenshots/notes.png` | [TODO: add screenshot] |
| Polls + leaderboard | `./screenshots/polls.png` | [TODO: add screenshot] |
| Moderation queue / admin dashboard | `./screenshots/moderation.png` | [TODO: add screenshot] |
| Anonymous feedback portal | `./screenshots/feedback.png` | [TODO: add screenshot] |
| Lost & Found / Seniors Connect | `./screenshots/social.png` | [TODO: add screenshot] |
| Broadcast streaming | `./screenshots/streaming.png` | [TODO: add screenshot] |
| PWA install + mobile view | `./screenshots/pwa.png` | [TODO: add screenshot] |

## Local development

```bash
# 1. Install
npm install

# 2. Env — copy and fill (LOCAL dev works with MAILER_URL empty:
#    OTP codes are printed in the terminal instead of emailed)
cp .env.example .env.local
#    → set DATABASE_URL + DIRECT_URL (Neon) and SESSION_SECRET at minimum

# 3. Database (Neon)
npm run db:push          # create/update tables (uses DIRECT_URL)
npm run db:harden        # add CHECK constraints (idempotent, sql/harden.sql)
npm run db:seed          # channels, announcements + full demo data for every module
#    demo logins: isha@pwioi.com (student), zoya@pwioi.com (moderator),
#                 ananya@pwioi.com (senior) — use the dev OTP printed in the terminal

# 4. Run
npm run dev              # http://localhost:3000
```

Sign in with any `@pwioi.com` address — in dev the code appears in the terminal (and in the login form as "Dev mode").

Available npm scripts:
- `npm run dev` — Next.js dev server (Turbopack)
- `npm run build` — `prisma generate && next build`
- `npm run db:push` — Prisma push to Neon (DIRECT_URL)
- `npm run db:harden` — apply `sql/harden.sql` CHECK constraints
- `npm run db:seed` — seed demo data
- `npm run db:reset-demo` — re-seed demo data
- `npm test` — vitest run

## Deploying

**Vercel (app):** import the repo → set region **`bom1`** → add env vars from `.env.example` (Production + Preview):
`DATABASE_URL` (pooled), `DIRECT_URL` (direct), `SESSION_SECRET`, `CAMPUS_EMAIL_DOMAINS=pwioi.com`, `SUPER_ADMIN_EMAILS`, `MAILER_URL=https://<app-domain>/api/mailer/send`, `MAILER_SECRET`, `NEXT_PUBLIC_REALTIME_URL=https://<vm-ip>.sslip.io`, `REALTIME_SECRET`, VAPID keys (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`), `NEXT_PUBLIC_APP_URL`.

Push to `main` → Vercel auto-deploys; per-branch previews serve as your UAT test bed.

**VM (mail + realtime + scheduler):** see [`docs/RUNBOOK.md`](./docs/RUNBOOK.md) — copy `vm/.env.example` → `vm/.env`, fill secrets, open OCI security list (22 key-only, 80/443 for Caddy; no database port exposed), then `docker compose up -d --build`.

VM env needs the **pooled** Neon `DATABASE_URL` (gateway and scheduler are long-running Node processes that work through PgBouncer).

## 🔐 Secrets policy

Real values go **only** into `.env.local` / `vm/.env` (gitignored) and the Vercel env UI. Never commit them, never paste them in chat.

| Secret | Lives in | Rotate |
|--------|----------|--------|
| `DATABASE_URL` (Neon pooled) | Vercel + `vm/.env` + `.env.local` | Before launch + quarterly |
| `DIRECT_URL` (Neon direct) | Vercel + `.env.local` | Before launch + quarterly |
| `SESSION_SECRET` | Vercel + `vm/.env` + `.env.local` | Before launch + quarterly |
| `MAILER_SECRET` | Vercel + `vm/.env` | Monthly |
| `REALTIME_SECRET` | Vercel + `vm/.env` | Monthly |
| VAPID keys | Vercel + `vm/.env` | On compromise |
| `SMTP_APP_PASSWORD` | **only** `vm/.env` | **Rotate before launch** (was shared in chat) |
| `CAMPUS_EMAIL_DOMAINS` | `pwioi.com` (not secret) | — |
| `SUPER_ADMIN_EMAILS` | your email (not secret) | — |

Generate `SESSION_SECRET` with: `openssl rand -hex 32`
Generate VAPID keys with: `npx web-push generate-vapid-keys`

Gmail App Password: Google Account → Security → 2-Step Verification → App passwords (16 chars, never the account password). Send a Day-1 test batch to 5 mailboxes and check inbox placement before building more.

Neon password rotation: Neon Console → Roles → reset password → update Vercel `DATABASE_URL`/`DIRECT_URL` and `vm/.env` → redeploy + `docker compose up -d`.

## Contributing

Branch naming: `feat/<FR-ID>-<short-description>`, `fix/<FR-ID>-<short-description>`, `chore/<scope>`. Example: `feat/FR-CHAT-005-alias-mode`.

PR process:
1. Open a short feature branch off `main`.
2. Self-review the diff before merging.
3. Reference FR/NFR IDs in the commit message and PR description (e.g. "Implements FR-CHAT-005; satisfies NFR-004").
4. Verify CI gates: typecheck → lint → unit tests → build → Prisma `migrate diff`.
5. Preview deployment per branch = your test bed; smoke-test on iOS Safari + Android Chrome + dark/light.

Commit convention: `<type>(<scope>): <description> [FR-XXX/NFR-XXX]`
- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance/tooling
- `docs:` documentation only

Definition of Done (self-check): Zod validation + authz rule on the route · unit/integration test for logic (points, vote idempotency, rate limits, reveal) · GA4 event if taxonomy requires it · mobile viewport + dark/light checked · FR/NFR IDs referenced · nothing pushed at night that breaks tomorrow's demo.

Sunday ritual (30 min): plan-vs-actual, cut-line decision, next week's 3 outcomes.

Bus-factor protection: push daily; keep `LOG.md` with decisions; README architecture diagram current; all secrets in Vercel env + password manager (never chat/git); runbook + verified restore.

## License & acknowledgments

**License:** No LICENSE file exists yet in the repo. Add one (recommended: MIT) before public launch.

**Acknowledgments:** Built solo on a hard-$0 stack: Vercel Hobby, Neon Postgres (free tier), OCI Always Free, Gmail SMTP, sslip.io, Tailwind CSS + shadcn/ui, Prisma, Socket.IO, Web Push (VAPID), GA4, Sentry, Uptime Kuma.

---

*Maintained on branch `feat/professionalization`. Source of truth for requirements: [`VibeZone - PRD v2.md`](./VibeZone%20-%20PRD%20v2.md); execution: [`VibeZone - 8-Week Delivery Plan.md`](./VibeZone%20-%208-Week%20Delivery%20Plan.md).*




