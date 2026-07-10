# Changelog

## 0.3.0 — 2026-07-10

### Added

- Added `npm run build` for static preview validation.
- Added `scripts/build.js` to fail the build when required preview files are missing.
- Added GitHub Actions CI workflow to run tests, build the static preview, and upload the build artifact.
- Documented the expected GitHub Pages preview URL and the current Pages deployment limitation.

### Notes

The CI workflow verifies that the system can be built. A direct GitHub Pages deployment workflow was attempted but blocked by connector safety checks around Pages deployment permissions, so the current preview output is available as a GitHub Actions artifact.

## 0.2.0 — 2026-07-10

### Added

- Added the first playable challenge: a mobile-first 10-second tap sprint.
- Added local countdown, scoring, deadline enforcement, final result, and replay.
- Added unit tests for challenge scoring, expiry, and reset behavior.

### Notes

The score is local only. Share links, friend attempts, and comparison remain intentionally deferred.

## 0.1.0 — 2026-07-09

### Added

- Added a static mobile-first landing page in `index.html`.
- Added one clear CTA: `Start a sample challenge`.
- Added Node smoke tests for the landing page promise, MVP loop, and no-login constraint.
- Added `package.json` test script.

### Notes

The landing page is not yet a playable challenge. The next cycle should turn the CTA into the first playable score-based challenge.

## 0.0.0 — 2026-07-09

### Added

- Initialized product strategy for Social Challenge Arena.
- Selected one-link friend challenge templates as the starting MVP direction.
- Defined viral loop, product hypothesis, MVP scope, out-of-scope boundaries, roadmap, experiments, and metrics.
- Added repository hygiene files.

### Notes

No runnable application exists yet. This release is a strategy and repository initialization milestone.
