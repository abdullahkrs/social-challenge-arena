# Agent Operating System

This file defines the permanent operating policy for autonomous development of **Social Challenge Arena**.

It must contain durable rules only. Do not store current progress, completed stages, or the next task here. Put changing state in `ROADMAP.md` and `TASK_LOG.md`, decisions in `DECISIONS.md`, deferred ideas in `BACKLOG.md`, and hypotheses in `EXPERIMENTS.md`.

## 1. Purpose and precedence

Use this file as the highest-priority repository guide.

When instructions conflict, use this order:

1. Explicit user instruction for the current task.
2. `AGENT.md`.
3. `DECISIONS.md`.
4. `ROADMAP.md`.
5. `TASK_LOG.md`.
6. Existing repository conventions.

Never invent repository state. Verify it from files, code, tests, Git history, CI, and preview evidence.

## 2. Product north star

Build a mobile-first web product where a user can:

Discover a challenge  
→ Play it quickly  
→ Get a clear result  
→ Share one challenge/result link  
→ A friend opens it and competes  
→ Both results are compared  
→ The comparison encourages another share.

The first validated path should use curated playable challenges.

Until lightweight challenge creation exists, use these terms:

- Original player
- Sharer
- Friend or challenger

Do not call the original player a creator unless that person created the challenge.

## 3. Product constitution

These rules should rarely change:

1. Mobile first.
2. No login for the initial MVP.
3. One obvious primary action per state.
4. Every product task must advance or protect the viral loop.
5. Keep the experience fast, low-text, and understandable within seconds.
6. Do not rebuild working functionality without evidence of a blocker.
7. Do not add payments before the core loop is validated.
8. Do not add a public feed, profiles, followers, likes, chat, or real-time multiplayer before the core loop works.
9. Do not add unsafe, humiliating, illegal, discriminatory, self-harm, sexual-minor, or privacy-invasive challenges.
10. Prefer the highest product impact per unit of work, while staying within the current MVP stage.

## 4. Repository state detection

At the start of every cycle, classify the repository as exactly one of:

### Empty or reset

`AGENT.md` exists, but there is no runnable application or project baseline.

Only valid first task:

> Bootstrap the minimum runnable, testable, buildable, and previewable project baseline.

Do not assume any feature from earlier history still exists.

### Bootstrapped

Basic source, tests, build, documentation, CI, and preview configuration exist, but no complete user-facing product step is verified.

### Active MVP development

At least one user-facing MVP step is implemented and verified.

### Blocked

Tests, build, CI, preview, security, or repository inconsistency prevents safe progress.

If blocked, fixing that blocker is the entire cycle.

## 5. Architecture preference

For the initial MVP, prefer:

- Static mobile-first HTML, CSS, and vanilla JavaScript.
- Node.js 20 or newer.
- Node.js built-in test runner.
- A simple static build output.
- GitHub Actions for test/build validation.
- GitHub Pages for preview.

These are preferences, not claims about the current repository state.

Do not introduce a framework, database, bundler, package, or external service unless:

1. The current architecture cannot reasonably complete the selected MVP step.
2. The change is documented in `DECISIONS.md`.
3. The architecture change is the only task of that cycle.

## 6. Source-of-truth hierarchy

Use these files as follows:

- `AGENT.md`: permanent operating policy.
- `ROADMAP.md`: current stages, order, and completion status.
- `TASK_LOG.md`: cycle history and current cycle status.
- `DECISIONS.md`: meaningful product and technical decisions.
- `BACKLOG.md`: useful deferred non-experimental ideas.
- `EXPERIMENTS.md`: testable product hypotheses.
- `METRICS.md`: loop metrics and success criteria.
- `CHANGELOG.md`: user-visible, build, and deployment changes.

Do not duplicate the same mutable status across several files.

## 7. Mandatory review before editing

Read `AGENT.md` first, then review these files when available:

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
- `.github/workflows/ci.yml`

Also inspect:

- Current branch and working-tree state when accessible.
- Latest relevant commits.
- Existing scripts, tests, lint, and type-check commands.
- CI status for the relevant commit.
- Live preview when the selected task is user-facing.

Missing optional files are not blockers. Do not create one unless the selected task genuinely needs it.

Never overwrite, discard, reformat, stage, or commit unrelated existing changes. Never force-push, rewrite history, use destructive reset commands, or run broad formatting.

## 8. Strategic review

Before task selection, answer in no more than five concise bullets:

1. Is the current direction still aligned with the north star?
2. What is the largest current product bottleneck?
3. What is the largest technical or delivery risk?
4. Has new evidence invalidated a documented assumption?
5. Is the next roadmap item still the highest-impact small task?

Rules:

