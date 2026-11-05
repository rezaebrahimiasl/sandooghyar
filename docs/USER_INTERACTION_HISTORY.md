# User interaction history — SandooghYar

Recovered from:
- the Claude session transcript of 2026-10-22 … 2026-11-05, including its summaries of earlier context;
- the owner's attached instruction files;
- the Git history.

Times are UTC. Earlier work was done with ChatGPT and in other Claude chats. Those messages are **not recoverable** here; only the summaries below are known.

Legend: **R** request · **D** decision or approval · **C** correction · **X** rejection or exclusion · **P** preference.

## Before 2026-10 (from summaries only; exact dates unknown)

- **R** The owner built the first versions with ChatGPT (file `sandooqyar_1405_mobile_v32.html` plus a master specification). He asked Claude for a **new clean implementation** rather than continuing v32.
  - Initial data from sheet «1405» of the Khordad-1405 workbook.
  - Spec: Person ≠ Membership ≠ Fund; overpayment → member credit; blank ≠ zero; period close with lock; audit log; backup and restore; PWA with versioning.
- **P** Owner preferences stated at the start:
  - amounts in million toman;
  - loans mostly 10 installments;
  - one person can be in all three funds, but names are never merged without confirmation;
  - bulk entry;
  - aggregate reports across selected funds;
  - person fields (national ID, phone, account, father's name, address);
  - «رنگ خدا» shown as designer.
- **D** Hosting and backups:
  - the offline PWA is hosted on GitHub Pages (`rezaebrahimiasl/sandooghyar`) and auto-updates like Reza Desk;
  - encrypted backups go to the private repo `rezaebrahimiasl/sandooghyar-backup`.
- **P** Fund practice:
  - family fund, no guarantors; the member stays responsible when a non-member is the real recipient;
  - no lottery in practice (optional feature allowed);
  - no paid in-app AI.
- **R** Reminders and loan management: installment reminders on the 28th; a loan queue and potential-borrowers report; selectable loan term (default 10); capital injection shared across funds.
- **R** 2026-10 (versions 0.33–0.40, Git history):
  - smart assistant with the owner's own Gemini key;
  - multi-device sync;
  - receipts; undo;
  - fund totals in multi-fund pages;
  - a selectable splash animation («قرض» and «حسن» following each other on a large circle);
  - capital-injection ledger everywhere;
  - liquidity shortfall → find the cause, or post to suspense or investor;
  - investors visible in the members report.
- **R** Handover package of 10 documents (docs/00–09, commit `a2f5ed1`, 2026-10-22). **D** «آره بگذار»: put the docs in the repo.
- **R** R01 security, backup and recovery review (report only, wait for approval). **D** «خوب الان دستورات لازم را انجام بده»: implement FX-1…FX-5. FX-6 (lock and encryption) and FX-7 (fund deletion) were held for an owner decision. → 0.41.0.
- **P** Workflow: the owner gives Claude precise prompts, takes the reports to ChatGPT (reviewer and acceptance authority), and returns with the next prompt. No hasty changes; no wasted tokens.

## 2026-10-22
- **R** 07:48 — Asked whether the same work could be done for «میز کار رضا» (Reza Desk), or whether to ask in its own chat.
  - Outcome: Reza Desk stays separate.

## 2026-10-28
- **D** 11:09 — **Critical Data Authority Rule.** Current app data is authoritative. The Excel workbook had errors and is not a baseline. Never overwrite, reconcile or re-seed; report only.
- **R** 11:25 — Implement fixes A–E in one batch, preserving real data.
- **C** 11:36 — «فعلاً commit و انتشار نکن» (do not commit or publish yet). The owner wanted to review the diff first.
- **R** 11:56 — Fix only two issues: an `rcvFresh` RCV guard, plus one more review item.
- **R** 12:17 — Continue as senior engineer toward a release-ready, financially correct version.
- **R** 12:27 — Final pre-commit verification of 0.42.0 (no changes).
- **R** 17:12 — Question about where to supply the encrypted backup file.

## 2026-10-31
- **R** 09:28 — Final engineering status and handoff audit (audit only; ~3 days of usage left).
- **R** 09:48 — 0.42.0 final recovery-integrity implementation.
- **D** 12:21 — 0.42.0 final verification, release and deployment → `b29e7ab` published.

## 2026-11-02
- **R** 03:45 — Only ~1 % of Claude usage left. Transfer the work so development can continue elsewhere (ChatGPT).
- **D** 04:18 — Create the private development ZIP (complete source, tests and docs).

## 2026-11-04
- **R** 11:17 — Comprehensive engineering mission (durability, security, financial correctness).
- **R** 12:11 — Execution mission. ChatGPT is the independent architect and acceptance authority.
- **R** 12:14 — Stage 2 (IndexedDB durability) only, with a preflight budget check.
- **C** 12:17 — The Stage 2 design was not approved yet; revise it first.

## 2026-11-05
- **D** 08:01 — Stage 2 final execution order on branch `stage2-idb`.
- **D** 10:16 — **0.44 mission**, with fixed policies:
  - concurrent loans **per_fund**;
  - member credit use **manual**;
  - users **single**;
  - the Mehr file: compare only, never import.
- **D** 10:19 / 12:10 — Proceed immediately and complete the entire 0.44 mission.
- **R** 12:17 — The app failed to launch offline: investigate, fix, test → shell copy in IndexedDB.
- **C** 13:29 — Two review findings: `waitUntil` after an await, and an outdated HANDOFF. Both fixed.
- **D** 13:40 — Final comprehensive mission: complete everything except multilingual support; commit, merge and deploy authorized; never reseed real data. → 0.44.0 published as `c3e75a7`.
- **D** 15:20 — «دستور اجرایی نهایی»:
  - stabilize 0.45;
  - decide year-end policies by the standard approach;
  - roadmap;
  - commit and push.

  → 0.45.0 published as `d12ae0e`.
- **D** 15:39 — «فرمان جامع توسعه و انتشار» from 0.45.0. Implement docs/13 as real features:
  - AI gateway;
  - analysis, forecast, anomalies;
  - management reporting;
  - modules;
  - security.

  Do not wait for stage approvals. → 0.46.0 published as `750ac84`.
- **P** 15:43 (mid-task) — Only tonight, about 40 % quota left.
  - Prioritise real features.
  - Commit locally after each stage.
  - Record the exact remaining work if out of quota.
- **R** 16:30 — Technical handover package (no code or Git changes) → package `sandooghyar-handover-0.46.0.zip` (SHA-256 `e108292e…`).
- **R** 18:33 — Reports should allow selecting one or several funds, not only one or all. → 0.46.1 published as `d44850f`.
  - Claude listed 7 proposals for approval.
- **D** 18:46 — Approved the consolidated final mission:
  - proposals 1 (multi-fund events), 2 (installment schedules) and 5 (independent audit);
  - items 8–11 (member profile and timeline, automatic reconciliation, fund health, financial safeguards);
  - ledger architecture review.
- **X** The same message excluded from this mission: multilingual support, encryption, domain separation, one-touch messaging and scenario forecasting.
- **D** The same message authorized commit, merge and deployment, with the condition: do not publish if a critical financial defect remains.
- **D** 18:55 (mid-task) — **Permanent portable project memory and documentation system.** This file is part of it.
- **D** 19:20 — Engineering result:
  - 0.47.0 deployed from `fa1da94`; GitHub Pages deployment success;
  - two independent agent reviews held, and all their Critical and Major items fixed before publishing;
  - documentation system created (D-23).
