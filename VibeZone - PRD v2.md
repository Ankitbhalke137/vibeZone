# VibeZone — Product Requirements Document (PRD)

**Version:** 2.1  ·  **Date:** 24 Oct 2026  ·  **Status:** Ready for build — revised for **solo build + hard-$0 stack** (decisions D5–D10)
**Supersedes:** `VibeZone - Finalized Product Requirements Document (PRD) & Database Schema.md` (v1 draft)
**Companion document:** `VibeZone - 8-Week Delivery Plan.md`

> **Plan update (25 Oct 2026) — D12: Database = Neon Postgres (free tier).**
> The database is no longer the VM's Postgres container. The app uses Neon's
> **pooled** URL (`DATABASE_URL`) and **direct** URL (`DIRECT_URL`, for Prisma
> schema operations). The OCI VM now runs only the mailer, Socket.IO realtime
> gateway and scheduler. Wherever D1/D7/§9/§10 below mention "Postgres on the
> OCI VM", read **Neon Postgres**. Setup: `docs/NEON.md`. Everything else in
> this PRD is unchanged.


---

## 0. Decision Log (locked)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | Database / VM | **PostgreSQL 16 in Docker on an OCI Always Free Ampere A1 VM** (≤ 2 OCPU / 12 GB, home region `ap-mumbai-1`), managed from the OCI Console | Relational fit for polls/votes/mentorship/points; keeps everything inside your free Oracle tenancy |
| D2 | Live broadcast streaming | **Deferred to v2**; v1 events can link out to YouTube Live/Meet | WebRTC/HLS adds cost, scale and moderation complexity that 200 users don't need yet |
| D3 | Timeline | **8 weeks from kickoff, 3 milestones** (no fixed launch date) | Solo pace table in the delivery plan; cut lines pre-defined |
| D4 | Anonymity model | **Moderated aliases** (forum/DMs, identity mapped server-side) + **true anonymity only in the feedback portal** | Gives students a safe voice while keeping abuse tractable |
| D5 | Hosting & cost | **Hard $0, no paid tier anywhere:** Vercel Hobby (Next.js, region `bom1` Mumbai) for the app + the OCI Always Free VM for everything backend + Gmail SMTP + free URLs (`vibezone.vercel.app`, `<ip>.sslip.io`) | Verified against free-tier limits (§9.4). Only possible future cost: optional domain ~$10–15/yr. OCI keeps a card on file at signup but never charges it |
| D6 | Team | **Solo builder** | P0-only ≈ 55 person-days; **Lost & Found + Seniors Connect default to v1.5** unless Weeks 7–8 run ahead; cut lines in plan §7 |
| D7 | Database exposure | **Hardened public Postgres** on the VM (TLS required, non-standard port, SCRAM, `pg_hba hostssl`, capped connections, least-privilege role) | Vercel Hobby has no static IPs to allow-list; accepted as documented risk R3 |
| D8 | Email | **`vibezoneioi25@gmail.com`** (dedicated) → SMTP :587, 2FA App Password, 500 mails/day free — sent from the VM mailer | No paid email service; port 587 guaranteed open from the VM |
| D9 | Feedback routing | **Admin dashboard only** — no formal faculty channel; copy says "goes to the VibeZone admin team" | Confirmed by super admin |
| D10 | Roles | **Super admin (founder) is the only initial `admin`**; grants/revokes `moderator` from the dashboard; alias de-anonymization requires a role granted by the super admin | Confirmed by super admin |
| D11 | Campus email & URL | OTP allow-list = **`@pwioi.com`** (`CAMPUS_EMAIL_DOMAINS=pwioi.com`); app stays on **`vibezone.vercel.app`** + `<ip>.sslip.io` | pwioi.com exists but its DNS is not editable by us → free URLs confirmed (D5/D9); revisit a custom domain only if DNS access is granted later |
| D11 | Campus email & URL | OTP allow-list = **`@pwioi.com`** (`CAMPUS_EMAIL_DOMAINS=pwioi.com`); app stays on **`vibezone.vercel.app`** + `<ip>.sslip.io` | pwioi.com exists but its DNS is not editable by us → free URLs confirmed (D5/D9); revisit a custom domain only if DNS access is granted later |
| D12 | Database (supersedes D1/D7) | **Neon Postgres free tier** — pooled `DATABASE_URL` for the app, direct `DIRECT_URL` for Prisma; TLS enforced by Neon. VM keeps mailer/realtime/scheduler only | Managed backups/patching, no public Postgres port, serverless-friendly pooling; stays $0 |

---

## 1. Executive Summary

**VibeZone** is a single-campus, mobile-first web platform that consolidates the scattered life of ~200 B.Tech students into one place: official announcements, real-time chat, events with RSVPs and reminders, a shared notes repository, daily polls with a gamified leaderboard, anonymous feedback to the admin team, a lost & found board, and a senior–junior mentorship portal.

**Why it exists:** today, campus information lives across WhatsApp groups, notice boards, and word of mouth. Official updates get buried, notes circulation is chaotic, events are missed, there is no safe channel for honest feedback, and senior–junior mentoring happens only by luck.

**Product one-liner:** *Everything your campus needs, in one moderated, gamified, mobile-friendly web app.*

- **Target audience:** ~200 B.Tech students (one campus, single-tenant).
- **Platform:** Responsive web app (installable PWA). No native app in v1.
- **Hosting (hard $0 — D5):** Vercel Hobby (Next.js, region `bom1` Mumbai) + one OCI Always Free VM in `ap-mumbai-1` (Postgres, realtime, schedulers, mail, backups, monitoring) + Gmail SMTP. No paid tiers anywhere.
- **Differentiators:** (1) moderated anonymity, (2) participation gamification, (3) official + community content side by side.

---

## 2. Problem Statement, Goals & Success Metrics

### 2.1 Problems addressed

| ID | Problem | VibeZone answer |
|----|---------|-----------------|
| P1 | Official notices lost in chat groups | Pinned, categorized Announcement Board readable by anyone |
| P2 | Notes shared haphazardly, re-requested every semester | Searchable, subject-wise notes index with Drive links |
| P3 | Events missed | Central events list, RSVPs, 24 h/1 h reminders |
| P4 | No safe way to give feedback | Moderated anonymous feedback portal → admin dashboard |
| P5 | Lost items never find their way back | Lost & Found board with status tracking |
| P6 | Seniors and juniors don't connect intentionally | Seniors Connect mentorship matching |
| P7 | Community goes quiet after week 2 | Daily polls + points + leaderboard habit loop |

### 2.2 Product goals (v1)

| ID | Goal | Target |
|----|------|--------|
| G1 | Adoption | ≥ 70 % of the 200 students verify their campus email within 6 weeks of launch |
| G2 | Habit | DAU/WAU ≥ 25 %; ≥ 40 % of weekly actives vote in the daily poll |
| G3 | Utility | ≥ 30 notes resources and ≥ 90 % of official announcements published in VibeZone (not just notice boards) by week 4 |
| G4 | Safety | Zero unresolved P1 abuse incidents; every report triaged within 24 h |
| G5 | Quality | p75 LCP < 2.5 s on mobile 4G; uptime ≥ 99.5 % during term |

### 2.3 Success metrics (instrumented in GA4 + internal tables)

