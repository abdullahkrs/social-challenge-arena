# Platform UI and UX Consistency Evidence

## Product outcome

- **Constraint addressed:** three complete challenge journeys existed, but platform controls, mobile hierarchy, gameplay chrome, result actions, and shared symbols did not yet read as one product.
- **Bounded correction:** the challenge mechanics, scoring, deterministic routes, invitation format, daily behavior, and lifecycle code are unchanged. The delivery changes only connected platform presentation, retained platform iconography, responsive hierarchy, and supporting verification.
- **Discovery:** the large heading and card hierarchy are reduced at mobile widths; the daily route remains prominent, while all three cards are more compact and consistently structured.
- **Connected surfaces:** top controls, friend context, back navigation, gameplay HUD, result identity, button hierarchy, spacing, radius, focus, pressed behavior, and alignment now follow one platform language.

## Font Awesome Free

- Font Awesome Free 6.7.2 Solid is used for retained platform-interface icons.
- A generated WOFF2 subset containing exactly six retained glyphs is embedded locally in `ui.css`; live icons are represented by explicit decorative DOM children with `aria-hidden="true"`, including gamepad, language, accessibility, back, trophy, and friend context.
- Text-bearing localized actions intentionally render without pseudo-element Font Awesome glyphs, preventing private-use glyphs from entering accessible names while preserving the established action hierarchy.
- There is no CDN, remote font, remote script, runtime network request, package runtime, full Font Awesome bundle, or custom SVG platform icon.
- Gameplay-owned arrows, diamond, target, grid, and route cues remain part of their existing mechanics.
- `THIRD_PARTY_NOTICES.md` records the Font Awesome icon, font, and code licenses, including **SIL OFL 1.1** for the embedded WOFF2 subset, and is included in the production output.

## Mobile, RTL, and accessibility

- At 320–430 CSS px, the language control remains labeled and visible, and the reduced-effects control retains a native focusable checkbox plus a recognizable Font Awesome accessibility indicator inside its 48 px target.
- Arabic RTL mirrors only the directional back icon. Universal trophy, accessibility, language, gamepad, and friend-context icons are not mirrored.
- Existing Arabic, English, and Turkish localization remains the single source of user-facing text; no new user-facing translation key was required.
- Existing visible focus, live announcements, native buttons, 48 px practical targets, non-color gameplay feedback, text zoom behavior, keyboard controls, and reduced-effects semantics remain intact.
- Gameplay HUD values are presented in one compact shared surface without hiding score, round, chances, or streak and without changing any game state.
- Result DOM and visual order agree: the primary friend-share/rematch action is first, followed by replay and the two navigation alternatives.

## Reliability, privacy, and security

- No runtime JavaScript, challenge class, scoring function, route generator, share codec, allowlist, checksum, storage record, page-hide handler, bfcache recovery, timer, listener, or focus transition was changed.
- The existing strict version-1 invitation, score bounds, direct-entry precedence, daily validation, private local best, teardown, replay, challenge switching, and language switching behavior remain unchanged.
- Content Security Policy remains no-network and is expanded only to permit the locally embedded `data:` WOFF2 font. `connect-src 'none'` remains unchanged.
- No account, backend, analytics, cookie, contact access, tracking, external image, external font, API, UI framework, or new runtime dependency was added.

## Islamic content policy — PASS

- Theme: abstract neutral social skill arcade presentation.
- Characters/clothing: none.
- Symbols: neutral interface icons, existing geometric challenge cues, numbers, arrows, checks, and comparison marks.
- Audio: none.
- Rewards: bounded non-monetary scores and private local best only; no wagering, chance reward, purchase, collectible economy, or monetary incentive.
- Social pressure: optional private challenge and rematch only; no humiliation, public ranking, urgency, streak pressure, missed-day message, or fear of missing out.
- Safety: no physical imitation, dangerous instruction, contact access, personal-data request, or harmful challenge.
- Final decision: **PASS**.

## Verification

- `tests/ui-consistency.test.mjs` verifies local selective Font Awesome integration, complete icon/font/code licensing notice, absence of remote providers and custom SVG platform controls, production inclusion, the visible mobile reduced-effects indicator, explicit hidden decorative icons, plain localized text actions, and RTL back behavior.
- The unchanged existing suite continues to cover deterministic mechanics and scoring, strict invitations, sender/friend equivalence, daily selection and storage, direct entry, rematch, localization parity, keyboard isolation, reduced-effects equivalence, teardown, page-hide, bfcache recovery, and all three challenge regressions.
- The CI workflow runs `npm ci --ignore-scripts`, all **32/32 tests**, the production build, and deployable preview upload.
- The synchronized static preview contains 12 files totaling **104,451 bytes**, within the unchanged **184,320-byte** uncompressed budget.
