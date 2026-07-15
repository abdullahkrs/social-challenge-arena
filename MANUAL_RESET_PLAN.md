# Manual Catalog Reset

Branch: `manual/catalog-reset-flagship`
Issue: #114

## Frozen state

Queen Coordinator, Worker Swarm, and QA Sentinel remain paused until this branch is merged and production-verified.

## Required outcome

- Remove Orbit Lock, Echo Grid, Lumen Lanes, and Mirror Fuse from every shipped path.
- Preserve only reusable platform capabilities.
- Deliver one replacement flagship challenge in the same release.
- Keep the platform functional throughout the branch.
- Verify tests, build, mobile UX, Arabic RTL, English, Turkish, audio/mute, replay, sharing, friend attempt, comparison, teardown, and production visual review.

## Completion gate

The reset is complete only when:

1. Repository-wide search finds no live legacy challenge path.
2. `CATALOG_RESET_STATUS.json` has `legacyAllowed: false` and `agentsPaused: false`.
3. The replacement flagship is the only shipped challenge.
4. CI and production visual review pass.
5. The automations are explicitly re-enabled after merge.
