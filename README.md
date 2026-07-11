# Social Challenge Arena

A mobile-first social challenge MVP designed around one loop:

Discover → Play → Result → Share → Friend Competes → Compare → Share Again

## Current state

The repository includes a mobile-first discovery screen, the playable 20-second Tap Sprint challenge, a focused score/result state, and a validated share-or-copy result link. A friend opening a valid shared link sees the target, can complete the same attempt without login, receives a deterministic side-by-side comparison, and can share their validated score as the next target.

The completed loop now has dependency-free privacy-safe instrumentation. It keeps only allowlisted aggregate event counts in memory. It does not send network requests, set cookies, use persistent storage, or record scores, URLs, timestamps, identities, device data, or personal data.

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
