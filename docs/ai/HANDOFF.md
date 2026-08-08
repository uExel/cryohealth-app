# HANDOFF — cryohealth-app — 2026-08-08 21:15 PKT
Session: live-data-wiring  Model: claude-sonnet-5  Branch: main  Goal: none  Task: none (ad hoc)

## State
Auth/sync plumbing (api-client, WatermelonDB, zustand auth store, sync engine) already
existed uncommitted in the working tree at session start (from a prior Copilot Chat
session) but was silently broken: WatermelonDB's `@field`/`@json` model decorators need
`experimentalDecorators` + a Babel plugin, neither configured — `npm run typecheck` had
24 errors and the app likely couldn't bundle. That's fixed. `case.tsx`'s "Save case
offline" button was a no-op (`router.back()` only) — now writes a real queued
`ChwCaseModel` row and triggers sync. Screens (`home`, `map`, `alerts`,
`alert/[id]`, `critical`) now read live WatermelonDB data via `withObservables` instead
of `src/lib/mock.ts`; mock.ts is still used only by Guidance/Learn/IMCI (intentional —
see CLAUDE.md) and `settings.tsx`'s valley picker (deferred, not safety data). This
required extending CryoHealth-api's `Alert` entity with `chips`/`checklist` columns (new
migration `1786204276808-AlertChipsAndChecklist`, not yet run against a live DB — no
Docker in this environment) and bumping the local WatermelonDB schema to v2 (with a
proper `addColumns` migration, not just a version bump) to carry `nameUr`, `elevationM`,
`bodyUr`, `downstreamSummary`, `windowStart/End`, `chips`, `checklist`. Typecheck is
clean; CryoHealth-api's build + full jest suite (28 tests) pass. Nothing this session has
been committed in either repo — nor was the pre-existing auth/sync work from before this
session.

## Done this session
- Fixed WatermelonDB decorator build config: `tsconfig.json` (`experimentalDecorators`)
  + new `babel.config.js` (`@babel/plugin-proposal-decorators`, legacy mode) — no commit
- Wired `case.tsx` to `ChwCaseModel.create` + `runSync` (was a no-op) — no commit
- Added `src/lib/format.ts` (relativeTime, TIER_LABEL_UR) — no commit
- Rewired `home.tsx`, `map.tsx`, `alerts.tsx`, `alert/[id].tsx`, `critical.tsx` onto live
  WatermelonDB data via `withObservables`; `hazard.tsx`'s `AlertCard` now takes a proper
  `AlertCardData` type instead of importing `Alert` from mock.ts — no commit
- CryoHealth-api (sibling repo): `Alert.chips`/`Alert.checklist` jsonb columns + migration
  + `IssueAlertDto`/`alerts.service.ts` wiring — no commit, see that repo's own HANDOFF
- CryoHealth-app: `src/lib/db/schema.ts` v1→v2 + `src/lib/db/migrations.ts` (new file) +
  `LakeModel`/`AlertModel` + `sync.ts` pull mapping extended for the new fields — no commit
- Both `CLAUDE.md` files (this repo and CryoHealth-api) updated to reflect current state

## Not done / deferred
- `settings.tsx`'s `VALLEYS` mock picker — not safety-critical, explicitly deferred by
  Shaan when asked how to handle the mock→live gap
- Alert acknowledgement (`alert/[id].tsx`'s ack button) — still local React state only;
  no `AlertAck` WatermelonDB table or backend endpoint exists (the web dashboard's
  `alert_acknowledgements` table has no CryoHealth-api controller or mobile client)
- The new `AlertChipsAndChecklist` migration has never been run against a live Postgres —
  no Docker in this dev environment; needs `docker compose up -d db && npm run
  migration:run` in CryoHealth-api on a machine that has Docker
- Nothing in either repo has been committed — nor was the pre-existing (pre-session)
  auth/sync/cases work

## Next action
`docker compose up -d db && npm run migration:run` in CryoHealth-api (needs Docker), then
in CryoHealth-app: `npx expo start --android` and walk home/map/alerts/critical against a
seeded backend (`npm run seed:lakes && npm run seed:users` in CryoHealth-api first) to
confirm the live-data wiring renders correctly end to end — none of this has been run on
a device or simulator this session.

## Open questions for a human
- Should alert chips/checklist be authorable from the `cryohealth` web dashboard's issue
  form too, or only via CryoHealth-api's `IssueAlertDto` directly? — blocking: no
- Alert acknowledgement sync (backend endpoint + WatermelonDB table) — worth building, or
  is local-only fine for the current prototype stage? — blocking: no

## Failed approaches (do not retry)
- First draft of `alert/[id].tsx` double-wrapped the route component in `withObservables`
  around a component that took no props — the HOC's triggering prop (`id`) never reached
  it. Fix: keep the default export a plain component that reads `useLocalSearchParams()`
  and renders a separately-`withObservables`-wrapped inner component with `id` passed as
  a prop.
- `alerts.tsx`'s FreshRow stamp was briefly built as a separate helper component using
  `require('../../components/hazard')` inline instead of a top-level import — worked but
  was needless; replaced with a normal import.

## Loops run
- none (no /uexel:plan → /uexel:build loop this session; ad hoc)

## Files touched
tsconfig.json, babel.config.js (new), package.json, package-lock.json, CLAUDE.md,
src/app/case.tsx, src/app/critical.tsx, src/app/alert/[id].tsx,
src/app/(tabs)/home.tsx, src/app/(tabs)/map.tsx, src/app/(tabs)/alerts.tsx,
src/components/hazard.tsx, src/lib/format.ts (new), src/lib/api-types.ts,
src/lib/db/schema.ts, src/lib/db/migrations.ts (new), src/lib/db/index.ts,
src/lib/db/models/LakeModel.ts, src/lib/db/models/AlertModel.ts, src/lib/sync.ts

## Verification status
tests: none in this repo (no test runner in scaffold)  review: pending  qa: not run on
device/simulator this session — typecheck clean only

## Resume with
/uexel:orient   (then: run the migration on a Docker-capable machine, seed, and walk the
app on a device before committing any of this)
