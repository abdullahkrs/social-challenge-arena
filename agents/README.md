# Agent Team

## Instruction precedence

1. Current explicit user instruction.
2. `AGENT.md`.
3. The assigned GitHub issue.
4. The role file under `agents/`.
5. `DECISIONS.md`, `ROADMAP.md`, and `TASK_LOG.md`.
6. Repository conventions.

## Roles

| Role | Instruction file | Required label |
|---|---|---|
| Coordinator | `agents/coordinator.md` | `agent-coordinator` |
| Creative Director | `agents/creative-director.md` | `agent-creative` |
| Social Trends Scout | `agents/social-trends.md` | `agent-trends` |
| Game Engine | `agents/game-engine.md` | `agent-engine` |
| Game Experience | `agents/game-experience.md` | `agent-ux` |
| Localization | `agents/localization.md` | `agent-i18n` |
| QA Review | `agents/qa-review.md` | `ready-for-qa` |

## Assignment gate

An implementation or research agent may change the repository only when:

- an open issue identifies exactly one owner role;
- the issue is marked `ready-for-agent`;
- all listed dependencies are merged into `main`;
- allowed and forbidden files are explicit;
- no active issue owns overlapping files;
- no existing pull request already implements the assignment.

If no valid assignment exists, stop without creating a branch.

## Issue states

Use these labels or equivalent explicit status text:

- `ready-for-agent`
- `in-progress`
- `blocked`
- `ready-for-qa`
- `qa-blocked`
- `qa-passed`
- `merged`

## Pull request rules

- Branch from current `main`.
- One issue, one narrow task, one branch, and one PR.
- Every PR targets `main` directly.
- Include `Closes #<issue-number>` when applicable.
- Implementation agents may self-review but must not call it independent approval.
- QA review must be performed by a role that did not implement the change.
- Do not merge without `QA: PASS` unless an explicit owner instruction overrides this gate.
- Do not create stacked, promotion, or consolidation pull requests.

## File ownership

The issue contract controls ownership. Role defaults are guidance only.

- Engine: deterministic gameplay state, physics, collision, lifecycle, teardown, and focused tests.
- Experience: viewport, rendering, HUD, responsive layout, feedback, and accessibility presentation.
- Localization: translation module, language selector, RTL, and localization tests.
- Creative and Trends: proposal and research documents only unless a prototype is explicitly assigned.
- QA: review comments and narrow blocker fixes only when explicitly authorized.

## Coordination flow

```text
Social Trends Scout → qualified signal
Creative Director → original concept or experiment
Coordinator → issue contract and dependency order
Implementation Agent → focused PR
QA Review → QA: PASS or QA: BLOCKED
Coordinator → merge and next assignment
```
