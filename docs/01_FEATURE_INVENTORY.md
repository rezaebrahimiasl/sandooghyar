# 01 — Feature Inventory (v0.40.1, `index.html` @ `afff760`)

## Status legend

| Code | Meaning |
|---|---|
| **VE** | Verified by execution: a Node unit test (`tests/*.js`, 21 suites, 310 assertions, all PASS on 2026-10-22) or a Playwright browser script run during development of 0.33–0.40.1 |
| **VA** | Re-verified by the independent reviewer on 0.40.0 (Playwright crawl, 1,373 handlers, no JS errors) |
| **S** | Static only: UI and code exist and were read, but no executed check is recorded |
| **P** | Partial: works with a known gap |
| **K** | Known defect (see doc 06) |

**Notation.**
- "Data R/C/U/D" means fields of state `S` read, created, updated or deleted (see doc 03).
- `Lnnn` is a line in `index.html`.
- **Common validation** applied by almost every amount field: `/^\d+(\.\d{1,7})?$/` after `an()` normalises Persian/Arabic digits and decimal separators (`،` `٫` `/` `.`).
- Locked months (`locked(f,i)`, L83) block writes with `E-LOCKED`.
- Gaps of unrecorded months block writes with `E-PERIOD-GAP` (`gapErr` L625).

---

## A. Shell, navigation, settings

| ID | Persian name / English | Workflow and purpose | Location | Data | Status | Notes and tests |
|---|---|---|---|---|---|---|
| F-SH-01 | زبانه‌های پایین / bottom tabs | خانه, اعضا, ＋ ثبت, اختتامیه, بیشتر. `draw()` renders `ui.tab`. | `draw` L103 | `ui.tab` | VE, VA | Icons added in 0.40.0 |
| F-SH-02 | صفحهٔ کشویی / sheet and dialog system | `sheet(h,key)` (L93) opens a stacked panel; `SHS` stack; `lay()` for dialogs; `ask()` for confirms; `note()` for messages | L93–98 | `SK`, `SHS` | VE | Shared by every page |
| F-SH-03 | دکمهٔ بازگشت گوشی / Android back | Closes the top dialog or sheet, then steps back through tabs (`TABH`), then returns from a member-tab drill to the originating report (`BACKTO`). Double back to exit. | `hpop` L1124, `hstart` L1129, `hsync0` L1122 | history API | VE, VA | 0.39.1/0.40.1 |
| F-SH-04 | برگردان / undo bar | After a save within 5 s of a user tap, shows «↶ برگردان» for 6 s and restores the previous JSON. In bulk entry it reopens the form with the same ticks and amounts. | `save` L717, `undoBar` L719, `undoDo` L722 | whole `S` | VE, VA | Only if `S.rev` unchanged |
| F-SH-05 | راهنمای هر صفحه / context help | «؟ راهنما» on each sheet opens the matching guide chapter; long-press on a button shows `HELP` text | `gOpen`, `gKey`, `tips` | — | VE (guidetest) | |
| F-SH-06 | تنظیمات و پشتیبان / settings page | Lock, cloud backup, storage, theme, splash, modules, file backup, snapshots | `bak` L280 | `CFG` | S | |
| F-SH-07 | ماژول‌ها / module toggles | Turns off ai, dep, rmd, lq, fop, stx, xfr. Menus hide; data is kept. | `MODS`, `mOn`, `modT` L1624 | `CFG.off` | VE (T6 VA) | |
| F-SH-08 | ظاهر / theme | Auto, light or dark (`data-theme`) | `setTheme` L1115 | `CFG.theme` | S; contrast VA | |
| F-SH-09 | صفحهٔ آغاز / splash | Canvas animation of «قرض» and «حسن». Font, shape, motion, direction, speed (1–5), trail and duration are configurable; preview button. | `splash` L1134, `spAnim` L1139, `splBox` L1149 | `CFG.spl` | VE (render only) | Web fonts not verified offline |
| F-SH-10 | تازه‌ها / what's new | Swipe cards per version with a «امتحان کن» action | `WHATS_NEW`, `wnShow` L1495, `wnList` L205 | `CFG.wnSeen` | S | |
| F-SH-11 | به‌روزرسانی / auto-update | Polls `version.json` every 30 min; downloads `index.html`; shows a banner | `upd` L584, `chkUpd` L585, `sw.js` | Cache Storage | VE (smoke: sw caches) | Offline reload ✓ |
| F-SH-12 | فیلترهای ماندگار / remembered filters | Saves `f, hall, mg, st, sf, so, mt, mm, ct, zt, ht, jmode` to `CFG.uk` | `ukSave` L530 | `CFG.uk` | VE | |
| F-SH-13 | 🔍 پرسش / unified ask | Header button opens search: text, 🎤 voice, and «بپرس از دستیار» | `gsx` L1109, `gsRun` L1110, `micGo` L1757, `aiAsk` | — | VE (render) | Voice needs Google speech service |

