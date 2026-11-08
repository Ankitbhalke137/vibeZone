# GitHub Issues — VibeZone v1.0.0 Professionalization

**Repo:** https://github.com/Ankitbhalke137/vibeZone.git  
**Branch:** `feat/professionalization` (these files are local artifacts, uncommitted)

> NOTE: No GitHub token is available, so issues cannot be created via the API.
> These are local artifacts, ready to copy/paste into GitHub "New issue":
> https://github.com/Ankitbhalke137/vibeZone/issues/new
>
> How to use each block: copy the **Title** into the issue title, copy the
> **Body** into the issue description, then apply the listed **Labels** and set
> **Priority** in the right-hand sidebar. Suggested assignee is shown for reference.

---

## Index

| # | Title | Labels | Priority | Suggested assignee |
|---|-------|--------|----------|--------------------|
| 1 | Rotate exposed Gmail App Password | `security`, `bug`, `priority: P0` | P0 — critical | @Ankitbhalke137 |
| 2 | Complete backup/restore drill and record in RUNBOOK | `infrastructure`, `testing`, `priority: P0` | P0 | @Ankitbhalke137 |
| 3 | Confirm/set all production secrets in Vercel + vm/.env | `infrastructure`, `security`, `priority: P0` | P0 | @Ankitbhalke137 |
| 4 | Run 5–10 student UAT on preview deployments | `testing`, `feature`, `priority: P0` | P0 | @Ankitbhalke137 |
| 5 | Tag v1.0.0 and go-live | `feature`, `infrastructure`, `priority: P0` | P0 | @Ankitbhalke137 |
| 6 | Fix vitest worker pool crash so tests run reliably | `bug`, `testing`, `priority: P1` | P1 | @Ankitbhalke137 |
| 7 | Add missing test coverage for lib modules and API routes | `testing`, `feature`, `priority: P1` | P1 | @Ankitbhalke137 |
| 8 | Professionalize README + add screenshots | `documentation`, `feature`, `priority: P1` | P1 | @Ankitbhalke137 |
| 9 | Add branch protection rules to main | `infrastructure`, `documentation`, `priority: P1` | P1 | @Ankitbhalke137 |
| 10 | Scope review: decide which P1/v2 features to keep vs cut for v1 | `feature`, `documentation`, `priority: P2` | P2 | @Ankitbhalke137 |
| 11 | Add custom domain decision at 6-week checkpoint | `infrastructure`, `documentation`, `priority: P3` | P3 | @Ankitbhalke137 |

Milestone suggestion: `v1.0.0` for issues 1–5; `v1.1` or `v2` for issues 6–11 per the scope review (issue 10).

---

## Issue 1 — Rotate exposed Gmail App Password

**Labels:** `security`, `bug`, `priority: P0`  
**Priority:** P0 — critical (blocker before any launch)  
**Suggested assignee:** @Ankitbhalke137 (repo owner)

### Body (copy into GitHub issue description)

## Description
`.env.example` is committed to git and contains a **real Gmail App Password** for the mailer account `vibezoneioi25@gmail.com`:

```
SMTP_APP_PASSWORD="ybyz rsbx tjvd enwh"
```

This secret is now exposed in the git repository and possibly in shared chat logs. It must be treated as **compromised** and rotated immediately. The same credential is used by the VM mailer service (`vm/.env`) and any runtime copy of the app.

### Why it matters
- Anyone with repo access (or fork access) can send email from this Gmail account or reset it.
- App passwords bypass 2FA, so the account is effectively fully exposed.
- v1 cannot go live with a leaked credential.

### Acceptance criteria
- [ ] Old App Password revoked in Google Account → Security → 2-Step Verification → App passwords.
- [ ] New App Password generated (16 chars) and stored **only** in `vm/.env` on the VM (gitignored) and any runtime secret store.
- [ ] `.env.example` contains only a placeholder: `SMTP_APP_PASSWORD=""` — never a real value.
- [ ] `vm/.env.example` contains only a placeholder comment/empty value.
- [ ] Git history scanned (`git log -p --all -S 'ybyz rsbx tjvd enwh'`); if the password appears in history, history is purged or the account is considered fully rotated (revoking the old password is the primary control).
- [ ] Mailer still sends OTPs end-to-end on the VM after rotation (smoke test: signup → OTP received).
- [ ] No real secrets appear in chat logs shared with the team; old logs containing the password are deleted where possible.

