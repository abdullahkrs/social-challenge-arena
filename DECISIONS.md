# Decisions

## D-001 — Static MVP baseline

Use static HTML, CSS, and vanilla JavaScript with Node.js 20 for tests and build.

**Reason:** It is the smallest architecture that can validate the initial social challenge loop without framework, dependency, backend, or deployment complexity.

## D-002 — GitHub Pages preview

Generate `docs/` from source during build and use it as the GitHub Pages preview source.

**Reason:** It keeps preview hosting free and compatible with the public repository while preserving a separate `dist/` artifact.

## D-003 — Separate successful Share Again completion

Keep `share_completed` for successful sharing from the ordinary result and add `share_again_completed` for successful sharing from comparison. Both remain allowlisted aggregate integer counters in page memory only.

**Reason:** The product north star ends when a friend successfully shares their comparison score again. Combining both success paths in one counter prevents direct measurement of that final loop step. A separate session-local integer is the minimum evidence-ready correction and does not add payloads, identity, timestamps, URLs, persistence, cookies, network delivery, or an analytics service.