- Do not change direction based on opinion alone.
- A direction change requires evidence and a `DECISIONS.md` entry.
- If no strategic change is needed, continue immediately.
- The strategic review must not become a research project.

## 9. Continuity and task selection

Use actual repository evidence as the source of truth.

At cycle start:

1. Find the latest cycle number and status in `TASK_LOG.md`.
2. If the latest cycle is planned, in progress, or blocked, continue that exact task.
3. If it is complete, use the next numeric cycle number.
4. Verify claimed completion in code and tests; text alone is not proof.
5. Check the baseline: tests, build, relevant lint/type-check, CI, and preview.
6. If a blocker exists, select only the blocker.
7. If no blocker exists, identify the earliest incomplete roadmap stage.
8. Select the smallest task inside that stage with the highest product impact and evidence value.
9. Do not select a future-stage feature merely because it is easier or more exciting.
10. Do not reopen settled decisions unless they directly block progress.

Use this priority model only among valid tasks in the current stage:

```text
(Product impact × Loop relevance × Evidence value)
--------------------------------------------------
(Implementation effort × Risk × Scope uncertainty)
```

When options are close, choose the smallest task with the clearest acceptance criteria and tests.

## 10. One-cycle engine

Each cycle must follow this sequence:

```text
Review repository state
→ Run strategic review
→ Find blocker or earliest incomplete stage
→ Select one task
→ Record cycle plan
→ Implement minimum change
→ Test
→ Build
→ Verify CI/preview when relevant
→ Review scope/security
→ Commit or report Git limitation
→ Update the same cycle log
→ Send report
→ Stop
```

One cycle means one selected development or blocker task plus only its directly required tests, minimal documentation, Git work, preview verification, and reports.

Do not start a second product task after the selected task succeeds.

## 11. Cycle planning in TASK_LOG.md

Before changing product code, create or update one concise cycle section containing:

- Cycle number.
- ISO 8601 `Europe/Istanbul` date/time.
- Status: planned or in progress.
- Selected task and goal.
- Why it is selected now.
- How it advances or protects the viral loop.
- Acceptance criteria.
- Expected files to change.
- Explicit non-goals.
- Strategic review summary.
- Product-thinking answers.
- Parked idea, if any.

Answer briefly:

1. What blocks the next core-loop step?
2. What would make the original player more likely to continue or share?
3. What would make a friend more likely to open and compete?
4. What is the smallest implementation that proves the selected step?
5. Did a useful creative idea appear?

“No useful new idea this cycle” is acceptable.

At cycle end, update the same section with:

- Final status: completed or blocked.
- What was completed.
- Intentional non-goals preserved.
- Files changed.
- Exact test/check results.
- Build result.
- CI result for the relevant commit.
- Preview or artifact status.
- Commit, branch, and PR information when available.
- Decision made or “No new decision.”
- Remaining limitation.
- Next suggested task.

Do not create multiple sections for one cycle.

## 12. MVP stage sequence

Determine completion dynamically from repository evidence.

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

Stages 1–9 complete the first measurable end-to-end viral loop. Stages 10–11 expand content and creation afterward.

Store current completion status in `ROADMAP.md`, not in this file.

## 13. Universal definition of done

A selected task is complete only when:

1. All acceptance criteria are satisfied.
2. The behavior exists in the repository, not only in documentation.
3. Focused tests pass when tests exist or are required.
4. The build passes when a build script exists or is required.
5. Relevant lint/type-check passes when configured and applicable.
6. Relevant CI passes, or its unavailability is stated accurately.
7. User-facing changes are verified in preview, or marked unverified with an exact reason.
8. Mobile behavior is checked at 320px and at least one width between 360px and 430px when user-facing.
9. No horizontal overflow or blocked primary action is introduced.
10. No secrets, unsafe content, or unrelated changes are present.
11. `TASK_LOG.md` records factual evidence.
12. The task does not rely on a non-functional placeholder.

If any required item fails, mark the cycle blocked rather than completed.

## 14. Focused creativity

Creativity is required but controlled.

- Implement a creative idea now only when required by the selected task’s acceptance criteria.
- Put a testable hypothesis in `EXPERIMENTS.md`.
- Put a useful non-experimental idea in `BACKLOG.md`.
- Do not add the same idea to both.
- Do not implement a parked idea in the same cycle.
- Add at most one new idea or hypothesis per cycle.
- Do not change product direction every cycle.

## 15. Anti-loop protection

Before selecting a task, compare it with the last three completed cycles.

Do not select substantially the same completed task again unless:

- A reproducible bug exists.
- Tests, build, CI, or preview is broken.
- The next MVP stage is blocked by it.
- New user or test evidence disproves the previous implementation.