### Labels
`security`, `bug`, `priority: P0`

### Suggested assignee
@Ankitbhalke137

---

## Issue 2 — Complete backup/restore drill and record in RUNBOOK

**Labels:** `infrastructure`, `testing`, `priority: P0`  
**Priority:** P0  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
Before go-live we must prove we can recover from database loss or VM failure. Neon Postgres (free tier) provides automatic backups; the VM runs mailer, realtime gateway, and scheduler as Docker containers. A restore drill verifies backups actually work and produces documented recovery steps (RTO/RPO) in `docs/operations/RUNBOOK.md`.

### Acceptance criteria
- [ ] Neon backup/restore tested: restore to a scratch Neon project, run Prisma schema push, verify schema + seed data are intact.
- [ ] VM backup procedure documented: which Docker volumes/configs to back up (Caddy certs, mailer state, scheduler logs), frequency, and retention.
- [ ] Full restore drill executed end-to-end in a scratch environment (app + VM stack).
- [ ] `docs/operations/RUNBOOK.md` contains a "Disaster recovery / restore drill" section with: step-by-step restore instructions, RTO, RPO, last-tested date, and owner.
- [ ] Drill signed off before the v1.0.0 tag (issue 5).

### Labels
`infrastructure`, `testing`, `priority: P0`

### Suggested assignee
@Ankitbhalke137

---

## Issue 3 — Confirm/set all production secrets in Vercel + vm/.env

**Labels:** `infrastructure`, `security`, `priority: P0`  
**Priority:** P0  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
Audit every secret required by production and confirm each one is set in the right place, with real values never committed to git. Secrets live in two places:
- **Vercel** project settings → Environment Variables (Production and Preview environments)
- **VM**: `vm/.env` (created from `vm/.env.example`, gitignored)

### Secrets to confirm
| Secret | Where | Notes |
|---|---|---|
| `DATABASE_URL` | Vercel + vm/.env | Neon pooled URL (`&pgbouncer=true`), `sslmode=require` |
| `DIRECT_URL` | Vercel + vm/.env | Neon direct URL, used by Prisma |
| `SESSION_SECRET` | Vercel + vm/.env | Must match across app and VM; `openssl rand -hex 32` |
| `SUPER_ADMIN_EMAILS` | Vercel | First-login admin bootstrap |
| `MAILER_SECRET` | Vercel + vm/.env | App → mailer route shared secret |
| `SMTP_APP_PASSWORD` | vm/.env only | Gmail App Password — see issue 1, never in .env.example |
| `SMTP_USER` | vm/.env | `vibezoneioi25@gmail.com` |
| `REALTIME_SECRET` | Vercel + vm/.env | App → Socket.IO gateway secret |
| `VAPID_PRIVATE_KEY` / `VAPID_PUBLIC_KEY` | Vercel + vm/.env | Web Push key pair |
| `NEXT_PUBLIC_APP_URL` | Vercel | `https://vibezone.vercel.app` (or custom domain) |
| `NEXT_PUBLIC_REALTIME_URL` | Vercel | `https://<VM_IP>.sslip.io` |
| `FEEDBACK_SALT` | Vercel | Falls back to SESSION_SECRET if empty |

### Acceptance criteria
- [ ] Secrets checklist (table above or equivalent) exists in the repo, listing every required var, where it lives, and owner.
- [ ] All vars set in Vercel for both Production and Preview environments.
- [ ] `vm/.env` created on the VM from `vm/.env.example` with real values.
- [ ] `.env.local` and `vm/.env` confirmed present in `.gitignore`; `git status` clean with no secrets committed.
- [ ] Production build + smoke test passes with the real Vercel env vars.

### Labels
`infrastructure`, `security`, `priority: P0`

### Suggested assignee
@Ankitbhalke137

---

## Issue 4 — Run 5–10 student UAT on preview deployments

**Labels:** `testing`, `feature`, `priority: P0`  
**Priority:** P0  
**Suggested assignee:** @Ankitbhalke137 (recruit student testers)

### Body

