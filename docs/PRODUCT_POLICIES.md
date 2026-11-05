# Product policies and owner requirements — SandooghYar

Status legend:
- **[APPROVED]** — the owner (Reza) stated or approved it.
- **[IMPLEMENTED]** — it is in the code (version given).
- **[AI-SUGGESTED]** — proposed by an AI and not approved.
- **[REJECTED]** — the owner declined it.

Sources: the owner's messages in the Claude sessions (2026-10 … 2026-11, see USER_INTERACTION_HISTORY.md) and the owner's standing preferences.
Last synchronised: 2026-11-05 (release 0.47.0).

## 1. Product identity

- **Name and purpose.** «صندوق‌یار» (SandooghYar) is a Persian, RTL, mobile-first, offline PWA for managing family and mosque Qard al-Hasana (interest-free loan) funds. Designer and credit: «مؤسسه رنگ خدا». [APPROVED]
- **Initial funds:** صندوق خانوادگی, مسجد امیر علیه السلام, مسجد امام حسین ع. [APPROVED]
- **Single administrator.** The app has one administrator and no multi-user roles (policy "single", 0.44). [APPROVED]
- **Persian only.** Multilingual support is excluded. [REJECTED for now — explicitly excluded in the 0.45/0.47 missions]
- **Hosting and backups.**
  - The app is hosted on GitHub Pages from the public repo `rezaebrahimiasl/sandooghyar` and auto-updates after install. [APPROVED, IMPLEMENTED]
  - Encrypted backups go to the owner's private repo; the owner named it `rezaebrahimiasl/sandooghyar-backup`. This name is not verifiable from here because it is configured only on the phone. [APPROVED]
- **Independence from Reza Desk.** SandooghYar is kept fully separate from «میز کار / Reza Desk»: no shared keys and no miz.ai dependency (since 0.44). [APPROVED, IMPLEMENTED]
- **No paid in-app AI.** Do not use paid features inside the app that consume Claude usage. Free or optional smart features are fine. The AI uses the owner's own key, which lives only on the phone. [APPROVED]

## 2. Data authority and safety (non-negotiable)

1. **Live data is authoritative.** The live app data on the phone is the truth. The original Excel workbook (sheet 1405) contained errors and is **not** an accounting baseline. [APPROVED 2026-10-28]
   - Never overwrite, reconcile, re-seed or "correct" real records to match the workbook.
   - Report discrepancies; do not change data.
2. **No real data in development.**
   - Never modify, replace, import, migrate or reseed real financial data during development or inspection.
   - Tests use synthetic data only. [APPROVED]
3. **The public build never contains member data.** The Excel fixture is stripped by `build.py`. [APPROVED, IMPLEMENTED]
4. **No secrets anywhere.** Card numbers, account numbers, API keys and tokens never go into code, chat, memory, docs or repos. The Gemini key stays only on the owner's phone. [APPROVED]
5. **History is kept.** Every record must be editable and keep its edit history. Corrections are made as void + replacement, never as silent overwrite. [APPROVED, IMPLEMENTED]
6. **The Mehr data file may be compared but never imported.** The comparison is a report only. The file has not been supplied. [APPROVED]

## 3. Approved business policies

