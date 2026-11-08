# VibeZone — Testing

## Status

Unit / property-based tests live in `lib/__tests__/` (vitest 5 + fast-check) plus a skeleton suite for API routes in `app/api/__tests__/`. All changes are uncommitted on branch `feat/professionalization`.

## The worker-pool problem (read first)

`npx vitest run` (default file parallelism) crashes/hangs in this environment: **Node 26 + vitest 5.0.5** — the worker pool dies during import/transform.

**Working workaround:** run vitest with file parallelism disabled:

```
npx vitest run --no-file-parallelism [<file-or-glob>]
```

Examples:

```
# one file (fastest feedback while writing tests)
npx vitest run --no-file-parallelism lib/__tests__/alias.test.ts

# all lib tests (serial; ~90 s per file due to import/transform cost)
npx vitest run --no-file-parallelism lib/__tests__

# everything including the API-route skeletons
npx vitest run --no-file-parallelism
```

You can also execute a single file with tsx when it has no vitest-globals dependency, but most files here use `describe`/`it`/`expect` globals, so use the `vitest` command above.

`--no-file-parallelism` can be combined with a file path or directory; it runs files serially inside one vitest process, which avoids the pool crash.

## Test command

```json
"test": "vitest run"
```

Recommended daily command (workaround applied):

```
npx vitest run --no-file-parallelism
```

## Test files

| File | Module(s) covered | Style |
|------|-------------------|-------|
| `lib/__tests__/auth.test.ts` (existing) | `lib/auth.ts` — `ROLE_RANK`, `hasRole` | fast-check property |
| `lib/__tests__/otp.test.ts` (existing) | `lib/otp.ts` — `makeOtp`, `hashOtp`, `otpMatches` | fast-check property |
| `lib/__tests__/sanitize.test.ts` (existing) | `lib/sanitize.ts` — `stripTags`, `sanitizeBody` | fast-check property |
| `lib/__tests__/profanity.test.ts` (existing) | `lib/profanity.ts` — `filterChatBody` | fast-check property |
| `lib/__tests__/format.test.ts` (existing) | `lib/format.ts` — `timeAgo`, `fullDate`, `clockTime` | fast-check property |
| `lib/__tests__/utils.test.ts` (existing) | `lib/utils.ts` — `nameFromEmail`, `autoHandle`, `cn` | fast-check property |
| `lib/__tests__/session.test.ts` (existing) | `lib/session.ts` — `verifySessionToken` (jose) | unit |
| `lib/__tests__/time.test.ts` (existing) | `lib/time.ts` — IST helpers, `uuidFromString` | fast-check property |
| `lib/__tests__/posts.test.ts` (existing) | `lib/posts.ts` — `serialize` | fast-check property |
| `lib/__tests__/avatars.test.ts` (existing) | `lib/avatars.ts` — presets, validation | fast-check property |
| `lib/__tests__/alias.test.ts` (new) | `lib/alias.ts` — `generateAlias` | fast-check property |
| `lib/__tests__/rate-limit.test.ts` (new) | `lib/rate-limit.ts` — `hit` | unit + fake timers |
| `lib/__tests__/uuid.test.ts` (new) | `lib/uuid.ts` — `UUID_RE`, `isUuid` | fast-check property |
| `lib/__tests__/env.test.ts` (new) | `lib/env.ts` — `isCampusEmail`, getters | unit |
| `lib/__tests__/api.test.ts` (new) | `lib/api.ts` — `apiError`, `parseJson`, `assertSameOrigin`, `excerpt` | unit + property |
| `lib/__tests__/chat.test.ts` (new) | `lib/chat.ts` — `dmSlug`, `mentorshipSlug`, `serializeMessage` | fast-check property |
| `lib/__tests__/daily-drop.test.ts` (new) | `lib/daily-drop.ts` — `fallbackForToday`, `getDailyDrop` (fetch mocked) | unit |
| `lib/__tests__/points.test.ts` (new) | `lib/points.ts` — `awardPoints`, `awardOncePerDay`, `pointsTotal` (db mocked) | unit |
| `lib/__tests__/notify.test.ts` (new) | `lib/notify.ts` — `notifyUsers`, `notifyUser`, `notifyEveryone` (db mocked) | unit |
| `lib/__tests__/audit.test.ts` (new) | `lib/audit.ts` — `audit` (db mocked) | unit |
| `app/api/__tests__/api-routes.test.ts` (new) | `app/api/v1/*` route handlers | skeleton (all `it.skip`) |