## Description
Recruit 5–10 actual students from the `@pwioi.com` campus to test the app on preview deployments (Vercel preview per PR, or a dedicated staging/preview deployment). Testers perform real user flows: sign up with OTP, post announcements/messages, RSVP to events, submit notes, use the feedback portal. Record all bugs and UX friction; all blockers must be fixed or explicitly accepted before v1 go-live.

### Acceptance criteria
- [ ] 5–10 student testers recruited, each with a `@pwioi.com` campus email.
- [ ] UAT test script covers: signup/OTP flow, announcements (read/create), chat (channel + DM), events (list/RSVP), notes (submit/read), feedback portal.
- [ ] Each tester uses a preview deployment URL (not localhost).
- [ ] Results logged: issues filed with severity, steps to reproduce, tester name.
- [ ] All P0/P1 UAT bugs resolved or explicitly risk-accepted before the v1.0.0 tag.
- [ ] UAT summary posted in the v1.0.0 release notes or linked issue.

### Labels
`testing`, `feature`, `priority: P0`

### Suggested assignee
@Ankitbhalke137

---

## Issue 5 — Tag v1.0.0 and go-live

**Labels:** `feature`, `infrastructure`, `priority: P0`  
**Priority:** P0  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
Cut the v1 release: create the `v1.0.0` git tag on `main`, publish a GitHub Release, deploy to Vercel production, and run a post-launch watch. This issue may only be started after issues 1–4 are complete and issue 10's scope review has frozen the v1 feature set.

### Acceptance criteria
- [ ] All P0 issues (1–4) closed; all P1 issues either closed or moved to the v1.1/v2 milestone.
- [ ] `git tag v1.0.0` created on `main` and pushed to origin.
- [ ] GitHub Release `v1.0.0` published with release notes and links to key issues.
- [ ] Production deploy on `vibezone.vercel.app` verified: build succeeds, smoke test passes (auth, chat, events).
- [ ] Custom domain decision from issue 11 applied (if decided at checkpoint).
- [ ] 48-hour post-launch monitoring window with zero sev-1 incidents.

### Labels
`feature`, `infrastructure`, `priority: P0`

### Suggested assignee
@Ankitbhalke137

---

## Issue 6 — Fix vitest worker pool crash so tests run reliably

**Labels:** `bug`, `testing`, `priority: P1`  
**Priority:** P1  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
`npm test` (`vitest run`) intermittently crashes with a **vitest worker pool** error, making local and CI test runs unreliable. The root cause is likely worker-pool configuration (threads vs fork pool, `maxWorkers`, file parallelism, or mixing Node/DOM test environments). Stabilize `vitest.config.ts` so `npm test` exits 0 deterministically.

### Acceptance criteria
- [ ] `npm test` passes locally 3 consecutive runs without any worker-pool crash.
- [ ] `vitest.config.ts` updated with stable pool settings (pool type, `maxWorkers`, environment per file as needed).
- [ ] All existing tests in `lib/__tests__/` are green.
- [ ] Test run is part of the definition of done for every PR (see `docs/development/CONTRIBUTING.md`).

### Labels
`bug`, `testing`, `priority: P1`

### Suggested assignee
@Ankitbhalke137

---

## Issue 7 — Add missing test coverage for lib modules and API routes

**Labels:** `testing`, `feature`, `priority: P1`  
**Priority:** P1  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
Tests exist only for a few lib modules under `lib/__tests__/` (otp, sanitize, utils, avatars, auth, format, profanity, session, time, posts). There are **no tests for API routes** under `app/api/`. Add vitest coverage for the remaining lib modules and the critical API routes so regressions are caught before merge.

### Acceptance criteria
- [ ] At least one test file for every lib module lacking coverage.
- [ ] Test files for critical API routes: auth (request-otp/verify-otp), mailer/send, feedback, events (RSVP), announcements.
- [ ] `npm test` green; coverage report generated after the run.
- [ ] New tests added alongside any new lib module or API route (definition of done).

### Labels
`testing`, `feature`, `priority: P1`

### Suggested assignee
@Ankitbhalke137

---

## Issue 8 — Professionalize README + add screenshots

