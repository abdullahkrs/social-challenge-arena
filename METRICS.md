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

## Privacy boundary

The collector does not record event payloads, scores, URLs, fragments, timestamps, identities, device data, or personal data. It does not use cookies, `localStorage`, `sessionStorage`, a backend, network delivery, or a third-party analytics SDK.

Do not add a destination or expand collected data without an explicit privacy and architecture decision.
