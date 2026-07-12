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

## D-004 — Retire the current challenge catalog and rebuild around arcade-quality games

Treat every currently shipped challenge as legacy and not part of the future product catalog. Do not spend further cycles polishing, reskinning, balancing, translating, or expanding those challenges.

Replace the catalog progressively with original, mobile-first arcade games that have a distinct player-controlled object, a visible animated world, meaningful physics or movement, escalating tension, clear failure and recovery, score feedback, and a satisfying result transition.

The replacement program must preserve the existing no-login social loop, strict shared-link validation, friend competition, comparison, share-again behavior, privacy-safe metrics, accessibility, and reduced-motion support.

Do not remove the final playable legacy fallback until at least one replacement game is complete, tested, preview-verified, and share-compatible. Once the first replacement is ready, hide all legacy challenges from discovery and keep only compatibility handling for already-shared legacy links until a later explicit removal decision.

**Reason:** User feedback shows that the existing challenges feel simple, repetitive, and visually unexciting despite meeting the previous mechanical-diversity threshold. The product now needs a quality reset rather than additional variants. Progressive replacement avoids leaving the product empty or breaking old shared links while still honoring the decision to cancel the current catalog.
