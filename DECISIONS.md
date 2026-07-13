# Decision Log

Record durable product, technical, Islamic-content, localization, visual, motion, privacy, and commercial decisions.

## Format

### D-YYYY-NNN — Title

- Date:
- Status: proposed / accepted / superseded / rejected
- Decision owner:
- Context:
- Decision:
- Alternatives considered:
- Product impact:
- Islamic-content impact:
- Language impact:
- 2D/3D impact:
- Risks:
- Evidence:
- Supersedes:

## Decisions

### D-2026-001 — Prioritize Trace Relay as the first vertical slice

- Date: 2026-07-13
- Status: proposed
- Decision owner: Product Strategist (`agent-product`), with Ribbon Relay treatment by Creative Direction (`agent-creative`)
- Context: The reset repository has an approved product vision and operating system but no playable product or selected architecture. The first slice must validate the complete asynchronous social loop with minimal technical and content risk while preserving future 2D and 3D options.
- Decision: Prioritize **Trace Relay** as the first complete visible vertical slice and advance the **Ribbon Relay** treatment. A broad route ribbon is revealed across an irregular, non-grid field of distinct geometric anchors; the player reproduces the route through sequential touch, forgiving drag, pointer, or keyboard over three escalating deterministic rounds. A language-independent link gives a friend the identical hidden seed, then both users see a localized comparison and can rematch or share again. Use 2D and defer rendering/lifecycle architecture until the complete specialist sequence passes.

#### Product-strategy candidate comparison

Scores are directional assessments from 1 (weak) to 5 (strong), not user evidence.

| Candidate | Mechanic and social hook | Best dimension | Broad audience | Social loop | Accessibility | Low-end performance | Originality | Feasibility | Maintenance | Main reason |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Trace Relay | Remember and reproduce a seeded spatial route; friend receives the identical route and score to beat | 2D | 5 | 5 | 4 | 5 | 4 | 5 | 5 | Best balance of immediate comprehension, fair asynchronous competition, language-light play, low cost, and shell validation |
| Signal Sprint | Respond to a seeded stream of visual cues; compare reaction and accuracy | 2D | 4 | 4 | 2 | 5 | 2 | 5 | 4 | Cheap but crowded reflex territory and less inclusive for latency-, age-, or motor-sensitive users |
| Bridge Builder Dash | Place moving segments across seeded gaps; compare distance, precision, and time | 2.5D | 4 | 4 | 3 | 3 | 3 | 3 | 2 | More spectacle but greater physics, camera, asset, performance, and maintenance risk |

#### Dimension assessment

| Candidate | 2D | 2.5D | 3D | Rationale |
|---|---:|---:|---:|---|
| Trace Relay | 5 | 3 | 1 | 2D keeps anchors, route order, focus, and targets unambiguous; depth adds occlusion without product benefit |
| Signal Sprint | 5 | 3 | 2 | Flat hierarchy best serves cues; depth would mainly decorate a generic reflex mechanic |
| Bridge Builder Dash | 4 | 5 | 4 | Depth improves spectacle but introduces premature camera and physics cost |

#### Creative-treatment comparison

| Treatment | Identity | Main advantage | Main risk | Outcome |
|---|---|---|---|---|
| Ribbon Relay | Broad route ribbon through irregular markers, ending in a spoiler-safe three-band result mark | Clearest relay metaphor, small-screen readability, language-light, silent-safe, low asset cost, clean reduced-motion equivalent | Exact glyphs, result mark, and celebration require later specialist review | **Selected** |
| Harbor Handoff | Abstract stations connected by wake-like traces | Friendly atmosphere and attractive layering | Decorative complexity can reduce contrast and expand theme scope | Rejected for first slice |
| Workshop Sequence | Abstract tabs and mechanical traces | Tactile cause and effect | Greater resemblance risk to circuit puzzles and branded memory products | Rejected for first slice |

#### Selected creative contract

- Round one: five anchors and four route selections.
- Round two: seven anchors and five route selections.
- Round three: nine anchors and six route selections, optionally including one non-consecutive revisit.
- Wrong input preserves progress. Optional show-next assistance reveals one position and removes first-try mastery for that position only.
- Finish-now produces a friendly partial result; one mistake never ends the whole run.
- Score intent: 1000 maximum with mastery 700, progress 200, and capped flow 100. Accuracy remains primary.
- Result transformation uses a generic three-band relay mark and never exposes field geometry, route segments, order, seed, solution, or active-play screenshot.
- Rematch creates a fresh deterministic challenge; share-again is voluntary and never auto-posts or blocks continuation.

- Alternatives considered:
  - **Signal Sprint** remains parked because of originality, accessibility, age, and latency concerns.
  - **Bridge Builder Dash** remains parked because it would test physics and rendering before proving the social funnel.
  - A generic platform shell without a game remains rejected under the vertical-slice-first rule.
  - Harbor Handoff and Workshop Sequence are rejected as first-slice treatments, not separate approved games.
