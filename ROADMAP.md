# Autonomous Roadmap

The Coordinator owns this roadmap and updates it from product evidence, agent recommendations, dependencies, and completed releases.

The repository owner defines the durable vision in `PRODUCT_BRIEF.md`; agents define ordinary stages, release contents, sequence, and scope without owner referrals.

## Current state

- Product brief: approved.
- Architecture: not yet selected; one focused decision follows Visual Direction QA and Motion Design.
- Active implementation priority: Trace Relay — Ribbon Relay; implementation has not started.
- Current playable product: none.
- Current stage: Visual Direction specification complete on Issue #73 and awaiting independent QA.

## Roadmap rules

1. Continue unfinished work before selecting new work.
2. Maintain one active implementation priority.
3. Prefer a complete user-visible vertical slice.
4. No more than two consecutive foundation-only merges.
5. Each stage must define its user journey, Islamic-content status, languages, 2D/3D choice, visual/motion readiness, evidence, and next visible delivery.
6. The Coordinator may reorder stages when current evidence justifies it.
7. No decision is referred to the owner. Out-of-scope or uncertain content is omitted, conservatively replaced, or rejected while the highest-value compliant path continues.

## Active stage — Trace Relay vertical-slice definition

- Product problem: social-media users need a challenge they can understand immediately, finish quickly, and share as a fair same-condition competition rather than a passive score card.
- Target audience: casual players, competitive friends, families, mixed-age users, and Arabic-, English-, and Turkish-speaking mobile users on low-end through high-end devices.
- Prioritized concept: **Trace Relay**, a short seeded spatial-memory challenge in which a route appears across an original field of geometric anchors and the player reproduces the same route by touch, pointer, or keyboard.
- Selected creative treatment: **Ribbon Relay**. A broad folded signal travels through an irregular, non-grid field of distinctive anchors, hides, and is reproduced by the player. Three completed round bands become a spoiler-safe result mark.
- Dimension: **2D** for the first slice. It provides the clearest input, lowest load and maintenance cost, strongest low-end reach, and no justified 3D benefit. Depth cues are removable visual layering only. Shared shell and lifecycle contracts remain compatible with future 2D, 2.5D, and 3D games.
- Core journey: discover → understand from a brief visual demonstration → play three short seeded rounds → receive mastery/progress/flow result or friendly partial result → replay or share a language-independent challenge link → friend plays the identical seed → both compare → rematch or share again.
- Round contract: five anchors and four route selections, then seven anchors and five selections, then nine anchors and six selections; round three may include one non-consecutive anchor revisit. Wrong input preserves progress, optional one-step assistance removes first-try mastery for that position, and finish-now produces a friendly partial result.
- Score intent: 1000 maximum with mastery weighted at 700, progress at 200, and capped flow at 100. Accuracy remains primary, supported input methods must have equal score ceilings, and exact timing/trust mechanics remain for architecture review.
- Social hook: one fair deterministic seed, one spoiler-safe score to beat, immediate friend comparison, a fresh-seed rematch, and voluntary share-again without public ranking, forced sharing, humiliation, or manipulative urgency.
- Languages: Arabic with complete RTL, English, and Turkish from the first architecture. Gameplay geometry, challenge seed, anchor IDs, route order, and relay-mark geometry remain language-independent and never mirror in RTL; shell layout, copy, controls, results, comparison, and announcements follow locale direction.
- Accessibility: 320 px minimum; 48 px minimum and 56 px preferred targets; large separated anchors; sequential tap, forgiving drag, pointer click, and keyboard equivalence; no precision-path scoring; no color-, sound-, or motion-only information; visible focus; optional one-step assistance; forced-colors treatment; reduced-motion presentation with identical observation opportunity, decisions, and score ceiling.
- Performance target for architecture validation: first meaningful interaction within 2.5 seconds on a representative budget Android device over ordinary 4G; stable 30 fps minimum and 60 fps target during active play; no more than nine active anchors; visual payload target 35 KB and ceiling 50 KB gzip; active-board target 180 and ceiling 240 rendered nodes; bounded effects and memory; graceful interruption, invalid-link, pause, replay, asset-failure, and teardown behavior.
- Creative readiness: **complete**. `concepts/trace-relay/CREATIVE_BRIEF.md` compared three treatments, selected Ribbon Relay, and defined the complete user journey and product behavior. Its old standalone Islamic-review gate language is superseded by the current operating system, Issue #73, and direct policy enforcement.
- Islamic-content status: **Visual Direction PASS for the specified neutral abstract treatment, pending independent QA**. The brief contains no characters, clothing, sacred/occult/devotional symbols, hazardous imitation, wager, monetary chance reward, public humiliation, manipulative pressure, or public social feed. Audio is not approved and play remains complete in silence. Any later questionable addition must be removed or replaced with a neutral alternative without owner referral.
- Visual readiness: **production-ready specification complete** in `concepts/trace-relay/VISUAL_BRIEF.md`. It defines nine original folded-marker anchors, deterministic irregular field rules, route and crossing treatment, hidden state, complete state matrix, palette and contrast, HUD, rounds, relay mark, result/comparison/share hierarchy, assets, provenance, loading, performance ceilings, low-end fallback, multilingual layout, accessibility, policy record, and QA blockers.
- Motion readiness: creative intent and visual states are complete; production timing remains the next specialist task. Motion Design must specify reveal cadence, concealment/input boundary, state feedback, assistance, transitions, result-band formation, comparison/rematch, reduced-motion equivalents, bounded effects, pause/resume, replay reset, and teardown without changing the visual or policy contracts.
- Originality constraints: never use a standard 3×3 dot grid, lock/security language, four-color Simon-like pads, cumulative sound sequences, known toy layouts, branded palettes, copied characters/assets/wording, public leaderboards, hearts/lives, fail buzzers, flames, skulls, crowns, religious/occult glyphs, or humiliating competitive language.
- Architecture questions: renderer choice, deterministic field generation and rejection attempts, strict challenge-link validation, exact score formula and pause rules, input-mode fairness, score-claim trust model, lifecycle/teardown, privacy-safe analytics, local preference storage, font and share rendering, accessible anchor naming, procedural fallback, and future 3D isolation.
- Success signals: challenge-start, completion, replay, share, friend-open-to-start, friend completion, comparison view, and share-again meet experiment thresholds without material accessibility, localization, policy, originality, spoiler, lifecycle, or performance failures.
- Failure signals: users do not understand the mechanic quickly, the treatment resembles an unlock pattern or known memory product, friend links do not convert to play, completion is low, route state is unclear, input modes cannot reach the same score ceiling, share output leaks the solution, or low-end/RTL/reduced-motion behavior breaks.
- Non-goals: accounts, payments, public UGC, public leaderboards, chat, generic game engine, permanent 3D framework, multiple games, live multiplayer, final translations, runtime implementation in the Visual Direction task, or separate Islamic review gates.
- Dependencies: merged Product Strategy → merged Creative Direction → **Visual Direction specification and QA** → Motion Design → focused architecture decision → one vertical-slice implementation issue → Localization → independent QA → Coordinator merge.
- Next visible delivery: independent QA of Issue #73 output. A PASS unlocks Motion Design, then the focused architecture decision and one complete playable Trace Relay slice.

## Completed stages

### First vertical-slice product strategy

- Issue #67 and PR #68 selected Trace Relay as the first 2D vertical slice.
- Independent QA recorded PASS and the Coordinator merged PR #68 at `c1119898538887ba20152d44d3c7b74f5cbf96af`.
- Decision D-2026-001 remains proposed until the visual, motion, and architecture sequence completes.

### Trace Relay creative direction

- Issue #69 and PR #70 selected Ribbon Relay as the single creative treatment.
- The later operating-system reset removed the obsolete standalone Islamic Content Review role and all owner referrals; direct policy enforcement and independent QA now apply.

## Parked opportunities

- Signal Sprint: fast visual reaction sequence; revisit if Trace Relay validates same-seed competition but needs a more reflex-oriented catalog entry.
- Bridge Builder Dash: 2.5D placement/physics challenge; revisit after the shared shell and mobile performance budgets are proven by one shipped slice.