# First Playable Slice Evidence

## Product

- **Concept:** Orbit Lock, an original neutral 2D timing challenge. The player taps when a moving pulse enters a deterministic gate across twelve increasingly precise stages.
- **Journey:** discovery → five-second instruction → play → complete/fail → result → replay → strict share link → same-seed friend attempt → localized comparison → share again.
- **Platform proof:** catalog registry, game-host lifecycle, language-independent invite codec, result/comparison flow, in-memory privacy-safe events, static build, and Pages deployment all serve this challenge directly.

## Islamic content policy — PASS

- Theme: abstract timing and precision.
- Characters/clothing: none.
- Symbols: neutral circles, gates, and pulse marks only.
- Audio: none.
- Rewards: bounded non-monetary score; no chance reward, betting, loot box, or purchase.
- Social pressure: optional private link challenge; no public ranking, humiliation, or manipulative urgency.
- Safety: no real-world imitation or physical-risk instruction.

## Accessibility and localization

- Arabic RTL, English, and Turkish share one key-complete localization module; gameplay state and invite URLs contain no language.
- Touch, pointer, Space, and Enter are supported. Interactive targets are at least 48 CSS px where practical.
- Visible focus, live hit/miss/result announcements, readable contrast, non-color-only text feedback, an accessible canvas name, and 320px responsive rules are included.
- Reduced-effects mode removes ambient animation and particles while preserving the timing decision and score.

## Privacy and security

- No account, cookies, external analytics, third-party assets, or network API is used.
- Metrics are bounded to the latest fifty non-identifying events in memory and disappear on reload.
- Share links accept exactly five parameters, enforce version/challenge/format/bounds, and verify a deterministic tamper-detection checksum. Invalid links are removed before a fresh run.
- The checksum is validation, not authentication; no sensitive or authoritative data is encoded.

## Performance and lifecycle

- Zero runtime dependencies and no external assets.
- Static preview budget: 180 KiB uncompressed; the build fails above it.
- Canvas resolution is capped at 2× device pixel ratio.
- A single `AbortController`, `ResizeObserver`, and animation frame are owned by the game host and torn down on replay, navigation, finish, and page hide.

## Verification

- `npm test`
- `npm run build`
- Build artifact: `dist/`
- CI uploads a static preview artifact for every PR; `main` deploys the same `dist/` through GitHub Pages.
