# CryoHealth Mobile — design system for implementation

Read this with `tokens.json`. Tokens are literal values; this file is the rules that make them mean something. Reference implementation: `CryoHealth Screen.dc.html` (every screen and state), gallery in `CryoHealth.dc.html` — both in the Claude Design project (see README.md).

React Native code lives in `src/design/` (imported from the design project's `rn/`):
- `theme.ts` — typed tokens, `ThemeProvider` / `useTheme`, platform-correct Archivo weights, and the `bannerFor` / `freshnessFor` / tier-label helpers.
- `styles.ts` — `useStyles()`, one `StyleSheet` covering every component in §4. Compose with an array for one-offs; never write a parallel button or field style in a screen file.

Both are generated from `tokens.json`. Edit the JSON and regenerate rather than hand-editing values.

Target: React Native (iOS + Android), offline-first, Gilgit-Baltistan. Users are the general public (no account) and Lady Health Workers (signed in).

---

## 1. Non-negotiables

1. **Red means CRITICAL and nothing else.** Never a delete button, never an error field, never a brand accent. The primary accent is glacial blue `#0f6ea8`.
2. **Colour is never the only signal.** Every hazard tier carries a colour bar, an icon, and an uppercase word. Assume the user is colour-blind, in glare, on a cracked screen.
3. **Offline is the resting state, not an error.** Never an empty state that says "no connection". Show the saved copy plus its age.
4. **Nothing is dated implicitly.** Any screen showing hazard data carries a freshness stamp: `Updated {relative} · {Saved copy | Live | Old data}`.
5. **Zero corner radius. Anywhere.** Including images, avatars, badges, sheets, inputs.
6. **Everything flush left** — headings, body, and labels inside buttons. A wide button starts its label at the left padding edge.
7. **Minimum touch target 44×44.** Primary actions are 58 high, secondary 52, list rows 60.
8. **Never gate safety behind an account.** Alerts, map, learn and the public health assistant work with no login.

---

## 2. Tokens

Consume `tokens.json` (or `src/design/theme.ts`, which mirrors it). Two full themes (`light`, `dark`) — resolve at the root and pass down; do not read `useColorScheme()` inside leaf components.

Semantic names only in component code: `color.accent`, `color.tier.high`. Never a raw hex in a component file.

**Tier ramp.** Four tiers, each with a solid and a soft: `normal` (green) → `watch` (amber) → `high` (orange) → `critical` (red). `soft` is for badge fills and card washes; solid is for the bar, the icon, and text on soft. A tier's solid on the app background is 3:1 — fine for the 8px bar, badges and icons, **not** for body copy. Body copy in a tier colour is not allowed; use `color.text` on the soft fill.

**Typography.** Archivo only, three weights (400/600/800). There is no 500 or 700. Headings are always 800 with negative tracking; labels are always 800 uppercase with +1.2 tracking. Urdu switches family to Noto Nastaliq Urdu and roughly doubles line height — see `typography.urduScale`.

---

## 3. Layout

- Screen horizontal padding: 16 (20 on account/permission screens, which are prose-led).
- Sections are separated by a **2px rule** in `color.line`. Rows inside a section by a **1px** `color.lineSoft`. This is the only structure — no cards floating on a background, no shadows, no gaps standing in for a divider.
- Grids are equal-width cells separated by 1–2px of `color.line` showing through as the gutter (`gap` on a `line`-coloured container), not by whitespace.
- Full-bleed colour fields (tier header, splash, CRITICAL) run edge to edge **behind the status bar**; invert the status-bar glyphs to white over them.

---

## 4. Components

Every component below exists in `CryoHealth Screen.dc.html`. Match the geometry, not just the colours.

### AppBar
Height 56, bottom 2px rule. Left: two-line title — `title3` over `label` in `muted`. Right: language toggle (44 min, outlined) and **SOS** (44 min, solid `tier.critical`, phone icon + "SOS"). SOS is present on every chromed screen; it opens the emergency sheet.

### SyncBanner
Full-width strip, 7/14 padding, below the app bar. Four states — bg / fg / text:
| state | bg | fg | text |
|---|---|---|---|
| offline | `text` | `bg` | Offline — showing saved information |
| syncing | `accent` | `#fff` | Syncing… 2 of 5 items |
| failed | `tier.watch` | `#1a1300` | Sync failed — tap to retry |
| stale | `tier.watch` | `#1a1300` | Data is 3 days old |
| online | — | — | banner hidden |
Icon left, text flush, `SYNC NOW` outlined button right on offline/failed/stale.

### TierHeader
The home hero. Solid tier fill, `onTier` text. Contains: warning icon + `HAZARD TIER` label, tier name at `hero` (56/800), location at `title3`, one plain-language sentence ≤ 30ch. Directly below it, outside the fill, the freshness row.

### TierBadge
Soft fill, solid text, icon + uppercase word, 11/800, padding 5/8. Never a dot alone.

### HazardRow
Height ≥ 64. Left: 8px full-height tier bar. Middle: name (`headline`) over detail (`footnote`, muted). Right: TierBadge. Whole row is the touch target.

### AlertCard
10px full-height tier bar on the leading edge, `surface2` body, 14 padding, 1px bottom rule. Order: badge + relative time (right, muted) → title (`title3`, 2 lines max) → location (`callout`, muted) → optional outlined chips for time window and action. CHW mode appends a green acknowledged line. Cleared alerts render at 75% opacity with a `CLEARED` badge.

### CriticalInterstitial
Full-screen, absolutely positioned, `tier.critical` field, white. Appears **instantly** — never animated. Contents in order: `CRITICAL` label → imperative in `hero` caps, ≤ 5 words → the same sentence in Urdu → 2px white rule → WHERE / WHEN / TAKE rows with 12/800 labels → the honest line "This warning may not have made a sound if your phone is silent." → white primary "See what to do" → outlined "I have seen this". No close X. Dismiss is an explicit acknowledgement.

### GuidanceCard (health assistant result)
Four stacked cards, each `surface2` with a 1px border and an **8px leading edge bar**: Step 1 danger signs (bar = green or amber), Step 2 classification (orange), Step 3 do this (accent, numbered 22px squares), Step 4 referral (critical, on `criticalSoft`). Above them, permanently: the non-dismissible "Guidance only — not a diagnosis" strip and the "Checked against WHO IMCI rules on this phone" provenance row. Below them, the source footnote.

**Two content levels, same shell.** Signed-in CHW gets the IMCI classification and dose. Public gets no classification, no medicine, no dose — a cautious "possible" phrasing and a push to a facility. This is a content rule, not a styling rule; enforce it in the data layer.

### Checklist
60-high rows, 26px square box with a 2px border, filled `accent` with a white tick when done. Row is the target. State is local and survives app restart.

### Field
Label `label` in muted, 6 below it a 2px-bordered box, min height 54, 17/600 text, 12 horizontal padding. Prefix segments (e.g. `+92`) are a `surface` block with a 2px trailing rule. Errors: border → `tier.watch`, message below in 13/600. Never red for a form error.

### Buttons
- **Primary** — solid `accent`, `onAccent`, 58 high, label 16/800, flush left, 16 padding.
- **Secondary** — transparent, 1px `line`, `text`, 52 high.
- **Danger** — solid `tier.critical`, white. Only for SOS / call rescue.
- **Text** — accent label, 48 high, no padding, flush left.
- Pressed: primary → `accentInk`; secondary → `accentSoft` fill. Focus ring 2px `accent`, offset 2.

### Segmented / Toggle
Segmented: a 2px-bordered row, active segment solid `text` with `bg` label. Toggle: 46×28 rectangle, `accent` when on with a 22px white knob inset 3; off is `surface` with a `line` border and a muted knob. No rounding, no shadow.

### DownloadControl
Three states in one slot: **not downloaded** (outlined accent button "Download 1.4 MB"), **in progress** (8px track, `accent` fill, "38% · paused"), **done** (green tick + "Downloaded 2.1 MB"). A fourth, **evicted by OS**, uses a dashed placeholder and "Re-download".

### TabBar
Five tabs, 62 high, 3px top indicator in `accent` on the active tab, icon 23 + 10.5/800 uppercase label. Badge is a red square (never a circle). Below it: iOS home indicator (138×5, 85% ink) or Android gesture bar (108×3, 60%).

### Sheet (SOS)
Bottom sheet on a 50% scrim, 3px `tier.critical` top rule, square. 64-high rows. Close is a 44px outlined X. Rescue 1122 first, then nearest facility, then nearest high ground — all annotated with what still works offline.

---

## 5. Screens

`splash · welcome · signup · verify · login · permission · home · alerts · alertDetail · critical · map · assistant · case · learn · settings`

Chromed (app bar + tab bar): `home, alerts, alertDetail, map, assistant, case, learn, settings`.
Bare (no chrome): `splash, welcome, signup, verify, login, permission, critical`.

Tab mapping: `alertDetail` → Alerts tab; `case` → Health tab.

---

## 6. Modes and variants

Four orthogonal axes. Every screen must render under any combination:

| axis | values |
|---|---|
| `mode` | `public`, `chw` |
| `platform` | `ios`, `android` |
| `theme` | `light`, `dark` |
| `lang` | `en`, `ur` (RTL) |
| `net` | `offline`, `syncing`, `failed`, `stale`, `online` |

`mode` changes **content and capability**, never the visual language: CHW adds the sync queue on home, acknowledge-and-log on alert detail, case capture, and the full IMCI guidance level.

`platform` changes only: status bar, home indicator vs gesture bar, share/back affordances, and the notification-permission copy (iOS Focus/Time-Sensitive caveat vs Android high-priority channel). Nothing else forks.

`lang: ur` flips `dir` to RTL, swaps the font family, and mirrors row direction and text alignment. Urdu numerals are rendered in Eastern Arabic form (۴.۲ کلومیٹر).

---

## 7. Offline behaviour

- Cache-first read for everything. The UI renders from local store; the network only updates the store.
- Writes (case records, acknowledgements) queue locally with a visible queue count and a `QUEUED`/`SYNCED` state per item. Never block a write on connectivity, never lose one silently.
- Storage is user-visible: Settings shows a segmented usage bar (lessons / map tiles / cases) and handles OS eviction with a re-download prompt.
- Map tiles are opt-in downloads on Wi-Fi. If absent, **the list view is the map** — present it as complete, not as a fallback failure ("Showing the list instead. Nothing is missing.").
- CHW login is verified against a credential cached at registration, so sign-in works with no signal. Registration itself is the one flow that needs signal once; say so.

---

## 8. Notifications

One channel that matters: hazard alerts for followed valleys. Nothing else may use it.
- Android: high-priority channel, sounds over DND.
- iOS: request Time Sensitive; state plainly that Focus/Silent may suppress it.
- If permission is denied, the app still shows a red in-app banner on open and tells the user to check each morning in flood season. Never re-prompt more than once per season.

---

## 9. Copy rules

Plain, calm, imperative. Short sentences, one idea each, written for low literacy and translation into Urdu.

- Say the action, not the mechanism: "Move to high ground now", not "Evacuation advisory issued".
- Never blame the user or the network: "Offline — showing saved information", not "Failed to fetch".
- Be honest about limits: the assistant is "Guidance only — not a diagnosis"; the CRITICAL screen admits it may not have made a sound.
- No exclamation marks, no emoji, no jargon (`GLOF` appears only as a labelled tag next to plain wording).
- Numbers over adjectives: "4.2 km", "18:00 – 02:00", "1 tablet twice daily, 5 days".
- Every destructive or irreversible action names its consequence in the button label.

---

## 10. Accessibility

- Support Dynamic Type / font scale to 200%. All layouts wrap; nothing is a fixed-height text box.
- Every icon-only control has a label. The tier bar and badge share one accessibility label ("Hazard tier: high").
- The CRITICAL interstitial takes focus and announces itself on appearance.
- Contrast: text on tier solids is checked at each theme; body copy never sits on a tier solid except on `critical` and `accentInk`, where the pairing is 4.5:1+.
- Do not rely on hover. Do not rely on long-press for anything essential.

---

## 11. Icons

Lucide, stroke 2.1–2.4 at interface sizes, `strokeLinecap: round`. Never filled. Tier icons are fixed: normal = check, watch = circle-alert, high = triangle/alert, critical = filled-weight triangle-alert.

## 12. Logo

Glacier peak crossed by a pulse trace, both strokes equal weight, no fill. Step the stroke up as the mark shrinks: 3.4 at ≥ 44px, 4.2 at ~26px, 5.4 at ~17px. Wordmark is one word, Archivo: `CRYO` 800 + `HEALTH` 400, tracking −0.03em. Approved fields: white on `accentInk`, `accent` on `bg`, solid `text` for the mono/notification icon. Never on a photograph, never rotated, never boxed.
