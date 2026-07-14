# Three-Challenge Catalog and Lane Spark Evidence

## Product

- **Constraint addressed:** the live catalog covered precision timing and visual memory only.
- **New challenge:** Lane Spark is a materially different one-thumb directional-reaction game. Twelve deterministic signals ask for left, middle, or right selection inside a bounded response window.
- **Visible journey:** discovery → concise instruction → short play → bounded score → replay/new route → strict invitation → same-route friend attempt → score comparison → rematch share.
- **Platform proof:** the existing catalog, daily selector, host boundary, result, replay, invitation allowlist, comparison, rematch, localization, and lifecycle now serve three real challenges without a generic game engine.
- **Compatibility:** Orbit Lock and Echo Grid IDs, version-1 invitation shape, checksum salt, numeric bounds, direct-invite precedence, daily local state, UTC rollover, and bfcache recovery remain intact.

## Islamic content policy — PASS

- Theme: abstract neutral direction-and-reaction skill practice.
- Characters/clothing: none.
- Symbols: neutral arrows, a circle, lanes, numbers, checks, crosses, and score text.
- Audio: none.
- Rewards: bounded non-monetary score only; no wagering, chance reward, purchase, collectible, or monetization.
- Social pressure: optional private invitation and rematch only; no public ranking, humiliation, urgency, streak, or missed-day pressure.
- Safety: seated/touch interaction only; no physical imitation, dangerous instruction, contact access, or personal-data request.

## Accessibility and localization

- Arabic RTL, English, and Turkish use one key-complete localization system for catalog identity, instruction, lane labels, feedback, result, share, comparison, and daily states.
- Lane placement is physically stable left-to-right even in RTL; localized labels remain readable and the arrow/circle cue does not rely on color.
- Three primary lane targets remain at least 48 CSS px, support pointer/touch and native keyboard activation, and expose 1–3 shortcuts.
- The response-time bar is functional feedback updated directly rather than decorative animation; reduced effects preserves the same route, window, score, decisions, and teardown.
- The three-card discovery surface collapses into compact horizontal cards at phone widths without carousel controls, onboarding slides, or added explanatory paragraphs.

## Privacy, security, reliability, and performance

- No account, cookie, analytics, fingerprinting, contacts, third-party runtime asset, backend, or network API.
- Lane Spark owns one abort controller, bounded timeout set, and one animation frame; finish, navigation, page hide, replay, challenge switching, and bfcache recovery cancel all owned work.
- Invalid IDs, malformed values, extra fields, unsupported versions, checksum mismatch, and out-of-range scores still fail safely into normal discovery.
- Daily storage remains limited to exactly `dateKey`, `challengeId`, `seed`, and bounded `best`.
- Zero runtime dependencies and the existing 180 KiB uncompressed static budget remain enforced.

## Verification

- `node --check src/core.mjs`, `node --check src/app.mjs`, and `node --check src/lane-game.mjs` — pass.
- `npm test` — 27 focused tests pass for deterministic routes/scoring, all-three daily selection, strict invitations, legacy compatibility, same-route rematches, localization parity, real entry markup, keyboard isolation, lifecycle teardown, and existing journeys.
- `npm run build` — passes the enforced 180 KiB static budget.
- CI publishes the deployable static preview artifact for the pull request; `main` deploys the same output through GitHub Pages.
