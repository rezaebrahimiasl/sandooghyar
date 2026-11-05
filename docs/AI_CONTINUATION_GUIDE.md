# AI continuation guide — how to take over SandooghYar safely

You are a new AI assistant or engineer. You have no access to earlier conversations, and you must not need them. Follow the steps in order.

## 1. Read first (in this order)
1. `PROJECT_MASTER_CONTEXT.md` — what the app is and where everything is.
2. `docs/CURRENT_PROJECT_STATE.md` — version, commits, deployment, tests, open work.
3. `docs/PRODUCT_POLICIES.md` — the owner's approved rules and preferences. They are binding.
4. `docs/FINANCIAL_RULES.md` — accounting logic and invariants. Never change these silently.
5. `docs/DECISION_REGISTER.md` and `docs/ROADMAP.md` — what is approved, pending or excluded.
6. When touching code: `docs/14_ARCHITECTURE_MAP_0.46.md`, `docs/15_DATA_DICTIONARY_0.46.md` and `docs/DATA_ARCHITECTURE.md`.

## 2. Verify reality before assuming anything
```bash
git clone https://github.com/rezaebrahimiasl/sandooghyar && cd sandooghyar
git log --oneline -5; git branch -a; git status
grep -o "VER='[0-9.]*'" index.html | head -1; cat version.json
```
- Compare with `docs/CURRENT_PROJECT_STATE.md`. If they disagree, Git and the source win; update the doc.
- **The development source is NOT in this repo.**
  - `index.html` is the *built* public file.
  - The dev source `sandooghyar.html`, `build.py`, `mktest.py`, `runall.sh`, `tests/` and `browser/` come in the private package `sandooghyar-private-<ver>.zip`. Its SHA-256 is in CURRENT_PROJECT_STATE.
  - If the package is unavailable, the dev source can be reconstructed from `index.html`. Reverse `build.py`:
    - set `PWA=false`;
    - remove the CSP meta and the manifest links.

    The legacy unit tests also need the Excel fixture (`const D=[…]`), which exists only in the private package.

## 3. Build and test
- Setup and commands: `HANDOFF.md` §7.
  - Scripts have hard-coded paths `/home/claude/stage2` and `/home/claude/sandooghyar`; use sed or symlinks.
  - Playwright path: `/opt/npm-tools/node_modules/playwright`.
- `python3 build.py` → `site/`. `./runall.sh` runs build + 31 unit suites + browser suites.
- Every change needs a synthetic-data test.
- Never use real member data. Never claim a test passed without running it.

## 4. Rules you must keep
1. Preserve the owner-approved financial and business rules (PRODUCT_POLICIES, FINANCIAL_RULES).
2. **Never modify, re-seed, import or "correct" real financial data.**
   - The live app data on the owner's phone is authoritative.
   - The Excel workbook is not.
3. Never publish, push, merge, force-push or do destructive operations without the owner's authorization. Releases so far were explicitly authorized per mission.
4. Never put secrets or member data into code, docs, chat or repos. The public build must not contain the fixture.
5. Do not repeat completed work. Check CHANGELOG and ROADMAP first.
6. Propose new features. Build them only after approval; bugs and explicit owner requests are done directly.
7. Respond to the owner in **Persian**. He uses an Android phone.
8. Report completed, incomplete, failed and untested work separately.

## 5. Release procedure (when authorized)
1. Bump `VER` and add a `WHATS_NEW` entry in the source.
2. Run `./runall.sh`; all suites must pass.
3. Copy `site/index.html`, `site/sw.js` and `site/version.json` to the repo.
4. Update the docs (see §6); commit; push `main`.
5. Check the deployment:
   - `gh api repos/rezaebrahimiasl/sandooghyar/pages/builds/latest`;
   - fetch `https://rezaebrahimiasl.github.io/sandooghyar/version.json` when reachable.
6. Rollback: `git revert <commit>` and push. Never rewrite history. Phones keep their data across code rollbacks.

## 5a. Release checklist (every release)
- [ ] `./runall.sh`: all unit and browser suites PASS, FAIL 0.
- [ ] Explicit upgrade test from the **production** version (`browser/upgrade.js` with `git show <prod>:index.html`).
- [ ] Financial identities: reconciliation (`reconN()==0` on test states); trial balance; balance sheet.
- [ ] **Date filtering (D-28):**
  - `tests/v48test.js` passes: month and year boundaries, leap Esfand, custom ranges, week, local-day timestamps, combined fund + date filters;
  - new report pages reuse `dfBar` / `dfHit` / `dfAsOf`;
  - historical vs current balances are labelled;
  - filters do not change `S`.
- [ ] Independent review by a separate reviewer of the changes, with Critical and Major items fixed before publishing.
- [ ] Mobile check at 390 px: no JS errors, no horizontal overflow, back button one step.
- [ ] Public build privacy (fixture stripped); packages from a fresh path; SHA-256 recorded.
- [ ] Docs synchronised (§6); `tools/doccheck.py` OK; deployment verified (Actions run + deployment status).

## 6. Keep project memory synchronised (permanent requirement D-23)
After every meaningful interaction:
- Append to `docs/USER_INTERACTION_HISTORY.md`.
- Update `docs/DECISION_REGISTER.md` and `docs/PRODUCT_POLICIES.md` when decisions change. Never erase old decisions; mark them Superseded.
- Update `docs/ROADMAP.md`, `docs/DEVELOPMENT_JOURNAL.md`, `docs/CHANGELOG.md` and `docs/CURRENT_PROJECT_STATE.md` as work happens.

Before ending a session, verify the docs against Git and the source:
- versions and commits match;
- links are valid;
- run `python3 tools/doccheck.py` from the private package.

## 7. What to do next
Read the "Next task" section of `docs/CURRENT_PROJECT_STATE.md`.
