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
| 2026-11-05 | 0.47.0 mission (`fa1da94`) | See below |
| 2026-11-06 | 0.48.0 date-range filtering | See below |

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

### Independent review of the 0.47 changes — findings and dispositions
A second agent, separate from the builder, reviewed only the 0.46.0 → 0.47.0 changes with synthetic probes. It reported 0 Critical, 2 Major and 5 Minor findings. It also confirmed that no new code writes financial data; the only exception is the audited `m.qs` editor `qsGo`.

| # | Finding | Disposition |
|---|---|---|
| M1 | Reconciliation false alarm on a bank account shared by several funds: the recorded figure is the combined balance, but it was compared with each fund's share | **Fixed**: compares the sum over all sharing funds and reports once; covered by a test |
| M2 | A loan balance received by transfer (xin/xout `bk:'loan'`) showed as arrears | **Fixed**: the schedule is marked unknown, so the estimate fallback is used; covered by a test |
| m1 | Write paths still open for archived funds: `mcloseGo`, `succGo`, `rclVoidGo`, `qAddGo`, `depAdd`, `depRepGo` | **Fixed**: `arcNo` guard on each; covered by a test |
| m2 | The reconciliation cache recomputed on every call (performance) | **Fixed**: the cache is keyed by state object and revision and holds every fund |
| m3 | The cache could be stale after `S` was replaced at the same revision | **Fixed**: the cache is reset when the `S` object, revision or record counts change; covered by a test |
| m4 | A voided loan produced false historical arrears in the schedule table | **Fixed**: voided loans and their `lrev` reversal enter the disbursement series; covered by a test |
| m5 | The shared report selection did not reach the per-report selections after a restart | **Fixed**: `rgSync` at boot |
| other | `ptl` with an unknown person threw | **Fixed**: guard. `fop` setting the working fund is intended. A missing term = 10 is the existing default. |

- **Final run after these fixes:** 31 suites PASS 613 / FAIL 0. Browser: recovery 9/9, idbfail 3/3, idbdur 5/5, syncinteg 1/1, xlroundtrip ndiff 0, csp OK, offline 16/16, smoke no errors.
- **Upgrade check:** run explicitly from production 0.46.1 (`d44850f`) to 0.47.0 — PASS. Records, audit length, balances and cash are unchanged.

## 0.48.0 — shared Jalali date-range filtering (D-28)

| Stage | Change |
|---|---|
| s67 | Engine (`dfRng`, `dfHit`, `dfF`, `dfAsOf`, `dfMonths`, `dfCmpR`, `dfBar`), applied to 11 pages; `tests/v48test.js` |
| s68 | Fixes from the independent review |

**Independent review** (separate agent; calendar verified 1395–1410 and against `Intl` 2016–2032): 5 Major and 9 Minor findings.

| # | Finding | Disposition |
|---|---|---|
| M1 | The statement's opening + rows did not equal the closing balance when the range started mid-month | **Fixed**: opening and closing balances are shown only for whole-month ranges (rows by accounting month). A mid-month range shows dated rows only, with an explanation. |
| M2 | The cash-flow comparison was meaningless for sub-month ranges | **Fixed**: comparison only for whole-month ranges, with a note |
| M3 | `fop` and the forecast page crashed with no active funds and a range set (regression) | **Fixed**: guards; covered by a test |
| M4 | The printed output did not show the period | **Fixed**: the range label is printable |
| M5 | The shared filter silently affected other reports | **Fixed**: every filtered page shows an active-filter label stating it applies to all reports, plus a one-tap «حذف فیلتر تاریخ» |

**Minor fixes:**
- year-on-year comparison maps month-end to month-end (Esfand 29 ↔ leap 30);
- void time `vat` is now recorded on fund-event and deposit voids (legacy voids use their creation time, and the page says so);
- local day computed by Gregorian arithmetic (`gJ`) instead of a new `Intl` formatter per call, which is faster and works on old WebViews; matches `Intl` for every day from 2016 to 2032;
- profile rows that are always current are labelled «فعلی»;
- the capital ledger warns about partial months;
- open-range wording;
- dead code removed;
- the assistant summary is labelled as current state.

**Final run:**
- 32 suites PASS 672 / FAIL 0;
- browser: recovery 9, idbfail 3, idbdur 5, syncinteg 1, offline 16, xlroundtrip ndiff 0, csp OK, smoke no errors;
- explicit upgrade from production 0.47.0 → 0.48.0 PASS.

**Mobile check (390 px):** filtered pages render with no errors and no horizontal overflow.
