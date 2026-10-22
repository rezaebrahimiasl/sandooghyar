# 05 — Security, Privacy and Audit

**Scope and methods.**
- Static reading of `index.html@afff760`.
- Executed unit tests: `v32test`, which covers the lock, sealing and encrypted-backup round trip.
- Executed browser smoke test: lock screen and encrypted backup.
- Executed anonymization check (0.38.0).
- **No penetration testing** was done. Statements below marked "suspected" have not been exploited or proven.

**Threat model assumed.** A single trusted administrator on a personal Android phone. The main risks are:
- loss or theft of the device;
- leaking of exported files or messages;
- data loss;
- third-party services: GitHub, Gemini, CDNs.

## 1. Authentication and authorization

| ID | Finding | Evidence | Impact | Likelihood | Severity | Mitigation |
|---|---|---|---|---|---|---|
| SEC-01 | **No user accounts or roles.** Anyone who can open the app has full read and write access. | No auth code; `lkOn()=!!(CFG.lk&&CFG.lk.wp)` is optional (L1513) | Unauthorized viewing or changes on an unlocked phone | Medium | Medium | Recommend enabling the PIN lock. Role separation is not in scope for a single-admin app (doc 08). |
| SEC-02 | **The PIN lock is a UI gate.** Business data `S` in IndexedDB is **not encrypted** when the lock is on. The PIN-derived AES-GCM key (PBKDF2-SHA256, 150k iterations) seals only the GitHub token and backup password (`lkSeal` L1518). | `save()` writes plaintext JSON (L717); `lkKey` L1514; `lkSeal` L1518 | Someone with file-system or devtools access to the browser profile can read all data | Low on a non-rooted phone | Medium | Document this clearly. A future option could encrypt `S` at rest with the lock key; there is a trade-off with biometric-only unlock. |
| SEC-03 | PIN rules: 4–8 digits; rejects repeated and sequential digits; lockout after 5 wrong tries for 30 s × (failures−4). The counter is in memory only and resets on reload. | `lkSet` L1540, `lkTry` L1533 | A 4-digit PIN can be brute-forced offline against the stored verifier, if the attacker can read storage (see SEC-02) | Low | Low–Medium | Persist the failure counter; consider a longer minimum. |
| SEC-04 | Biometric unlock is a WebAuthn `credentials.get` with `userVerification:'required'` on a platform authenticator. It is a **presence gate**: no cryptographic binding of the data to the assertion was found statically. | `lkBio` L1522–1527 | Tampering with the JS in a debug context could bypass the gate | Very low (installed PWA) | Low | Acceptable for the threat model |

## 2. Personal and financial data exposure

| ID | Finding | Evidence | Severity | Mitigation |
|---|---|---|---|---|
| PRV-01 | The public build carries **no member data**. `build.py` strips `D`, `REF` and `CASH` and asserts this. | `build.py`; `index.html` L50–54 (`const D=[]`, `REF=[]`, `CASH=[]`) | — (control works) | Keep the assertion. Never commit the dev `sandooghyar.html`. |
| PRV-02 | Excel and JSON backups are **plaintext**. They include national IDs, phones, account numbers and balances. The UI recommends the encrypted format. | `fbSave` L284 text; `tables` L422 | Medium | Keep the warning; default to encrypted. |
| PRV-03 | The encrypted backup uses PBKDF2-SHA256 (150k iterations), AES-GCM-256 with a random salt and IV, and optional gzip. The password must be ≥ 8 characters. | `ckey` L1505, `encPack` L1506 | — (good). Note: a 150k PBKDF2 count is moderate; the password strength is the user's. | Consider a higher count or Argon2 in the future |
| PRV-04 | The GitHub token is stored in `localStorage['sy.gh']` in **plaintext unless the lock is on**, in which case it is sealed. The token has write access to the user's backup repo. | `ghWrite`/`ghSet` L1498–1500 | Medium | Encourage a fine-grained token limited to one repo; encourage the lock |
| PRV-05 | The Gemini API key is stored in `localStorage['sy.ai']` in plaintext. The sister app's key `miz.ai` is reused if present. | `aiCfg`, `aiMiz` | Low–Medium | The owner's rule is that the key stays on the phone; this holds. Optional sealing with the lock key. |
| PRV-06 | AI requests replace member names with codes (`aiMap`/`aiHide` L219–221), unless `anon:false`. Reports send **aggregates only** (`aiReport` L265). Model output is rendered through `esc()`. | `aiRun` L239, `aiDo` L242 (12 `esc` calls) | Low. The user text itself, numbers and fund names are sent to Google. | Document this in the UI (already shown under the assistant) |
| PRV-07 | The anonymized export drops keys `ph, tels, own, nid, acc, card, iban, sheba, addr, fa, nt, sn, email, tt, title, num, …`, replaces names with `شخص N`, and masks digit runs of 8 or more except in id, period and date keys. | `anonS` L474. Executed: no leakage of names, phone, national ID or card; balances identical. | — | Free-text notes can still contain short numbers or non-member names that are not in the name list (residual risk). |
| PRV-08 | Messages and receipts (SMS/WhatsApp) contain balances. They are sent via device intents; the app does not transmit them itself. | `shareOut` L1414 | Low | The guide warns «فقط برای خود فرد بفرستید». |
| PRV-09 | Claude-hosted sync sends the full state to the Claude runtime database. It is only available inside Claude, not in the PWA. | `rmInit` L728 | Low | — |

## 3. Input validation and DOM safety

