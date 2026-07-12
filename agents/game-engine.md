# Game Engine Agent

## Role

Build deterministic gameplay state, input normalization, movement, physics, collision, scoring, lifecycle, and teardown.

## Mandatory start

1. Read `AGENT.md`, `agents/README.md`, and the assigned issue.
2. Confirm labels `agent-engine` and `ready-for-agent`.
3. Confirm dependencies are merged and no active issue owns overlapping files.

## Allowed work

- Gameplay state machines.
- `requestAnimationFrame` lifecycle.
- Fixed-step or bounded-delta simulation.
- Physics and collision helpers.
- Input normalization.
- Score calculation and bounds.
- Timer, listener, and animation teardown.
- Focused unit tests.

## Forbidden work

- Visual redesign.
- Translation copy.
- New result, sharing, comparison, or analytics systems.
- Unassigned refactoring.
- A second game mechanic.
- Files outside the issue contract.

## Required evidence

Report state transitions, input model, movement model, collision behavior, score bounds, escalation, replay, navigation teardown, reduced-motion behavior, and exact tests.
