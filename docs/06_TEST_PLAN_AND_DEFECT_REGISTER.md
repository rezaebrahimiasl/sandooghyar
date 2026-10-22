# 06 — Test Plan and Defect Register

## 1. What was actually executed (2026-10-22, v0.40.1)

| Suite | How | Result |
|---|---|---|
| Unit tests (21 files in private `tests/`) | `python3 mktest.py`, then `node tests/<f>.js`. They eval the extracted script with DOM stubs. **They run against the dev source, which includes real data constants.** | **310 assertions, 0 failures** (acctest 7, catest 27, deptest 15, dmtest 17, formtest 23, gtest 13, guidetest 18, jv2test 15, jvtest 25, moin 9, sanity 10, shtest 10, smart 12, sttest 12, swtest 5, synctest 12, v31test 30, v32test 13, xwtest 20, yrtest 12, zt 5) |
| Browser smoke on the **public** build | `browser/run.sh browser/smoke.js` (Playwright Chromium, 390×844) | Pages ✓; member flow ✓; tick-all ✓; picker ✓; lock screen ✓; encrypted backup ✓; SW caches `sandooghyar-v0.40.1/shell/share` ✓; offline reload ✓; **no page errors**. CDN libraries (xlsx, jspdf, html2canvas) were *not* cached because the sandbox has no CDN network access, so they are **untested here**. |
| Synthetic financial scenario (`syn.js`) on the public build | Playwright `page.evaluate`, synthetic data | All numbers quoted in doc 04 [EXEC]; `health()` errors = none |
| Independent audit (separate reviewer agent) on 0.37.1 → findings; re-verification on 0.40.0 | Playwright crawl, 1,373 handlers, both themes, scenario tests | 0.40.0: 18 fixed, 5 partial, 2 new minor. Partials and new items were addressed in 0.40.1 and spot-verified (receipt after edit, surplus drill, totals tappable, back to stats, badge contrast). |
| Feature-specific Playwright scripts during 0.36–0.40.1 | Ad-hoc scripts (not in the repo) | Listed as **VE** in doc 01 |

**Not executed:**
- real Android device;
- iOS;
- low-storage conditions;
- GitHub backup over the network;
- Gemini calls;
- WebAuthn on a real authenticator;
- SMS and WhatsApp intents;
- CDN-dependent Excel and PDF output;
- multi-tab concurrency;
- datasets larger than about 5.4k transactions.

## 2. Test plan

`Cov` gives existing coverage: U = unit test, B = browser script, A = audit, — = none.

### 2.1 Financial invariants (run after every change)

| ID | Invariant | How to check | Cov |
|---|---|---|---|
| INV-01 | Trial balance: Σdebit = Σcredit for every fund and month | `jtb(fids,i)` | U (jvtest) |
| INV-02 | Balance sheet: as = li + eq for every fund and the consolidated total | `ybs`, `ydata().TB` | U (yrtest), A |
| INV-03 | `cashOf(f,i) == ybs(f,i).cash` for all f and i, including after inter-fund transfers and opening cash | loop | B, A |
| INV-04 | Σ over members of `bal().s` == journal `sav` balance; same for `l` → `loan` and `c` → `cr` | health `H-JRNL-*` | U |
| INV-05 | `Σ caBal(f,i)` over accounts == journal cash | `caBal` | U (catest) |
| INV-06 | Consolidated `ic` nets to 0 when every party to a transfer is selected | `ydata` | U (xwtest), A |
| INV-07 | No member bucket negative after any edit (`minBal`) | random edits | U (v31test) |
| INV-08 | Receipt: before + this amount = after, for the edited and unedited tx | `balTx` | B, A |
| INV-09 | Capital ledger: Σ investor balances == balance-sheet `cap` | `capSum` vs `ybs` | B (partial) |

### 2.2 Functional, boundary and invalid inputs

| ID | Case | Expected | Cov |
|---|---|---|---|
| TC-F-01 | Amount `۰٫۵`, `0/5`, `.5`, `۰,۵` | Accepted as 0.5 | U (sanity) |
| TC-F-02 | 8 decimals; negative; text | E-AMOUNT | — |
| TC-F-03 | Amount ≥ 1000 | W-UNIT warning | U |
| TC-F-04 | Date `1405/13/01` | E-DATE | B (EXEC) |
| TC-F-05 | Date `1405/12/31` (invalid day) | Should be rejected; **currently accepted** (DEF-02) | B |
| TC-F-06 | Installment > outstanding | Split into inst + credit «مازاد قسط» | U, B |
| TC-F-07 | Installment for a member with no loan | Blocked; member not switched | A |
| TC-F-08 | Refund > minimum future savings | E-REFUND | A |
| TC-F-09 | New loan with existing outstanding | Double confirmation | — |
| TC-F-10 | Term 0 or 61 | Error | — |
| TC-F-11 | Posting a month after an empty month | E-PERIOD-GAP; «بدون فعالیت» path | — |
| TC-F-12 | Posting into a locked month, or a month before a locked one | E-LOCKED | U (jvtest) |
| TC-F-13 | Shared fund event with shares ≠ total | E-SHARE-SUM | U (shtest) |
| TC-F-14 | Capital repayment > balance | E-CAP | — |
| TC-F-15 | Voiding a voucher used by later operations | E-DEPEND | — |

