# HANDOFF — CryoHealth-app — 2026-11-25
Session: shabir-dev-to-main  Model: claude-sonnet-5-5  Branch: chore/jest-clean-exit  Goal: #1  Task: #2 (remaining: airplane-mode device check)
Prior session archived: docs/ai/sessions/2026-11-25-issue-2-auth-login-tests-handoff.md

## State
This PR brings `shabir_dev` into `main`: Android FCM push notifications with release signing, unread
alert highlighting and the unread-critical badge, the 2.1.0 release bump, the jest setup, and the
auth and login tests from #10. `main` already has the `hydrate()` fix (#9, merge commit 8ff2a2f),
so `auth.ts` is identical on both sides.

It is opened from `chore/jest-clean-exit` (cut from `shabir_dev`) rather than from `shabir_dev`
itself, so the tidy-up commit does not land on a branch another developer pushes to.

Issue #2 stays open: the airplane-mode cold launch on a real 2-4 GB phone has not been done.

## Done this session
- Merged #9 into `main` and #10 into `shabir_dev`, each after an independent verifier (not the
  author) ran it: PASS and PASS+NOTES. Both merges used `--match-head-commit`.
- Deleted the merged branches `fix/issue-2-hydrate-never-stuck-loading` and `test/2-auth-login-tests`
  (local and origin). Left alone: `fix/2-auth-hydrate-and-tests` (#8, closed unmerged),
  `fix/issue-2-push-routing-integration` (#7, closed unmerged, 3 commits found nowhere else),
  `shoaib_android` (#4), `store-assets`.
- Traced and fixed Jest's "worker process has failed to exit gracefully". Cause: WatermelonDB turns
  Loki autosave on by default (`autosave: true, autosaveInterval: 500`, a `setInterval` it never
  clears and the adapter has no close). `alert-state.test.ts` builds a real in-memory Loki database,
  so every parallel run kept a worker alive. Fix: `extraLokiOptions: { autosave: false }` in that
  test's adapter. Test-only; the app's own database setup is unchanged.
- Tightened the login timeout test: it now asserts the request is still pending at 29.999 s. A
  15 s or 31 s timeout in `api-client.ts` now fails it (before, 15 s passed).

## Not done / deferred
- Airplane-mode cold launch on a real device (#2). No device attached.
- #1: IMCI triage engine, Urdu and RTL, clinical advisor sign-off, field test. #5: complaint to
  protocol mapping needs a clinician. #3: Urdu benchmark spike.
- FCM push, release signing and the 2.1.0 build have not been run on a device this session.

## Next action
A human reviews and confirms the merge of this PR into `main`. Then pick #1 (triage engine or Urdu
and RTL) or the airplane-mode check for #2.

## Open questions for a human
- `google-services.json` (Firebase Android client config, includes an `api_key`) is committed. Is the
  key restricted to this app's package name and signing certificate in the Google Cloud console? — blocking: no
- Which production protocol slug answers each COMMON_COMPLAINT (esp. diarrhoea plan A/B/C)? — blocking: no (#5)

## Failed approaches (do not retry)
- `jest --detectOpenHandles` on `alert-state.test.ts` hangs instead of reporting (the leaked interval
  is the thing keeping it alive). Bisect by running each suite beside a clean partner with
  `--maxWorkers=2` instead.

## Loops run
- none

## Files touched
src/lib/__tests__/alert-state.test.ts, src/lib/__tests__/login-api.test.ts, docs/ai/HANDOFF.md,
docs/ai/sessions/2026-11-25-issue-2-auth-login-tests-handoff.md

## Verification status
tests: `npm test` 6 suites, 46 tests pass, twice, with no worker-exit warning. Mutations of the
login timeout (15 s, 31 s) now fail the timeout test.
review: `tsc --noEmit` 0 errors; `expo lint` 0 errors (the 1 existing `src/design/styles.ts` warning remains)
qa: not run on a device or emulator

## Resume with
/uexel:orient   (then: #1 triage engine or Urdu/RTL, or the airplane-mode check for #2)
