# VibeZone — Project Roadmap

**Version:** 2.2 (post-build)  
**Status:** v1 code complete (core platform shipped), ready for hardening & UAT  
**Project:** Single-campus moderated web platform (~200 B.Tech students, PW IOI campus)  
**Constraint:** Hard $0 stack — Vercel Hobby + OCI Always Free VM + Gmail SMTP  
**Team:** Solo builder

---

## 1. Current State: Where We Are

### ✅ Complete (v1.0 code)

| Module | Status | Notes |
|--------|--------|-------|
| Auth & Profiles | Done | Campus-email OTP (`@pwioi.com` allow-list), 10-min TTL, 3-resend cap, session cookie, role guards |
| Announcement Board | Done | Public SSR feed, moderator composer, sanitized body, pin/expire |
| Chat & DMs | Done | Socket.IO realtime gateway, global channels, DMs, alias mode, rate limits, profanity filter, reports |
| Events | Done | Listings, RSVP with capacity, `.ics` export, external stream link |
| Notes Repository | Done | External-link resources, search/filter, upvotes, reviews |
| Polls & Leaderboard | Done | Daily poll auto-open/close, idempotent voting, points engine, weekly/all-time leaderboard |
| Feedback Portal | Done | Anonymous submissions, honeypot + 1/day per IP hash, admin queue |
| Moderation & Safety | Done | Report queue, warn/delete/ban, 3-strike auto-ban, alias reveal + audit log |
| Notifications | Done | In-app inbox + fan-out, Web Push (VAPID), per-category prefs |
| Lost & Found | Done | Posts with status (open/resolved) — already in code despite PRD "conditional" tag |
| Mentorship | Done | Requests, accept/reject → auto DM channel — already in code |
| System | Done | Dark/light theme, PWA (manifest + service worker), GA4 taxonomy, Sentry error tracking |

### 🧪 In Progress / Needs Verification

| Item | Gap |
|------|-----|
| Build verification | `next build` needs DB-dependent pages verified (Neon connection) |
| UAT | Not yet done — needs 5–10 students on preview deployments |
| Restore drill | Not yet executed |
| Launch tag | `v1.0.0` not yet created |
| Secrets audit | Gmail App Password was exposed in chat — must be rotated |

---

## 2. Roadmap Overview

```
TIMELINE
Phase 1   Phase 2           Phase 3          Phase 4
[HARDEN]  [UAT & LAUNCH]    [v1.0.1 PATCHES] [v1.5 FEATURES]
W1        W2–W3             W4–W5            W6+
```

| Phase | Focus | Duration | Gate |
|-------|-------|----------|------|
| **1 — Harden** | Security pass, UAT, restore drill, secrets rotation | ~2 weeks | UAT sign-off + drill done |
| **2 — Launch** | Tag v1.0.0, go-live, class-rep announcement, day-1 poll | 1 week | All PRD acceptance criteria green |
| **3 — Patch** | v1.0.1 fixes from UAT, monitoring tuning | 2–3 weeks | Zero open P0/P1 bugs |
| **4 — v1.5** | Lost & Found polish, Seniors Connect, push notifications, typing/presence | 4–6 weeks | KPI review at 6 weeks |

---

## 3. Phase 1 — Harden & Prepare for Launch (Weeks 1–2)

**Goal:** Make v1 production-ready. Fix security debt, validate with real students, prove recovery.

