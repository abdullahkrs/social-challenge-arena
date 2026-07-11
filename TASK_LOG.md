# Task Log

Historical completed cycles 1–6 are preserved in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md), Cycles 7–8 in [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md), Cycle 9 in [`TASK_LOG_ARCHIVE_CYCLE_9.md`](TASK_LOG_ARCHIVE_CYCLE_9.md), Cycle 10 in [`TASK_LOG_ARCHIVE_CYCLE_10.md`](TASK_LOG_ARCHIVE_CYCLE_10.md), Cycle 11 in [`TASK_LOG_ARCHIVE_CYCLE_11.md`](TASK_LOG_ARCHIVE_CYCLE_11.md), Cycle 12 in [`TASK_LOG_ARCHIVE_CYCLE_12.md`](TASK_LOG_ARCHIVE_CYCLE_12.md), Cycle 13 in [`TASK_LOG_ARCHIVE_CYCLE_13.md`](TASK_LOG_ARCHIVE_CYCLE_13.md), Cycle 14 in [`TASK_LOG_ARCHIVE_CYCLE_14.md`](TASK_LOG_ARCHIVE_CYCLE_14.md), Cycle 15 in [`TASK_LOG_ARCHIVE_CYCLE_15.md`](TASK_LOG_ARCHIVE_CYCLE_15.md), and Cycle 16 in [`TASK_LOG_ARCHIVE_CYCLE_16.md`](TASK_LOG_ARCHIVE_CYCLE_16.md). This file remains the active source of truth for the current cycle.

## Cycle 17

- **Date/time:** 2026-07-12T02:41:33+03:00
- **Status:** in progress
- **Selected task:** Define one manual, privacy-safe experiment for validating the complete social loop with the existing eleven session counters.
- **Goal:** Turn the existing counters into a controlled two-person protocol with exact role-specific expectations, aggregate-only recording, conversion formulas, success thresholds, and decision rules.
- **Why selected:** No pull request or unfinished cycle is open, every MVP roadmap stage is complete, and Cycle 16 explicitly identified this as the next evidence step. Adding another mechanic before measuring the loop would broaden scope without evidence.
- **Viral-loop impact:** The experiment measures where a sharer-and-friend pair drops between discovery and successful re-sharing, so the next product cycle can target one observed bottleneck instead of guessing.

### Acceptance criteria

- Add one active experiment with a clear hypothesis, fixed challenge, sample size, role separation, procedure, valid-session rules, privacy boundary, and stop criteria.
- Use all eleven allowlisted counters without changing application code or the collection boundary.
- Define exact expected counter snapshots for one sharer session and one friend session.
- Define aggregate conversion formulas for initial play, first share, link opening, friend completion, comparison, re-share attempt, successful re-share, and end-to-end loop closure.
- Record only cohort-level integer totals and predefined blocker-category counts; prohibit names, contact details, handles, pair/session identifiers, scores, links, timestamps, screenshots, device data, and free-text participant quotes.
- Define pass, iterate, and blocked decision rules that choose at most one next product bottleneck.
- Keep all gameplay, sharing, metrics code, preview files, motion, accessibility, dependencies, and architecture unchanged.
- Review the final documentation diff for internal consistency, privacy, scope, secrets, and misleading claims.

### Expected files

- `EXPERIMENTS.md`
- `METRICS.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLE_16.md`

### Intentional non-goals

- No participant recruitment or fabricated experiment result.
- No analytics service, backend, persistence, cookie, identity, consent UI, dashboard, URL logging, score logging, timestamp, device fingerprint, dependency, framework, gameplay change, new mechanic, visual redesign, animation change, or shared-link schema change.

### Strategic review

- The MVP loop and four-mechanic minimum are already complete.
- The smallest high-impact next step is an executable evidence protocol, not another feature.
- Role-specific fresh sessions prevent mixed `challenge_started` and `challenge_completed` counters from making ordinary and friend paths ambiguous.
- Aggregate-only manual tallies preserve the existing privacy boundary while still exposing stage conversion.

### Product thinking

1. A controlled pair protocol can validate the loop without adding telemetry infrastructure.
2. A single fixed challenge reduces gameplay variance while the social handoff is being tested.
3. Fresh one-attempt sessions make expected snapshots deterministic and auditable.
4. Separate sharer and friend aggregate totals allow the shared counters to be interpreted correctly.
5. Parked idea: a remote or persistent analytics pilot only after the manual experiment produces a concrete bottleneck and an explicit privacy decision.
