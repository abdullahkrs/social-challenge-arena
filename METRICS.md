# Metrics

## Current implementation

The first end-to-end viral loop emits a strict allowlist of session-only milestone events through a dependency-free in-memory recorder.

Events:

- `challenge_viewed`
- `challenge_started`
- `challenge_completed`
- `result_viewed`
- `share_attempted`
- `share_completed`
- `shared_link_opened`
- `friend_completed`
- `comparison_viewed`
- `share_again_attempted`
- `share_again_completed`

Each emitted event contains exactly:

- `name`: one allowlisted event name.
- `challengeId`: the fixed curated challenge identifier.
- `count`: that event's count in the current page session.

## Privacy and reliability boundaries

- Counts exist only in memory and reset when the page reloads.
- No score, target, result difference, URL, fragment, timestamp, free text, identity, device data, fingerprint, cookie, local storage, session storage, personal data, or secret is recorded.
- No network request, beacon, backend, database, or third-party analytics destination exists.
- Unsupported event names are rejected before counters change.
- Event-listener failures are isolated and cannot interrupt gameplay, sharing, or navigation.
- `share_completed` and `share_again_completed` occur only after Web Share or clipboard reports success; cancellation and unavailable fallbacks are not counted as completion.

Do not add an analytics destination, persistent identifier, or broader payload without an explicit product and privacy decision.