### 1.1 Security P0 (Week 1)
- [ ] **Rotate exposed Gmail App Password** — revoke old, generate new 16-char App Password, store only in `vm/.env` (never `.env.example` or chat), scan git history with `git log -p --all -S '<old-password>'`
- [ ] **Confirm all production secrets** in Vercel + `vm/.env` (`SESSION_SECRET`, `MAILER_SECRET`, `SMTP_APP_PASSWORD`, `REALTIME_SECRET`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_REALTIME_URL`)
- [ ] **Security pass** — OWASP ASVS L1: CSP/HSTS/X-Frame headers, Zod validation on all routes, server-side role checks, secrets out of git, dependency audit
- [ ] **Rate limits verified** — OTP resend cap (3/10 min), message rate limit (20/min + 10/10s burst), feedback 1/day per IP hash

### 1.2 UAT (Week 1–2)
- [ ] Recruit 5–10 students with `@pwioi.com` emails
- [ ] Test script: signup/OTP → announcements → chat (channel + DM + alias) → events list/RSVP → notes submit/read → feedback portal
- [ ] Log all bugs with severity; all P0/P1 bugs resolved or explicitly accepted before tag

### 1.3 Restore Drill (Week 2)
- [ ] Neon backup/restore test: restore to scratch Neon project, run Prisma schema push, verify schema + seed data
- [ ] Document restore steps in `docs/operations/RUNBOOK.md` with RTO/RPO
- [ ] Execute end-to-end in scratch environment (app + VM stack)

### 1.4 Branch Protection (Week 1–2)
- [ ] Add GitHub branch protection rules to `main` (1 approving review + status checks, include administrators, block force pushes)

**Phase 1 Exit:** UAT signed off, restore drill done, all P0/P1 bugs fixed, `main` protected.

---

## 4. Phase 2 — v1.0.0 Launch (Week 3)

**Goal:** Go live on `vibezone.vercel.app`.

### 2.1 Pre-Launch Checklist (last 48h)
- [ ] All PRD §17 acceptance criteria verified (screenshots / test links)
- [ ] Load sanity: 50 concurrent sockets, 100 req/min API, p95 < 500ms
- [ ] Security pass complete; secrets out of git; DB hardening verified
- [ ] Restore drill documented; rollback tested (previous Vercel deploy + VM image)
- [ ] Uptime Kuma + Sentry alerts configured; log rotation on; keep-alive heartbeat running
- [ ] GA4 live (DebugView verified); Gmail test batch passed from VM in prod config
- [ ] `vibezone.vercel.app` (HTTPS) and `wss://<vm-ip>.sslip.io` both green from outside network
- [ ] Seeds complete: 5 announcements, 20 notes, 4 events, 30-question poll bank, channels
- [ ] Super admin = you; ≥1 backup moderator granted + briefed on 24h SLA + reveal policy
- [ ] Day-1 poll queued to auto-publish at 07:00 IST

### 2.2 Launch Day
- [ ] Create `git tag v1.0.0` on `main`, push to origin
- [ ] Publish GitHub Release `v1.0.0` with release notes
- [ ] Deploy to Vercel production
- [ ] Class-rep announcement + first official post scheduled
- [ ] Day-1 poll auto-publishes at 07:00 IST
- [ ] 48-hour post-launch monitoring: zero S1 incidents

**Phase 2 Exit:** `vibezone.vercel.app` live, `v1.0.0` tagged, 48h monitoring clean.

---

## 5. Phase 3 — v1.0.1 Patches (Weeks 4–5)

**Goal:** Fix UAT findings, tune monitoring, stabilize.

### 3.1 Bug Fixes (from UAT)
- [ ] P0/P1 bugs from UAT fixed
- [ ] Any rate-limit or profanity false positives adjusted
- [ ] Mobile viewport / dark-mode polish (iOS Safari, Android Chrome)

### 3.2 Operations Baseline
- [ ] Daily moderation queue + Sentry + uptime review (first 2 weeks)
- [ ] Weekly GA4 snapshot vs PRD KPIs; points-gaming anomaly query
- [ ] Credential rotation (DB + shared secrets)
- [ ] Restore re-drill (monthly cadence)

**Phase 3 Exit:** Zero open P0/P1 bugs, stable operations cadence.

---

## 6. Phase 4 — v1.5 Features (Weeks 6–11)

**Goal:** Add the conditional modules deferred from v1 per D6, plus top-requested features.

### 4.1 Lost & Found (Week 6–7)
- [ ] Image upload to OCI Object Storage (pre-signed URLs)
- [ ] Filter by type/location/recency
- [ ] Auto-archive to history after 30 days if still open

### 4.2 Seniors Connect (Week 7–8)
- [ ] Seniors opt in with expertise tags (DSA, Placements, Higher studies, Projects, Design, Startup)
- [ ] Juniors browse/filter and send requests (max 5 open)
- [ ] Senior accepts/rejects → auto-creates mentorship DM channel + notification

### 4.3 Push Notifications (Week 8–9)
- [ ] Web Push (VAPID) for event reminders T-24h / T-1h
- [ ] Daily digest of new announcements (opt-in)
- [ ] iOS ≥ 16.4 PWA support

### 4.4 Typing & Presence (Week 9–10)
- [ ] Typing indicators in chat
- [ ] Presence dots / read receipts
- [ ] DM block list + message search

### 4.5 Trivia Quiz (Week 10–11)
- [ ] Weekly 5-question campus trivia
- [ ] Points + monthly leaderboard seasons

### Phase 4 Exit: All v1.5 features shipped, KPI review at 6 weeks post-launch.

---

## 7. v2+ Backlog (Future, requires new approval)

| Feature | Notes |
|---------|-------|
| Native broadcast video streaming (HLS/WebRTC) | D2 — deferred to v2 |
| Multi-campus support | Requires new approval |
| Reaction threads on announcements | Engagement feature |
| Polls embedded in announcements | Engagement feature |
| Direct note file uploads | Already have external links; OCI Object Storage pre-signed |

---

## 8. Non-Negotiables (Never Cut)

Per PRD §7 cut lines, these are **always** in scope:

- OTP auth with campus email allow-list
- Public announcements (SSR, public read)
- Chat + aliases + full moderation chain (report → reveal → ban → audit)
- Polls + points + leaderboard
- Anonymous feedback portal
- Backups + restore drill
- Security pass (headers, authz, rate limits, secrets out of git)

---

## 9. Metrics & Success Criteria

| KPI | Target (6 weeks post-launch) |
|-----|------------------------------|
| Verified signups | ≥ 140 of ~200 students |
| Activation rate (profile + 1 action in 7 days) | ≥ 60% |
| WAU / DAU | ≥ 100 WAU, ≥ 25 DAU |
| Poll participation (votes ÷ WAU) | ≥ 40% |
| Notes opens per week | ≥ 100 |
| Event RSVP rate | ≥ 35% |
| Reports triaged within 24h | ≥ 95% |
| p75 LCP (mobile 4G) | < 2.5s |
| Uptime during term | ≥ 99.5% |

---

## 10. Immediate Next Actions (First 5 Working Days)

1. **Rotate exposed Gmail App Password** — revoke old, generate new, store only in `vm/.env`, scan git history
2. **Confirm production secrets** in Vercel + `vm/.env`
3. **Recruit 5–10 UAT testers** with `@pwioi.com` emails
4. **Execute restore drill** and document in RUNBOOK
5. **Add GitHub branch protection** to `main`

---

*Generated from PRD v2.1, Delivery Plan v2.0, current codebase, and open GitHub issues (#4–13).*