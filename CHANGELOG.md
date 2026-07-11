# Changelog

## 0.9.0 — 2026-07-11

### Added

- Strict allowlisted session events for the complete viral-loop milestones.
- Dependency-free in-memory per-event counts with a fixed non-identifying payload.
- Focused tests for event validation, payload boundaries, counter behavior, failure isolation, and loop wiring.

### Changed

- Successful result and comparison sharing now emit completion milestones only after Web Share or clipboard succeeds.
- Project documentation now defines the instrumentation privacy and reliability boundaries.

## 0.8.0 — 2026-07-11

### Added

- One primary `Share your score` action on the completed friend comparison.
- Strict comparison-state revalidation before creating the next challenge link.
- Focused tests for friend-score promotion, malformed comparison rejection, and share-again structure.

### Changed

- The friend’s validated completed score now becomes the next Tap Sprint target.
- Comparison sharing reuses the existing Web Share, clipboard, and visible validated-link fallbacks.
- The baseline accessibility test now checks the labelled discovery view instead of requiring a stale label on the main landmark.

## 0.7.0 — 2026-07-11

### Added

- Dedicated mobile-first original-player versus friend score comparison.
- Side-by-side validated target and friend scores.
- Deterministic beat, tie, and short outcome feedback.
- Focused comparison validation, routing, accessibility, and mobile-layout tests.

### Changed

- Completed friend attempts now open comparison instead of the ordinary result view.
- Replaying from comparison retains the validated shared target.
- Returning to challenges clears shared context; share-again remains deferred.

## 0.6.0 — 2026-07-11

### Added

- Dedicated mobile-first invitation for valid shared Tap Sprint results.
- Validated target score, challenge identity, duration, and accessible friend-entry announcement.
- Primary `Try to beat it` and secondary `Browse challenges` actions.
- Focused friend-invitation and fragment-cleanup tests.

### Changed

- Valid shared links now open a friend challenge entry instead of ordinary discovery.
- Dismissing or leaving shared context removes the fragment safely.
- Friend attempts reuse the existing gameplay and result states; comparison remains deferred.

## 0.5.0 — 2026-07-11

### Added

- One primary `Share score` action on the Tap Sprint result view.
- Strict versioned result-link creation and parsing.
- Web Share, clipboard, and visible-link fallback behavior.
- Accessible share-status announcements and focused URL/share tests.

### Changed

- Invalid incoming result fragments are removed before they can be consumed.
- Replay and discovery remain available as secondary result actions.

## 0.4.0 — 2026-07-11

### Added

- Dedicated mobile-first Tap Sprint score/result view.
- Validated deterministic score feedback without fabricated rankings or records.
- Accessible completed-score announcement.
- Focused result-summary and result-structure tests.

### Changed

- Completed attempts now leave gameplay and show the final score with replay and return actions.

## 0.3.0 — 2026-07-11

### Added

- Playable 20-second Tap Sprint challenge.
- Live countdown and tap counter.
- Safe completion, replay, and return-to-discovery controls.
- Focused gameplay lifecycle tests.

### Changed

- The discovery action now starts the challenge instead of revealing placeholder details.

## 0.2.0 — 2026-07-11

### Added

- Mobile-first landing and challenge discovery state.
- Featured Tap Sprint challenge metadata.
- Accessible challenge-detail toggle.
- Focused landing discovery tests.

### Changed

- GitHub Actions is temporarily unavailable by repository-owner direction.

## 0.1.0 — 2026-07-11

### Added

- Minimal mobile-first application baseline.
- Node built-in tests.
- Static build output and GitHub Pages synchronization.
- Initial project tracking and governance documents.
