# Task Log

Historical completed cycles 1–6 are preserved in [`TASK_LOG_ARCHIVE_CYCLES_1_6.md`](TASK_LOG_ARCHIVE_CYCLES_1_6.md), Cycles 7–8 in [`TASK_LOG_ARCHIVE_CYCLES_7_8.md`](TASK_LOG_ARCHIVE_CYCLES_7_8.md), Cycle 9 in [`TASK_LOG_ARCHIVE_CYCLE_9.md`](TASK_LOG_ARCHIVE_CYCLE_9.md), and Cycle 10 in [`TASK_LOG_ARCHIVE_CYCLE_10.md`](TASK_LOG_ARCHIVE_CYCLE_10.md). This file remains the active source of truth for the current cycle.

## Cycle 11

- **Date/time:** 2026-07-11T20:40:37+03:00
- **Status:** in progress
- **Selected task:** Add lightweight no-login private tap challenge creation by link.
- **Goal:** Let a player enter one short safe challenge name, choose one bounded duration, play the existing tap mechanic, and share a validated private result link that a friend can open, compete against, compare, and share again.
- **Why selected:** Cycle 10 is complete on `main`, no pull request is open, and lightweight private creation is the earliest incomplete roadmap stage.
- **Viral-loop impact:** Gives a sharer a small sense of authorship while preserving the proven play, result, friend attempt, comparison, and share-again loop.

### Acceptance criteria

- Add a compact private-creation entry from discovery without replacing the curated catalog or its primary play action.
- Provide one private creation page using the existing timed tap mechanic.
- Accept only a normalized 3–24 character ASCII letter, number, and space title.
- Accept only 10, 20, or 30 second durations.
- Create strict versioned HTTP(S) fragment links containing only title, score, and duration.
- Reject malformed, duplicate, extra, oversized, unsupported-duration, invalid-title, and excessive-score state.
- Let a valid private link open a friend invitation, preserve the target through play, show deterministic comparison, and share the friend score as the next target.
- Use safe DOM text APIs; add no executable rules, login, identity, storage, backend, cookie, analytics destination, or dependency.
- Add focused behavior and source/preview parity tests.
- Keep all preview source files synchronized and check 320px and 390px layout constraints.

### Expected files

- `index.html`
- `create.html`
- `private.js`
- `private.css`
- `scripts/build.js`
- `test/private-creation.test.js`
- `test/branch-verification.test.js`
- `docs/index.html`
- `docs/create.html`
- `docs/private.js`
- `docs/private.css`
- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `TASK_LOG.md`
- `TASK_LOG_ARCHIVE_CYCLE_10.md`

### Explicit non-goals

- No public challenge discovery, accounts, profiles, author identity, moderation system, database, persistent drafts, arbitrary rules, executable text, new gameplay mechanic, analytics expansion, dependency, framework, architecture migration, broad redesign, or unrelated refactor.

### Strategic review

- The current direction remains aligned with the north star: the full curated loop works, and private-by-link creation is the final ordered MVP stage.
- The largest product bottleneck is that players can choose but cannot yet personalize a challenge.
- The largest technical risk is allowing untrusted custom state into links and DOM output.
- No new evidence invalidates the static architecture or existing tap mechanic.
- A separate compact creation page with a strict codec is the highest-impact small task because it avoids destabilizing the validated curated flow.

### Product thinking

1. The missing safe creation entry blocks the next and final ordered MVP step.
2. A short custom title makes the original player more likely to feel ownership and share.
3. A friend is more likely to compete when the invitation clearly shows the custom title, exact target, and duration.
4. The smallest proof is one title field, one fixed duration selector, the existing tap engine, and a strict private-result fragment codec.
5. Parked idea: add additional predefined mechanics only after evidence from private-link usage; do not implement it in this cycle.
