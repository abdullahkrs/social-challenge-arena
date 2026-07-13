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
- Decision owner: Product Strategist (`agent-product`), with Creative Direction treatment by `agent-creative`
- Context: The reset repository has an approved product vision and operating system but no playable product or selected architecture. The first slice must validate the complete asynchronous social loop with minimal technical and content risk while preserving future 2D and 3D options.
- Decision: Prioritize **Trace Relay** as the first complete visible vertical slice and advance the **Ribbon Relay** creative treatment. A broad route ribbon is revealed across an irregular, non-grid field of distinct geometric anchors; the player reproduces the route through sequential touch, forgiving drag, pointer, or keyboard over three escalating deterministic rounds. A language-independent link gives a friend the identical hidden seed, then both users see a localized comparison and can rematch or share again. Use 2D and defer rendering and lifecycle architecture until Islamic, visual, and motion gates complete.

#### Product-strategy candidate comparison

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

#### Creative-treatment comparison

| Treatment | Identity | Main advantage | Main risk | Outcome |
|---|---|---|---|---|
| Ribbon Relay | A broad route ribbon travels through irregular markers and folds into a spoiler-safe three-band result mark | Clearest relay metaphor, strongest small-screen readability, language-light, silent-safe, low asset cost, and clean reduced-motion equivalent | Requires exact glyph and symbol review | **Selected** |
| Harbor Handoff | Flat abstract stations connected by wake-like traces | Friendly atmosphere and attractive depth-like layering | Decorative complexity can reduce contrast and expand theme scope before loop validation | Rejected for first slice |
| Workshop Sequence | Abstract tabs and mechanical traces on an assembly table | Tactile cause and effect | Higher resemblance risk to circuit puzzles and branded electronic memory products | Rejected for first slice |

#### Selected creative contract

- Round one uses five anchors and four route selections.
- Round two uses seven anchors and five route selections.
- Round three uses nine anchors and six route selections and may include one non-consecutive anchor revisit.
- Wrong input preserves completed progress. After repeated error or idle, optional show-next assistance reveals one position, removes first-try mastery credit for that position, and lets the session continue.
- The user may finish early and receive a friendly partial result; one mistake never ends the entire run.
- Creative score intent is 1000 maximum: mastery 700, progress 200, and a capped flow bonus of 100. Accuracy remains primary. Exact timing, fairness, pause, and trust rules belong to architecture validation.
- The share-worthy result moment retracts the active route into a generic three-band relay mark. The result and link preview never show field geometry, route segments, anchor order, seed, solution, or an active-play screenshot.
- Rematch creates a fresh deterministic challenge. Share-again remains voluntary and never auto-posts or blocks continuation.

- Alternatives considered:
  - **Signal Sprint** remains parked. It is easy to build but has higher originality and accessibility risk, and reaction-time comparison can overfavor device latency or age.
  - **Bridge Builder Dash** remains parked. It offers stronger 2.5D/3D spectacle but would test rendering and physics before proving the core social funnel.
  - A generic platform shell without a game remains rejected because it would violate the vertical-slice-first rule.
  - Harbor Handoff and Workshop Sequence are rejected as first-slice treatments for the reasons above; they are not separate approved games.
- Product impact:
  - Establishes one active product hypothesis, one game catalog entry, and one selected creative identity.
  - Tests discovery, instant comprehension, play, partial completion, result, replay, share, friend challenge, comparison, rematch, and share-again in one coherent journey.
  - Keeps the typical first session within roughly 30–45 seconds and avoids registration.
  - Requires a minimal shared shell only where the complete slice directly uses it.
- Islamic-content impact:
  - The selected treatment proposes abstract geometry, no characters or clothing, no worship simulation, occult theme, prohibited substance, betting, monetary chance reward, unsafe physical imitation, public humiliation, manipulative pressure, or public social feed.
  - Rewards are score, progress, replay, and friendly private comparison only.
  - Audio is unnecessary and the game must remain complete in silence. Any interface tone, glyph family, three-band result mark, celebration fragment, and final social wording require Islamic Content Review.
  - Status remains **pending required Islamic Content Review**. Creative Direction does not issue a religious PASS.
