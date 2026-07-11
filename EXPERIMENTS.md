# Experiments

## E-001 — Facilitated two-person loop validation

- **Status:** ready to run manually; no result has been collected.
- **Purpose:** Find the largest real drop in the complete Discover → Play → Result → Share → Friend Competes → Compare → Share Again loop before adding another feature or analytics destination.
- **Hypothesis:** In a controlled one-attempt handoff, at least 70% of valid friend-link opens reach comparison, at least 50% of comparisons reach a successful re-share, and no critical core-path blocker appears.
- **Fixed challenge:** Tap Sprint, 20 seconds. Use one challenge to keep gameplay variance out of the social-handoff test.
- **Sample:** 10 sequential sharer-and-friend pairs. Continue only when at least 8 pairs produce valid sessions.

### Roles and setup

1. Use two separate browsers or devices per pair: one for the sharer and one for the friend.
2. Start each role in a fresh page session with DevTools already available for the facilitator.
3. Do not reload, replay, return to discovery, change challenge, or complete more than one attempt in that role.
4. The facilitator may read `window.socialChallengeMetrics.snapshot()` after the role finishes.
5. The facilitator keeps running cohort totals only. Do not retain a row, identifier, or snapshot for an individual pair.

### Procedure

#### Sharer session

1. Open ordinary discovery.
2. Select Tap Sprint and complete one attempt.
3. Press the ordinary result share action.
4. Complete Web Share or copy the validated link.
5. Hand the link directly to the paired friend, then read the metric snapshot.

Expected completed sharer snapshot:

| Event | Expected count |
|---|---:|
| `challenge_viewed` | 1 |
| `challenge_started` | 1 |
| `challenge_completed` | 1 |
| `result_viewed` | 1 |
| `share_attempted` | 1 |
| `share_completed` | 1 |
| `shared_link_opened` | 0 |
| `friend_completed` | 0 |
| `comparison_viewed` | 0 |
| `share_again_attempted` | 0 |
| `share_again_completed` | 0 |

#### Friend session

1. Open the validated link received from the sharer.
2. Start and complete one friend attempt.
3. View the comparison.
4. Press Share Again.
5. Complete Web Share or copy the validated comparison link, then read the metric snapshot.

Expected completed friend snapshot:

| Event | Expected count |
|---|---:|
| `challenge_viewed` | 0 |
| `challenge_started` | 1 |
| `challenge_completed` | 1 |
| `result_viewed` | 0 |
| `share_attempted` | 0 |
| `share_completed` | 0 |
| `shared_link_opened` | 1 |
| `friend_completed` | 1 |
| `comparison_viewed` | 1 |
| `share_again_attempted` | 1 |
| `share_again_completed` | 1 |

A lower count identifies the stage where the role stopped. A count above the expected value invalidates that role because the protocol allows only one attempt and one action per stage.

### Valid-session rules

Exclude and rerun a role from a fresh session when any of these occurs:

- The page reloads or metrics reset.
- Replay or a second attempt is used.
- The wrong role or challenge is used.
- A counter exceeds the expected value.
- The shared link is malformed, manually edited, or opened outside the paired friend session.
- The facilitator cannot read the final snapshot.

Record only the number of excluded roles. Do not keep the rejected snapshot.

### Aggregate recording

Maintain two running integer totals: **Sharer cohort** and **Friend cohort**. Add each valid snapshot directly to the appropriate cohort total, then discard the individual snapshot.

Allowed blocker categories are aggregate counts only:

- Could not start.
- Could not complete gameplay.
- Share action unavailable or failed.
- Link could not be opened or was rejected.
- Comparison did not appear.
- Share Again unavailable or failed.
- Facilitator could not read metrics.

Do not record names, emails, phone numbers, social handles, pair or session identifiers, scores, URLs or fragments, timestamps, screenshots, device/browser details, demographic data, free-text participant quotes, or any other participant-level data.

### Conversion formulas

Use cohort totals and return `not measurable` when the denominator is zero.

- Ordinary play completion = Sharer `result_viewed` ÷ Sharer `challenge_viewed`.
- Initial share attempt = Sharer `share_attempted` ÷ Sharer `result_viewed`.
- Initial share success = Sharer `share_completed` ÷ Sharer `share_attempted`.
- Link-open handoff = Friend `shared_link_opened` ÷ Sharer `share_completed`.
- Friend completion = Friend `friend_completed` ÷ Friend `shared_link_opened`.
- Comparison display = Friend `comparison_viewed` ÷ Friend `friend_completed`.
- Re-share attempt = Friend `share_again_attempted` ÷ Friend `comparison_viewed`.
- Re-share success = Friend `share_again_completed` ÷ Friend `share_again_attempted`.
- End-to-end loop closure = Friend `share_again_completed` ÷ Sharer `challenge_viewed`.

Cap presentation at 100% and investigate any raw ratio above 1.0 as a protocol or tally error.

### Decision rules

- **Pass:** At least 8 valid pairs, no critical core-path blocker, Friend completion is at least 70%, Re-share success is at least 50%, and End-to-end loop closure is at least 40%. Freeze feature scope and plan a larger validation run rather than adding a mechanic.
- **Iterate:** The data is valid and no critical blocker exists, but one or more thresholds are missed. Select only the earliest failing stage with the lowest conversion as the next product task.
- **Blocked:** Fewer than 8 valid pairs, any participant cannot traverse a required core state, or tally/protocol errors affect more than 20% of attempted pairs. Fix only the protocol, instrumentation defect, or critical path before rerunning.

### Stop conditions

Stop the run immediately if a shared link exposes unexpected data, a metric records a payload or participant detail, the facilitator is asked to retain personal information, or a core action repeatedly fails. Do not expand collection to diagnose the issue; create a separate privacy or correctness task.

### Result template

Record only:

- Attempted pair count.
- Valid pair count.
- Sharer cohort totals for the eleven events.
- Friend cohort totals for the eleven events.
- Aggregate blocker-category counts.
- The nine calculated conversion rates.
- Pass, Iterate, or Blocked decision.
- One next task when the decision is Iterate or Blocked.

No experiment outcome should be claimed until the manual run actually occurs.
