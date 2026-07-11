# Changelog

## 0.10.0 — 2026-07-11

### Added

- Six playable curated challenges across Speed, Rhythm, and Endurance.
- Easy and Hard choices backed by frozen data-driven definitions.
- A compact keyboard-accessible challenge selector with one primary play action.
- Focused catalog, challenge-link round-trip, and duration-mismatch tests.

### Changed

- Gameplay, result, sharing, friend entry, comparison, and share-again now preserve the selected curated challenge.
- Shared-link validation now accepts only allowlisted challenge IDs with their exact configured duration.
- The GitHub Pages preview now includes the synchronized multi-challenge catalog.

### Privacy and scope

- No login, identity, storage, backend, external analytics destination, custom challenge input, dependency, framework, or new scoring mechanic was added.

## 0.9.0 — 2026-07-11

### Added

- Dependency-free allowlisted in-memory counters for the completed viral loop.
- Separate ordinary-discovery and validated shared-link entry counts.
- Focused tests for event transitions, successful-share counting, and forbidden persistence or network sinks.

### Changed

- The build and GitHub Pages preview now include `metrics.js` after the application script.
- Stage 9 documentation now defines the implemented privacy boundary and aggregate event meanings.

### Privacy

- No event payload, score, URL, timestamp, identity, device data, cookie, persistent storage, network request, backend, or third-party analytics destination was added.

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