### 2.3 Duplicates and repeats

| ID | Case | Expected | Cov |
|---|---|---|---|
| TC-D-01 | Same member, type, amount and month twice | W-DUP, or "already recorded" warning in the form | U (sanity) |
| TC-D-02 | Double-tap «ثبت» | Single record. **Untested.** | — |
| TC-D-03 | Same deposit tracking number twice | Warning | U (deptest) |
| TC-D-04 | Duplicate account name | E-CA-DUP | U |

### 2.4 Edit, void, undo, reverse

| ID | Case | Expected | Cov |
|---|---|---|---|
| TC-E-01 | Bulk edit 2.5→3 | Old to `txv` with reason; new keeps `rno`; position preserved; receipt correct | U, B, A |
| TC-E-02 | Edit making a later month negative | E-EDIT with full rollback | U |
| TC-E-03 | Undo within 6 s after bulk entry | State restored; form reopened with the same values | B, A |
| TC-E-04 | Fund-event edit | Old void «اصلاح با سند …»; `rno` kept; cash consistent | A |
| TC-E-05 | Void correction (`rcl`) | Reverts; blocked if a later balance would go negative | B |
| TC-E-06 | Loan void (`lrev`) | Loan 0; `loans.void` set | — |
| TC-E-07 | Voucher reverse and fix | New voucher; old voided | U (jv2test) |

### 2.5 Closing and reopening

| ID | Case | Expected | Cov |
|---|---|---|---|
| TC-C-01 | Year close | All 12 months locked; snapshot rows saved | U |
| TC-C-02 | Reopen with reason | Unlocked; reopen logged | U |
| TC-C-03 | Change opening balances with a locked month | Blocked | U |
| TC-C-04 | Month lock on month 5 | Months 0–5 locked (R-CL-01) | — |

### 2.6 Persistence and backup

| ID | Case | Expected | Cov |
|---|---|---|---|
| TC-P-01 | Reload after each write type | Identical `S` | B (smoke offline reload) |
| TC-P-02 | Encrypted backup round trip; wrong password | Equal state; failure on the wrong password | U (v32test) |
| TC-P-03 | Excel backup round trip including `txv`, messages and deposits | Equal state | U (v31test, deptest) |
| TC-P-04 | Corrupted JSON in storage | `.corrupt` saved; app usable; user informed (**gap**) | — |
| TC-P-05 | Backup from an older version (missing new fields) | `migrate` fills defaults | partial U |
| TC-P-06 | Storage quota exhaustion | `ui.ns` banner; no silent loss | — |
| TC-P-07 | GitHub backup create, list and restore | Works with a fine-grained token | — |
| TC-P-08 | Anonymized export | No names, phones, national IDs or accounts; balances equal | B |

### 2.7 Mobile, offline, update

| ID | Case | Expected | Cov |
|---|---|---|---|
| TC-M-01 | 360 px width: no horizontal scroll; tables wrap | — | A (partial) |
| TC-M-02 | Dark theme contrast ≥ 4.5:1 on buttons and badges | — | A |
| TC-M-03 | Back button: dialog → sheet → tab history → exit confirmation | — | B, A |
| TC-M-04 | Offline cold start after first install | — | B |
| TC-M-05 | Update banner when `version.json` increases | — | — |

### 2.8 Large data, security, privacy

| ID | Case | Expected | Cov |
|---|---|---|---|
| TC-L-01 | 5k / 20k / 50k transactions: health, statistics, journal, bulk entry timings | Health < 0.5 s at 5.4k (A) | A (5.4k) |
| TC-S-01 | Names containing `' " \ < >` in every screen and handler | No breakage | — |
| TC-S-02 | Lock: wrong PIN ×5 → delay; reload | Delay persists (**currently resets**, DEF-04) | U (partial) |
| TC-S-03 | AI request payload contains no member names when anonymization is on | — | — |

## 3. Defect register

### 3.1 Open (confirmed or strongly evidenced)

