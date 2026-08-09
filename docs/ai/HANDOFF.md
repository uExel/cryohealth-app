# HANDOFF — cryohealth-app — 2026-08-09 14:50 PKT
Session: testflight-submission-setup  Model: claude-sonnet-5  Branch: main  Goal: none  Task: none (ad hoc)

## State
Continuing the same TestFlight setup session (see the two archived handoffs in
`docs/ai/sessions/2026-08-09-testflight-submission-setup*-handoff.md` for the ASC API
key rotation + `EXPO_PUBLIC_API_URL` fix, and the `.npmrc` legacy-peer-deps fix, that
happened earlier today). After the `npm ci` fix, `eas build --platform ios --profile
production --non-interactive` got past dependency install but failed at the JS bundling
step: `expo export:embed --eager --platform ios --dev false` errored on every
WatermelonDB model file (`AlertModel.ts`, `LakeModel.ts`, `ChwCaseModel.ts`) with
"Definitely assigned fields cannot be initialized here, but only in the constructor".
Reproduced locally by running the exact same `expo export:embed` command EAS Build runs
— confirmed root cause: Babel's TypeScript transform (via the legacy decorators plugin
`babel-preset-expo` needs for WatermelonDB's `@field`/`@json`) cannot handle a class
field that has both a decorator and TS's `!` definite-assignment assertion. `tsc
--noEmit` never caught this because it's a Babel-only check — this bug had been latent
since the WatermelonDB models were first added (per the 2026-08-08 handoff, nobody had
actually run a real bundle/build since the live-data wiring work landed, only
`typecheck`). Fixed by removing `!` from all 21 decorated fields across the three model
files and adding `strictPropertyInitialization: false` to `tsconfig.json` (WatermelonDB's
documented TS pattern — decorators populate these fields at runtime, invisible to tsc).
Verified both `npm run typecheck` and a direct `expo export:embed --dev false` succeed
clean locally. Also found and gitignored `credentials.json` (contained a plaintext `.p12`
password) that a prior `eas credentials` run had dropped at the repo root — never
committed, no exposure, but wasn't covered by any existing `.gitignore` pattern.
Committed as `b0fb16d`. Handed the retry back to Shaan —
**`eas build --platform ios --profile production --non-interactive` outcome not yet
confirmed after this fix**, and `eas submit` still hasn't successfully completed this
whole session.

## Done this session
- (carried from earlier today, see archived handoffs) ASC API key rotation, prod API URL
  pin in `eas.json`, `.npmrc` legacy-peer-deps fix for `npm ci`
- Reproduced the EAS Build bundling failure locally via direct `expo export:embed --dev
  false` invocation (same command EAS Build server runs)
- Removed `!` definite-assignment assertions from all WatermelonDB-decorated fields in
  `AlertModel.ts`, `LakeModel.ts`, `ChwCaseModel.ts` (21 fields)
- Added `strictPropertyInitialization: false` to `tsconfig.json`
- Gitignored `credentials.json` and `credentials/` (local EAS credential export left at
  repo root by an earlier `eas credentials` session; contained a `.p12` password,
  never committed)
- Verified `npm run typecheck` and a direct `expo export:embed --dev false` both pass
  clean; committed as `b0fb16d`
- Archived prior HANDOFF to
  `docs/ai/sessions/2026-08-09-testflight-submission-setup-2-handoff.md`

## Not done / deferred
- Confirming `eas build --platform ios --profile production --non-interactive` actually
  completes now (bundling fix applied but not yet verified on EAS's actual servers,
  only reproduced+fixed locally)
- Confirming `eas submit --platform ios --latest --non-interactive` completes with the
  rotated ASC key (`MSSQV8JS2P`) — still open across this entire session, never actually
  reached a successful submit yet
- Adding TestFlight testers — manual App Store Connect step, still not attempted

## Next action
Get the output of Shaan's retried `eas build --platform ios --profile production
--non-interactive`. If it now bundles and completes, follow with `eas submit --platform
ios --latest --non-interactive` and confirm the build lands in App Store Connect under
TestFlight. If it fails again, read the actual new error rather than assuming it's a
repeat of either the `npm ci` or bundling issue already fixed.

## Open questions for a human
- Does the fixed build actually complete end-to-end on EAS's servers? — blocking: no
- Did the non-interactive submit with the rotated ASC key succeed? — blocking: no
  (carried over, still unanswered after three attempts this session)

## Failed approaches (do not retry)
- Bumping `@nozbe/with-observables` to fix the React 19 peer conflict — no version
  supports React 19 as a declared peer; `.npmrc` legacy-peer-deps is correct, not a
  version bump (from earlier today, still valid)
- Do not try to fix the "Definitely assigned fields" Babel error by tweaking
  `babel.config.js` plugin options (e.g. class-properties loose mode) — the actual fix is
  removing the `!` from the source fields themselves; the error is specific to `!` +
  decorator combination, not a plugin config issue

## Loops run
- none (ad hoc, no /uexel:plan → /uexel:build loop)

## Files touched
src/lib/db/models/AlertModel.ts, src/lib/db/models/LakeModel.ts,
src/lib/db/models/ChwCaseModel.ts, tsconfig.json, .gitignore

## Verification status
tests: none run this session (no test runner in scaffold)  review: n/a  qa: `npm run
typecheck` clean; `expo export:embed --dev false` verified clean locally (same command
EAS Build runs); actual EAS Build/submit server outcome still not confirmed  commit:
`b0fb16d`

## Resume with
/uexel:orient   (then: get Shaan's `eas build`/`eas submit` output and confirm the
TestFlight build is live, or debug the actual failure if it still errors)
