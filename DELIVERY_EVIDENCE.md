# Third Challenge and Three-Choice Discovery Evidence

## Product

- **Constraint addressed:** the complete social loop had only timing and memory choices, leaving the catalog too narrow.
- **New challenge:** Lumen Lanes is an original 2D rapid spatial-decision game. Eighteen seeded left, center, or right signals create a comparable 20–30 second route; the player uses one thumb or native keyboard buttons.
- **Distinct input rhythm:** every round asks for a directional choice before a bounded deadline. It is not a precision stop, moving gate, tile replay, or sequence-memory variation.
- **Visible journey:** three concise cards → one-sentence instruction → deterministic run → bounded score → replay/new route → strict share → direct friend attempt → comparison → rematch share.
- **Platform proof:** the existing registry, host boundary, daily route, result, invitation, comparison, and rematch flow now serve all three challenge IDs without a generic engine or speculative framework.
- **Compatibility:** Orbit Lock and Echo Grid mechanics are unchanged. The version-1 query shape, checksum salt, numeric bounds, direct-entry precedence, and tamper rejection remain stable.

## Islamic content policy — PASS

- Theme: abstract neutral light-and-lane skill practice.
- Characters/clothing: none.
- Symbols: neutral arrows, diamond, lanes, numbers, checks, and crosses.
- Audio: none.
- Rewards: bounded non-monetary score and optional private device best only; no wagering, chance reward, loot box, collectible, purchase, or monetary incentive.
- Social pressure: optional private invitation and rematch; no public ranking, humiliation, shame, countdown campaign, missed-day message, urgency, or fear of missing out.
- Safety: no physical imitation, motion sensor, dangerous instruction, contact access, personal-data request, or harmful challenge.
- Final decision: **PASS**.

## Accessibility and localization

- Arabic RTL, English, and Turkish use one key-complete localization system for the third card, instruction, lane labels, prompts, feedback, result, sharing, comparison, and daily state.
- Three lane buttons are native controls with pointer, touch, Space, and Enter behavior; each is at least 48 CSS px and has a localized accessible name.
- The visual signal uses arrow/diamond shape and position. Correct, wrong, and timeout feedback includes symbols, text announcements, and HUD changes, not color alone.
- The catalog collapses to one compact card per row at mobile widths, while the daily action remains visually primary and the three choices remain scannable.
- Reduced effects removes decorative transitions only; seed, lane order, deadlines, scoring, results, and comparison stay identical.
- Page hide, replay, switching, and bfcache recovery destroy game-owned timers and listeners before another host starts.

## Privacy, security, reliability, and performance

- No account, cookie, analytics, fingerprint, backend, contact permission, personal data, third-party runtime asset, or network API was added.
- Strict invitations allow exactly the three known challenge IDs and reject unknown IDs, extra fields, unsupported versions, malformed values, checksum mismatches, and out-of-range scores.
- Daily local state remains exactly `dateKey`, `challengeId`, `seed`, and bounded `best`; stale or mismatched records are discarded safely.
- Lumen Lanes owns one abort controller and a bounded timer set. Destroy clears all timers, listeners, button state, and transient DOM attributes.
- Zero runtime dependencies remain. The local production build is 94,810 bytes against the enforced 184,320-byte budget.

## Verification

- `node --check src/core.mjs`, `src/catalog.mjs`, `src/i18n.mjs`, `src/lumen-game.mjs`, and `src/app.mjs` — pass.
- `npm test` — 26/26 pass, covering all three deterministic plans/scoring models, strict invitations, sender/friend route equivalence, injected daily dates for all three IDs, safe local best, direct entry, rematch, localization parity, accessible markup, keyboard isolation, reduced-effects equivalence, teardown, and existing challenge regressions.
- `npm run build` — 94,810 / 184,320 bytes.
- CI uploads the deployable static preview artifact for the pull request; `main` publishes the same output through GitHub Pages.
