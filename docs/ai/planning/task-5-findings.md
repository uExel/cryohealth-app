# Findings — issue #5: wire IMCI Guidance to CryoHealth-api `/protocols`

Repo: cryohealth-app · Issue: uExel/cryohealth-app#5 (parent goal #1) · Date: 2026-09-22
Mode: read-only investigation. No precedent existed under `docs/ai/planning/` — this file
creates it; style follows `docs/ai/sessions/*-handoff.md`.

---

## 1. Subsystem map

### App side (this repo)

| File | Role today |
| --- | --- |
| `src/app/(tabs)/health.tsx` | Entry point. Free-text `TextInput` + `COMMON_COMPLAINTS` chips. **Every** control (`Get guidance` button and all four chips) calls `router.push('/guidance')` with **no params** — the typed text and the chosen chip are discarded. |
| `src/app/guidance.tsx` | Renders `GUIDANCE.chw` or `GUIDANCE.pub` from `src/lib/mock.ts`, picked by `mode` from `useApp()`. Screen subtitle is the hardcoded `GUIDANCE.input`. No route params, no fetch, no DB read. |
| `src/components/guidance.tsx` | `Disclaimer`, `Provenance`, `GuidanceCard({ step, head, why, tier, numbered, index })`. Pure presentation; `tierColor(t, tier)` drives the left border colour. Unchanged by this work. |
| `src/lib/mock.ts` | `GUIDANCE` (lines 110-129), `COMMON_COMPLAINTS` (line 103), plus `LESSONS`/`VALLEYS` used elsewhere. |
| `src/lib/api-client.ts` | `apiFetch<T>(path, { auth })`; `auth: false` skips the bearer token. 401 → `useAuthStore.logout()`. |
| `src/lib/cryohealth-api.ts` | `login`, `fetchLakes`, `fetchAlerts`, `createCase`, `fetchMyCases`. **No protocols call.** |
| `src/lib/api-types.ts` | `PageResult<T>`, `ApiLake`, `ApiAlert`, `ApiCase`, `LoginResponse`. **No `ApiProtocol`.** |
| `src/lib/db/schema.ts` | `appSchema({ version: 2 })`, tables `lakes`, `alerts`, `chw_cases`. |
| `src/lib/db/migrations.ts` | One step, `toVersion: 2`, `addColumns` only. |
| `src/lib/db/index.ts` | `SQLiteAdapter` + `new Database({ modelClasses: [LakeModel, AlertModel, ChwCaseModel] })` — **a new model must be registered here or `database.get()` throws at runtime.** |
| `src/lib/db/models/{Lake,Alert,ChwCase}Model.ts` | `@field`/`@json` decorated models. `AlertModel` is the closest template: `@json("chips_json", sanitizeStrings)` shows the array-in-a-text-column pattern. |
| `src/lib/sync.ts` | `pullLakesAndAlerts()` (wholesale wipe + recreate inside one `database.write`), `pushQueuedCases()`, `runSync()`, `startSyncEngine()` (NetInfo listener + 5-min interval). |
| `src/app/_layout.tsx` | `useEffect(() => startSyncEngine(setNet), [setNet])`. |
| `src/app/(tabs)/alerts.tsx` | The read pattern to copy: `withObservables([], () => ({ alerts: database.get<AlertModel>('alerts').query().observe() }))`. |
| `src/state/app.tsx` | `mode: 'public' \| 'chw'`, `useState<Mode>('chw')` — **client-side only, not derived from the auth role.** |
| `src/design/theme.ts:18` | `export type Tier = 'normal' \| 'watch' \| 'high' \| 'critical'`. |

Flow after the fix: `health.tsx` (chip/text → slug) → `router.push({ pathname: '/guidance', params: { slug } })` → `guidance.tsx` reads `useLocalSearchParams()` → `withObservables` query on the new `protocols` table → `GuidanceCard` list. `sync.ts` fills that table from `GET /protocols`. Nothing in the render path touches the network.

### API side (`/Users/m5/Projects/uexel/cryo/CryoHealth-api`)

