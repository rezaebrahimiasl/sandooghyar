# 08 — Requirements and Open Questions

## 1. Explicit owner requirements (standing rules stated by the owner in conversation)

| ID | Requirement (owner's wording, paraphrased) | Implementation status |
|---|---|---|
| REQ-01 | Persian, mobile-first (Android), offline PWA, auto-update from GitHub Pages | Implemented (doc 00) |
| REQ-02 | Amounts in **million toman**. Summaries show 1 decimal; details show exact amounts; key places add rial, **once**, as «… تومان معادل … ریال» | Implemented (`F`, `Fs`, `Rl`). Rial shown on receipts, fund-event view and capital ledger. Coverage of "key places" is a judgement call. |
| REQ-03 | Every record editable, **with its history kept** | Partial. Financial records: yes (void/replace with reasons, `rno`/`rv`). Person profile fields: audit line only (DEF-06). |
| REQ-04 | Every document has view, edit, register and print | Receipts ✓; vouchers ✓; fund events ✓ (0.40.0). Deposits: view and void only. Opening documents: view and print. **Partial.** |
| REQ-05 | Every summary tile and figure is tappable down to the underlying record (editable there) | Implemented broadly (`figGo`, `drill`, `tdr`, `capLed`); verified by audit. Statistics/percentage cells land on list pages, not records. |
| REQ-06 | Lists offer filters and reopen with the last filter | Members, tarz, statistics, journal, balance sheet, capital ledger (fund selections persisted or kept in `ui`). Partial for some lists (in-memory only). |
| REQ-07 | One-tap actions have undo for a few seconds; for registered documents, undo returns to the form | Generic undo after any save within 5 s of a tap; bulk entry returns to the filled form. Other forms restore state but do not reopen the form. **Partial.** |
| REQ-08 | Phone back button goes back exactly one step | Implemented (dialogs, sheets, tabs, report↔tab drill) |
| REQ-09 | Optional features are on/off toggles | 7 modules (`MODS`) |
| REQ-10 | Prefer journal-style (دفتر روزنامه) entry forms: date on top, account rows, debit/credit, totals, no extra questions | Manual voucher (`jvForm`) follows this. Fund-event form shows a live journal preview but keeps type, title and investor fields. Member entry is tabular (bulk). **Partial by design.** |
| REQ-11 | Tables: text right-aligned, numbers keep their alignment, wrap to two lines instead of horizontal scroll | `tbAlign` (L529); audit found no horizontal scroll |
| REQ-12 | Meaningful colours and icons; coherent, non-duplicated UI; progressive disclosure | Ongoing; naming unified in 0.40.0 |
| REQ-13 | **Never** put card numbers, account numbers, keys or tokens in code, chat or memory; the Gemini key stays on the phone | Code has none; the public build strips data; keys live only in device storage |
| REQ-14 | Public build must never contain member data | `build.py` assertion (PRV-01) |
| REQ-15 | Multi-fund views show per-fund and total figures | Members, tarz, balance sheet, statistics, journal, inter-fund report, capital ledger |
| REQ-16 | Capital-injection ledger (معین تزریق سرمایه) overall and per investor, visible in members and tarz | Implemented 0.38.1–0.40.1 |
| REQ-17 | Cash shortfalls: warn; then find the cause, move to «اختلاف حساب», or book as investor capital | Implemented 0.38.0 |
| REQ-18 | Manager guide always in the app and up to date | Implemented (`GUIDE`, print); kept current by process (manual) |
| REQ-19 | Configurable, attractive splash animation of «قرض» and «حسن» | Implemented 0.37.0 |
| REQ-20 | Periodic independent deep review; fixes only after owner approval | Done 2026-10-21; all 17 items approved and fixed |

## 2. Requirements inferred from the implementation (not explicitly stated)

- Blank ≠ zero for savings entries.
- Months must be posted in order (gap rule).
- Installment overflow becomes member credit, not savings.
- Opening balances are fixed after any month is closed.
- A loan cannot be transferred between funds.
- Real loan receiver is informational; the debt stays with the member.
- Message log is capped at 5,000 entries.
- Dormancy: 3 months by default.

## 3. Conflicts between requirements and implementation

| ID | Conflict | Reference |
|---|---|---|
| CF-01 | REQ-03 "history for every record" vs profile edits without old values | DEF-06 |
| CF-02 | REQ-04 "edit and print every document" vs deposits (void only) and opening documents (no edit-in-place; changed by new documents) | doc 01 F-TX-05, F-FA-10 |
| CF-03 | REQ-10 journal-style vs the fund-event form's type and title fields | doc 01 F-FA-01 |
| CF-04 | REQ-07 undo-to-form only for bulk entry | doc 01 F-SH-04 |

## 4. Missing business decisions and financial-policy questions (prioritised)

| # | Question | Affects | Current behaviour |
|---|---|---|---|
| Q1 | **Opening cash.** Should real opening cash be mandatory per fund, instead of assuming «Σ opening savings − Σ opening loans»? | Correctness of every cash and shortfall figure | Assumed until recorded; one fund currently shows a large assumed shortfall |
| Q2 | **Negative loan balances from Excel** (over-payments in the source data): convert to member credit, savings, or leave as negative loan? | Balance sheet loans, credit | Left negative; flagged in review; user fixes case by case |
| Q3 | Should member credit (طلب) be applied automatically to the next installment, or refunded only on request? | Loans, credit, cash | Manual (`refc` or correction) |
| Q4 | Year-end: should income/expense (`res`) be closed into equity each year, and should balances carry forward as new opening documents? | Balance sheet presentation across years | Cumulative `res`; no closing entries; locks only |
| Q5 | Definition of «به‌موقع» (on time): by date within the month, or presence in the month? | Statistics, credit score | Presence in the month |
| Q6 | Multiple concurrent loans per member: allowed per fund (`multiLoan`) — policy per fund? | Loans | Double confirmation |
| Q7 | Who else may operate the app (deputies)? Is role separation or a read-only mode needed? | Security | Single admin |
| Q8 | Encrypt business data at rest when the lock is on? | Privacy vs convenience | Not encrypted |
| Q9 | Retention: message log cap (5,000), local snapshots (3), cloud backup history (unbounded git) | Storage, privacy | As stated |
| Q10 | Fund deletion: allowed with data? Archive only? | Data integrity | Delete exists; cascade unverified |
| Q11 | Should deposits (announced bank SMS) be editable rather than void-and-recreate? | REQ-04 | Void only |
| Q12 | Calendar validation: enforce real month lengths (31/30/29)? | Data quality | Day ≤ 31 for all months |

## 5. Features that appear intended but are not verified

- GitHub cloud backup (network);
- Gemini assistant end-to-end;
- WebAuthn on real devices;
- SMS and WhatsApp sending;
- Excel and PDF export offline after the first online use;
- contacts import;
- fund deletion cascade;
- corrupt-state recovery;
- iOS behaviour.

## 6. Decisions needed before safe changes

1. Q1 and Q2: they change reported cash and loans.
2. Q4: year-end carry-forward is needed before the first real year close of 1405, which is due after Esfand 1405.
3. Q8: if the threat model changes (shared device), encryption at rest becomes a prerequisite.
