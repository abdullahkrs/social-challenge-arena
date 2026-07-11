# Social Challenge Arena

A mobile-first social challenge MVP designed around one loop:

Discover → Play → Result → Share → Friend Competes → Compare → Share Again

## Current state

The repository includes a mobile-first discovery screen, the playable 20-second Tap Sprint challenge, a focused score/result state, and a validated share-or-copy result link. A friend opening a valid shared link sees the target, can complete the same attempt without login, and receives a deterministic side-by-side comparison. From comparison, the friend can share their validated score as the next target using the same strict URL and browser-sharing fallbacks, completing the first end-to-end loop.

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

## Preview

GitHub Pages target:

`https://abdullahkrs.github.io/social-challenge-arena/`
