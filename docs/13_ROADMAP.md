# 13 — Roadmap (after 0.45.0)

Principles: the live app data is the single source of truth. AI never writes financial records; every suggestion needs a human confirmation and goes through the normal entry forms. The core works fully without AI or network. No feature enters a release without synthetic tests and the financial-invariant suite.

Hooks that already exist and must be kept:
- single data model `S` + derived ledger (`jdocs`/`jtb`/`ybs`, `bal`, `cashOf`);
- anonymised export (`anonS`) and AI data minimisation (`aiHide`/`aiShow`);
- own AI config (`sy.ai`, no `miz.ai`);
- health checks (`health0`) and alert centre (`alrItems`);
- durable write queue (`LS`);
- test runner `runall.sh`.

| Priority | Item | Approach | Prerequisite |
|---|---|---|---|
| 1 | **Smart assistant + cash-flow analysis** | Extend the existing assistant: read-only questions over an anonymised summary (monthly receipts and payments per fund, `rcpts`), answers with links to the source report; entry suggestions prefill forms only | Keep `aiHide` on every prompt; per-feature on/off toggle |
| 2 | **Liquidity and obligation forecast** | Deterministic first (no AI): expected installments from `loanBlock`/terms, expected loans from the queue (`lq`), refunds; 3–6-month projection per fund; AI explanation optional | Installment schedules per loan (term already stored) |
| 3 | **Anomaly and mismatch detection** | Rule layer in `health0` + alert centre (duplicates, unusual amounts against member history, out-of-pattern months, cash gaps); optional AI ranking of findings | Thresholds per fund, configurable |
| 4 | **Smart member/loan/installment reports** | Saved report definitions (filters + columns) over existing data; natural-language → report definition (AI optional, preview before run) | Report-definition schema (small JSON in `S.rep`) |
| 5 | **Independence from Miz-Kar + AI readiness** | (a) Miz-Kar's worker must delete only its own caches. (b) Own origin: a new GitHub Pages repo/domain; migration by encrypted backup → restore on the new origin, old site shows a redirect notice; rollback = keep the old origin live. (c) AI gateway = one adapter function (`aiCall`), so providers or on-device models can be swapped without touching the core | (b) needs its own tested migration plan before execution |

Also open:
- at-rest encryption (design in docs/12 §3);
- SRI/vendoring (steps in docs/12 §4);
- real-device and real-network tests;
- comparing the Mehr data file once it is supplied.

## Status in 0.46.0

| Priority | Status |
|---|---|
| 1 | **Done (read-only).** A provider-independent gateway, `AIPROV` (Gemini, OpenAI, OpenRouter), behind a single `aiCall`. `aiInsight` writes a management summary from `finSum`, which carries aggregates only (no names or ids). The assistant has no write authority. The CSP allows only the three provider hosts. |
| 2 | **Done (deterministic).** `fcst`: 6-month cash projection per fund. Savings are projected at the 3-month average; installments use `sugg`, capped at the outstanding balance. Also shows queue obligations with a months-to-cover estimate, member credit, refundable capital and suspense. The page `fcst` adds a 6-month cash-flow table from `cflow`. |
| 3 | **Done (rules).** `anomList` flags: duplicates (same member, type, month and amount); amounts above 3× the member's median (needs ≥4 history entries); overdue (≥3 months without an installment while a loan is open); negative cash. Thresholds live in `ANOM`. The page is `anom`, and the alert centre carries a summary line. Optional AI ranking is not done. |
| 4 | **Partly done.** Fixed loan-portfolio report `lport`: buckets current, late and overdue, with a per-loan last-installment and months-without-installment table, printable. Saved custom report definitions (`S.rep`) are not done. |
| 5 | **(c) is done** (the adapter gateway). (a) and (b) stay open: they belong to the separate Miz-Kar project, or need domain migration and a decision. |

The new features are grouped under module `ins` (on/off in the modules settings). Tests: `tests/v46test.js` (33 checks).