- `src/protocols/protocols.controller.ts` — `@Public() GET /protocols` (returns an **array**, not a `PageResult`), `@Public() GET /protocols/:id`, plus `@Roles('cryohealth_admin')` CRUD under `/admin/protocols`.
- `src/protocols/protocols.service.ts` — `findAll()` = `repo.find({ order: { isDisaster: 'DESC', title: 'ASC' } })`. Returns raw TypeORM entities, so the **JSON keys are camelCase: `isDisaster`, `createdAt`, `updatedAt`.**
- `src/protocols/entities/protocol.entity.ts` — `id` (uuid), `slug` (unique, "Stable key for the CHW app lookup", create-only), `title`, `category`, `body` (text), `source` (text), `isDisaster` (bool, default false), `createdAt`, `updatedAt`. No Urdu column, no audience column, no structure.
- `src/protocols/dto/*.dto.ts` — `slug` create-only and immutable on update; `body` is an unvalidated `@IsString()`.
- `src/common/types/tier.type.ts` — `'normal' | 'watch' | 'high' | 'critical'`, byte-identical to the app's `Tier`.

### The real `body` content (seed, `CryoHealth-api/scripts/seed-dev-data.ts:101-129`)

Two protocols only:

```
slug: fast-breathing-pneumonia-2y   category: 'IMCI · Respiratory'   isDisaster: false
body (4 lines joined by \n):
  'STEP 1 · DANGER SIGNS: No general danger signs — able to drink, no vomiting, no convulsions, not lethargic.'
  'STEP 2 · CLASSIFICATION: Fast breathing — pneumonia (44 breaths/min at age 2; cut-off 40).'
  'STEP 3 · DO THIS: Amoxicillin 250 mg — 1 tablet twice daily, 5 days. Dose row: 2 years / 10-14 kg. Continue feeding and fluids.'
  'STEP 4 · REFER IF: Chest indrawing, unable to drink, or worse in 2 days. Refer to Hassanabad BHU — mark the case for follow-up.'

slug: glof-evacuation-checklist     category: 'GLOF · Evacuation'    isDisaster: true
body: three plain sentences, no STEP prefixes.
```

So `body` is **semi**-structured for exactly one row, by an undocumented convention that
nothing validates, and unstructured for the other. It was transcribed *from this repo's
`mock.ts` GUIDANCE.chw* — the CHW half only.

### Who else reads protocols

`cryohealth` (dashboard) bypasses the API and hits Postgres directly:
`src/lib/queries.ts:224` `SELECT * FROM protocols ORDER BY is_disaster DESC`, surfaced at
`src/routes/api/public/protocols.ts` and rendered in `src/routes/chw.tsx` as
`whitespace-pre-line` raw `body` — **no parsing precedent anywhere.** Its snake_case
`is_disaster` is an artifact of raw SQL; do not copy that shape into this app.
`src/routes/admin.protocols.tsx` is a **read-only table** (no form, no mutation, and
`admin-schemas.ts:134` `protocolSchema = z.object({}).strict()` is an empty stub).

---

## 2. The `body`-shape decision — **structured field on the API (option b)**

**Recommendation: add a nullable `steps jsonb` column to `protocols` in CryoHealth-api;
the app maps it 1:1 and falls back to rendering `body` lines verbatim when it is null.**

Client-side parsing (option a) is not "riskier" — for this screen it is **impossible**:

1. **`GUIDANCE.pub` is different clinical text, not a subset of `GUIDANCE.chw`.** Compare
   `mock.ts:112-128`: 4 CHW steps vs 3 public steps, disjoint labels, disjoint wording.
   "Possible chest infection — fast breathing in a young child needs a health worker
   today" cannot be derived from "Fast breathing — pneumonia (44 breaths/min, cut-off
   40)" by any parse. Producing it on-device means either composing new clinical text
   (an LLM in the diagnosis path — forbidden by PRD §9 R5 and workspace CLAUDE.md) or
   keeping hand-written public copy in the app (the second content source this issue
   exists to delete). The Health tab is in `TABS` unconditionally and `mode` is a plain
   Settings toggle, so public mode is genuinely reachable — this is not hypothetical.
2. **`tier` does not exist in `body` at all.** Option a would need a label→severity
   heuristic over free prose, unvalidated server-side, to decide which card is red.
   Red means CRITICAL in this app and nothing else.