| ID | Sev | Area | Evidence | Repro | Expected | Actual | Status |
|---|---|---|---|---|---|---|---|
| DEF-01 | Low | Performance: journal page | Audit on 0.40.0 at 4× CPU, 5.4k tx: about 1.2 s. Mitigated in 0.40.1 by showing the first 40 docs per fund. | Load 5.4k tx in one month and open the journal | < 0.5 s | ~1.2 s (before mitigation) | Open (mitigated) |
| DEF-02 | Low | Date validation | `vdate` L818 | Enter `1405/12/31` (months 7–12 have at most 30 days; Esfand 1405 has 29) | Rejected | Accepted | Open (EXEC) |
| DEF-03 | Low | Formatting | `Rl` uses `Math.abs` | `Rl(-2)` | Sign shown | No sign | Open (static); current callers pass ≥ 0 |
| DEF-04 | Low | Lock | `LKF`/`LKT` are in memory | Wrong PIN ×5, then reload | Delay persists | Resets | Open (static) |
| DEF-05 | Medium | Supply chain | No SRI on CDN scripts | — | `integrity` attributes | None | Open |
| DEF-06 | Medium | Requirement «history for every record» | Person profile edits keep only an audit line, no old values | Edit a phone number | Old value retrievable | Not retrievable | Open (static) |
| DEF-07 | Low | Receipt grouping | After a bulk edit the replacement gets a new `at`, so «اقلام دیگر همین پرداخت» no longer groups it with the installment | Pay savings + installment, then edit the savings | Group kept | Group lost | Open (EXEC 0.40.1) |
| DEF-08 | Low | Statistics wording | «درصد پرداخت به‌موقع» is month-presence based | — | Label matches the calculation | Misleading label | Open (audit A8) |
| DEF-09 | Low | Journal | `ui.jall` (show all docs) is not reset when the month or fund changes | Expand, then change month | 40-doc limit again | Still showing all | Open (static) |
| DEF-10 | Low | Month list 🔒 | `MO()` marks locks for `ui.f` only, even on multi-fund pages | Multi-fund page with a different `ui.f` | Lock icon per relevant fund | Uses the current fund | Open (static) |

### 3.2 Hypotheses (need testing)

| ID | Hypothesis | Why | Suggested test |
|---|---|---|---|
| HYP-01 | The `bix()` cache could serve stale balances if a future code path mutates `tx.mid`/`tx.per` in place, or splices without changing length or ends | Cache key heuristic, L85 | Property test: random mutations followed by comparison against an uncached `bal` |
| HYP-02 | A backslash in an investor name breaks the `capLed('…')` handler | `esc` + `replace(/'/g,…)` doesn't escape `\` | TC-S-01 |
| HYP-03 | A corrupt stored state silently starts an empty app; the user may think data is lost | `load()` L80 | TC-P-04 |
| HYP-04 | Fund deletion leaves orphan members or transactions | `fDel` L549 not traced | Delete a fund with data and run health |
| HYP-05 | Two tabs open at once cause last-write-wins data loss | No locking in `LS` | Open two tabs, edit both, reload |
| HYP-06 | `tdr('inc')` and `tdr('gift')` lists exclude sell gains and voucher income or expense, so the list total may differ from the balance-sheet figure (`res` uses a dedicated list since 0.40.1) | `tdr` L1207 `OP` map | Create a sell with a gain and compare |
| HYP-07 | Restore does not snapshot the current state first | `rst` L295 not fully traced | Restore, then check `s1` |

### 3.3 Fixed in 0.39.0–0.40.1 (from the independent audit) — for regression

The reviewer's IDs and the fixes are listed below. All are verified EXEC/VA unless noted.

| ID | Fix |
|---|---|
| A1 | One cash definition |
| A2 | Opening equity label «مازاد / کسری افتتاحیه» |
| A3 | Consolidated inter-fund netting |
| A5 | Per-transaction receipt balances; position kept after an edit (0.40.1) |
| A6 | Receipt date, rial line and stable number |
| A7 | Symmetric `Fs` |
| A9 | Error text |
| T1 | Member no longer switches in `addTx` |
| T2 | `bal` index and memoized `pix`, `curIdx`, `lastAll`; `fitOv` batch |
| T3 | Back button across tabs |
| T4 | Undo restores the bulk form |
| T5 | Review shows per-member detail and «پیشنهادی» |
| T6 | Deposits chip respects the module toggle |
| T7 | Dark contrast `--on` (buttons, chips, badge) |
| T8 | Duplicate `modBox` removed |
| T9 | 🔒 in month lists |
| U1, U2 | Naming |
| U3 | «سوابق تغییرات» |
| U5 | Fund event view, edit, print and void |
| U6 | Every figure tappable (`figGo`); totals → journal |
| U7 | Member file tiles |
| New-1 | Back to the statistics page after a member-tab drill (`BACKTO`) |
| New-2 | Surplus drill lists income (+) and expense (−) with a matching total |