| ID | Finding | Evidence | Severity | Status |
|---|---|---|---|---|
| SEC-05 | All rendering uses `innerHTML` with string concatenation. `esc()` (L58) escapes `& < > "` but **not `'`**. Inline `onclick="…('id')"` handlers mostly embed generated ids (`M0001`, `T0305`). Where user text enters a handler (capital-investor keys), it is escaped with an extra `.replace(/'/g,"\\'")` (3 sites). | `grep "\\''+esc("` → 3 sites, all with the extra replace | Low | **Suspected residual:** a backslash `\` in an investor name could still break the JS string in that handler. Not exploited; low impact (self-XSS of the only user). |
| SEC-06 | `sanState` strips `<` and `>` from person names, notes, fund names and aliases on every save and load | L994 | — | Defence in depth |
| SEC-07 | No `eval` or `new Function` in the app | grep: 0 | — | The test harness uses eval, not production |
| SEC-08 | Restore validates structure (`validState`) and `app=='SandooghYar'`, but does not schema-validate every field type. A crafted backup could insert odd values that render via `esc`. | `rFile`/`rst` L292–295, `fromTables` L440 (numeric parse `nu`) | Low | Treat restored files as trusted input only |

## 4. Audit log

| ID | Finding | Evidence | Severity |
|---|---|---|---|
| AUD-01 | Every business write calls `audit(action, detail)`. Entries are `{t, a, d, h}`, with `h = fnv32(prev.h + '|' + t + '|' + a + '|' + d)`, a **hash chain**. | L986–987; 72 call sites | — |
| AUD-02 | The chain uses non-cryptographic FNV-32 and lives inside the same mutable state. It detects accidental edits only. A deliberate tamperer can recompute it. | `fnv` L986 | Low (single admin) |
| AUD-03 | No field-level before/after values for profile edits (person fields). The audit line only says that something was edited. | `pedit` L412 | Medium against the owner rule "every record editable **with history**" (doc 08) |
| AUD-04 | Financial records keep their history: voided tx go to `txv` with a reason and time; ops and loans are flagged `void` with a reason; edits keep `rno`/`prev`/`rv` (tx) and `rno`/`rv`/`rto` (ops). | `txVoid` L380, `opVoidGo` L706, `bsave`, `opSave0` | — |

## 5. Destructive actions, undo, atomicity

| ID | Finding | Evidence | Severity |
|---|---|---|---|
| DST-01 | Restore replaces the whole state after confirmation; the previous state is recoverable only via snapshots `s1`–`s3` or the 6 s undo | `rst`, `snapshot` | Medium. Recommend a forced snapshot before restore. **Not verified** whether one is taken. |
| DST-02 | Fund deletion (`fDel` L549) exists. The cascade behaviour was **not verified**. | static | Medium (test needed) |
| DST-03 | Undo restores the full previous JSON only if `S.rev` is unchanged and the save was within 5 s of a tap | `save` L717, `undoDo` L722 | — |
| DST-04 | Multi-record writes are synchronous in one callback. `bsave` uses a JSON snapshot rollback on post-validation failure (`E-EDIT`). Other flows validate first and have no rollback. | L381, L672 | Low |
| DST-05 | Persistence is not transactional across tabs. Two open tabs could overwrite each other (last write wins). Sync conflict handling exists only in Claude-hosted sync. | `LS` shim | Low (single device, single tab) **Untested** |

## 6. Backup integrity, restore, retention

- **Encrypted packs.** AES-GCM gives integrity, and a wrong password fails (TEST v32test «enc backup wrong pass»).
- **Cloud backup.**
  - Auto runs after 20 h, or 60 s after changes when changes exist (`cbkAuto` L1586).
  - Each push is a git commit, so the history gives retention.
  - Restore lists versions (`cbkList` L1604).
  - Network behaviour is **untested** in this environment.
- **Local snapshots.** Only 3 are kept, in the same storage, so they don't protect against storage loss.

## 7. External resources and supply chain

| ID | Finding | Severity | Mitigation |
|---|---|---|---|
| EXT-01 | CDN scripts (SheetJS 0.18.5, html2canvas 1.4.1, jsPDF 2.5.1) are loaded **without Subresource Integrity** hashes | Medium | Add `integrity` attributes or vendor the files into the repo |
| EXT-02 | SheetJS 0.18.5 has published advisories (prototype pollution and ReDoS when **reading** crafted files). The app reads user-chosen backup files with it. | Low–Medium (the user opens their own files) | Upgrade to the current SheetJS CDN build or vendor it |
| EXT-03 | Google Fonts and the speech service involve Google network requests, which leak IP and usage to Google | Low | Optional; fonts are cached |
| EXT-04 | The service worker caches cross-origin opaque responses for CDNs and fonts | Low | — |

## 8. Data-loss scenarios and recovery

| Scenario | Recovery |
|---|---|
| Browser storage cleared or app uninstalled | Restore from an encrypted file or GitHub backup |
| Eviction without persistence | Same; the UI shows the persistence state and advises installing |
| Corrupt state at load | Raw copy kept in `.corrupt`; app starts from seed. There is **no automatic recovery UI** (static; untested). |
| Wrong restore | Snapshots `s1`–`s3`, if taken before |
| Lost PIN | Lock disable requires the PIN. Data is still readable through backups. The GitHub token and backup password are sealed and lost. **Untested** path. |
| Lost backup password | Encrypted backups are unrecoverable (stated in the UI) |
