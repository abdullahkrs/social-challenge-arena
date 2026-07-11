# Agent Operating System

This file defines the permanent operating policy for autonomous development of **Social Challenge Arena**.

Keep only durable rules here. Store changing progress in `ROADMAP.md` and `TASK_LOG.md`, decisions in `DECISIONS.md`, deferred ideas in `BACKLOG.md`, and hypotheses in `EXPERIMENTS.md`.

## 1. Precedence

When instructions conflict, use this order:

1. Explicit user instruction for the current task.
2. `AGENT.md`.
3. `DECISIONS.md`.
4. `ROADMAP.md`.
5. `TASK_LOG.md`.
6. Existing repository conventions.

Never invent repository state. Verify it from files, code, tests, build output, Git history, pull requests, reviews, and preview evidence when available.

## 2. Product north star

Build a mobile-first web product where a user can:

Discover a challenge  
→ Play it quickly  
→ Get a clear result  
→ Share one challenge/result link  
→ A friend opens it and competes  
→ Both results are compared  
→ The comparison encourages another share.

The first validated path uses curated playable challenges.

Until lightweight challenge creation exists, use:

- Original player
- Sharer
- Friend or challenger

Do not call the original player a creator unless that person created the challenge.

## 3. Product constitution

1. Mobile first.
2. No login for the initial MVP.
3. One obvious primary action per state.
4. Every product task must advance or protect the viral loop.
5. Keep the experience fast, low-text, and understandable within seconds.
6. Do not rebuild working functionality without evidence of a blocker.
7. Do not add payments before the core loop is validated.
8. Do not add a public feed, profiles, followers, likes, chat, or real-time multiplayer before the core loop works.
9. Do not add unsafe, humiliating, illegal, discriminatory, self-harm, sexual-minor, or privacy-invasive challenges.
10. Prefer the highest product impact per unit of work within the current MVP stage.

## 4. Repository state

Classify the repository at the start of every cycle as exactly one of:

- **Empty or reset:** no runnable baseline exists. Bootstrap is the only valid task.
- **Bootstrapped:** source, tests, build, documentation, and preview output exist, but no complete user-facing product step is verified.
- **Active MVP development:** at least one user-facing MVP step is implemented and verified.
- **Blocked:** tests, build, security, preview-critical behavior, merge conflicts, unresolved blocking review findings, or repository inconsistency prevents safe progress.

If blocked, resolving that blocker is the entire cycle.

The absence of external automation is not a blocker. Use repository scripts and available preview evidence.

## 5. Architecture preference

For the initial MVP, prefer:

- Static mobile-first HTML, CSS, and vanilla JavaScript.
- Node.js 20 or newer.
- Node.js built-in test runner.
- A simple static build output.
- GitHub Pages-compatible preview files.

Do not introduce a framework, database, bundler, package, or external service unless the current architecture cannot reasonably complete the selected step, the decision is recorded in `DECISIONS.md`, and the architecture change is the only task of that cycle.

## 6. Source-of-truth files

- `AGENT.md`: permanent operating policy.
- `ROADMAP.md`: stage order and completion status.
- `TASK_LOG.md`: cycle history and current status.
- `DECISIONS.md`: meaningful product and technical decisions.
- `BACKLOG.md`: deferred non-experimental ideas.
- `EXPERIMENTS.md`: testable hypotheses.
- `METRICS.md`: loop metrics and success criteria.
- `CHANGELOG.md`: user-visible, build, and deployment changes.

Do not duplicate mutable status across several files.

## 7. Mandatory review before editing

Read `AGENT.md` first, then review when available:

- `README.md`
- `ROADMAP.md`
- `TASK_LOG.md`
- `DECISIONS.md`
- `BACKLOG.md`
- `EXPERIMENTS.md`
- `METRICS.md`
- `CHANGELOG.md`
- `package.json`
- `package-lock.json`
- `.gitignore`

Also inspect the current branch, working-tree state when accessible, latest commits, open pull requests that affect continuity, existing scripts, tests, lint/type-check commands, and current preview behavior when relevant.

Do not overwrite, discard, reformat, stage, or commit unrelated changes. Never force-push, rewrite history, use destructive reset commands, or run broad formatting.

## 8. Strategic review and continuity

Before selecting a task, answer briefly:

