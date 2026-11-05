# 12 — Version 0.44.0 (branch `stage2-idb`, not released): changes, encryption-at-rest design, dependency (SRI) status, deferred items

## 1. Changes in 0.44.0 (on top of 0.43.0 Stage 2)
| Area | Change | Location (dev source) | Test |
|---|---|---|---|
| Storage | Fallback (no-IndexedDB) driver tracks failure per key; a later success of another key no longer clears a failed main-key write | `LS` → `lsw`, `FK` | v44test |
| Policy check (no change) | Concurrent loans per fund (`fund.multiLoan`): off = double confirmation, on = single; member credit is never consumed automatically (only `refc`) | `sub` | v44test |
| Fund deletion | A fund with any financial history (tx, voided tx, events, loans, deposits, opening docs, closings) can only be archived; `fDel`/`fDel3` refuse. Empty funds may be deleted (messages removed too). | `fHist`, `fDel`, `fDel3` | v44test |
| Statement | Voided member records listed (month, type, amount, reason, replacement) — not part of balances | `stmtVoid`, `vRep` | v44test |
| Deposits | «اصلاح» = void with reason + replacement (`prev`, `rno`, `rv`, `rto`); allocated deposits refused; Excel keeps the links | `depRep`, `depRepGo`, `tables`/`fromTables` Deposits | v44test, xlroundtrip |
| Reports | Bottom tab «اختتامیه» → «گزارش‌ها» (`reps`); closing moved to «بیشتر ← اختتامیه» (`ui.tab='close'` still valid); new «اسناد ابطال‌شده» (`vdoc`) | nav, `reps`, `more`, `vdoc` | v44test |
| Alerts | «مرکز هشدارها» (`alr`): storage, recovery, cloud, health (incl. negative loan = review only), review items, cash shortfall; each with a link; nothing auto-fixed | `alrItems`, `alrN`, `alr` | v44test |
| Dates | Strict Jalali validation: months 1–6 = 31, 7–11 = 30, Esfand 29/30 (33-year-cycle leap rule) | `jLeap`, `jDays`, `vdate` | v44test |
| Gemini | No read of `miz.ai`; only SandooghYar's own key/model | `aiCfg`, `aiSetup` | v44test |

Financial calculation core (`bal`, `fsum`, `cashOf`, `jdocs`, `jopen`, `ybs`, `opsSum`, `icOf`) unchanged.

## 2. Year-end closing (Q4) — resolved in 0.45.0 by owner authorisation (standard practice, records preserved)
- Policy 1: the year's net result (income − expenses) is closed into equity «مازاد/کسری انباشته».
- Policy 2: permanent balances carry forward unchanged (cumulative ledgers); no new opening entries.
- Policy 3: correction = reopen with reason (documents kept) → fix → close again (new document).
- Implementation: `ycs`/`ycDoc`/`ycCard`. Presentation-only closing document in «ترازنامهٔ سالانه», derived from the journal; `yClose` stores the year result in the closing snapshot (`yc`); health `H-YCLOSE-RES` warns on later drift. No ledger re-posting; the financial core is unchanged. Test: `tests/yctest.js`.

Original open questions (now answered as above):
1. which equity account receives the year's net result (income − expenses);
2. whether savings/loans/credit carry forward as opening documents or remain cumulative;
3. reversal procedure after a posted closing.
The existing year lock (`yClose`/`yReopen`) is unchanged.

## 3. At-rest encryption — design only (not implemented)
- **Scope:** main state, `.cfg` business parts, snapshots `.s1…`, `.corrupt`, `.rlog`. Lock material stays in `sandooghyar-k`.
- **Envelope:** `{"enc":1,"alg":"AES-GCM-256","kdf":"PBKDF2-SHA256","it":310000,"salt":b64,"iv":b64(12),"ct":b64}`. A fresh IV for every write; AAD = key name. A data key (random 256-bit) is wrapped by the PIN-derived key: PIN change = re-wrap only.
- **PIN:** ≥ 6 digits; failure counter persisted with increasing delay. Biometric unlock may only release the wrapped data key if bound via WebAuthn PRF/largeBlob. Otherwise it is documented as convenience, not protection.
- **Boot:** locked overlay before any render; decrypt into memory. Wrong PIN or corrupt ciphertext → recovery mode (never seed, never overwrite).
- **Migration (opt-in, per device):**
  1. require a backup < 24 h and a passing integrity drill (`cbkDrill` / `rsInteg` = 0 blocking);
  2. take a separate encrypted backup;
  3. write the encrypted copies under new keys (`sandooghyar.v2.e`, `.e.s1…`) in one queue batch;
  4. verify by decrypt + `shash` equality;
  5. only then remove the plaintext keys (separate batch). Interruption before step 5 leaves plaintext intact (boot prefers verified `.e`).
