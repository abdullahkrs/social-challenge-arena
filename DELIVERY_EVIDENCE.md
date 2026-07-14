# Private Daily Challenge Loop Evidence

## Product

- **Constraint addressed:** ordinary visits had no fresh return reason and completed scores disappeared after the session.
- **Daily route:** a canonical UTC date deterministically selects Orbit Lock or Echo Grid and one seed. Independent devices receive the same challenge and route for that date.
- **Visible journey:** compact discovery entry → one primary daily action → play → result and private best/new-best state → same-route replay → strict share → friend attempt → comparison → rematch share.
- **Safe rollover:** the date is checked only when discovery is entered. An active game, result, replay, or restored interrupted run keeps its original route.
- **Compatibility:** valid invitations still take precedence at boot. Daily sharing uses the unchanged strict version-1 challenge, seed, score, checksum, and allowlist format, so links remain playable after the date changes.
- **Scope:** both existing challenges prove one shared daily flow. No third challenge, calendar service, retention engine, account, backend, notification, or speculative framework was added.

## Islamic content policy — PASS

- Theme: optional abstract daily precision or visual-memory skill practice.
- Characters/clothing: none.
- Symbols: neutral circles, tiles, numbers, checks, crosses, arrows, and date text.
- Audio: none.
- Rewards: bounded non-monetary score and private on-device best only; no wagering, chance reward, collectible, purchase, or monetary incentive.
- Social pressure: unlimited optional replay with no streak, countdown, missed-day message, shame, fear of missing out, public ranking, or manipulative urgency.
- Safety: no physical imitation, dangerous instruction, contact access, personal-data request, or harmful challenge.

## Accessibility and localization

- Arabic RTL, English, and Turkish share one key-complete localization system for the daily title, date, challenge identity, action, best/new-best, storage fallback, result, sharing, and announcements.
- The daily entry has one clearly labelled primary action at least 48 CSS px high; layouts wrap at 320px and adapt through 360–430px and desktop widths.
- Daily best and new-best are explicit text, not color-only signals, and are appended once to the existing result announcement.
- Logical focus remains discovery → daily action → game → result → replay/share/catalog. An interrupted bfcache run returns to the instructions surface without changing its route.
- Reduced-effects mode changes presentation only; challenge choice, seed, score, best decision, sharing, comparison, and lifecycle remain identical.

## Privacy, security, reliability, and performance

- Local daily state is limited to exactly `dateKey`, `challengeId`, `seed`, and bounded `best`. No identifier, account, cookie, analytics, fingerprint, cloud sync, or personal data is stored.
- Malformed, extra-field, stale, unsupported, mismatched-route, or out-of-range data is ignored and removed. Blocked storage degrades to a localized session-only best while the complete journey remains usable.
- Invite shape, version, challenge allowlist, numeric bounds, and deterministic tamper rejection remain unchanged.
- No date polling, interval, observer, extra canvas, or duplicated host was added. Existing game listeners, timers, animation frames, observers, page-hide teardown, and bfcache recovery remain in place.
- Zero runtime dependencies remain. The deployable static build is 77,286 bytes against the enforced 184,320-byte budget.

## Verification

- `node --check src/app.mjs` and `node --check src/core.mjs` — pass.
- `npm test` — 24 focused tests pass, covering UTC keys, deterministic selection of both challenge IDs, invite precedence, safe rollover, exact local-state validation, monotonic best updates, corrupt/blocked storage, same-route replay/share, localization, accessibility markup, lifecycle teardown, and existing social-loop behavior.
- `npm run build` — produces `dist/` at 77,286 bytes within the 180 KiB static budget.
- CI uploads the deployable static preview artifact for the pull request; `main` deploys the same output through GitHub Pages.
