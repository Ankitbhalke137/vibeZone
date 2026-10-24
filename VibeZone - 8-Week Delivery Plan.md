# VibeZone — 8-Week Solo Delivery Plan

**Version:** 2.0 (Solo edition) · **Date:** 24 Oct 2026 · **Companion to:** `VibeZone - PRD v2.md` (v2.1)
**Builder:** Solo · **Stack:** hard $0 — Vercel Hobby (app, `bom1` Mumbai) + OCI Always Free VM (`ap-mumbai-1`: Postgres, realtime, schedulers, mail) + Gmail SMTP · **Milestones:** M1 W1–3 · M2 W4–6 · M3 W7–8
**Scope baseline:** All **P0** requirements of the PRD. Lost & Found + Seniors Connect + trivia = **conditional** (D6): only if ahead of schedule in Week 7.

---

## 1. Reality Check & Pace

P0-only effort is **≈ 55 person-days** (8 h days) — see §4. The 8-week schedule only works at a full-time-ish pace:

| Your pace | ≈ Hours/week | 8-week variant | What to do |
|---|---|---|---|
| **Mode A:** ~6–7 h/day, 6–7 days/week | 40–48 h | ✅ Fits (55 d ≈ 8 weeks) | Follow the plan as written |
| Mode B: ~4–5 h/day incl. weekends | 28–35 h | ❌ ~11–12 weeks | Same milestone order, 1 week = 0.7 week; re-date Sunday checkpoints |
| Mode C: evenings only (2–3 h) | 14–21 h | ❌ ~16+ weeks | Apply **P0-lite cuts** from day 1 (below) and/or accept the longer date |

**Mode A assumptions:** UI entirely from shadcn/ui (zero custom illustration work), seeds via SQL script, QA = smoke suite + manual matrix, no pixel-perfect designs.

**P0-lite cuts (pre-approved, apply immediately if Mode B/C):** push notifications → in-app inbox only · PWA → plain responsive site · admin dashboard → one queue page · Playwright → 3 smoke tests · OG/SEO off · `.ics`/CSV exports off.

> **Solo rule:** every **Sunday**, compare planned vs actual (30 min). Behind by ≥ 1 full week two Sundays in a row → execute the next cut line (§7). Never renegotiate P0 silently.

---

## 2. Milestones & Go/No-Go Gates

| Milestone | Window | Exit criteria (demo script, filmed on your phone) |
|-----------|--------|---------------------------------------------------|
| **M1 — Core Platform** | End of Week 3 | 1) Guest loads `vibezone.vercel.app` announcement board over HTTPS. 2) You sign up with the campus email → OTP → profile. 3) Super admin publishes a pinned announcement. 4) Two browsers exchange a realtime chat message + one DM. 5) Vercel deploy runs itself on push. |
| **M2 — Social & Engagement** | End of Week 6 | In staging, on a phone: alias mode → report → moderation queue → reveal writes an audit row; RSVP + a staging reminder actually arrives; notes search/upvote; daily poll auto-opens and the leaderboard updates within 5 s. |
| **M3 — Launch** | End of Week 8 | All PRD §17 acceptance criteria green, no open P0/P1 bugs, restore drill done, 5–10 student UAT signed off → **go-live** with launch comms. |

**Gates:** **Go/No-Go #1** end of W3 (realtime stable? else cut presence/typing now — they're already v1.5) · **#2** end of W5 (safety gate: full report→reveal→ban chain proven) · **#3** end of W6 (scope decision for W7: conditional modules yes/no).

---

## 3. Week-by-Week (solo, concrete)

