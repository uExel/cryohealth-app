# HANDOFF — CryoHealth-app — 2026-11-10
Session: issue-2-auth-tests-hydrate-fix  Model: claude-sonnet-5-5  Branch: fix/2-auth-hydrate-and-tests  Goal: #1  Task: #2
Prior session archived: docs/ai/sessions/2026-09-27-alerts-root-cause-protocol-library-handoff.md

## State
Based on `main` (01527f1), not on `shabir_dev`. Not merged, no build made from this branch. Issue #2 (scaffold + offline store + auth) was already built in the app; what it lacked was proof. This branch adds that proof (login and session tests, a way to run them) and fixes one real bug the tests found. PR #7 targets `shabir_dev`; this one targets `main` on purpose, so it carries none of `shabir_dev`'s 9 unmerged commits.

## Done this session
- **Bug fixed, `src/state/auth.ts` `hydrate()`**: a damaged saved identity (not JSON, `null`, unknown role, missing name) made `JSON.parse` throw, status stayed `loading`, and the splash screen never routed. A secure-store read error did the same. Now every one of those falls back to `guest` (with a `console.warn` for read errors).
- **20 tests, all passing**: `src/state/__tests__/auth.test.ts` (13: hydrate, setSession, a login surviving an app restart, logout, no network call at start, the damaged cases above) and `src/lib/__tests__/login-api.test.ts` (7: request shape, success, wrong password keeps a saved session, no internet keeps it, 500, 30 s timeout, 401 with a token logs out).
- **`npm test` now exists on `main`**: jest, jest-expo, @types/jest, @react-native/jest-preset (same versions as `shabir_dev`), the `test` script, the jest block, and `"types": ["jest","node"]` in `tsconfig.json`. `main` had no test runner before. `package-lock.json` gained 541 packages; no existing version changed and nothing was removed (checked by comparing both lockfiles).
- **On a real phone** (OPPO CPH2083, Android 9, about 1.8 GB RAM, Wi-Fi off, airplane mode on), using the already-installed v2.1.0 build from 21 Oct (built from `shabir_dev`, not this branch): force-stopped and cold-launched the app several times.
  - As a guest: Welcome, then Home, Health, Lakes and Alerts all open from saved data ("Offline — showing saved information"). No crash.
  - Logged in as `admin-001` (Cryo Admin): cold launch with no network goes straight to Home, not Welcome. Settings shows Lakes 6, Alerts 11, Protocols 11 stored on the phone.
  - Signed out, then logged in as `chw-001` (Amina Baig, role `chw`) on the real server over Wi-Fi, then Wi-Fi off and a cold launch: straight to Home ("Offline — showing saved information"), Settings shows AMINA BA…, Home shows "0 cases waiting to sync" and the New case button, the Health tab lists the 11 saved protocols, a protocol opens with its real content and source, and the New case form opens ("Saved on this phone"). The form was only opened, never submitted. No crash in the phone log.
  - Login with no network shows "Could not reach the server" and does not crash.
- Checked #5 (Guidance screen from `/protocols`): already fixed in code (commit 779e3cf). Confirmed with a throwaway render test (not committed): real stored protocol shown, public mode shows "not available" when `steps` is empty, unknown slug shows no-match. It is still open on GitHub.

## Not done / deferred
- **The `hydrate()` fix is verified by tests only.** It cannot be checked on a phone: a release app does not let anyone plant a damaged saved login, and `main` has no Android project (`android/`, the Android package name and `google-services.json` exist only on `shabir_dev`), so there is no Android build of this branch to install. Building it with `shabir_dev`'s Android setup would pull in that branch's 9 unmerged commits.
- A case was not submitted offline and synced later: it would create a real case on the production server. Only opening the form was checked.
- Startup time was not measured (the screen was off at the first launch).
- The Alerts tab ignored the first two taps once, then worked on 4 of 4 retries. Not reproduced, cause unknown. Worth watching.
- #3 (Urdu LLM benchmark) needs a 4 GB phone and model files; not started.
- Server data: all 11 protocols have `steps: null`, so public mode shows "not available" for each. API-side content work (already listed in the 2026-09-27 handoff).

## Next action
Review and merge this PR (a human merges; nothing here was merged or pushed to `main`). After it merges, `shabir_dev` will add the same jest lines to `package.json`/`tsconfig.json`; they are identical by design, so any conflict there is just "keep one copy", but `package-lock.json` may need `npm install --package-lock-only` to resolve.

## Open questions for a human
- Should #2 close on merge (this PR says so), or wait for a CHW-role device check and a build of merged `main`? — blocking: no
- Close #5 on GitHub? Its acceptance criteria are met in code. — blocking: no

## Failed approaches (do not retry)
- A `jest.mock()` factory may only reference variables whose names start with `mock`; any other name and Jest refuses to load the test file.
- A throwaway test that rendered the Guidance screen on a LokiJS in-memory database hung Jest for over 5 minutes until it was run with `--forceExit`; the open database keeps the process alive.
- `tsc` fails with "Cannot find name 'jest'" until `tsconfig.json` has `"types": ["jest","node"]`.
- Phone screenshots come back all black when the display is asleep (`adb shell input keyevent KEYCODE_WAKEUP` first). The face-lock screen did not stop `monkey` from launching the app.

## Loops run
- none

## Files touched
src/state/auth.ts, src/state/__tests__/auth.test.ts, src/lib/__tests__/login-api.test.ts, package.json, package-lock.json, tsconfig.json, CLAUDE.md, docs/ai/HANDOFF.md, docs/ai/sessions/2026-09-27-alerts-root-cause-protocol-library-handoff.md, docs/ai/sessions/2026-11-10-issue-2-auth-tests-hydrate-fix-handoff.md

## Verification status
tests: 20/20 on this branch (the only suites on `main`)  tsc: clean  lint: clean on the changed files (`npx eslint src/state src/lib/__tests__`)  review: none  qa: real Android phone, offline cold launch as guest and as admin (see above); the fix itself is tests-only

## Resume with
/uexel:orient   (then: gh pr view --repo uExel/cryohealth-app, or issue #3)