## B. People and members

| ID | Persian / English | Workflow | Location | Data | Status | Notes |
|---|---|---|---|---|---|---|
| F-MB-01 | فهرست اعضا / members list | Fund chips (multi-select `ui.mg`), month select, status chips (`ui.st`), combinable flags `ui.sf` (`MFL`), search, sort | `members` L879, `fill` L886, `stChips` L872, `mg`/`mgt` L876–877 | R: `mems`, `persons`, `tx` | VE, VA | Flags: l = loan, i = investor, d = dormant/low saver, m = multi-fund |
| F-MB-02 | کادر جمع‌ها / members totals | Savings, loan (with count), credit and investor tiles for the filtered list. Per-fund breakdown table. Every tile drills to تراز اعضا or the capital ledger. | `mTot` L881 | derived | VE, VA | |
| F-MB-03 | افزودن عضو / add member | Name, father, national ID, phone; duplicate-name check pushes a review item | `addMem` L510 | C: `persons`, `mems`, `review` | S | |
| F-MB-04 | پرونده عضو / member file | Balances, credit and injection tiles, opening line, loans, credit score, gifts, messages, recent transactions | `detail` L113 | R | VE, VA | U7 fixed |
| F-MB-05 | ✎ اصلاح مشخصات / quick profile edit | `PE(mid)` button next to names in many lists; returns to the origin page | `pedit` L412, `peBack` L411 | U: `persons` | VE | Edit history: the audit line only, no field-level diff |
| F-MB-06 | وضعیت / status change | فعال, غیرفعال, خارج‌شده, متوفی | detail → اطلاعات عضو | U: `mems.status` | S | |
| F-MB-07 | جانشینی / succession | New person and membership referencing the deceased (`succOf`, `rel`, `succDate`). No automatic money transfer. | `succ` L801, `succInfo` L753 | C | VE (formtest) | |
| F-MB-08 | یکی کردن اشخاص / person merge | Merge duplicate persons across funds; memberships stay separate | `pmrg*` L1337/1343, `nq` L1814 | U: `persons`, `mems.pid`, `S.pmIgn` | VE (gtest, xwtest) | |
| F-MB-09 | نواقص اطلاعات / data gaps | Lists: no phone, no title, duplicate persons, loan receiver without phone | `nqData` L1810, `nq` L1814 | R | S | |
| F-MB-10 | راکد و کم‌پس‌انداز / dormant flags | Dormant = active member with no transactions in N months (default 3) and no open loan. Low saver uses a configurable minimum. | `dmCfg` L1673, `actFlags` L1674, `dormDrill` L1681 | `funds.dm`, `funds.ms` | VE (dmtest) | |
| F-MB-11 | سابقه شخص / person history | All memberships of a person across funds | `ptl` L783 | R | VE (jv2test) | |
| F-MB-12 | خروجی اکسل اعضا / members Excel | Exports the filtered list | `memXl` L769 | R | S | |

## C. Monthly entry and member transactions