3. **`head`/`why` are already merged in the seeded `body`** ("Fast breathing — pneumonia
   (44 breaths/min at age 2; cut-off 40)"), so DESIGN_SYSTEM §4's two type levels are
   unrecoverable by splitting lines.
4. **Nothing enforces the `STEP n · LABEL:` convention.** `UpdateProtocolDto.body` is a
   free `@IsString()`. A parser would be a silent dependency on a convention the server
   does not defend.

Tradeoff accepted: option b costs a cross-repo change (migration + entity + DTO + seed
update in CryoHealth-api) and probably a companion issue there. Option a costs nothing
cross-repo but cannot satisfy the public/CHW split, which is the screen's core contract.

### Concrete shape

```jsonc
// protocols.steps  (jsonb, NULLABLE — existing rows keep working)
{
  "chw":    [ { "label": "STEP 1 · DANGER SIGNS", "head": "...", "why": "...",
                "tier": "normal", "numbered": false }, ... ],
  "pub":    [ { "label": "WHAT THIS MAY BE", "head": "...", "why": "...",
                "tier": "watch",  "numbered": false }, ... ]
}
```

**One row holding both audiences, not a per-step `audience` tag and not a second
`-public` slug row.** The public key is named `pub`, matching this repo's existing
`GUIDANCE.pub` and sidestepping any reserved-word friction with a DTO class field literally
named `public`. Decided, do not re-litigate:

- A per-step `audience: 'chw' | 'public' | 'both'` filter **cannot work** — filtering the
  CHW list only yields fewer CHW-worded steps, so a public user would still read
  "STEP 2 · CLASSIFICATION: Fast breathing — pneumonia". The two lists are separately
  authored, not one list with visibility flags.
- Two rows (`...-public` slug suffix) would force the complaint map to know two slugs per
  scenario with no FK tying the pair, and would break the entity comment's promise that
  `slug` is *the* stable key for the CHW app lookup.

DTO validation in CryoHealth-api: `tier` via `@IsIn(['normal','watch','high','critical'])`
against `src/common/types/tier.type.ts` (casing already matches this app's `Tier`), `label`
/`head`/`why` non-empty strings, `numbered` optional boolean, both `chw` and `pub`
arrays required when `steps` is provided.

### App-side fallback (required, not optional)

When `steps` is null/absent — an un-migrated API, or any protocol authored before the
column existed — the screen renders `body` split on `\n` as one `GuidanceCard` per line at
`tier: 'normal'`, with the unchanged `Disclaimer`/`Provenance`/`source` chrome. Verbatim
server text, no parsing, no invention, no tier guessing. In this state the screen shows
the same content in both modes and must say so (see risk R3).

---

## 3. Complaint → protocol mapping

No mapping exists anywhere today — not in this app, not in the API, not in the dashboard.
`COMMON_COMPLAINTS` chips and the free-text box all `router.push('/guidance')` bare.
It must be invented, and it should be a static table in this repo — not an engine:

```ts
// src/lib/complaint-map.ts  (new)
export const COMPLAINT_TO_SLUG: Record<string, string> = {
  'Child breathing fast': 'fast-breathing-pneumonia-2y',
  // 'Watery diarrhoea' / 'Fever 3 days' / 'Very cold, shivering': no protocol seeded yet
};
```

**Three of the four chips have no protocol to point at** (only two protocols exist, one of
which is the GLOF evacuation checklist). So the no-match state is the *common* case, not
an edge case, and the plan must treat it as a first-class screen state:

- Chip with no entry, or free text (free text resolves only on an exact chip-string
  match — anything fuzzier is the classification engine that issue #5 puts out of scope)
  → render "No stored protocol for this yet. See a health worker." plus the standing
  `Disclaimer`.
- **Never fall back to the one seeded protocol**, and never to `mock.GUIDANCE`. Showing
  pneumonia dosing to someone who tapped "Watery diarrhoea" is the worst possible failure
  of this screen.
- `guidance.tsx` reached with no `slug` param at all → same no-match state.

Keying the map by the exact chip string is acceptable while `COMMON_COMPLAINTS` is an
English constant in `mock.ts`; note it as debt for the Urdu work in goal #1 (see R5).

---

## 4. Public vs CHW gating — **no backend authorization change, ever**

- `GET /protocols` is `@Public()` and must stay that way (workspace rule: safety info is
  never gated). The device therefore holds the full CHW payload regardless of `mode`.
  The split is a **render-time selection over an already-public payload** — exactly what
  `guidance.tsx:16` does today, and that line's shape does not change.
- `isDisaster` is GLOF-vs-clinical (it orders `findAll()` and colours the dashboard card
  border). It is **orthogonal to audience** — do not overload it for the public/CHW split.
- There is **no role field on `Protocol`** and there should not be one. The only backend
  change this needs is the content change in §2 (`steps.chw` / `steps.pub`), not an
  authz change.
- `mode` in `src/state/app.tsx` is a `useState` set by `login.tsx`/`verify.tsx`/`index.tsx`
  and freely flippable in `settings.tsx` — it is **not** derived from `useAuthStore().role`.
  Pre-existing, out of scope here (see R4).

---

## 5. Risks and assumptions

- **R1 — the migration may never be deployed.** The app must work against an API without
  the `steps` column. Enforced by the §2 fallback and by R2's isolated sync step.
- **R2 — sync coupling.** Adding `fetchProtocols()` to `pullLakesAndAlerts`'s `Promise.all`
  would make a 404 from an un-migrated API fail the *whole* sync and set `net='failed'`,
  regressing lakes/alerts. `pullProtocols()` must be its own step with its own try/catch:
  a missing endpoint degrades to "keep the last cached protocols", never a red banner.
- **R3 — seed data is the only authoring path.** The dashboard's admin protocols page is
  read-only and its zod schema is an empty stub; there is no UI to author `steps`. So
  `scripts/seed-dev-data.ts` (and raw `POST /admin/protocols`) is the human authoring
  path for now. **If the seed is not updated with `steps`, option b ships looking done
  while every real row falls back to §2's `body` rendering and the public/CHW split is
  dead.** The seed update is part of the API-side commit, not a follow-up.
- **R4 — `mode` is not the auth role.** A signed-out user can flip Settings to `chw` and
  read dosing content. Pre-existing; do not fix inside #5, but do not write code that
  assumes `mode === 'chw'` implies an authenticated CHW.
- **R5 — no Urdu on `Protocol`.** No `title_ur`/`steps_ur`. Guidance stays English-only
  after this issue; goal #1's Urdu criterion needs a separate column pair. Flag it, do
  not silently ship an English-only "done".
- **R6 — response shape.** `GET /protocols` returns a bare array with **camelCase**
  `isDisaster`. `ApiProtocol` must not be typed as `PageResult<T>` (unlike lakes/alerts)
  and must not copy the dashboard's snake_case `is_disaster`.
- **R7 — model registration.** A new `ProtocolModel` must be added to `modelClasses` in
  `src/lib/db/index.ts`; forgetting it produces a runtime `database.get('protocols')`
  throw that typecheck will not catch.
- **R8 — device migration.** Schema v2 has shipped to TestFlight builds. v3 must be an
  `addTables` step in `migrations.ts` bumped together with `schema.ts`; editing
  `schema.ts` alone corrupts existing installs.
- **R9 — cross-repo scope.** Steps 1-2 below land in CryoHealth-api. If per-repo issue
  hygiene requires it, open a companion issue there rather than committing to #5's repo
  boundary silently.
- **R10 — no test runner *in this repo*.** cryohealth-app's `package.json` has `lint` and
  `typecheck` only; there is no `npm test`, so every app-side verification below is
  typecheck/lint plus a named manual check. This does **not** apply to CryoHealth-api, which
  does have jest (28 tests per its CLAUDE.md) — step 1's `npm test` runs there.

---

## 6. Draft plan steps (one atomic commit each)

Steps 1-2 are in `/Users/m5/Projects/uexel/cryo/CryoHealth-api`; steps 3-8 in this repo.

**1. api: add nullable `steps` jsonb to `Protocol` + DTO validation**
Entity column `@Column({ type: 'jsonb', nullable: true }) steps?: ProtocolSteps`, generated
migration under `src/database/migrations`, `ProtocolStepDto`/`ProtocolStepsDto` with
`@IsIn` on `tier` against `src/common/types/tier.type.ts`, wired into Create/Update DTOs
and `protocols.service.ts`.
*Verify:* `cd ../CryoHealth-api && npm run build && npm test && npm run migration:run` (needs
`docker compose up -d db`); `curl -s localhost:3000/protocols | jq '.[0]|keys'` includes `steps`.

**2. api: author `steps` for the seeded protocols**
In `scripts/seed-dev-data.ts`, add `steps: { chw: [...], pub: [...] }` for
`fast-breathing-pneumonia-2y`, transcribed verbatim from this repo's `mock.ts` `GUIDANCE.chw`
*and* `GUIDANCE.pub` (including each step's existing `tier` and `numbered`), and for
`glof-evacuation-checklist`. Extend the upsert's `ON CONFLICT ... DO UPDATE SET` with `steps`.
Keep the file-header provenance note accurate: this copies team-authored text, it composes none.
*Verify:* `npm run seed:dev-data && curl -s localhost:3000/protocols | jq '.[]|{slug, chw:(.steps.chw|length), pub:(.steps.pub|length)}'` → `4` and `3` for the IMCI row.

**3. app: add `ApiProtocol` type + `fetchProtocols()`**
`src/lib/api-types.ts`: `ApiProtocolStep` (`label`, `head`, `why`, `tier: Tier`, `numbered?`),
`ApiProtocolSteps` (`chw`, `pub`), `ApiProtocol` (`id`, `slug`, `title`, `category`,
`body`, `source`, `isDisaster`, `steps?`, `createdAt`, `updatedAt`). `src/lib/cryohealth-api.ts`:
`export const fetchProtocols = () => apiFetch<ApiProtocol[]>('/protocols', { auth: false });`
— bare array, `auth: false`, no pagination. No caller yet.
*Verify:* `npm run typecheck && npm run lint`.

**4. app: WatermelonDB schema v2 → v3, `protocols` table (schema change only)**
`schema.ts` version 3 + `tableSchema({ name: 'protocols', columns: [remote_id(indexed),
slug(indexed), title, category, body, source, is_disaster(bool), steps_json(string,
optional), synced_at(number)] })`; `migrations.ts` gains a `toVersion: 3` `addTables` step;
new `src/lib/db/models/ProtocolModel.ts` with `@json('steps_json', sanitize)` mirroring
`AlertModel`; registered in `modelClasses` in `src/lib/db/index.ts`. **No sync or UI change
in this commit.**
*Verify:* `npm run typecheck && npm run lint`; then `npm run android` — fresh install boots
with no "WatermelonDB setup failed" in the log, **and**, *if a v2-era build is available on a
device*, an upgrade in place boots clean with lakes/alerts still rendering. Note: the
2026-08-08 session never ran v2 against a live DB in that environment, so a v2 device may not
exist here — absent one, this step's correctness rests on the reviewable fact that
`migrations.ts` gained a `toVersion: 3` `addTables` step in the same commit as the
`schema.ts` bump. Do not record a fresh-install boot as proof the migration ran.

**5. app: pull protocols in the sync engine**
`pullProtocols()` in `src/lib/sync.ts` — same wipe-and-replace shape as
`pullLakesAndAlerts`, called from `runSync` in **its own `try/catch`** so a 404/absent
endpoint logs a warning and leaves the last cached rows instead of setting `net='failed'`
(R2).
*Verify:* `npm run typecheck && npm run lint`; with the API up, launch and confirm the
protocols table populates (temporary `console.log` of the row count, or the step-6 screen);
then stop the API and confirm the sync banner still reaches `online`.

**6. app: pass the complaint slug from Health to Guidance**
New `src/lib/complaint-map.ts` with `COMPLAINT_TO_SLUG`. `health.tsx` chips push
`{ pathname: '/guidance', params: { slug } }`; the free-text button resolves via an exact
`COMPLAINT_TO_SLUG` lookup on the trimmed input and pushes no slug when unmatched.
`guidance.tsx` reads `useLocalSearchParams<{ slug?: string }>()` but still renders mock in
this commit.
*Verify:* `npm run typecheck && npm run lint`; tapping "Child breathing fast" navigates
with the slug visible in the route params (log or React DevTools).

**7. app: render Guidance from the local protocols table, delete `GUIDANCE`**
`guidance.tsx` wrapped in `withObservables(['slug'], ({ slug }) => ({ protocols:
database.get<ProtocolModel>('protocols').query(Q.where('slug', slug ?? '')).observe() }))`;
picks `steps.chw` vs `steps.pub` off `mode`; falls back to `body`-lines rendering when
`steps` is absent (§2); renders the no-match state when the query returns nothing (§3).
Branch on `slug` *before* the HOC and render the no-match state directly when it is absent —
do not rely on a `Q.where('slug', '')` sentinel, which conflates "no slug" with "unknown slug"
and may leave the observable without a first emission (rendering nothing at all instead of the
no-match copy); `Chromed sub` and the footnote come from the row's `title`/`source`.
**Delete `GUIDANCE` from `src/lib/mock.ts`** and its import — do not keep it as a
"dev fallback" (the fallback is the server's `body`; leaving mock dosing text in the tree
invites a later slug-miss fallback into it). `COMMON_COMPLAINTS`/`LESSONS`/`VALLEYS` stay.
Update the `mock.ts` bullet in `CLAUDE.md` in the same commit.
*Verify:* `npm run typecheck && npm run lint`; `grep -rn "GUIDANCE" src/` returns nothing;
manual — CHW mode shows 4 cards with the STEP 4 card red, Settings→public shows the 3
public cards with no dose text, "Watery diarrhoea" shows the no-match state.

**8. app: offline proof + docs**
Airplane-mode pass after one successful sync; record it in `docs/ai/sessions/`, and update
`CLAUDE.md` (schema now v3; protocols is a third read-through cache; Guidance is live).
*Verify:* sync once online, enable airplane mode, force-quit, relaunch → Guidance still
renders the full protocol for a known slug and the banner reads offline (not failed).
