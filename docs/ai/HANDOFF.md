# HANDOFF — cryohealth-app — 2026-08-09 14:34 PKT
Session: testflight-submission-setup  Model: claude-sonnet-5  Branch: main  Goal: none  Task: none (ad hoc)

## State
Continuing the same TestFlight setup session (see archived
`docs/ai/sessions/2026-08-09-testflight-submission-setup-handoff.md` for the ASC API key
rotation + `EXPO_PUBLIC_API_URL` fix that happened earlier). Shaan ran `eas credentials
--platform ios` and confirmed the App Store Configuration (Distribution Cert +
Provisioning Profile) from the 2026-08-03 setup is still valid (expires Aug 2027) —
he got stuck in an unrelated Ad Hoc device-registration prompt because he'd picked
`eas credentials`'s "All: Set up all the required credentials" option, which also walks
Ad Hoc/dev profiles; advised him to Ctrl+C and skip straight to `eas build`. He then ran
`eas build --platform ios --profile production --non-interactive`, which failed on EAS's
build server: `npm ci --include=dev exited with non-zero code: 1`. Reproduced locally in
a clean `/tmp` copy of `package.json`+`package-lock.json` — root cause:
`@nozbe/with-observables@1.6.0` (WatermelonDB's observable HOC) only declares peer
support for React `^16||^17||^18`, but Expo SDK 57 pins React `19.2.3`; `npm ci` enforces
peer resolution strictly and fails ERESOLVE, while this repo's actual `node_modules` had
only ever been installed via plain `npm install` (more lenient), which is why the
conflict was invisible locally until EAS Build's clean-container `npm ci` hit it. No
newer `with-observables` version exists (1.6.0 is latest, still React 16-18 only) — fix
was `.npmrc` with `legacy-peer-deps=true`, verified with a clean-room `npm ci
--include=dev` (841 packages, exit 0). Committed as `e8512f8`. Handed the retry command
back to Shaan — **not yet confirmed whether the rebuilt production build succeeds or
whether `eas submit --non-interactive` completes** with the rotated ASC key
(`MSSQV8JS2P`, see prior session note).

## Done this session
- Diagnosed `eas credentials` device-registration prompt loop as an unrelated Ad Hoc
  detour, not a bug — advised skipping to `eas build` directly (no code change)
- Reproduced `npm ci --include=dev` ERESOLVE failure locally (React 19 vs.
  `@nozbe/with-observables@1.6.0`'s React 16-18 peer range)
- Added `.npmrc` (`legacy-peer-deps=true`) to unblock `npm ci` on EAS Build's clean
  container; verified with a clean-room `npm ci` (commit `e8512f8`)
- Archived prior HANDOFF to `docs/ai/sessions/2026-08-09-testflight-submission-setup-handoff.md`

## Not done / deferred
- Confirming the rebuilt `eas build --platform ios --profile production --non-interactive`
  actually succeeds past the `npm ci` step now — handed back to Shaan, no output reported
  yet this session
- Confirming `eas submit --platform ios --latest --non-interactive` completes with the
  rotated ASC key (still open from the prior handoff)
- Adding TestFlight testers — manual App Store Connect step, still not attempted

## Next action
Get the output of Shaan's retried `eas build --platform ios --profile production
--non-interactive`. If it now passes `npm ci` and completes, follow with `eas submit
--platform ios --latest --non-interactive` and confirm the build lands in App Store
Connect under TestFlight. If `npm ci` still fails, read the actual new error — don't
assume it's the same React-19 peer conflict.

## Open questions for a human
- Did `.npmrc`'s `legacy-peer-deps=true` fully unblock the EAS Build server, or does the
  build now fail at a later step? — blocking: no
- Did the non-interactive submit with the rotated ASC key (`MSSQV8JS2P`) succeed? —
  blocking: no (carried over from prior handoff, still unanswered)

## Failed approaches (do not retry)
- Bumping `@nozbe/with-observables` to a newer version to fix the React 19 peer conflict
  — checked npm registry, 1.6.0 is latest and still only declares React 16-18 support;
  no version fixes this, `.npmrc` legacy-peer-deps is the correct fix, not a version bump

## Loops run
- none (ad hoc, no /uexel:plan → /uexel:build loop)

## Files touched
.npmrc (new)

## Verification status
tests: none run this session (no source code changed)  review: n/a  qa: `npm ci
--include=dev` verified clean in an isolated `/tmp` copy (841 packages, exit 0); actual
EAS Build server outcome not yet confirmed  commit: `e8512f8`

## Resume with
/uexel:orient   (then: get Shaan's `eas build`/`eas submit` output and confirm the
TestFlight build is live, or debug the actual failure if `npm ci` or a later build step
still errors)
