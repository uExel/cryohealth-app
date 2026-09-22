# PLAN

Goal: [#1 — CHW offline core: IMCI triage, sync, alerts, Urdu](https://github.com/uExel/cryohealth-app/issues/1)
Task: [#5 — Wire IMCI Guidance screen to CryoHealth-api's /protocols endpoint](https://github.com/uExel/cryohealth-app/issues/5)
Companion (CryoHealth-api): [#19 — Add structured steps (jsonb) to Protocol + seed real content](https://github.com/uExel/CryoHealth-api/issues/19)

Full exploration: [`docs/ai/planning/task-5-findings.md`](planning/task-5-findings.md)
(written by the uexel-planner agent against the live tree of both repos — read it for the
full subsystem map, the body-shape decision's reasoning, and all 10 named risks).

## Headline: this isn't a fetch swap, it's a new content source with an offline contract

The Guidance screen renders one hardcoded scenario from `mock.ts`'s `GUIDANCE` constant
today. Making it real requires: a backend schema change (freeform `body` cannot express
the CHW/public split — see GATE 1), a new WatermelonDB read-through cache table (goal #1
requires triage to work in airplane mode — a live fetch-on-render would regress that),
and a complaint→protocol mapping that doesn't exist anywhere yet.

## Assumptions & blast radius

- **CryoHealth-api migration** (additive, nullable column) — issue #19, this repo does
  not touch that migration directly but Step 4 depends on its shape being settled first.
- **WatermelonDB schema v2 → v3** — a real device migration. Schema v2 has already
  shipped to TestFlight builds; this must be an `addTables` step alongside the `schema.ts`
  bump, never a `schema.ts`-only edit (findings R8).
- **No auth/payments/user-data touched.** `GET /protocols` stays `@Public()` — no
  authorization change anywhere in this task (findings §4).
- **Dosing/diagnosis content**: every string rendered on this screen must trace to either
  the seeded `protocols.steps` (transcribed verbatim from existing team-authored text) or
  the `body` fallback — never generated, never invented client-side (findings §2, R1).

## GATE decision 1: structured `steps` jsonb on the API, not client-side parsing of `body`

`GUIDANCE.pub` is separately-authored clinical text, not a filtered subset of
`GUIDANCE.chw` (disjoint wording, disjoint step count, `tier` absent from `body`
entirely). Deriving public copy from CHW `body` on-device is impossible without either
composing new clinical text (an LLM in the diagnosis path — forbidden) or keeping a
second hand-written copy in this app (the exact thing this task removes). Full reasoning
and the two rejected alternatives (per-step `audience` tag; a second `-public` slug row)
are in the findings doc §2 — not re-litigated here. This is the one decision genuinely
worth a human sign-off before Step 1 (in #19) locks in the schema shape.

## GATE decision 2: the no-match state is the common case, not an edge case

Only 2 protocols are seeded; `COMMON_COMPLAINTS` has 4 chips, so 3 of 4 have nothing to
point at today. The screen must render "No stored protocol for this yet" rather than
falling back to the one seeded protocol or to `mock.GUIDANCE` — showing pneumonia dosing
for a "Watery diarrhoea" tap is the worst failure mode this screen can have. Named here
because it's a safety-relevant product decision, not just an implementation detail.

## Settled, not GATE items (named so they don't get re-litigated mid-build)

- `isDisaster` stays orthogonal to the CHW/public split — it orders GLOF-vs-clinical
  display, not audience (findings §4).
- `mode` (public/CHW) is not derived from the auth role today — pre-existing gap, out of
  scope for this task (findings R4).
- No Urdu columns on `Protocol` — Guidance stays English-only after this task; flagged as
  separate follow-up debt against goal #1's Urdu criterion, not silently absorbed here
  (findings R5).
- `pullProtocols()` gets its own try/catch in the sync engine, never joined to
  `pullLakesAndAlerts`'s `Promise.all` — a missing/un-migrated endpoint must degrade to
  "keep last cached protocols," never fail the whole sync (findings R2).
- `GUIDANCE` is deleted outright in Step 7, not kept as a "dev fallback" — the real
  fallback is the server's `body` field (findings, end of §2).

## Plan steps

Steps 1-2 land in `CryoHealth-api` under issue #19. Steps 3-8 land in this repo under #5.

### Step 1 (in CryoHealth-api, issue #19) — `steps` jsonb column + DTO validation

Nullable `steps: ProtocolSteps` on the `Protocol` entity, generated migration,
`ProtocolStepDto`/`ProtocolStepsDto` (`@IsIn` on `tier` against
`src/common/types/tier.type.ts`).
Verify: `npm run build && npm test && npm run migration:run` (needs
`docker compose up -d db`); `curl -s localhost:3000/protocols | jq '.[0]|keys'` includes
`steps`.

### Step 2 (in CryoHealth-api, issue #19) — seed real `steps` content

`scripts/seed-dev-data.ts`: `steps.chw`/`steps.pub` for both seeded protocols,
transcribed verbatim from this repo's `mock.ts` `GUIDANCE.chw`/`GUIDANCE.pub`.
Verify: `npm run seed:dev-data && curl -s localhost:3000/protocols | jq '.[]|{slug, chw:(.steps.chw|length), pub:(.steps.pub|length)}'`
→ `4` and `3` for the IMCI row.

### Step 3 — `ApiProtocol` type + `fetchProtocols()`

`src/lib/api-types.ts`: `ApiProtocolStep`, `ApiProtocolSteps`, `ApiProtocol` (bare array
response, camelCase `isDisaster` — not `PageResult<T>`, findings R6).
`src/lib/cryohealth-api.ts`: `fetchProtocols()`, `auth: false`, no pagination. No caller
yet.
Verify: `npm run typecheck && npm run lint`.

### Step 4 — WatermelonDB schema v2 → v3, `protocols` table (schema only, no sync/UI)

`schema.ts` → version 3, `protocols` table; `migrations.ts` gains a `toVersion: 3`
`addTables` step; new `ProtocolModel.ts`; registered in `modelClasses` in
`src/lib/db/index.ts` (forgetting this throws at runtime, findings R7).
Verify: `npm run typecheck && npm run lint`; `npm run android` — fresh install boots
clean. Per findings R8: a v2-era device to test the in-place upgrade path may not exist
in this environment — if so, do not record a fresh install as proof the migration works;
correctness rests on `migrations.ts` and `schema.ts` being bumped together in this same
commit, reviewable as such.

### Step 5 — pull protocols in the sync engine

`pullProtocols()` in `src/lib/sync.ts`, same wipe-and-replace shape as
`pullLakesAndAlerts`, its own `try/catch` in `runSync` (Settled item above).
Verify: `npm run typecheck && npm run lint`; with the API up, confirm the local table
populates; stop the API and confirm the sync banner still reaches `online`, not
`failed`.

### Step 6 — pass the complaint slug from Health to Guidance

New `src/lib/complaint-map.ts` (`COMPLAINT_TO_SLUG`, static). `health.tsx` chips push
`{ pathname: '/guidance', params: { slug } }`; free text resolves only on an exact
match. `guidance.tsx` reads the param but still renders mock in this commit.
Verify: `npm run typecheck && npm run lint`; tapping "Child breathing fast" shows the
slug in route params.

### Step 7 — render Guidance from the local table, delete `GUIDANCE`

`guidance.tsx` via `withObservables` on `protocols` queried by slug; branch on slug
presence _before_ the HOC (not a `Q.where('slug', '')` sentinel — findings §3);
`steps.chw`/`steps.pub` picked by `mode`; falls back to `body`-line rendering when
`steps` is null; renders the no-match state (GATE 2) when the query is empty. Delete
`GUIDANCE` from `mock.ts` and its import; update the `mock.ts` bullet in `CLAUDE.md`.
Verify: `npm run typecheck && npm run lint`; `grep -rn "GUIDANCE" src/` returns nothing;
manual — CHW mode shows 4 cards (STEP 4 red), Settings→public shows 3 cards with no dose
text, "Watery diarrhoea" shows the no-match state.

### Step 8 — offline proof + docs

Sync once online, enable airplane mode, force-quit, relaunch.
Verify: Guidance still renders the full protocol for a known slug; sync banner reads
offline, not failed. Record the pass in `docs/ai/sessions/`; update `CLAUDE.md` (schema
v3, protocols is a third read-through cache, Guidance is live).

## Verification command (from the issue)

App side: `npm run typecheck && npm run lint` (no test runner in this repo — findings
R10). API side (#19): `npm test`. Plus the per-step manual/curl checks above, and Step
8's airplane-mode pass as the end-to-end proof.

## Loop budget

3 (fix loop), per default — issue #5 did not set one explicitly. No-progress: stop if two
consecutive iterations produce the same failure signature. Escalation: budget exhausted
or no-progress hit → label `agent:needs-human` on both #5 and #19 as applicable, comment
the failure trail, stop.

## Rollback

Steps 1-3, 5, 6 are additive (new column/nullable, new files, new types, new sync branch,
new route params) — `git revert` the step's commit with no knock-on effect. Step 4 is a
schema addition (`addTables`, not `addColumns`/destructive) — safe to revert as long as no
real device has taken the v3 migration yet; if one has, a revert commit must not
re-lower `schema.ts`'s version number (WatermelonDB does not support downgrading a
device's schema version). Step 7 deletes `GUIDANCE` and rewires the screen in place —
revert restores both. Step 8 is docs/proof-only. Nothing in this task modifies existing
`lakes`/`alerts`/`chw_cases` data or CryoHealth-api's existing `protocols` rows (`steps`
is additive/nullable), so there is nothing to roll back in the database itself beyond the
migration's own `down()`.
