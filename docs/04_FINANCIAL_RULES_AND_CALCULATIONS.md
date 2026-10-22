# 04 — Financial Rules and Calculations (critical)

**Verification tags**
- **[EXEC]**: the example below was executed on 2026-10-22 against the public build `index.html@afff760`, with synthetic data injected through `page.evaluate`. The script is `syn.js` in the handover workspace and is reproducible. Results are quoted verbatim.
- **[TEST]**: covered by an existing unit test (`tests/*.js`).
- **[STATIC]**: derived from reading the code only.

**Units.** All amounts are million toman (میلیون تومان). «۱» means 1,000,000 toman.

## Synthetic scenario used in [EXEC] examples

Fund `F1`. Member A: opening savings `os=10`, opening loan `ol=0`. Member B: `os=5`, `ol=8`.

- **Month 0 (Farvardin 1405).**
  - A pays savings 1.
  - B pays installment 2.
  - A receives a new loan of 5, term 10.
- **Month 1 (Ordibehesht).**
  - B pays installment 6, then the overflow 1 is recorded as credit.
  - A correction moves 1 of B's installment to savings.
  - Fund events:
    - income 1.5;
    - gift/expense 0.7;
    - capital injection 10 (refundable) from an external investor;
    - repayment 4 of that injection.
- **Then:**
  - real opening cash of 3 is recorded;
  - A transfers 2 of savings to C in fund F2.

---

## R-PER — Periods and dates

| ID | Rule | Implementation | Example | Tag |
|---|---|---|---|---|
| R-PER-01 | A month index `i` counts months from Farvardin 1405 | `YR0=1405`; `pk(f,i)=f+'-'+(1405+floor(i/12))+'-'+MM`; `pix(key)=(year−1405)*12+(MM−1)` (L62, memoized) | `pk('F1',0)='F1-1405-01'`; `pk('F1',14)='F1-1406-03'`; `pix('F1-1406-03')=14` | EXEC |
| R-PER-02 | Current month comes from the device clock in the Persian calendar | `curIdx` L592: `Intl.DateTimeFormat('fa-IR-u-nu-latn-ca-persian')`, cached 60 s | — | STATIC |
| R-PER-03 | Optional transaction date `YYYY/MM/DD` with year 13xx or 14xx, month 1–12, day 1–31 | `vdate` L818. There is **no month-length check**, so `1405/12/31` is accepted. | `'1405/3/5'→'1405/03/05'`; `'1405/13/01'→null`; `'1405/12/31'` accepted | EXEC |
| R-PER-04 | A date outside the chosen month only warns (W-DATE); a future date warns (W-DATE-FUT) | `susp` L629 | — | STATIC |
| R-PER-05 | Gap rule: a month cannot be posted while earlier months of the fund (from `fund.sm`) have no activity, unless they are marked «بدون فعالیت» or are locked | `gapStart`/`gapErr` L624–625 | Posting month 3 when month 2 is empty → `E-PERIOD-GAP` | STATIC |

## R-RND — Precision, rounding and display

| ID | Rule | Implementation | Example | Tag |
|---|---|---|---|---|
| R-RND-01 | Stored and computed amounts are rounded to 7 decimals, i.e. 1 toman | `R=x=>Math.round(x*1e7)/1e7` | `R(0.1+0.2)=0.3` | EXEC |
| R-RND-02 | Input accepts up to 7 decimals | `/^\d+(\.\d{1,7})?$/` after `an()` | `0.0000001` OK; `0.00000001` rejected | STATIC |
| R-RND-03 | Detail display shows exact values, up to 7 decimals, with Persian digits | `F` | `F(0.1234567)='۰٫۱۲۳۴۵۶۷'` | EXEC |
| R-RND-04 | Summary display shows 1 decimal, rounded half away from zero symmetrically, and never «−۰» | `Fs` | `Fs(1.25)='۱٫۳'`; `Fs(-1.25)='−۱٫۳'`; `Fs(-0.04)='۰'` | EXEC |
| R-RND-05 | Rial equivalence is written once, as «… تومان معادل … ریال» | `Rl(n)`: rial = round(\|n\|·1e7), toman = rial/10 | `Rl(2.5)='۲٬۵۰۰٬۰۰۰ تومان معادل ۲۵٬۰۰۰٬۰۰۰ ریال'` | EXEC |

