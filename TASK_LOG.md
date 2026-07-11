# Task Log

Historical completed cycles 1–6 are preserved in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md), Cycles 7–8 in [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md), Cycle 9 in [`TASK_LOG_ARCHIVE_CYCLE_9.md`](TASK_LOG_ARCHIVE_CYCLE_9.md), Cycle 10 in [`TASK_LOG_ARCHIVE_CYCLE_10.md`](TASK_LOG_ARCHIVE_CYCLE_10.md), Cycle 11 in [`TASK_LOG_ARCHIVE_CYCLE_11.md`](TASK_LOG_ARCHIVE_CYCLE_11.md), Cycle 12 in [`TASK_LOG_ARCHIVE_CYCLE_12.md`](TASK_LOG_ARCHIVE_CYCLE_12.md), and Cycle 13 in [`TASK_LOG_ARCHIVE_CYCLE_13.md`](TASK_LOG_ARCHIVE_CYCLE_13.md). This file remains the active source of truth for the current cycle.

## Cycle 14

- **Date/time:** 2026-07-11T23:43:29+03:00
- **Status:** planned; implementation in progress
- **Selected task:** Add one original short visual-memory sequence challenge named Signal Echo.
- **Goal:** Add a genuinely different memory mechanic where the player watches and repeats a growing four-round signal sequence, receives a bounded points score, and completes the existing result, sharing, friend-attempt, comparison, metrics, and navigation loop.
- **Why selected:** No pull request is open. Cycle 13 is merged into `main`, Roadmap Stage 10 is the earliest incomplete stage, and the previous cycle explicitly identified a visual-memory mechanic as the next smallest diversity task.
- **Viral-loop impact:** A short, easily understood recall challenge adds a new reason to replay and share while preserving a direct “beat this score” friend competition.

### Acceptance criteria

- Add one frozen Signal Echo curated definition without removing or changing existing challenge IDs.
- Differ materially from tap count and center timing through sequence observation, ordered multi-button input, immediate failure on a wrong choice, and cumulative per-signal scoring.
- Use four rounds with pattern lengths 2, 3, 4, and 5; award 100 points per correct signal for a bounded maximum of 1,400.
- Add purposeful sequence playback and immediate correct/incorrect feedback.
- Respect `prefers-reduced-motion` with slower still signal steps and no transform or shake animation.
- Use native keyboard-accessible buttons, visible focus, text announcements, readable contrast, and touch targets of at least 44×44 CSS pixels.
- Cancel playback and feedback timers on reset, replay/reconfiguration, navigation, completion, and destroy.
- Reuse the existing discovery, result, strict shared-link codec, friend invitation, comparison, share-again, metrics, and navigation systems.
- Reject shared Signal Echo scores above 1,400 while preserving existing challenge validation.
- Add focused tests for sequence progression, scoring, incorrect input, reduced motion, timer cancellation, shared-state bounds, and loop reuse.
- Keep changed source and `docs/` preview files synchronized.

### Expected files

- `app.js`
- `docs/app.js`
- `test/challenge-variety.test.js`
- `test/memory-mechanic.test.js`
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLE_13.md`

### Explicit non-goals

- No second mechanic, challenge-ID replacement, private-creation expansion, account, identity, leaderboard, persistence, backend, analytics destination, dependency, framework, broad redesign, audio requirement, copied game identity, or unrelated refactor.

### Strategic review

- The direction remains aligned with the discover-to-share-again north star.
- The largest product bottleneck is still insufficient genuine mechanic diversity.
- The largest delivery risk is duplicating social-loop systems or leaving memory playback timers alive after navigation.
- No new evidence invalidates the reopened Stage 10 plan.
- One visual-memory mechanic is the highest-impact small task and no second mechanic will be started.

### Product thinking

1. Mechanical repetition blocks the curated-variety completion gate.
2. A growing sequence gives the original player a clear replay goal and a compact shareable score.
3. A friend can understand “repeat the pattern and beat 900 points” within seconds.
4. The smallest proof is one data-driven Signal Echo definition and one reusable memory state machine integrated into the current loop.
5. Parked idea: add an original lane-dodge mechanic in a later cycle after Signal Echo is merged and verified.