- Product impact:
  - Establishes one active hypothesis, one catalog entry, and one selected creative identity.
  - Tests discovery, instant comprehension, play, partial completion, result, replay, sharing, friend challenge, comparison, rematch, and share-again in one journey.
  - Keeps the typical first session around 30–45 seconds without registration.
  - Requires shared shell work only where the complete slice directly uses it.
- Islamic-content impact:
  - Proposed concept uses abstract geometry, no characters or clothing, no worship simulation, occult theme, prohibited substance, wager, monetary chance reward, unsafe imitation, public humiliation, manipulative pressure, or public social feed.
  - Rewards are score, progress, replay, and friendly private comparison only.
  - Audio is unnecessary and play must remain complete in silence.
  - Approval is explicitly split into two mandatory stages:
    1. **Gate A — concept envelope:** Islamic Content Review evaluates the abstract relay metaphor, theme boundaries, rewards, private social framing, silent-complete boundary, and forbidden symbol/theme categories.
    2. **Gate B — final user-facing packet:** after Visual Direction and Motion Design, Islamic Content Review evaluates exact glyphs, relay mark, share composition, celebration, motion treatment, all proposed audio or silent release, and final social wording.
  - A Gate A PASS authorizes only production specification work inside the approved envelope. It does not approve later assets or implementation.
  - Architecture and implementation remain blocked until Gate B PASS. Any later user-facing change outside the reviewed packet returns to Islamic review.
  - Creative Direction issues no religious PASS.
- Language impact:
  - Arabic RTL, English, and Turkish are mandatory from the first architecture.
  - Game and share URLs contain no locale and resolve through safe preference or fallback.
  - Geometry, anchor IDs, seed, route order, and score rules are identical across languages and never mirror in RTL; shell, controls, results, comparison, and announcements follow locale direction.
  - No text is embedded in artwork. Score, time, punctuation, digits, mixed-direction links, wrapping, long labels, and announcements require locale-specific validation.
- 2D/3D impact:
  - Trace Relay remains intentionally 2D because depth provides no first-slice benefit.
  - Ribbon layering may imply visual depth but is not a 2.5D or 3D commitment.
  - Shared platform contracts must isolate rendering so later 2.5D/3D games do not require rewriting discovery, result, links, comparison, localization, accessibility, or analytics.
  - No permanent 3D framework is selected.
- Accessibility impact:
  - Ordered-anchor decisions are equivalent across touch tap, forgiving drag, pointer click, and keyboard.
  - Drag precision, pointer smoothness, swipe velocity, color recognition, sound recognition, and rapid animation do not determine score.
  - Large targets, visible focus, non-color-only states, stable names, pause/resume, assistance, finish-now, and reduced-motion equivalence are required.
  - Reduced motion preserves observation opportunity, decisions, information, and score ceiling.
- Originality impact:
  - Never use a regular 3×3 dot grid, lock/security vocabulary, four colored pads, a cumulative Simon-like loop, known toy layout, copied sound, branded palette, copied character, level, wording, or trade dress.
  - Required differentiators include irregular varied markers, relay vocabulary, tap/keyboard-first equivalence, optional route revisit, structured three-round result, private same-seed comparison, and spoiler-safe relay mark.
- Risks:
  - The route mechanic may feel derivative if later visual work weakens the irregular field, varied markers, or forbidden-reference safeguards.
  - Shared links require strict validation and a clear score trust model.
  - Flow scoring may disadvantage some users unless thresholds are generous and the full score ceiling is validated across input paths.
  - Memorization may become frustrating if cadence or assistance is poorly tuned.
  - Share surfaces can spoil the friend challenge unless field, route, and seed remain absent.
  - Exact glyphs, mark, celebration, motion, audio, or copy can introduce uncertainty; mandatory Gate B prevents them from bypassing specialist review.
- Evidence:
  - `concepts/trace-relay/CREATIVE_BRIEF.md` compares three treatments, selects one, defines the complete journey, score, errors, assistance, partial completion, sharing, accessibility, multilingual behavior, originality teardown, and the two-stage Islamic review contract.
  - Product brief and operating system require a short multilingual shareable friend-comparison loop, one complete vertical slice, and mandatory content, localization, visual, motion, accessibility, and QA gates.
  - Product Strategy PR #68 merged after independent QA PASS at `c1119898538887ba20152d44d3c7b74f5cbf96af`.
  - Creative scores and timings remain hypotheses for architecture validation and product testing.
- Next gate sequence: **Islamic Content Review Gate A → Visual Direction and Motion Design → Islamic Content Review Gate B → architecture → implementation**.
- Supersedes: None.