# Branch Protection Rules — VibeZone

**Repo:** https://github.com/Ankitbhalke137/vibeZone.git  
**Target branch:** `main`  
**Source of truth for configuration:** this document (local artifact; no GitHub token available to apply via API)

> Apply these rules manually in the GitHub UI. See the exact navigation path below.

---

## Exact GitHub UI navigation path

On the repository page (https://github.com/Ankitbhalke137/vibeZone):

1. **Settings** (top tab of the repo)
2. Left sidebar: **Branches** (under "Code and automation")
3. **Branch protection rules**
4. **Add a rule** (button: "Add branch protection rule")
5. Branch name pattern: `main`
6. Configure the settings below, then **Save changes**

---

## Protection rules for `main`

| # | Setting | Value |
|---|---------|-------|
| 1 | Require a pull request before merging | **Enabled** |
|   | Required approving reviews | **1** |
|   | Dismiss stale pull request approvals when new commits are pushed | **Enabled** |
| 2 | Require status checks to pass before merging | **Enabled** |
|   | Required status checks | `build`, `typecheck`, `tests` |
| 3 | Require conversation resolution before merging | **Enabled** |
| 4 | Include administrators | **Enabled** (rules apply to repo admins too) |
| 5 | Restrict pushes / do not allow bypassing | **Enabled** — no one, including admins, may push directly to `main` |
| 6 | Allow force pushes | **No** (disabled) |
| 7 | Allow deletions | **No** (disabled) |

### Notes on the required status checks
The checks `build`, `typecheck`, and `tests` must exist as GitHub status check names before they can be required. The repo currently has only `.github/workflows/deploy-vm.yml` (VM deploy on push to `main`). Add a CI workflow (e.g. `.github/workflows/ci.yml`) that runs:

- `build` → `npm run build` (prisma generate + next build)
- `typecheck` → TypeScript check (`tsc --noEmit` or Next.js build covers this)
- `tests` → `npm test` (vitest run — see issue #6 to fix the worker pool crash first)

Until those checks exist, leave "Require status checks" unchecked or require only the checks that actually run, then enable the full set once CI is in place (tracked by issue #6 and issue #9).

---

## Verification checklist (after saving)

- [ ] Attempt `git push origin main` from a local branch → rejected by GitHub
- [ ] Open a PR to `main` → cannot merge without 1 approving review
- [ ] Push a new commit to an approved PR → previous approval is dismissed (stale approval)
- [ ] Merge with an unresolved conversation thread → blocked
- [ ] Merge with a failing status check → blocked
- [ ] Force push to `main` → rejected
- [ ] Delete branch `main` → rejected (default branch cannot be deleted anyway)

---

## Optional: protection for `feat/*` branches

It is also sensible (but optional) to add a second rule for `feat/*`:

| Setting | Value |
|---|---|
| Branch name pattern | `feat/*` |
| Require a pull request before merging | Enabled |
| Required approving reviews | 1 |
| Dismiss stale approvals on new commits | Enabled (recommended) |
| Require status checks | Enabled — `build`, `tests` (optional until CI exists) |
| Require conversation resolution | Enabled |
| Include administrators | Disabled (optional) |
| Allow force pushes | **Yes** (feature branches are personal working branches) |
| Allow deletions | **No** |

Do **not** protect `fix/*`, `chore/*`, or `docs/*` unless the team adopts them; the same `feat/*` pattern can be extended later.

---

## Repository visibility — make public (current visibility: unknown)

Task: confirm or set the repository to Public on GitHub.

### Steps

1. **Settings** (top tab of the repo) → **General** (left sidebar, first item)
2. Scroll to the **Danger Zone** section (bottom of the page)
3. Find **"Change visibility"** (or "Visibility" / "Repository visibility")
4. Click **Change visibility**
5. Choose **Public** and confirm (type the repo name `vibeZone` if prompted)
6. Confirm the repo header now says **Public** (not Private)

### Current state
Current visibility is **unknown** from local tooling (no GitHub token). If the repo is already Public, no action is needed — just confirm in the UI. Changing Private → Public makes issues, code, and releases visible to anyone; it does not change branch protection rules or write permissions.

### Related
This step is independent of branch protection and can be done any time before or after go-live. If you later add a custom domain (issue #11), Public visibility is required for the Vercel deployment to be openly accessible.
