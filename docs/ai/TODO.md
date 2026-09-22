# TODO

Working checklist for the active plan. Kept current by /uexel:build.
Plan: docs/ai/PLAN.md · Task: #5 · Goal: #1 · Companion: CryoHealth-api#19

- [x] Step 1 (CryoHealth-api#19) — nullable `steps` jsonb + DTO validation (`b197c55`
      in CryoHealth-api). Build/test/migration all green; `GET /protocols` confirmed
      returning `steps` per row.
- [x] Step 2 (CryoHealth-api#19) — seed real `steps` content (`1094ea2` in
      CryoHealth-api). `fast-breathing-pneumonia-2y` has `steps.chw` (4) /
      `steps.pub` (3), transcribed verbatim from this repo's `mock.ts`
      `GUIDANCE.chw`/`.pub`. `glof-evacuation-checklist` kept `steps: null` — its
      source has no per-item tier/why split to transcribe; a build-time judgment
      call, flagged for verify.
- [x] Step 3 — `ApiProtocol` type + `fetchProtocols()` (`4b2e7ec`). typecheck/lint
      clean.
- [x] Step 4 — WatermelonDB schema v2 → v3, `protocols` table (`108bedb`). Schema-only.
      No device/emulator attached to test a fresh install or real v2→v3 upgrade
      (`adb devices` empty, no `simctl`) — correctness rests on the reviewable
      `createTable` step landing with the `schema.ts` bump in the same commit.
- [x] Step 5 — pull protocols in the sync engine (`b1ed775`). `pullProtocols()` in its
      own try/catch. Same device gap as Step 4 — live in-app sync behavior (table
      populates; banner stays `online` with API stopped) not observed, only the
      network contract (`GET /protocols` shape) and typecheck/lint verified.
- [x] Step 6 — pass complaint slug from Health to Guidance (`c382c62`). typecheck/lint
      clean.
- [x] Step 7 — render Guidance from the local table, delete `GUIDANCE` (`779e3cf`).
      `grep -rn GUIDANCE src/` clean. Data contract verified live (CHW 4 steps/STEP 4
      critical, public 3 steps, matches selection logic exactly). Same device gap:
      actual on-device rendering (card colors, no-match screen, tap-through) not
      observed.
- [ ] **Step 8 — BLOCKED: offline proof.** Requires a real device or emulator
      (airplane mode, force-quit, relaunch) — none is attached in this environment.
      Everything else in this plan is code-complete and typecheck/lint-verified; this
      is the one step that cannot be faked or skipped without actually misrepresenting
      what was checked. See HANDOFF.md for options.