Note: `Rl` uses `Math.abs`, so negative amounts lose their sign. Callers currently pass only non-negative amounts (STATIC).

## R-BAL — Member (membership) balances

**R-BAL-01 — the core ledger `bal(mid, upto)`** (L86). It iterates over the member's transactions with `pix(per) ≤ upto` (via the `bix` index). Starting values: `s=os`, `l=ol`, `c=j=d=0`.

| tx type | Effect |
|---|---|
| `sav` | s += a |
| `ref` | s −= a |
| `inst` | l −= a |
| `loan` | l += a |
| `lrev` | l −= a |
| `credit` | c += a |
| `refc` | c −= a |
| `inj`, `rp===0` (donation) | d += a |
| `inj`, otherwise (refundable) | j += a |
| `injret` | j −= a |
| `rcl` (from → to) | apply(from, −a); apply(to, +a), where apply(`sav`)→s, apply(`inst`)→**l −=**, apply(`credit`)→c |
| `xout` / `xin` (bucket `bk`) | apply(bk, ∓a). Bucket `loan` means apply(`loan`): l ±= a |

Example [EXEC] after month 0:
- A: `{s:11, l:5}`, which is 10+1 and 0+5.
- B: `{s:5, l:6}`, which is 8−2.

Edge cases:
- `l` can be **negative** if imported data has over-payments. New entries prevent this (R-LN-02). Reports show it as an «اضافه‌پرداخت قسط» reconciliation row (`rep` L977), and the review queue flags it (`مانده وام منفی`).
- `rcl` with `from:'inst'` **increases** the loan, because it reverses installment.
  - Example [EXEC]: B in month 1 after the correction inst→sav 1 has `{s:6, l:1, c:1}`.

**R-BAL-02 — future-safe limits.**
- `minBal(mid,i,k)` = min over months i..max(lastAll, i) of `bal(...)[k]` (L1212).
- It is used for refunds (`E-REFUND`), correction caps, voiding a correction (`rclVoidGo`), and rollback checks on bulk edits (`E-EDIT`).
- Tag: TEST (v31test «rollback on later negative»).

## R-LN — Loans and installments

| ID | Rule | Implementation | Example | Tag |
|---|---|---|---|---|
| R-LN-01 | A new loan increases `l`. A metadata record goes to `S.loans` with `kind:'جدید'` and `term` (default 10, allowed 1–60). | `sub` L126, `bsave` L381 | A: loan 5 → l=5 | EXEC |
| R-LN-02 | Installment room = max(0, min(outstanding at end of the previous month, minimum future outstanding)). An installment above the room is **split**: room goes to `inst`, the excess goes to `credit` with note «مازاد قسط». | `loanRoom` L1213; `sub` L126 (`if(a>room)add('credit',…)`); same in `bsave` | B owes 6 in month 1 and pays 7 → inst 6 + credit 1 → `{l:0, c:1}` | EXEC (manual equivalent), TEST (v31test) |
| R-LN-03 | Suggested installment = min(outstanding, g). g is: last new loan amount ÷ its term; else the agreed Excel installment `m.qs`; else the last installment amount; else blank. | `sugg` L648 | A month 1: 5/10 = **0.5** | EXEC |
| R-LN-04 | Remaining installments = ceil(outstanding / g); end month = last month of the fund + remaining | `loanEst` L640 | outstanding 4.5, g 0.5 → 9 installments | STATIC |
| R-LN-05 | A new loan while a balance is outstanding needs double confirmation | `bsave` (`dbl`), `fi` warning | — | STATIC |
| R-LN-06 | A wrong loan is voided by an `lrev` transaction plus `loans[].void=true` | `lvoid`/`lvoidGo` L1026 | — | STATIC |
| R-LN-07 | An installment for a member with no loan is impossible: the single form disables «ثبت», and bulk entry raises an error | `fi` L119, `fmo` L996, `bsave` | — | EXEC (VA T1) |
| R-LN-08 | «Arrears» are not computed as amounts. «بدهکار این ماه» (`bdue`) means an active member with outstanding at the previous month-end and no `inst` in this month (or no `sav`). | `bdue`, `rdue`, `msgGo` | — | STATIC |
| R-LN-09 | Credit score (خوش‌حسابی) = paid months ÷ due months. Due = months with positive outstanding at the previous month-end in which the fund has any entries. Labels: ≥0.95 عالی, ≥0.8 خوب, ≥0.6 متوسط, else ضعیف. | `credit` L959 | 9/10 → خوب | STATIC |
| R-LN-10 | Statistics «درصد پرداخت به‌موقع» = round(100·paid/due) on the same month-presence basis. It does **not** measure timeliness within the month. | `stData` L1356 | — | STATIC (VA A8) |