1. Is the current direction aligned with the north star?
2. What is the largest product bottleneck?
3. What is the largest technical or delivery risk?
4. Has new evidence invalidated an assumption?
5. Is the next roadmap item still the highest-impact small task?

Then:

1. Find the latest cycle number and status in `TASK_LOG.md`.
2. Continue an existing planned, in-progress, or blocked cycle.
3. If complete, use the next numeric cycle number.
4. Verify completion in code and tests.
5. Check tests, build, relevant lint/type-check, open PR dependencies, and preview behavior when relevant.
6. Select only a blocker when one exists.
7. Otherwise select the earliest incomplete roadmap stage.
8. Do not reopen settled decisions unless they block progress.

## 9. One-cycle engine

Each cycle follows:

```text
Review repository state
→ Run strategic review
→ Select one task
→ Record the cycle plan
→ Implement the minimum change
→ Test
→ Build
→ Verify preview when relevant
→ Review the complete diff
→ Resolve review findings
→ Open or update the pull request
→ Merge automatically when safe
→ Update the same cycle log
→ Send the report
→ Stop
```

Do not start a second product task after the selected task succeeds.

## 10. TASK_LOG.md

Before product edits, create or update one cycle section with:

- Cycle number and Europe/Istanbul ISO 8601 time.
- Status.
- Selected task and goal.
- Selection reason.
- Viral-loop impact.
- Acceptance criteria.
- Expected files.
- Explicit non-goals.
- Strategic review.
- Product-thinking answers.
- Parked idea, if any.

Product-thinking questions:

1. What blocks the next core-loop step?
2. What would make the original player more likely to continue or share?
3. What would make a friend more likely to open and compete?
4. What is the smallest implementation proving the step?
5. Did a useful creative idea appear?

At cycle end, update the same section with completion status, completed work, preserved non-goals, files changed, exact tests and checks, build result, preview status, review findings and resolutions, merge result, commit/branch/PR information, decision, remaining limitation, and next task.

## 11. MVP order

1. Repository bootstrap and quality baseline.
2. Mobile-first landing/discovery state.
3. First playable curated challenge.
4. Focused score/result state.
5. Share or copy challenge/result link.
6. Friend attempt opened from the shared link.
7. Original-player and friend comparison.
8. Share-again action from the comparison.
9. Basic privacy-safe MVP event instrumentation.
10. Curated challenge variety.
11. Lightweight private challenge creation.

Stages 1–9 complete the first measurable viral loop. Store completion status in `ROADMAP.md`.

## 12. Definition of done

A task is complete only when:

1. Acceptance criteria are satisfied.
2. The behavior exists in the repository.
3. Focused tests pass when required.
4. The build passes when configured.
5. Relevant lint/type-check passes when configured.
6. User-facing changes are preview-verified or marked unverified with an exact reason.
7. Mobile behavior is checked at 320px and one width from 360–430px when user-facing.
8. No horizontal overflow or blocked primary action is introduced.
9. No secrets, unsafe content, or unrelated changes are present.
10. The complete diff has been reviewed.
11. No unresolved blocking review finding or merge conflict remains.
12. The pull request has been merged into its intended base branch, unless merging is unavailable or unsafe and the cycle is marked blocked.
13. `TASK_LOG.md` records factual evidence.

## 13. Mandatory review and automatic merge

Every cycle must include a final repository review before merge.

Review the entire pull-request diff, not only the last edited file. Check:

- Alignment with the selected task and acceptance criteria.
- One-task scope and absence of unrelated changes.
- Correctness, state handling, accessibility, mobile layout, security, and privacy.
- Test quality and actual test/build results.
- Source and generated preview synchronization.
- Secret-like strings and unsafe URL or DOM handling.
- Pull-request base branch, dependency order, mergeability, and conflicts.
- Existing review comments and unresolved review threads.

Classify findings as:

- **Blocking:** correctness, security, privacy, broken tests/build, acceptance-criteria failure, merge conflict, unsafe behavior, unrelated scope, or unresolved required change.
- **Non-blocking:** optional improvement that does not invalidate the selected task.

For blocking findings:

1. Fix them within the same task when this does not broaden scope.
2. Re-run relevant tests and build.
3. Re-review the updated diff.
4. Do not merge while any blocking finding remains.
5. Mark the cycle blocked when a safe fix requires broader scope.

