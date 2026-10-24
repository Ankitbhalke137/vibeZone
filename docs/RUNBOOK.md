# VibeZone — Ops Runbook

> Solo bus-factor protection (plan §5). Keep this current — the future-you at 2 a.m. is the audience.
> Status: **Phase 1** — sections marked _(Week N)_ get filled as phases ship.

## 1. Architecture (Phase 1)

```
Vercel (bom1)  ── https ──▶  browser
     │
     ├── Postgres : TLS, port 15432 ──▶ OCI VM (ap-mumbai-1) · Docker: postgres + mailer + caddy
     └── POST /send + secret ────────▶ Caddy (https://<VM_IP>.sslip.io) → mailer → Gmail SMTP :587
```

VM ports open in the OCI security list: **22** (key-only), **80/443** (Caddy), **15432** (Postgres, TLS-only via pg_hba).

## 2. Everyday commands

| Task | Command |
|---|---|
| App — local | `npm run dev` |
| DB create/update | `npm run db:push` |
| DB constraints | `npm run db:harden` |
| DB seed | `npm run db:seed` |
| VM services up | `cd vm && docker compose up -d --build` |
| VM logs | `docker compose logs -f --tail=100` |
| App deploy | push to `main` → Vercel auto-deploys |
| VM deploy _(Week 3)_ | GitHub Action `deploy-vm.yml` (manual `workflow_dispatch` first) |

## 3. Backup & restore (NFR-010)

- **Automatic:** nightly `pg_dump` → Object Storage, 30-day lifecycle (cron job — _(Week 1 setup below)_).
- **Manual dump:** `docker compose exec postgres pg_dump -U vibezone -Fc vibezone > vibezone-$(date +%F).dump`
- **Restore drill (required before launch):** copy a dump locally →
  `docker compose exec -T postgres pg_restore -U vibezone -d vibezone --clean --if-exists < dump`
  → verify row counts (`select count(*) from users;` etc). Record date + counts below.

| Drill date | users | messages | notes | Restored by |
|---|---|---|---|---|
| _pending_ | | | | |

### Nightly backup job (add to VM crontab)

```sh
# crontab -e  (runs 03:15 IST daily)
15 3 * * * docker exec vibezone-postgres pg_dump -U vibezone -Fc vibezone > /opt/backups/vibezone-$(date +\%F).dump && \
  /usr/bin/env bash -c 'command -v oci >/dev/null && echo skip || true' # upload step: see §6
```
_(Simpler upload: install `oci` CLI or `rclone` against the Object Storage bucket — Week 1 task.)_

## 4. Incidents

| Symptom | First moves |
|---|---|
| App down on Vercel | Check Sentry → redeploy previous good commit (Vercel → Deployments → … → Promote) |
| DB unreachable | `cd vm && docker compose ps && docker compose logs postgres --tail=200` → restart: `docker compose restart postgres` |
| VM reclaimed by Oracle | Recreate A1 instance (same shape ≤ 2 OCPU/12 GB), re-run `docker compose up -d`, restore latest dump, update Vercel `DATABASE_URL` if IP changed |
| OTP emails not arriving | `docker compose logs mailer` → test: `curl -sS -X POST https://<domain>/send -H 'x-mailer-secret: …' -H 'content-type: application/json' -d '{"to":"you@pwioi.com","subject":"test","text":"test"}'` → check Gmail "less secure"/lockout → rotate App Password (Q2) |
| Chat gateway down _(Week 3)_ | `docker compose restart realtime` |

## 5. Security chores

- **Weekly:** `docker compose exec postgres psql -U vibezone -d vibezone -c "select usename, application_name, state from pg_stat_activity;"`
- **Monthly:** review `audit_logs` (esp. `reveal_alias`), check Uptime Kuma, `npm audit`
- **Rotate before launch + quarterly:** DB password, `SESSION_SECRET`, `MAILER_SECRET`, Gmail App Password (Q2 — it was exposed in chat)
- **DB password rotation:** `ALTER ROLE vibezone PASSWORD '…';` then update Vercel `DATABASE_URL` + `vm/.env`, `docker compose up -d postgres`

## 6. Environment inventory

| Secret | Lives in | Set? |
|---|---|---|
| `SESSION_SECRET` | Vercel + `.env.local` | ☐ |
| `DATABASE_URL` (incl. DB password) | Vercel + `.env.local` | ☐ |
| `MAILER_SECRET` | Vercel + `vm/.env` | ☐ |
| `SMTP_APP_PASSWORD` | **only** `vm/.env` | ☐ (rotate!) |
| `CAMPUS_EMAIL_DOMAINS` | `pwioi.com` (not secret) | ☐ |
| `SUPER_ADMIN_EMAILS` | your email (not secret) | ☐ |

## 7. Weekly ops rhythm (plan §8)

Daily (first 2 weeks): moderation queue · Sentry · uptime · publish poll.
Weekly: GA4 snapshot vs PRD §2.3 · points-gaming query · backup spot-check · `npm audit`.
