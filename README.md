# Social Challenge Arena

A mobile-first social challenge MVP designed around one loop:

Discover → Play → Result → Share → Friend Competes → Compare → Share Again

## Current state

The repository includes a compact catalog of six playable curated tap challenges across Speed, Rhythm, and Endurance, with Easy and Hard choices. A player selects one challenge, completes its bounded timed round, receives a focused result, and can share a validated challenge-aware score link.

A friend opening a valid shared link sees the exact curated challenge, target score, and duration, can compete without login, receives a deterministic side-by-side comparison, and can share their validated score as the next target.

The completed loop has dependency-free privacy-safe instrumentation. It keeps only allowlisted aggregate event counts in memory. It does not send network requests, set cookies, use persistent storage, or record scores, URLs, timestamps, identities, device data, or personal data.

## Curated challenges

- Speed: Tap Sprint (Easy), Turbo Tap (Hard)
- Rhythm: Rhythm Rush (Easy), Tempo Storm (Hard)
- Endurance: Tap Marathon (Easy), Endurance Blitz (Hard)

All six entries reuse the validated tap-count mechanic while preserving distinct allowlisted identities and durations in shared links.

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

For local inspection during a page session, the non-enumerable `window.socialChallengeMetrics` collector exposes `snapshot()`. Counts reset when the page reloads and are not transmitted or persisted.

## Preview

GitHub Pages target:

`https://abdullahkrs.github.io/social-challenge-arena/`
