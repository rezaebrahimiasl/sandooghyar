# Changelog — SandooghYar

- Versions ≤ 0.40 are summarised from Git commit titles; see `git log` for details.
- The in-app «تازه‌ها» list (`WHATS_NEW` in the source) has user-facing notes per version.

## 0.48.0 — 2026-11-06
- **Shared Jalali date-range filter**, combined with the multi-fund selection:
  - presets: today, yesterday, week, current/previous month, 3/6 months, current/previous year, all, custom;
  - comparison with the previous period or the same period last year.
- **Applied to:**
  - multi-fund financial events (period flows per fund and consolidated, with comparison);
  - schedule table and payment history;
  - historical and current overdue (`lport(fid,at)`);
  - member profile and timeline; member statement (opening and closing at the range edges);
  - cash flow (consolidated and per fund, with comparison); reconciliation (range months);
  - injections; inter-fund transfers; voided documents (by void time); audit log (by local day).
- **New test suite:** `tests/v48test.js` (month and year boundaries, leap Esfand, custom ranges, week, Tehran local-day timestamps, combined fund + date filters, no mutation).

## 0.47.0 — 2026-11-05 (this release; the commit id is recorded in CURRENT_PROJECT_STATE.md)
- **Installment schedules** (`lsched`, `schBox`):
  - the member profile shows the schedule, the next installment, the end month and the arrears;
  - an opening loan uses the agreed monthly installment (`qsSet`, audited);
  - the loan portfolio, forecast and fund health now use the schedule.
- **Multi-fund financial events.** `fop` follows the shared fund selection, with a totals table.
- **Member profile and timeline** (`ptl`, `ptlEv`, `ptlSum`):
  - a summary per membership;
  - one chronological timeline of transactions, voids, loans, deposits, queue entries, messages, injections and audit events.
- **Automatic reconciliation** (`reconF`, `recon`):
  - 7 ledger checks per fund per month, plus recorded bank reconciliations;
  - errors appear in the alert centre.
- **Fund health** (`fhealth`, `fhl`): 8 indicators with green, yellow and red lights.
- **Independent audit and fixes:**
  - yearly member balance for 1405;
  - injection repayment checked against later months;
  - negative credit and injection health checks;
  - archived funds are read-only on every write path;
  - AI masking normalises ي/ك;
  - the cash-flow «سایر» column (net = change in cash);
  - forecast refundable capital from the balance sheet;
  - the shared bank account in reconciliation;
  - no false arrears for transferred or voided loans;
  - the reconciliation cache.

  See DEVELOPMENT_JOURNAL.md.
- **Portable project documentation system:** PROJECT_MASTER_CONTEXT.md and docs/*.
- **Tests:** new `tests/v462test.js`.

## 0.46.1 — 2026-11-05 — `d44850f`
- One shared fund selection (one, several or all) for all reports, remembered between sessions.

## 0.46.0 — 2026-11-05 — `750ac84`
- Provider-independent AI gateway (Gemini, OpenAI, OpenRouter).
- Cash flow; 6-month liquidity and obligations forecast; loan portfolio and overdue loans; anomaly detection.
- Anonymised AI management summary.
- New module `ins`.

## 0.45.0 — 2026-11-05 — `d12ae0e`
- Year-end close (presentation only), `H-YCLOSE-RES`, roadmap (docs/13).

## 0.44.0 — 2026-11-05 — `c3e75a7`
- Durable IndexedDB write queue.
- Offline launch from an IndexedDB shell copy.
- Reports tab; alert centre.
- Voided-records statement and report; deposit void and replacement.
- Fund archive policy.
- Strict Jalali dates; institution identity.
- miz.ai removed.

## 0.42.0 — 2026-10-31 — `b29e7ab` (old recovery point; tag `v0.42.0` is local only)
- App data is authoritative; failed IndexedDB means read-only mode; integrity check before restore; more complete closed-month controls.

## 0.41.0 — 2026-10-22 — `e233f9c`
- Recovery mode; no silent cloud replacement; 8 snapshots with comparison; full Excel backup; CSP.

## 0.29 – 0.40.1 — 2026-10-14 … 2026-10-21
| Version | Changes |
|---|---|
| 0.29.1 | Public build without member data |
| 0.30 | Data-quality hub; all-funds home |
| 0.31 | Unified member entry; yearly close; settlement message |
| 0.32 | App lock; encrypted file backup |
| 0.33 | Smart assistant |
| 0.34 | Multi-device sync |
| 0.35 | Rial precision; undo; receipts; remembered filters |
| 0.36 | Member balance views; multi-fund totals |
| 0.37 | Splash animation |
| 0.38 | Liquidity shortfall and suspense; injection ledger |
| 0.39 | Unified cash; receipts |
| 0.40 | Audit fixes |
| 0.40.1 | Investors |

Details: `git log`.
