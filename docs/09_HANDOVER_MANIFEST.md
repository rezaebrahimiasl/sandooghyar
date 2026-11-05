# 09 — Handover Manifest

| Item | Value |
|---|---|
| Application | صندوق‌یار (SandooghYar): Qard al-Hasana fund manager, Persian offline PWA |
| Version / build | **Released:** 0.45.0 on `main` (0.44.0 = `c3e75a7`; recovery point 0.42.0 = `b29e7ab`): 0.43 durability (doc 11), 0.44 package + 0.45 year-end close (doc 12), roadmap (doc 13). Docs 00–08 describe 0.40.1 unless a section says otherwise; docs 10–12 describe the later changes. |
| Documentation date | 2026-10-22 |
| **Update** | Version **0.41.0** implements the R01 fixes FX-1…FX-5 (partial). See `10_R01_REMEDIATION_0.41.0.md`, which also corrects some statements in docs 00–09. Line numbers in docs 00–09 refer to 0.40.1. |
| Documentation status | **Complete for the code base.** There are evidence gaps for device- and network-dependent behaviour (§4). |

> **Data authority rule (2026-10-28):** the current app data is authoritative; the initial Excel workbook is historical, contained errors and is non-authoritative. Figures marked [EXCEL-HIST] in docs 03/04/08 come from the workbook-based dev seed, not from the real data (which was never available). See doc 08 REQ-21.

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
| `10_R01_REMEDIATION_0.41.0.md` | Security/backup remediation in 0.41.0, corrections to docs 00–09, executed verification |

## 2. Files inspected

| File | Access | Method |
|---|---|---|
| `index.html` (public) | ✓ | Full static read of key areas; automated function map (681 functions with line numbers); executed in Playwright |
| `sw.js`, `manifest.webmanifest`, `version.json`, `README.md`, `HANDOFF.md` | ✓ | Read |
| Dev source `sandooghyar.html` (private; contains the [EXCEL-HIST] workbook constants) | ✓ | Used only as a test fixture (`wbFixture`). **Not reproduced**; no data quoted. Not the authoritative data. |
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

1. **Opening-cash assumption** (Σ opening savings − Σ opening loans). It shapes every cash and shortfall figure until real opening cash is recorded. (Shortfall sizes seen so far are [EXCEL-HIST].) → doc 04 R-CASH-01; doc 08 Q1.
2. **No at-rest encryption** of business data; the PIN lock is a UI gate. → doc 05 SEC-02.
3. **Single storage key and single device.** Data loss if browser storage is cleared and no recent backup exists. → doc 03 §1; doc 05 §8.
4. **CDN scripts without SRI**, including an older SheetJS that reads user files. → doc 05 EXT-01/02.
5. **Calculation-core coupling and cache heuristics** (`bal`/`bix`, `cashOf`, `jdocs`). A careless change breaks every report. → doc 02 §5; doc 06 HYP-01; doc 07 §1.
6. **Negative loan balances from imported data** ([EXCEL-HIST]; presence in current real data unverified) remain in the loan account. → doc 04; doc 08 Q2.
7. **No year-end carry-forward or closing entries** before the first real year close. → doc 08 Q4.
8. **Profile edits lack field-level history** (owner rule). → doc 06 DEF-06.
9. ~~Corrupt-state handling is silent.~~ Fixed in 0.41.0: recovery mode, no overwrite, no upload. → doc 10 FX-2.
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

- [ ] `grep "VER='" index.html` gives `0.44.0` on branch `stage2-idb` (published `main` = `b29e7ab`, 0.42.0). Line numbers quoted in docs 00–08 refer to 0.40.1; re-run the function map before relying on them.
- [ ] A regex count of named function definitions, `/(?:async\s+)?function\s+[A-Za-z_$][\w$]*\s*\(/g`, gives 681.
- [ ] `index.html` contains `const D=[];`, `const REF=[];` and `CASH=[];`.
- [ ] `KEY='sandooghyar.v2'`; IndexedDB name `sandooghyar`, store `kv`.
- [ ] `cashOf` contains `-icOf(f,i)`; `jopen` uses `ac=oc?'open':'cash'`.
- [ ] `ybs` liabilities include `v.sus`; `YBS` contains `['open','مازاد / کسری افتتاحیه']`.
- [ ] `bal` iterates `bix().get(mid)`; `bixTouch` exists.
- [ ] `rcpt` uses `balTx`; `rcptFind` resolves via `txv`.
- [ ] `opSave` wraps `opSave0`; `OPREP` exists; `opView`/`opEdit` exist.
- [ ] Unit tests: 29 suites (incl. `authtest.js`, `rcvtest.js`, `fintest.js`, `rsitest.js`, `idbtest.js`, `v44test.js`, `nostore.js`, `yctest.js`), all `FAIL 0`. 0.44 changes: doc 12. Smoke test: `errors []`. Browser regressions `recovery.js`, `idbfail.js`, `xlroundtrip.js`, `csp.js` pass on the public build.
- [ ] Synthetic scenario (doc 04) reproduces: month-0 cash 5, month-1 cash 18.8, with opening cash 14.8, capital balance 6, balance sheet balanced.
