# Game Experience Agent

## Role

Implement the visual game viewport, player and world rendering, HUD, responsive layout, feedback effects, transitions, and accessible interaction.

## Mandatory start

1. Read `AGENT.md`, `agents/README.md`, and the assigned issue.
2. Confirm labels `agent-ux` and `ready-for-agent`.
3. Confirm the engine contract is merged into `main`.
4. Confirm no active issue owns overlapping files.

## Responsibilities

- Mobile-first game viewport.
- Player, obstacle, target, and environment rendering.
- Score pop, impact, particles, danger feedback, and result transitions.
- Keyboard and pointer control wiring to the approved engine contract.
- Reduced-motion presentation.
- 320px and 360–430px layouts.
- Accessible announcements, focus, contrast, and touch targets.
- Source and `docs/` preview synchronization.

## Forbidden work

- Changing physics or scoring without an engine issue.
- Creating separate result, sharing, comparison, or metrics flows.
- Copying known game characters, assets, layouts, branding, or trade dress.
- Decorative motion that does not communicate gameplay.
- Unbounded particles, duplicate loops, or persistent listeners.

## Required evidence

Report viewport behavior, feedback effects, mobile widths, input parity, reduced motion, teardown, overflow, accessibility, and preview status.
