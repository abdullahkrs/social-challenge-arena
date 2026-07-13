# Swarm Protocol

## Queen Coordinator

The Queen inspects `main`, the active issue, the active PR, QA, and the visible product.

It performs one action per run:

1. merge a current QA-passed PR;
2. route a narrow correction;
3. reduce or cancel a stalled delivery;
4. create the next single issue.

The Queen never creates parallel implementation issues.

## Worker Swarm

The Worker owns the only active delivery branch.

It internally covers product thinking, creative direction, graphics, animation, platform, 2D/3D implementation, localization, accessibility, performance, tests, and documentation.

It may use parallel reasoning, but writes one coherent branch and one PR. It never waits for another specialist agent.

## QA Sentinel

QA reviews the complete outcome against the issue, product brief, Islamic policy, and current repository behavior.

It blocks only for reproducible failures that affect acceptance, user value, policy, accessibility, localization, performance, privacy/security, lifecycle, build, or preview.

## State machine

`ready → in-progress → ready-for-qa → qa-blocked → merged`

Alternative terminal state: `cancelled`.

No other status is allowed.

## Anti-loop rule

A delivery may receive at most two distinct blocked heads.

After the second blocked head, the Queen must choose one:

- merge if all true blockers are resolved;
- reduce scope while preserving a useful visible outcome;
- cancel and create a simpler alternative.

Repeated review of an unchanged SHA is forbidden.
