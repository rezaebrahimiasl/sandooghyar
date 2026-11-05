# Financial rules and invariants — SandooghYar (0.47.0)

These rules come from the source code (`sandooghyar.html`) and from the owner's approved policies (PRODUCT_POLICIES.md).

- **Earlier detailed narrative:** `docs/04_FINANCIAL_RULES_AND_CALCULATIONS.md`. It describes 0.40.1; the financial core has not changed since 0.42, except the additions marked below.
- **Year-end close:** `docs/12_V044_CHANGES_ENCRYPTION_SRI.md` §2.

## 1. Units and precision
- All amounts are **million toman** numbers. Rounding is `R(x)=round(x·1e7)/1e7`, i.e. 0.1 rial.
- Input accepts up to 7 decimals.
- Amounts ≥ 100 000 are rejected as probably entered in the wrong unit (`hugeAmt`).
- Display:
  - `F` shows the exact amount;
  - `Fs` shows 1 decimal (summaries);
  - `Rl` shows «… تومان معادل … ریال».
- Periods are month indices. `pix(pk(fid,i))=i`, with 0 = Farvardin 1405 (`YR0=1405`).
- Dates are strict Jalali (`vdate`, `jLeap`).

## 2. Entities
- **Person** ≠ **Membership** ≠ **Fund**. A membership is one person in one fund.
- Balances belong to memberships.
- Opening balances are `m.os` (savings) and `m.ol` (loan).

## 3. Member balance `bal(mid,i)` → `{s,l,c,j,d}`

| Field | Meaning |
|---|---|
| `s` | savings |
| `l` | loan outstanding |
| `c` | member credit (fund owes member) |
| `j` | refundable injection |
| `d` | donated injection |

How each transaction type changes the balance:

| tx type | effect |
|---|---|
| `sav` | +s |
| `inst` | −l |
| `loan` | +l |
| `credit` | +c |
| `ref` | −s (savings refund) |
| `refc` | −c |
| `lrev` | −l (reversal of an erroneous loan) |
| `rcl` | reclassify `from`→`to` (correction between accounts) |
| `xout`/`xin` | transfer between memberships (`bk` account, `cp` counterpart, `xid` pair) |
| `inj` | +j, or +d when `rp===0` |
| `injret` | −j |

## 4. Fund level
- `opsSum` aggregates the fund events in `S.ops`:

  | Event | Effect |
  |---|---|
  | `buy`/`dep` | asset out of cash |
  | `sell`/`wd` | proceeds; `cost` = basis |
  | `inc` | income |
  | `gift` | expense or gift |
  | `cap` | capital injection (refundable or donation) |
  | `capret` | injection repayment |
  | `ctr` | transfer between cash accounts |
  | `jv` | manual voucher, lines `[acc, debit, credit]` |

- **Cash:** `cashOf(f,i) = R(Σs + Σc + Σj + Σd − Σl + co − icOf(f,i))`.
  - `co` is the cash effect of fund events.
  - `icOf` is the inter-fund clearing account.
- **Journal:** `jdocs(f,i)` derives a double-entry journal from every record. Accounts are listed in `ACC`:

  | Account | Meaning |
  |---|---|
  | `cash` | cash and bank |
  | `loan` | loans granted |
  | `sav` | member savings |
  | `cr` | member credit |
  | `cap` | refundable injection (liability) |
  | `don` | donations |
  | `ast` | assets and long-term deposits |
  | `inc` | income |
  | `gf` | expenses and gifts |
  | `ic` | inter-fund |
  | `sus` | suspense («اختلاف حساب») |
  | `open` | opening equity |

- **Reports built on the journal:**
  - `jopen` — opening document;
  - `jtb(fids,i)` — trial balance;
  - `ybs(f,i)` — balance sheet: assets = cash + loan + ast + icA; liabilities = sav + cr + cap + icL + sus; equity = don + open + result.

## 5. Loans and installments
- **Loan records.** `S.loans`:
  - `kind`: `افتتاحیه` (opening) or `جدید` (new, has `per`);
  - `term`: default 10;
  - `rcv`: real recipient;
  - `void`: voided.
- **Concurrent loans.** Allowed only if `fund.multiLoan`. bsave asks for confirmation (`dbl`).
- **Installment above the outstanding balance.** The excess becomes `credit`, with a warning (bsave).
- **Suggested installment** `sugg(mid,i)`:
  1. last new loan amount / term;
  2. otherwise `m.qs`;
  3. otherwise the last installment paid.
  4. The result is capped by the outstanding balance.
- **Credit rating** `credit(mid)`: months paid / months due, labelled عالی ≥ .95, خوب ≥ .8, متوسط ≥ .6, otherwise ضعیف.
- **Installment schedule (0.47.0, presentation only)** `lsched(mid)`:
  - **New loan:** installment = amount / term (default 10). Dues run from the month after the loan; the last installment takes the remainder.
  - **Opening loan (`m.ol`):** the agreed monthly installment `m.qs` from Farvardin 1405. Without `m.qs` the schedule is **unknown** and nothing is assumed. `m.qs` can be set with «تعیین قسط ماهانه» (`qsSet`); the change is audited and is not a financial record.
  - **Scheduled outstanding(i)** = disbursed up to i − scheduled dues up to i.
  - **Arrears(i)** = max(0, actual outstanding `bal(mid,i).l` − scheduled outstanding(i)). Installments in arrears = ceil(arrears / next installment).
  - The schedule never changes balances; it is derived on every view.
- **Loan portfolio** `lport`:
  - With a known schedule: current = 0 installments in arrears; late = 1–2; overdue ≥ 3 (`ANOM.overdue`).
  - With an unknown schedule: months since the last installment, labelled "تخمینی" (estimated).

