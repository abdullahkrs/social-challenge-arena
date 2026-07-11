# Social Challenge Arena

A mobile-first social challenge MVP designed around one loop:

Discover → Play → Result → Share → Friend Competes → Compare → Share Again

## Current state

The no-login social loop and lightweight private challenge creation are implemented. The curated catalog contains six playable entries across Speed, Rhythm, and Endurance labels, but all six currently reuse the same timed tap-count mechanic.

A friend opening a valid curated or private link sees the exact challenge, target score, and duration, can compete without login, receives a deterministic side-by-side comparison, and can share their validated score as the next target.

The completed loop has dependency-free privacy-safe instrumentation on the curated entry. It keeps only allowlisted aggregate event counts in memory. The product does not send analytics requests, set cookies, use persistent storage, or record identities, device data, or personal data.

## Curated challenges

- Speed: Tap Sprint (Easy), Turbo Tap (Hard)
- Rhythm label: Rhythm Rush (Easy), Tempo Storm (Hard)
- Endurance: Tap Marathon (Easy), Endurance Blitz (Hard)

These are six distinct challenge definitions and shared-link identities, but they are not yet six distinct games. Title, category, duration, difficulty, description, and speed differences do not count as new mechanics.

Curated variety is therefore in progress. Completion requires at least six playable entries and at least four genuinely different mechanics that materially change player decisions, timing, input, failure conditions, or scoring while reusing the existing result, sharing, friend-attempt, comparison, and share-again flow.

## Private challenge

Open `create.html` or use **Create private challenge** from discovery. Private challenge titles are normalized to 3–24 ASCII letters, numbers, and spaces. Durations are restricted to 10, 20, or 30 seconds. The challenge and result exist only in the validated link and current page memory.

Private creation currently uses the timed tap-count mechanic. It does not provide arbitrary executable rules or a separate game engine.

## Run

Open `index.html` directly in a browser.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```

The build creates `dist/` and synchronizes `docs/` for GitHub Pages.

## Metrics

For local inspection during a curated page session, the non-enumerable `window.socialChallengeMetrics` collector exposes `snapshot()`. Counts reset when the page reloads and are not transmitted or persisted.

## Preview

GitHub Pages target:

`https://abdullahkrs.github.io/social-challenge-arena/`
