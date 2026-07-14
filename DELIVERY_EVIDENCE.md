# Mirror Fuse and Stable Daily Expansion Evidence

## Product outcome

- **Constraint addressed:** the coherent platform had only three abstract skills. Mirror Fuse adds a materially different spatial-reflection decision without rebuilding the shared platform.
- **Challenge:** each seeded round presents a 4×3 source pattern and three candidate answers. The player chooses the exact horizontal reflection across ten rounds with three chances.
- **Complete journey:** catalog discovery → concise instruction → play → result → replay/new route → localized strict share → direct friend attempt → comparison → rematch share → catalog return.
- **Bounded delivery:** existing Orbit Lock, Echo Grid, Lumen Lanes, result, comparison, sharing, and platform controls retain their established behavior and visual language.

## Stable daily expansion

- The rollout boundary is **2026-08-01 UTC**.
- Dates through **2026-07-31** continue to use the original ordered pool `[orbit-lock, echo-grid, lumen-lanes]` and therefore preserve the exact challenge and seed produced by the previous selector.
- Dates from **2026-08-01** use the ordered four-challenge pool and can deterministically select Mirror Fuse.
- Focused fixtures preserve exact legacy assignments and prove all four IDs occur after the boundary.
- Daily storage remains only `dateKey`, `challengeId`, `seed`, and bounded `best`; stale, corrupt, or unavailable storage never prevents play.
- The route remains optional with unlimited replay and no streak, countdown, missed-day pressure, expiry, urgency, or public ranking.

## UI and UX consistency

- Mirror Fuse reuses the existing compact challenge card, instruction card, four-value HUD, result hierarchy, comparison surface, and action order.
- Platform controls continue to use the existing locally bundled Font Awesome subset; gameplay patterns, mirror axis, diamonds, checks, and crosses are mechanic-owned CSS or semantic text.
- The fourth card extends the established catalog to four columns on wide screens, a balanced two-column layout at tablet widths, and one compact card per row on phones.
- The arena is explicitly left-to-right because reflection geometry is language-independent; Arabic RTL still applies to surrounding platform text and navigation.
- Responsive rules cover 320–430 CSS px without introducing a parallel component system or unrelated redesign.

## Localization and accessibility

- Arabic RTL, English, and Turkish use the existing key-parity localization system for name, tagline, instruction, prompt, feedback, controls, arena, option labels, card metadata, sharing, and comparison.
- The three answers are native buttons with localized accessible names, visible focus, touch/pointer/keyboard operation, and practical targets above 48 CSS px.
- Source and candidate cells use shape and text glyphs in addition to color. Correct, wrong, and timeout outcomes include `✓` or `×`, localized live announcements, and score/chance changes.
- Option order and challenge geometry are not mirrored merely because the interface language is Arabic.
- Reduced effects changes transition duration only; source patterns, candidates, answer index, deadlines, scoring, route, and result remain identical.

## Reliability, privacy, security, and performance

- Mirror Fuse owns one abort controller, one tracked timeout set, the active deadline timer, transient classes, feedback marks, disabled state, and focus transition; `destroy()` clears and resets all of them.
- Replay, challenge switching, page hide, and bfcache recovery use the existing shared destruction path before another host starts.
- Strict version-1 invitations keep the same fields, checksum salt, bounds, and tamper rejection while adding only the known `mirror-fuse` ID to the allowlist.
- No account, backend, analytics, cookie, contact access, tracking, remote font, remote image, API, UI framework, runtime dependency, or network permission was added.
- Content Security Policy remains no-network with `connect-src 'none'`.

## Islamic content policy — PASS

- Theme: neutral abstract pattern reflection and spatial reasoning.
- Characters/clothing: none.
- Symbols: geometric cells, a mirror divider, question mark, numbers, checks, and crosses; no devotional or questionable symbolism.
- Audio: none.
- Rewards: bounded non-monetary score and optional private daily best only; no wagering, chance reward, loot box, purchase, or monetary incentive.
- Social pressure: optional private invitation and rematch only; no humiliation, public ranking, urgency, streak pressure, missed-day message, or fear of missing out.
- Safety risks: no physical imitation, dangerous instruction, sensor access, contact access, or personal-data request.
- Final decision: **PASS**.

## Verification

- GitHub Actions CI run **#83** passed `npm ci --ignore-scripts`, the complete `npm test` suite, production `npm run build`, and preview upload on the implementation head.
- Tests cover deterministic reflection plans, unique distractors, exact scoring bounds, zero-millisecond input, sender/friend equivalence, all four strict invitations, comparison/rematch, localization parity, native controls, lifecycle teardown, reduced-effects equivalence, exact legacy daily fixtures, and future four-ID selection.
- The production preview contains **14 files totaling 125,304 bytes**, within the unchanged **184,320-byte** uncompressed budget.
- The uploaded preview ZIP is **37,294 bytes** with SHA-256 digest `611be031da86eda22a86fd2624c96e3fe2967df129766abcc138f79feaad5c62`.
- Static preview inspection confirmed the expected entry point, four catalog cards, all four hosts, local styles, localization module, no remote asset, and complete deployable file set.
