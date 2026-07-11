# Task Log

Historical completed cycles 1–6 are preserved in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md), Cycles 7–8 in [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md), Cycle 9 in [`TASK_LOG_ARCHIVE_CYCLE_9.md`](TASK_LOG_ARCHIVE_CYCLE_9.md), Cycle 10 in [`TASK_LOG_ARCHIVE_CYCLE_10.md`](TASK_LOG_ARCHIVE_CYCLE_10.md), Cycle 11 in [`TASK_LOG_ARCHIVE_CYCLE_11.md`](TASK_LOG_ARCHIVE_CYCLE_11.md), Cycle 12 in [`TASK_LOG_ARCHIVE_CYCLE_12.md`](TASK_LOG_ARCHIVE_CYCLE_12.md), Cycle 13 in [`TASK_LOG_ARCHIVE_CYCLE_13.md`](TASK_LOG_ARCHIVE_CYCLE_13.md), and Cycle 14 in [`TASK_LOG_ARCHIVE_CYCLE_14.md`](TASK_LOG_ARCHIVE_CYCLE_14.md). This file remains the active source of truth for the current cycle.

## Cycle 15

- **Date/time:** 2026-07-12T01:08:06+03:00
- **Status:** planned and in progress
- **Selected task:** Add one original three-lane dodge challenge named Lane Drift.
- **Goal:** Add a genuinely different dodge mechanic where the player shifts between three lanes to avoid eight deterministic incoming barriers, receives a bounded points score, and completes the existing result, sharing, friend-attempt, comparison, metrics, and navigation loop.
- **Why selected:** No pull request is open. Cycle 14 is merged into `main`, Roadmap Stage 10 is the earliest incomplete stage, the catalog has only three genuine mechanics, and Cycle 14 explicitly identified a lane-dodge challenge as the next smallest diversity task.
- **Viral-loop impact:** A short spatial avoidance challenge creates an immediately understandable “clear more barriers than me” competition while adding replay tension without changing the social loop.

### Acceptance criteria

- Add one frozen `lane-drift` definition without removing or changing existing challenge IDs.
- Lane Drift must differ materially from tap count, center timing, and sequence memory through three-lane spatial choices, moving hazards, collision failure, and per-barrier scoring.
- Use three lanes and one deterministic eight-barrier sequence; each cleared barrier awards 100 points for a bounded maximum of 800, while a collision ends the attempt after clear textual feedback.
- Add at least two purposeful motion or feedback behaviors: barrier approach progression and player lane movement, plus clear or collision feedback.
- Add a `prefers-reduced-motion` mode using three slower discrete barrier states, still lane changes, no CSS transitions or keyframe feedback, and identical scoring.
- Preserve native keyboard-accessible lane buttons, visible focus, arrow-key alternatives, text naming of blocked and selected lanes, readable contrast, and controls at least 48 CSS pixels high.
- Cancel every approach and feedback timer on reset, replay/reconfiguration, navigation, completion, and destroy.
- Reuse the existing discovery, result, strict shared-link codec, friend invitation, comparison, share-again, privacy-safe metrics, and navigation systems.
- Reject shared Lane Drift scores above 800 while preserving existing validation.
- Add focused behavior tests for progression, lane choices, scoring, collision, reduced motion, timer cancellation, shared-state bounds, accessibility, and loop reuse.
- Keep `app.js` and `docs/app.js` synchronized and update factual product documentation.

### Expected files

- `app.js`
- `docs/app.js`
- `test/challenge-variety.test.js`
- `test/lane-dodge-mechanic.test.js`
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLE_14.md`

### Explicit non-goals

- No second new mechanic, challenge-ID replacement, private-creation expansion, account, identity, leaderboard, persistence, backend, analytics destination, dependency, framework, broad redesign, audio requirement, copied game identity, shared-link schema change, or unrelated refactor.

### Strategic review

- The direction remains aligned with the discover-to-share-again north star.
- The largest product bottleneck is the missing fourth genuine mechanic required to complete curated variety.
- The largest delivery risk is stale obstacle timers or inaccessible motion-only collision information.
- No new evidence invalidates the reopened Stage 10 plan.
- One compact lane-dodge adapter is the highest-impact small task; no second task will be started.

### Product thinking

1. Mechanical repetition still blocks the next validated product milestone.
2. A deterministic obstacle sequence gives the original player an obvious mastery and replay target.
3. A friend can understand “avoid eight barriers and beat 600 points” within seconds.
4. The smallest proof is one data-driven Lane Drift definition and one reusable dodge state machine integrated into the existing loop.
5. Parked idea: evaluate a precision or balance mechanic only after this cycle is merged and the roadmap state is reassessed.
