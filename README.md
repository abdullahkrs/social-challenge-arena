# Social Challenge Arena

A mobile-first multilingual social arcade platform with three complete original skill challenges and one optional private daily route.

## Playable catalog

- **Orbit Lock** — a 2D precision-timing challenge: lock a moving pulse inside twelve deterministic gates.
- **Echo Grid** — a 2D visual-memory challenge: watch a deterministic tile pattern and repeat it in order across eight rounds.
- **Lane Spark** — a 2D directional-reaction challenge: read twelve deterministic signals and tap the matching left, middle, or right lane before time expires.

All three use the complete journey:

`discover → choose → play → result → localized share → direct friend attempt → head-to-head comparison → rematch share`

Valid invitation links open the selected challenge and target score directly, while normal catalog discovery remains available.

## Daily challenge

The discovery surface selects one existing challenge and deterministic route from the canonical UTC date. Everyone receives the same route for that date. The device may remember only the current route identity and its best bounded score; corrupt, stale, or blocked storage never prevents play.

The daily route is optional and has unlimited replay. It has no account, streak, countdown, missed-day message, public ranking, urgency, or expiring link. Sharing uses the existing strict version-1 invitation, so a friend can play the same route and compare after the date changes.

## Languages and access

- Arabic with full RTL, English, and Turkish
- Touch and pointer throughout
- Space/Enter for Orbit Lock, native keyboard buttons for Echo Grid, and lane buttons plus 1–3 shortcuts for Lane Spark
- Reduced-effects mode, visible focus, non-color-only feedback, and live announcements
- No account, external analytics, third-party assets, or network API

## Run locally

```bash
npm ci
npm test
npm run build
python3 -m http.server 8000
```

Open `http://localhost:8000`. The deployable static output is generated in `dist/` and published from `main` through GitHub Pages.

## Delivery model

`one issue → one branch → one playable PR → one QA result → merge, reduce, or cancel`

See `PRODUCT_BRIEF.md`, `AGENT.md`, `SWARM.md`, `ISLAMIC_CONTENT_POLICY.md`, and `DELIVERY_EVIDENCE.md`.
