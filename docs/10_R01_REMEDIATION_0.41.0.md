# 10 — R01 Remediation (version 0.41.0)

Scope: implementation of the owner-approved R01 urgent actions FX-1 … FX-5.
FX-6 (lock hardening / encryption at rest) and FX-7 (fund-deletion policy) still await owner decisions and are **not** implemented.
Line numbers refer to the public `index.html` of 0.41.0.

## 0. Corrections to docs 00–09 (they describe 0.40.1)

| Doc statement | Correct fact |
|---|---|
| GitHub backup is "backup only" | It is multi-device sync: `cbkPeek` (L1564) follows a newer copy from another device; `cbkLink` adds a device by link/QR. |
| `.prev` is a recoverable "previous version" | In 0.40.1 `.prev` was written but never readable from the UI. Fixed in 0.41.0 (see FX-3). |
| "Corrupt-state handling is silent" (doc 09 risk 9, HYP-03) | 0.40.1 kept the raw copy in `.corrupt` and `corrBox` showed a warning, **but** boot then saved an empty seed over the main key and could upload it. Fixed in 0.41.0 (FX-2). |
| Fund-deletion cascade "unverified" (HYP-04, Q10) | Verified: `fDel3` (L551) is a hard delete; `txv`, `deps` and `msgs` of the fund are orphaned. Open item FX-7 (owner decision). |
| Local snapshots: 3 | 8 slots in 0.41.0 (2 when IndexedDB is unavailable). |

## 1. What changed

| ID | Finding | Change | Location |
|---|---|---|---|
| FX-2 | V-02: unreadable store → empty seed saved over main key, then uploaded | **Recovery mode.** If the stored state cannot be read (`RCV='corrupt'`) or IndexedDB fails with no data (`RCV='idb'`), nothing is written: `save`, the hidden-page/pagehide writes, `rmPush`, `cbkAuto`, `cbkSoon`, `cbkUp` are all blocked. A recovery sheet offers: automatic versions, cloud list, restore from file, "try to repair" and "save damaged copy as file", and «شروع از نو» only with the typed phrase. Every restore path calls `rcvEnd()`. | `RCV`/`IDBF` L1704; `rcvShow` L1706; `rcvFresh`, `rcvRepair`, `rcvSaveRaw`; `boot` L1722; `save` L717 |
| FX-2 | V-02: upload of an empty/shrunken state | **Upload gate** `cbkSmall(rp)` using the remote header `n:{f,m,t}`: refuse when local is empty but remote is not, or transactions/memberships dropped below 50 % (thresholds: ≥10 tx or ≥5 memberships in the cloud). Auto upload stops and records `CFG.cbk.err`; manual upload needs typed «بفرست» (`cbkSmallAsk`, `force`). | `cbkSmall` L1550; `cbkUp` L1552 |
| FX-1 | V-01: file/Excel/JSON backups reset `CFG.ch`, enabling silent adoption of another device's copy | **Separate cloud counter `CFG.chc`** (incremented in `save`, reset only by a successful cloud upload, cloud restore or adoption) and **content hash `CFG.csh=shash(S)`** stored after upload/adoption. `cbkPeek` decrypts first and adopts silently only if `chc==0` **and** the current state hash equals `csh`; otherwise it asks, showing the `drillCmp` comparison table. Migration: `chc` starts from `ch`; without `csh` the app always asks once. The cloud card shows «فرستاده‌نشده به ابر». | `save`; `cbkUp`; `cbkPeek` L1564; `cbkBox` L1621 |
| FX-3 | V-03: `.prev` write-only; snapshots hidden in the installed app | **8 rolling snapshots** (`SNK()`); every former `.prev` write is now `snapObj(S,label)` (file/Excel/cloud/snapshot restore, fund deletion, sync adoption, device link). A legacy `.prev` is migrated once into a snapshot and removed (`prevMigrate`). The snapshot list is shown in the installed app (`storeBox`). `lkWipe` removes all slots. | `snapObj` L724; `snapRestore` L727; `prevMigrate` L728; `storeBox` L750; `lkWipe` L1542 |
| FX-3 | No comparison before replacing data | **`rsAsk(d,at,label,go)`**: comparison table (funds, memberships, transactions, savings, loans) plus dates; when the incoming copy is smaller or older than the last local change, typed «جایگزین کن» is required; a snapshot is taken first. Used by `rst`, `xlRestore`, `snapRestore`, `cbkGet`, `rcvRepair`. | `rsAsk` L1719 |
| FX-4 | V-04: Excel loses fields | Transactions add `rno, rv, prev`; FundOps add `rno, rv, rto`; Meta adds `pmIgn`, `rev`, `schema=2`. `fromTables` reads them and returns `at` (export time) for the comparison. | `tables` L422; `fromTables` L440 |
| FX-5 (partial) | V-05: no CSP | `build.py` injects a CSP `<meta>` in the public build only: `default-src 'self'`; scripts from self + inline + cdnjs; styles from self + inline + Google Fonts; `connect-src` self, api.github.com, generativelanguage.googleapis.com, cdnjs, Google Fonts; `img-src 'self' data: blob:`; `object-src 'none'`; `base-uri 'none'`; `form-action 'none'`. | `build.py` |

## 2. Not done (blocked or awaiting decision)

- **FX-5 vendoring and SRI:** the session's network policy blocks the npm registry (ENOTFOUND), cdnjs and cdn.sheetjs.com (403). The library files couldn't be obtained or hashed. Needs network access to those hosts, or the owner supplying the files. Until then `'unsafe-inline'` stays, because the UI uses inline handlers.
- **FX-6** (PIN strength, persistent failure counter, encryption at rest, biometric binding, sealing token and keys without the lock) and **FX-7** (fund-deletion policy) need owner decisions.

## 3. Verification (executed on the 0.41.0 public build, synthetic data only)

| Test | Result |
|---|---|
| Unit tests: 21 suites | PASS 310 / FAIL 0 |
| Browser smoke test | no page errors; offline reload ✓ |
| `browser/recovery.js` T1: corrupt stored state at boot | main key left untouched, raw copy kept, recovery sheet shown, `save` and `cbkUp` refused — PASS |
| T1b/T1c: snapshot list offered; «شروع از نو» only after typed phrase | PASS |
| T2: after a local file backup (`ch=0`), a newer copy from another device is **not** adopted; user asked with comparison table | PASS |
| T2b: an unchanged, synced device still follows the cloud and keeps a snapshot | PASS |
| T3: state much smaller than the cloud copy is not auto-uploaded; forced manual upload works | PASS |
| T4/T4b: risky restore requires typed confirmation, leaves a restorable snapshot; 8 rolling slots | PASS |
| T5: legacy `.prev` becomes a restorable snapshot | PASS |
| `browser/xlroundtrip.js`: Excel `tables`→`fromTables` deep comparison | 0 differences (ignoring empty-vs-missing defaults and the recomputed ID counter); balances and cash equal |
| `browser/csp.js`: app pages under the CSP | 0 violations; a test script/image from an unlisted host is refused |

Not verified here: real GitHub network calls, real Android devices, behaviour with actual IndexedDB failures (simulated by the code path only).
