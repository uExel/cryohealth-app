# HANDOFF — CryoHealth-app — 2026-09-24 13:50 PKT
Session: alerts-protocols-field-report  Model: claude-sonnet-5  Branch: main  Goal: #1  Task: none (ad-hoc field report, not issue-tracked)

## State
User field report: "can't sync protocols/guidance, recent alerts aren't showing" on
TestFlight build 7 (fresh install). Split into two separate findings:

- **Protocols/Guidance is not a bug.** `guidance.tsx` returns `NoMatch` before any
  WatermelonDB read whenever `resolveComplaintSlug` misses, and `COMPLAINT_TO_SLUG` is
  `{}` (intentional, see `cryohealth-app#5`). This is the known clinician-content-gap,
  unrelated to sync. No code change needed here; already tracked on #5.
- **Alerts is real and still unresolved as a root cause**, though two genuine defects
  found during the investigation are now fixed (commit `959276c`, pushed to
  `origin/main`): `runSync` no longer skips `pullProtocols` when `pullLakesAndAlerts`
  throws (each pull is now isolated, matching the isolation `pullProtocols` already
  had), and the sync banner's "SYNC NOW" retry button now actually calls `runSync`
  instead of only flipping the displayed label. Also added a live "Local data" row count
  (lakes/alerts/protocols) to Settings so the next field report can be checked against
  the real local table instead of guessed at from the rendered fallback text, which
  looks identical whether a table is empty or has rows the screen isn't displaying.
- Ruled out for the alerts symptom (see Failed approaches): API health, build identity/
  env var, HTTP caching, the v2->v3 migration (fresh install), and WatermelonDB's
  `@json` decorator (read library source, it's defensive, cannot throw). No surviving
  mechanism found for "lakes populated, alerts empty" from the single atomic batch
  `pullLakesAndAlerts` writes both tables in -- the live hypothesis is that the
  WatermelonDB observable on the `alerts` table isn't emitting on this device, not that
  the table is actually empty. Untested.
- Production build #8 was triggered this session (`eas build --platform ios --profile
  production --non-interactive`) to get the two fixes + the new Settings diagnostic
  onto a real device. Status at session end: **unconfirmed** -- see Next action.

## Done this session
- `src/lib/sync.ts`: isolated `pullLakesAndAlerts` failures from `pullProtocols` (own
  try/catch, `net` still reports "failed" if lakes/alerts specifically failed).
- `src/components/chrome.tsx`: `SyncBanner`'s retry button now calls `runSync(setNet)`
  instead of only `setNet('syncing')`.
- `src/app/settings.tsx`: added a "Local data" section (`ObservedSyncCounts`,
  `withObservables` on all three read-through caches) showing live synced row counts.
- Verified no import cycle introduced (`npx madge --circular` on the entry point and on
  the two touched files) before committing -- `chrome.tsx` now imports `runSync` from
  `lib/sync.ts`, which was the one real risk in this change.
- `npm run typecheck` and `npm run lint` both clean except the pre-existing, unrelated
  `src/app/alert/[id].tsx:28` failure noted in earlier sessions.
- Committed (`959276c`) and pushed to `origin/main`.
- Triggered `eas build --platform ios --profile production --non-interactive` in the
  background (task id `bbmm6bjy2`); output file was still empty (buffered CLI spinner)
  when this session ended.

## Not done / deferred
- **Confirming build #8 finished and submitting it to TestFlight** — `eas submit
  --platform ios --latest --non-interactive` needs to run once the build completes; per
  prior sessions' finding, `--auto-submit` fails non-interactively, run submit as its
  own step.
- **Confirming the actual root cause of the alerts symptom** — the Settings row-count
  diagnostic needs a real device read once build #8 is installed: if "Alerts: 0 synced"
  matches the empty screen, the table really is empty (fetch-shape or field-write bug,
  still unexplained); if it shows "Alerts: 10 synced" while the Alerts tab still says
  "No alerts yet", the bug is in the `withObservables` read path on `alerts.tsx`/
  `home.tsx`, not in sync at all. This is the decisive next check.
- Real complaint -> production-protocol-slug mapping (issue #5's still-open clinician/PM
  item) — unrelated to this session's findings, not re-attempted.

## Next action
Check `eas build:list --limit 1` (or the background task) for build #8's status; once
finished, run `eas submit --platform ios --latest --non-interactive` from this repo,
then ask the user to open Settings on the new build and report the three "Local data"
counts alongside what the Alerts tab and Home advisory line show.

## Open questions for a human
- Once build #8's Settings counts are read: if alerts count is >0 while the Alerts tab
  is still empty, this needs someone who can attach a debugger/Xcode console to the
  device to trace why the `withObservables` query on `alerts.tsx` isn't emitting —
  not blocking anything else, but blocking full resolution of this field report.

## Failed approaches (do not retry)
- Assuming the alerts symptom was an HTTP-caching bug (NSURLSession serving a stale
  cached body for `/alerts` or `/protocols`) — disproven by the data's own timestamps:
  `/alerts` has had rows since 2026-08-09 and `/protocols` since 2026-09-11, both well
  before build #7 (submitted 2026-09-23) could have cached anything empty.
  `pullProtocols` itself didn't exist before 2026-09-22, so no stale protocols-cache
  entry can predate build #7 either.
- Assuming the v2->v3 WatermelonDB migration was untested and therefore suspect —
  disproven once the user confirmed build 7 was a fresh install (no earlier local DB
  existed for a migration to run against).
- Assuming a dashboard-configured EAS environment variable was shadowing `eas.json`'s
  inline `EXPO_PUBLIC_API_URL` — `eas env:list --environment production` returned no
  variables; ruled out.
- Suspecting WatermelonDB's `@json` decorator (used for `chips`/`checklist`, both
  `null` on every production alert) could throw on read and silently empty the
  `alerts` observable — read the actual decorator source
  (`node_modules/@nozbe/watermelondb/src/decorators/json/index.js`): `parseJSON` is
  wrapped in try/catch and the setter writes `null` when the sanitizer returns
  `undefined`. Cannot throw. Don't re-chase this.
- Treating "No stored protocol for this yet" on Guidance as evidence protocol sync is
  broken — `guidance.tsx` returns `NoMatch` before touching WatermelonDB whenever the
  complaint->slug map misses, which it always does right now (`COMPLAINT_TO_SLUG` is
  `{}`). This screen is diagnostically dead for sync issues; don't use it to reason
  about whether `pullProtocols` ran.

## Loops run
- none this session (single investigation + targeted fix, not a build/verify loop)

## Files touched
This session: `src/lib/sync.ts`, `src/components/chrome.tsx`, `src/app/settings.tsx`
(commit `959276c`, pushed). Docs: `docs/ai/HANDOFF.md`,
`docs/ai/sessions/2026-09-23-task5-device-slugfix-handoff.md` (archived prior HANDOFF,
renamed to match its actual session date/slug rather than today's).

## Verification status
tests: n/a (no test runner in this repo)  review: clean (typecheck + lint, both files;
one pre-existing unrelated lint failure noted, not touched)  qa: not yet done on
device — build #8 pending, see Next action

## Resume with
/uexel:orient   (then: check build #8 status, submit to TestFlight, get the Settings
"Local data" counts from the user to resolve the alerts hypothesis)
