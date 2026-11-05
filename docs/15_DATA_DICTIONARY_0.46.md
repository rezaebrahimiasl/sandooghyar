# 15 — Data dictionary (0.46.0, commit 750ac84)

The canonical schema is the Excel backup produced by `tables()`, with schema version `Meta.schema=2`. `fromTables()` reads that backup back. Each sheet maps 1:1 to a collection of the state object `S`. Where the stored property name differs from the Excel column, both are given (`column ← S.property`).

Units:
- **Amounts** are numbers in **million toman**, rounded with `R(x)=round(x·1e7)/1e7`.
- **Periods** are keys `"<fid>-<yyyy>-<mm>"`, e.g. `F1-1405-01` = Farvardin 1405. `pix(key)` gives a month index, where 0 = Farvardin 1405 (`YR0=1405`).
- **Dates** (`date`) are Jalali strings, validated strictly with `vdate` and `jLeap`.
- **Timestamps** (`at`, `t`) are ISO-8601 strings.

Docs/03 has the 0.40.1 field narrative; this file supersedes it where they differ.

## 1. Storage locations

| Store | Key / name | Content |
|---|---|---|
| IndexedDB `sandooghyar`, object store `kv` | `sandooghyar.v2` (`KEY`) | `JSON.stringify(S)` — the only authoritative data |
| same | `sandooghyar.v2.cfg` | `CFG` (device settings, sync bookkeeping) |
| same | `.s1` … `.s8` | rolling snapshots `{at, rev, json, label}` (2 slots when IndexedDB is unavailable) |
| same | `.corrupt` | raw unreadable copy kept by recovery mode |
| same | `.rlog` | restore log (last 50 decisions) |
| same | `.prev` | legacy (≤0.40); migrated to a snapshot and removed by `prevMigrate` |
| IndexedDB `sandooghyar-k`, store `k` | device key | key used by the app lock to seal secrets (`kdb`, `kOp`) |
| IndexedDB `sandooghyar-shell`, store `f` | `index.html` | last good page copy (written by sw.js) |
| Cache Storage | `sandooghyar-v<ver>`, `sandooghyar-shell`, `sandooghyar-share` | page, shell, CDN libraries and fonts |
| localStorage | `sy.ai` | `{prov, key, model, anon}` — AI settings; never exported |
| localStorage | `sy.gh` | `{repo, tok, pass, auto, sec?}` — cloud backup settings. With the lock on, `tok`/`pass` live only in `sec` (sealed). Never exported |
| localStorage | fallback copies of the `kv` keys | used only when IndexedDB is unavailable (`lsw`) |
| GitHub (user's own private repo) | `sandooghyar-backup.enc.json` (`GHP`) | `encPack` envelope (below) |

Encrypted envelope (`encPack`):

```
{app:'SandooghYar', v:1, kdf:'PBKDF2-SHA256', it:150000, alg:'AES-GCM-256', z, salt, iv, ct, at, ver, n:{f,m,t}, dev?}
```

- `ct` is the gzip-compressed JSON `{data:S,…}`, encrypted with a key derived from the backup password.
- `n` holds the counts used by the upload gate `cbkSmall`.

## 2. State object `S`

`S` holds `{v:1, c, rev, funds, persons, mems, tx, loans, closed, audit, review, ops, skips, opens, queue, deps, txv, msgs, ocat, org, pmIgn}`.

- `c` is the ID counter used by `nid(prefix)`, which yields ids like `F1`, `P12`, `M40`, `T…`, `L…`.
- `rev` increments on every `save()`.

### Funds (`S.funds`)

| Column | Property | Meaning |
|---|---|---|
| id | id | `F<n>`, string, unique |
| name | name | display name |
| multiLoan | multiLoan | 1 = a member may hold concurrent loans in this fund |
| archived | archived | 1 = archived. A fund that has history cannot be deleted, only archived (`fHist`) |
| aliases | al[] | alternative names, `|`-joined |
| startMonth | sm | first month index |
| cashAccounts | ca[] | cash and bank accounts (JSON). Each has `id`, `name`, optional `rec[]` reconciliations `{p, app}`, `ar` (archived), `recStale`, `mergedTo` |
| ca0 | ca0 | default cash account |
| dormMonths | dm | months without activity before a member counts as dormant |
| minSaving | ms | minimum monthly saving |

### Persons (`S.persons`)

| Column | Meaning |
|---|---|
| id | `P<n>` |
| name | name |
| fa | father's name |
| nid | national id — sensitive, not exported by `anonS` |
| ph | phone |
| acc | account note — sensitive |
| addr | address |
| nt | note |
| g | gender for salutation: `m` = آقا, `f` = خانم, empty = نامشخص |
| tels | extra phones (JSON) |
| sn | name used in reminder messages («نام در پیام»), optional |

### Memberships (`S.mems`) — one person in one fund

| Column | Property | Meaning |
|---|---|---|
| id | id | `M<n>` |
| pid | pid | → `persons.id` (required; `H-MEM-PERSON`) |
| fid | fid | → `funds.id` (required; `H-MEM-FUND`) |
| status | status | `فعال` / `متوفی` / other inactive values |
| openSavings | os | opening savings |
| openLoan | ol | opening loan balance |
| start | start | start month |
| note | note | note |
| qs | qs | fixed monthly installment (feeds `sugg`) |
| succOf | succOf | membership this one succeeds (inheritance) |
| rel | rel | relation to the predecessor |
| succDate | succDate | succession date |
| succNote | succNote | succession note |

### Transactions (`S.tx`) — member-level events

Required fields: `id`, `type`, `amt` (finite), `fid`, `mid`, `per` (string).

`type` values (`TY`):

| type | Meaning |
|---|---|
| `sav` | saving |
| `inst` | installment |
| `loan` | new loan |
| `credit` | member credit / overpayment |
| `inj` | capital injection; `rp===0` means non-refundable |
| `injret` | injection repayment |
| `rcl` | reclassification `from`→`to` |
| `xout` / `xin` | balance transfer between memberships; `bk` = account, `cp` = counterpart membership, `xid` = pair id |
| `ref` | savings refund |
| `refc` | credit refund |
| `lrev` | reversal of an erroneous loan |

Other fields:

| Field | Meaning |
|---|---|
| date | Jalali date |
| note | note |
| src | origin (e.g. `transfer-all`) |
| at | time recorded |
| rp | repay flag for `inj` |
| ref | refund reference |
| term | loan installments |
| rcv | loan recipient (if not the member) |
| rev | reversal link |
| ca | cash account |
| trk | bank tracking no. |
| dep | linked deposit |
| rno | receipt number, stable across corrections |
| rv | revision no. |
| prev | id of the record this one corrected |

### Loans (`S.loans`)

| Column | Property | Meaning |
|---|---|---|
| id | id | loan id |
| fid | fid | fund |
| mid | mid | membership |
| amt | amt | amount |
| per | per | period (`per=null` for opening loans) |
| kind | kind | `افتتاحیه` (opening) / `جدید` (new) |
| term | term | number of installments; default 10 if empty |
| rcv | rcv | recipient |
| start | date | start date |
| sd | sd | start date text, used when `per` is null (loans before 1405) |
| void | void | 1 = void |
| vr | vr | void reason |
| rph | rph | recipient phone; stored as an 11-digit string (`padStart(11,'0')` on import) |
| rsm | rsm | reminder SMS to the real recipient enabled (📨 in the loan block) |

### FundOps (`S.ops`) — fund-level events and manual journal vouchers

`type` values (`OPT`):

| type | Meaning |
|---|---|
| `ctr` | transfer between accounts |
| `gift` | expense / gift |
| `inc` | income |
| `cap` | capital injection; `rp===0` = donation; `spid` = investor person |
| `capret` | injection repayment |
| `dep` | long-term deposit out |
| `wd` | withdrawal from deposit |
| `buy` | asset purchase |
| `sell` | asset sale; `cost` = cost basis |
| `jv` | manual voucher; `ln` = `[[acc, debit, credit], …]` over `JVA` accounts `cash, ast, inc, gf, don, ic, sus` |

`jv` subkinds (`jk`):
- `oc` opening cash;
- `sus` suspense;
- preset kinds from `JVP`: `fee`, `int`, `exp`, `rev`, `don`.

Other fields:

| Column | Property | Meaning |
|---|---|---|
| asset | asset | asset name |
| void | void | void flag |
| voidReason | vr | void reason |
| gid | gid | shared-operation group across funds |
| recipients | rc | gift recipients (JSON) |
| lines | ln | voucher lines (JSON) |
| ca, ca2 | ca, ca2 | from/to accounts |
| no | no | voucher no. |
| cat | cat | category (`S.ocat` holds custom categories) |
| rno, rv, rto | rno, rv, rto | correction chain (`rto` = replaced by) |

### Deposits (`S.deps`) — announced bank deposits awaiting allocation

| Column | Property | Meaning |
|---|---|---|
| id, fid, mid, name, amt, date, ca, trk, note, at | same | deposit details |
| void, vr | void, vr | void flag and reason |
| alloc | al | `[{tx, …}]` allocations to transactions; cleared by `txVoid` when the tx is voided |
| rno, rv, prev, rto | same | void+replacement chain (`depRep`) |

### Queue (`S.queue`) — loan waiting list

| Field | Meaning |
|---|---|
| id | id |
| mid | membership |
| amt | requested amount |
| note | note |
| at | time added |
| status | `در صف` (waiting) or `صادر شد` (issued) |
| why | cancellation reason |
| lot | date the member won the lottery (`dtf(x.lot)`) |

### Other collections

| Sheet | Collection | Shape |
|---|---|---|
| VoidedTx | `S.txv` | voided transactions: the original tx + `vr` (reason) + `vat` (time); stored as JSON |
| Closings | `S.closed[periodKey]` | `{locked, snaps:[{at, o, rows:[[mid,s,l,c]], tx, kind?, yc?}], reopens:[…]}`. `kind:'year'` with `yc:{inc,gf,resY,resP,resE}` = year-end close |
| Opens | `S.opens` | opening documents `{id, fid, date, reason, at, items}` |
| Skips | `S.skips[periodKey]` | months intentionally without entries `{reason, at}` |
| Review | `S.review` | data-quality items `{id, kind, fid, mid, per, status, msg, src:{sheet,cell,excel}, app, res, resNote}` |
| Audit | `S.audit` | newest first `{t, a, d, h}`, where `h = fnv(prev.h|t|a|d)` — a hash chain (`H-AUDIT-CHAIN`) |
| Messages | `S.msgs` | sent reminders `{id, t, mid, ty, per, ch, n[], who, grp, st}` |
| Meta | — | `app=SandooghYar`, `version`, `exportedAt`, `counter=S.c`, `ocat`, `org` (institution identity: name, logo, phone, email, address, receipt footer), `pmIgn`, `rev`, `schema=2` |

## 3. Integrity rules

1. **`validState(o)`**:
   - `funds`, `persons`, `mems`, `tx` and `loans` are arrays;
   - fund and membership ids are strings;
   - every tx has a string `id`, `type` and `per`, and a finite `amt`.
2. **`fromTables`** (also used inside `rsInteg`):
   - requires the `Meta.app` marker;
   - rejects unique-id violations and invalid numbers;
   - reports missing sheets and orphan references.
3. **`rsInteg(d)`** runs before every restore or adoption:
   - **blocking:** financial or structural errors;
   - **warning:** non-financial errors (needs typed confirmation).
4. **`sanState`**: strips `<` and `>` from free-text fields on every save and migration.
5. **`migrate(o)`**: additive only. It defaults missing collections and `mems[].qs`; it never deletes fields.
6. **Health checks `health0()`**, shown on the `hlt` page and in the alert centre:

| Group | Checks |
|---|---|
| Identity | `H-DUP-ID`, `H-NID-DUP` |
| References | `H-MEM-PERSON`, `H-MEM-FUND`, `H-ORPHAN-TX` |
| Format | `H-TX-FORMAT` |
| Negative balances | `H-NEG-SAV`, `H-NEG-LOAN`, `H-NEG-CAP`, `H-NEG-ASSET`, `H-NEG-CASHACC` |
| Ledger reconciliation | `H-JRNL-CASH`, `H-JRNL-SAV`, `H-JRNL-LOAN` |
| Cross-fund and transfers | `H-FUND-MISMATCH`, `H-XFER-PAIR` |
| Loan register | `H-LOAN-REG` |
| Closed periods | `H-CLOSE-DRIFT`, `H-CLOSE-TX`, `H-CLOSE-MEM` |
| Year-end | `H-YCLOSE-RES` |
| Audit chain | `H-AUDIT-CHAIN` |
| Queue | `H-QUEUE` |

7. **Write guards**:
   - recovery mode (`RCV`) blocks `save`, the cloud upload, pagehide writes and the claude.ai sync push;
   - closed months are `locked` and need a reopen with a reason;
   - voids never delete — records move to `txv`, or are flagged `void`.

## 4. CFG (device-local, not part of S)

| Field | Meaning |
|---|---|
| `ch` | changes since the last file backup |
| `chc` | changes since the last cloud sync |
| `csh` | state hash at the last cloud sync |
| `cbk` | cloud status `{at, err}` |
| `bh`, `base`, `lrev`, `sync` | claude.ai artifact sync bookkeeping |
| `dev` | device name |
| `lk` | lock settings `{wp, t, …}` |
| `off` | disabled modules |
| `theme`, `spl` | appearance, splash |
| `uk` | remembered UI filters |
| `tpl`, `tpls`, `gtpls`, `gsz` | message templates and group size |
| `drill` | drill-down state |
| `emg`, `bk2`, `safeS` | safety reminders |
| `sent`, `mch`, `nqOff`, `tried`, `wnSeen`, `lb` | misc UI and history state |
