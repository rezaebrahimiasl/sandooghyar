# Data architecture — SandooghYar (0.47.0)

The field-level dictionary is in `docs/15_DATA_DICTIONARY_0.46.md`. It is still valid for 0.47.0: no new stored fields were added except that `mems[].qs` became editable in the app. Earlier narrative: `docs/03`.

## Entities and relationships

```
Person (persons) 1 ── * Membership (mems) * ── 1 Fund (funds)
Membership 1 ── * Transaction (tx)            Fund 1 ── * FundOp (ops)
Membership 1 ── * Loan (loans)                Fund 1 ── * ClosedPeriod (closed[pk])
Membership 1 ── * Deposit (deps) ── alloc ──> Transaction
Membership 1 ── * QueueItem (queue)           Person 1 ── * FundOp (ops.spid = investor)
Transaction ──void──> VoidedTx (txv)          Audit (audit) — hash chain over every action
```

## Identifiers and ownership
- **IDs** come from `nid(prefix)` with the global counter `S.c`:
  - `F` funds, `P` persons, `M` memberships, `T` transactions, `L` loans, `O` fund ops, `D` deposits, `Q` queue.
- **Periods** are `pk(fid,i)` = `F1-1405-01`.
- **Ownership.** There is one administrator per device. The data belongs to that device's IndexedDB. Multi-device work is "latest full copy" sync with a conflict prompt, not record-level merging.

## Storage
- **Main store.** IndexedDB `sandooghyar`/`kv`:
  - key `sandooghyar.v2` holds `S` as JSON — the only authoritative copy on the device;
  - `.cfg` holds the device settings;
  - `.s1…s8` are rolling snapshots;
  - `.corrupt`, `.rlog`.
- **Durable write queue** (`LS`). See `docs/11`.
  - It is serialized and generation-aware.
  - A promise resolves only after the IndexedDB transaction completes.
  - Success toasts are shown only after commit.
  - States: pending / failed / retry.
- **Fallback.** If IndexedDB cannot be opened, the app runs in read-only recovery (`RCV='idb'`). localStorage is used only when IndexedDB is unavailable, with per-key failure tracking.
- **Other stores:**
  - `sandooghyar-k` holds the device key used by the lock;
  - `sandooghyar-shell` holds a last-good copy of the page for offline launch;
  - Cache Storage holds the page, shell and CDN libraries.
- **localStorage settings, never exported:** `sy.ai` (AI settings, key) and `sy.gh` (cloud backup settings, token sealed when the lock is on).

## Migrations
- `migrate(o)` is **additive only**: it defaults missing collections and fields and sanitises text (`sanState`). There has been no destructive migration in any version.
- Excel schema: `Meta.schema=2` (`tables`/`fromTables`). An Excel round-trip must give `ndiff 0` (`browser/xlroundtrip.js`).
- **Upgrade safety.** `browser/upgrade.js` loads data stored by the previous release into the new build. Balances, cash and the audit log must be unchanged.

## Backup
1. 8 automatic snapshots on the device.
2. JSON file.
3. Full Excel (all collections).
4. Weekly encrypted file (`bk2`).
5. Encrypted cloud copy (GitHub, file `sandooghyar-backup.enc.json`, PBKDF2-SHA256 150k + AES-GCM-256):
   - quiet automatic upload ~90 s after changes and every 30 min;
   - the upload gate `cbkSmall` refuses an empty copy or one that shrank by more than 50 %.
6. Anonymised export (`anonS`).
7. Printable emergency report.

## Recovery and restore
- **Unreadable store.** If the stored state cannot be parsed, the app enters recovery (`RCV='corrupt'`).
  - Nothing is saved or uploaded.
  - The user picks a snapshot, cloud copy or file; "start fresh" needs a typed phrase.
- **Every restore** goes through `rsAsk`:
  - a comparison table;
  - the `rsInteg` integrity check (blocking errors stop it);
  - typed confirmation for a smaller or older copy;
  - a snapshot taken before replacing.
- **Adopting another device's cloud copy** happens silently only when nothing changed locally (`CFG.chc==0`, hash = `CFG.csh`). Otherwise the user is asked.

## Protecting real data during development
- Development, tests and audits use synthetic data (`wbFixture` in tests only; hand-built states).
- The public build strips the Excel fixture (D/REF/CASH).
- The development source distributed in packages has the fixture names pseudonymised (`tools/pseudonymise.py`).
- Never import the Excel workbook or the Mehr file into real data.
