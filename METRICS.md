# Metrics

## Current implementation

The MVP uses a dependency-free in-memory counter in `metrics.js`. It records only allowlisted aggregate integer counts for the current page session. Counts reset on reload and are never transmitted or persisted.

Implemented events:

- `challenge_viewed` — ordinary discovery is initially visible.
- `challenge_started` — an ordinary or friend attempt starts.
- `challenge_completed` — an attempt reveals a result or comparison.
- `result_viewed` — an ordinary result becomes visible.
- `share_attempted` — the ordinary result share action is pressed.
- `share_completed` — Web Share succeeds or the validated ordinary-result link is copied.
- `shared_link_opened` — a validated friend invitation is initially visible.
- `friend_completed` — a friend attempt reveals comparison.
- `comparison_viewed` — comparison becomes visible.
- `share_again_attempted` — the comparison Share Again action is pressed.
- `share_again_completed` — comparison Web Share succeeds or the validated comparison link is copied.

The two completion events intentionally distinguish successful first-result sharing from successful comparison re-sharing. Repeated DOM observer notifications for unchanged success text do not increment either counter again.

## Manual validation interpretation

Experiment E-001 uses fresh, one-attempt sessions and aggregates sharer and friend snapshots separately. This separation is required because `challenge_started` and `challenge_completed` are shared by both roles.

The approved formulas are:

- Ordinary play completion = Sharer `result_viewed` ÷ Sharer `challenge_viewed`.
- Initial share attempt = Sharer `share_attempted` ÷ Sharer `result_viewed`.
- Initial share success = Sharer `share_completed` ÷ Sharer `share_attempted`.
- Link-open handoff = Friend `shared_link_opened` ÷ Sharer `share_completed`.
- Friend completion = Friend `friend_completed` ÷ Friend `shared_link_opened`.
- Comparison display = Friend `comparison_viewed` ÷ Friend `friend_completed`.
- Re-share attempt = Friend `share_again_attempted` ÷ Friend `comparison_viewed`.
- Re-share success = Friend `share_again_completed` ÷ Friend `share_again_attempted`.
- End-to-end loop closure = Friend `share_again_completed` ÷ Sharer `challenge_viewed`.

Return `not measurable` for a zero denominator. A raw ratio above 1.0 indicates a protocol or tally error and must not be presented as conversion.

These formulas are valid only for the controlled role-specific protocol in `EXPERIMENTS.md`. They must not be inferred from mixed-role page sessions or treated as production analytics.

## Privacy boundary

The collector does not record event payloads, scores, URLs, fragments, timestamps, identities, device data, or personal data. It does not use cookies, `localStorage`, `sessionStorage`, a backend, network delivery, or a third-party analytics SDK.

The manual experiment may retain only sharer-cohort totals, friend-cohort totals, and predefined blocker-category counts. It must not retain individual snapshots, names, contact details, handles, pair or session identifiers, scores, links, timestamps, screenshots, device details, demographics, or free-text participant quotes.

Do not add a destination or expand collected data without an explicit privacy and architecture decision.
