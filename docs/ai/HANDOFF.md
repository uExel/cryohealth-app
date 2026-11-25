# HANDOFF — CryoHealth-app — 2026-11-23
Session: audit-open-issues-hydrate-fix  Model: claude-sonnet-5-5  Branch: fix/issue-2-hydrate-never-stuck-loading  Goal: #1  Task: #2 (remaining slice: hydrate hardening)
Prior session archived: docs/ai/sessions/2026-09-27-alerts-root-cause-protocol-library-handoff.md

## State
Audited the four open issues against `origin/main` (01527f1). One confirmed code defect, fixed on
this branch: `hydrate()` in `src/state/auth.ts` could reject and leave `status` on `'loading'`.

Reproduced on `main` by loading the real `auth.ts` with a mocked `expo-secure-store`: a saved
identity that is not JSON, is JSON `null`, or a keystore read that throws all made `hydrate()`
reject with `status` still `'loading'`. Impact is low, which is why it was not a crash: the splash
(`src/app/index.tsx`) is a fixed 1.8 s timer, `_layout.tsx` catches the rejection, and the app
treats `'loading'` like a guest. But nothing could tell "still reading" from "gave up", and an
unknown role or missing name was accepted as an authenticated session.

The fix: `hydrate()` never rejects. A keystore read error or a saved login that is not JSON, not an
object, has a role outside the four API roles, or has no name all end as `guest`. Nothing is
deleted from SecureStore, so a transient read failure does not cost the user their session.

## Issue audit (no issue closed)
- #2: mostly built (WatermelonDB offline store, JWT auth). This PR is the remaining defect. Its
  verification command `npm test` still does not exist on `main`; adding jest is deliberately NOT
  in this PR, because `shabir_dev` already carries the jest setup and a second copy would conflict.
- #5: code is done on `main` (`GUIDANCE` removed, protocols synced, CHW protocol library).
  Stays open: `COMPLAINT_TO_SLUG` is empty until a clinician maps the 4 complaints to the 11
  production protocols. Not for an LLM to author.
- #3: research spike, needs a real 4 GB phone and a go/no-go scorecard. Not a code fix.
- #1: umbrella goal, needs devices and clinician sign-off.
- PR #4 (settings for android, by another contributor) is conflicting and stale. Not touched.

## Done this session
- `src/state/auth.ts`: `parseIdentity()` plus a `hydrate()` that always settles on `authenticated`
  or `guest`. The role list is now one `ROLES` const, and `Role` is derived from it (same type).
- Archived the previous handoff under `docs/ai/sessions/`.

## Not done / deferred
- No regression test is committed: there is no test runner on `main` and adding one is out of
  scope here. The check below was a throwaway script, not part of the repo.
- Not run on a device or emulator (none attached). Bundle compile only.
- Closed PR #8 solved the same bug and added jest; it was closed unmerged on 2026-11-12. This PR
  takes only its `auth.ts` slice.

## Next action
Review and merge this PR. If a test runner lands on `main` (via `shabir_dev`), add `hydrate()`
cases for the 12 inputs listed under Verification status.

## Open questions for a human
- Which production protocol slug answers each COMMON_COMPLAINT (esp. diarrhoea plan A/B/C)? — blocking: no (#5)
- Should `npm test` be added to `main` separately, or only through `shabir_dev`? — blocking: no

## Failed approaches (do not retry)
- none this session. (Earlier, in the archived handoffs: enabling class-properties globally in
  babel.config.js breaks the bundle.)

## Loops run
- none

## Files touched
src/state/auth.ts, docs/ai/HANDOFF.md,
docs/ai/sessions/2026-09-27-alerts-root-cause-protocol-library-handoff.md

## Verification status
tests: n/a (no runner). Runtime repro of the real `auth.ts` with a mocked SecureStore, 12 inputs:
nothing saved, valid chw, valid admin, token without identity, identity without token, not JSON,
JSON null, array, unknown role, missing name, empty name, keystore throws. On `main`, three of
them (not JSON, JSON null, keystore throws) reject and leave `status='loading'`. On this branch all
12 resolve, the two valid ones to `authenticated` and the other ten to `guest`.
review: `tsc --noEmit` 0 errors; `expo lint` 0 errors (the 1 existing `styles.ts` warning remains);
`expo export --platform android` bundles (3591 modules)

## Resume with
/uexel:orient   (then: review this PR, or #5 for the complaint mapping)