| KPI | Definition | Target (6 weeks post-launch) |
|-----|-----------|------------------------------|
| Verified signups | Unique emails that completed OTP | ≥ 140 |
| Activation rate | Verified users who set up a profile + perform 1 core action in 7 days | ≥ 60 % |
| WAU / DAU | Distinct users with any qualifying event | ≥ 100 WAU, ≥ 25 DAU |
| Poll participation | Votes ÷ WAU on poll days | ≥ 40 % |
| Notes opens | `note_open` events per week | ≥ 100 |
| Event RSVP rate | RSVPs ÷ event detail views | ≥ 35 % |
| Mentorship pairs | Requests accepted in first month (KPI starts at v1.5 — D6) | ≥ 15 in first month after v1.5 |
| Feedback volume | Anonymous submissions / month | ≥ 20 (signal of trust) |
| Report SLA | Reports triaged within 24 h | ≥ 95 % |

---

## 3. Non-Goals (explicitly out of scope for v1)

- ❌ Native iOS/Android apps (PWA only).
- ❌ Native live video streaming (external link out instead — see D2).
- ❌ Hosting note files directly (external Drive/OneDrive links only; direct uploads → v1.5 via OCI Object Storage).
- ❌ Multi-college / multi-tenant support.
- ❌ LMS features: attendance, grades, assignments, submissions.
- ❌ Payments, ticketing, food ordering.
- ❌ Algorithmic feed / stories / reels-style content.
- ❌ Faculty-grade CMS or approval workflows.
- ❌ i18n (English only).
- ❌ End-to-end encrypted messaging (moderated platform requires server-side visibility).

---

## 4. Users & Personas

| Persona | Description | Primary needs | Key screens |
|---------|-------------|---------------|-------------|
| **Junior (Freshman/Sophomore)** | Uses phone 90 % of the time; joins for notes, memes, events | Quick info, anonymity option, points/gamification | Home, Chat, Notes, Events, Leaderboard |
| **Senior (Mentor)** | Final/third year, opted into mentoring | Low-friction mentoring, status among peers | Seniors Connect, Chat, Profile |
| **Moderator / Admin** | Faculty or trusted student volunteer | Publish fast, moderate safely, see feedback | Admin Dashboard, Announcements, Moderation Queue |
| **Guest (unauthenticated visitor)** | Incoming student, parent, or casual visitor | Read official info without signing up | Public Announcements, Public Events |

---

## 5. Core User Journeys

**J1 — First run (5-minute activation)**
1. Lands on public announcement board (no login) → reads 2 notices.
2. Taps "Get started" → enters campus email → receives 6-digit OTP (valid 10 min).
3. Verifies → picks handle, avatar preset, branch/year → profile created.
4. Seeded welcome message + daily poll prompt appear → first poll vote earns points → appears on leaderboard.

**J2 — Daily habit loop**
1. Opens PWA → sees today's poll + new announcements badge.
2. Votes (5 pts) → sees results.
3. Skims `#general`, sends 1–2 messages (activity pts, capped).
4. Checks leaderboard position → re-opens next day.

**J3 — Anonymous participation**
1. In a channel, toggles **Alias mode** → writes under an auto alias (e.g. `SilentFox42`).
2. Real identity stays mapped server-side; a moderator can reveal it only through an audit-logged action.
3. Alternatively submits feedback through the **anonymous portal** — no handle, no session linkage stored, honeypot + rate limited.

**J4 — Get help from a senior**
1. Opens Seniors Connect → filters seniors by tag (DSA, placements, projects).
2. Sends a request with a short message → senior accepts → a mentorship DM channel opens automatically.

**J5 — Event attendance loop**
1. Browses events → RSVPs → `.ics` export optional.
3. Receives push 24 h and 1 h before → attends → organizer marks/RSVP auto-closes.

**J6 — Trust & safety loop**
1. Student reports an abusive message → report enters moderation queue.
2. Moderator dismisses / deletes / warns / bans.
3. For alias abuse, moderator may **reveal identity** (reason required, written to audit log).
4. Three strikes → soft-ban; user sees a "contact admin" screen.

---

## 6. Scope

### 6.1 In scope — v1 (8 weeks)

| Priority | Module | Summary |
|----------|--------|---------|
| P0 | Auth & Profiles | Campus-email OTP, profiles, roles, sessions |
| P0 | Announcement Board | Moderator publishing, public read, pinning, push blast |
| P0 | Chat & DMs | Realtime channels + 1:1 DMs + moderated aliases |
| P0 | Events | Listings, RSVP, reminders, external stream link |
| P0 | Notes Repository | Subject-wise external links, search/filter, upvotes |
| P0 | Polls & Leaderboard | Daily poll, points engine, weekly + all-time leaderboard |
| P0 | Moderation & Safety | Reports, queue, bans, audit log, de-anonymization |
| P0 | Feedback Portal | Anonymous submissions → admin dashboard |
| P0 | Notifications | In-app inbox + Web Push, preferences |
| P1 | Lost & Found | Posts with images, open/resolved status, 30-day archive |
| P1 | Seniors Connect | Expertise tags, requests, accepted → auto DM |
| P1 | System | Dark/light mode, PWA install, GA4, error tracking |

**Solo-build note (D6):** P0 = must ship in the 8-week v1. P1 rows above are *aspirational*: **Lost & Found** and **Seniors Connect** default to v1.5 unless Weeks 7–8 run ahead; "System" keeps only dark mode + PWA install + GA4 + error tracking.

### 6.2 v1.5 (weeks 9–12, post-launch)

- **Deferred from v1 unless ahead (D6):** Lost & Found module, Seniors Connect module, weekly trivia quiz (FR-PLAY-007).
- Direct note file uploads to OCI Object Storage (pre-signed URLs).
- Typing indicators, read receipts, presence dots.
- Block list for DMs; message search.
- Trivia quiz expansion + monthly seasons for the leaderboard.
- Announcement email digests; `.ics` auto-subscribe feed.
- Content automation cron (memes/jokes API) for `#memes` if engagement sags.

### 6.3 v2 (backlog, requires new approval)

- Native broadcast video streaming (HLS via a managed provider or WebRTC for ≤ 50 viewers) + recordings.
- Mobile wrappers / push through a native shell.
- Reaction threads on announcements; polls embedded in announcements.
- Multi-campus support.

---

## 7. Functional Requirements

Requirement IDs are stable and used in the delivery plan and QA cases. **P0 = must ship in v1, P1 = should ship, P2 = could ship.**

### 7.1 FR-AUTH — Authentication & Profiles

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AUTH-001 | Sign up / log in with a campus email matching allow-listed domains (config `CAMPUS_EMAIL_DOMAINS=pwioi.com`, case-insensitive suffix match); 6-digit OTP, 10-min TTL, max 3 resends, 10-min lockout after abuse | P0 |
| FR-AUTH-002 | One account per email; duplicate login returns the existing account | P0 |
| FR-AUTH-003 | Profile: unique `@handle`, display name, avatar (upload to OCI Object Storage or preset), branch, year, short bio | P0 |
| FR-AUTH-004 | Session = httpOnly, Secure, SameSite=Lax cookie; 7-day sliding expiry; "Sign out everywhere" | P0 |
| FR-AUTH-005 | Roles: `student`, `senior`, `moderator`, `admin` — authorization checked server-side on every mutating route | P0 |
| FR-AUTH-006 | Account deletion / data export request → admin queue | P1 |
| FR-AUTH-007 | Admin can grant/revoke roles and soft-ban users from the dashboard | P0 |

