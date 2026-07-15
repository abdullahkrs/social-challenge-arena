# Agent Operating System

## Mission

Build and continuously evolve the product in `PRODUCT_BRIEF.md` quickly, coherently, and autonomously.

## Mandatory game direction

Before selecting, designing, implementing, or reviewing any new or materially upgraded challenge, read `GAME_DIRECTION.md` and treat it as a binding product and quality contract.

The issue body may narrow delivery scope, but it may not weaken the endless challenge, procedural variety, movement-plus-puzzle, concentration, escalating-pressure, visual-reference, prototype, originality, sound, accessibility, localization, social-loop, or production-evidence requirements in `GAME_DIRECTION.md`.

A challenge that contradicts `GAME_DIRECTION.md` must be reduced, redesigned, or rejected rather than merged for schedule convenience.

## Swarm topology

Only three scheduled roles are active:

1. **Queen Coordinator** — selects and routes one visible outcome.
2. **Worker Swarm** — owns the single active branch and delivers the complete outcome.
3. **QA Sentinel** — performs one bounded independent review.

Specialist perspectives such as product, trends, creative, visual, motion, 2D, 3D, platform, localization, accessibility, performance, and security are responsibilities inside the Worker Swarm—not separate waiting stages, issues, branches, or PRs.

## One-cell rule

Every delivery uses:

`one issue → one lead branch → one PR → one QA outcome → merge, reduce, or cancel`

The issue may contain bounded work lanes, but only the Worker Swarm writes the branch. No stacked PRs and no specialist handoff chain.

## Delivery types

The Queen chooses exactly one:

- **Platform Slice** — a visible platform improvement.
- **Challenge Slice** — a complete new or improved challenge.
- **Platform + Challenge Slice** — a platform capability proven by a real challenge journey. Prefer this when practical.
- **Repair Slice** — a reproducible user-facing, reliability, accessibility, localization, performance, privacy, or security fix.

## Platform and challenge balance

Do not build challenges on a platform blocker that prevents discovery, play, sharing, comparison, localization, accessibility, or acceptable performance.

Do not build generic platform infrastructure unless a real page, challenge, or user journey uses it in the same PR.

After each merge, classify the largest constraint as platform, challenge, social loop, localization/accessibility, or performance/reliability. The next issue must address that constraint.

## Speed rules

- Planning is written directly into the issue and may not exceed one Queen cycle.
- The Worker continues the same branch until ready for QA; it does not create sub-issues.
- QA posts one result per head SHA.
- `QA: BLOCKED` may contain at most two reproducible blockers.
- One correction cycle is expected. After two blocked heads, the Queen must reduce scope or cancel.
- No task may remain in the same state for more than two relevant agent cycles.
- No acknowledgement-only comments, repeated summaries, speculative debates, or documentation-only refinement without new evidence.
- Documentation changes belong in the delivery PR unless repository operation is impossible without a separate correction.

## Complete user-visible outcome

A challenge delivery is complete only when reachable from the real platform and includes the relevant journey:

Discover → play → result → replay → share → friend attempt → compare → share again.

A platform delivery is complete only when reachable and testable through a real user surface.

## 2D and 3D

2D, 2.5D, and 3D are equal capabilities. Select the simplest dimension that provides the intended product value. A 3D delivery must include loading, low-end behavior, performance budgets, reduced motion, camera/input clarity, and teardown.

## Languages

Arabic RTL, English, and Turkish are mandatory in every new user-facing delivery. Text must use one localization system; links and gameplay state remain language-independent.

## Islamic policy

Every issue, implementation, and QA review applies `ISLAMIC_CONTENT_POLICY.md`. Questionable content is removed, neutrally replaced, or rejected. No owner referral or separate religious review stage exists.

## Quality

Evidence must be current and factual. Runtime PRs verify tests, build, entry point, mobile widths, touch/keyboard where practical, reduced motion, lifecycle teardown, replay, share validation, localization/RTL, accessibility, performance, privacy/security, and deployable preview.

## Communication

- Issue body: source of truth.
- Worker: one concise self-review, maximum six bullets.
- QA: `QA: PASS` with maximum four bullets, or `QA: BLOCKED` with maximum two blockers.
- Queen: maximum four bullets per action.
- Do nothing when no action is required.