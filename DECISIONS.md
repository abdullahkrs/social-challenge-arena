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
- Decision: Prioritize **Trace Relay** as the first complete visible vertical slice and advance the **Ribbon Relay** treatment. A broad route ribbon is revealed across an irregular, non-grid field of distinct geometric anchors; the player reproduces the route through sequential touch, forgiving drag, pointer, or keyboard over three escalating deterministic rounds. A language-independent link gives a friend the identical hidden seed, then both users see a localized comparison and can rematch or share again. Use 2D and defer rendering/lifecycle architecture until the visual and motion specifications pass independent QA.

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
| Ribbon Relay | Broad route ribbon through irregular markers, ending in a spoiler-safe three-band result mark | Clearest relay metaphor, small-screen readability, language-light, silent-safe, low asset cost, clean reduced-motion equivalent | Exact glyphs and result mark require original, accessible production rules | **Selected** |
| Harbor Handoff | Abstract stations connected by wake-like traces | Friendly atmosphere and attractive layering | Decorative complexity can reduce contrast and expand theme scope | Rejected for first slice |
| Workshop Sequence | Abstract tabs and mechanical traces | Tactile cause and effect | Greater resemblance risk to circuit puzzles and branded memory products | Rejected for first slice |

#### Selected creative contract

- Round one: five anchors and four route selections.
- Round two: seven anchors and five selections.
- Round three: nine anchors and six selections, optionally including one non-consecutive revisit.
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
  - The concept uses abstract geometry, no characters or clothing, no worship simulation, occult theme, prohibited substance, wager, monetary chance reward, unsafe imitation, public humiliation, manipulative pressure, or public social feed.
  - Rewards are score, progress, replay, and friendly private comparison only.
  - Audio is unnecessary and play must remain complete in silence.
  - `ISLAMIC_CONTENT_POLICY.md` is enforced directly by every specialist and independent QA. The obsolete two-stage standalone Islamic-review sequence is superseded by the current operating system.
  - Any questionable visual, motion, audio, reward, or social element is removed or replaced with a clearly neutral alternative; no decision is referred to the owner and no separate review gate is created.
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
  - The route mechanic may feel derivative if later work weakens the irregular field, varied markers, or forbidden-reference safeguards.
  - Shared links require strict validation and a clear score trust model.
  - Flow scoring may disadvantage some users unless thresholds are generous and the full score ceiling is validated across input paths.
  - Memorization may become frustrating if cadence or assistance is poorly tuned.
  - Share surfaces can spoil the friend challenge unless field, route, and seed remain absent.
- Evidence:
  - `concepts/trace-relay/CREATIVE_BRIEF.md` compares three treatments, selects one, and defines the complete journey, score, errors, assistance, partial completion, sharing, accessibility, multilingual behavior, and originality teardown.
  - Product Strategy PR #68 merged after independent QA PASS at `c1119898538887ba20152d44d3c7b74f5cbf96af`.
  - Creative Direction PR #70 merged before the operating-system reset removed the standalone Islamic-review role.
- Next sequence: **Visual Direction QA → Motion Design → focused architecture → implementation → Localization → independent QA**.
- Supersedes: None.

### D-2026-002 — Adopt the Folded Signal visual system for Ribbon Relay

- Date: 2026-07-13
- Status: proposed
- Decision owner: Visual Direction (`agent-visual`)
- Context: Issue #73 requires one production-ready original visual system that preserves the approved 2D mechanic, avoids unlock-pattern and memory-toy resemblance, works from 320 px, supports Arabic RTL, English, and Turkish, remains clear without color/sound/motion, and directly unlocks Motion Design and architecture.
- Decision:
  - Adopt the **Folded Signal** identity documented in `concepts/trace-relay/VISUAL_BRIEF.md`.
  - Use a `1000 × 1250` logical non-mirrored board with deterministic asymmetric placement and explicit rejection rules against rows, columns, rings, and keypad-like layouts.
  - Use nine repository-owned rounded irregular folded-marker plates, each distinguished by silhouette and internal signature rather than hue.
  - Use a broad solid reveal ribbon with an outer edge, a double-line player trace, explicit crossing breaks, and full concealment before input.
  - Use a fixed three-band spoiler-safe relay mark that encodes completion state but never route, anchor geometry, order, seed, sender identity, or locale.
  - Use shell-direction-aware HUD, result, comparison, and share layouts while keeping board geometry identical across locales.
  - Use procedural/vector assets with a 35 KB gzip target and 50 KB ceiling, no critical raster, and low-end fallback that removes decoration without losing state or score access.
- Alternatives considered:
  - Identical circular markers: rejected because of unlock-grid and toy resemblance and weak non-color differentiation.
  - Character-led relay theme: rejected because it adds clothing, animation, cultural, asset, and safety scope without improving the mechanic.
  - Circuit-board treatment: rejected because of originality risk and misleading technical/security framing.
  - 2.5D or 3D board: rejected because depth and camera create occlusion and input ambiguity without product value.
  - Decorative illustration-heavy field: rejected because it increases payload and reduces small-screen state clarity.
- Product impact:
  - Makes observe, hidden, reproduce, assistance, round completion, result, comparison, rematch, and share surfaces visually actionable for implementation.
  - Provides a recognizable share-worthy result without leaking the challenge.
  - Keeps decorative work bounded and removable.
- Islamic-content impact:
  - Uses neutral non-devotional geometry only; no characters, clothing, sacred/occult/ritual motifs, hazardous imitation, gambling cues, humiliating rewards, or manipulative pressure.
  - Audio is not approved by this decision and the experience remains complete in silence.
  - Visual Direction records `PASS` for its scope under `ISLAMIC_CONTENT_POLICY.md`; independent QA must verify the exact specification and later implementation.
  - Any later questionable addition is removed or replaced with a neutral alternative rather than referred to an owner or standalone reviewer.
- Language impact:
  - Board geometry, anchor IDs, route, and relay-mark geometry never mirror.
  - Arabic, English, and Turkish shell layouts use logical direction, external labels, wrapping, bidirectional isolation, and locale-aware numbers.
  - Artwork contains no baked text.
- 2D/3D impact:
  - Confirms 2D for the first slice.
  - Depth cues are optional and removable.
  - Shared product contracts remain renderer-agnostic for future 2.5D/3D games.
- Risks:
  - Nine anchors may crowd narrow screens if the architecture violates the minimum target and spacing contract.
  - Internal signatures could become symbol-like if production assets deviate from the exact neutral construction rules.
  - Share rendering may expose private or spoiler data if generated from the active board instead of the fixed relay mark.
  - Visual budgets remain hypotheses until measured on the selected renderer and representative low-end device.
- Evidence:
  - Full review against `PRODUCT_BRIEF.md`, `AGENT.md`, `ART_DIRECTION.md`, `ISLAMIC_CONTENT_POLICY.md`, `LOCALIZATION_POLICY.md`, `concepts/trace-relay/CREATIVE_BRIEF.md`, and Issue #73.
  - Contrast checks recorded in the visual brief meet or exceed 4.5:1 for the proposed board-state colors against the board base, while state meaning also uses outline, pattern, line, and announcements.
  - No runtime source, production asset, build, test, or preview changed in this documentation-only decision.
- Supersedes: Obsolete standalone Islamic-review sequencing inside D-2026-001; the selected game and creative treatment remain unchanged.