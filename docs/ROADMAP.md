# Roadmap — SandooghYar (synchronised with 0.47.0)

The earlier detailed roadmap is `docs/13_ROADMAP.md`. This file is the current status view. Decision IDs refer to DECISION_REGISTER.md.

## Completed
| Feature | Version |
|---|---|
| Recovery mode, safe cloud sync, 8 snapshots, full Excel backup, CSP | 0.41 |
| Restore integrity, read-only mode when IndexedDB fails | 0.42 |
| Durable IndexedDB queue, offline shell copy, reports tab, alert centre, fund archive, deposit void and replace, strict Jalali dates, institution identity | 0.44 |
| Year-end close | 0.45 |
| Provider-independent AI gateway, cash flow, liquidity and obligations forecast, loan portfolio, anomaly detection, AI management summary | 0.46.0 |
| Report fund selection: one, several or all | 0.46.1 |
| Multi-fund financial events, installment schedules, member profile and timeline, automatic reconciliation, fund health report, audit fixes | 0.47.0 |

## Pending — needs an owner decision or approval
| Priority | Item | Ref |
|---|---|---|
| 1 | Real-device test of 0.47.0 (Android, offline, backup and restore) | owner action |
| 2 | Keep the development source in a private repo | D-24 |
| 3 | At-rest encryption on the phone | D-21, docs/12 §3 |
| 4 | Separate origin from Reza Desk, or fix Reza Desk's service worker | D-22, ADR-06 |
| 5 | One-touch reminders to overdue members | D-20 |
| 6 | Scenario forecasting (queue payouts, refunds) | D-20 |
| 7 | Stored per-loan plan override (grace periods, irregular plans) | ADR-09 |
| 8 | SRI / vendoring of the CDN libraries, then removal of `'unsafe-inline'` | docs/12 §4; network was blocked |
| 9 | Compare the Mehr data file (report only) once it is supplied | D-13 |
| 10 | OneDrive mirror of the docs | D-27 |

## Suggested by an AI, not approved
- Saved custom report definitions (`S.rep`).
- AI ranking of anomalies.

## Excluded
- Multilingual support (D-15).
- Multi-user roles (D-11).
- Automatic import or merge of external data (D-08, D-13).
- AI with write authority (ADR-07).