| ID | Persian / English | Workflow | Location | Data | Status | Notes |
|---|---|---|---|---|---|---|
| F-TX-01 | ثبت اعضا / bulk monthly entry | 1. Choose fund(s) and month. 2. Tick members. 3. Savings, installment (suggested) and new loan (+ term, real receiver) per row. 4. «مرور و ثبت» shows a review with per-member detail (untouched suggested installment marked «پیشنهادی»), warnings, a cash check and the edits list. 5. Apply. Overpaid installment goes to طلب. Edits void and replace with a stable receipt number. | `bulk` L352, `brow` L346, `bdef` L345, `bsave` L381 | C: `tx`, `loans`; U via void: `txv` | VE (v31test), VA | Draft kept in `BV`/`BCK` |
| F-TX-02 | قسط پیشنهادی / suggested installment | See R-LN-03 in doc 04 | `sugg` L648 | derived | VE | |
| F-TX-03 | ثبت تراکنش دیگر / single transaction | Types: sav, inst, loan, credit, ref, refc, inj, injret. Member stays fixed when the type changes (shows ✗ reason). Validation: refund ≤ min future balance; injection repayment ≤ injection balance; term 1–60; date format. | `addTx` L117, `fmo` L996, `fi` L119, `sub` L126 | C: `tx`, `loans` | VE (T1 VA) | |
| F-TX-04 | هشدارها / suspicion warnings | W-UNIT (≥1000), W-DATE, W-FUTURE, W-STATUS, W-INST (>3× due), W-AMOUNT (>3× median), W-CASH, W-DUP, W-INST-SAME | `susp` L629 | — | VE (sanity) | |
| F-TX-05 | واریزی‌های اعلام‌شده / announced deposits | Record bank SMS or receipts first. Bulk entry auto-ticks and pre-fills, then allocates by FIFO (`depAlloc`). SMS paste parser. | `dep` L907, `depAlloc` L906, `smsPaste` L922 | C/U: `deps` | VE (deptest) | Module `dep` |
| F-TX-06 | اصلاحیه / correction (`rcl`) | Moves an amount between sav, inst and credit with a reason. Created from a review item or account operations. | `corr` L558, `corrGo` L560 | C: `tx` type `rcl` | VE (v31test) | |
| F-TX-07 | ابطال اصلاحیه / void correction | Statement row → ✏️ اصلاح → ابطال with reason. Blocked if savings or credit would go negative later. | `rclVoid` L1071, `rclVoidGo` L1073 | `tx` → `txv` | VE | |
| F-TX-08 | انتقال مانده / balance transfer | Savings, credit or loan obligation between memberships: linked `xout`/`xin` pair (`xid`) | `xfer` L794, `xferDo` L793, `xferAvail` L755 | C: `tx` | VE (xwtest) | |
| F-TX-09 | انتقال کل حساب / whole-account transfer | Move all savings and credit to another fund, optionally creating the membership; exit status | `xwhole` L772 | C | VE (xwtest) | Loan cannot move |
| F-TX-10 | بستن حساب / account closing | Refund savings and credit, set status; requires a zero loan | `mclose` L1031, `mcloseGo` L1032 | C: `tx` ref/refc; U: status | S | |
| F-TX-11 | ابطال وام / loan void | Wrong loan voided: `lrev` transaction plus loan flagged `void` | `lvoid` L1026 | C: `tx` lrev; U: `loans.void` | S | |
| F-TX-12 | گیرنده واقعی وام / real receiver | Informational name and phone; reminders can also go to the receiver | `rcvOf`, `rcvPick` L1708 | `tx.rcv`, `loans.rcv` | S | |
| F-TX-13 | بدون فعالیت / skip month | Marks a month without activity so the gap check passes | `S.skips` | `skips` | S | |
| F-TX-14 | تبریک تسویه / payoff prompt | After an installment clears a loan, offers a congratulation message | `payoffAsk` L407 | — | VE (v31test) | |

## D. Fund-level accounting

