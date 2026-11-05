# Development journal — SandooghYar

Chronological record of engineering stages. Each entry gives the changes, the files, the reason, the tests and the result, and the executing tool.

Unless noted, the executor is **Claude (Claude Code, cloud workspace)**. Dates are UTC.

| Date | Stage | Result |
|---|---|---|
| ≤2026-10-21 | 0.29–0.40.1 | Feature build-out (see CHANGELOG). Earlier versions were built with ChatGPT and in other Claude chats; no journal is recoverable for them. |
| 2026-10-22 | Handover docs 00–09 (`a2f5ed1`) | 10 docs plus a synthetic scenario script |
| 2026-10-22 | 0.41.0 R01 remediation (`e233f9c`) | FX-1…FX-5; 21 unit suites, PASS 310; recovery browser suite (docs/10) |
| 2026-10-28…31 | Fixes A–E, rcvFresh guard, recovery integrity → 0.42.0 (`b29e7ab`) | `authtest`, `rsitest`, browser `idbfail`, `upgrade` |
| 2026-11-02 | Private dev package 0.42.0 | SHA-256 `12e75f4d…` (as reported in owner prompts) |
| 2026-11-04/05 | Stage 2 IndexedDB durability (0.43, branch `stage2-idb`) | `idbtest` 38, browser `idbdur`; queue design in docs/11 |
| 2026-11-05 | 0.44.0 mission + offline fix + review fixes (`c3e75a7`) | 29 suites PASS 516 / FAIL 0; browser 35/35 |
| 2026-11-05 | 0.45.0 year-end close (`d12ae0e`) | `yctest` 14 |
| 2026-11-05 | 0.46.0 AI gateway + analysis (`750ac84`) | 30 suites PASS 549 / FAIL 0; browser 35 PASS lines, 0 FAIL |
| 2026-11-05 | Handover package 0.46.0 (no code change) | Verified from a fresh path: build byte-identical; 549/0 |
| 2026-11-05 | 0.46.1 shared report fund selection (`d44850f`) | 30 suites PASS 563 / FAIL 0; browser 0 FAIL; upgrade 0.46.0→0.46.1 PASS |
| 2026-11-05 | 0.47.0 mission | See below |

## 0.47.0 mission (2026-11-05, approved D-19)

Local recovery commits were made in the dev workspace (`/home/claude/stage2`, local git).

| Stage | Change | Functions |
|---|---|---|
| s62 | Multi-fund financial events | `fop` |
| s62 | Installment schedules | `lsched`, `schBox` |
| s62 | Loan portfolio and forecast use the schedule | `lport`, `fcst` |
| s63 | Member profile and timeline | `ptlEv`, `ptlSum`, `ptl` |
| s64 | Automatic reconciliation | `reconF`, `reconN`, `recon` |
| s64 | Fund health | `fhealth`, `fhl`, `FHT` |
| s64 | Agreed-installment editor | `qsSet`, `qsGo` |
| s64 | Integration | report tiles, routes, alert-centre item |

- **Ledger architecture review.** The ledger stays derived (ADR-02). The missing piece was continuous verification for every month, now covered by `reconF`. No stored ledger was added.
- **Safeguards review (item 11).** Existing guards in `bsave`, `opSave0`, `jvSave`, `xwGo` and `xferGo` were inventoried (FINANCIAL_RULES §9). Additional fixes came from the independent audit (below).
- **Tests.** `tests/v462test.js` (32 checks): schedules, arrears, fallbacks, lport, schedule box, forecast, multi-fund events, reconciliation including the stale bank case, alert centre, fund health, timeline, tiles and module toggle.
- **Full run before audit fixes:** 31 suites PASS 595 / FAIL 0; browser 0 FAIL.

### Independent audit
- A separate agent with no part in building the app audited 0.46.1 against synthetic data: unit probes plus Chromium at 390×800.
- Findings and their dispositions are recorded in the section "0.47.0 audit" (appended at release).

### 0.47.0 audit — findings and dispositions
The independent auditor ran its probes on synthetic data. It reported 0 Critical, 3 Major, 4 Minor and 2 Cosmetic findings. The core identities held in every scenario it ran: trial balance, balance sheet, cash = journal, member totals = ledger, inter-fund mirror, rounding over 1000 entries, Excel round-trip, back-button behaviour, no horizontal overflow at 390 px, and public-build privacy.

| # | Severity | Finding | Disposition |
|---|---|---|---|
| A1 | Major | The yearly member balance view («تراز» → سالانه) and its Excel export showed monthly figures for 1405, because year index 0 was treated as falsy in `tdata` | **Fixed**: `yr==null` test; covered by a test |
| A2 | Major | An injection repayment (`injret`) could make a later month's injection balance negative | **Fixed**: checked against this and all later months (`minBal`, `E-INJRET`); covered by a test |
| A3 | Major | `health0` missed negative member credit and injection balances, and stopped at the first negative kind | **Fixed**: `H-NEG-CREDIT` and `H-NEG-INJ`, no early stop; covered by a test |
| A4 | Minor | A member of an archived fund could still receive entries through `sub`, `corrGo`, `xferGo`, `lvoidGo` and `xwGo` | **Fixed**: `arcNo` guard (`E-ARCHIVED`) on every member-level write path; covered by a test |
| A5 | Minor | AI name masking missed Arabic ي/ك variants and shared first names | **Partly fixed**: ي/ك normalisation. **Known limitation**: a first name shared by several members is not masked, because coding it would make it ambiguous. `finSum` (the analysis payload) contains no names. |
| A6 | Minor | Cash-flow columns did not add up when manual vouchers or inter-fund settlements existed | **Fixed**: an "other" column; the monthly net now equals the change in cash; covered by a test |
| A7 | Minor | The forecast's refundable capital ignored member-level injections | **Fixed**: uses the balance-sheet `cap`; covered by a test |
| A8 | Cosmetic | The year-close card points to «سلامت داده» after a reopen, where nothing is shown | **Known**, not fixed. Reopen with a reason and close the year again; documented. |
| A9 | Cosmetic | The alert centre appeared in two menus; «کنترل و مغایرت» was easily confused with «مغایرت و ناهنجاری» | **Fixed**: removed from «بیشتر»; renamed «سلامت داده و موارد بررسی» |
| notes | — | The `storage` event handler does not check `RCV`; there is no inter-fund mirror health check; `lastPay` ignores reclassifications; `reo` would fail on a cascade-locked month (not reachable from the UI) | **Known**, listed in CURRENT_PROJECT_STATE "Known issues". The reconciliation (`reconF`) covers ledger consistency. |

Probe scripts are in the auditor's workspace (`/home/claude/audit046/scratch`, synthetic data). They are not shipped.
