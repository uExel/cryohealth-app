# HANDOFF — CryoHealth-app — 2026-09-27
Session: offline-sync-hardening  Model: claude-opus-5-5  Branch: main  Goal: #1  Task: none (ad-hoc, not issue-tracked)
Prior session archived: docs/ai/sessions/2026-09-24-alerts-protocols-field-report-handoff.md

## State
Four offline-sync defects fixed in the working tree. **Uncommitted, not pushed, no new
EAS build.** Build #8 (commit 959276c, the prior session's fixes) finished 2026-09-24,
and the prior handoff says it still needed a manual `eas submit`. This session didn't
check whether it was submitted. Its Settings → "Local data" counts are still the
deciding check for the open "recent alerts not showing" report — these fixes don't
close that report.

Production API (`https://api.cryohealth.io`, from eas.json's production/preview env)
verified live 2026-09-27: /health 200, /lakes 200 (6), /alerts 200 (10), /protocols 200
(11), POST /cases 401 without a token, POST /auth/login 401 with bad creds.

## Done this session
- `src/lib/api-client.ts`: 30s AbortController timeout covering the whole request and
  body read (RN Android OkHttp has connect/read/write timeouts of 0, so one stalled
  request held `syncInFlight` forever and every later sync silently no-oped). A 401
  now logs out only if the request carried a token. Before this, a wrong PIN called
  logout() and showed "Session expired". Error messages are pulled from NestJS's
  `{message}` body.
- `src/lib/sync.ts`: `pushQueuedCases` skips when there's no session and stops the loop
  on 401/403. Added an AppState "active" listener that triggers sync on foreground (iOS
  suspends JS timers, and NetInfo doesn't re-fire on resume).
- `src/app/_layout.tsx`: the sync engine starts only after `hydrate()` settles
  (`.finally`). Before this, NetInfo's immediate first event raced hydrate: queued
  cases were pushed with no token, got a 401, and the stored session was wiped.
- `src/app/login.tsx`: a successful login runs sync right away, so cases queued while
  logged out push immediately instead of waiting for the next trigger.
- Ruled out: the React Compiler / stale-array-reference theory for the alerts symptom.
  WatermelonDB's subscribeToSimpleQuery emits `matchingRecords.slice(0)`, a fresh
  array every time.
- typecheck clean. lint: only the pre-existing `src/app/alert/[id].tsx:28` error.
  madge: no cycles.

## Next action
Get the user's go-ahead to commit + push. Then `eas build --platform ios --profile
production --non-interactive` and, as a separate step, `eas submit --platform ios
--latest --non-interactive`. On device: check that a wrong PIN shows "Wrong ID or PIN",
that a logged-in CHW stays logged in after a cold start with queued cases, and that
reopening the app refreshes alerts right away.

## Open questions for a human
- The build #8 Settings "Local data" counts (lakes/alerts/protocols) are still needed
  to resolve the alerts-not-showing report (see the archived handoff).

## Failed approaches (do not retry)
- See the archived handoff. Also: stale-array emission from WatermelonDB under React
  Compiler, which was ruled out from the library source.

## Files touched
src/lib/api-client.ts, src/lib/sync.ts, src/app/_layout.tsx, src/app/login.tsx, CLAUDE.md, docs/ai/HANDOFF.md

## Verification status
tests: n/a (no runner)  review: typecheck + lint clean (pre-existing error only)
qa: not on device yet

## Resume with
/uexel:orient
