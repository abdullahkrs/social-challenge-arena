# Roadmap

## Current repository state

Active MVP development. The no-login social loop, lightweight private creation, and minimum curated challenge variety are implemented. The catalog has nine playable entries and four genuinely different mechanics: timed tap count, three-stop center timing, growing visual-sequence recall, and three-lane obstacle avoidance.

## MVP stages

1. Repository bootstrap and quality baseline — complete.
2. Mobile-first landing/discovery state — complete.
3. First playable curated challenge — complete.
4. Focused score/result state — complete.
5. Share or copy challenge/result link — complete.
6. Friend attempt opened from the shared link — complete.
7. Original-player and friend comparison — complete.
8. Share-again action from the comparison — complete.
9. Basic privacy-safe MVP event instrumentation — complete.
10. Curated challenge variety — complete.
11. Lightweight private challenge creation — complete.

## Completed stage evidence

### Stage 1

- Runnable static application baseline.
- Focused tests and repeatable build.
- GitHub Pages-ready `docs/` output.
- Project operating and tracking documents.
- GitHub Actions is temporarily unavailable by explicit owner direction.

### Stage 2

- Concise mobile-first product introduction.
- One visible curated challenge with category, difficulty, and duration.
- One working, accessible discovery action.
- No gameplay or later viral-loop features introduced early.

### Stage 3

- The Tap Sprint discovery action opens a real 20-second attempt.
- A deterministic state machine manages start, taps, countdown, completion, reset, and replay.
- Live timer and tap count provide immediate feedback.
- Taps after completion are ignored and the active timer is cancelled safely.
- Gameplay remains dependency-free and reusable by the next result stage.

### Stage 4

- Completion transitions into a dedicated mobile-first result view.
- The validated final tap count is the dominant result information.
- Concise deterministic feedback avoids fabricated rankings or records.
- Replay begins a clean attempt and the secondary action resets to discovery.
- Result values are written with safe DOM text APIs and announced accessibly.

### Stage 5

- The focused result view exposes one primary share action.
- A canonical fragment URL carries only a bounded version, challenge ID, score, and duration.
- Strict parsing rejects malformed, duplicate, extra, unsupported, mismatched, or oversized state.
- Web Share is preferred, clipboard is the fallback, and a visible validated link remains available when neither succeeds.
- Friend-attempt presentation and comparison remain deferred to their roadmap stages.

### Stage 6

- A valid shared result opens a dedicated mobile-first friend invitation.
- The validated challenge title, target score, and duration are rendered through safe DOM text properties.
- One primary action starts the same curated challenge while retaining the target context in memory.
- Dismissing or leaving the invitation removes the shared fragment and returns to ordinary discovery.
- Completing the friend attempt reuses the existing gameplay state while retaining comparison context.

### Stage 7

- Completing a friend attempt opens a dedicated score comparison instead of the ordinary result view.
- The sharer's validated target and the friend's completed score are shown side by side.
- Beat, tie, and short outcomes are deterministic and avoid fabricated rankings or social proof.
- Replaying from comparison retains the same validated target; returning to challenges clears shared context.
- Comparison values use safe DOM text properties and are announced after the view becomes visible.

### Stage 8

- Comparison exposes one primary `Share your score` action.
- The friend's validated completed score becomes the next bounded target for the same curated challenge.
- Share-again reuses the canonical versioned fragment codec, Web Share, clipboard, and visible-link fallback.
- Cancelled sharing keeps the fallback hidden; unavailable APIs reveal only the validated HTTP(S) link.
- Replay remains secondary and retains the original target; returning to challenges clears shared context.
- No identity, storage, backend, analytics, or shared-link schema expansion was introduced.

### Stage 9

- A strict allowlist covers the ten planned viral-loop events.
- Only aggregate integer counts are kept in memory for the current page session.
- Ordinary discovery and validated shared-link entry are counted separately.
- Existing result, comparison, share, and share-again transitions are observed without altering product behavior.
- Share completion is counted only after successful Web Share or clipboard copy feedback.
- No payloads, scores, URLs, timestamps, identities, cookies, persistence, network requests, or third-party analytics were added.

### Stage 10

- Nine frozen data-driven curated definitions cover Speed, Rhythm, Endurance, Timing, Memory, and Dodge labels.
- Six definitions continue to use the timed tap-count engine without being miscounted as separate mechanics.
- Center Snap adds three spatial timing decisions with moving-marker and distance-based scoring up to 3,000.
- Signal Echo adds ordered visual recall through four growing sequences and bounded scoring up to 1,400.
- Lane Guard adds three-lane movement decisions, six deterministic incoming obstacle waves, collision failure, and bounded scoring up to 600.
- All four mechanics reuse the existing result, strict shared-link codec, friend invitation, comparison, share-again, metrics, and navigation flows.
- Purposeful marker movement, sequence playback, obstacle approach, and immediate success/failure feedback each have text equivalents.
- `prefers-reduced-motion` uses discrete or still states without changing scoring or required decisions.
- Native keyboard-accessible controls, visible focus, readable contrast, and touch targets of at least 44×44 CSS pixels are preserved.
- Shared links preserve the selected challenge and reject unknown IDs, mismatches, and mechanic-specific scores above their strict maximum.
- Source and GitHub Pages preview files remain synchronized without dependencies, login, storage, or backend changes.
- The completion gate is met: at least six playable challenges, at least four materially different mechanics, at least three categories, at least two difficulty levels, shared product-loop systems, purposeful feedback motion, and reduced-motion-safe equivalents.

### Stage 11

- Discovery includes a secondary private-creation entry without replacing the curated primary action.
- A compact private page accepts one normalized 3–24 character ASCII title and one allowlisted 10, 20, or 30 second duration.
- Private rounds reuse the existing timed tap engine and deterministic result feedback.
- Strict versioned fragments carry only title, score, and duration and reject malformed, duplicate, extra, unsupported, oversized, or inconsistent state.
- A valid private link opens a friend invitation, preserves the target through play, shows comparison, and promotes the friend's score for sharing again.
- Custom values use safe DOM text APIs; no executable rules, identity, login, storage, backend, cookie, analytics destination, dependency, or public discovery was added.
- Source and GitHub Pages preview files remain synchronized.
