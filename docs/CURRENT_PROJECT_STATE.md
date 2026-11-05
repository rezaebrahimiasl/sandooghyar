# Current project state — SandooghYar

Last verified: **2026-11-05**, against Git, the source and the test runs listed below. If anything here disagrees with `git log` or `index.html`, Git and the source win; update this file.

## Versions and commits
- **Production version:** 0.47.0
- **Release commits:**
  - `203729c` — 0.47.0 app + docs;
  - `a80be83` — docs;
  - `fa1da94` — review fixes. This is the deployed app commit.
  - Later commits on `main` are documentation only.
- **Previous releases:**
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
  - It is in the private package `sandooghyar-private-0.47.0.zip`, not in the repo (decision D-24 pending).
  - Its SHA-256 is in the "Packages" section below.

## Deployment
- **Hosting:** GitHub Pages, from `main` at the repo root; `.nojekyll` is present.
- **URL:** https://rezaebrahimiasl.github.io/sandooghyar/
- **Verification (2026-11-05 19:20 UTC):**
  - GitHub Actions run 42092888490 («pages build and deployment», head `fa1da94`): completed / **success**.
  - Deployment 7583058467, environment `github-pages`, status **success**, URL https://rezaebrahimiasl.github.io/sandooghyar/.
  - `version.json` on `main` = 0.47.0.
  - Fetching the live github.io URL directly was blocked from the build environment, so the served bytes were not read back.
- **On phones:** an installed app picks up the new version through `version.json` / `upd()` the next time it opens online.

## Tests (last full run on the 0.47.0 candidate)
- `./runall.sh` on the release candidate (2026-11-05):
  - **unit tests:** 31 suites, PASS 613 / FAIL 0 (final, after the review fixes);
  - **build:** 0.47.0; privacy strip 1/1/1; CSP present;
  - **browser tests:** smoke (no errors, offline reload ✓), recovery 9/9, idbfail 3/3, idbdur 5/5, syncinteg 1/1, xlroundtrip ndiff 0, csp (0 violations, foreign host refused), upgrade from production 0.46.1 (`d44850f`) → 0.47.0 1/1 (run explicitly), offline 16/16.
- **Fresh-path check of the private package:** the build is byte-identical to `public/`; 31 suites PASS 613 / FAIL 0; 0 fixture-name leaks; no keys or tokens. Placeholders such as `github_pat_` in the UI hint and synthetic test phone numbers are expected.
- **Independent audit** (separate agent, synthetic data): 0 Critical, 3 Major, 4 Minor, 2 Cosmetic. All Major and five of the Minor/Cosmetic items are fixed; see DEVELOPMENT_JOURNAL.
- **Independent review of the 0.47 changes:** a second separate agent found 0 Critical, 2 Major and 5 Minor issues; all are fixed and covered by tests (DEVELOPMENT_JOURNAL).
- **Mobile check:** 390×800 Chromium; the new pages (fund health, reconciliation, multi-fund events, loan portfolio, member profile with schedule, timeline, forecast, reports) showed no JavaScript errors and no horizontal overflow; back navigation closed the sheet.
- **Not tested:** a real Android device; real GitHub sync and real AI providers (mocked in the tests); a real IndexedDB failure on a phone; rollback to an older version.

## Packages
| Package | SHA-256 |
|---|---|
| `sandooghyar-private-0.47.0.zip` (dev source with pseudonymised fixture, tests, tools, docs, public build) | `4e79a4883a4cb9e9b8f99c08a9f078faf3c9d87655f97d8678d06145a384cafe` |
| `sandooghyar-public-0.47.0.zip` (exactly the published files) | `bf64c301e11ee59f62c6f3687d1d57dc2e6d99c56a6a55d4864bc1622502caa6` |

- Each package contains `SHA256SUMS.txt` for its files.
- The packages were built from deployed commit `fa1da94` and checked from a fresh path:
  - `index.html` and `sw.js` are byte-identical to the deployed files;
  - 31 suites PASS 613 / FAIL 0.
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
1. **Owner:** install or update 0.47.0 on the phone. Check:
   - offline launch;
   - backup and restore;
   - a member's «📅 برنامهٔ اقساط».
   
   Then set «تعیین قسط ماهانه» for opening loans that should have a schedule.
2. **Owner decision D-24:** where to keep the development source (a private repo is recommended).
3. **Owner decisions:** D-20, D-21, D-22 (one-touch reminders, scenario forecast, encryption, domain).
4. **Next engineering task once approved:** a stored per-loan plan override (ADR-09), or whichever item the owner picks from ROADMAP "Pending".