## R-SV — Savings, credits, refunds

| ID | Rule | Implementation | Tag |
|---|---|---|---|
| R-SV-01 | A blank field means not recorded; 0 means an explicit zero. Savings may be 0; other types may not. | `sub`: `a==0&&type!='sav'` → error | STATIC |
| R-SV-02 | Refund of savings (`ref`) and of credit (`refc`) must be ≤ the minimum future balance of that bucket | `sub`, `fi` | TEST (VA: "refund larger than savings rejected") |
| R-SV-03 | Member credit (طلب عضو) comes only from installment overflow or an explicit `credit` entry. It is not added to savings automatically. | R-LN-02 | EXEC |
| R-SV-04 | Correction (`rcl`) moves an amount between sav, inst and credit. The amount must be ≤ the available amount in the source bucket (`avail`), and `to:'inst'` must be ≤ the outstanding loan. | `corrGo` L560 | TEST |
| R-SV-05 | Voiding a correction is blocked if s or c would become negative in any later month | `rclVoidGo` L1073 | EXEC |

## R-XF — Transfers and succession

| ID | Rule | Implementation | Example | Tag |
|---|---|---|---|---|
| R-XF-01 | Balance transfer creates a pair `xout` (source) and `xin` (target) with a shared `xid`, bucket `bk` ∈ {sav, credit, loan} | `xferDo` L793 | A→C savings 2: A.s 11→9, C.s 0→2 | EXEC |
| R-XF-02 | Across funds, the journal books the counterpart to `ic` (حساب بین صندوق‌ها), **not cash**. Cash moves only when the funds settle by a voucher. | `jdocs` L1161 (`same?acc:'ic'`) | F1 icL 2 (payable), F2 icA 2 | EXEC |
| R-XF-03 | Whole-account transfer moves all savings and credit; a loan cannot move | `xwhole` L772 | — | TEST (xwtest) |
| R-XF-04 | Succession creates a new person and membership linked by `succOf`. No money moves unless explicitly ticked. | `succ` L801 | — | TEST (formtest) |

## R-CASH — Fund cash («نقدینگی محاسباتی»)

**R-CASH-01.**
```
cashOf(f,i) = s + c + j + d − l + co − icOf(f,i)                       (L654)
```
where `fsum(f,i)` (L89) sums `bal` over the fund's members for s, l, c, j and d. Then:
```
j  += CP − CR      (ops capital, refundable: injections − repayments)
d  += CD           (ops capital, donation)
co  = −B + P + I − G + JC + (OCx ? OC − osol(f) : 0)
```
- B: buy and dep; P: sell and wd proceeds; I: income; G: gift.
- JC: cash and ic lines of vouchers excluding opening cash.
- OC: the recorded opening cash (only if one exists, OCx).
- `osol(f) = Σos − Σol` over the fund's members (L1221).
- `icOf(f,i)` (L653) = Σ(xin − xout) across funds + Σ(debit − credit) of `ic` lines in vouchers.

**Meaning.**
- Until a real opening cash is recorded, the app **assumes** opening cash = Σ opening savings − Σ opening loans.
- The opening journal (`jopen` L1175) books that gap to `cash`. With a recorded opening cash, the gap goes to equity `open` instead.

Example [EXEC]:

