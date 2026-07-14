# Direct Duel Social Loop Evidence

## Product

- **Constraint addressed:** social-loop friction after sharing.
- **Invite entry:** valid Orbit Lock and Echo Grid v1 links now open the selected challenge directly on a concise target surface. The primary action starts the same challenge and deterministic route; a quieter secondary action opens the catalog.
- **Share:** native sharing uses localized challenge name, score, friendly call to compete, and strict URL. Clipboard and manual fallback include the useful invitation text plus the full URL.
- **Comparison and rematch:** invited results show challenger score, player score, numeric difference, localized win/loss/tie text, and a non-color arrow/equality symbol. Rematch sharing keeps the challenge and route while making the player’s new score the target.
- **Platform proof:** one shared invite-entry, result comparison, and rematch flow serves both existing challenges without changing either mechanic or adding a generic sharing framework.
- **Compatibility:** the version-1 shape, allowlist, checksum salt, challenge IDs, score bounds, and deterministic tamper rejection remain unchanged.

## Islamic content policy — PASS

- Theme: abstract friendly skill competition in precision timing and visual memory.
- Characters/clothing: none.
- Symbols: neutral circles, tiles, numbers, arrows, equality, checks, and crosses.
- Audio: none.
- Rewards: bounded non-monetary score only; no wagering, chance reward, loot box, purchase, or monetization.
- Social pressure: optional private invitation and rematch; no countdown pressure, public ranking, humiliation, shaming, or manipulative urgency.
- Safety: no physical imitation, dangerous instruction, personal-data request, or contact access.

## Accessibility and localization

- Arabic RTL, English, and Turkish use one key-complete localization system for invite entry, share copy, fallback copy, comparison, rematch, errors, and announcements.
- Invite boot moves focus to the primary play action. Result focus remains on the result heading, and comparison is announced once with both scores, outcome, and difference.
- All primary invite and result actions keep at least 48 CSS px. The comparison is understandable without color.
- The 320px invite card uses a compact layout; the three-part comparison remains readable through 360–430px and desktop widths.
- Reduced effects changes only presentation. Touch, pointer, keyboard, replay, catalog navigation, language changes, page hide, and back/forward-cache recovery retain the same decisions and state.

## Privacy, security, performance, and lifecycle

- No account, contacts, cookies, analytics, remote assets, external API, notification permission, or social-platform dependency.
- Invalid, extra, unknown, malformed, out-of-range, wrong-version, and checksum-mismatched links are removed before normal discovery.
- Existing game-owned listeners, timers, animation frames, observers, and DOM hosts continue to be torn down on navigation, replay, finish, page hide, and back/forward-cache restoration.
- Zero runtime dependencies and the existing 180 KiB uncompressed static budget remain enforced by the build.

## Verification

- `npm test` — focused coverage includes direct invite boot, invalid recovery, legacy links, localized native/clipboard payloads, same-route rematches, comparison outcomes/symbols, localization parity, real entry markup, keyboard isolation, and lifecycle behavior.
- `npm run build` — generates `dist/` and enforces the static budget.
- CI uploads the deployable static preview artifact for the PR; `main` deploys the same output through GitHub Pages.
