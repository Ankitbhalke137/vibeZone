# VibeZone — Ops Runbook

> Solo bus-factor protection (plan §5). Keep this current — the future-you at 2 a.m. is the audience.
> Status: **Phase 2** — database is Neon (D12); the VM runs mailer, realtime, scheduler, Caddy.

## 1. Architecture

```
Vercel (bom1)  ── https ──▶  browser
     │
     ├── Neon Postgres (pooled + direct URLs, TLS) ──▶ managed database
     ├── POST /send + secret ────────▶ Caddy (https://<VM_IP>.sslip.io) → mailer → Gmail SMTP :587
     └── POST /publish + secret ─────▶ Caddy → Socket.IO gateway (WSS /socket.io)
                                        scheduler (IST cron) ──▶ Neon + mailer + Web Push
```

VM ports open in the OCI security list: **22** (key-only), **80/443** (Caddy).
No database port is exposed anywhere.

## 2. Everyday commands

| Task | Command |
|---|---|
| App — local | `npm run dev` |
| DB create/update (Neon) | `npm run db:push` |
| DB constraints | `npm run db:harden` |
| DB seed | `npm run db:seed` |
| VM services up | `cd vm && docker compose up -d --build` |
| VM logs | `docker compose logs -f --tail=100` |
| App deploy | push to `main` → Vercel auto-deploys |
| VM deploy | GitHub Action `deploy-vm.yml` (manual `workflow_dispatch` first) |

## 3. Neon database

Setup and connection strings: [`NEON.md`](./NEON.md).

| Task | Command |
|---|---|
| Schema push | `npm run db:push` (uses `DIRECT_URL`) |
| Constraints | `npm run db:harden` |
| Seed | `npm run db:seed` |
| Manual dump | `pg_dump "$DIRECT_URL" -Fc -f vibezone-$(date +%F).dump` |
| Restore | `pg_restore --clean --if-exists -d "$DIRECT_URL" dump` |
| Check connections | `psql "$DIRECT_URL" -c "select count(*) from pg_stat_activity;"` |

**Backup & restore (NFR-010):** nightly dump → OCI Object Storage, 30-day retention
+ 8 weekly dumps. Record drills here:

| Drill date | users | messages | notes | Restored by |
|---|---|---|---|---|
| _pending_ | | | | |

## 4. Incidents

| Symptom | First moves |
|---|---|
| App down on Vercel | Check Sentry → redeploy previous good commit (Vercel → Deployments → … → Promote) |
| DB unreachable | Neon dashboard → project status/usage; check Vercel `DATABASE_URL`; Neon autosuspends after ~5 min idle (first query is slower) |
| DB connection limit | Use the **pooled** `DATABASE_URL` on Vercel and in `vm/.env`; direct URL only for schema operations |
| OTP emails not arriving | `docker compose logs mailer` → test: `curl -sS -X POST https://<domain>/send -H 'x-mailer-secret: …' -H 'content-type: application/json' -d '{"to":"you@pwioi.com","subject":"test","text":"test"}'` → check Gmail lockout → rotate App Password (Q2) |
| Chat gateway down | `docker compose restart realtime`; check `curl https://<domain>/health` |
| Scheduler stopped | `docker compose logs scheduler --tail=200`; reminders/polls will catch up on the next tick |
| VM reclaimed by Oracle | Recreate A1 instance (same shape ≤ 2 OCPU/12 GB), re-run `docker compose up -d`, update `CADDY_DOMAIN` if IP changed. Neon is unaffected. |

## 5. Security chores

- **Weekly:** review Neon usage, `docker compose ps`, Uptime Kuma, `npm audit`.
- **Monthly:** review `audit_logs` (esp. `reveal_alias`), rotate `REALTIME_SECRET`/`MAILER_SECRET`, check Vercel/Neon limits.
- **Rotate before launch + quarterly:** Neon DB password, `SESSION_SECRET`, `MAILER_SECRET`, `REALTIME_SECRET`, Gmail App Password (Q2 — it was exposed in chat).
- **Neon password rotation:** Neon Console → Roles → reset password → update Vercel `DATABASE_URL`/`DIRECT_URL` and `vm/.env` → redeploy + `docker compose up -d`.

## 6. Environment inventory

| Secret | Lives in | Set? |
|---|---|---|
| `DATABASE_URL` (Neon pooled) | Vercel + `vm/.env` + `.env.local` | ☐ |
| `DIRECT_URL` (Neon direct) | Vercel + `.env.local` | ☐ |
| `SESSION_SECRET` | Vercel + `vm/.env` + `.env.local` | ☐ |
| `MAILER_SECRET` | Vercel + `vm/.env` | ☐ |
| `REALTIME_SECRET` | Vercel + `vm/.env` | ☐ |
| `VAPID_PUBLIC_KEY` / `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Vercel + `vm/.env` | ☐ |
| `VAPID_PRIVATE_KEY` | Vercel + `vm/.env` | ☐ |
| `SMTP_APP_PASSWORD` | **only** `vm/.env` | ☐ (rotate!) |
| `CAMPUS_EMAIL_DOMAINS` | `pwioi.com` (not secret) | ☐ |
| `SUPER_ADMIN_EMAILS` | your email (not secret) | ☐ |

## 7. Weekly ops rhythm (plan §8)

Daily (first 2 weeks): moderation queue · Sentry · uptime · publish poll.
Weekly: GA4 snapshot vs PRD §2.3 · points-gaming query · backup spot-check · `npm audit`.