**AC-AUTH (acceptance criteria)**
- Given an allow-listed email, When OTP is entered correctly, Then user reaches onboarding within 3 s.
- Given a non-campus email, Then sign-up is rejected with a clear message (no account created).
- Given an expired OTP (>10 min), Then it fails with "Request a new code" and no session is issued.

### 7.2 FR-ANN — Announcement Board

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-ANN-001 | Moderators/admins create, edit, schedule (`publish_at`), pin, expire, and archive announcements with title, category, sanitized rich-text body, optional image | P0 |
| FR-ANN-002 | Public read access — the announcement list and detail render for unauthenticated visitors (SSR, cached 60 s) | P0 |
| FR-ANN-003 | Optional "notify" toggle → Web Push + email blast to verified users | P1 |
| FR-ANN-004 | Categories: Academic, Events, Placements, Hostel, Clubs, Urgent; Urgent gets visual badge | P0 |
| FR-ANN-005 | Impressions + click-through tracked (`announcement_view`, `announcement_click`) | P0 |

### 7.3 FR-CHAT — Channels, DMs & Aliases

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-CHAT-001 | Seeded global channels: `#general`, `#help`, `#placements`, `#memes`, `#random`; admin may create/archive channels | P0 |
| FR-CHAT-002 | Realtime delivery via Socket.IO over WSS, target p95 < 500 ms on campus Wi-Fi | P0 |
| FR-CHAT-003 | Message history with cursor pagination (50/page), soft-delete, edit within 15 min | P0 |
| FR-CHAT-004 | 1:1 DMs started from a profile or mentorship acceptance | P0 |
| FR-CHAT-005 | **Alias mode** (per channel): toggle to post under an auto-generated alias; server persists alias→user mapping; moderators reveal identity only via an audit-logged action with reason | P0 |
| FR-CHAT-006 | Rate limits: 20 messages/min, 10 messages/10 s burst; DM to max 10 new users/day | P0 |
| FR-CHAT-007 | Server-side keyword/profanity filter (config list) → message flagged for review before send or auto-edited (configurable) | P0 |
| FR-CHAT-008 | Report any message → enters moderation queue with context (±10 messages) | P0 |
| FR-CHAT-009 | Announcements inside `#help` support markdown-lite (bold, links, lists) with link sanitization | P1 |
| FR-CHAT-010 | Typing indicators, presence, read receipts | P1 (v1.5) |

**AC-CHAT**
- Two browsers on different devices see a message in < 1 s without refresh.
- An aliased message reveals identity to a moderator only after the reason is recorded in `audit_logs`.
- Message #21 within a minute is rejected client- and server-side with a friendly throttle message.

### 7.4 FR-EVT — Events

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-EVT-001 | Moderator CRUD: title, description, location, `starts_at`/`ends_at`, capacity, cover image, category, `external_stream_url` (v1 stand-in for live video) | P0 |
| FR-EVT-002 | RSVP toggle (going / not going); capacity shows "Full" when reached; unique constraint prevents double votes | P0 |
| FR-EVT-003 | Automated reminders at T-24 h and T-1 h via Web Push (+email if enabled) | P0 |
| FR-EVT-004 | Public event list + detail; `.ics` download per event | P1 |
| FR-EVT-005 | Admin sees RSVP list per event (export CSV) | P1 |

### 7.5 FR-NOTES — Notes & Study Repository

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-NOTES-001 | Submit a resource: title, description, subject, branch, year, semester, type (Notes / PYQ / Lab / Slides / Other), **https link only** (Google Drive etc.) | P0 |
| FR-NOTES-002 | Browse with search + filters (subject, branch, year, type) and sort (newest, top-voted) | P0 |
| FR-NOTES-003 | Upvote once per user (unique constraint); removes own vote | P0 |
| FR-NOTES-004 | Opening the link fires `note_open` and opens in a new tab | P0 |
| FR-NOTES-005 | Report a broken/misleading link → moderation queue | P0 |
| FR-NOTES-006 | Direct file upload to OCI Object Storage | P1 (v1.5) |

### 7.6 FR-PLAY — Polls, Games & Leaderboard

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-PLAY-001 | Daily poll published automatically at 07:00 IST, closes 23:00 IST (in-app cron) | P0 |
| FR-PLAY-002 | One vote per user per poll (DB unique constraint); after voting, live percentages are shown | P0 |
| FR-PLAY-003 | Admin can draft/schedule polls (question + 2–6 options) | P0 |
| FR-PLAY-004 | **Points engine**: server-side only, append-only `points_ledger`, per-action daily caps (see Appendix A) | P0 |
| FR-PLAY-005 | Leaderboard: weekly (auto-reset Monday 00:00 IST) + all-time; top 10 + "your rank" | P0 |
| FR-PLAY-006 | Anti-gaming: one account per campus email, daily caps, rate limits, server-computed scores, flagging for review on anomalies | P0 |
| FR-PLAY-007 | Weekly 5-question campus trivia (seeded question bank) with points | P1 |

**AC-PLAY**
- Voting twice on the same poll returns 409 and does not add points twice.
- The leaderboard changes within 5 s of a qualifying action.

### 7.7 FR-FB — Anonymous Feedback Portal

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-FB-001 | Form: category (Academic / Facilities / Hostel / Clubs / Other), message 10–1000 chars, optional non-identifying chips (year, branch) | P0 |
| FR-FB-002 | **True anonymity**: no user id, handle or session id stored; only a salted `ip_hash` for abuse control, purged after 7 days | P0 |
| FR-FB-003 | Honeypot field + max 1 submission per ip_hash per 24 h + CAPTCHA-free bot trap | P0 |
| FR-FB-004 | Submissions land in an admin-only queue with status `open → in_review → resolved`; notes are internal only | P0 |
| FR-FB-005 | No reply channel to the submitter in v1 (by design — anonymity) | P0 |

### 7.8 FR-LNF — Lost & Found

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-LNF-001 | Post with type (`lost`/`found`), item name, description, location, date, optional image (Object Storage), optional contact info, status `open/resolved` | P1 |
| FR-LNF-002 | Filter by type/location/recency; "Mark as resolved" by author or moderator | P1 |
| FR-LNF-003 | Auto-archive to history after 30 days if still open | P2 |

### 7.9 FR-MENT — Seniors Connect

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-MENT-001 | Seniors opt in with expertise tags (DSA, Placements, Higher studies, Projects, Design, Startup) + short availability note | P1 |
| FR-MENT-002 | Juniors browse/filter and send a request with a message (max 5 open requests) | P1 |
| FR-MENT-003 | Senior accepts/rejects → acceptance auto-creates a `mentorship` DM channel and notifies both parties | P1 |
| FR-MENT-004 | Limits: 10 active mentees per senior; pending requests auto-expire after 14 days | P1 |
| FR-MENT-005 | Either party can end a pairing; feedback-free in v1 | P2 |