**Labels:** `documentation`, `feature`, `priority: P1`  
**Priority:** P1  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
Rewrite `README.md` into a professional project front door: badges, stack table, feature list with screenshots of key screens, local dev instructions, deploy instructions, secrets policy, and a link to `CONTRIBUTING.md`. Add screenshots of at least the landing page, auth flow, chat, events, and admin dashboard.

### Acceptance criteria
- [ ] README has badges (build, license/stack), current stack table, and feature list.
- [ ] ≥ 4 screenshots of key pages (landing, auth, chat, events, admin dashboard) embedded and stored in the repo (`public/screenshots/` or committed assets).
- [ ] Local dev and deploy instructions match the current repo (Vercel + VM, Neon, `.env.local` / `vm/.env`).
- [ ] Secrets policy and link to `CONTRIBUTING.md` present.
- [ ] Screenshots regenerated if UI changes before v1.

### Labels
`documentation`, `feature`, `priority: P1`

### Suggested assignee
@Ankitbhalke137

---

## Issue 9 — Add branch protection rules to main

**Labels:** `infrastructure`, `documentation`, `priority: P1`  
**Priority:** P1  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
Configure GitHub branch protection on `main` so no code can land without review and passing status checks. Rules are specified exactly in `docs/development/BRANCH_PROTECTION.md`, including the GitHub UI navigation path and every toggle to flip.

### Acceptance criteria
- [ ] Branch protection rule created for `main` per `docs/development/BRANCH_PROTECTION.md`.
- [ ] Verified: direct push to `main` is blocked; PR requires 1 approving review + status checks.
- [ ] "Include administrators" enabled so rules apply to repo admins too.
- [ ] Force pushes and deletions of `main` disallowed.

### Labels
`infrastructure`, `documentation`, `priority: P1`

### Suggested assignee
@Ankitbhalke137

---

## Issue 10 — Scope review: decide which P1/v2 features to keep vs cut for v1

**Labels:** `feature`, `documentation`, `priority: P2`  
**Priority:** P2  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
Review `docs/product/PRD-v2.md`, the P1 feature list, and the 8-week delivery plan. Decide, feature by feature, what to **keep**, **cut**, or **defer** for v1.0.0. Record the decision log and re-scope cut items into v1.1/v2 milestones so the v1 scope is frozen before go-live (issue 5).

### Acceptance criteria
- [ ] Decision log document (or GitHub project notes) with keep/cut/defer per feature and rationale.
- [ ] v1.0.0 scope frozen; no new features added after the review without a new scope decision.
- [ ] Cut/deferred features re-scoped into GitHub milestones (v1.1 / v2).
- [ ] Review outcome communicated to all contributors before the v1 tag.

### Labels
`feature`, `documentation`, `priority: P2`

### Suggested assignee
@Ankitbhalke137

---

## Issue 11 — Add custom domain decision at 6-week checkpoint

**Labels:** `infrastructure`, `documentation`, `priority: P3`  
**Priority:** P3  
**Suggested assignee:** @Ankitbhalke137

### Body

## Description
At the 6-week checkpoint, decide whether to add a custom domain (e.g., `vibezone.app` / `vibezone.io`) or stay on `vibezone.vercel.app` + `<VM_IP>.sslip.io` for the realtime gateway. If yes: purchase the domain, configure Vercel domains and Caddy DNS on the VM, verify SSL on both app and gateway, and update `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_REALTIME_URL`.

### Acceptance criteria
- [ ] Decision recorded (custom domain: yes/no) with rationale and owner.
- [ ] If yes: domain purchased, Vercel custom domain configured with SSL, Caddy DNS/SSL verified on the VM, env vars updated in Vercel + `vm/.env`.
- [ ] If no: decision noted so it can be revisited post-v1.

### Labels
`infrastructure`, `documentation`, `priority: P3`

### Suggested assignee
@Ankitbhalke137

---

## How to create these on GitHub (no token available locally)

1. Go to https://github.com/Ankitbhalke137/vibeZone/issues/new
2. Paste the **Title** and **Body** from an issue block above.
3. In the right sidebar: set **Labels** (e.g. `security`, `bug`, `priority: P0`) and assignee.
4. Optionally add to milestone `v1.0.0` (issues 1–5) or `v1.1`/`v2` (issues 6–11).
5. Click **Submit issue**. Repeat for all 11 issues.