- Language impact:
  - Arabic RTL, English, and Turkish are mandatory from the first architecture.
  - Game and share URLs contain no locale and resolve using the recipient's safe local preference or fallback.
  - Gameplay geometry, anchor IDs, deterministic seed, route order, and score rules are identical across languages and never mirror in RTL. The surrounding shell, controls, labels, result hierarchy, comparison, and announcements follow locale direction.
  - No text is embedded in artwork. Score, time, punctuation, digit presentation, mixed-direction links, wrapping, long labels, and accessible announcements require locale-specific tests.
- 2D/3D impact:
  - Trace Relay remains intentionally 2D because depth provides no product benefit for its first slice.
  - Ribbon layering may create visual depth but is not a 2.5D or 3D commitment.
  - The shared platform contract must isolate game rendering so later catalog entries can use 2.5D or 3D without rewriting discovery, results, challenge links, comparison, localization, accessibility, or analytics.
  - No permanent 3D framework is selected.
- Accessibility impact:
  - Ordered-anchor decisions are equivalent across sequential touch, forgiving drag, pointer click, and keyboard.
  - Drag precision, pointer smoothness, swipe velocity, color recognition, sound recognition, and rapid animation do not determine score.
  - Large separated anchors, visible focus, non-color-only states, stable accessible names, pause/resume, optional assistance, finish-now, and reduced-motion equivalence are required.
  - Reduced-motion preference must preserve observation opportunity, decisions, information, and score ceiling.
- Originality impact:
  - The concept must never use a regular 3×3 dot grid, lock/security language, four colored pads, a cumulative Simon-like loop, known toy layouts, copied sounds, branded palettes, copied characters, levels, wording, or trade dress.
  - Irregular varied markers, route handoff vocabulary, tap/keyboard-first equivalence, optional route revisit, structured three-round score, private same-seed comparison, and spoiler-safe relay mark are required differentiators.
- Risks:
  - The route mechanic may still feel derivative if Visual Direction weakens the irregular field, varied markers, or forbidden-reference safeguards.
  - Shared links may expose or permit tampering with seeds or claimed scores unless strict validation and a trust model are defined.
  - Flow scoring may disadvantage keyboard or motor-impaired users unless thresholds are generous and the full score ceiling is tested for every supported input path.
  - A memorization challenge can become frustrating if route cadence or assistance is poorly tuned.
  - Result cards may spoil the friend challenge unless the field, route, and seed remain absent from all share surfaces.
  - Anchor glyphs, celebration fragments, the three-band mark, and optional audio may create uncertain religious implications until reviewed.
- Evidence:
  - `concepts/trace-relay/CREATIVE_BRIEF.md` compares three materially different treatments, selects exactly one, and defines the complete discovery-to-share-again journey, scoring intent, errors, assistance, partial completion, share presentation, accessibility, multilingual behavior, Islamic review packet, originality teardown, and specialist handoffs.
  - The repository product brief requires a short, mobile-first, multilingual, shareable friend-comparison loop and treats 2D/3D as equal choices based on value.
  - The operating system requires one complete vertical slice before generic engine work and mandatory Islamic, localization, visual, motion, accessibility, and QA gates.
  - Product Strategy PR #68 merged after independent QA PASS at `c1119898538887ba20152d44d3c7b74f5cbf96af`.
  - All creative scores and timings remain hypotheses to validate through architecture review, moderated testing, and the released experiment.
- Next gate: Islamic Content Review must return PASS, REVISE, or ESCALATE for Ribbon Relay before Visual Direction, Motion Design, architecture, or implementation can treat it as approved.
- Supersedes: None.
