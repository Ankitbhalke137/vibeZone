# Neon database setup (D12)

VibeZone uses **Neon Postgres** (free tier). The OCI VM no longer runs Postgres.

## 1. Create the project

1. Sign in at <https://neon.tech> → **New Project**.
2. Region: **AWS ap-southeast-1 (Singapore)** (closest free region to Mumbai).
3. Project name `vibezone`; database name `vibezone`.
4. Copy both connection strings from **Connect**:
   - **Pooled** — host contains `-pooler`. This is `DATABASE_URL` (used by Vercel).
   - **Direct** — host has no `-pooler`. This is `DIRECT_URL` (used by `prisma db push`).

Append `sslmode=require` to both. For the pooled URL also add `&pgbouncer=true`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/vibezone?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.ap-southeast-1.aws.neon.tech/vibezone?sslmode=require"
```

> Prisma reads `directUrl` for migrations/`db push`, so the pooled connection can
> stay PgBouncer-safe while schema changes use the direct endpoint.

## 2. Apply schema + seed

```bash
npm run db:push     # uses DIRECT_URL automatically
npm run db:harden   # CHECK constraints (sql/harden.sql)
npm run db:seed
```

## 3. Vercel

Add `DATABASE_URL`, `DIRECT_URL` and the rest of `.env.example` to the project's
environment variables (Production + Preview). Redeploy.

## 4. VM containers

`vm/.env` needs the **pooled** URL as `DATABASE_URL` — the realtime gateway and
scheduler are long-running Node processes and work well through PgBouncer.

## 5. Free-tier notes

- Neon free tier: ~0.5 GB storage, autosuspend after inactivity (~5 min).
- First query after suspend can take 1–2 s. Vercel functions have a 300 s limit;
  the app sets no aggressive timeouts.
- `DIRECT_URL` is only used for schema operations, so autosuspend does not affect
  normal traffic.
- Keep **one** Neon project for production and use a separate database/branch for
  staging (`vibezone_staging`).

## 6. Backups (NFR-010)

Neon free includes point-in-time restore for a short window. Additionally run a
nightly logical dump from the VM (or your laptop) to OCI Object Storage:

```sh
pg_dump "$DIRECT_URL" -Fc -f vibezone-$(date +%F).dump
```

Retain 30 nightly dumps + 8 weekly dumps. Restore drill before launch:

```sh
pg_restore --clean --if-exists -d "$DIRECT_URL" vibezone-YYYY-MM-DD.dump
```

## 7. Local development

You can point `.env.local` at the same Neon project while building. If you prefer
a local Postgres, set both `DATABASE_URL` and `DIRECT_URL` to
`postgresql://localhost:5432/vibezone`.
