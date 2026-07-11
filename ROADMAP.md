# Roadmap

## Current repository state

Active MVP development.

## MVP stages

1. Repository bootstrap and quality baseline — complete.
2. Mobile-first landing/discovery state — complete.
3. First playable curated challenge — complete.
4. Focused score/result state — complete.
5. Share or copy challenge/result link — complete.
6. Friend attempt opened from the shared link — complete.
7. Original-player and friend comparison — next.
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

### Stage 4

- Completion transitions into a dedicated mobile-first result view.
- The validated final tap count is the dominant result information.
- Concise deterministic feedback avoids fabricated rankings or records.
- Replay begins a clean attempt and the secondary action resets to discovery.
- Result values are written with safe DOM text APIs and announced accessibly.

### Stage 5

- The focused result view exposes one primary share action.
- A canonical fragment URL carries only a bounded version, challenge ID, score, and duration.
- Strict parsing rejects malformed, duplicate, extra, unsupported, mismatched, or oversized state.
- Web Share is preferred, clipboard is the fallback, and a visible validated link remains available when neither succeeds.
- Friend-attempt presentation and comparison remain deferred to their roadmap stages.

### Stage 6

- A valid shared Tap Sprint result opens a dedicated mobile-first friend invitation.
- The validated challenge title, target score, and duration are rendered through safe DOM text properties.
- One primary action starts the same 20-second challenge while retaining the target context in memory.
- Dismissing or leaving the invitation removes the shared fragment and returns to ordinary discovery.
- Completing the friend attempt uses the existing result state; comparison and share-again behavior remain deferred.
