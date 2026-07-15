# Social Challenge Arena

A mobile-first multilingual social arcade platform with four original skill challenges and one optional private daily route.

## Playable catalog

- **Orbit Lock** — an endless procedural precision journey: choose between two orbits, interpret changing gate rules, and lock a moving pulse through safe, risky, symbolic, and relay windows until all chances are lost or the player confirms exit.
- **Echo Grid** — an endless procedural memory journey: watch a route, interpret its rule, and move a marker to reconstruct, reverse, rotate, or decode it until all chances are lost or the player confirms exit.
- **Lumen Lanes** — an endless procedural focus run: move across three abstract lanes, interpret direct and mirrored signals, remember short light sequences, and choose safe or high-risk routes until all chances are lost or the player confirms exit.
- **Mirror Fuse** — an endless procedural spatial journey: read a generated shape and transformation rule, move a cursor across a construction board, and rebuild, anchor, repair, or trace the exact result until all chances are lost or the player confirms exit.

All four generate one bounded deterministic chunk at a time. Replaying the same seed reproduces the same journey for fair friend competition, while a new route changes mechanics, zones, timing, rules, risk, and special phases.

All four use the complete journey:

`discover → choose → play → result → localized share → direct friend attempt → head-to-head comparison → rematch share`

Valid invitation links open the selected challenge and target score directly, while normal catalog discovery remains available.

## Daily challenge

The discovery surface derives one challenge and route from the canonical UTC date. Dates through **July 31, 2026** retain the original three-challenge selector exactly. Beginning **August 1, 2026**, the deterministic selector uses all four challenges, allowing catalog growth without silently remapping established dates.

Everyone receives the same route for a date. The device may remember only the current route identity and its best bounded score; corrupt, stale, or blocked storage never prevents play.

The daily route is optional and has unlimited replay. It has no account, streak, countdown, missed-day message, public ranking, urgency, or expiring link. Sharing uses the existing strict version-1 invitation, so a friend can play the same route and compare after the date changes.

## Languages and access

- Arabic with full RTL, English, and Turkish
- Touch and pointer throughout; keyboard controls include orbit selection with Up/Down and locking with Space/Enter for Orbit Lock, arrow keys for Echo Grid and Lumen Lanes, and arrow keys plus Space/Enter for Mirror Fuse
- Reduced-effects mode, visible focus, non-color-only feedback, bounded live announcements, accessible spatial/timing descriptions, and two-step deliberate exit for endless runs
- Purposeful optional synthesized sound effects with a locally saved mute preference; no remote or third-party audio assets
- No account, external analytics, third-party runtime assets, or network API

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
