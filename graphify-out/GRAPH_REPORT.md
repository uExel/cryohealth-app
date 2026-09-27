# Graph Report - CryoHealth-app  (2026-09-27)

## Corpus Check
- 87 files · ~96,146 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 720 nodes · 1133 edges · 76 communities (37 shown, 39 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `09111d95`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useStyles
- theme.ts
- home.tsx
- expo
- cryohealth-api.ts
- scripts
- compilerOptions
- reset-project.js
- dependencies
- 4. Components
- What You Must Do When Invoked
- check-gstack.sh
- expo-device
- expo-font
- expo-glass-effect
- HANDOFF — cryohealth-app — 2026-08-09 15:10 PKT
- @expo-google-fonts/noto-nastaliq-urdu
- expo-image
- HANDOFF — cryohealth-app — 2026-08-02 00:05 PKT
- HANDOFF — CryoHealth-app — 2026-09-27 22:16 PKT
- expo-splash-screen
- expo-status-bar
- expo-symbols
- expo-system-ui
- @expo/ui
- expo-web-browser
- lucide-react-native
- react-dom
- react-native-gesture-handler
- react-native-reanimated
- react-native-safe-area-context
- react-native-screens
- react-native-svg
- react-native-web
- react-native-worklets
- graphify reference: extra exports and benchmark
- cryohealth-app
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- .claude/CLAUDE.md
- extraction-spec.md
- LEARNINGS.md
- PLAN
- TODO.md
- README.md
- HANDOFF — cryohealth-app — 2026-08-09 14:34 PKT
- HANDOFF — CryoHealth-app — 2026-09-24 13:50 PKT
- expo-secure-store
- @nozbe/watermelondb
- @nozbe/with-observables
- react-native
- @react-native-community/netinfo
- zod
- zustand
- HANDOFF — cryohealth-app — 2026-08-08 21:15 PKT
- HANDOFF — cryohealth-app — 2026-08-09 13:16 PKT
- expo-crypto
- HANDOFF — cryohealth-app — 2026-08-09 14:50 PKT
- HANDOFF — CryoHealth-app — 2026-09-22 PKT
- HANDOFF — CryoHealth-app — 2026-09-22 PKT
- HANDOFF — CryoHealth-app — 2026-09-22 PKT
- HANDOFF — CryoHealth-app — 2026-09-22 PKT
- HANDOFF — CryoHealth-app — 2026-09-22 PKT
- HANDOFF — CryoHealth-app — 2026-09-22 PKT
- HANDOFF — CryoHealth-app — 2026-09-23 21:02 PKT
- HANDOFF — CryoHealth-app — 2026-09-23 PKT
- eslint.config.js
- expo-constants
- mock.ts
- HANDOFF — CryoHealth-app — 2026-09-27
- @expo-google-fonts/archivo

## God Nodes (most connected - your core abstractions)
1. `useStyles()` - 60 edges
2. `useTheme()` - 48 edges
3. `useApp()` - 25 edges
4. `expo-router` - 17 edges
5. `4. Components` - 16 edges
6. `expo` - 15 edges
7. `HANDOFF — cryohealth-app — 2026-08-02 00:05 PKT` - 15 edges
8. `useAuthStore` - 13 edges
9. `CryoHealth Mobile — design system for implementation` - 13 edges
10. `Tier` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Login()` --references--> `react`  [EXTRACTED]
  src/app/login.tsx → package.json
- `ThemeProvider()` --references--> `react`  [EXTRACTED]
  src/design/theme.ts → package.json
- `startSyncEngine()` --references--> `AppState`  [EXTRACTED]
  src/lib/sync.ts → src/state/app.tsx
- `CriticalBadge()` --calls--> `useStyles()`  [EXTRACTED]
  src/app/(tabs)/_layout.tsx → src/design/styles.ts
- `Alerts()` --calls--> `useStyles()`  [EXTRACTED]
  src/app/(tabs)/alerts.tsx → src/design/styles.ts

## Import Cycles
- None detected.

## Communities (76 total, 39 thin omitted)

### Community 0 - "useStyles"
Cohesion: 0.07
Nodes (60): expo-router, Critical(), Splash(), AppEffects(), Login(), Permission(), AlertDetail(), NewCase() (+52 more)

### Community 1 - "theme.ts"
Cohesion: 0.10
Nodes (21): react, react, border, FAMILY, Lang, Mode, motion, NetState (+13 more)

### Community 2 - "home.tsx"
Cohesion: 0.08
Nodes (39): ObservedAlertDetail, Alerts(), toCardData(), OUTCOMES, PROBLEMS, TIER_RANK, Lakes(), TIER_RANK (+31 more)

### Community 3 - "expo"
Cohesion: 0.05
Nodes (38): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, projectId, reactCompiler (+30 more)

### Community 4 - "cryohealth-api.ts"
Cohesion: 0.10
Nodes (28): ApiError, apiFetch(), ApiFetchOptions, errorMessage(), ApiAlert, ApiCase, ApiLake, ApiProtocol (+20 more)

### Community 5 - "scripts"
Cohesion: 0.08
Nodes (25): @babel/plugin-proposal-decorators, @babel/plugin-transform-class-properties, eslint, eslint-config-expo, devDependencies, @babel/plugin-proposal-decorators, @babel/plugin-transform-class-properties, eslint (+17 more)

### Community 6 - "compilerOptions"
Cohesion: 0.13
Nodes (14): ./assets/*, expo-env.d.ts, expo/tsconfig.base, .expo/types/**/*.ts, **/*.ts, **/*.tsx, compilerOptions, experimentalDecorators (+6 more)

### Community 7 - "reset-project.js"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 8 - "dependencies"
Cohesion: 0.22
Nodes (9): expo, expo-linking, expo-router, dependencies, expo, expo-linking, expo-router, @tanstack/react-query (+1 more)

### Community 9 - "4. Components"
Cohesion: 0.07
Nodes (28): 10. Accessibility, 11. Icons, 12. Logo, 1. Non-negotiables, 2. Tokens, 3. Layout, 4. Components, 5. Screens (+20 more)

### Community 10 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 15 - "HANDOFF — cryohealth-app — 2026-08-09 15:10 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — cryohealth-app — 2026-08-09 15:10 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 18 - "HANDOFF — cryohealth-app — 2026-08-02 00:05 PKT"
Cohesion: 0.12
Nodes (15): Addendum — 2026-08-03 (App Store Connect API key), Addendum — 2026-08-03 (harness maintenance), Addendum — 2026-08-03 (TestFlight setup), Done this session, Failed approaches (do not retry), Files touched, HANDOFF — cryohealth-app — 2026-08-02 00:05 PKT, Loops run (+7 more)

### Community 19 - "HANDOFF — CryoHealth-app — 2026-09-27 22:16 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-27 22:16 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 35 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 36 - "cryohealth-app"
Cohesion: 0.25
Nodes (7): Commands (`npm`, Expo), cryohealth-app, Gotchas, graphify, gstack (REQUIRED — global install), Map, Working here

### Community 37 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 38 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 39 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 40 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 46 - "PLAN"
Cohesion: 0.06
Nodes (31): Assumptions & blast radius, GATE decision 1: structured `steps` jsonb on the API, not client-side parsing of `body`, GATE decision 2: the no-match state is the common case, not an edge case, Headline: this isn't a fetch swap, it's a new content source with an offline contract, Loop budget, PLAN, Plan steps, Rollback (+23 more)

### Community 49 - "HANDOFF — cryohealth-app — 2026-08-09 14:34 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — cryohealth-app — 2026-08-09 14:34 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 50 - "HANDOFF — CryoHealth-app — 2026-09-24 13:50 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-24 13:50 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 59 - "HANDOFF — cryohealth-app — 2026-08-08 21:15 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — cryohealth-app — 2026-08-08 21:15 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 60 - "HANDOFF — cryohealth-app — 2026-08-09 13:16 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — cryohealth-app — 2026-08-09 13:16 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 62 - "HANDOFF — cryohealth-app — 2026-08-09 14:50 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — cryohealth-app — 2026-08-09 14:50 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 63 - "HANDOFF — CryoHealth-app — 2026-09-22 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-22 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 64 - "HANDOFF — CryoHealth-app — 2026-09-22 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-22 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 65 - "HANDOFF — CryoHealth-app — 2026-09-22 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-22 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 66 - "HANDOFF — CryoHealth-app — 2026-09-22 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-22 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 67 - "HANDOFF — CryoHealth-app — 2026-09-22 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-22 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 68 - "HANDOFF — CryoHealth-app — 2026-09-22 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-22 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 69 - "HANDOFF — CryoHealth-app — 2026-09-23 21:02 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-23 21:02 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 70 - "HANDOFF — CryoHealth-app — 2026-09-23 PKT"
Cohesion: 0.17
Nodes (11): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-23 PKT, Loops run, Next action, Not done / deferred, Open questions for a human (+3 more)

### Community 73 - "mock.ts"
Cohesion: 0.17
Nodes (11): Alert, ALERT_DETAIL, ALERTS, COMMON_COMPLAINTS, CRITICAL, Lake, LAKES, Lesson (+3 more)

### Community 74 - "HANDOFF — CryoHealth-app — 2026-09-27"
Cohesion: 0.18
Nodes (10): Done this session, Failed approaches (do not retry), Files touched, HANDOFF — CryoHealth-app — 2026-09-27, Next action, Open questions for a human, Resume with, ROOT CAUSE FOUND 2026-09-27 (evening) — supersedes "State"/"Next action" below (+2 more)

## Knowledge Gaps
- **415 isolated node(s):** `check-gstack.sh script`, `name`, `slug`, `version`, `orientation` (+410 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `theme.ts`, `scripts`, `expo-device`, `expo-font`, `expo-glass-effect`, `@expo-google-fonts/noto-nastaliq-urdu`, `expo-image`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-system-ui`, `@expo/ui`, `expo-web-browser`, `lucide-react-native`, `react-dom`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `react-native-web`, `react-native-worklets`, `expo-secure-store`, `@nozbe/watermelondb`, `@nozbe/with-observables`, `react-native`, `@react-native-community/netinfo`, `zod`, `zustand`, `expo-crypto`, `expo-constants`, `@expo-google-fonts/archivo`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `react` connect `theme.ts` to `dependencies`, `useStyles`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `Login()` connect `useStyles` to `theme.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `check-gstack.sh script`, `name`, `slug` to the rest of the system?**
  _415 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useStyles` be split into smaller, more focused modules?**
  _Cohesion score 0.06835443037974684 - nodes in this community are weakly interconnected._
- **Should `theme.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10144927536231885 - nodes in this community are weakly interconnected._
- **Should `home.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08361581920903954 - nodes in this community are weakly interconnected._