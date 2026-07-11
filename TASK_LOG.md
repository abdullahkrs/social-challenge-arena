# Task Log

Historical completed cycles 1–6 are preserved byte-for-byte in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md). Complete Cycle 7–8 records remain available through [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md), which links the immutable source commit and blob. This file remains the active source of truth for the current and subsequent development cycle.

## Cycle 9

- **Date/time:** 2026-07-11T19:07:17+03:00
- **Status:** in progress
- **Selected task:** Add basic privacy-safe session event instrumentation for the completed viral loop.
- **Goal:** Emit and count a strict allowlist of loop events in memory so the MVP can verify funnel behavior without identity, cookies, persistent storage, scores, URLs, free text, or a third-party analytics destination.
- **Why selected:** Cycles 1–8 are complete on `main`, no pull request is open, and privacy-safe instrumentation is the earliest incomplete roadmap stage.
- **Viral-loop impact:** Makes the completed Discover → Play → Result → Share → Friend Competes → Compare → Share Again loop measurable before challenge variety expands product scope.

### Acceptance criteria

- A frozen allowlist covers discovery, play, completion, result, sharing, shared-link entry, friend completion, comparison, and share-again milestones.
- A dependency-free recorder stores only per-event session counts and emits a fixed payload containing event name, the curated challenge ID, and that event’s session count.
- Unsupported event names are rejected before state mutation.
- Dispatch failures never interrupt gameplay, sharing, or navigation.
- No score, target, URL, timestamp, device data, identity, free text, cookie, browser storage, network request, or third-party destination is recorded.
- The existing loop records each milestone at the relevant deterministic state transition and records sharing completion only for successful Web Share or clipboard outcomes.
- Focused tests cover allowlist validation, bounded payload shape, count behavior, dispatch failure isolation, event wiring, and absence of persistence or network APIs.
- Source and generated `docs/` preview JavaScript remain synchronized.

### Expected files

- `app.js`
- `docs/app.js`
- `test/metrics.test.js`
- `README.md`
- `ROADMAP.md`
- `METRICS.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLES_7_8.md`

### Explicit non-goals

- No third-party analytics, endpoint, beacon, fetch request, database, cookie, local storage, session storage, identity, login, fingerprinting, personal data, score telemetry, URL telemetry, dashboard, consent banner, challenge variety, or challenge creation.
- No UI, layout, copy, shared-link schema, gameplay rule, dependency, framework, workflow, or architecture change.
- No broad refactor or unrelated cleanup.

### Strategic review

- The product direction remains aligned and the first complete viral loop is present on `main`.
- The largest product bottleneck is the absence of privacy-safe evidence about where a session advances or stops.
- The largest delivery risk remains unavailable automated CI and interactive deployed-preview verification.
- No evidence invalidates the static architecture, strict shared-state codec, or browser-sharing fallbacks.
- Session-only allowlisted instrumentation is the highest-impact narrow task before curated variety.

### Product thinking

1. The next core-loop step is blocked by the absence of observable milestone events rather than missing user-facing behavior.
2. Measuring result and share milestones can later show whether the original player reaches the invitation step without changing the experience.
3. Measuring shared-link opening, friend completion, comparison, and share-again can later show whether recipients continue the loop.
4. The smallest proof is one in-memory allowlisted recorder wired to existing deterministic transitions.
5. Parked idea: aggregate anonymous counters only after an explicit destination and privacy decision; do not add it in this cycle.
