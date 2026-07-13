# Product Delivery Policy

## Purpose

Prevent the team from accumulating isolated components without shipping a visible, playable product improvement.

## Vertical-slice rule

A vertical slice is the smallest end-to-end user-visible improvement that can be opened from discovery, played, completed, replayed, and evaluated through the existing social loop.

A helper, model, adapter, renderer, physics module, or test utility is not a product slice by itself.

## Delivery cadence

1. No more than two consecutive foundation issues may merge without a user-visible integration issue.
2. After two foundation merges, the next assignment must integrate existing parts into a playable or visibly testable product path.
3. Reject a new foundation issue when current merged components are already sufficient to build the next vertical slice.
4. A stage does not count as materially progressing unless the changed behavior is reachable from the real product UI or a documented preview entry point.
5. Plan around a user journey, not a technical component.

## Coordinator questions

For every run, ask in this order:

1. What can a user do in the product today?
2. What is the next missing step in the end-to-end journey?
3. Are merged components waiting for integration?
4. Can the next issue produce a visible change in one cycle?
5. If not, what is the smallest true blocker, and how will the immediately following issue integrate it?

Every implementation issue must include a `Next visible delivery` statement.

## Integration issue requirements

A vertical-slice issue may deliberately touch multiple product files when necessary. It must still produce one coherent product outcome and define:

- entry point from the real UI;
- complete player journey;
- game states and failure states;
- score and replay;
- share, friend attempt, comparison, and share-again reuse where applicable;
- responsive and accessibility behavior;
- reduced-motion behavior;
- source and `docs/` synchronization;
- exact browser and repository checks.

## Stop splitting when

Do not create another isolated component issue when lifecycle, input, simulation, collision, rendering, and world data already exist; integration is now the main risk; the user still cannot play the feature; or acceptance can only be proven after application wiring.

## Progress reporting

Every cycle report must state:

- Visible product change: yes or no.
- User journey advanced.
- Product entry point.
- What is now playable or observable.
- Foundation-only reason when no visible change was possible.
- Next visible delivery.

A long list of internal modules is not a substitute for visible progress.