For a clean review:

1. Open or update a pull request to the intended base branch.
2. Record the review outcome in the PR and `TASK_LOG.md`.
3. Merge automatically using squash merge when supported; otherwise use an allowed repository merge method.
4. Use the expected head SHA when supported to prevent merging a changed PR accidentally.
5. Verify the PR reports `merged` and record the merge SHA.
6. Never merely enable a future merge and claim completion; complete the merge during the cycle when it is currently safe and permitted.
7. If permissions, branch protection, dependency order, conflicts, or unavailable tools prevent merging, do not bypass safeguards. Mark the cycle blocked and report the exact reason.

A review of one's own changes is a documented self-review, not an independent approval. Do not claim independent approval unless another reviewer actually provided it.

## 14. Focused creativity and anti-loop protection

- Implement a creative idea only when required by acceptance criteria.
- Put hypotheses in `EXPERIMENTS.md` and deferred ideas in `BACKLOG.md`.
- Do not implement parked ideas in the same cycle.
- Compare the task with the last three completed cycles.
- Do not repeat completed work without a reproducible defect or new evidence.

## 15. Challenge variety and creation

Before the first loop is complete, keep one shared challenge, result, sharing, and comparison flow. Avoid systems tied only to one challenge.

Curated variety requires at least 6 playable challenges, 3 meaningful categories or themes, 2 difficulty levels, reusable shared components, and data-driven definitions where compatible.

Lightweight creation comes after the loop and must initially be no-login, private by link, based on an existing mechanic, short, validated, and safe against malformed or executable content.

## 16. Mobile UX

1. Design from 320px upward; prioritize 360–430px.
2. No horizontal scrolling.
3. One obvious primary action per state.
4. Avoid unnecessary onboarding, modals, explanatory cards, and long marketing text.
5. Keep titles, helper text, and labels short.
6. Interactive targets should be at least 44×44 CSS pixels.
7. Preserve keyboard access, visible focus, semantic structure, adequate contrast, language consistency, and RTL when Arabic is used.
8. Do not fabricate rankings, records, popularity, or social proof.

## 17. Implementation, security, and quality

- Make the minimum change.
- Preserve the existing framework and conventions.
- Do not add a dependency unless necessary and documented.
- Avoid broad refactoring, formatting, redesign, migration, or upgrades.
- Add focused behavior tests for behavior changes.
- Keep the MVP no-login.
- Validate URL, hash, clipboard, storage, and shared state.
- Use safe DOM APIs for untrusted values.
- Never commit secrets, personal data, or `.env` files.
- Run the existing test and build commands.
- Run configured lint/type-check commands when relevant.
- Manually exercise changed paths when browser tools are available.
- Inspect the final diff for scope and secrets.
- Never use an older result as evidence for a new change.

For user-facing work report exactly one preview status:

1. Preview verified live for the relevant deployed commit.
2. Repository preview output verified for the relevant commit.
3. Preview not verified, with the exact reason.

## 18. Git rules

- Use a dedicated branch and pull request.
- Use Conventional Commits.
- Prefer one focused commit per cycle when tooling permits.
- Keep source, tests, documentation, and preview files synchronized.
- Never fabricate Git, review, PR, or merge actions.
- Never force-push or rewrite history.
- Do not begin the next cycle from an unmerged feature branch. Start from the updated default branch after the prior cycle merge.

## 19. Stop conditions

Stop rather than broaden scope when the repository cannot be read or written, unrelated changes conflict, product direction must change without a decision, a forbidden feature is required, tests/build cannot be fixed narrowly, a safe implementation needs an unapproved service, shared state cannot be handled safely, review finds an unresolved blocker, or the PR cannot be merged safely.

Gmail or an unavailable optional tool is not a development blocker when technical work can still be completed. Report unavailable actions accurately.

## 20. Reporting

Always finish the active `TASK_LOG.md` section with factual results.

When sending is available, email `ggmmgg9@gmail.com` with cycle status, goal, reason, viral-loop impact, completed work, non-goals, files, exact checks, build, preview, review outcome, merge outcome and SHA, branch and PR, decision, product thinking, parked idea, limitation, and next task.

Do not claim an email, review, approval, PR, or merge succeeded unless it actually did.

Finish the chat report in concise Arabic labeled lines and stop after one cycle.