- **Rollback:** «غیرفعال کردن رمزگذاری» decrypts to the plaintext keys (same verify-then-remove order). Older versions cannot read `.e` keys: the release notes must say «پیش از برگشت به نسخهٔ قدیمی رمزگذاری را خاموش کنید»; the encrypted backup restores into any version.
- **Tests required before release:** encrypt/decrypt round trip; wrong PIN; tampered `ct`; interrupted migration at each step; no plaintext member names in IndexedDB; upgrade from 0.43/0.44 plaintext.
- **Not done:** Origin separation from the sister app (shared origin = same storage access); needs its own migration plan.

## 4. External dependencies / SRI — feasibility
| Library | Pinned URL | Loaded |
|---|---|---|
| SheetJS 0.18.5 | cdnjs …/xlsx/0.18.5/xlsx.full.min.js | on demand |
| html2canvas 1.4.1 | cdnjs …/html2canvas/1.4.1/html2canvas.min.js | on demand |
| jsPDF 2.5.1 | cdnjs …/jspdf/2.5.1/jspdf.umd.min.js | on demand |
| qrcodejs 1.0.0 | cdnjs …/qrcodejs/1.0.0/qrcode.min.js | on demand |

Versions are pinned and CSP limits scripts to self + cdnjs. **SRI/vendoring not implemented:** this build environment cannot reach cdnjs or npm (`curl` → connection refused by the egress proxy, HTTP 000), so the files cannot be fetched or hashed here.
Next step (≈30 min, on any machine with internet):
1. `curl -sL URL | openssl dgst -sha384 -binary | openssl base64 -A` for each file;
2. add `integrity="sha384-…" crossorigin="anonymous"` to each dynamic `<script>` loader (and to the SW precache fetches);
3. preferably commit the four files under `/lib/`, load them from 'self', precache them in `sw.js` and drop cdnjs from CSP `script-src`/`connect-src`.
SheetJS 0.18.5 is the last cdnjs build; newer versions are only on cdn.sheetjs.com (consider when vendoring).

## 5. Offline launch failure («برای اولین بار با اینترنت باز کنید») — root cause and fix
- **Symptom:** the installed app opened offline showed the service worker's fallback page asking for internet, although IndexedDB data was intact.
- **Root cause:** Cache Storage is shared by every app on the origin `rezaebrahimiasl.github.io`. The sister app's service worker (`miz-kar/sw.js`, local copy `7d211d2`) deletes every cache not in its own list on activate: `caches.keys().then(ks=>…ks.filter(k=>!KEEP.includes(k)).map(k=>caches.delete(k)))`. Each Miz-Kar update therefore wiped SandooghYar's cached page; the next offline launch found nothing and served the fallback. Reproduced: with the 0.44 pre-fix worker, deleting all caches → offline launch shows the fallback page.
- **Fix (SandooghYar `sw.js`, via `build.py`):** keep a last-good copy of the page in SandooghYar's own IndexedDB database `sandooghyar-shell` (written on install and on every successful online navigation; only a page containing `VER='`). On a cache miss offline, serve that copy and rebuild the caches from it. Data and data storage unchanged.
- **Recommended fix in Miz-Kar (not changed here; separate project):** delete only its own caches, e.g. `ks.filter(k=>(k.startsWith('miz-')||k==='miz-shell')&&!KEEP.includes(k))`. The long-term fix is separate origins (see §3).
- **Test:** `browser/offline.js` (+ `offsrv.py`, a local server that can refuse connections and return 503): offline launch for `/`, `/?app=2`, `/index.html`, `/index.html?x=1`; offline entry + reload; reconnection without duplicates; failed update (503 during worker install) keeps the last version; good update then offline; versioned cache lost; **all caches wiped** → launch from the shell copy and caches rebuilt. Pre-fix build: the last two checks fail; fixed build: 12/12.
- **Not tested:** a real Android device (airplane mode on the installed WebAPK).
