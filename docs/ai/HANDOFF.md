# HANDOFF — cryohealth-app — 2026-08-09 13:16 PKT
Session: testflight-submission-setup  Model: claude-sonnet-5  Branch: main  Goal: none  Task: none (ad hoc)

## State
iOS TestFlight submission was already set up in a 2026-08-03 session (app.json
bundleIdentifier, eas.json build profiles, EAS project link, ASC app ID) and a 1.0.0
build 2 had already shipped. This session picked up on a fresh machine with no prior
`.p8`/EAS login state. Shaan supplied a new App Store Connect API key
(`AuthKey_MSSQV8JS2P.p8`) by dropping it in the repo root — moved to
`~/.appstoreconnect/private_keys/` (chmod 600, was already gitignored and never staged,
so nothing leaked to git). `EXPO_ASC_API_KEY_PATH` set in `~/.zshrc` to point at it.
`eas.json`'s `ascApiKeyId` updated from the old `9S38M2924M` to `MSSQV8JS2P` (same team,
confirmed by Shaan, so `ascApiKeyIssuerId` left unchanged). Also caught and fixed a real
blocker before any build: `eas.json`'s production/preview profiles had no
`EXPO_PUBLIC_API_URL`, and `.env` isn't committed, so a build made as-is would have
shipped baked to `localhost:3000` and shown nothing on a real device. Confirmed
`CryoHealth-api` is live at `https://api.cryohealth.io` (curled `/health`, got 200) and
pinned that into both profiles. Committed as `d1dae36`. Shaan then ran (or is running)
`eas credentials --platform ios`, `eas build --platform ios --profile production`, and
`eas submit --platform ios --latest --non-interactive` interactively — outcome not yet
reported back in this session (no command output shared), so unverified whether the
build succeeded, whether the Aug-3 Distribution Cert/Provisioning Profile were reused
without regeneration, and whether the non-interactive submit worked with the rotated key.

## Done this session
- Moved `AuthKey_MSSQV8JS2P.p8` out of the repo to `~/.appstoreconnect/private_keys/`
  (chmod 600)
- Set `EXPO_ASC_API_KEY_PATH` in `~/.zshrc`
- `eas.json`: rotated `ascApiKeyId` to `MSSQV8JS2P`; added
  `EXPO_PUBLIC_API_URL=https://api.cryohealth.io` to `build.preview.env` and
  `build.production.env` (commit `d1dae36`)
- Ran `graphify update .`

## Not done / deferred
- Verifying the actual `eas build`/`eas submit` outcome — commands were handed to Shaan
  to run interactively (Apple ID auth, cert/profile access aren't things this agent can
  do), and no output has been reported back yet
- Adding TestFlight testers (internal/external) — manual App Store Connect step, no CLI
  equivalent, not attempted
- `eas credentials --platform ios` output (whether the Aug-3 cert/provisioning profile
  are still valid vs. need regeneration) not reviewed

## Next action
Check back with Shaan on the result of `eas build --platform ios --profile production`
and `eas submit --platform ios --latest --non-interactive` — if the submit succeeded,
confirm the new build shows up in App Store Connect under TestFlight; if it failed,
read the actual error output before guessing at a fix.

## Open questions for a human
- Did `eas credentials --platform ios` show the existing `com.uexel.cryohealth`
  Distribution Cert/Provisioning Profile as still valid, or did EAS need to regenerate
  them? — blocking: no
- Did the non-interactive submit with the rotated ASC key (`MSSQV8JS2P`) succeed, or did
  it fall back to an interactive Apple ID prompt? — blocking: no

## Failed approaches (do not retry)
- none this session

## Loops run
- none (ad hoc, no /uexel:plan → /uexel:build loop)

## Files touched
eas.json, ~/.zshrc (outside repo), ~/.appstoreconnect/private_keys/AuthKey_MSSQV8JS2P.p8
(outside repo, moved not created), docs/ai/HANDOFF.md,
docs/ai/sessions/2026-08-08-live-data-wiring-handoff.md (archived from HANDOFF.md)

## Verification status
tests: none run this session (no source code changed)  review: n/a  qa: not run —
build/submit outcome unconfirmed  commit: `d1dae36`

## Resume with
/uexel:orient   (then: get the eas build/submit output from Shaan and confirm the
TestFlight build is live, or debug the actual failure if it errored)