## 6. Corrections, voids, reversals
- No financial record is deleted.
  - `txVoid` moves a member transaction to `S.txv`, adding the reason `vr` and time `vat`.
  - Fund events and deposits get `void` + `vr`.
- A correction is a void plus a replacement with a chain:
  - `rno` — receipt number, stable;
  - `rv` — revision;
  - `prev` — the replaced id;
  - `rto` — replaced-by.
- An edit that would make a later balance negative is refused (`E-EDIT`).
- An erroneous loan is voided with `lvoid` (reason required, creates `lrev`).

## 7. Periods
- `closeAt` snapshots the balances and locks the month.
  - Any write into a locked month is refused (`E-LOCKED`).
  - Reopening requires a reason and is logged.
- The year-end close (`yClose`, `ycs`) is presentation-only.
  - Income and expenses of the year are closed into accumulated surplus.
  - Permanent balances carry forward without new documents.
  - Check `H-YCLOSE-RES`.

## 8. Invariants (checked automatically)
- **Automatic reconciliation (0.47.0)** `reconF(f)` runs for every fund and every month 0…last:
  1. trial balance: Σdebit = Σcredit;
  2. ledger cash = `cashOf`;
  3. ledger savings = Σ member savings;
  4. ledger loans = Σ member loans;
  5. ledger credit = Σ member credit;
  6. balance sheet: assets = liabilities + equity;
  7. Σ cash and bank accounts = ledger cash;
  8. every recorded bank reconciliation still matches.

  Mismatches appear in «تطبیق خودکار حساب‌ها» and as an error in the alert centre.
- **Health checks** `health0` (23 codes). docs/15 §3 lists them, including `H-JRNL-*`, `H-CLOSE-*`, `H-AUDIT-CHAIN`, `H-NEG-*` and `H-XFER-PAIR`.
- **Audit log** `S.audit` is hash-chained: `h = fnv(prev.h|t|a|d)`.

## 9. Safeguards on entry (summary)
- **bsave (member entry):**
  - number format; unit sanity (`hugeAmt`);
  - locked month; gap months (`gapErr`);
  - installment above balance → credit split with a warning;
  - concurrent loan → confirmation;
  - fund cash would turn negative → warning;
  - deposit mismatch warnings;
  - suspicious amounts (`susp`);
  - future month warning;
  - edits must not create negative later balances.
- **opSave0 (fund events):**
  - amount, date, locked month;
  - shares sum (shared events);
  - asset or deposit balance;
  - injection balance (`capret`);
  - cash warning (`W-CASH`); duplicate warning (`W-DUP`).
- **jvSave:** balanced voucher (`E-JV-BAL`), lines and sides, locked month, cash warning.
- **xwGo / xferGo:** locked month, transferable balance, explicit cross-fund warnings.
- **Restore:** `rsAsk` + `rsInteg`. Blocking errors stop the restore; a smaller or older copy needs typed confirmation.

## 10. Analysis (read-only, deterministic) — 0.46 / 0.47
- `cflow` — monthly in/out.
- `fcst` — 6-month projection:
  - savings at the 3-month average;
  - installments from the schedule, or `sugg` for unknown schedules;
  - arrears are not assumed to be paid;
  - the queue is shown as an obligation.
- `anomList` — duplicates, amounts > 3× the member median, overdue loans, negative cash.
- `fhealth` — indicators with thresholds in `FHT`. Dormant members are yellow at most.
- None of these write data.

## 11. Date-range filtering (0.48.0) — reporting rules
- **One shared engine** (`dfRng`, `dfHit`, `dfF`, `dfAsOf`, `dfMonths`, `dfCmpR`, `dfBar`). Pages must reuse it, not build their own date filters.
- **Two filter states**, both remembered (`CFG.uk`):
  - `ui.df` for reports;
  - `ui.dfm` for member pages: statement, schedule table, profile and timeline.

  The filters combine with the shared fund selection (`rgF`).
- **Calendar.**
  - Jalali day numbers (`jdn`/`njd`): 1300/01/01 = 1. Leap years come from `jLeap`, so Esfand 30 exists only in leap years.
  - "Today" is the device's local date (`Intl` Persian calendar). Timestamps are converted to the local day with `atJ`, never with UTC dates.
  - Weeks start on Saturday.
- **Presets.**
  - Day-based: today, yesterday, current week (Sat–Fri).
  - Month-based: current and previous month, last 3 and last 6 months (whole months including the current one).
  - Year-based: current and previous year.
  - Also: all history, and a custom range (start and/or end; swapped if reversed).
- **Comparison** (`dfCmpR`):
  - "previous period" has the same length; month-aligned ranges shift by whole months;
  - "same period last year" clamps Esfand 30 to 29.
- **Effective date of a record:**
  1. its recorded day (`date`);
  2. otherwise its accounting month — a month-only record is in range only when the **whole month** is inside the range;
  3. records in partially covered months are excluded **and counted** (`dfPT` warning);
  4. otherwise (audit, voids, queue, messages) the local day of its timestamp. Voided documents use the void time.
- **Monthly views** (cash flow, reconciliation) use the months that overlap the range; the page says so.
- **Historical balances** use the end month of the range (`dfAsOf`). They are labelled "تاریخی" / «در پایان <ماه>», and shown next to the **current** balance:
  - statement: opening balance before the range and closing balance at the end of the range;
  - loan portfolio: as-of month and current outstanding column;
  - profile;
  - schedule arrears at a past month;
  - injection balances.
- **Overdue at a date** = actual outstanding at that month (payments recorded up to that month) − scheduled outstanding (dues up to that month).
- **Filters never change records.** A test asserts that `S` is unchanged after rendering every filtered page.
- **Always current, never filtered:** the alert centre, fund health, the forecast projection and the anomaly list.