| ID | Persian / English | Workflow | Location | Data | Status | Notes |
|---|---|---|---|---|---|---|
| F-FA-01 | رویداد مالی صندوق / fund event form | Type, month, shared split across funds, title (gift/inc), asset, investor (cap: member/non-member; refundable or donation), accounts, amount, cost (sell), date, tracking, note. Live journal preview (opDoc/opTbl). Review → save. | `opForm` L655, `ofi` L660, `opSave` L671, `opSave0` L672 | C: `ops` | VE (catest, shtest), VA | Module `fop` |
| F-FA-02 | مشاهده/اصلاح/چاپ/ابطال رویداد / view, edit, print, void | Row tap → `opView`. Edit voids the old record (reason «اصلاح با سند …»), keeps `rno`, `rv++`, `rto`. Void needs a reason and is blocked by dependencies (asset sold, capital repaid). | `opView` L693, `opEdit` L699, `opVoid` L705, `opVoidGo` L706 | U: `ops.void/vr` | VE, VA | |
| F-FA-03 | سند دستی / manual journal voucher | Rows of account, debit, credit; must balance; allowed accounts `JVA` (no member accounts); presets; copy, reverse, fix | `jvForm` L1225, `jvView` L1668, `jvCopy` L1230 | C: `ops` type `jv` | VE (jvtest, jv2test) | |
| F-FA-04 | نقد اولیه / opening cash | Real cash at start: jv `jk:'oc'` Dr cash / Cr open. Replacing it voids the old one. | `ocForm` L1245, `ocBox` L1252 | `ops` | VE (jvtest) | |
| F-FA-05 | حساب‌های نقد و بانک / cash and bank accounts | Define accounts (default, deposit account, shared between funds), balance per account, bank reconciliation (records the bank balance and difference), merge accounts | `caPage` L1275, `caEdit` L1655, `caBal` L1273, `caRec` L1654, `caMerge` L1268, `recCheck` L716 | `funds[].ca` | VE (catest, moin) | Reconciled flag turns stale on later edits |
| F-FA-06 | جابه‌جایی بین صندوق‌ها / inter-fund report | Out, in, net per fund with total row; transfer list | `xfr` L788 | R | VE (jv2test) | |
| F-FA-07 | معین تزریق سرمایه / capital-injection ledger | Investors (member person or external name). Refundable balance and donations; per-investor ledger with running balance. Reached from more, home, balance sheet, fund events, member file, tarz and members. | `capRows` L841, `capSum` L847, `capOf` L845, `capPage` L850, `capLed` L857 | R | VE | 0.38.1–0.40.1 |
| F-FA-08 | کسری نقدینگی / cash-shortfall handling | Alert when cash < 0. Options: find cause (`cashWhy`: monthly cash, first negative month, outflows, duplicate candidates, largest loans), record opening cash, capital injection, or move to suspense «اختلاف حساب» (`susAdd`, jv `jk:'sus'`; reversible by voiding) | `cashFix` L170, `cashWhy` L179, `susAdd` L177, `susBal` L169 | C: `ops` | VE | |
| F-FA-09 | تعریف صندوق / funds | Create, rename (aliases), archive or delete fund; multi-loan flag; dormancy settings; start month `sm` | `fnd` L539, `fNew` L541, `fDel` L549, `fEditGo` L709 | `funds` | S (sttest partial) | |
| F-FA-10 | افتتاحیه / opening balances | Per-member opening savings and loan (`os`/`ol`); edit singly, in bulk or from Excel; reason required; blocked if any month is closed | `opn` L819, `applyOpening` L829 | U: `mems.os/ol`, C: `opens` | S | |

## E. Reports

| ID | Persian / English | Location | Status | Notes |
|---|---|---|---|---|
| F-RP-01 | خانه / home dashboard (single fund or «همه صندوق‌ها») | `home0` L107, `homeAll` L1824 | VE, VA | Tiles drill via `drill()` L1185 |
| F-RP-02 | کارهای این ماه / todo card | `todo`, `todoGen` | VE (smart, v31test) | |
| F-RP-03 | تراز اعضا / members balance (monthly or yearly, columns, per-fund sections, investors block, totals) | `tarz` L1096, `tdr` L1207, `tarzXl` L1106 | VE, VA | |
| F-RP-04 | وام‌ها و طلب / loans and credits view inside tarz (`ui.tv`) | `rep` L977, `repXl` L982 | VE | Overpaid-installment reconciliation row |
| F-RP-05 | ترازنامه و گزارش سالانه / balance sheet and annual flows (multi-fund, consolidated total) | `yrep` L1307, `ydata` L1304, `ybs` L1302 | VE (yrtest), VA | All cells tappable (`figGo` L1198) |
| F-RP-06 | دفتر روزنامه، تراز آزمایشی، دفتر معین / journal, trial balance, ledger | `jrnl` L1177, `jtb` L1176, `moinRows` L1282, `moinBody` L1287 | VE (jvtest, moin) | Shows the first 40 documents per fund when large |
| F-RP-07 | آمار و نمودار / statistics, charts, group summary text | `stx` L1402, `stData` L1356, `stText` L1368 | VE (sttest), VA | |
| F-RP-08 | صورت‌حساب عضو / member statement | `stmt` L1077, `stmtXl` L1080 | VE | |
| F-RP-09 | رسید / receipt (number, date, «تومان معادل ریال», per-transaction before/after, same-payment group, edit history, share, print) | `rcpt` L1057, `balTx` L1054, `rcptFind` L1055, `rcptShare` L1069 | VE, VA | |
| F-RP-10 | خروجی اکسل و چاپ / Excel and print | `xl` L469, `prt` L1323, `pdfOut` L1324 | S (swtest checks libs cached) | Needs CDN at least once |
| F-RP-11 | لمس عدد / universal drill-down `figGo` | `figGo` L1198 | VE, VA | |

## F. Controls, closing, audit