| Point | Calculation | cashOf | Balance sheet cash |
|---|---|---|---|
| After month 0 | osol = 15−8 = 7; cash = 7 + 1 (sav) + 2 (inst) − 5 (loan) | **5** | 5 |
| After month 1 | 17 + 1 + 6 + 0 − 6 + 0.8 | **18.8** | 18.8 |
| After recording real opening cash 3 | | **14.8**, i.e. 18.8 − 7 + 3 | 14.8 |
| After the inter-fund transfer of 2 | F1 cash stays 14.8; `icOf(F1) = −2` | 14.8 | 14.8 |

**R-CASH-02.** Shortfall: cash < −0.004 shows an alert.
- Options: find cause, record opening cash, capital injection, or suspense.
- `cashFix` L170. It is also a warning during entry (W-CASH: loan, refund or repayment larger than cash).
- Tag: EXEC.

**R-CASH-03.** Suspense «اختلاف حساب».
- `susAdd` L177 finds the first month `m0` with negative cash and books a voucher `jk:'sus'` there:
  - amount = −min(cash over m0..last);
  - Dr cash / Cr `sus`.
- `susBal` gives the outstanding balance. Voiding the voucher restores the shortfall.
- In the balance sheet, `sus` is a **liability**.
- Tag: EXEC (0.38.0 test: cash series became `[0, 15.3, 36.8]` from `[−107.2, …]`; balance sheet balanced).

## R-JRN — Derived double-entry journal

**R-JRN-01. Documents** (`jdocs` L1161). Accounts are listed in `ACC` (L1160): `cash, loan, sav, cr, cap, don, ast, inc, gf, ic, sus, open`.

| Source | Debit | Credit |
|---|---|---|
| sav | cash | sav |
| inst | cash | loan |
| loan | loan | cash |
| lrev | cash | loan |
| credit | cash | cr |
| ref | sav | cash |
| refc | cr | cash |
| rcl | BA[from] | BA[to] (`BA={sav:'sav', inst:'loan', credit:'cr'}`) |
| inj | cash | cap (refundable) or don (donation) |
| injret | cap | cash |
| xout (bk) | sav, cr or loan | same account (same fund) or ic |
| xin from another fund | ic | sav, cr or loan |
| ops buy, dep | ast | cash |
| ops wd | cash | ast |
| ops inc | cash | inc |
| ops gift | gf | cash |
| ops cap | cash | cap or don |
| ops capret | cap | cash |
| ops ctr | cash (ca2) | cash (ca) |
| ops sell | cash a | ast cost, plus inc gain; a loss is Dr gf |
| ops jv | lines as entered | lines as entered |

**R-JRN-02. Opening document** (`jopen` L1175):
- Dr loan Σol / Cr sav Σos.
- The difference `ol−os` goes to `cash` when no opening cash is recorded, otherwise to `open`.

**R-JRN-03. Trial balance** `jtb(fids,i)` (L1176) accumulates `jopen` and all documents ≤ i. The difference between debits and credits must be 0. Tag: TEST (jvtest «trial balance still balanced»).

**R-JRN-04. Per-account cash** `caBal` (L1273) splits cash lines by account (`ca`, else the fund default `ca0`). It includes `jopen`, so the total equals journal cash. Tag: TEST (catest).

## R-BS — Balance sheet

**R-BS-01** (`ybs` L1302).
```
assets      as = cash + loan + ast + icA
liabilities li = sav + cr + cap + icL + sus
equity      eq = don + open + res,   where res = −(inc + gf)
check: |as − li − eq| < 0.01   («✓ برابر»)
```
Example [EXEC], month 1 before opening cash: as 24.8 = 18.8 + 6; li 24 = 17 + 1 + 6; eq 0.8 = res (1.5 − 0.7). After real opening cash 3: open = −4, which is shown as «مازاد / کسری افتتاحیه».

**R-BS-02.** In the multi-fund total column, `icA` and `icL` are netted:
```
n  = Σ icA − Σ icL
icA = max(n, 0);  icL = max(−n, 0);  as and li recomputed
```
Location: `ydata` L1304. Tag: EXEC (VA A3).

