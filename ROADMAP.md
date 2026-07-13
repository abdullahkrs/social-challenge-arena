# Autonomous Roadmap

The Coordinator owns this roadmap and updates it from product evidence, agent recommendations, dependencies, and completed releases.

The repository owner defines the durable vision in `PRODUCT_BRIEF.md`; agents define ordinary stages, release contents, sequence, and scope.

## Current state

- Product brief: approved.
- Architecture: not yet selected; a focused decision must follow the approved concept.
- Active implementation priority: none until concept, Islamic, visual, motion, and architecture gates are complete.
- Current playable product: none.
- Current stage: first vertical-slice definition and validation.

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
- Dimension: **2D** for the first slice. It provides the clearest input, lowest load and maintenance cost, strongest low-end reach, and no justified 3D benefit. The shared shell and lifecycle must remain compatible with future 2D, 2.5D, and 3D games.
- Core journey: discover → understand from a brief visual demonstration → play three short seeded rounds → receive accuracy/time/score result → replay or share a language-independent challenge link → friend plays the identical seed → both compare → rematch or share again.
- Social hook: one fair deterministic seed, one score to beat, immediate friend comparison, and a rematch generated from the same product flow.
- Islamic-content status: product strategy found no apparent prohibited theme or mechanic; implementation remains blocked until the Islamic Content Review records PASS, REVISE, or ESCALATE. No monetary chance reward, humiliation, unsafe imitation, prohibited theme, or public social feed is proposed.
- Languages: Arabic with complete RTL, English, and Turkish from the first architecture. Gameplay geometry and challenge seeds remain language-independent and are not mirrored by RTL; shell layout, copy, controls, and result presentation follow locale direction.
- Accessibility: 320px minimum layout; large anchors; touch, pointer, sequential-tap, and keyboard equivalence; no color-, sound-, or motion-only information; visible focus; reduced-motion presentation with identical decisions and scoring opportunities; concise optional instructions.
- Performance target for architecture validation: playable interaction within 2.5 seconds on a representative budget Android device over ordinary 4G; stable 30 fps minimum and 60 fps target during active play; bounded effects and memory; graceful asset or storage failure.
- Visual readiness: pending Creative Director and Visual Direction. They must define a distinctive geometric vocabulary that does not imitate phone unlock patterns, Simon-style trade dress, or an existing game, plus HUD, result, and share-card treatment.
- Motion readiness: pending Motion Design. It must define input confirmation, route reveal, error/near-miss, round transition, result celebration, replay reset, and reduced-motion equivalents without flashing or excessive shake.
- Architecture questions: rendering approach (DOM/SVG/canvas), deterministic seed generation, strict challenge-link validation, score-claim trust model, lifecycle/teardown contract, privacy-safe analytics, local preference storage, font loading, and future 3D game isolation.
- Success signals for the first released experiment: challenge-start rate, completion, replay, share, friend-open-to-start, friend completion, comparison view, and share-again meet the thresholds recorded in `EXPERIMENTS.md` without material accessibility, localization, policy, or performance failures.
- Failure signals: users do not understand the mechanic quickly, friend links do not convert to play, completion is low, the concept feels derivative, input modes are unfair, or low-end/RTL/reduced-motion behavior breaks.
- Non-goals: accounts, payments, public UGC, public leaderboards, chat, a generic game engine, a permanent 3D framework, multiple games, live multiplayer, or decorative foundation work unrelated to this slice.
- Dependencies: Creative Director recommendation → Islamic Content Review → Visual Direction and Motion Design → focused architecture decision → one vertical-slice implementation issue → Localization → QA.
- Next visible delivery: an approved creative, Islamic, visual, motion, and architecture brief that lets one implementation agent deliver the complete playable Trace Relay journey from the real product entry point.

## Completed stages

None.

## Parked opportunities

- Signal Sprint: fast visual reaction sequence; revisit if Trace Relay validates same-seed competition but needs a more reflex-oriented catalog entry.
- Bridge Builder Dash: 2.5D placement/physics challenge; revisit after the shared shell and mobile performance budgets are proven by one shipped slice.