| ID | Persian / English | Location | Status | Notes |
|---|---|---|---|---|
| F-CT-01 | سلامت داده / data health (codes H-…) | `health0` L1004, `health` L1001, `hErrN` L1003 | VE | Report only |
| F-CT-02 | موارد نیازمند بررسی / review queue (live status) | `rv` L278, `rvFix` L523, `rvSt` L524, `rvCorr`, `rvOk` | VE | Import-generated items; auto «برطرف‌شده» |
| F-CT-03 | مغایرت اکسل / Excel reconciliation | `rec` L276 | Hidden in the public build (`REF=[]`) | Dev-only |
| F-CT-04 | اختتامیهٔ سال / year closing and reopening | `closev` L146, `yClose` L157, `yReopen` L160 | VE (v31test) | |
| F-CT-05 | قفل ماه / month lock (optional) | `mclosev` L162, `closeIt` L194, `closeGo` L195 | S | Snapshot rows stored |
| F-CT-06 | مقایسه با سند بیرونی / compare with external closing file | `clx` L496, `clImpA` L500, `clPaste` L579 | S | |
| F-CT-07 | سوابق تغییرات / audit log (hash-chained) | `audit` L987, `aud` L279 | VE (jv2test search) | Not tamper-proof (doc 05) |

## G. Messaging and queue

| ID | Persian / English | Location | Status |
|---|---|---|---|
| F-MS-01 | مرکز پیام / message center (types inst, sav, thx, done, all; templates; send state; batch lists) | `rmd` L942, `msgGo` L900, `MSGT`, `msgSent` L1782 | VE (smart) |
| F-MS-02 | ارسال / send via SMS or WhatsApp intents, copy | `shareOut` L1414 | S. Real sending depends on the device. |
| F-MS-03 | صف وام و قرعه / loan queue and lottery | `lq` L962, `qAdd` L969, `qIssue` L973 | VE (yrtest lottery) |
| F-MS-04 | مخاطبین / contacts import of phone numbers | `ctim` L1744 | S |

## H. Backup, restore, security, sync

| ID | Persian / English | Location | Status | Notes |
|---|---|---|---|---|
| F-BK-01 | ذخیرهٔ فایل پشتیبان / file backup (encrypted, Excel or JSON) | `fbSave` L284, `fbOut` L291, `encPack` L1506, `tables` L422, `jsBackup` L483 | VE (smoke: encrypted backup; v32test round trip) | |
| F-BK-02 | بازیابی از فایل / restore (auto-detect format) | `rFile` L292, `decPack` L1507, `fromTables` L440, `rst` L295 | VE (v31test fromTables; v32test) | Replaces the whole state after confirmation |
| F-BK-03 | پشتیبان ابری رمزدار / encrypted GitHub backup (auto daily, list and restore versions) | `cbkBox` L1613, `cbkSave` L1587, `cbkAuto` L1586, `cbkList` L1604 | S (no network in test env) | |
| F-BK-04 | نسخه‌های خودکار / 3 local snapshots | `snapshot` L725, `snapObj` L724, `snapList` L726, `snapRestore` L727 | S | |
| F-BK-05 | خروجی بی‌نام / anonymized export | `anonS` L474, `anonOut` L482 | VE (no names, phones, IDs or long numbers; balances identical) | Not restorable by design |
| F-BK-06 | قفل برنامه / PIN and biometric lock | `lkSet` L1540, `lkTry` L1533, `lkPin` L1526, `lkBio` L1527, `lkSeal` L1518 | VE (v32test) | UI gate; data not encrypted at rest |
| F-BK-07 | همگام‌سازی / sync (Claude-hosted only) | `rmInit` L728, `rmPush` L730, `rmPull` L734, `rmStart` L739 | VE (synctest, mocked) | Inactive in the PWA |
| F-BK-08 | ماندگاری حافظه / persistent storage request | `navigator.storage.persist()` in `boot` | S | |

## I. AI assistant (module `ai`)

| ID | Persian / English | Location | Status | Notes |
|---|---|---|---|---|
| F-AI-01 | تنظیم دستیار / key and model setup (falls back to «میز کار» key `miz.ai`) | `aiSetup` L231, `aiCfg`, `aiSet` | S | Key in `localStorage['sy.ai']`, plaintext |
| F-AI-02 | پرسش و ثبت / natural-language entry, queries, reminders, reports | `aiOpen` L229, `aiRun` L239, `aiDo` L242, `aiFill` L259, `aiRemind` L261, `aiReport` L265 | S (no network in tests; owner reported setup issues fixed in 0.33.1) | Pseudonymization `aiMap`/`aiHide` L219–221 |

## J. Help

| ID | Persian / English | Location | Status |
|---|---|---|---|
| F-HL-01 | راهنمای کامل مدیر / manager guide (`GUIDE` chapters plus FAQ; search; print all) | `faq` L323, `gPrint` L321 | VE (guidetest; print triggered) |
| F-HL-02 | درباره / about | `abt` L328 | S |
