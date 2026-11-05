# 11 — Stage 2: IndexedDB durability (0.43.0, branch `stage2-idb`, not released)

## Contract
| | Before (≤ 0.42.0) | After (0.43.0) |
|---|---|---|
| `LS.setItem/removeItem` | update memory, `put()` fire-and-forget; errors only set `ui.ns` | update memory at once, **enqueue** with a per-key generation, return a **ticket** (Promise) |
| Ticket resolves | — | only when a transaction containing that generation (or a newer one of the same key) fires `oncomplete` |
| Failure | silent | error / abort / sync exception → nothing resolved, nothing dropped, automatic retry (0.5 s, 2 s, 5 s, 15 s, 30 s); quota or 6th failure → `failed`: tickets reject, data kept in memory and queue, retry every 60 s, on `online`, on becoming visible, on any new write, or via the «دوباره» button (`LS.retry()`) |
| `save()` | void | returns the ticket of the main key; still synchronous for its 74 callers |
| No IndexedDB in the environment (tests/preview) | localStorage | same, behind the same ticket API |
| IndexedDB open failed on a device | read-only recovery (0.42.0) | unchanged: `RCV='idb'`, no record writes |

`LS.flush()` resolves when every currently pending generation is committed (rejects when the queue is `failed`); `LS.state()` = `{st: idle|pending|retrying|failed, pending, err, drev, mode}`; `LS.clean(k)`; `LS.onChange(f)`.

## State model
1. **In memory**: `S` and the read cache `M` change synchronously.
2. **Pending**: `PEND` holds the latest value of each key with its generation; one readwrite transaction in flight; a batch contains all pending keys and is atomic (IndexedDB all-or-nothing). A newer save during a transaction goes into the next batch; order is preserved.
3. **Committed**: `CMT[k]` = highest committed generation; `drev` = the revision carried by the **committed** main-key value (never the live `S.rev`).
4. **Failed**: `st='failed'`; pending data is never discarded or replaced by a weaker store.

## Success feedback (no false success)
- Undo bar after a save shows «⏳ در حال ذخیره…» and changes to «✓ ذخیره شد» / «⚠️ ذخیره نشد» from the ticket.
- Global indicator (`psiUpd`, bottom-left): saving (after 0.6 s), saved, retrying, failed + «دوباره». `ui.ns` banner while failed.
- `okToast` / `okNote` show their message only after commit, otherwise `persistFail` (quota-aware) — 29 sites: restore (file, Excel, snapshot, cloud, repair), undo, annual close, fund deletion, suspense, deposits, corrections void, account create/merge, profile, messages, merges, transfers, device link, sync adoption, cloud backup (manual and auto).
- Other financial entries (single/bulk entry, vouchers, fund events, closings) keep their UI flow; their durability is shown by the undo bar and the global indicator.

## Sync / cloud boundary
- `cbkUp` awaits `LS.flush()`; on failure no upload, `CFG.cbk.err` set. It uploads the **committed** main-key value; `CFG.csh = hash(committed)`, `CFG.chc` = saves after the committed revision; success shown after the local commit (`okNote`/`okToast`).
- `rmPush` pushes only the committed value; `CFG.base/bh/lrev` written after the push and awaited.
- `cbkPeek` (take), `lnkAsk`, `rmAdopt`: sync markers (`CFG.cbk`, `csh`, `base`, `bh`, `lrev`) are written only after the adopted state is committed.

## Lifecycle
- `visibilitychange → hidden`: `persistNow()` queues the current state if it differs from the stored value and starts the flush. `pagehide`: same, best effort. `beforeunload` warns while writes are pending.
- **Limitation:** asynchronous IndexedDB writes are not guaranteed to finish after `pagehide`; Android may freeze or kill the page. The window is milliseconds (each save flushes immediately), but the last uncommitted batch can be lost; the next start shows the last committed state.
- Lock wipe reloads only after the removals commit; on failure no reload.

## Tests
- `tests/idbtest.js` (fake IndexedDB with injectable faults, fresh "page loads"): 38 assertions — commit, error, abort, sync `InvalidStateError` → reopen, quota, unavailable, reload after success/failure, two generations of one key with DREV, multi-key batch failure, automatic and explicit retry, 50 rapid saves, cloud upload while failing / in flight, hidden page, pagehide no duplicate, restore and undo under failure, undo bar, recovery mode, lock wipe failure, static checks, no unhandled rejections.
- `browser/idbdur.js` (real Chromium IndexedDB, `put` forced to throw `QuotaExceededError`): 5 checks.
- Full run: see HANDOFF / final report.

## Rollback
No key or format change; data written by 0.43.0 is read by 0.42.0 unchanged. Rollback = redeploy `b29e7ab`.
