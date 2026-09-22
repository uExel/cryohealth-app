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
- [ ] Step 3 — `ApiProtocol` type + `fetchProtocols()`
- [ ] Step 4 — WatermelonDB schema v2 → v3, `protocols` table
- [ ] Step 5 — pull protocols in the sync engine
- [ ] Step 6 — pass complaint slug from Health to Guidance
- [ ] Step 7 — render Guidance from the local table, delete `GUIDANCE`
- [ ] Step 8 — offline proof + docs