### 7.10 FR-NOTIF — Notifications

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-NOTIF-001 | In-app notification center with unread count (DM, announcement, event reminder, poll open, mentorship, moderation outcome) | P0 |
| FR-NOTIF-002 | Web Push (VAPID) with per-category opt-in/opt-out persisted per user | P0 |
| FR-NOTIF-003 | Event reminders T-24 h / T-1 h; daily digest of new announcements (opt-in) | P1 |
| FR-NOTIF-004 | Notification retention 90 days, then hard delete | P2 |

### 7.11 FR-MOD — Moderation, Roles & Safety

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-MOD-001 | Roles with server-side enforcement on every mutating route: `student < senior < moderator < admin` | P0 |
| FR-MOD-002 | Report object on messages, notes, lost&found, and feedback-flagged content; queue sorted by age, SLA 24 h | P0 |
| FR-MOD-003 | Moderator actions: dismiss, delete content, warn (in-app), soft-ban, restore — all write to `audit_logs` | P0 |
| FR-MOD-004 | De-anonymization (alias reveal) requires role ≥ moderator, a mandatory reason, and an audit entry | P0 |
| FR-MOD-005 | Three strikes (warns) → automatic soft-ban; banned users see an appeal screen with contact info | P0 |
| FR-MOD-006 | Admin dashboard home: open reports, open feedback, pending announcements, DAU sparkline, recent bans | P0 |

### 7.12 FR-SYS — System & Experience

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-SYS-001 | Dark/light theme toggle, defaults to `system`, persisted client-side | P0 |
| FR-SYS-002 | Mobile-first responsive layout; installable PWA (manifest, icons, offline shell for static pages) | P0 |
| FR-SYS-003 | Google Analytics 4 with the event taxonomy in §13; IP anonymization on | P0 |
| FR-SYS-004 | Error tracking (Sentry free tier) + structured server logs + uptime check every 5 min | P0 |
| FR-SYS-005 | SEO/OG metadata for public announcement & event pages | P1 |
| FR-SYS-006 | Content automation cron (external meme/joke APIs) feeding `#memes` | P2 (v1.5) |

---