| Policy | Value | Since |
|---|---|---|
| Amount unit | million toman. Precision is to the rial (R = 1e‑7). Rial is always written once as «… تومان معادل … ریال». Summary pages show 1 decimal; detail pages show the exact amount. | ≤0.35 |
| Overpayment | An installment above the loan balance becomes member credit («طلب عضو»). | early |
| Member credit use | **manual** — no automatic offset or consumption | 0.44 |
| Concurrent loans | **per_fund** (`fund.multiLoan`); each fund has its own rule | 0.44 |
| Default loan term | 10 installments, selectable at issue (1–60) | early |
| Guarantors | Not used (family fund). The member is responsible even when the real recipient («گیرندهٔ واقعی») is a non-member. | early |
| Savings | Monthly savings are optional; blank ≠ zero | early |
| Loan lottery | Optional feature. In practice the funds use need-based lending. | early |
| Fund with history | Cannot be deleted, only archived | 0.44 |
| Voids | Reason required. The record moves to the voided list and stays visible in statements and in the «اسناد ابطال‌شده» report. | 0.36–0.44 |
| Month and year close | Locks the period. Reopening requires a reason. The year-end close is presentation-only: income and expenses are closed into accumulated surplus with no duplicate postings. | 0.31 / 0.45 |
| Installment reminders | Sent on the 28th of the Persian month to members owing an installment, using the ticked phone numbers (and the real recipient if chosen) | requested; the message centre `rmd` exists, the exact 28th-day trigger was not re-verified |
| Capital injection | Can be shared across several or all funds. The source can be a member, an ex-member or an outsider. It is refundable or a donation. | 0.38 |
| Institution identity | `S.org`, default «مؤسسه رنگ خدا» | 0.44 |
| AI | Optional and on/off per module. It never writes data. Names are coded before sending; analysis sends aggregates only. Provider-independent (Gemini, OpenAI, OpenRouter). | 0.33 / 0.46 |
| Installment schedule (opening loans) | Built only from the member's agreed monthly installment (`m.qs`); otherwise "unknown" | 0.47 |

## 4. Standing UI and engineering preferences of the owner

- **Before applying a request:**
  - Evaluate it against accounting principles, modern banking and software standards, and the best global apps.
  - Then apply it, or adjust it properly if it does not conform.
  - Say so if a better or shorter solution exists.
- **Keep the app coherent.**
  - Review the whole app for coherence, uniform names and arrangement, and no duplicate buttons.
  - Keep it simple, dynamic and up to date.
- **Language and device.** Replies are in Persian; the owner uses an Android phone.
- **Feature proposals.**
  - Propose new capabilities and build them only after approval.
  - Bugs and the owner's own requests are done directly.
  - Optional smart features are user-selectable toggles.
- **Page design.**
  - Reveal related information progressively; avoid long tiring pages.
  - Journal-style entry forms (date, account code, description, debit/credit, totals), tabular where possible.
  - Every document or record offers view, edit, register and print.
- **Tables and lists.**
  - Table text is right-aligned and numbers keep their alignment. Long text wraps to two lines instead of horizontal scrolling.
  - Lists offer filters and reopen with the last filter.
- **Interaction.**
  - Undo appears only after delete- or void-like actions.
  - The back button goes back exactly one nested step.
  - Every tile and figure on summary pages is tappable down to the underlying record.
- **Look and assurance.**
  - Colors and icons are meaningful and attractive.
  - A periodic deep independent review is welcome: a separate reviewer audits like an auditor, then the findings are reviewed together and approved items are fixed.
- **Portable project memory (2026-11-05, permanent).** Keep the documentation system in this repo continuously synchronised. See AI_CONTINUATION_GUIDE.md.

## 5. Proposals status

| Proposal | Status |
|---|---|
| Multi-fund selection in reports | APPROVED + IMPLEMENTED 0.46.1 |
| (1) multi-fund financial events | APPROVED 2026-11-05 → IMPLEMENTED 0.47.0 |
| (2) installment schedules per loan | APPROVED → IMPLEMENTED 0.47.0 |
| (5) independent full audit | APPROVED → executed for 0.47.0 (see DEVELOPMENT_JOURNAL) |
| (8) member profile and timeline, (9) automatic reconciliation, (10) fund health report, (11) financial operation safeguards | APPROVED → IMPLEMENTED 0.47.0. For (11), existing guards were reviewed; audit fixes are listed in CHANGELOG. |
| (3) one-touch reminders to overdue members | NOT in the 0.47 mission (explicitly excluded); PENDING |
| (4) scenario forecasting | Explicitly excluded from 0.47; PENDING |
| (6) at-rest encryption on the phone | Explicitly excluded from 0.47; design only (docs/12 §3); PENDING |
| (7) separate domain from Reza Desk | Explicitly excluded from 0.47; PENDING owner decision |
| Multilingual support | EXCLUDED |
| Saved custom report definitions, AI ranking of anomalies | AI-SUGGESTED (docs/13), not approved |
| Where to keep the development source | PENDING owner decision — see DECISION_REGISTER D-24 |
