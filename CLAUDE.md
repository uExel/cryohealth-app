# cryohealth-app

Offline-first Android app for Gilgit-Baltistan: GLOF hazard alerts for everyone, IMCI triage for health workers. PRD in uExel/cryo-harness; design contract in docs/design/.

## Working here

- Start sessions with /uexel:orient, end with /uexel:handoff. Pipeline:
  orient → plan → gate → build → verify → report → handoff (docs: uExel/cryo-harness).
- Task state lives in GitHub issues — labels + milestones, no boards.
- Shared AI working files: docs/ai/ (PLAN, TODO, HANDOFF, LEARNINGS, sessions, decisions).

## Commands (`npm`, Expo)

```bash
npm install
npm start            # Expo dev server; npm run android / ios / web for a target directly
npm run lint
npm run typecheck     # tsc --noEmit
```

No test script defined in this repo.

## Map

<!-- One line per top-level folder whose purpose a newcomer can't infer from its name.
     Delete rows that are obvious — every line here loads in every session. -->

- src/design — generated from the Claude Design project; never hand-edit values (docs/design/README.md)
- docs/design — the design contract (DESIGN_SYSTEM.md is binding, §1 especially)
- src/lib/api-client.ts + cryohealth-api.ts — talks to CryoHealth-api (`EXPO_PUBLIC_API_URL`);
  a 401 clears the session via the auth store, no separate interceptor.
- src/lib/db/ — WatermelonDB local store: `lakes`/`alerts` are read-through caches wiped
  and replaced on every pull; `chw_cases` is the only locally-authored table, queued until
  pushed. src/lib/sync.ts is the pull+push engine, wired from `_layout.tsx` on connectivity
  change and a 5-minute interval.
- src/state/auth.ts — zustand store, session persisted via expo-secure-store; hydrated once
  in `_layout.tsx`.

## Gotchas

<!-- Only repo-wide traps that bite in ANY directory. Local conventions and test/lint
     commands go in that directory's own CLAUDE.md. Date rules that exist to work around
     a current limitation: "added YYYY-MM for <x> — re-evaluate on next model release". -->

- Red means CRITICAL and nothing else — never errors, never delete.
- Dosing/diagnosis text comes from lookup tables only, never from a language model.
- Fonts must stay registered under the exact family names src/design/theme.ts emits.
- **WatermelonDB's `@field`/`@json` model decorators need `experimentalDecorators: true`
  in tsconfig.json plus `@babel/plugin-proposal-decorators` (`{ legacy: true }`) in
  babel.config.js** — neither was configured when the models were first added (models
  existed, typecheck/bundle were both silently broken). Both are now set; don't remove
  them.
- **`src/lib/mock.ts` is now only used by Learn** (`LESSONS`) **and `settings.tsx`'s
  valley picker** (deferred, not safety data). Home, map, alerts, alert detail, critical,
  and Guidance all read live WatermelonDB data via `withObservables`
  (`@nozbe/with-observables`, `src/lib/db/models/*`) — narrative/bilingual fields
  (`nameUr`, `bodyUr`, `chips`, `checklist`, `windowStart/End`) are real CryoHealth-api
  columns now (see that repo's `alerts.chips`/`alerts.checklist`), not client-side
  placeholders. Any of them can be `undefined` on a given record — screens must render
  that as "not provided" (hide the row), never a guessed value. `mock.ts`'s `GUIDANCE`
  was deleted (cryohealth-app#5) — Guidance now reads `protocols` (a third
  WatermelonDB read-through cache, schema v3). When a row has no structured `steps`
  yet, **CHW mode** falls back to line-by-line `body` rendering; **public mode never
  does** — `body` can contain CHW-only content (e.g. dosing) with no way to tell from a
  freeform field, so public mode shows a "not available yet" state instead of guessing
  (found the hard way in `/uexel:verify`, see PLAN.md's history for #5). Also falls back
  to a "no stored protocol" screen when the tapped complaint has no matching `slug` at
  all — never to any other
  protocol's content.
- Alert acknowledgement (`alert/[id].tsx`'s "Acknowledge & log action" button) is still
  local React state only — no `AlertAck` WatermelonDB table or backend endpoint exists
  yet, unlike case sync. Don't assume it persists or syncs.
- WatermelonDB schema is at **version 3** (`src/lib/db/schema.ts` + `migrations.ts`) —
  bump both together and add an `addColumns`/`addTables` step, never just edit `schema.ts`
  alone once a schema version has shipped to a real device.

## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
>
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
>
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