Invalid task titles without measurable defects and acceptance criteria include:

- Improve the UI.
- Make it better.
- Polish the experience.
- Refactor the app.
- Optimize UX.

Documentation-only cycles are allowed only when:

- The repository is being bootstrapped.
- A product or technical decision blocks implementation.
- Documentation is materially wrong and causes unsafe execution.
- The user explicitly requests documentation work.

Otherwise, documentation updates must support the selected implementation or blocker task.

## 16. Product debt and technical debt

Track both forms of debt without automatically fixing them.

### Product debt examples

- The user does not understand the page quickly.
- The share prompt is weak.
- The friend has no clear reason to click.
- The comparison does not motivate another share.

### Technical debt examples

- Duplicated behavior.
- Fragile state handling.
- Missing tests around critical flows.
- Manual preview synchronization.

Record debt in `BACKLOG.md` unless it directly blocks the current stage. Do not turn debt cleanup into an unbounded cycle.

## 17. Challenge variety and creation

Before the first end-to-end loop is complete:

- Keep one shared challenge-running flow.
- Keep one shared result flow.
- Keep one shared sharing/comparison flow.
- Do not build separate systems for each challenge.
- Do not add a new mechanic merely to create artificial variety.
- Avoid new assumptions tied only to the first challenge.

When curated variety is selected, target:

- At least 6 curated playable challenges.
- At least 3 meaningful categories or themes.
- At least 2 difficulty levels.
- Reusable shared challenge, result, navigation, sharing, and comparison components.
- Data-driven challenge definitions where compatible with the architecture.

A title-only variation does not count as meaningful variety.

Lightweight challenge creation must come after the first loop works end-to-end and must initially be:

- No-login.
- Private by link.
- Based on an existing supported mechanic.
- Limited to a short validated title or prompt.
- Free of public discovery, feeds, profiles, moderation dashboards, and creator analytics.
- Safe against script injection and malformed URL content.

Public user-generated discovery requires a separate product decision.

## 18. Mobile UX and content rules

1. Design from 320px upward; prioritize 360–430px.
2. No horizontal scrolling.
3. Keep the main result/action visible without unnecessary scrolling.
4. Use one obvious primary action per state.
5. Use no more than one secondary action unless genuinely required.
6. Do not add onboarding screens, tutorial modals, explanatory cards, or long marketing text.
7. Do not repeat the same information across title, subtitle, badge, and body.
8. Prefer hierarchy and immediate feedback over explanations.
9. Add one short instruction only when the interaction is not self-evident.
10. Prefer short verb-based labels.
11. Targets: title 2–6 words, helper text one short sentence, button label 1–3 words.
12. Do not add disabled or non-functional controls for future features.
13. Do not use ambiguous icons without labels.
14. Icon-only controls need accessible names.
15. Interactive targets should be at least 44×44 CSS pixels.
16. Preserve keyboard access, visible focus, semantic structure, and adequate contrast.
17. Avoid unnecessary animation and respect reduced-motion preferences.
18. Preserve the product’s current language.
19. Do not mix Arabic and English unintentionally.
20. If the UI is Arabic, preserve correct RTL behavior.
21. Errors and empty states must be brief, specific, and actionable.
22. Do not fabricate rankings, records, percentiles, popularity, or social proof.

## 19. Implementation rules

1. Make the minimum changes required.
2. Preserve the existing framework, package manager, style, and conventions.
3. Prefer readable code and existing utilities.
4. Prefer small pure functions for state, URL, scoring, and message logic.
5. Use safe DOM APIs such as `textContent` for untrusted values.
6. Do not add a dependency unless completion is otherwise unreasonable; document why.
7. Do not perform broad formatting, refactoring, cleanup, redesign, migration, or upgrades.
8. Do not modify unrelated files.
9. Do not modify CI/deployment unless that is the selected task or a blocking CI/deployment defect.
10. Add or update focused behavior tests when behavior changes.
11. Prefer behavior assertions over snapshot-only tests.
12. Keep the initial MVP no-login.
13. Update `README.md` only when documented behavior or run/test/build/preview instructions change.
14. Update `CHANGELOG.md` for user-visible, build, or deployment changes.
15. Update `DECISIONS.md` only for a meaningful decision; otherwise report “No new decision.”
16. Do not modify a lockfile unless dependencies change.

## 20. Security and privacy

1. Never commit API keys, tokens, passwords, cookies, private emails, personal data, or `.env` files.
2. Keep `.env` ignored and use only safe placeholders in `.env.example`.
3. Review the final diff for secret-like strings and unrelated content.
4. Treat URL, hash, clipboard, storage, and shared state as untrusted.
5. Validate identifiers, versions, lengths, types, and numeric ranges.
6. Do not render URL-provided text as unsafe HTML.
7. Keep shared links limited to minimum non-sensitive state.
8. Do not add personal identifiers to links or metrics.
9. Do not claim client-side scores are tamper-proof.
10. Do not expose stack traces in user-facing errors.

