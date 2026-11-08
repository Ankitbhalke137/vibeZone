# Contributing to VibeZone

**Repo:** https://github.com/Ankitbhalke137/vibeZone.git  
**Default branch:** `main` (protected — see `BRANCH_PROTECTION.md`)

Thanks for contributing! VibeZone is a campus app (Next.js 16 App Router, Neon Postgres, Vercel + OCI VM stack). These rules keep the v1.0.0 release stable and reviewable.

---

## 1. Branch naming convention

Always branch from an up-to-date `main`. Name your branch with one of these prefixes:

| Prefix | Use for | Example |
|---|---|---|
| `feat/` | New feature or user-facing change | `feat/gmail-app-password-rotation` |
| `fix/` | Bug fix | `fix/vitest-worker-pool-crash` |
| `chore/` | Tooling, deps, infra, non-user change | `chore/add-ci-workflow` |
| `docs/` | Documentation only | `docs/runbook-restore-drill` |

Branch name should be short, kebab-case, and ideally reference the GitHub issue number:
```
git checkout -b feat/9-branch-protection-main
```

Never commit directly to `main` — branch protection rejects direct pushes (see `BRANCH_PROTECTION.md`).

---

## 2. PR process

1. **Create (or claim) an issue** first. Link it to the PR. Issues may reference product requirement IDs `FR-*` (functional) and `NFR-*` (non-functional) from `VibeZone - PRD v2.md`.
2. **Branch from `main`**: `git checkout main && git pull && git checkout -b <type>/<short-name>`
3. **Implement** in small, focused commits. Keep one PR per logical change.
4. **Test locally before pushing** (see §5):
   - `npm run build` must succeed
   - `npm test` must pass (vitest — see issue #6 if the worker pool crashes)
5. **Open a draft PR early**, mark it "Ready for review" when done.
6. **PR description must include:**
   - Summary of changes
   - Linked GitHub issue(s) (`Closes #NN` or `Refs #NN`)
   - `FR-*` / `NFR-*` IDs touched (if any)
   - Screenshots for UI changes
   - How you tested it
7. **Review:** at least 1 approving review required; all status checks (`build`, `typecheck`, `tests`) green; all conversation threads resolved (branch protection enforces this on `main`).
8. **Merge:** squash-merge into `main`, then delete the head branch.

---

## 3. Commit message convention

Use conventional commits, scoped to the module, and reference requirement IDs where applicable:

```
<type>(<scope>): <subject>

[optional body]

Closes #NN
Refs FR-*/NFR-*
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `security`.

Examples:
```
feat(auth): add OTP resend cap (FR-AUTH-012)

Closes #4
Refs FR-AUTH-012
```
```
fix(ci): stabilize vitest worker pool so tests run reliably

Closes #6
```
```
docs(readme): add deploy screenshots and secrets policy

Refs #8
```

Rules:
- Imperative mood, lowercase subject, no trailing period.
- Body explains *why*, not just *what*.
- Always reference the GitHub issue (`Closes #NN`) and any `FR-*`/`NFR-*` IDs.

---

## 4. Code style

- **Formatting:** 2 spaces, double quotes, semicolons. Run the project formatter before committing (configure Prettier/ESLint if missing — tracked as chore).
- **Components:** Server Components by default; add `'use strict'` / `'use client'` only where needed (Next.js 16 App Router).
- **Secrets:** never read `process.env` directly in client code unless prefixed `NEXT_PUBLIC_`. Put server-only secrets behind `server-only`. Never commit `.env.local`, `vm/.env`, or real values to git.
- **Validation:** validate request bodies with `zod` schemas at every API route boundary.
- **Styling:** Tailwind; keep classes sortable/mergeable via `tailwind-merge`.
- **Tests:** colocate tests as `<module>.test.ts` in `__tests__/` folders; new lib modules and API routes ship with tests.

---

## 5. Test-before-merge requirement

No PR may be merged unless all of the following hold:

- [ ] `npm run build` passes locally and on CI
- [ ] `npm test` (`vitest run`) passes locally and on CI — zero worker-pool crashes (issue #6)
- [ ] TypeScript compiles cleanly (`tsc --noEmit` / Next.js build type check)
- [ ] PR has ≥ 1 approving review
- [ ] All status checks green: `build`, `typecheck`, `tests`
- [ ] All PR conversation threads resolved
- [ ] Linked issue referenced in the commit/PR (`Closes #NN`)

If `npm test` is unreliable, fix it first (issue #6) rather than disabling or skipping tests.

---

## Related documents

- `BRANCH_PROTECTION.md` — exact GitHub UI rules for `main` (and optional `feat/*`)
- `GITHUB_ISSUES.md` — ready-to-copy GitHub issues for v1.0.0 professionalization
- `docs/RUNBOOK.md` — VM and deploy operations
- `VibeZone - PRD v2.md` — product requirements (`FR-*` / `NFR-*` IDs)
