# HANDOFF — CryoHealth-app — 2026-09-27 22:16 PKT
Session: alerts-root-cause-protocol-library  Model: claude-opus-5-5  Branch: main  Goal: #1  Task: none (ad-hoc field report; related #5, #6)
Prior session archived: docs/ai/sessions/2026-09-27-offline-sync-hardening-handoff.md

## State
The "alerts / guidance not showing" field report has a confirmed root cause, fixed in
build #10 (on the user's iPhone via TestFlight). Build #10's syslog shows the app launching
with no sync errors. The user has not yet reported Settings "Local data" counts or the
Alerts tab contents on #10. Unconfirmed on device, but no errors.

Root cause: device syslog from build #9 showed every sync failing at the DB write with
`Decorating class property failed. Please ensure that transform-class-properties is
enabled...`. On Hermes, babel-preset-expo leaves class fields native, so legacy WatermelonDB
decorators compiled to `_initializerWarningHelper` calls that throw on model construction.
Lakes, alerts and protocols tables were always empty.

Guidance still looked empty on #10 because `COMPLAINT_TO_SLUG` is intentionally `{}`
(clinical routing, #5). A CHW-only protocol library on the Health tab (`73b0820`) is
committed and pushed but **not built**. It needs build #11, and the user has not yet
approved a build.

## Done this session
- Captured iPhone syslog with `pymobiledevice3 syslog live` (scratch venv). Developer Mode is
  off, so devicectl can't attach, but syslog works over pairing.
- babel.config.js: `@babel/plugin-transform-class-properties` (loose), scoped via
  `overrides` to `src/lib/db/models/`. Global enable breaks RN's PerformanceObserver private
  methods. `test` must be a function because Metro loads the config without a filename.
  Also api-client.ts falls back to `https://api.cryohealth.io` instead of localhost
  (commit 39da4f2)
- Build #10 (EAS 6a7b1cdb-c32a-43d9-b5a8-96ce34f2c59d) submitted to TestFlight (submission
  d7dc3b07-faff-44b9-a7de-2b8b8a2c5d3b); handoff update (commit 0212859)
- Opened cryohealth-app#6: `lakes.updated_at` string column clashes with WatermelonDB's
  reserved numeric timestamp. The dev-build schema invariant throws at load; latent in release.
- Protocol library: `src/components/protocol-library.tsx` + Health tab (CHW mode only),
  grouped by category, opens `/guidance?slug=…` (commit 73b0820)

## Not done / deferred
- Build #11 with the protocol library — waiting on user approval to build/submit
- On-device confirmation of #10 (Local data 6/10/11, Alerts lists 10) — user hasn't reported
- Complaint → slug mapping — clinical decision, needs a human (#5)
- Structured `steps` for the 11 protocols (public mode shows "not available") — content work, API side
- #6 schema migration — separate issue

## Next action
Once the user approves: `npx eas-cli build --platform ios --profile production --non-interactive --no-wait`

## Open questions for a human
- Approve build #11 + TestFlight submit for the protocol library? — blocking: yes (for device check)
- Which production protocol slug answers each COMMON_COMPLAINT (esp. diarrhoea plan A/B/C)? — blocking: no

## Failed approaches (do not retry)
- "withObservables isn't emitting" / "lakes populated, alerts empty". Disproven: all three
  tables were empty, because every prepareCreate threw.
- Enabling class-properties globally in babel.config.js breaks the bundle
  (react-native PerformanceObserver: "Class private methods are not enabled").
- RegExp `test` in babel `overrides`: Metro fails with "Configuration contains string/RegExp
  pattern, but no filename was passed to Babel". Use a function.
- Local simulator Release build: `expo run:ios --device <sim>` stops at "No code signing
  certificates". A direct `xcodebuild -sdk iphonesimulator CODE_SIGNING_ALLOWED=NO` builds,
  but the app won't launch ("UIScene life cycle is required for apps built with this SDK");
  the local ios/ project predates it. Verify on device via TestFlight instead.
- `devicectl device info apps`: fails because Developer Mode is off on the iPhone.

## Loops run
- none

## Files touched
babel.config.js, package.json, package-lock.json, src/lib/api-client.ts,
src/components/protocol-library.tsx, src/app/(tabs)/health.tsx, docs/ai/HANDOFF.md,
docs/ai/sessions/2026-09-27-offline-sync-hardening-handoff.md

## Verification status
tests: n/a (no runner); off-device WatermelonDB/LokiJS harness reproduced the exact device error without the fix and passed with it  review: typecheck clean, lint = pre-existing `alert/[id].tsx:28` only, madge no cycles; `expo export` bundle has 0 warning-helper call sites and uses the production API URL  qa: build #10 syslog clean (no sync errors); protocol library not yet on device

## Resume with
/uexel:orient   (then: get approval → EAS build #11 → submit → capture syslog → confirm Health tab lists 11 protocols and Guidance opens them)
