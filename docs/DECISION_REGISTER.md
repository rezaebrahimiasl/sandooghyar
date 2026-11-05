# Decision register — SandooghYar

Status values: **Approved** (by the owner) · **Directed** (an owner-approved mission left the technical choice to the engineer; the engineer chose) · **Pending** (needs the owner) · **Superseded** · **Rejected/Excluded**.

An AI suggestion is never recorded as Approved.

| ID | Date (UTC) | Decision | Status | Source / evidence | Implemented |
|---|---|---|---|---|---|
| D-01 | before 2026-10 | Person ≠ Membership ≠ Fund; overpayment → member credit; blank ≠ zero; period lock; audit log | Approved | owner spec (summary) | yes |
| D-02 | before 2026-10 | Amounts are in million toman | Approved | owner | yes |
| D-03 | before 2026-10 | GitHub Pages public app; encrypted backups in the private repo `sandooghyar-backup` | Approved | owner | yes (backup repo configured on the phone; not verifiable here) |
| D-04 | before 2026-10 | No paid in-app AI; optional AI with the owner's own key on the phone only | Approved | owner | yes |
| D-05 | 2026-10 | R01 fixes FX-1…FX-5 | Approved | «خوب الان دستورات لازم را انجام بده» | 0.41.0 |
| D-06 | 2026-10 | FX-6 lock hardening and at-rest encryption | Pending → see D-21 | owner decision needed | design only |
| D-07 | 2026-10 | FX-7 fund deletion policy | Superseded by D-12 | — | — |
| D-08 | 2026-10-28 | **Live app data is authoritative; the Excel workbook is not; never re-seed or "correct" data** | Approved | Critical Data Authority Rule | yes (`authtest`) |
| D-09 | 2026-11-05 | Concurrent loans **per_fund** | Approved | 0.44 mission | 0.44.0 |
| D-10 | 2026-11-05 | Member credit use **manual** (no automatic offset) | Approved | 0.44 mission | 0.44.0 |
| D-11 | 2026-11-05 | Users: **single** administrator | Approved | 0.44 mission | yes |
| D-12 | 2026-11-05 | A fund with history is archived, never deleted | Directed (0.44 mission) | 0.44 | 0.44.0 |
| D-13 | 2026-11-05 | Mehr data file: compare and report only, never import | Approved | 0.44 mission | file not supplied |
| D-14 | 2026-11-05 | No miz.ai / Reza Desk dependency; SandooghYar separate | Approved | missions 11-04 / 11-05 | 0.44.0 |
| D-15 | 2026-11-05 | Multilingual support excluded | Rejected/Excluded | missions 13:40, 18:46 | — |
| D-16 | 2026-11-05 | Year-end close: standard nominal-account close into accumulated surplus, presentation only; reopen with a reason | Directed («دستور اجرایی نهایی») | docs/12 §2 | 0.45.0 |
| D-17 | 2026-11-05 | Implement the docs/13 roadmap as product (AI gateway, forecast, anomalies, reporting) | Approved | «فرمان جامع» 15:39 | 0.46.0 |
| D-18 | 2026-11-05 | Reports: select one, several or all funds | Approved (owner request) | 18:33 | 0.46.1 |
| D-19 | 2026-11-05 | Proposals 1, 2 and 5; items 8–11; ledger review | Approved | 18:46 | 0.47.0 |
| D-20 | 2026-11-05 | One-touch reminders (3) and scenario forecasting (4) | Excluded from 0.47; Pending | 18:46 | no |
| D-21 | 2026-11-05 | At-rest encryption (6) | Excluded from 0.47; Pending | 18:46 | design only |
| D-22 | 2026-11-05 | Domain separation from Reza Desk (7) | Excluded from 0.47; Pending | 18:46 | no (ADR-06 workaround) |
| D-23 | 2026-11-05 | Permanent portable project memory system in the repo | Approved | 18:55 | 0.47.0 docs |
| D-24 | 2026-11-05 | Where to keep the development source (it contains the Excel test fixture; must not go to the public repo). Engineer recommendation: a private repo or the existing private backup repo, with fixture names pseudonymised. | **Pending** | engineering | no — today only in the private ZIP packages |
| D-25 | 2026-11-05 | Installment schedule derived (ADR-09); opening loans need the agreed monthly installment `m.qs` | Directed (D-19 asked for "accurate schedules") | ADR-09 | 0.47.0 |
| D-26 | 2026-11-05 | Fund-health thresholds `FHT`: liquidity 3 %, loans to savings 95 % / 105 %, collection 90 % / 70 %, overdue 5 % / 15 %, dormant > 10 % = yellow | Directed; the owner may change them | `FHT` in source | 0.47.0 |
| D-27 | 2026-11-05 | OneDrive backup of the docs | Pending — no OneDrive connector is available in this environment | — | no |
