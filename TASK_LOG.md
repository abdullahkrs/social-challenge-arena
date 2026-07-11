# Task Log

Historical completed cycles 1–6 are preserved byte-for-byte in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md). Completed cycles 7–8 are preserved byte-for-byte in [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md). This file remains the active source of truth for the current and subsequent development cycle.

## Cycle 9

- **Date/time:** 2026-07-11T18:42:06+03:00
- **Status:** in progress
- **Selected task:** Add basic privacy-safe in-memory event instrumentation for the completed viral loop.
- **Goal:** Record allowlisted aggregate funnel counts in memory only so the completed loop can be measured without identity, cookies, persistence, personal data, or a third-party destination.
- **Why selected:** Cycle 8 was complete on `main`, no continuity pull request was open, and privacy-safe instrumentation was the earliest incomplete roadmap stage.
- **Viral-loop impact:** Makes Discover → Play → Result → Share → Friend Competes → Compare → Share Again measurable while preserving the no-login, privacy-first MVP.

### Acceptance criteria

- Instrument only the planned allowlisted funnel events: `challenge_viewed`, `challenge_started`, `challenge_completed`, `result_viewed`, `share_attempted`, `share_completed`, `shared_link_opened`, `friend_completed`, `comparison_viewed`, and `share_again_attempted`.
- Store only aggregate integer counts in memory; do not record event payloads, scores, URLs, fragments, timestamps, identities, device data, or personal data.
- Add no network request, analytics SDK, cookie, local storage, session storage, backend, or third-party destination.
- Count ordinary discovery and validated shared-link entry separately, then count the existing gameplay, result, friend-completion, comparison, share, and share-again transitions.
- Count `share_completed` only after the existing UI reports a successful Web Share or clipboard copy; cancellation and unavailable fallbacks must not count as completion.
- Load instrumentation after the existing application script without changing product behavior or the visible interface.
- Include the instrumentation module in the existing build and synchronize generated `docs/` preview files.
- Add focused behavior and privacy tests, run the complete test/build commands, and inspect the full diff.
- Preserve the current mobile layout and primary actions at 320px and 390px because this task introduces no visual element.

### Expected files

- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLES_7_8.md`
- `metrics.js`
- `index.html`
- `scripts/build.js`
- `test/instrumentation.test.js`
- `tests/baseline.test.js`
- `docs/index.html`
- `docs/metrics.js`
- `README.md`
- `ROADMAP.md`
- `METRICS.md`
- `CHANGELOG.md`

### Explicit non-goals

- No external analytics destination, network delivery, persistent storage, cookies, identifiers, login, backend, score or URL recording, user-facing metrics panel, challenge variety, challenge creation, dependency, framework, redesign, refactor, or unrelated cleanup.

### Strategic review

- The direction remains aligned with the north star because the first complete viral loop is now available and the next need is evidence about where users continue or stop.
- The largest product bottleneck is the absence of any privacy-safe loop measurement.
- The largest technical risk is accidentally collecting or persisting sensitive context; unavailable CI and interactive browser verification remain delivery limitations.
- No new evidence invalidated the static architecture, strict fragment state, or browser-sharing fallbacks.
- A small allowlisted in-memory counter is the highest-impact narrow implementation for Stage 9.

### Product thinking

1. Measurement is the remaining blocker to learning which completed-loop step needs improvement.
2. The original player experience should remain unchanged; invisible aggregate counters avoid adding friction before sharing.
3. A friend is more likely to trust and compete when the shared URL and score are not copied into analytics or persistent storage.
4. The smallest proof is one dependency-free allowlisted counter attached to existing DOM transitions and share outcomes.
5. Parked idea: consider an explicit privacy-reviewed analytics destination only after a separate product and architecture decision.
