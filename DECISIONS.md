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
- Decision owner: Product Strategist (`agent-product`)
- Context: The reset repository has an approved product vision and operating system but no playable product, architecture, game catalog entry, or active implementation priority. The first slice must validate the complete asynchronous social loop with minimal technical and content risk while preserving future 2D and 3D options.
- Decision: Prioritize **Trace Relay** as the first complete visible vertical slice. A short route is revealed across an original field of geometric anchors; the player reproduces the route through touch, pointer, sequential tap, or keyboard over three escalating seeded rounds. A language-independent link gives a friend the identical seed, then both users see a localized comparison and can rematch or share again. Use 2D for this game and require a rendering/lifecycle decision only after creative, Islamic, visual, and motion gates.

#### Candidate comparison

Scores are directional product-strategy assessments from 1 (weak) to 5 (strong), not user evidence.

| Candidate | Mechanic and social hook | Best dimension | Broad audience | Social loop | Accessibility | Low-end performance | Originality confidence | Feasibility | Maintenance | Main reason |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Trace Relay | Remember and reproduce a seeded spatial route; friend receives the identical route and score to beat | 2D | 5 | 5 | 4 | 5 | 4 | 5 | 5 | Best balance of immediate comprehension, fair asynchronous competition, language-light play, low cost, and future shell validation |
| Signal Sprint | Respond to a seeded stream of visual tap/swipe cues; compare reaction and accuracy | 2D | 4 | 4 | 2 | 5 | 2 | 5 | 4 | Fast and cheap, but crowded reflex-game territory and less inclusive for older, motor-impaired, or latency-sensitive users |
| Bridge Builder Dash | Place moving segments to cross seeded gaps; compare distance, precision, and time | 2.5D | 4 | 4 | 3 | 3 | 3 | 3 | 2 | More spectacle and future 3D value, but greater physics, camera, asset, performance, and maintenance risk before the social loop is proven |

#### Dimension assessment

| Candidate | 2D suitability | 2.5D suitability | 3D suitability | Decision rationale |
|---|---:|---:|---:|---|
| Trace Relay | 5 | 3 | 1 | 2D keeps anchors, route order, focus, and touch targets unambiguous. Depth adds occlusion and load without improving the core decision. |
| Signal Sprint | 5 | 3 | 2 | Visual cues benefit from flat hierarchy; depth would mostly decorate a generic reflex mechanic. |
| Bridge Builder Dash | 4 | 5 | 4 | Depth improves spectacle and judging distance, but it introduces camera and physics costs that are premature for the first slice. |

- Alternatives considered:
  - **Signal Sprint** is parked, not selected. It is easy to build but has higher originality and accessibility risk, and reaction-time comparison can overfavor device latency or age.
  - **Bridge Builder Dash** is parked, not selected. It offers stronger 2.5D/3D spectacle but would test rendering and physics before proving the core social funnel.
  - A generic platform shell without a game was rejected because it would violate the vertical-slice-first rule and create foundation work without a visible user outcome.
- Product impact:
  - Establishes one active product hypothesis and one game catalog entry.
  - Tests discovery, instant comprehension, play, result, replay, share, friend challenge, comparison, and share-again in one coherent journey.
  - Keeps the first session below roughly 45 seconds and avoids registration.
  - Requires a minimal shared shell only where the slice directly uses it.
- Islamic-content impact:
  - No characters, clothing, worship simulation, occult theme, prohibited substance, betting, monetary chance reward, unsafe physical imitation, public humiliation, or manipulative social pressure is proposed.
  - Social wording must remain friendly and non-humiliating; no public leaderboard is included.
  - Audio is optional and must remain silent-safe until Islamic Content Review specifies an approved approach.
  - Status remains **pending required Islamic Content Review**; Product Strategy does not issue a religious PASS.
- Language impact:
  - Arabic RTL, English, and Turkish are mandatory from the first architecture.
  - Game and share URLs contain no locale and resolve using the recipient's safe local preference or fallback.
  - The deterministic board geometry is identical across languages and must not mirror in RTL, preserving challenge fairness. The surrounding shell, controls, labels, and result hierarchy follow locale direction.
  - Score, time, punctuation, wrapping, mixed-direction links, and accessibility announcements require locale-specific tests.
- 2D/3D impact:
  - Trace Relay is intentionally 2D because 3D provides no product benefit for its first slice.
  - The shared platform contract must isolate game rendering so a later catalog entry can use 2.5D or 3D without rewriting discovery, result, challenge-link, comparison, localization, accessibility, or analytics systems.
  - No permanent 3D framework is selected by this decision.
- Risks:
  - The spatial-route mechanic could feel derivative if visual and interaction design resemble an operating-system unlock grid or a known memory toy.
  - Shared links may expose or permit tampering with seeds or claimed scores unless strict validation and a clear trust model are defined.
  - Drag-only interaction would exclude some users; sequential tap and keyboard must be first-class and scoring opportunities must remain equivalent.
  - A memorization challenge can become frustrating if route length escalates too quickly or error feedback is punitive.
  - Result cards may reveal the route and spoil the friend challenge unless share presentation hides challenge content.
- Evidence:
  - Repository product brief requires a short, mobile-first, multilingual, shareable, friend-comparison loop and treats 2D/3D as equal choices based on value.
  - The operating system requires one complete vertical slice before generic engine work and mandatory Islamic, localization, visual, motion, accessibility, and QA gates.
  - Current repository state contains no playable product, no architecture, no accepted decision, no experiment, and no catalog game, so a low-risk end-to-end validation slice has higher value than a richer isolated mechanic.
  - Candidate scores are strategy estimates and must be replaced by product evidence after implementation.
- Supersedes: None.