# Task Log

Historical completed cycles 1–6 are preserved in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md), Cycles 7–8 in [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md), Cycle 9 in [`TASK_LOG_ARCHIVE_CYCLE_9.md`](TASK_LOG_ARCHIVE_CYCLE_9.md), Cycle 10 in [`TASK_LOG_ARCHIVE_CYCLE_10.md`](TASK_LOG_ARCHIVE_CYCLE_10.md), Cycle 11 in [`TASK_LOG_ARCHIVE_CYCLE_11.md`](TASK_LOG_ARCHIVE_CYCLE_11.md), and Cycle 12 in [`TASK_LOG_ARCHIVE_CYCLE_12.md`](TASK_LOG_ARCHIVE_CYCLE_12.md). This file remains the active source of truth for the current cycle.

## Cycle 13

- **Date/time:** 2026-07-11T22:42:08+03:00
- **Status:** in progress
- **Selected task:** Add one original three-stop center-timing challenge named Center Snap.
- **Goal:** Add a genuinely different timing mechanic where the player stops a moving marker near the center over three rounds, receives a bounded points score, and completes the existing result, sharing, friend-attempt, comparison, metrics, and navigation loop.
- **Why selected:** No pull request or unfinished cycle is open. Roadmap Stage 10 is the earliest incomplete stage, and Cycle 12 explicitly identified center timing as the next smallest mechanic that proves genuine variety.
- **Viral-loop impact:** A visually distinct skill challenge gives players a stronger reason to replay and share, while friends can compete against the exact same bounded score through the validated link flow.

### Acceptance criteria

- Add Center Snap as an original curated challenge without removing or invalidating existing challenge IDs.
- Center Snap differs materially from timed tap count: the player makes three timing decisions, scoring each stop by distance from the center for a maximum of 3,000 points.
- Add purposeful moving-marker motion and immediate centered/near/missed hit feedback.
- Respect `prefers-reduced-motion` by using slower discrete marker steps and disabling decorative interpolation/feedback animation while preserving full gameplay and text feedback.
- Cancel movement and feedback timers on reset, replay, navigation, completion, and destroy.
- Preserve keyboard activation, visible focus, semantic status announcements, readable contrast, and at least 44×44 controls.
- Reuse the existing result, strict shared-link codec, friend invitation, comparison, share-again, metrics, and navigation systems.
- Present challenge-aware score units and round format so tap challenges continue to say taps while Center Snap says points and three stops.
- Reject Center Snap shared scores above 3,000 while preserving the existing global bound for tap challenges.
- Add focused behavior, validation, reduced-motion, timer-cancellation, structure, and source/preview parity tests.
- Keep source and `docs/` preview assets synchronized with no dependency, login, storage, backend, identity, or analytics expansion.

### Expected files

- `app.js`
- `index.html`
- `styles.css`
- `docs/app.js`
- `docs/index.html`
- `docs/styles.css`
- `test/challenge-variety.test.js`
- `test/timing-mechanic.test.js`
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLE_12.md`

### Explicit non-goals

- No second new mechanic, replacement of existing challenge IDs, private-creation expansion, public feed, account, identity, leaderboard, persistence, backend, analytics destination, dependency, framework, architecture migration, broad redesign, audio requirement, copied game identity, or unrelated refactor.

### Strategic review

- The direction remains aligned with the discover-to-share-again north star.
- The largest product bottleneck is still one-mechanic repetition in the curated catalog.
- The largest delivery risk is coupling a new score type to tap-specific labels or duplicated social-loop code.
- No new evidence invalidates the reopened Stage 10 plan.
- One timing challenge with a shared score adapter is the highest-impact small task.

### Product thinking

1. Mechanical repetition blocks the next curated-variety milestone.
2. A three-stop timing challenge creates fast replay tension and a clear shareable score.
3. A friend can understand “beat these points in three stops” within seconds.
4. The smallest proof is one data-driven Center Snap entry and one reusable timing state machine integrated into the existing loop.
5. Parked idea: add an original short visual-memory sequence mechanic in a later cycle after Center Snap is merged and verified.
