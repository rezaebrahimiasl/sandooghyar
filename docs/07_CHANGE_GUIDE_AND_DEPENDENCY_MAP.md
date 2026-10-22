# 07 — Change Guide and Dependency Map

## 0. Workflow every change must follow (as practised for 0.33–0.40.1)

1. **Edit the private dev source**, never `index.html` directly. In this project the dev source is `sandooghyar.html`; edits were applied with small Python patch scripts that assert an exact match count.
2. **Bump `VER`** and add a `WHATS_NEW` group: `{v, items:[[key, icon, title, text, action]]}`. Update `GUIDE` and the FAQ if user-visible behaviour changed (owner rule; see doc 08).
3. **Run the tests.**
   - `python3 mktest.py`, then every `tests/*.js`. All must print `FAIL 0`.
   - Run the invariants INV-01…09 (doc 06).
   - Run the browser smoke test on the built output.
4. **Build.** Run `build.py`, which also performs the privacy assertion. Copy `index.html`, `sw.js` and `version.json` to the repo, append a line to `HANDOFF.md`, then commit and push.
5. **Hard constraints.**
   - Never commit member data or real names.
   - Never put tokens or keys in code.
   - Keep amounts in million toman with `R()` rounding.

## 1. High-risk shared code (do not change casually)

| Function / constant | Why it is risky | Safe change boundary | Minimum regression |
|---|---|---|---|
| `pk`/`pix`/`YR0` L62 | The period-key format is persisted in every tx, op, closed and skip record | Never change the format; add helpers instead | All unit tests; restore of an old backup |
| `bal` L86, `bix` L85 | Source of every member number; cached per task | Add new tx types here **and** in `jdocs`, `rcpts`, `tdr`, `TY` and the Excel `tables`/`fromTables`. After any in-place tx mutation call `bixTouch()`. | INV-03/04/07/08, v31test, xwtest |
| `fsum` L89, `opsSum` L650, `icOf` L653, `cashOf` L654, `osol` L1221 | Cash definition; must equal journal cash | Change together with `jdocs`/`jopen` | INV-03, jvtest, catest, the `health` H-JRNL checks |
| `jdocs` L1161, `jopen` L1175, `jtb` L1176, `ybs` L1302, `YBS`, `ACC` L1160 | Accounting truth; also feeds `caBal`, `moinRows`, health, `opView` | Each new event type needs a balanced mapping | INV-01/02/05/06, yrtest, moin |
| `save` L717, `UNDO` | Undo baseline, sync, cloud backup trigger, reconciliation staleness (`recCheck`) | Don't add awaits; keep it synchronous | smoke; undo B-tests |
| `migrate` L713, `validState` L1217, `sanState` L994 | Backward compatibility of stored data and backups | Additive only; default every new field at read time | Restore of an old backup; v31test round trips |
| `tables` L422 / `fromTables` L440 | Excel backup schema; every collection must round-trip | Add a sheet or column for every new persistent field | v31test «fromTables keeps txv», deptest export/import |
| `txVoid` L380 | Removes from `tx`, moves to `txv`, unlinks deposits, audits | Keep voids non-destructive | v31test, deptest |
| `locked` L83, `gapErr` L625 | Posting rules | — | jvtest lock cases |
| `esc` L58 | XSS safety | Never inline raw user text; for JS-string contexts also escape `'` and `\` | TC-S-01 |
| `sheet`/`lay`/`ask`/`cl`/`hsync`/`hpop` | Back-button stack, `HOPEN`/`IGN` counters | Test the back button after any navigation change | TC-M-03 |
| `R`, `F`, `Fs`, `Rl` | Display rules required by the owner | — | Snapshot tests of formatting |

## 2. Feature-by-feature map

| Feature | Entry points | Downstream | Data | Also affects |
|---|---|---|---|---|
| Bulk entry | `bulk` L352 → `brow` L346/`bdef` L345 → `bsave` L381 (validation, review `ask`, `apply`) | `sugg`, `loanRoom`, `depAlloc`, `txVoid`, `payoffAsk`, `susp`, `cashOf` | `tx`, `txv`, `loans`, `deps` | Receipts (`rno`), undo (`BUN`), home todo, messaging, dormancy |
| Single tx | `addTx` L117 → `fmo` L996/`fi` L119 → `sub` L126 | `loanRoom`, `minBal`, `depAlloc`, `qDone` | `tx`, `loans`, `queue` | Same as above |
| Corrections | `corr` L558/`corrGo` L560; `rclVoid` L1071; `rvCorr` | `avail`, `minBal` | `tx`, `review` | Review live status (`rvFix` L523) |
| Transfers | `xfer` L794/`xferDo` L793; `xwhole` L772 | `jdocs` (`ic`), `icOf` | `tx` pairs | `xfr` report, consolidation |
| Fund events | `opForm` L655 → `ofi` L660 → `opSave` L671/`opSave0` L672; `opView` L693; `opEdit` L699; `opVoid` L705 | `opDoc`/`opTbl`, `opsSum`, `capBal`, `assetsOf`, `minCap`, `minAssets` | `ops` | Cash, balance sheet, capital ledger, gifts per member |
| Vouchers | `jvForm` L1225, `jvView` L1668, `jvCopy` L1230, `ocForm` L1245, `susAdd` L177 | `jdocs` jv branch, `opsSum` JC/OC | `ops` (`jv`) | Cash, health |
| Capital ledger | `capPage` L850, `capLed` L857, `capOf` L845 | `capRows` L841, `capSum` L847 | `tx` inj/injret, `ops` cap/capret | Members tile and filter `i`, tarz block |
| Reports | `tarz` L1096, `rep` L977, `yrep` L1307, `stx` L1402, `jrnl` L1177, `xfr` L788, `stmt` L1077, `rcpt` L1057 | Calculation core; `figGo` L1198, `drill` L1185, `tdr` L1207 | read-only | Excel exports `*Xl` |
| Members page | `members` L879, `fill` L886, `mTot` L881, `stChips` L872 | `MFL`, `capOf`, `actFlags` | read + `ui` filters | `ukSave` |
| Closing | `closev` L146, `yClose` L157, `closeAt`, `yReopen` L160, `mclosev` L162 | `fsum`, `bal` snapshots | `closed` | `locked` for every write |
| Health and review | `health0` L1004, `rv` L278, `rvSt` L524 | Journal checks | `review` | Home badges, `pg('ctl')` default tab |
| Backup | `fbSave` L284, `rFile` L292, `rst` L295, `cbk*` L1586–1613, `snapshot` L725, `anonS` L474 | `encPack`/`decPack`, `tables`/`fromTables` | everything | Lock sealing |
| Lock | `lkSet` L1540, `lkShow` L1530, `lkTry` L1533, `lkBio` L1527 | `kdb`/`kOp`, `lkSeal` | `CFG.lk`, `sy.gh` | Cloud backup credentials |
| AI | `aiOpen` L229 → `aiRun` L239 → `aiCall` L214 → `aiDo` L242 → `aiFill`/`aiRemind`/`aiReport` | `aiMap`/`aiHide`/`aiShow` | none (prefills forms only) | — |
| Navigation | `draw` L103, `pg` L269, `more` L200, `hpop` L1124 | — | `ui` | Every page |

## 3. Adding a new member-transaction type (checklist)

1. `TY` label (L56). Decide whether it belongs in `RCIN` (receipt = incoming).
2. `bal` effect (L86). Also check `minBal` usage.
3. `jdocs` mapping (L1161), and `BA` if corrections should support it.
4. `rcpts` (annual flows, L1091) and `tdr` `M_` map (L1207).
5. Form: `addTx` type list, `fi` hints and validation, `sub`.
6. Excel `tables`/`fromTables`, the anonymizer (no change normally), and health checks.
7. `GUIDE`/FAQ text and `WHATS_NEW`.
8. Run the invariants.

## 4. Adding a new fund-event type

`OPT`/`OIC`/`OEX`/`OH` labels → `opForm` fields → `ofi` visibility and preview (`opDoc`) → `opSave0` validation and object → `opsSum` buckets → `jdocs` ops branch → `opView` (uses `opDoc`) → `tdr` `OP` map → Excel round-trip → invariants.

## 5. Backward-compatibility and migration concerns

- Old backups may lack `rno`, `rv`, `rto`, `spid`, `gid`, `ca`, `ln`, `jk`, `deps`, `msgs`, … All readers use `x.field||default`. Keep it that way.
- Old opening documents: the change in 0.39.0 (`jopen` books the gap to cash when there is no opening cash) altered historical balance-sheet *presentation*, not stored data.
- `CFG.uk` restore must ignore unknown keys. Filters `ui.sf` are a comma string; `stNorm` migrates the old `__x` status values.

## 6. Safe change boundaries (recommendations)

- Treat `bal` / `fsum` / `cashOf` / `jdocs` / `ybs` as a **calculation core**:
  - change them only with the invariant suite;
  - before larger edits, consider extracting them into a separately testable module.
- UI-only changes (labels, colours, tiles) are safe if they don't alter `onclick` targets. Check that drill-downs still land on the right pages (`figGo`).
- Never repurpose an existing persisted field. Add new fields.