## 8. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-001 | Performance | p75 LCP < 2.5 s (mobile 4G); API p95 < 500 ms; realtime delivery p95 < 500 ms |
| NFR-002 | Capacity | Comfortably handle 200 registered users, 200 concurrent sessions, 2 000 messages/day |
| NFR-003 | Availability | ≥ 99.5 % monthly during term; planned maintenance windows only in off-hours |
| NFR-004 | Security | OWASP ASVS L1: HTTPS everywhere (Let's Encrypt), CSP + HSTS + X-Frame-Options headers, Zod validation on all inputs, parameterized queries (Prisma), secrets in env/OCI Vault (never in git), file uploads scanned + MIME-restricted |
| NFR-005 | AuthN/AuthZ | Every API route declares its auth requirement; role checks enforced server-side; no trusting client-provided identity |
| NFR-006 | Privacy | Campus data never sold or shared; feedback stores zero PII; `ip_hash` purged in 7 days; notification content retains 90 days; deletion/export requests honored ≤ 7 days |
| NFR-007 | Accessibility | WCAG 2.1 AA for core flows (login, announcements, chat, events, notes); keyboard navigable; min touch target 44 px |
| NFR-008 | Compatibility | Last 2 versions of Chrome, Edge, Firefox, Safari; iOS Safari ≥ 16; Android Chrome ≥ 110 |
| NFR-009 | Observability | Logs rotated (14 days), uptime monitor, Sentry errors, weekly GA4 snapshot |
| NFR-010 | Backup/DR | Nightly `pg_dump` from the VM → Object Storage (30-day retention) + one weekly dump kept 8 weeks; RTO 4 h, RPO 24 h; restore drill in Week 7 |
| NFR-011 | Localization | English only; IST timezone for all scheduling (VM scheduler runs `Asia/Kolkata`) |
| NFR-012 | Cost | **Hard $0 (D5)** — Vercel Hobby, OCI Always Free, Gmail SMTP, GA4/Sentry free tiers, free URLs. OCI keeps a card on file at signup but never charges it. Any paid upgrade (e.g. optional domain ~$10–15/yr) requires explicit approval |
| NFR-013 | Free-tier compliance | App must respect the verified free-tier limits in §9.4: Vercel Hobby daily-only cron / 300 s functions / 4.5 MB bodies; OCI ≤ 2 OCPU + 12 GB in `ap-mumbai-1` with keep-alive heartbeat; Gmail ≤ 500 mails/day |

---

## 9. Architecture & Tech Stack (hard $0 — D5)

### 9.1 Architecture

```
                          ┌───────────────────────────────────────────┐
  Browser / PWA  ─HTTPS─▶ │ Vercel Hobby (region bom1 — Mumbai)       │
  vibezone.vercel.app     │  Next.js 15 · App Router                  │
        │                 │  · SSR public pages (cached)              │
        │ WSS             │  · /api/* route handlers (Zod-validated)  │
        ▼                 │  · Server Actions · Web Push (VAPID)      │
  Realtime client ─WSS─▶  │  · GA4 · Sentry                          │
  wss://<vm-ip>.sslip.io  └──────┬──────────────────┬─────────────────┘
                                │                  │
                     Postgres   │                  │ internal HTTP
              (TLS, non-std     │                  │ (shared secret)
               port, SCRAM)     ▼                  ▼
  ┌──────────────────────────────────────────────────────────────────────┐
  │  OCI Always Free VM — Ampere A1 (≤ 2 OCPU / 12 GB, ap-mumbai-1)     │
  │  Docker Compose:                                                     │
  │   · PostgreSQL 16 (ssl=on, SCRAM, hostssl, custom port)             │
  │   · Socket.IO realtime gateway behind Caddy (WSS + Let's Encrypt)    │
  │   · Scheduler (node-cron, Asia/Kolkata): reminders, poll open/close, │
  │     weekly leaderboard rollover, cleanups, keep-alive heartbeat      │
  │   · Mailer (Gmail SMTP :587) — OTP + reminder emails                │
  │   · nightly pg_dump → Object Storage · Uptime Kuma                  │
  └──────┬─────────────────────────────────────┬────────────────────────┘
         │ pre-signed upload URLs               │ outbound :587
         ▼                                     ▼
  OCI Object Storage (Always Free)       Gmail SMTP (500 mails/day)
  avatars · images · backup dumps        dedicated account (D8)
```

**Why this split:** Vercel Hobby cannot run sub-daily cron or hold Socket.IO state, and outbound IPs are dynamic — so the OCI VM (which has local DB access) runs realtime, schedulers, and mail; Vercel serves the app. Meets **every** constraint in §9.4 at $0.

### 9.2 Stack decisions

| Layer | Choice | Notes / fallback |
|-------|--------|-------------------|
| App | Next.js 15 on **Vercel Hobby**, functions region `bom1` (Mumbai) | Auto HTTPS + per-branch preview deployments for UAT |
| Realtime | **Socket.IO gateway on the OCI VM**, WSS via `<vm-ip>.sslip.io` + Let's Encrypt | Revisit Vercel native WebSockets (public beta) in v2 |
| Database | **PostgreSQL 16 (Docker) on the OCI VM** — TLS required, SCRAM, non-standard port, `pg_hba hostssl`, capped connections via pgbouncer, least-privilege app role (D7) | Fallback if exposure is rejected: free managed Postgres (Neon/Supabase) |
| ORM | Prisma | Migrations, type safety, parameterized SQL |
| Compute | **OCI Always Free Ampere A1** ≤ 2 OCPU / 12 GB, home region `ap-mumbai-1`, weekly keep-alive heartbeat | Trim to 1 OCPU / 6 GB if needed |
| Scheduling | `node-cron` container on the VM (`Asia/Kolkata`) | Vercel cron is daily-only ±59 min on Hobby (§9.4) — never relied upon |
| Email | **Gmail SMTP :587** from the VM mailer (secret-protected internal endpoint the app calls) | 500 mails/day; dedicated account + 2FA App Password (D8) |
| Files | OCI Object Storage pre-signed URLs | Fallback: VM volume |
| Push | Web Push (VAPID keys in Vercel env) | iOS ≥ 16.4 PWA |
| Auth | Custom OTP → httpOnly Secure session cookie (SameSite=Lax across `vercel.app`) | Auth.js later if needed |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent dark mode — no custom design work |
| Validation | Zod (shared client/server schemas) | Single source of truth |
| Analytics | GA4 + Sentry free tier + `points_ledger` | Meets §13 |
| CI/CD | Vercel Git integration (app) + GitHub Actions → SSH `docker compose up -d` (VM) | Both free quotas |
| Monitoring | Uptime Kuma on the VM + Sentry + logrotate | Free |
| URLs | `vibezone.vercel.app` (app) · `<vm-ip>.sslip.io` (realtime WSS) | Optional custom domain ~$10–15/yr later (D5) |

### 9.3 Environments

| Env | Purpose | URL | Data |
|-----|---------|-----|------|
| `local` | Development | `localhost:3000` + Docker Compose (DB, gateway, mailer → test/lock mode) | Local Postgres, seed data |
| `staging` | QA/UAT | Vercel **preview deployments** (per branch) → `vibezone_staging` DB on the VM | Seeded subset |
| `prod` | Launch | `vibezone.vercel.app` | Real data, nightly backups to Object Storage |

### 9.4 Verified free-tier constraints & design responses

| Constraint (source) | Limit | Design response |
|---|---|---|
| Vercel Hobby cron ¹ | **Once per day, ±59 min precision** | All time-critical scheduling (T-24 h / T-1 h reminders, poll 07:00 & 23:00 IST, weekly rollover, cleanups, heartbeat) runs in the **VM scheduler**, never on Vercel |
| Vercel Functions ¹ | 300 s max, 2 GB RAM, **4.5 MB request body** | Long jobs → VM; file uploads bypass Vercel via pre-signed Object Storage URLs |
| Vercel networking ¹ | Outbound IPs are **dynamic** (static IPs are paid) | Postgres reachable on a hardened public port (D7 → risk R3) |
| Vercel Hobby plan ¹ | Non-commercial use; `*.vercel.app` URLs | Campus non-profit use is fine; free URLs chosen (D5) |
| OCI Always Free ² | **2 OCPU / 12 GB** Ampere A1 total, **home region only**, never expires; idle instances may be reclaimed | VM ≤ limits, provisioned in `ap-mumbai-1`, **weekly keep-alive heartbeat**, nothing over-provisioned after trial |
| OCI signup ² | Card on file required — **never charged** | Accepted (D5) |
| Gmail SMTP ³ | 500 mails/day | ≤ 200 OTP/day expected; test batch before launch; volume kept transactional-only (D8) |
| sslip.io | Free wildcard DNS → IP address | Realtime WSS hostname with automatic Let's Encrypt cert |

¹ vercel.com/docs — cron usage-and-pricing, functions/limitations · ² docs.oracle.com — Free Tier · ³ Google SMTP sending limits

---

## 10. Data Model (PostgreSQL 16 on the OCI VM — D1)

### 10.1 Entity overview

```
users ──< channel_members >── channels ──< messages ──< message_reports
users ──< announcements            users ──< point_ledger
users ──< event_rsvps >── events   users ──< poll_votes >── polls
users ──< note_votes   >── notes   users ──< notifications
users ──< mentorship_requests >── users (senior)
users ──< push_subscriptions       users ──< blocked_users
feedback (standalone, anonymous)   audit_logs (standalone)
lost_and_found ── users            email_otps ── (email)
```

### 10.2 DDL

```sql
-- ============ Identity ============
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  handle        VARCHAR(30)  UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  avatar_url    TEXT,
  bio           VARCHAR(300),
  branch        VARCHAR(50),
  year          SMALLINT,                          -- 1..4
  role          VARCHAR(15) NOT NULL DEFAULT 'student'
                CHECK (role IN ('student','senior','moderator','admin')),
  status        VARCHAR(12) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','banned','deleted')),
  expertise     JSONB,                             -- senior tags: ["DSA","Placements"]
  onboarded_at  TIMESTAMP,                         -- profile setup completed (v2.1)
  last_seen_at  TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role ON users(role) WHERE status = 'active';

CREATE TABLE email_otps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL,
  code_hash   VARCHAR(255) NOT NULL,
  attempts    SMALLINT NOT NULL DEFAULT 0,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_otps_email ON email_otps(email, created_at DESC);

-- ============ Chat / Channels ============
CREATE TABLE channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(40) UNIQUE NOT NULL,
  name        VARCHAR(60) NOT NULL,
  type        VARCHAR(10) NOT NULL DEFAULT 'global'
              CHECK (type IN ('global','dm','mentorship')),
  topic       VARCHAR(200),
  created_by  UUID REFERENCES users(id),
  archived_at TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE channel_members (
  channel_id  UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alias_name  VARCHAR(30),                          -- null = posting as self
  alias_active BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMP,
  joined_at   TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES users(id),
  alias_name  VARCHAR(30),                          -- denormalized display identity
  body        TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  is_flagged  BOOLEAN NOT NULL DEFAULT false,       -- profanity filter hit
  edited_at   TIMESTAMP,
  deleted_at  TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);

CREATE TABLE message_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id),
  reason      VARCHAR(20) NOT NULL
              CHECK (reason IN ('abuse','spam','explicit','other')),
  status      VARCHAR(12) NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','dismissed','actioned')),
  handled_by  UUID REFERENCES users(id),
  handled_at  TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (message_id, reporter_id)
);

-- ============ Announcements ============
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(160) NOT NULL,
  body        TEXT NOT NULL,                        -- sanitized HTML / markdown-lite
  category    VARCHAR(20) NOT NULL DEFAULT 'Academic',
  image_url   TEXT,
  pinned      BOOLEAN NOT NULL DEFAULT false,
  notify      BOOLEAN NOT NULL DEFAULT false,
  publish_at  TIMESTAMP NOT NULL DEFAULT now(),
  expires_at  TIMESTAMP,
  author_id   UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_ann_feed ON announcements(pinned DESC, publish_at DESC);

-- ============ Events ============
CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(160) NOT NULL,
  description       TEXT,
  category          VARCHAR(30),
  location          VARCHAR(160),
  starts_at         TIMESTAMP NOT NULL,
  ends_at           TIMESTAMP,
  capacity          INT,
  cover_image_url   TEXT,
  external_stream_url TEXT,                          -- v1 stand-in for live video
  status            VARCHAR(12) NOT NULL DEFAULT 'published'
                    CHECK (status IN ('draft','published','cancelled')),
  created_by        UUID NOT NULL REFERENCES users(id),
  created_at        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_when ON events(starts_at);

CREATE TABLE event_rsvps (
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status    VARCHAR(10) NOT NULL DEFAULT 'going'
            CHECK (status IN ('going','maybe','not_going')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  reminded_at TIMESTAMP,
  PRIMARY KEY (event_id, user_id)
);

-- ============ Notes ============
CREATE TABLE notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(160) NOT NULL,
  description  VARCHAR(500),
  subject      VARCHAR(80) NOT NULL,
  branch       VARCHAR(50) NOT NULL,
  year         SMALLINT,
  semester     SMALLINT,
  type         VARCHAR(12) NOT NULL DEFAULT 'Notes'
               CHECK (type IN ('Notes','PYQ','Lab','Slides','Other')),
  external_link TEXT NOT NULL CHECK (external_link ~ '^https://'),
  file_url     TEXT,                                -- v1.5 direct upload
  uploaded_by  UUID NOT NULL REFERENCES users(id),
  open_count   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_notes_search ON notes(subject, branch, year);

CREATE TABLE note_votes (
  note_id   UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (note_id, user_id)
);

-- ============ Polls / Games ============
CREATE TABLE polls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,                        -- ["Option A","Option B"]
  status      VARCHAR(12) NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','scheduled','open','closed')),
  opens_at    TIMESTAMP,
  closes_at   TIMESTAMP,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE poll_votes (
  poll_id      UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index INT  NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, user_id)
);

CREATE TABLE quizzes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      VARCHAR(120) NOT NULL,
  questions  JSONB NOT NULL,                         -- [{q, options[], answer}]
  week_of    DATE NOT NULL,                          -- Monday of the quiz week
  opens_at   TIMESTAMP, closes_at TIMESTAMP
);

CREATE TABLE quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      UUID NOT NULL REFERENCES quizzes(id),
  user_id      UUID NOT NULL REFERENCES users(id),
  score        SMALLINT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (quiz_id, user_id)
);

-- ============ Gamification ============
CREATE TABLE point_ledger (                          -- append-only, server-side only
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id),
  action      VARCHAR(30) NOT NULL,                  -- poll_vote, msg_send, rsvp, ...
  points      SMALLINT NOT NULL,
  ref_type    VARCHAR(20), ref_id UUID,              -- e.g. ('poll', <uuid>)
  bucket_date DATE NOT NULL DEFAULT CURRENT_DATE,    -- for daily caps
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_points_user_date ON point_ledger(user_id, bucket_date, action);
CREATE UNIQUE INDEX uq_points_dedupe
  ON point_ledger(user_id, action, ref_type, ref_id)
  WHERE ref_id IS NOT NULL;                          -- idempotency guard

-- ============ Feedback (anonymous) ============
CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    VARCHAR(20) NOT NULL,
  message     TEXT NOT NULL CHECK (length(message) BETWEEN 10 AND 1000),
  year        SMALLINT, branch VARCHAR(50),          -- optional, non-identifying chips
  ip_hash     CHAR(64),                              -- salted, purged after 7 days
  status      VARCHAR(12) NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','in_review','resolved')),
  internal_note TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at  TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_feedback_queue ON feedback(status, created_at DESC);
-- NOTE: no user_id column on purpose — anonymity guarantee.

-- ============ Lost & Found ============
CREATE TABLE lost_and_found (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name    VARCHAR(120) NOT NULL,
  description  TEXT NOT NULL,
  type         VARCHAR(8) NOT NULL CHECK (type IN ('lost','found')),
  location     VARCHAR(120),
  occurred_on  DATE,
  contact_info VARCHAR(120),
  image_url    TEXT,
  status       VARCHAR(10) NOT NULL DEFAULT 'open'
               CHECK (status IN ('open','resolved')),
  user_id      UUID NOT NULL REFERENCES users(id),
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMP
);
CREATE INDEX idx_lnf_recent ON lost_and_found(status, created_at DESC);

-- ============ Mentorship ============
CREATE TABLE mentorship_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  senior_id  UUID NOT NULL REFERENCES users(id),
  message    VARCHAR(600),
  status     VARCHAR(12) NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','accepted','rejected','expired','ended')),
  channel_id UUID REFERENCES channels(id),          -- set on accept
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  responded_at TIMESTAMP,
  CHECK (student_id <> senior_id)
);
CREATE INDEX idx_mentor_pending ON mentorship_requests(senior_id, status);

-- ============ Notifications & Push ============
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(24) NOT NULL,                   -- dm, announcement, event_reminder, ...
  title      VARCHAR(160) NOT NULL,
  body       VARCHAR(300),
  link       TEXT,
  read_at    TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_unread ON notifications(user_id, read_at, created_at DESC);

CREATE TABLE notification_prefs (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(24) NOT NULL,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  inapp_enabled BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, category)
);

CREATE TABLE push_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint   TEXT UNIQUE NOT NULL,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ============ Safety ============
CREATE TABLE blocked_users (
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE audit_logs (                           -- includes de-anonymization
  id         BIGSERIAL PRIMARY KEY,
  actor_id   UUID REFERENCES users(id),             -- null for system jobs
  action     VARCHAR(40) NOT NULL,                  -- reveal_alias, ban, delete_msg, ...
  target_type VARCHAR(20),
  target_id  UUID,
  reason     TEXT,
  metadata   JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_recent ON audit_logs(created_at DESC);
```

### 10.3 Retention policy

| Data | Retention | Action |
|------|-----------|--------|
| `feedback.ip_hash` | 7 days | Null out automatically |
| `notifications` | 90 days | Hard delete |
| Soft-deleted `messages` | 30 days | Hard delete (audit copy of body kept only if reported) |
| OTP codes | 15 minutes | Hard delete |
| App logs | 14 days | Rotation on VM |
| DB backups | 30 days (nightly `pg_dump` to Object Storage) + weekly dump kept 8 weeks | Bucket lifecycle rule |
| `audit_logs` | Indefinite (append-only) | Manual review only |

---

## 11. API & Realtime Surface

### 11.1 REST (App Router route handlers; all inputs Zod-validated)

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
| PATCH/DELETE | `/api/messages/:id` | author | Edit ≤15 min / soft delete |
| POST | `/api/messages/:id/report` | session | Report → queue |
| POST | `/api/dm/:userId` | session | Open/get DM channel |
| GET/POST | `/api/events`, `/api/events/:id/rsvp` | session (list public) | Events + RSVP |
| GET/POST | `/api/notes` | session (list public) | Notes CRUD-lite + filters |
| POST | `/api/notes/:id/vote` | session | Toggle upvote |
| POST | `/api/notes/:id/open` | session | Count `note_open` |
| GET | `/api/polls/today` | session | Active poll (options only, no tallies pre-vote) |
| POST | `/api/polls/:id/vote` | session | Idempotent vote → reveals percentages |
| GET | `/api/leaderboard?period=week\|all` | session | Top 10 + own rank |
| POST | `/api/feedback` | public | Anonymous submit (honeypot + rate limit) |
| GET/POST | `/api/lost-and-found` | session (list public) | CRUD-lite |
| GET/POST | `/api/mentorship/requests` | session | Browse seniors / send / respond |
| GET/POST | `/api/reports`, `/api/moderation/*` | moderator+ | Queue + actions |
| POST | `/api/moderation/reveal-alias` | moderator+ | Requires `reason` → audit log |
| GET | `/api/notifications`, POST `/read` | session | Inbox |
| POST | `/api/push/subscribe` | session | Store push subscription |

### 11.2 Socket.IO events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join` / `leave` | C→S | `{ channelId }` (membership verified server-side) |
| `message:new` | C→S | `{ channelId, body, alias? }` → validated, rate-limited, broadcast |
| `message:created` | S→C | `{ id, channelId, senderId, displayName, body, createdAt }` |
| `message:edited` / `message:deleted` | S→C | `{ id, channelId }` |
| `typing` | C→S / S→C | `{ channelId, userId }` (v1.5) |
| `presence` | S→C | `{ userId, online }` (v1.5) |
| `ack` / `error` | S→C | `{ code, message }` — throttled, invalid, filtered |

Auth: handshake carries the session token; unauthenticated sockets receive only nothing (all channels require membership).

---

## 12. Moderation, Anonymity & Safety Model

| Layer | Mechanism |
|-------|-----------|
| **Identity** | Every account = verified campus email. Server-side alias↔user mapping in `channel_members` / denormalized on `messages` |
| **Anonymity for users** | Alias mode per channel; alias auto-generated and persistent per channel so students recognize each other's aliases |
| **Anonymity for feedback** | No user linkage at all; salted `ip_hash` (7-day life) for rate limiting only; honeypot + 1/day limit |
| **Reveal policy** | Only `moderator`/`admin`, mandatory free-text reason, written to `audit_logs`; panel shows who revealed what and when (tamper-evident append-only) |
| **Content control** | Profanity/keyword list applied at send; flagged messages enter review; moderators act from the queue |
| **Reporting** | One-tap report on messages/notes/lost&found with 4 reasons; duplicate reports deduped; SLA 24 h |
| **Escalation** | Warn → warn → warn → auto soft-ban (3 strikes); moderator can ban immediately for P1 content |
| **Rate limits** | 20 msg/min, 10 new DM targets/day, 1 feedback/24 h per ip_hash, 3 OTP resends/10 min |
| **Ban screen** | Banned users see reason + appeal contact; no platform content is visible |

---

## 13. Analytics & Measurement Plan

### 13.1 GA4 event taxonomy

| Event | Trigger | Key params |
|-------|---------|-----------|
| `sign_up` / `login` | OTP verified (first vs returning) | — |
| `profile_complete` | Onboarding finished | — |
| `announcement_view` / `announcement_click` | Page view / CTA | `category`, `pinned` |
| `message_send` | Message accepted | `channel_type`, `aliased` |
| `poll_view` / `poll_vote` | Poll seen / voted | `poll_id` |
| `leaderboard_view` | Tab opened | `period` |
| `note_view` / `note_open` | Detail / external click | `subject`, `type` |
| `event_view` / `event_rsvp` | Detail / RSVP | `event_id`, `category` |
| `feedback_submit` | Success | `category` |
| `lostfound_post` / `lostfound_resolve` | CRUD | `type` |
| `mentorship_request` / `mentorship_accept` | Funnel steps | — |
| `report_create` | Report submitted | `content_type`, `reason` |
| `push_subscribe` | Permission granted | — |
| `theme_toggle` | Dark/light switch | `mode` |

### 13.2 Product metrics (SQL over `point_ledger` + GA4)

- DAU/WAU/MAU rollups, DAU/WAU stickiness.
- Funnel: visit → OTP → profile complete → first core action (7-day window).
- Feature adoption % of WAU per module.
- Points distribution to spot gaming (z-score > 3 on daily points → flag).

---

## 14. Integrations & Dependencies

| Integration | Use | Type | Risk if down |
|-------------|-----|------|--------------|
| Vercel Hobby | App hosting (SSR, API, Web Push) | Critical | Roll back to previous deploy in Vercel; DB untouched |
| OCI Always Free VM | Postgres, realtime gateway, schedulers, mailer, backups, monitoring | Critical | Chat/scheduling/email pause → runbook: `docker compose restart` |
| OCI Object Storage | Avatars, images, backup dumps | High | Preset avatars; backups retry next night |
| Gmail SMTP | OTP + all outbound email | Critical (onboarding) | Admin re-send tool + "check spam" hint; runbook switch to alternate relay |
| sslip.io | Realtime WSS hostname | High | Fall back to raw `wss://<ip>` (cert warning) until fixed |
| GA4 / Sentry | Measurement / error tracking | Medium | Degraded measurement only |
| Google Drive / OneDrive | Hosted notes files | High (external) | Links may expire → report flow |
| YouTube Live | v1 event "stream" links | Low | Manual link update |
| Reddit/Joke public APIs | `#memes` content automation (v1.5/v2) | Optional | Manual posting |

---

## 15. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Alias anonymity abused (harassment) | High | High | Profanity filter, rate limits, 24-h report SLA, audit-logged reveals, 3-strike ban, seeded moderator |
| R2 | Low adoption after week 2 ("ghost town") | High | High | Seeded content (Appendix B), class-rep ambassadors, daily poll habit, points streaks, launch during a campus event |
| R3 | **Postgres exposed on the public internet** — Vercel Hobby has no static IPs to allow-list (D7) | Medium | High | Hardening checklist: non-standard port, `ssl=on` (TLS 1.2+), SCRAM strong password, `pg_hba hostssl` only, least-privilege app role (no superuser), pgbouncer connection cap, secrets rotated at launch + quarterly, Uptime Kuma port probe, weekly `pg_stat_activity` glance; reviewed at go/no-go |
| R4 | WebSocket behind proxy / TLS misconfig | Medium | Medium | Caddy auto-WSS config on `sslip.io`, socket reconnect logic, load test with 30 clients in Week 3 |
| R5 | OTP email deliverability (Gmail spam folders / limits) | Medium | High | Dedicated Gmail (D8) with 2FA App Password, Day-1 test batch to 5 real mailboxes (inbox placement), visible "check spam" hint, admin re-send tool, start volume ≤ 100/day, transactional mail only |
| R6 | Anonymous feedback used for false accusations | Medium | Medium | Category chips, moderation triage language, internal notes, clear "not a substitute for official complaints" copy |
| R7 | Scope creep (streaming, games, native app) | High | Medium | Written non-goals §3; new requests → v2 backlog only |
| R8 | Single VM = single point of failure | Medium | Medium | Docker `restart=always`, nightly DB dump to Object Storage, 5-min uptime monitor, restore drill in Week 7, documented re-provision steps |
| R9 | Data/privacy concerns with student data | Low | High | Data policy page, no PII in feedback, deletion ≤ 7 days, no third-party ad trackers |
| R10 | **Solo bus factor** — illness/exams stall the build (D6) | High | High | Pace table + cut lines (plan §7), code pushed daily, README + runbook, nightly dumps, P1 modules droppable, weekly Sunday plan-vs-actual review |
| R11 | Vercel Hobby limits change or are breached (daily cron, 4.5 MB, non-commercial) | Low | Medium | No design dependency on Vercel cron (§9.4), uploads bypass Vercel, monthly check of Vercel limits; forced upgrade requires sponsor approval |
| R12 | OCI free-tier reclamation (idle / over-quota) or region issue | Low | High | Both sides in Mumbai (`bom1` / `ap-mumbai-1`), weekly keep-alive heartbeat, quota ≤ 2 OCPU/12 GB; if reclaimed → restore latest Object Storage dump on re-provision (RTO 4 h) |
| R13 | Gmail account locked (abuse detection) | Low | High | Dedicated account used only for transactional OTP, warmed via test batch, recovery phone/email set, runbook switch to alternate SMTP relay |

---

## 16. Assumptions, Dependencies & Open Questions

**Assumptions**
1. Single campus, single admin team (you = super admin), English-only UI.
2. A dedicated Gmail account (**`vibezoneioi25@gmail.com`**, D8) is used only for VibeZone transactional mail, with 2FA + App Password configured (Q2).
3. 200 students on modern smartphones with campus Wi-Fi / personal data.
4. The super admin covers the 24-h report SLA personally, optionally granting 1–2 volunteer moderators from the dashboard (D10).
5. Web/PWA is sufficient; no app-store distribution needed.
6. The pace required by the plan's pace table is available (≈6–7 h/day for the 8-week variant).

**Dependencies**
- OCI tenancy with home region **`ap-mumbai-1`** (Always Free VM ≤ 2 OCPU/12 GB + Object Storage bucket).
- Vercel Hobby account + GitHub repo (Vercel Git integration) + GA4 property.
- Dedicated Gmail account with 2FA App Password (D8).
- Campus branding assets (name, colors, logo) by Week 2.
- Seed content: ≥ 20 notes links, 4 events, poll bank (30 questions) by Week 6.
- OTP allow-list configured: `CAMPUS_EMAIL_DOMAINS=pwioi.com` (resolved — D11); login test must accept `*@pwioi.com` and reject every other domain.

**Open questions**

| # | Question | Owner | Needed by |
|---|----------|-------|-----------|
| Q2 | `vibezoneioi25@gmail.com` — ~~2FA + App Password~~ ✅ **done (password generated; ROTATE before launch — it was exposed in chat, and it must only ever live in Vercel env / local `.env`, never in git or docs)** · still open: sender display name "VibeZone" + recovery phone/email | Super admin | Rotation by Week 6 |
| Q3 | Which accounts besides yours get `moderator` at launch (granted from the dashboard)? | Super admin | Week 5 (moderation gate) |
| Q4 | Should announcements also be emailed, or push + in-app only? | Super admin | Week 5 |

**Resolved since v2.0:** OTP allowed for campus → domain confirmed **`@pwioi.com` (D11)** · Gmail account = **`vibezoneioi25@gmail.com`** (D8, pending App Password = Q2) · roles granted by super admin (D10) · feedback → admins only (D9) · region → India, `ap-mumbai-1` (D1/D5) · URLs → free `vibezone.vercel.app`, pwioi.com DNS not editable (D11).

---

## 17. Launch Acceptance Criteria (Definition of Done for v1)

- [ ] **AC1** A guest can read the announcement board without logging in (cold load < 2.5 s on 4G).
- [ ] **AC2** A student signs up with a campus email, verifies OTP, and sets a profile in < 3 min.
- [ ] **AC3** Two users exchange real-time messages in a channel and a DM; alias mode works and a moderator reveal writes an audit entry.
- [ ] **AC4** The daily poll publishes automatically, accepts exactly one vote per user, and updates the leaderboard within 5 s.
- [ ] **AC5** An event RSVP triggers reminders at T-24 h and T-1 h (verified in staging with a short-window event).
- [ ] **AC6** A note can be submitted, searched, upvoted, and its external link fires `note_open`.
- [ ] **AC7** Anonymous feedback reaches the admin queue with zero user linkage in the row (verified in DB).
- [ ] **AC8** A reported message appears in the moderation queue; delete/warn/ban flows and 3-strike auto-ban work; all actions are in `audit_logs`.
- [ ] **AC9** *(only if Lost & Found / Seniors Connect make the v1 cut — D6)* Lost & Found post with image upload works; Seniors Connect request → accept → DM channel opens. Otherwise both are verified at v1.5.
- [ ] **AC10** Dark/light toggle, PWA install, push notifications (opt-in), GA4 events firing in DebugView.
- [ ] **AC11** Playwright smoke suite green on 6 critical flows; 5–10-student UAT sign-off; no P0/P1 open bugs.
- [ ] **AC12** Backup restore drill done (DB restored to staging); uptime monitor + Sentry live; runbook published.

---

## 18. Milestone Summary

| Milestone | Window | Theme | Exit criteria |
|-----------|--------|-------|---------------|
| **M1 — Core Platform** | Weeks 1–3 | Vercel + OCI foundation, OTP auth, profiles, announcements, base UI, realtime chat core | Guest reads public board; student logs in via OTP; moderator publishes; realtime message demo |
| **M2 — Social & Engagement** | Weeks 4–6 | Chat/DM/aliases, events + reminders, notes, polls, points, moderation console | All P0 modules feature-complete end-to-end in staging, demoed on a phone |
| **M3 — Launch** | Weeks 7–8 | Feedback portal, notifications, polish, security/perf pass, UAT (+ Lost & Found / Seniors Connect **only if ahead** — D6) | All §17 criteria green → production go-live |

Detailed week-by-week execution (solo pace table, workstreams, cut lines, launch checklist) live in **`VibeZone - 8-Week Delivery Plan.md`**.

---

## Appendix A — Gamification rules

| Action | Points | Daily cap | Dedupe key |
|--------|-------:|----------:|------------|
| Verify OTP (once) | 20 | — | user |
| Complete profile (once) | 20 | — | user |
| Daily poll vote | 5 | 1 × | poll id |
| Send a chat message | 1 per message | 10/day | day |
| First message of the day | 3 | 1 × | day |
| Log in (any activity) | 2 | 1 × | day |
| Event RSVP | 10 | — | event id |
| Attend event (organizer closes RSVP) | 15 | — | event id |
| Upload a note resource | 10 | 3/day | note id |
| Upvote a note | 1 | 5/day | note id |
| Note gets upvoted (author) | 2 | 10/day | — |
| Submit lost & found post | 5 | 1/day | post id |
| Weekly trivia (5 questions) | up to 25 | — | quiz id |
| Mentorship request accepted (both) | 15 | — | request id |
| Report marked actioned (reporter) | 5 | 2/day | report id |

**Leaderboards:** weekly = sum of `points_ledger` in current Mon 00:00 → next Mon 00:00 IST; all-time = lifetime sum. Tie-break: earliest last-earned point. All scoring computed **only** server-side.

---

## Appendix B — Day-1 seed content (ghost-town prevention)

| Area | Seed |
|------|------|
| Channels | `#general` (welcome + rules), `#help` (3 FAQs), `#placements` (company list), `#memes`, `#random` |
| Announcements | 5 official-style posts (orientation, Wi-Fi guide, library hours, club sign-ups, exam schedule placeholder) |
| Notes | ≥ 20 real links across core subjects/semesters |
| Events | 4 upcoming (club meetup, coding contest, guest talk, sports meet) |
| Polls | Bank of 30 questions ready (mix of funny + campus-relevant) |
| Seniors | 5–8 seniors onboarded with tags *(only if Seniors Connect ships in v1 — D6; otherwise pre-stage for v1.5)* |
| Leaderboard | Pre-launch ambassadors with activity so the board isn't empty |
