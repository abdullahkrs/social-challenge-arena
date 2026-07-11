# Social Challenge Arena

A mobile-first social challenge MVP designed around one loop:

Discover → Play → Result → Share → Friend Competes → Compare → Share Again

## Current state

The no-login social loop and lightweight private challenge creation are implemented. The curated catalog contains eight playable entries across Speed, Rhythm, Endurance, Timing, and Memory, backed by three genuinely different mechanics: timed tap count, three-stop center timing, and growing visual-sequence recall.

A friend opening a valid curated or private link sees the exact challenge, target score, and format, can compete without login, receives a deterministic side-by-side comparison, and can share their validated score as the next target.

The completed loop has dependency-free privacy-safe instrumentation on the curated entry. It keeps only allowlisted aggregate event counts in memory. The product does not send analytics requests, set cookies, use persistent storage, or record identities, device data, or personal data.

## Curated challenges

- Speed: Tap Sprint (Easy), Turbo Tap (Hard)
- Rhythm label: Rhythm Rush (Easy), Tempo Storm (Hard)
- Endurance: Tap Marathon (Easy), Endurance Blitz (Hard)
- Timing: Center Snap (Easy)
- Memory: Signal Echo (Easy)

The first six definitions reuse timed tap count. Center Snap asks the player to stop a moving marker three times and scores distance from the center. Signal Echo shows four growing patterns of 2, 3, 4, and 5 signals; the player repeats them with four native buttons, earns 100 points per correct signal, and immediately ends the attempt after a wrong choice.

Center Snap uses purposeful marker movement and centered/near/missed feedback. Signal Echo uses purposeful sequence playback and correct/incorrect input feedback. With `prefers-reduced-motion`, Center Snap uses slower discrete marker steps, while Signal Echo uses longer still signal states and suppresses transform and shake animation. Both preserve text feedback, keyboard control, bounded scoring, safe timer cleanup, and the same social competition loop.

Curated variety remains in progress. Completion requires at least six playable entries and at least four genuinely different mechanics that materially change player decisions, timing, input, failure conditions, or scoring while reusing the existing result, sharing, friend-attempt, comparison, and share-again flow.

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
