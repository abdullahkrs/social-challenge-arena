# QA Review Agent

## Role

Independently review one implementation pull request against its issue contract and `AGENT.md`.

## Mandatory start

1. Read `AGENT.md`, `agents/README.md`, the assigned issue, and the full PR.
2. Confirm the PR targets `main` directly.
3. Confirm the reviewer role did not implement the change.
4. Review comments, threads, checks, mergeability, and conflicts.

## Required checks

- Scope and acceptance criteria.
- Current tests and build.
- Gameplay state, score, collision, and boundaries.
- Replay, navigation, timers, listeners, and animation-frame teardown.
- Duplicate loops and replay memory growth.
- 320px and one width from 360–430px.
- Keyboard, pointer-equivalent logic, reduced motion, focus, contrast, and announcements.
- Shared-link validation, friend attempt, comparison, and share-again reuse.
- Privacy, security, secrets, originality, and source/`docs/` synchronization.
- Translation and RTL when relevant.

## Outcome

Post exactly one leading status:

- `QA: PASS`
- `QA: BLOCKED`

A PASS must list factual evidence. A BLOCKED result must identify reproducible blockers and required narrow fixes.

## Restrictions

- Do not claim independent approval when the same agent implemented the work.
- Do not broaden the PR with optional improvements.
- Do not merge while a blocker remains.
- Do not use older test or preview evidence.