### Week 1 — Foundation & first login
- **Day 1 accounts:** create the new **Gmail** (2FA → App Password, recovery phone/email, sender name "VibeZone") · GitHub repo · Vercel project (**region `bom1`**) · OCI tenancy — **home region Mumbai `ap-mumbai-1`** (card on file, never charged).
- **OCI VM (A1, 2 OCPU/12 GB):** Docker Compose = PostgreSQL 16 (`ssl=on`, SCRAM, custom port, `pg_hba hostssl`, least-privilege app role) + Caddy (WSS + Let's Encrypt on `<vm-ip>.sslip.io`) + **weekly keep-alive heartbeat** + nightly `pg_dump` → Object Storage + Uptime Kuma. Security list: SSH key-only, WSS, custom PG port.
- **CI/CD:** Vercel Git integration (preview per branch) + GitHub Actions workflow for the VM (`ssh → docker compose pull && up -d`).
- **App:** Prisma schema (PRD §10) → staging DB; OTP flow (request/verify/lockout, 10-min TTL) + session cookie; VM mailer endpoint (shared secret) → Gmail SMTP; `CAMPUS_EMAIL_DOMAINS=pwioi.com` enforced (accept `*@pwioi.com`, reject all else — D11).
- **Day-1 email test batch** to 5 real mailboxes — check inbox placement before building more.
- **Exit/Exit:** OTP login works end-to-end on a Vercel preview URL.

### Week 2 — Profiles, announcements, shell
- Profile CRUD + avatar (Object Storage pre-signed) + handle uniqueness; role guard middleware (seed = super admin, D10).
- Announcement composer (categories, pin, sanitized body) + **public SSR feed** (no login) with cached revalidate.
- App shell: mobile bottom nav, dark/light toggle, GA4 base + `sign_up/login/announcement_view` events.
- Seeds: 5 announcements, 5 channels, admin user.
- **Exit:** guest reads the board; super admin publishes; profile complete. (M1 interim)

### Week 3 — Realtime chat core → ⭐ M1
- Socket.IO gateway on the VM: session-token handshake, membership checks, rate limits (20/min), profanity hook, message history cursor pagination, edit ≤15 min / soft delete, DMs, report button → `message_reports`.
- Client: channel list, message pane with optimistic send + reconnect states.
- Hardening: security headers (CSP/HSTS), lint/type/test CI gates, 30-socket load sanity.
- **M1 demo + Go/No-Go #1 (Friday).**

### Week 4 — Events, reminders, notes
- Events CRUD + RSVP (unique, capacity, "Full") + `.ics` (skip if behind).
- **VM scheduler v1:** T-24 h / T-1 h reminders (Web Push + email) + poll scheduler skeleton; Web Push subscribe flow + notification prefs (global on/off).
- Notes: submit (https links only), search + filters, upvote, `note_open`, report link.
- Seeds: 4 events, ≥ 20 notes.
- **Exit:** a short-window staging event's reminder actually arrives; notes searchable.

### Week 5 — Alias mode + moderation console → 🛡 safety gate
- Alias toggle per channel + display mapping; profanity filter live; report queue with context; actions dismiss/delete/warn/ban + **3-strike auto-ban**; **reveal-alias** (mandatory reason → `audit_logs`); admin dashboard (open reports, DAU sparkline, role grants, recent bans); ban/appeal screen.
- Test the full trust-&-safety chain end to end: aliased abuse → report → reveal (audit row verified) → warn ×3 → auto-ban.
- **Go/No-Go #2 (Friday):** safety gate passed before gamification begins.

### Week 6 — Polls, points, leaderboard → ⭐ M2
- VM scheduler: poll publish 07:00 IST / close 23:00 IST; idempotent voting (409 on double vote) → percentages after vote; `points_ledger` with daily caps + dedupe; weekly rollover (Mon 00:00 IST) + leaderboard UI (week / all-time + your rank); anti-gaming anomaly query.
- GA4 DebugView audit — full PRD §13 taxonomy firing.
- Seed 30-question poll bank; pre-seed ambassadors so the board isn't empty.
- **M2 demo (Friday) + Go/No-Go #3:** decide Week 7 conditional modules (Lost & Found / Seniors Connect: only if ≥ 1 week ahead — D6).

### Week 7 — Feedback, notifications, drill
- **Anonymous feedback:** honeypot + 1/day per salted `ip_hash` + zero user linkage (verify the row in SQL), admin queue `open → in_review → resolved`, copy "goes to the VibeZone admin team" (D9).
- Notification inbox + fan-out for every trigger (DM, announcement, reminder, poll, moderation outcome).
- **Backup restore drill:** prod-like dump → restored locally → row counts verified; write the **runbook** (deploy, rollback, ban, restore, SMTP switch, heartbeat).
- Conditional: Lost & Found / Seniors Connect **only if ahead**.
- **Exit:** every P0 feature implemented.

### Week 8 — Hardening, UAT, launch
- OWASP pass: headers, authz matrix on every route, rate limits, upload validation, secrets only in env, dependency audit.
- NFR measurements: p75 LCP, API p95, socket p95 — fix anything over budget.
- Playwright smoke (6 critical flows) + manual matrix (iOS Safari, Android Chrome, dark/light).
- **UAT:** 5–10 students over 3 days on preview deployments; bug bash; fix P0/P1 only.
- Full seed (PRD Appendix B) + launch content.
- **Launch checklist (§6) → go-live** with class-rep announcement + first official post; tag `v1.0.0`.

---

## 4. Effort Estimate (P0 only, solo)

| # | Workstream | Days | Week(s) |
|---|-----------|-----:|---------|
| 1 | Infra: OCI VM, Vercel project, WSS/TLS, CI, backups, monitoring | 5 | 1 |
| 2 | Data layer: Prisma schema, migrations, seeds | 3 | 1 |
| 3 | Auth + profiles + avatars | 4 | 1–2 |
| 4 | Announcements (public SSR + composer) | 2 | 2 |
| 5 | Realtime chat core (gateway + UI + DMs) | 6 | 3–4 |
| 6 | Aliases + moderation + audit + dashboard | 5 | 5 |
| 7 | Events + RSVP + VM scheduler reminders | 4 | 4 |
| 8 | Notes repository | 3 | 4 |
| 9 | Polls + points + leaderboard | 5 | 6 |
| 10 | Anonymous feedback portal | 1.5 | 7 |
| 11 | Notifications (inbox + fan-out + push) | 3 | 4–7 |
| 12 | UI system, theme, mobile pass (spans all) | 7 | 1–8 |
| 13 | QA, security pass, NFR fixes | 4 | 3–8 |
| 14 | Content seeding + launch | 3 | 6–8 |
| | **Total (P0)** | **≈ 55** | 8 weeks at Mode A |
| + | Conditional: Lost & Found (4) + Seniors Connect (4) + trivia (2) | 10 | only if ahead (D6) |

---

## 5. Engineering Standards (solo, trimmed)

- **Branching:** trunk-based; short feature branches; self-review diff before merge; tag `v1.0.0` at launch.
- **CI gates:** typecheck → lint → unit tests → build → Prisma `migrate diff`. Preview deploy per branch = your test bed.
- **Definition of Done (self-check):** ① Zod validation + authz rule on the route ② unit/integration test for logic (points, vote idempotency, rate limits, reveal) ③ GA4 event if the taxonomy requires it ④ mobile viewport + dark/light checked ⑤ FR/NFR IDs referenced in commit/PR ⑥ nothing pushed at night that breaks tomorrow's demo.
- **Bus-factor protection (R10):** push daily; `LOG.md` with decisions; README architecture diagram; **all secrets** in Vercel env + password manager (never chat/git); runbook + verified restore.
- **Sunday ritual (30 min):** plan-vs-actual, cut-line decision, next week's 3 outcomes written down.

---

## 6. Launch Checklist (Go/No-Go, last 48 h)

**Technical**
- [ ] All PRD §17 AC1–AC12 checked with evidence (screenshots / test run links; AC9 per D6)
- [ ] Load sanity: 50 concurrent sockets, 100 req/min API — no errors, p95 < 500 ms
- [ ] Security pass: headers, authz matrix, rate limits, secrets out of git, DB hardening checklist (R3) verified
- [ ] Restore drill documented; rollback = previous Vercel deploy + previous VM image tag — both tested
- [ ] Uptime Kuma + Sentry alerts reach you; log rotation on; keep-alive heartbeat running
- [ ] GA4 live (DebugView verified); Gmail test batch passed from the VM in prod config
- [ ] Checked from outside your network: `vibezone.vercel.app` (HTTPS) and `wss://<vm-ip>.sslip.io` both green

**Content & roles**
- [ ] Seeds complete (PRD Appendix B): 5 announcements, 20 notes, 4 events, 30-question poll bank, channels
- [ ] Super admin account = you; at least 1 backup moderator granted from the dashboard (Q3) and briefed on the 24-h SLA + reveal policy
- [ ] 8–10 ambassadors pre-seeded on the leaderboard *(Seniors onboarded only if D6 ships Seniors Connect)*

**Go-to-market**
- [ ] Launch tied to a real campus moment; class-rep + official channels announcement scheduled
- [ ] Feedback explainer posted ("goes to the VibeZone admin team", not an official complaint channel — D9)
- [ ] Day-1 poll queued to auto-publish at 07:00 IST

---

## 7. Cut Lines (solo — execute top-down; never touch P0 core)

| Order | Cut / defer | Saves | Trigger |
|------|-------------|------:|---------|
| 1 | Trivia quiz, `.ics`/CSV exports, OG/SEO metadata | ~3 d | Behind after Week 4 |
| 2 | **Lost & Found + Seniors Connect → v1.5** (default per D6) | 8 d | At Go/No-Go #3 unless ≥1 week ahead |
| 3 | PWA install/offline (keep plain responsive + push) | ~2 d | Behind at Week 6 |
| 4 | **Push notifications → in-app inbox only** (v1.5 push) | ~3 d | Behind at Week 6 (biggest single save) |
| 5 | Admin dashboard → single queue page (no sparkline) | ~1.5 d | Behind in Week 7 |
| 6 | Playwright → 3 smoke tests + manual matrix | ~2 d | Behind in Week 8 |
| — | **Never cut:** OTP auth · public announcements · chat + aliases + moderation chain · polls/points/leaderboard · anonymous feedback · backups · security pass | — | Trust & habit core |

**If two cuts already applied and still behind in Week 8:** launch P0 without push and without UAT breadth (3 testers), then run a hardening week as v1.0.1 — never launch with an unproven moderation chain.

---

## 8. Post-Launch Operations (solo, 10–15 min/day)

| Cadence | Activity |
|---------|----------|
| Daily (first 2 weeks) | Moderation queue + Sentry + uptime; fix P0/P1 same day; publish the daily poll; thank an active user publicly |
| Weekly | GA4 snapshot vs PRD §2.3 KPIs; points-gaming anomaly query; content top-up; backup spot-check + dependency audit |
| Monthly | Credential rotation (DB + shared secrets), restore re-drill, Vercel/OCI limit review (R11/R12) |
| v1.5 order | ① Lost & Found ② Seniors Connect ③ push (if cut) ④ direct note uploads ⑤ typing/presence ⑥ DM block list + search ⑦ trivia + leaderboard seasons |

**Support:** single `support@` contact + in-app "Report a problem". Severities: **S1** broken core flow/security → fix < 24 h · **S2** degraded → < 3 days · **S3** cosmetic → next release.

**6-week checkpoint:** review KPIs (PRD §2.3) → decide v2 scope (streaming per D2) and whether a $10–15/yr domain is worth it (D5).

---

## 9. Timeline (Gantt, Mode A)

```
Workstream               W1   W2   W3   W4   W5   W6   W7   W8
Infra + CI (OCI/Vercel)  ████
Data layer + OTP          ████████
Announcements + shell        ████████
Realtime chat                    ████████
Aliases + moderation                     ████████
Events + scheduler + push                    ████████
Notes                                            ████
Polls + points + leaderboard                        ████████
Feedback + notifications                                ████████
Conditional L&F/Mentorship                         ░░░░(only if ahead)
QA · security · NFR         ░░░░░░░░░░░░░░░░░░░░░░░░████████
Seeding + content                       ░░░░░░░░████████
UAT + launch                                            ░░██████
```
`████` active · `░░░` ramping/continuous · Gates: Go/No-Go #1 Fri W3 · #2 Fri W5 · #3 Fri W6 · launch Fri W8.

---

## 10. Immediate Next Actions (first 5 working days)

1. ~~Send me the exact campus email domain string~~ ✅ **resolved (D11):** set `CAMPUS_EMAIL_DOMAINS=pwioi.com` — the login test must accept `*@pwioi.com` and reject every other domain.
2. **Configure `vibezoneioi25@gmail.com`:** turn on 2-Step Verification → generate a **16-char App Password** for SMTP (never the account password) → set recovery phone/email → sender display name "VibeZone"; send the Day-1 test batch to 5 mailboxes and check inbox placement.
3. **OCI console:** confirm home region is **Mumbai (`ap-mumbai-1`)**; launch A1 VM (2 OCPU/12 GB); open security list (SSH key-only, WSS, custom PG port); create Object Storage bucket + lifecycle rule.
4. **Vercel:** import the GitHub repo, set region **`bom1`**, add env vars: `DATABASE_URL`, `SESSION_SECRET`, `VAPID_*`, `MAILER_SECRET`, `SMTP_USER=vibezoneioi25@gmail.com`, `SMTP_APP_PASSWORD` (the 16-char App Password), `CAMPUS_EMAIL_DOMAINS=pwioi.com` (D11), `NEXT_PUBLIC_REALTIME_URL`.
5. Compose file + Prisma schema on the VM; OTP loop green on a preview URL — **first demoable win**. Then book your self-review checkpoints: Fridays of W3, W6, W8.