## 21. Quality, CI, build, and preview gates

Use existing repository scripts and package manager.

When a local runtime exists:

1. Run the existing test command.
2. Run the existing build command.
3. Run relevant lint/type-check commands when configured.
4. Manually exercise the changed path.
5. Check narrow mobile widths.
6. Inspect the final diff for scope and secrets.

If a required script does not exist:

- Report it as unavailable.
- Do not claim it passed.
- Create missing test/build infrastructure only when the selected bootstrap or blocker task requires it.

If local execution is unavailable:

- Check GitHub Actions when available.
- Use only the run associated with the relevant commit SHA.
- Never use an older successful run as evidence.

For every user-facing change, report exactly one:

1. Preview verified live for the relevant deployed commit.
2. Relevant GitHub Actions preview artifact available.
3. Preview not verified, with the exact reason.

Preview verification requires exercising the changed flow, not merely loading the homepage.

## 22. Atomic Git and repository actions

When tree/commit/ref tools are available:

1. Prepare all selected-task files.
2. Run available validation before publishing.
3. Create one tree.
4. Create one focused commit.
5. Move the branch ref once.

Avoid publishing partially synchronized source, tests, documentation, or preview files across sequential commits.

When atomic updates are unavailable:

- Keep temporary inconsistency as short as possible.
- Cancel superseded CI runs when supported.
- Verify the final commit, not intermediate commits.
- Report the exact tooling limitation.

Git actions must never be fabricated.

- Prefer a branch and pull request when supported by the available tools and repository workflow.
- If only direct repository writes are supported, use the established branch and report the limitation.
- Use Conventional Commits.
- Prefer one focused commit per cycle.
- Never claim a branch, commit, SHA, push, PR, workflow run, or merge exists unless it was created or observed.
- Never force-push or rewrite history.

## 23. End-of-cycle self-critique

Before marking a cycle complete, answer:

1. Did this cycle complete exactly one task?
2. Did the change materially advance or protect the viral loop?
3. Was unnecessary complexity introduced?
4. Did any unrelated file change?
5. Is behavior or product copy duplicated?
6. Could anything added in this cycle be safely removed?
7. Does the evidence justify completion?

If the answers reveal a blocker, do not mark the cycle completed.

## 24. Stop conditions

Stop and report rather than broaden scope when:

- The repository cannot be read and no editable output can be produced.
- Unrelated changes conflict with the task.
- The task requires changing product direction without evidence and a decision record.
- The task requires a forbidden pre-MVP feature.
- Tests/build fail and cannot be fixed without broadening the cycle.
- A safe implementation requires an unapproved vendor or service.
- The request is outside MVP scope and not explicitly approved.
- Required shared state cannot be handled safely.

Gmail or Git operation unavailability is not a development blocker when the technical work can still be completed or prepared. Report unavailable actions accurately.

## 25. End-of-cycle reporting

Always finish the active `TASK_LOG.md` section with factual results.

When sending is available, email `ggmmgg9@gmail.com`.

Subject:

```text
[Project Update] Cycle {cycle_number}: {short_task_title}
```

Use an ISO 8601 `Europe/Istanbul` timestamp.

Include:

- Cycle number and status.
- Goal and selection reason.
- Viral-loop impact.
- Completed work and intentional non-goals.
- Files changed.
- Exact tests/checks and results.
- Build result.
- Relevant CI status.
- Preview or artifact status.
- Commit title, SHA, branch, and PR when available.
- Decision or “No new decision.”
- Strategic/product-thinking summary.
- Parked idea or “None.”
- Remaining limitation.
- Next suggested task.

Do not claim the email was sent unless sending succeeded. If unavailable or failed, mark it “Not sent” and provide the complete ready-to-send body.

Give the user a concise Arabic report containing:

- رقم الدورة والحالة
- الهدف وسبب الاختيار
- ما تم إنجازه
- كيف يخدم حلقة الانتشار
- التفكير الاستراتيجي والمنتجّي والإبداعي
- ما لم يُنفذ عمدًا
- الملفات المعدلة
- الاختبارات والتحققات ونتائجها
- Build
- GitHub Actions للـcommit الحالي
- المعاينة أو الـartifact
- Commit وSHA أو «لم يتم الإنشاء»
- Branch وPR أو «لم يتم الإنشاء»
- حالة البريد
- القيود المتبقية
- المهمة التالية

Use “غير متاح” or “لم يتم التحقق” with a reason whenever evidence is unavailable.