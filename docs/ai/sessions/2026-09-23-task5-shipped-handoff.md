# HANDOFF — CryoHealth-app — 2026-09-23 PKT
Session: task5-testflight  Model: claude-sonnet-5  Branch: main  Goal: #1  Task: #5

## State
**Task #5 shipped, and the long-standing "EAS build/submit unconfirmed since 2026-08-09"
question is finally resolved: it works.** While investigating, found that a prior
session's production build (#6, commit `b0fb16d1`, the WatermelonDB decorator fix) had
actually **already finished and been submitted successfully back on 2026-08-09** — every
session since then just never checked back on it and kept carrying it as "unconfirmed."
This session triggered a fresh build (#7) at current `main` (includes all of today's
protocols work), which finished cleanly, and submitted it to TestFlight successfully:
"Submitted your app to Apple App Store Connect!" Apple's own processing (usually 5-10
min) happens server-side from here — no further local action needed for the upload
itself.

## Done this session
- `eas build --platform ios --profile production --non-interactive --auto-submit` —
  build succeeded (build #7, buildNumber auto-incremented 6→7); `--auto-submit` itself
  failed (see Failed approaches) but the build completed regardless.
- `eas submit --platform ios --latest --non-interactive` (standalone, after the build
  finished) — required a local fix (see below), then succeeded. Submission ID
  `9428bc5c-3798-41ff-86fd-75ab2524ecfb`, build #7, commit `0419c6d`.
- Local-only, uncommitted fix to unblock non-interactive submit: `eas.json`'s
  `submit.production.ios` had `ascApiKeyId`/`ascApiKeyIssuerId` but no `ascApiKeyPath` —
  EAS CLI requires all three together for non-interactive mode, and doesn't fall back to
  the `EXPO_ASC_API_KEY_PATH` env var (confirmed present, `.appstoreconnect/private_keys/
  AuthKey_MSSQV8JS2P.p8` exists locally at `~/.appstoreconnect/private_keys/`) in that
  code path. Added `ascApiKeyPath` pointing at the local file, ran the submit, then
  `git checkout -- eas.json` to revert — **never committed**, since that path is
  machine-specific and would break for any other developer/CI.

## Not done / deferred
- Confirming the build actually appears/installs in TestFlight for a real tester —
  Apple's post-upload processing (usually 5-10 min, can vary) wasn't watched to
  completion this session; check
  https://appstoreconnect.apple.com/apps/6797512420/testflight/ios
- Adding TestFlight testers — still not attempted, unrelated
- Real `steps` content for the 11 production protocols — explicitly deferred to a human
  clinician/PM authoring pass (see task #5's own history)
- Step 8 (airplane-mode device proof) — still a disclosed gap, no device/emulator in
  this environment

## Next action
Check https://appstoreconnect.apple.com/apps/6797512420/testflight/ios (or wait for
Apple's processing email) to confirm build #7 actually shows up as installable in
TestFlight, then add/notify testers if it's not automatic.

## Open questions for a human
- none blocking

## Failed approaches (do not retry)
- `eas build --auto-submit` in one command, non-interactively — the auto-submit step
  fails with "ascApiKeyPath, ascApiKeyIssuerId and ascApiKeyId must all be defined in
  eas.json" even with the env var set; the build itself still completes fine, but run
  `eas submit` as a separate step afterward rather than relying on `--auto-submit`
  working end-to-end non-interactively
- Bumping `@nozbe/with-observables` to fix the React 19 peer conflict — no version
  declares React 19 as a peer; `.npmrc` legacy-peer-deps is correct
- Fixing the "Definitely assigned fields" Babel error via `babel.config.js` plugin
  options — the actual fix is removing the `!` from the source fields themselves
- Assuming a triggered `eas build`/`eas submit` is "unconfirmed" forever without ever
  checking back — this is literally what happened for six weeks. `eas build:list` /
  `eas submit:list` take seconds and would have caught the August success immediately.
- Building and fix-looping an entire protocols feature against dev-seeded data without
  checking what's actually in production first — root cause of #5's escalation earlier
  this session (unrelated to TestFlight, noted here for continuity)

## Loops run
- none this session (TestFlight work was operational, not a build/verify loop)

## Files touched
This session: none committed (the `eas.json` credential path was local-only and
reverted). Docs: `docs/ai/HANDOFF.md`,
`docs/ai/sessions/2026-09-22-task5-shipped-handoff.md` (new, archived).

## Verification status
Build #7: finished successfully on EAS infrastructure. Submission: "Submitted your app
to Apple App Store Connect!" (EAS CLI's own success confirmation). Apple-side processing
completion: **not directly observed** — confirm via App Store Connect or the processing
email before telling anyone testers can install it.

## Resume with
/uexel:orient   (then: check App Store Connect for build #7's TestFlight processing
status, add testers if needed)
