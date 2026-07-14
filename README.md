# Social Challenge Arena

A mobile-first multilingual social arcade platform with four original skill challenges and one optional private daily route.

## Playable catalog

- **Orbit Lock** — a 2D precision-timing challenge: lock a moving pulse inside twelve deterministic gates.
- **Echo Grid** — an endless procedural spatial-memory journey: watch a route, apply direct, reverse, mirrored, or folded rules, then move through adjacent tiles until all chances are lost or the player confirms exit.
- **Lumen Lanes** — an endless procedural focus run: move across three abstract lanes, interpret direct and mirrored signals, remember short light sequences, and choose safe or high-risk routes until all chances are lost or the player confirms exit.
- **Mirror Fuse** — a 2D spatial-reflection challenge: inspect a deterministic pattern and choose its exact horizontal mirror across ten rounds.

Echo Grid and Lumen Lanes generate one bounded deterministic chunk at a time. Replaying the same seed reproduces the same journey for fair friend competition, while a new route changes mechanics, zones, timing, constraints, risk choices, and special phases.

All four use the complete journey:

`discover → choose → play → result → localized share → direct friend attempt → head-to-head comparison → rematch share`

## Daily route

The discovery screen includes one deterministic UTC daily route. Everyone receives the same challenge and seed for that date. A local best is stored only when browser storage is available and is discarded automatically when it does not exactly match the current date, challenge, seed, and bounded score.

The daily route is optional and has unlimited replay. It has no account, streak, notification, public ranking, or missed-day penalty.

## Languages and access

- Arabic with full RTL, English, and Turkish
- Touch and pointer throughout; keyboard controls include Space/Enter for Orbit Lock, arrow-key movement for Echo Grid and Lumen Lanes, and native buttons for Mirror Fuse
- Reduced-effects mode, visible focus, non-color-only feedback, bounded live announcements, accessible memory equivalents, and two-step deliberate exits for endless runs
- No account, external analytics, third-party runtime assets, or network API

## Run locally

```bash
npm install
npm test
npm run build
python -m http.server 4173 -d dist
```

Then open `http://localhost:4173`.

## Deployment

GitHub Actions validates tests and the static build. The Pages workflow publishes `dist/` from `main`.
