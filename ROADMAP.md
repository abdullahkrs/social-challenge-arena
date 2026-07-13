# Autonomous Roadmap

The Coordinator owns this roadmap and updates it from product evidence, agent recommendations, dependencies, and completed releases.

The repository owner defines the durable vision in `PRODUCT_BRIEF.md`; agents define ordinary stages, release contents, sequence, and scope.

## Current state

- Product brief: approved.
- Architecture: not yet selected; a focused decision must follow the approved concept.
- Active implementation priority: none until concept, Islamic, visual, motion, and architecture gates are complete.
- Current playable product: none.
- Current stage: Trace Relay specialist definition and validation.

## Roadmap rules

1. Continue unfinished work before selecting new work.
2. Maintain one active implementation priority.
3. Prefer a complete user-visible vertical slice.
4. No more than two consecutive foundation-only merges.
5. Each stage must define its user journey, Islamic-content status, languages, 2D/3D choice, visual/motion readiness, evidence, and next visible delivery.
6. The Coordinator may reorder stages when current evidence justifies it.
7. Major vision, Islamic-policy, privacy, payments, accounts, public UGC, or commercial changes require owner approval.

## Active stage — Trace Relay vertical-slice definition

- Product problem: social-media users need a challenge they can understand immediately, finish quickly, and share as a fair same-condition competition rather than a passive score card.
- Target audience: casual players, competitive friends, families, mixed-age users, and Arabic-, English-, and Turkish-speaking mobile users on low-end through high-end devices.
- Prioritized concept: **Trace Relay**, a short seeded spatial-memory challenge in which a route appears across an original field of geometric anchors and the player reproduces the same route by touch, pointer, or keyboard.
- Selected creative treatment: **Ribbon Relay**. A broad route ribbon travels through an irregular, non-grid field of distinctive anchors, hides, and is reproduced by the player. Three completed round bands become a spoiler-safe relay mark for result and sharing.
- Dimension: **2D** for the first slice. It provides the clearest input, lowest load and maintenance cost, strongest low-end reach, and no justified 3D benefit. Depth-like layering may be visual only. The shared shell and lifecycle must remain compatible with future 2D, 2.5D, and 3D games.
- Core journey: discover → understand from a brief visual demonstration → play three short seeded rounds → receive mastery/progress/flow result → replay or share a language-independent challenge link → friend plays the identical seed → both compare → rematch or share again.
- Round contract: five anchors and four route selections, then seven anchors and five selections, then nine anchors and six selections; round three may include one non-consecutive anchor revisit. Wrong input preserves completed progress, optional one-step assistance removes first-try mastery for that position, and finish-now produces a friendly partial result.
- Score intent: 1000 maximum with mastery weighted at 700, progress at 200, and capped flow at 100. Accuracy remains primary, supported input methods must have equal score ceilings, and exact timing/trust mechanics remain for architecture review.
- Social hook: one fair deterministic seed, one spoiler-safe score to beat, immediate friend comparison, a fresh-seed rematch, and voluntary share-again without public ranking, forced sharing, or manipulative urgency.
- Islamic-content status: pending mandatory Islamic Content Review. Creative Direction proposes abstract geometry, no characters or clothing, no realistic hazardous imitation, no monetary reward or chance purchase, no public feed or humiliation, and silent-complete play. It claims no religious PASS and routes final glyphs, the three-band result mark, celebration fragments, social tone, and every audio choice to the specialist review.
- Languages: Arabic with complete RTL, English, and Turkish from the first architecture. Gameplay geometry, challenge seed, anchor IDs, and route order remain language-independent and are not mirrored in RTL; shell layout, copy, controls, results, comparison, and accessible announcements follow locale direction.
- Accessibility: 320px minimum layout; large separated anchors; sequential tap, forgiving drag, pointer click, and keyboard equivalence; no precision-path scoring; no color-, sound-, or motion-only information; visible focus; optional one-step assistance; reduced-motion presentation with identical route-viewing opportunity, decisions, and score ceiling; concise optional instructions.
- Performance target for architecture validation: playable interaction within 2.5 seconds on a representative budget Android device over ordinary 4G; stable 30 fps minimum and 60 fps target during active play; no more than nine active anchors and one route presentation per round; bounded effects and memory; graceful asset, storage, interruption, invalid-link, pause, replay, and teardown behavior.
- Creative readiness: **ready for Islamic Content Review**. `concepts/trace-relay/CREATIVE_BRIEF.md` compares three materially different treatments and selects Ribbon Relay with a complete state-by-state journey, scoring intent, share contract, originality teardown, multilingual/accessibility constraints, feasibility risks, and specialist handoffs.
- Visual readiness: pending Islamic Content Review and Visual Direction. Visual Direction must finalize the anchor/glyph family, irregular field rules, ribbon and state matrix, HUD, result/comparison/share hierarchy, contrast, low-end fallback, asset provenance, originality comparison, and spoiler-safe relay mark.
- Motion readiness: creative intent is defined but production timing remains pending Motion Design. Motion Design must specify reveal cadence, concealment/input boundary, correct and incorrect feedback, assistance, transitions, final relay-mark transformation, reduced-motion equivalents, bounded effects, pause/resume, replay reset, and teardown.
- Originality constraints: never use a standard 3×3 dot grid, lock/security language, four-color Simon-like pads, cumulative one-more-step sound sequences, known toy layouts, branded palettes, copied characters/assets/wording, public leaderboards, lives/hearts, fail buzzers, flames, skulls, or humiliating competitive language.
- Architecture questions: rendering approach (DOM/SVG/canvas), deterministic seed generation, strict challenge-link validation, exact score formula and pause rules, input-mode fairness, score-claim trust model, lifecycle/teardown contract, privacy-safe analytics, local preference storage, font loading, accessible anchor naming, and future 3D game isolation.
- Success signals for the first released experiment: challenge-start rate, completion, replay, share, friend-open-to-start, friend completion, comparison view, and share-again meet the thresholds recorded in `EXPERIMENTS.md` without material accessibility, localization, policy, originality, spoiler, lifecycle, or performance failures.
- Failure signals: users do not understand the mechanic quickly, the treatment resembles an unlock pattern or known memory product, friend links do not convert to play, completion is low, route state is unclear on small screens, input modes cannot reach the same score ceiling, shared output leaks the solution, or low-end/RTL/reduced-motion behavior breaks.
- Non-goals: accounts, payments, public UGC, public leaderboards, chat, a generic game engine, a permanent 3D framework, multiple games, live multiplayer, final translations, final production art, final motion timing, religious approval by a non-review role, or decorative foundation work unrelated to this slice.
- Dependencies: merged Product Strategy → completed Creative Direction → **Islamic Content Review next** → Visual Direction and Motion Design → focused architecture decision → one vertical-slice implementation issue → Localization → QA.
- Next visible delivery: Islamic Content Review result for the selected Ribbon Relay treatment, followed by production-ready visual and motion briefs and one focused architecture decision that lets a single implementation issue deliver the complete playable Trace Relay journey from the real product entry point.

## Completed stages

### First vertical-slice product strategy

- Issue #67 and PR #68 selected Trace Relay as the first 2D vertical slice.
- Independent QA recorded PASS and the Coordinator merged PR #68 at `c1119898538887ba20152d44d3c7b74f5cbf96af`.
- The decision remains proposed until the mandatory specialist gates complete.

## Parked opportunities

- Signal Sprint: fast visual reaction sequence; revisit if Trace Relay validates same-seed competition but needs a more reflex-oriented catalog entry.
- Bridge Builder Dash: 2.5D placement/physics challenge; revisit after the shared shell and mobile performance budgets are proven by one shipped slice.
