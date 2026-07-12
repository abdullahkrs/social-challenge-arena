# Roadmap

## Current repository state

Active product reset. The no-login social competition loop is implemented, but the current nine challenges are now classified as legacy because they do not meet the required arcade-quality bar for excitement, visual identity, motion, and replay appeal.

The existing catalog must not receive additional polish or variants. It will be replaced progressively so the product never becomes empty and existing shared links are not broken abruptly.

## Completed foundation

1. Repository bootstrap and quality baseline — complete.
2. Mobile-first landing/discovery state — complete.
3. Playable challenge flow — complete.
4. Focused score/result state — complete.
5. Share or copy challenge/result link — complete.
6. Friend attempt opened from the shared link — complete.
7. Original-player and friend comparison — complete.
8. Share-again action from the comparison — complete.
9. Privacy-safe event instrumentation — complete.
10. Initial mechanical variety — superseded by the arcade-quality reset.
11. Lightweight private challenge creation — complete but must not expand until replacement games exist.

## Arcade-quality reset

### Stage 12 — Shared game foundation

Status: next.

Create the minimum reusable foundation needed by original arcade games without introducing a general-purpose engine or dependency unless proven necessary.

Required capabilities:

- A dedicated game viewport that works from 320px upward.
- A deterministic update loop with safe start, pause, finish, replay, and teardown.
- Reusable input handling for touch, pointer, keyboard, and reduced-motion mode.
- Lightweight sprite or vector animation support.
- Collision and bounded score helpers where needed.
- Timer and animation cancellation on replay, navigation, and completion.
- Integration with the existing result, share, friend, comparison, share-again, and metrics flows.

### Stage 13 — First flagship arcade challenge

Status: planned.

Build one original, polished flagship game before adding any other replacement.

The first game should use a one-touch flight or jump mechanic with gravity, momentum, animated obstacles, readable collision feedback, progressive speed or spacing pressure, score pop, restrained screen impact, and a satisfying result transition.

Acceptance requires:

- A player-controlled animated object and animated world.
- Meaningful physics or movement rather than a static button sequence.
- At least three purposeful feedback effects.
- Clear start, active play, failure, score, replay, and share states.
- Keyboard and touch parity.
- A reduced-motion equivalent that preserves decisions and scoring.
- Strict bounded shared score validation.
- Focused state, collision, teardown, accessibility, and URL tests.
- Verified behavior at 320px and one width from 360–430px.

After this stage is complete, hide all legacy challenges from ordinary discovery. Preserve compatibility only for valid existing legacy links.

### Stage 14 — Multilingual product shell

Status: planned.

Add a central translation system for English and Arabic first, including full RTL behavior, language selection, local preference storage, translated discovery/game/result/share/comparison text, and language-independent shared links. Add Turkish only after English and Arabic are complete and tested.

### Stage 15 — Replacement arcade catalog

Status: planned.

Add replacement games one focused cycle at a time. Each must be original and materially different in decisions, movement, failure, and scoring.

Preferred families:

- One-touch flight or jump survival.
- Aim, launch, bounce, or break targets.
- Short platform or obstacle run.
- Brick, ball, or ricochet precision.
- Vehicle or lane dodging with momentum.
- Animated target shooting or reaction.
- Physics-based balance or stacking.
- Fast visual puzzle with moving pieces.

Completion requires at least four polished replacement games, each with a distinct visual identity and mechanic. Legacy challenge compatibility may then be removed in a separate explicit cycle after link-impact review.

## Quality bar for every replacement game

A replacement game does not count unless it includes:

- Original name, visuals, rules, feedback, and presentation.
- A visible player-controlled object or game-world interaction.
- Escalating tension or increasing decision pressure.
- Immediate success, miss, collision, combo, or danger feedback.
- Motion that communicates gameplay rather than decoration.
- A satisfying score and result transition.
- Safe teardown of all timers, loops, listeners, and animation frames.
- `prefers-reduced-motion` support.
- No copied characters, artwork, sounds, levels, layouts, logos, or distinctive trade dress from known games.
- Reuse of the shared social competition loop rather than separate per-game result or sharing systems.

## Legacy catalog policy

- All current nine challenges are legacy and cancelled as future product content.
- Do not add new variants, translations, themes, difficulty tuning, or promotional work for them.
- Keep a temporary playable fallback until the first flagship replacement passes all quality gates.
- After the flagship ships, remove legacy entries from discovery in the same replacement cycle.
- Preserve strict legacy-link parsing only while compatibility is intentionally maintained.
- Do not present legacy challenge counts as product success metrics after this decision.
