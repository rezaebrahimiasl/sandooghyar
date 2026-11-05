# SandooghYar (صندوق‌یار) — Project master context

**Start here.** This file and the documents it links are the project's permanent memory. They do not depend on any AI assistant's private memory or on earlier conversations.

## What it is
«صندوق‌یار» is a Persian, RTL, mobile-first, offline-capable PWA for managing family and mosque **Qard al-Hasana** (interest-free loan) funds.

- It keeps for each fund:
  - members' savings, loans and installments;
  - member credit; capital injections;
  - fund events (assets, income, expenses);
  - deposits; a loan queue.
- It produces:
  - receipts and statements;
  - a derived double-entry journal, trial balance and balance sheet;
  - year-end close;
  - reconciliation, fund health, forecast and anomaly reports.
- Optional AI assistant: it can use different providers and never writes data.
- Owner and sole administrator: Reza. Designer credit: «مؤسسه رنگ خدا». All amounts are in million toman.

## Where things are
| What | Where |
|---|---|
| Live app | https://rezaebrahimiasl.github.io/sandooghyar/ |
| Repository (built app + docs) | https://github.com/rezaebrahimiasl/sandooghyar, branch `main` |
| Development source and tests | private package `sandooghyar-private-<version>.zip` (see [CURRENT_PROJECT_STATE](docs/CURRENT_PROJECT_STATE.md)) |
| Real data | only on the owner's phone (IndexedDB), plus his encrypted backups — **never in this repo** |

## Documents
| Document | Purpose |
|---|---|
| [docs/AI_CONTINUATION_GUIDE.md](docs/AI_CONTINUATION_GUIDE.md) | **How a new assistant or engineer takes over** (read second) |
| [docs/CURRENT_PROJECT_STATE.md](docs/CURRENT_PROJECT_STATE.md) | Version, commits, deployment, tests, known issues, next task |
| [docs/PRODUCT_POLICIES.md](docs/PRODUCT_POLICIES.md) | Owner-approved policies, preferences, proposal status |
| [docs/FINANCIAL_RULES.md](docs/FINANCIAL_RULES.md) | Accounting rules, loans, installments, corrections, invariants |
| [docs/DATA_ARCHITECTURE.md](docs/DATA_ARCHITECTURE.md) | Entities, storage, migrations, backup, recovery |
| [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) | ADR log |
| [docs/DECISION_REGISTER.md](docs/DECISION_REGISTER.md) | Approved, pending, superseded and rejected decisions |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Completed, pending, suggested, excluded |
| [docs/USER_INTERACTION_HISTORY.md](docs/USER_INTERACTION_HISTORY.md) | Owner requests, corrections, approvals (dated) |
| [docs/DEVELOPMENT_JOURNAL.md](docs/DEVELOPMENT_JOURNAL.md) | Engineering stages, tests, audits |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Versions |
| [HANDOFF.md](HANDOFF.md) | Persian technical handover: commands, build, test, release, rollback (§7), history |
| [docs/14_ARCHITECTURE_MAP_0.46.md](docs/14_ARCHITECTURE_MAP_0.46.md) | Architecture diagrams and code map |
| [docs/15_DATA_DICTIONARY_0.46.md](docs/15_DATA_DICTIONARY_0.46.md) | Field-level data dictionary |
| [docs/README.md](docs/README.md) and docs/00–13 | Earlier handover set (0.40.1), R01 remediation, durability, 0.44 changes, roadmap |

## Non-negotiable rules (summary)
1. The live app data is authoritative. Never modify, re-seed or import real data. Use synthetic data for tests.
2. Never put secrets or member data in code, docs or repos. The public build contains no member data.
3. Financial history is never deleted; corrections are void + replacement.
4. The AI is optional, read-only and provider-independent.
5. Publishing, merging and destructive operations need the owner's authorization.
6. Talk to the owner in Persian.
7. Keep these documents synchronised after every meaningful interaction (D-23).

## Current status (one line)
0.48.0 is the production version on GitHub Pages. See [CURRENT_PROJECT_STATE](docs/CURRENT_PROJECT_STATE.md) for exact commits, tests and the next task.
