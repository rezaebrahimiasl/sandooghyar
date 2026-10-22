# 09 — Handover Manifest

| Item | Value |
|---|---|
| Application | صندوق‌یار (SandooghYar): Qard al-Hasana fund manager, Persian offline PWA |
| Version / build | `VER='0.40.1'`; public repo `rezaebrahimiasl/sandooghyar`, commit `afff760`; `version.json` = 0.40.1 |
| Documentation date | 2026-10-22 |
| Documentation status | **Complete for the code base.** There are evidence gaps for device- and network-dependent behaviour (§4). |

## 1. Deliverables

| File | Purpose |
|---|---|
| `00_README_AND_SYSTEM_OVERVIEW.md` | What the app is, files, runtime, startup, dependencies, deployment, architecture diagram |
| `01_FEATURE_INVENTORY.md` | 83 features with stable IDs (F-xx-nn), locations, data touched and verification status |
| `02_ARCHITECTURE_AND_CODE_MAP.md` | Components, lifecycle, data flow, shared-function impact map, technical debt |
| `03_DATA_DICTIONARY_AND_STORAGE.md` | Every collection and field, storage keys, backup formats, migration, deletion policy |
| `04_FINANCIAL_RULES_AND_CALCULATIONS.md` | **Critical.** Every implemented financial rule with formula, location, executed synthetic examples and ambiguities |
| `05_SECURITY_PRIVACY_AND_AUDIT.md` | Authentication, privacy, DOM safety, audit trail, destructive actions, supply chain, data loss |
| `06_TEST_PLAN_AND_DEFECT_REGISTER.md` | Executed results, test plan with invariants, open defects, hypotheses, fixed-item regression list |
| `07_CHANGE_GUIDE_AND_DEPENDENCY_MAP.md` | How to change things safely; high-risk shared code; checklists |
| `08_REQUIREMENTS_AND_OPEN_QUESTIONS.md` | Owner rules vs implementation, conflicts, prioritised policy questions |
| `09_HANDOVER_MANIFEST.md` | This index |

## 2. Files inspected

| File | Access | Method |
|---|---|---|
| `index.html` (public) | ✓ | Full static read of key areas; automated function map (681 functions with line numbers); executed in Playwright |
| `sw.js`, `manifest.webmanifest`, `version.json`, `README.md`, `HANDOFF.md` | ✓ | Read |
| Dev source `sandooghyar.html` (private, contains real data) | ✓ | Used for unit tests. **Not reproduced**; no data quoted. |
| `build.py`, `mktest.py`, `tests/*.js` (21), `browser/smoke.js`, `browser/run.sh` | ✓ (private dev env) | Read and executed |
| Owner's real data on the phone (IndexedDB) | ✗ | Unavailable by design |
| GitHub backup repo (private) | ✗ | Not accessed |
| `icon-*.png` | not content-inspected | — |

**Methods used:**
- static analysis;
- automated reference extraction;
- 21 unit-test suites (310 assertions, all pass);
- Playwright smoke test;
- synthetic financial scenario on the public build (doc 04 [EXEC]);
- an independent reviewer agent: audit plus re-verification (UI crawl of 1,373 handlers);
- a check that every `name Lnnn` reference in these documents points to a line containing that name (532 references checked; remaining mismatches are range notations).

## 3. Coverage

| Area | Coverage |
|---|---|
| Financial core (`bal`, `fsum`, `cashOf`, journal, balance sheet, capital, receipts) | High: static + executed + unit tests |
| Data model and storage | High: static + executed |
| Entry workflows (bulk, single, corrections, transfers, fund events, vouchers) | High for the main paths; medium for rare paths (loan void, account closing, fund deletion) |
| Reports and drill-downs | High (audit crawl) |
| Backup/restore (file) | Medium–high (unit round trips) |
| Cloud backup, AI, WebAuthn, share intents, contacts, speech | Low: no network or devices in the test environment |
| iOS, other browsers, low storage, multi-tab | None |

## 4. Ten highest-priority risks

1. **Opening-cash assumption** (Σ opening savings − Σ opening loans). It shapes every cash and shortfall figure until real opening cash is recorded. → doc 04 R-CASH-01; doc 08 Q1.
2. **No at-rest encryption** of business data; the PIN lock is a UI gate. → doc 05 SEC-02.
3. **Single storage key and single device.** Data loss if browser storage is cleared and no recent backup exists. → doc 03 §1; doc 05 §8.
4. **CDN scripts without SRI**, including an older SheetJS that reads user files. → doc 05 EXT-01/02.
5. **Calculation-core coupling and cache heuristics** (`bal`/`bix`, `cashOf`, `jdocs`). A careless change breaks every report. → doc 02 §5; doc 06 HYP-01; doc 07 §1.
6. **Negative loan balances from imported data** remain in the loan account. → doc 04; doc 08 Q2.
7. **No year-end carry-forward or closing entries** before the first real year close. → doc 08 Q4.
8. **Profile edits lack field-level history** (owner rule). → doc 06 DEF-06.
9. **Corrupt-state handling is silent.** → doc 06 HYP-03.
10. **The GitHub token and AI key are in localStorage** (the token is sealed only when the lock is on). → doc 05 PRV-04/05.

## 5. Recommended order for future auditing and repairs

1. Agree the policy questions Q1, Q2 and Q4 with the owner.
2. Add an automated invariant test (INV-01…09) to the test suite, and keep it green.
3. Supply-chain hardening: SRI or vendored libraries; SheetJS upgrade.
4. Storage resilience:
   - corrupt-state UI;
   - forced snapshot before restore;
   - verify the fund-deletion cascade (HYP-04).
5. History for profile edits (DEF-06) and deposit edit (Q11).
6. Optional at-rest encryption with the lock (Q8).
7. Performance: journal page at scale (DEF-01). Consider incremental journal or caching.
8. Refactor: extract the calculation core into a testable module before larger feature work.

## 6. Checklist: does this handover still match the code?

- [ ] `grep "VER='" index.html` gives `0.40.1` and `git rev-parse --short HEAD` gives `afff760`. If not, line numbers may have shifted; re-run the function map.
- [ ] A regex count of named function definitions, `/(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/g`, gives 681.
- [ ] `index.html` contains `const D=[];`, `const REF=[];` and `CASH=[];`.
- [ ] `KEY='sandooghyar.v2'`; IndexedDB name `sandooghyar`, store `kv`.
- [ ] `cashOf` contains `-icOf(f,i)`; `jopen` uses `ac=oc?'open':'cash'`.
- [ ] `ybs` liabilities include `v.sus`; `YBS` contains `['open','مازاد / کسری افتتاحیه']`.
- [ ] `bal` iterates `bix().get(mid)`; `bixTouch` exists.
- [ ] `rcpt` uses `balTx`; `rcptFind` resolves via `txv`.
- [ ] `opSave` wraps `opSave0`; `OPREP` exists; `opView`/`opEdit` exist.
- [ ] Unit tests: 21 suites, all `FAIL 0`. Smoke test: `errors []`.
- [ ] Synthetic scenario (doc 04) reproduces: month-0 cash 5, month-1 cash 18.8, with opening cash 14.8, capital balance 6, balance sheet balanced.