## What's covered

- **Pure functions (no DB):** alias, rate-limit, uuid, env, api, chat, daily-drop.
- **DB-backed logic (mocked Prisma):** points (dedupe via P2002, daily caps, optional cap/points overrides, once-per-day ref ids, totals), notify (dedupe, exclude list, in-app default-on/per-pref off, no VAPID in test env), audit (null defaults, JsonNull default, swallows DB errors).
- **API routes:** skeleton only — see "Pending" below.

## What's pending (no tests yet)

These lib modules still lack tests (mostly DB- or network-bound; mock the client or add a test DB when available):

- `lib/chat.ts` DB functions: `ensureGlobalMembership`, `isMember`, `ensureChannelAccess`, `resolveChannel` (pure `serializeMessage`/`dmSlug`/`mentorshipSlug` are covered).
- `lib/otp.ts` DB functions: `canRequestOtp`, `issueOtp`, `verifyOtp` (pure `makeOtp`/`hashOtp`/`otpMatches` are covered).
- `lib/auth.ts` DB functions: `getCurrentUser`, `requireUser` (`hasRole`/`ROLE_RANK` covered).
- `lib/notify.ts` push path: `sendPush` (only fires when VAPID keys are configured).
- `lib/points.ts`, `lib/notify.ts`, `lib/audit.ts` are tested with a mocked `db`; integration against a real Postgres is still missing.
- `lib/dashboard-data.ts`, `lib/daily-drop.ts` network path (covered with mocked fetch), `lib/mailer.ts`, `lib/realtime.ts`, `lib/ga.ts`, `lib/env.ts` getters under production values, `lib/feed-types.ts` (types only — no runtime).
- `app/api/v1/*` routes: every route needs a test DB or mocked Prisma + session; see `app/api/__tests__/api-routes.test.ts` for the checklist.
- End-to-end / Playwright (e2e folder, playwright.config.ts).

## Playwright E2E Tests

End-to-end tests live in `e2e/` and run against a local dev server.

### Commands

```bash
# Run all E2E tests (headless Chromium, mobile Chrome, mobile Safari)
npm run test:e2e

# Run in headed mode (watch the browser)
npm run test:e2e:headed

# Run with Playwright UI
npm run test:e2e:ui

# Run a single test file
npx playwright test e2e/auth.test.ts

# Debug a failing test
npx playwright test --debug
```

### Test files

| File | Covered flow |
|------|-------------|
| `e2e/auth.test.ts` | Signup/login with OTP, non-campus email rejection |
| `e2e/chat.test.ts` | Send messages, toggle alias mode |
| `e2e/events.test.ts` | View events, RSVP |
| `e2e/notes.test.ts` | View notes, search/filter |
| `e2e/polls.test.ts` | View poll, vote, leaderboard |
| `e2e/feedback.test.ts` | Anonymous feedback submission |
| `e2e/auth.test.ts` (profile/settings) | View profile, toggle dark/light theme |

### Configuration

`playwright.config.ts` runs tests against `npm run dev` (localhost:3000) across:
- Desktop Chrome
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

Tests use dev-mode OTP flow (login with `isha@pwioi.com`, OTP `000000`).

## Known workarounds & gotchas


1. **Worker pool:** use `--no-file-parallelism` (see above).
2. **`__dirname` warning:** `vitest.config.ts` uses `__dirname`; harmless Vite config-loader warning, suppress with `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` if desired.
3. **Path alias:** `@` maps to the project root (`vitest.config.ts` + `tsconfig.json` paths). Tests import sources as `@/lib/...`.
4. **Env:** `vitest.config.ts` sets `SESSION_SECRET` and `DATABASE_URL` for the test run so `lib/env.ts` and `lib/session.ts` load without a `.env`.
5. **Mocked db:** `lib/__tests__/{points,notify,audit}.test.ts` mock `@/lib/db` with `vi.mock`; they do not touch the network.

## Typecheck

```
npx tsc --noEmit
```

(`npm run build` = `prisma generate && next build`; it is heavier and not required just to typecheck tests.)
