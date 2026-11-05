# Current project state — SandooghYar

Last verified: **2026-11-06**, against Git, the source and the test runs listed below. If anything here disagrees with `git log` or `index.html`, Git and the source win; update this file.

## Versions and commits
- **Production version:** 0.48.0
- **Release commit:** `00a290e` — 0.48.0 (deployed). Later commits on `main` are documentation only.
- **Previous releases:**
  - 0.47.0 `fa1da94`
  - 0.46.1 `d44850f`
  - 0.46.0 `750ac84`
  - 0.45.0 `d12ae0e`
  - 0.44.0 `c3e75a7`
  - 0.42.0 `b29e7ab`
- **Branches:**
  - `main` is the production branch, served by GitHub Pages.
  - `stage2-idb` is kept equal to `main`.
  - Tag `v0.42.0` is local only; tag pushes were rejected by the environment's proxy.
- **Repository:** https://github.com/rezaebrahimiasl/sandooghyar (public). Contents: the built app (`index.html`, `sw.js`, `version.json`, manifest, icons) and all documentation.
- **Development source:** `sandooghyar.html`, with `build.py`, `mktest.py`, `runall.sh`, `tests/`, `browser/` and `tools/`.
  - It is in the private package `sandooghyar-private-0.48.0.zip`, not in the repo (decision D-24 pending).
  - Its SHA-256 is in the "Packages" section below.

## Deployment
- **Hosting:** GitHub Pages, from `main` at the repo root; `.nojekyll` is present.
- **URL:** https://rezaebrahimiasl.github.io/sandooghyar/
- **Verification (2026-11-05 23:26 UTC):**
  - GitHub Actions run 42129123034 («pages build and deployment», head `00a290e`): completed / **success**.
  - Deployment 7588001341 (`github-pages`): status **success**.
  - The live github.io URL itself cannot be fetched from the build environment.
- **On phones:** an installed app picks up the new version through `version.json` / `upd()` the next time it opens online.

## Tests (final run on 0.48.0)
- `./runall.sh`:
  - **unit tests:** 32 suites, PASS 672 / FAIL 0;
  - **build:** 0.48.0; privacy strip 1/1/1; CSP present;
  - **browser tests:** smoke (no errors, offline reload ✓), recovery 9/9, idbfail 3/3, idbdur 5/5, syncinteg 1/1, xlroundtrip ndiff 0, csp OK, offline 16/16.
- **Explicit upgrade** from production 0.47.0 (`fa1da94`) → 0.48.0: PASS.
- **Date filtering (D-28):** `tests/v48test.js` 59/0. It covers:
  - month, year and leap-Esfand boundaries;
  - week; custom ranges;
  - Tehran local-day timestamps; `gJ` = `Intl` for every day 2016–2032;
  - combined fund + date filters;
  - statement balances;
  - historical overdue;
  - no mutation.
- **Independent reviews:**
  - 0.47 audit + 0.47 change review: all Critical/Major fixed;
  - 0.48 date-filter review: 5 Major + 9 Minor, all addressed.

  See DEVELOPMENT_JOURNAL.
- **Mobile check:** 390×800, no JS errors, no horizontal overflow.
- **Fresh-path package check:** the build is byte-identical to the deployed `index.html`; 32 suites PASS 672 / FAIL 0.
- **Not tested:** a real Android device; real GitHub sync and AI providers; a real IndexedDB failure on a phone; rollback.

## Packages
| Package | SHA-256 |
|---|---|
| `sandooghyar-private-0.48.0.zip` | `2ffe2d3c8c69040f248c8450541d929a00a6166dad7d40bf076296202f4db06e` |
| `sandooghyar-public-0.48.0.zip` | `ee0abd7369c7c6a0480b3dd162ddcba494163022d0cd46c742000c33bd7ff11f` |

- Each package contains `SHA256SUMS.txt` for its files.
- The packages were built from deployed commit `00a290e`.
- Docs committed after the packages, such as this deployment section, are authoritative in the repo.
- **OneDrive mirror:** not available. No OneDrive connection exists in the build environment (D-27).

## Known issues and limitations
- At-rest encryption on the phone is not implemented (design only, D-21).
- CSP keeps `'unsafe-inline'`; there is no SRI or vendoring for the CDN libraries.
- Same origin as Reza Desk. Its service worker clears all caches; the app works around this with a shell copy in IndexedDB (ADR-06).
- Multi-device sync works on whole-copy versions, not record merge.
- Opening loans without an agreed monthly installment (`m.qs`) have an "unknown" schedule; the loan portfolio falls back to an estimate based on months without payment.
- AI name masking does not mask a first name shared by several members (A5).
- The year-close card can point to «سلامت داده» after a reopen, where nothing is shown (A8).
- The `storage` event handler does not check recovery mode.
- There is no explicit inter-fund mirror health check (the reconciliation covers each fund's ledger).
- Build and test scripts contain hard-coded paths (see HANDOFF §7).

## Outstanding work / next task
1. **Owner:** install or update 0.48.0 on the phone. Check:
   - offline launch;
   - backup and restore;
   - a member's «📅 برنامهٔ اقساط»;
   - a date range in «گزارش‌ها».
   
   Then set «تعیین قسط ماهانه» for opening loans that should have a schedule.
2. **Owner decision D-24:** where to keep the development source (a private repo is recommended).
3. **Owner decisions:** D-20, D-21, D-22 (one-touch reminders, scenario forecast, encryption, domain).
4. **Next engineering task once approved:** a stored per-loan plan override (ADR-09), or whichever item the owner picks from ROADMAP "Pending".
