# Architecture decisions (ADR log) — SandooghYar

Format: decision · alternatives · reasons · consequences and risks · rollback.

Status meanings:
- **Accepted** — implemented, and approved by the owner or directed by an owner-approved mission;
- **Proposed** — not approved.

## ADR-01 Single-file vanilla PWA (Accepted, ≤0.29)
- **Decision.** One HTML file with HTML, CSS and JS; no framework, bundler or runtime dependencies.
- **Alternatives considered.** React or Vite.
- **Reasons.** It installs and updates from GitHub Pages, works offline, and is easy to hand between assistants.
- **Risks.**
  - Large file (~2000 lines, ~750 functions).
  - Inline handlers force `'unsafe-inline'` in the CSP.
- **Rollback.** Not applicable.

## ADR-02 Derived ledger, not stored ledger (Accepted, 0.36–0.39)
- **Decision.**
  - Member transactions and fund events are the only stored financial facts.
  - The double-entry journal (`jdocs`), trial balance and balance sheet are *derived* on demand.
- **Reasons.**
  - A single source of truth.
  - No drift between a stored ledger and the records.
- **Consequences.**
  - Every report agrees by construction.
  - The 0.47 automatic reconciliation (`reconF`) verifies the derivations for every month.
  - Performance is O(months²) for full reconciliation; acceptable at the current data size (measured ~11 ms on the 81-membership fixture).

## ADR-03 Void + replacement instead of edit/delete (Accepted, 0.36–0.44)
- **Decision.** Financial history is never deleted. Corrections keep the chain `rno`, `rv`, `prev`, `rto`.
- **Consequences.** Statements and the «اسناد ابطال‌شده» report show the full history.

## ADR-04 Durable IndexedDB write queue (Accepted, 0.43/0.44)
- **Decision.** A generation-aware serialized queue. Success is reported only after the transaction completes. A failed IndexedDB means read-only recovery.
- **Reason.** Earlier versions reported success before the write was durable.
- **Rollback.** A 0.42 build still reads the same key.

## ADR-05 Recovery mode and restore integrity (Accepted, 0.41/0.42)
- **Decision.**
  - Never save over, or upload, unreadable data.
  - Every restore passes through comparison and integrity checks.
  - Silent cloud adoption only when the device is unchanged.

## ADR-06 Shell copy in IndexedDB for offline launch (Accepted, 0.44)
- **Problem.** Reza Desk's service worker on the same origin deletes all caches, so the app could not open offline.
- **Decision.** Keep a last-good page copy in IndexedDB `sandooghyar-shell` and rebuild the caches from it.
- **Proper fix (Proposed).** A separate origin, or fixing Reza Desk's worker. This is excluded from the 0.47 mission.

## ADR-07 Provider-independent AI gateway, read-only (Accepted, 0.46)
- **Decision.**
  - `AIPROV` adapters behind `aiCall`.
  - The key is stored only on the device.
  - Names are coded before sending; analysis sends aggregates only.
  - The AI has no write path.
- **Rollback.** Remove the providers from `AIPROV` and the CSP.

## ADR-08 Deterministic analysis before AI (Accepted, 0.46/0.47)
- **Decision.** Forecasting, anomaly detection, loan portfolio, fund health and installment schedules are pure functions over the data. The AI only writes optional prose.

## ADR-09 Installment schedule derived, not stored (Accepted, 0.47)
- **Decision.** `lsched` derives schedules from loans plus `m.qs`. Arrears = actual outstanding − scheduled outstanding.
- **Alternatives considered.** Storing a schedule per loan (new collection, migration, edits).
- **Reasons.** No migration; consistent with balances; works for all existing data.
- **Limits.**
  - Opening loans need `m.qs`.
  - Irregular agreed plans (e.g. a grace period) cannot be expressed.
- **Future.** An optional stored per-loan plan override.

## ADR-10 Shared report fund selection (Accepted, 0.46.1)
- **Decision.** One selection `ui.rg`, synced to each report's legacy variable and remembered in `CFG.uk`. The alert centre always uses all funds.

## ADR-11 Public build vs development source (Accepted)
- **Decision.**
  - `build.py` produces the public build: fixture stripped, CSP, PWA on.
  - The development source with the test fixture is **not** in the public repo.
- **Risk.** The development source lives only in private packages.
- **Pending.** Owner decision D-24 (private repo).

## ADR-12 Portable project memory in the repo (Accepted, 2026-11-05)
- **Decision.** The documentation system (PROJECT_MASTER_CONTEXT.md + docs/*) is versioned with the app and must be synchronised after meaningful work.
