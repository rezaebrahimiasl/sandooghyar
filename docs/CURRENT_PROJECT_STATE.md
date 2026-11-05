# Current project state — SandooghYar

Last verified: **2026-11-05**, against Git, the source and the test runs listed below. If anything here disagrees with `git log` or `index.html`, Git and the source win; update this file.

## Versions and commits
- **Production version:** 0.47.0
- **Release commit (app + docs):** `@@REL@@`
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
- **Verification:** @@DEPLOY@@
- **On phones:** an installed app picks up the new version through `version.json` / `upd()` the next time it opens online.

## Tests (last full run on the 0.47.0 candidate)
- @@TESTS@@
- **Independent audit** (separate agent, synthetic data): 0 Critical, 3 Major, 4 Minor, 2 Cosmetic. All Major and five of the Minor/Cosmetic items are fixed; see DEVELOPMENT_JOURNAL.
- **Independent review of the 0.47 changes:** @@REVIEW@@
- **Mobile check:** 390×800 Chromium; the new pages (fund health, reconciliation, multi-fund events, loan portfolio, member profile with schedule, timeline, forecast, reports) showed no JavaScript errors and no horizontal overflow; back navigation closed the sheet.
- **Not tested:** a real Android device; real GitHub sync and real AI providers (mocked in the tests); a real IndexedDB failure on a phone; rollback to an older version.

## Packages
@@PKG@@

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
