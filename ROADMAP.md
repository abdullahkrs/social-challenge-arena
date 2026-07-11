# Roadmap

## Current repository state

Active MVP development.

## MVP stages

1. Repository bootstrap and quality baseline — complete.
2. Mobile-first landing/discovery state — complete.
3. First playable curated challenge — complete.
4. Focused score/result state — next.
5. Share or copy challenge/result link.
6. Friend attempt opened from the shared link.
7. Original-player and friend comparison.
8. Share-again action from the comparison.
9. Basic privacy-safe MVP event instrumentation.
10. Curated challenge variety.
11. Lightweight private challenge creation.

## Completed stage evidence

### Stage 1

- Runnable static application baseline.
- Focused tests and repeatable build.
- GitHub Pages-ready `docs/` output.
- Project operating and tracking documents.
- GitHub Actions is temporarily unavailable by explicit owner direction.

### Stage 2

- Concise mobile-first product introduction.
- One visible curated challenge with category, difficulty, and duration.
- One working, accessible discovery action.
- No gameplay or later viral-loop features introduced early.

### Stage 3

- The Tap Sprint discovery action opens a real 20-second attempt.
- A deterministic state machine manages start, taps, countdown, completion, reset, and replay.
- Live timer and tap count provide immediate feedback.
- Taps after completion are ignored and the active timer is cancelled safely.
- Gameplay remains dependency-free and reusable by the next result stage.
