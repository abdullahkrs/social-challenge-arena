# Social Challenge Arena

A mobile-first social challenge MVP designed around one loop:

Discover → Play → Result → Share → Friend Competes → Compare → Share Again

## Current state

The repository includes six playable curated tap challenges across Speed, Rhythm, and Endurance, plus lightweight private challenge creation. A player can enter one short safe name, choose a 10, 20, or 30 second round, play the existing tap mechanic, and share a validated private result link without login.

A friend opening a valid curated or private link sees the exact challenge, target score, and duration, can compete without login, receives a deterministic side-by-side comparison, and can share their validated score as the next target.

The completed loop has dependency-free privacy-safe instrumentation on the curated entry. It keeps only allowlisted aggregate event counts in memory. The product does not send analytics requests, set cookies, use persistent storage, or record identities, device data, or personal data.

## Curated challenges

- Speed: Tap Sprint (Easy), Turbo Tap (Hard)
- Rhythm: Rhythm Rush (Easy), Tempo Storm (Hard)
- Endurance: Tap Marathon (Easy), Endurance Blitz (Hard)

All six entries reuse the validated tap-count mechanic while preserving distinct allowlisted identities and durations in shared links.

## Private challenge

Open `create.html` or use **Create private challenge** from discovery. Private challenge titles are normalized to 3–24 ASCII letters, numbers, and spaces. Durations are restricted to 10, 20, or 30 seconds. The challenge and result exist only in the validated link and current page memory.

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
