# HANDOFF — CryoHealth-app — 2026-11-25
Session: issue-2-auth-login-tests  Model: claude-sonnet-5-5  Branch: test/2-auth-login-tests  Goal: #1  Task: #2 (remaining slice: `npm test` coverage for auth + login)
Prior session archived: docs/ai/sessions/2026-11-23-audit-open-issues-hydrate-fix-handoff.md

## State
PR #9 (the `hydrate()` fix) is merged into `main` (merge commit 8ff2a2f). This branch is
`shabir_dev` plus a merge of `origin/main`, plus two test files and a `CLAUDE.md` line. It targets
`shabir_dev`, not `main`, because the jest setup exists only on `shabir_dev` (inside the push
notification commit a4dc1be). `npm test` reaches `main` when `shabir_dev` lands.

Issue #2 stays open: the airplane-mode cold launch on a real 2-4 GB phone has not been done.

## Done this session
- Merged #9 after an independent verifier (not the author) ran the real `auth.ts` against 12 saved
  logins on `main` and on the PR head: PASS. Merge used `--match-head-commit`.
- `src/state/__tests__/auth.test.ts` (13 cases for `hydrate()`/`setSession`/`logout`) and
  `src/lib/__tests__/login-api.test.ts` (login success, wrong password, no internet, 500, the 30 s
  timeout, and a 401 on a token-carrying request logging the user out).
- Confirmed the auth tests are real: against the pre-#9 `auth.ts`, 5 of 13 fail; against #9, all pass.
- `CLAUDE.md` now says `npm test` runs Jest, replacing "No test script defined".

## Not done / deferred
- Airplane-mode cold launch on a real device (the remaining #2 criterion). No device attached.
- `npm test` is not on `main` yet; it needs `shabir_dev` to land, or a separate PR that extracts the
  jest config. Decision for a human, below.
- Jest prints "A worker process has failed to exit gracefully". Cause not traced.

## Next action
Merge this PR into `shabir_dev`. Then run the airplane-mode check on a phone and close #2.

## Open questions for a human
- Land `shabir_dev` into `main` as is, or extract the jest setup into its own PR? — blocking: no
- Which production protocol slug answers each COMMON_COMPLAINT (esp. diarrhoea plan A/B/C)? — blocking: no (#5)

## Failed approaches (do not retry)
- none this session.

## Loops run
- none

## Files touched
src/state/__tests__/auth.test.ts, src/lib/__tests__/login-api.test.ts, CLAUDE.md, docs/ai/HANDOFF.md,
docs/ai/sessions/2026-11-23-audit-open-issues-hydrate-fix-handoff.md

## Verification status
tests: `npm test` 6 suites, 46 tests pass (jest-expo/android)
review: `tsc --noEmit` 0 errors; `expo lint` 0 errors (the 1 existing `src/design/styles.ts` warning remains)
qa: not run on a device or emulator

## Resume with
/uexel:orient   (then: the airplane-mode check for #2, or #5 for the complaint mapping)
