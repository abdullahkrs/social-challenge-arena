# Two-Challenge Platform Slice Evidence

## Product

- **Live choices:** Orbit Lock (timing) and Echo Grid (visual memory) are materially different original 2D challenges presented from the real mobile-first discovery surface.
- **Echo Grid mechanic:** eight deterministic rounds reveal short numbered tile patterns, then require the same order. Wrong tiles consume one of three chances and replay the current pattern; scoring rewards sequence length, round, and streak.
- **Journey:** discovery and choice → five-second instruction → play → complete/fail → result → replay/new route → strict same-challenge share link → same-seed friend attempt → localized comparison → share again.
- **Platform proof:** one catalog, selected challenge state, shared lifecycle/results/comparison/share flow, and two concrete game hosts. No unused engine or speculative plugin layer was added.
- **Compatibility:** Orbit Lock remains the default challenge and its version-1 checksum salt and link shape are unchanged. Strict parsing now admits only the two catalog IDs.

## Islamic content policy — PASS

- Theme: abstract precision and visual memory.
- Characters/clothing: none.
- Symbols: neutral circles, tiles, checks, crosses, and numbers only.
- Audio: none.
- Rewards: bounded non-monetary score; no chance reward, betting, loot box, purchase, or monetization.
- Social pressure: optional private link challenge; no public ranking, humiliation, urgency, or manipulative pressure.
- Safety: no real-world imitation, physical challenge, or harmful instruction.

## Accessibility and localization

- Arabic RTL, English, and Turkish use one key-complete localization module across catalog, instructions, gameplay status, settings, errors, results, and comparison.
- Echo Grid uses nine real buttons with localized accessible names and native keyboard operation; sequence order is shown with numbers and success/failure with `✓`/`×`, not color alone.
- Orbit Lock retains touch/pointer and focused Space/Enter control. Both provide visible focus, live announcements, readable contrast, and targets at least 48 CSS px.
- Reduced effects removes transitions and scaling while preserving sequence exposure duration, decisions, score, and difficulty.

## Privacy and security

- No account, cookies, external analytics, third-party assets, or network API.
- Metrics remain bounded to fifty non-identifying in-memory events and disappear on reload.
- Share links accept exactly five parameters, enforce version, known challenge ID, format, bounds, and deterministic tamper detection. Invalid or unknown routes are removed before a fresh run.
- The checksum is validation, not authentication; no sensitive or authoritative data is encoded.

## Performance and lifecycle

- Zero runtime dependencies and no external assets.
- Static preview budget remains 180 KiB uncompressed and the build fails above it.
- Orbit canvas stays capped at 2× device pixel ratio. Echo Grid uses lightweight DOM/CSS with no image assets.
- Each game owns and tears down its listeners, animation frame/observer or timers on replay, switching, navigation, finish, page hide, and back/forward-cache recovery.
- Responsive layouts explicitly cover 320px and adapt through 360–430px and desktop widths.

## Verification

- `npm test`
- `npm run build`
- Build artifact: `dist/`
- CI uploads a static preview artifact for every PR; `main` deploys the same `dist/` through GitHub Pages.
