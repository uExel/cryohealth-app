# HANDOFF — CryoHealth-app — 2026-11-25
Session: urdu-rtl-public-path  Model: claude-sonnet-5-5  Branch: feat/1-urdu-rtl-public-path  Goal: #1  Task: #1 (Urdu and RTL, scope A: the public hazard path)
Prior session archived: docs/ai/sessions/2026-11-25-shabir-dev-to-main-handoff.md

## State
The public hazard path can run in Urdu, right-to-left, switching live with no restart: home, lakes,
alerts, alert detail, the critical screen, splash, welcome, notification permission, battery
prompt, settings, and the shared chrome (app bar, sync banner, SOS sheet, tab bar, tier badge,
freshness row, alert card). The language is remembered in SecureStore; with nothing saved it
follows the phone (Urdu if the locale starts with `ur`). #1 stays open: this is one slice of it.

The health-worker screens (Health, Case, Guidance, Login) are NOT translated. They are wrapped in
`EnglishOnly`, so their content stays English and left-to-right while the app bar, banner, SOS
sheet and tab bar around them follow the language. A test requires every route to either use
`tr()` or be wrapped in `EnglishOnly`.

## Done this session
- `src/lib/strings.ts`: English and Urdu interface text, 116 keys. The Urdu is typed against
  the English, and tests enforce the same keys, the same `{placeholders}`, Arabic script, Urdu
  digits (no ASCII 0-9), and no dosing or diagnosis units. Interface labels only.
- `src/lib/i18n.ts`, `lang-store.ts`, `format.ts`: language from locale, saved choice, Urdu digits
  and grouping, bilingual `relativeTime`, `tierLabel`.
- `src/state/app.tsx`: `lang` persists, plus `tr`, `rtl`, `LayoutDirection` and `directionStyle`.
- `src/design/theme.ts`, `styles.ts`: dated patches. An Urdu type scale (Nastaliq, about double
  leading, no tracking) swapped in through `ThemeProvider lang`; ten lines of physical left/right
  styling became start/end or `textAlign: 'auto'`. Each is marked `rtl:`.
- Fixed a latent bug: Urdu text on Home, Lakes and Alert detail was rendered in the English type
  scale. `typeUrdu` was only ever used on the critical screen.
- Tests: 120 tests in 11 suites (was 46). Guards: no `left`/`right` style in `app/` or
  `components/` or the shared sheet, and the route rule above. Each guard was mutation-checked.

## Not done / deferred
- NOT run on a device or emulator. Everything about layout is unverified: that `direction: 'rtl'`
  mirrors rows and text alignment on Android as expected, that the SOS `Modal` mirrors, that
  Nastaliq is not clipped in the fixed 56 dp app bar (title plus subtitle) or the tab bar, that
  the critical screen reads well, and that the chevrons point the right way. See the PR checklist.
- Urdu strings are a draft for a native speaker. Two changes to wording the team already had:
  "Most at-risk lakes" is now "سب سے زیادہ خطرے والی جھیلیں" (it said "nearby lakes under watch"),
  and "stale" is now "پرانا" (it said "باسی", which means stale food).
- Health-worker screens (Health, Case, Guidance, Login) and the protocol library: next PR.
- Content that comes from the API stays as sent: alert titles, chips, checklists, area summaries,
  and protocol text have no Urdu fields. Only lake names and alert bodies do. `oemBatteryHint()`
  text is English. A backend change is needed before those can be Urdu.
- `CLAUDE.md` still describes the Acknowledge button, which was removed earlier. Stale, not fixed.

## Next action
Check the PR's device checklist on a real phone in both languages. Then the health-worker screens.

## Open questions for a human
- Who reviews the Urdu strings in `src/lib/strings.ts`? — blocking: no, but before a release
- Should the backend add Urdu for alert titles, chips and checklists? — blocking: no (#1)
- Is the draft "ابھی نہیں — ہر صبح خود دیکھ لوں گا/گی" (gender-neutral with a slash) acceptable? — blocking: no

## Failed approaches (do not retry)
- Wrapping a whole route in the English theme also put the app bar, banner and SOS sheet (which carry
  Urdu text) in English type, and made the language toggle a no-op. `EnglishOnly` now applies only to
  the content inside `Chromed` / `BareScreen`.
- `jest --detectOpenHandles` hangs on any suite with a Loki database (see the prior handoff).

## Loops run
- none

## Files touched
src/lib/{i18n,strings,lang-store,format}.ts, src/state/app.tsx, src/design/{theme,styles}.ts,
src/components/{chrome,hazard,guidance,english-only}.tsx, src/app/{_layout,index,welcome,permission,
battery,critical,login}.tsx, src/app/(tabs)/{_layout,home,map,alerts,settings,health,case,guidance,
alert/[id]}.tsx, tests under src/lib/__tests__ and src/design/__tests__, CLAUDE.md, docs/ai/HANDOFF.md,
docs/ai/sessions/2026-11-25-shabir-dev-to-main-handoff.md

## Verification status
tests: `npm test` 11 suites, 120 tests pass, no worker-exit warning. Mutations that now fail a test:
`paddingRight` in a screen, `marginLeft` in `styles.ts`, an ASCII digit in an Urdu string, tracking in
the Urdu type, and removing `EnglishOnly` from a route.
review: `tsc --noEmit` 0 errors; `expo lint` 0 errors (the 1 existing `src/design/styles.ts` warning remains);
`expo export --platform android` bundles
qa: not run on a device or emulator

## Resume with
/uexel:orient   (then: device check of the Urdu public path, or the health-worker screens)
