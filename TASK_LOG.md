# Task Log

Historical completed cycles 1–6 are preserved in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md), Cycles 7–8 in [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md), Cycle 9 in [`TASK_LOG_ARCHIVE_CYCLE_9.md`](TASK_LOG_ARCHIVE_CYCLE_9.md), Cycle 10 in [`TASK_LOG_ARCHIVE_CYCLE_10.md`](TASK_LOG_ARCHIVE_CYCLE_10.md), Cycle 11 in [`TASK_LOG_ARCHIVE_CYCLE_11.md`](TASK_LOG_ARCHIVE_CYCLE_11.md), Cycle 12 in [`TASK_LOG_ARCHIVE_CYCLE_12.md`](TASK_LOG_ARCHIVE_CYCLE_12.md), Cycle 13 in [`TASK_LOG_ARCHIVE_CYCLE_13.md`](TASK_LOG_ARCHIVE_CYCLE_13.md), and Cycle 14 in [`TASK_LOG_ARCHIVE_CYCLE_14.md`](TASK_LOG_ARCHIVE_CYCLE_14.md). This file remains the active source of truth for the current cycle.

## Cycle 15

- **Date/time:** 2026-07-12T00:42:31+03:00
- **Status:** in progress
- **Selected task:** Add one original three-lane dodge challenge named Lane Guard.
- **Goal:** Add a genuinely different mechanic where the player chooses among three lanes to avoid six deterministic incoming obstacles, earns bounded points for cleared waves, receives clear collision feedback, and completes the existing result, sharing, friend-attempt, comparison, metrics, and navigation loop.
- **Why selected:** No pull request is open, Cycle 14 is merged and closed, Roadmap Stage 10 is the earliest incomplete stage, and the previous cycle identifies one lane-dodge challenge as the next smallest diversity task.
- **Viral-loop impact:** A short “clear all six waves” score creates an immediately understandable friend target and a strong replay motive without adding identity or a separate social system.

### Acceptance criteria

- Add one frozen `lane-guard` definition without changing existing challenge IDs.
- Lane Guard must differ materially from tap count, center timing, and sequence memory through three-lane movement decisions, incoming obstacle paths, collision failure, and per-wave survival scoring.
- Use six deterministic obstacle waves; each cleared wave awards 100 points for a strict maximum of 600.
- Add purposeful obstacle approach movement and explicit clear/hit feedback with text equivalents.
- Add a `prefers-reduced-motion` mode using slower discrete obstacle steps without changing decisions or scoring.
- Preserve native keyboard-accessible controls, visible focus, readable contrast, text lane announcements, and at least 44×44 CSS-pixel targets.
- Cancel all movement and feedback timers on reset, replay/reconfiguration, navigation, collision, completion, and destroy.
- Reuse the existing discovery, result, strict shared-link codec, friend invitation, comparison, share-again, metrics, and navigation systems.
- Reject shared Lane Guard scores above 600 while preserving existing validation.
- Add focused tests for deterministic progression, lane choices, collision, scoring, reduced motion, timer cancellation, shared-state bounds, accessibility, and loop reuse.
- Synchronize `app.js` and `docs/app.js` exactly.

### Expected files

- `app.js`
- `docs/app.js`
- `test/challenge-variety.test.js`
- `test/dodge-mechanic.test.js`
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLE_14.md`

### Intentional non-goals

- No second mechanic, replacement of existing challenge IDs, private-creation expansion, login, identity, leaderboard, persistence, backend, analytics destination, dependency, framework, broad redesign, audio requirement, copied game identity, shared-link schema expansion, or unrelated refactor.

### Strategic review

- The direction remains aligned with the discover-to-share-again north star.
- The largest product bottleneck is the missing fourth genuinely different mechanic.
- The largest delivery risk is stale obstacle timers or inaccessible visual-only collision state.
- No new evidence invalidates the reopened Stage 10 plan.
- One small deterministic lane-dodge adapter is the highest-impact task; no second mechanic will be started.

### Product thinking

1. Mechanical repetition is the remaining blocker to the minimum curated-variety gate.
2. Six short waves give the original player an obvious “perfect clear” replay goal.
3. A friend can understand “switch lanes and beat 400 points” within seconds.
4. The smallest proof is one data-driven Lane Guard definition and one reusable dodge state machine integrated into the current loop.
5. Parked idea: a future rhythm mechanic could replace one cosmetic tap variant after this cycle, but it is outside this task.
