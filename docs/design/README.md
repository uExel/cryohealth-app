# Design source

Canonical design lives in the Claude Design project **"Cryo Health Mobile App Design"**
(claude.ai/design project `95263e52-6101-4802-b030-9d9d21633aca`):

- `CryoHealth.dc.html` — gallery: 16 core screens + dark / iOS / Urdu-RTL / sync-state variants
- `CryoHealth Screen.dc.html` — the parameterized reference implementation (geometry source of truth)
- `DESIGN_SYSTEM.md` + `tokens.json` — rules and literal values (copied here)
- `rn/theme.ts`, `rn/styles.ts` — generated RN code, installed at `src/design/`

Sync direction: design project → this repo. `src/design/*` is generated from `tokens.json`;
edit the JSON there and regenerate rather than hand-editing values. The two dated compat
patches in `src/design/` (RN 0.86 types) are the only allowed local deviations.

The non-negotiables (full text in DESIGN_SYSTEM.md §1): red means CRITICAL and nothing
else · colour is never the only signal · offline is the resting state · every hazard datum
carries a freshness stamp · zero corner radius · flush left · 44px touch minimum · safety
is never gated behind an account. Clinical rule from the PRD: dosing/diagnosis text renders
only from lookup tables, never from a language model.
