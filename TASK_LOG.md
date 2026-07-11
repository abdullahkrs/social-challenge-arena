# Task Log

Historical completed cycles are preserved in the cycle archive files. This file is the active source of truth for the current cycle.

## Cycle 14

- **Date/time:** 2026-07-12T00:08:32+03:00
- **Status:** planned; implementation pending
- **Selected task:** Add one original short visual-memory challenge named Signal Echo.
- **Goal:** Add a genuinely different mechanic where the player watches and repeats four growing symbol sequences, receives a bounded points score, and completes the existing result, sharing, friend-attempt, comparison, metrics, and navigation loop.
- **Why selected:** No open pull request exists. Cycle 13 is merged, Roadmap Stage 10 is the earliest incomplete stage, and the archived next task identifies a short visual-memory mechanic as the smallest high-impact continuation.
- **Viral-loop impact:** A memory challenge broadens replay and sharing appeal beyond tapping and timing while preserving a simple score friends can understand and beat without login.

### Acceptance criteria

- Add one frozen `signal-echo` curated definition without removing or invalidating existing IDs.
- Signal Echo must differ materially from tap count and Center Snap through sequence observation, ordered multi-button recall, incorrect-choice failure, and per-round points scoring.
- Use four deterministic growing sequences and award 1,000 points for each fully repeated round, bounded from 0 to 4,000 points.
- Add purposeful sequence-pad playback and immediate correct/incorrect round feedback.
- Provide a `prefers-reduced-motion` mode with slower discrete pad states and no scale, pulse, or transition animation while preserving the same rules and text feedback.
- Cancel all playback and feedback timers on restart, replay/reconfiguration, navigation, completion, reset, and destroy.
- Preserve keyboard activation, visible focus, semantic announcements, readable contrast, non-color labels, and touch targets of at least 44×44 CSS pixels.
- Reuse the existing result, strict shared-link codec, friend invitation, comparison, share-again, metrics, and navigation systems without duplicating them.
- Reject Signal Echo shared scores above 4,000 while preserving current bounds for other challenges.
- Add focused behavior tests for sequence lifecycle, scoring, incorrect choices, reduced motion, timer cancellation, strict shared-state bounds, accessibility structure, and shared-loop reuse.
- Synchronize changed source and `docs/` preview assets.

### Expected files

- `app.js`
- `index.html`
- `styles.css`
- `docs/app.js`
- `docs/index.html`
- `docs/styles.css`
- `test/challenge-variety.test.js`
- `test/memory-mechanic.test.js`
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLE_13.md`

### Explicit non-goals

No second new mechanic, replacement of existing challenge IDs, random or user-authored sequence engine, audio requirement, separate result/share/comparison flow, private-creation expansion, login, identity, leaderboard, persistence, backend, analytics destination, dependency, framework, architecture migration, broad redesign, copied game identity, or unrelated refactor.

### Strategic review

- Direction remains aligned with the discover-to-share-again north star.
- The largest product bottleneck is still insufficient genuine mechanic diversity: two mechanics exist against the four-mechanic completion gate.
- The largest delivery risk is introducing a memory game that duplicates product-loop systems or leaves scheduled playback running after navigation.
- No new evidence invalidates the reopened Stage 10 plan.
- One deterministic memory mechanic is the highest-impact small task; no second mechanic will begin.

### Product thinking

1. Mechanical repetition still blocks curated-variety completion.
2. A four-round growing recall challenge gives the original player a visibly different skill test and a clear replay goal.
3. A friend can understand “repeat the signals and beat these points” within seconds.
4. The smallest proof is one data-driven challenge, one isolated memory state machine, and one reusable board integrated with the existing social loop.
5. Parked idea: add a lane-dodge mechanic in a later cycle after Signal Echo is merged and verified.