**R-BS-03.** Annual flows («گردش وجوه سال») come from `rcpts(i0,i1,[f])` (L1091): receipts sav, inst, credit, inj, inc; payments loan (net of lrev), ref, injret, gift. The net equals the change in cash. Tag: STATIC + TEST (yrtest «bs balance»).

## R-CAP — Capital injection (تزریق سرمایه)

| ID | Rule | Implementation | Example | Tag |
|---|---|---|---|---|
| R-CAP-01 | Investor key: `p:<personId>` for a member injection (`tx inj`) or an op with `spid`; otherwise `e:<name>` | `capRows` L841 | — | EXEC |
| R-CAP-02 | Refundable balance = Σ refundable injections − Σ repayments; donations are listed separately | `capSum` L847, `capBal` | inject 10, repay 4 → **6** | EXEC |
| R-CAP-03 | A repayment cannot exceed the investor's minimum future balance | `opSave0` (`minCap`) | — | STATIC |
| R-CAP-04 | Member-level investor amount = member's `bal().j` + ops whose `spid` is the member's person in the same fund | `capOf` L845 | — | EXEC |

## R-CL — Locks and closing

| ID | Rule | Implementation | Tag |
|---|---|---|---|
| R-CL-01 | A month is locked if **any** month of that fund at or after it has a closed record with `locked:true`. Closing a later month therefore locks all earlier months. | `locked` L83 | STATIC |
| R-CL-02 | Year closing locks month 11 of the year: `closeAt(f, 12y+11, 'year')` plus a snapshot `{o, rows:[mid,s,l,c], tx}` | `yClose` L157 | TEST (v31test) |
| R-CL-03 | Reopening needs a reason; the old snapshots are kept and `reopens[]` is appended | `yReopen` L160, `reo` | TEST |
| R-CL-04 | Changing opening balances is blocked if the fund has any locked month | `applyOpening` L829 | TEST (jvtest analogue) |

## R-RC — Receipts

**R-RC-01.** The before/after balances belong to **this transaction only**:
- before = all of the member's tx in earlier months, plus same-month tx earlier in `S.tx` order;
- after = before + this tx.
- `balTx` L1054. Example [EXEC, 0.40.1]: savings 2.5 on a balance of 10.3 → «۱۰٫۳ ← ۱۲٫۸».
- Edited records are re-inserted at the original position (0.40.1) so the order stays meaningful.

**R-RC-02.** Receipt number = `rno || id`. It is stable across bulk-entry edits: `rno`, `prev`, `rv`. Opening an old id resolves to the current version through `txv`. Location: `rcptFind` L1055. Tag: EXEC (VA A6).

## R-OTHER

| ID | Rule | Implementation | Tag |
|---|---|---|---|
| R-DEP-01 | Announced deposits are allocated FIFO by (date, at) to new sav, inst and credit entries of the same member; remaining = amt − Σal | `depAlloc` L906, `depRem` | TEST (deptest) |
| R-DOR-01 | Dormant = active member with no transaction in the last N months (default 3) of the fund's data, no open loan, and enough history | `actFlags` L1674 | TEST (dmtest) |
| R-ST-01 | Average savings per active member = round(10·s/act)/10 | `stData` L1356 | EXEC |
| R-GIFT-01 | A gift distributed among members (`rc`) must have shares that sum to the total; it is shown under each member's «هدیه‌های دریافتی» | `opSave0`, `giftBlock` L1042 | TEST (gtest) |
| R-SH-01 | A shared fund event is split across funds; the shares must sum to the total; all shares share one `gid`; voiding or editing one affects all | `opSave0`, `opVoidGo` L706 | TEST (shtest) |

## Inconsistencies and ambiguities (for the owner to decide; see doc 08)

1. **Assumed opening cash.** «پس‌انداز اولیه − وام اولیه» is a modelling assumption. It is now used consistently, but it can hide a real opening shortfall until real opening cash is recorded.
2. **Negative loan balances from imported data** remain loans with a negative sign. New entries use credit instead.
3. **On-time payment** is month-presence based, not date based.
4. **No interest, fees or penalties.** This is consistent with Qard al-Hasana. The «درآمد» account exists only for bank profit and the like.
5. **`Rl` ignores the sign** of the amount.
6. **`vdate`** accepts day 31 in every month.
