# Agent Operating System

This file defines the durable operating policy for autonomous development of **Social Challenge Arena**.

Store changing progress in `ROADMAP.md` and `TASK_LOG.md`, decisions in `DECISIONS.md`, deferred ideas in `BACKLOG.md`, and hypotheses in `EXPERIMENTS.md`.

## 1. Precedence

When instructions conflict, use this order:

1. Explicit user instruction for the current task.
2. `AGENT.md`.
3. `DECISIONS.md`.
4. `ROADMAP.md`.
5. `TASK_LOG.md`.
6. Existing repository conventions.

Verify repository state from files, code, tests, build output, Git history, pull requests, reviews, and preview evidence. Never invent evidence.

## 2. Product north star

Build a mobile-first social arcade product where a user can:

Discover an original game  
→ Start playing within seconds  
→ Experience satisfying movement, tension, and feedback  
→ Get a clear score or outcome  
→ Share one game/result link  
→ A friend opens it and competes  
→ Both results are compared  
→ The comparison encourages another share.

The product is no longer a board of simple micro-challenges. It is a collection of original, polished, short-form arcade games connected by one social competition loop.

## 3. Product constitution

1. Mobile first.
2. No login for the initial product loop.
3. One obvious primary action per state.
4. Every product task must advance or protect the social competition loop.
5. Gameplay must feel visual, responsive, lively, and understandable within seconds.
6. Do not add payments, public feeds, profiles, followers, likes, chat, or real-time multiplayer before product validation.
7. Do not add unsafe, humiliating, illegal, discriminatory, self-harm, sexual-minor, or privacy-invasive content.
8. Prefer the highest player value per unit of work.
9. Gameplay variety must be real, not cosmetic.
10. Polish, feel, motion quality, and replay appeal are product requirements, not optional decoration.
11. Do not preserve weak legacy gameplay merely because it already works.
12. Do not rebuild stable shared systems unless a verified blocker requires it.

## 4. Legacy catalog policy

All challenges that existed before the arcade-quality reset are legacy.

Legacy rules:

- Do not polish, reskin, rebalance, translate, promote, expand, or add variants to legacy challenges.
- Do not use legacy challenge counts as evidence of current product quality.
- Do not base new private-creation features on legacy mechanics.
- Keep only the minimum temporary fallback required to avoid an empty product until the first replacement game is complete.
- After the first flagship replacement passes all quality gates, hide every legacy challenge from ordinary discovery.
- Preserve strict compatibility for valid existing legacy shared links only while `ROADMAP.md` explicitly requires it.
- Remove legacy compatibility only in a separate explicit cycle after reviewing link impact.
- Never select a task whose main purpose is maintaining legacy content unless it fixes a security, privacy, data-loss, or compatibility blocker.

The rule “do not rebuild working functionality” does not protect legacy challenges from replacement. It protects stable shared systems such as result, sharing, comparison, metrics, and navigation.

## 5. Repository and cycle continuity

At the start of every cycle:

1. Read this file first.
2. Review the source-of-truth documents when available.
3. Inspect current `main`, latest commits, open pull requests, scripts, tests, build, and preview state.
4. Continue any planned, in-progress, blocked, or open-PR task before starting another.
5. Create every new cycle branch from the current `main` head.
6. Target `main` directly.
7. Stacked, promotion, and consolidation pull requests are forbidden.
8. Complete exactly one narrow task per cycle.
9. Do not force-push, rewrite history, use destructive Git commands, or include unrelated changes.

The absence of optional external tools is not a blocker. Use repository scripts and available preview evidence.

## 6. Architecture preference

Prefer:

- Static mobile-first HTML, CSS, and vanilla JavaScript.
- Node.js 20 or newer.
- Node.js built-in test runner.
- A simple static build output.
- GitHub Pages-compatible `docs/` preview files.
- `requestAnimationFrame` for active real-time gameplay when appropriate.
- CSS transforms and opacity for lightweight visual motion.
- Deterministic, testable gameplay state separate from rendering where practical.

Do not introduce a framework, database, bundler, game engine, package, or external service unless the current architecture cannot reasonably satisfy the selected task, the decision is recorded in `DECISIONS.md`, and the architecture change is the only task of that cycle.

Do not create a general-purpose game engine. Build only the minimum reusable foundation required by the next one or two planned games.

## 7. Source-of-truth files

- `AGENT.md`: permanent operating policy.
- `ROADMAP.md`: stage order and completion status.
- `TASK_LOG.md`: cycle history and current status.
- `DECISIONS.md`: meaningful product and technical decisions.
- `BACKLOG.md`: deferred non-experimental ideas.
- `EXPERIMENTS.md`: testable hypotheses.
- `METRICS.md`: loop metrics and success criteria.
- `CHANGELOG.md`: user-visible, build, and deployment changes.

Do not duplicate mutable status across several files.

## 8. Task selection

Use actual code and `TASK_LOG.md` as the source of truth.

1. Continue unfinished or blocked work first.
2. Otherwise select the earliest incomplete arcade-reset stage in `ROADMAP.md`.
3. If documented completion conflicts with code or tests, fix the inconsistency as the cycle task.
4. Do not select broad tasks such as “improve the game,” “redesign everything,” or “add polish.”
5. Choose the smallest task with measurable acceptance criteria and focused tests.
6. Add at most one new gameplay mechanic in a cycle.
7. Do not add a second replacement game before the flagship game is fully complete, share-compatible, and merged.
8. Do not work on localization before the flagship game unless localization is a direct blocker.
9. Do not expand private creation before at least one replacement arcade mechanic is supported safely.

Before product edits, update one cycle section in `TASK_LOG.md` with:

- Cycle number and time.
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

For gameplay tasks, acceptance criteria must explicitly define:

- Player decision.
- Input model.
- Movement or physics model.
- Failure condition.
- Scoring model.
- Difficulty escalation.
- Purposeful feedback effects.
- Reduced-motion behavior.
- Teardown behavior.
- Social-loop reuse.

## 9. One-cycle engine

```text
Review repository state
→ Select one task
→ Record the cycle plan
→ Implement the minimum change
→ Test
→ Build
→ Verify preview when relevant
→ Review the complete diff
→ Resolve blocking findings
→ Open or update one PR to main
→ Squash-merge when safe
→ Record factual results
→ Send the report
→ Stop
```

Do not start a second product task after success.

## 10. Arcade quality bar

A replacement game does not count unless it includes all applicable requirements below.

### Player experience

- A visible player-controlled object or meaningful interaction with the game world.
- A dedicated game viewport rather than a generic form or button panel.
- Immediate control response.
- Clear active-play, danger, failure, success, score, replay, and share states.
- Escalating tension through speed, spacing, movement, timing, density, uncertainty, or decision pressure.
- A score or result that reflects player skill rather than passive waiting.
- A satisfying transition into the result state.

### Motion and game feel

- Meaningful movement, physics, momentum, aiming, collision, balance, rhythm, or spatial timing.
- At least three purposeful feedback effects where appropriate, such as:
  - score pop;
  - impact response;
  - particles;
  - restrained screen shake;
  - squash-and-stretch;
  - danger pulse;
  - hit or miss feedback;
  - combo feedback;
  - trail or motion response;
  - polished result transition.
- Motion must communicate state, force, timing, collision, danger, success, failure, or progression.
- Decorative animation alone does not satisfy this requirement.
- Animation must not delay input or make scoring ambiguous.
- Avoid excessive flashing, rapid full-screen motion, motion-sickness triggers, and distracting infinite loops.

### Originality

Games may be inspired by generic arcade mechanic families, but implementation must remain original.

Do not copy:

- Protected names.
- Characters.
- Artwork.
- Music or sound effects.
- Levels.
- Layouts.
- Wording.
- Logos.
- Distinctive trade dress.

Use original names, visuals, rules, feedback, pacing, and presentation. Never claim affiliation with or direct reproduction of a known game.

### Social-loop reuse

Every replacement game must reuse the shared:

- Discovery shell.
- Result flow.
- Strict shared-link codec.
- Friend invitation.
- Friend attempt.
- Comparison.
- Share-again flow.
- Privacy-safe metrics.
- Navigation.

Do not create separate result, sharing, comparison, or analytics systems per game.

## 11. Shared gameplay lifecycle

Each real-time game must have one explicit lifecycle:

```text
idle → ready → running → finished
```

Additional states such as paused or failed may exist only when required.

Lifecycle rules:

1. One authoritative state controls gameplay.
2. One active update loop may exist at a time.
3. Use bounded delta time or fixed-step logic where frame variation could change gameplay materially.
4. Ignore input outside valid states.
5. Stop scoring immediately on finish or failure.
6. Cancel all `requestAnimationFrame` handles on replay, reset, navigation, failure, and completion.
7. Cancel all timers and intervals on teardown.
8. Remove temporary listeners on teardown.
9. Reset mutable gameplay state before replay.
10. Do not allow duplicate loops after rapid replay or navigation.
11. Keep simulation logic deterministic or seedable where practical for focused tests.
12. Keep shared-link scores strictly bounded and validated against the selected game.

## 12. Performance and rendering

For real-time gameplay:

- Prefer transform-based rendering over layout-changing properties.
- Avoid repeated forced layout reads and writes in the same frame.
- Avoid creating unbounded DOM nodes during play.
- Reuse or remove particles and transient effects safely.
- Avoid memory growth across replay.
- Do not start background gameplay when the game view is hidden.
- Pause or stop the active loop when the document is no longer active if continuing would waste resources or affect fairness.
- Keep the viewport stable with no accidental scroll, zoom conflict, or horizontal overflow.
- Use device-independent game coordinates where practical so scoring remains consistent across supported widths.

A gameplay task is blocked if review finds duplicate animation loops, uncancelled timers, unbounded effects, replay memory growth, or frame-dependent scoring that changes outcomes unfairly.

## 13. Reduced motion and accessibility

Every game must respect `prefers-reduced-motion`.

Reduced-motion behavior must:

- Preserve the same decisions and scoring opportunities.
- Replace non-essential continuous movement with discrete, slower, shorter, or still-state equivalents where practical.
- Disable decorative shake, trails, parallax, and unnecessary particles.
- Keep collision, danger, success, and failure understandable through text, shape, position, or state change.

Accessibility rules:

- Touch and keyboard input must provide equivalent control where practical.
- Focus must remain visible.
- Interactive targets must be at least 44×44 CSS pixels.
- Do not make success depend only on color, sound, or animation.
- Provide semantic announcements for important state and result changes.
- Preserve readable contrast.
- Prevent keyboard shortcuts from firing while focus is inside unrelated editable controls.
- Do not trap focus inside the game viewport.

## 14. Multilingual product policy

Localization is a shared product capability, not per-page duplication.

Required order:

1. English.
2. Arabic with full RTL support.
3. Turkish only after English and Arabic are complete and tested.

Localization rules:

- Use one central translation dictionary or module.
- Do not duplicate pages by language.
- Avoid user-facing hardcoded strings in HTML or gameplay JavaScript after localization begins.
- Translate discovery, game instructions, score labels, result feedback, sharing, friend invitation, comparison, errors, and accessibility announcements.
- Keep shared links independent of language.
- Store only the selected language locally; do not add identity or account requirements.
- Validate stored language values against an allowlist.
- Update `lang` and `dir` on the document root.
- Test RTL layout, number presentation, long labels, wrapping, and mixed-direction content.
- Do not translate legacy challenges.
- Do not expose untranslated fallback keys to users.

## 15. Private challenge creation freeze

Private creation is frozen until at least one replacement arcade game is complete and safely reusable.

Until then:

- Do not add new creation options.
- Do not add legacy mechanics to creation.
- Do not add arbitrary rules, scripts, physics values, or executable content.
- Do not add public discovery, profiles, moderation dashboards, creator analytics, or backend storage.

When creation resumes, it must remain no-login, private by link, bounded, validated, and based only on approved replacement mechanics.

## 16. Mobile UX

1. Design from 320px upward; prioritize 360–430px.
2. No horizontal scrolling.
3. Keep the player, immediate danger, score, and primary action visible.
4. Avoid unnecessary onboarding, modals, explanatory cards, and long marketing text.
5. Keep titles, helper text, and labels short.
6. Prevent page scrolling or gesture conflicts only while gameplay requires it.
7. Restore normal document behavior after gameplay ends.
8. Preserve safe-area spacing where relevant.
9. Do not fabricate rankings, records, popularity, or social proof.

## 17. Implementation, security, and quality

- Make the minimum change.
- Preserve the existing framework and conventions.
- Avoid broad refactoring, formatting, redesign, migration, or upgrades.
- Add focused behavior tests for behavior changes.
- Keep the product no-login unless a separate approved stage changes that.
- Validate URL, hash, clipboard, storage, and shared state.
- Use safe DOM APIs for untrusted values.
- Never commit secrets, personal data, or `.env` files.
- Run the current test and build commands.
- Run configured lint or type-check commands when relevant.
- Manually exercise changed paths when browser tools are available.
- Inspect the final diff for scope, secrets, accessibility, motion safety, performance, privacy, originality, and cleanup.
- Never use an older result as evidence for a new change.

For user-facing work report exactly one preview status:

1. Preview verified live for the relevant deployed commit.
2. Repository preview output verified for the relevant commit.
3. Preview not verified, with the exact reason.

## 18. Gameplay quality gate

For a user-facing gameplay change, verify when applicable:

- Start, active play, failure, finish, replay, and navigation.
- Touch or pointer-equivalent logic.
- Keyboard behavior.
- Collision and boundary behavior.
- Score bounds and result correctness.
- Difficulty escalation.
- Rapid replay without duplicate loops.
- Navigation away during active play.
- Timer, interval, listener, and animation-frame teardown.
- Reduced-motion behavior.
- 320px width.
- One width from 360–430px.
- No horizontal overflow.
- Shared-link validation.
- Friend attempt and comparison reuse.
- Source and `docs/` synchronization.

When browser tools are unavailable, report the missing checks accurately. Do not invent visual or performance evidence.

## 19. Definition of done

A task is complete only when:

1. Acceptance criteria are satisfied in code.
2. Focused tests pass when required.
3. Build and configured checks pass.
4. User-facing behavior is preview-verified or accurately marked unverified.
5. Mobile, accessibility, reduced-motion, security, privacy, performance, and teardown checks pass where relevant.
6. Source and `docs/` preview files are synchronized.
7. The complete PR diff has been reviewed.
8. No blocking finding, unresolved required review comment, or merge conflict remains.
9. The PR targets `main` and is squash-merged safely.
10. `TASK_LOG.md` records factual evidence.

For a replacement game, definition of done additionally requires:

- A genuinely interactive arcade mechanic.
- A visible animated game world.
- Meaningful movement or physics.
- Escalating pressure.
- Clear failure and score handling.
- At least three purposeful feedback effects where appropriate.
- Reduced-motion support.
- Safe lifecycle teardown.
- Reuse of the shared social loop.

A static control panel, renamed legacy mechanic, decorative-only animation, or shallow reskin cannot satisfy completion.

## 20. Review and automatic merge

Review the entire pull-request diff, existing comments, threads, mergeability, and conflicts.

Blocking findings include:

- Correctness failure.
- Security or privacy risk.
- Accessibility failure.
- Unsafe motion.
- Broken tests or build.
- Acceptance failure.
- Static or shallow gameplay presented as an arcade replacement.
- Decorative-only animation.
- Copied protected identity or trade dress.
- Missing teardown.
- Duplicate animation loops.
- Unbounded timers, nodes, particles, or listeners.
- Frame-dependent unfair scoring.
- Broken shared-link validation.
- Duplicated social-loop systems.
- Untranslated user-facing text after localization begins.
- RTL failure.
- Unrelated scope.
- Merge conflict.

Fix narrow blockers in the same cycle, rerun checks, and re-review. Do not merge while a blocking finding remains.

For a clean review:

1. Add a factual self-review comment without claiming independent approval.
2. Resolve addressed threads.
3. Squash-merge using the expected head SHA when supported.
4. Verify the PR reports merged and record the merge SHA.
5. If safe merging is unavailable, mark the cycle blocked and stop.

## 21. Git rules

- Create every cycle branch from current `main`.
- Target `main` directly.
- Use Conventional Commits.
- Prefer one focused commit when tooling permits.
- Keep source, tests, documentation, and preview files synchronized.
- Never fabricate Git, review, PR, or merge actions.
- Never force-push or rewrite history.
- Do not create stacked, promotion, or consolidation PRs.

## 22. Stop conditions

Stop rather than broaden scope when:

- The repository cannot be read or written.
- Unrelated changes conflict.
- Product direction must change without a recorded decision.
- Tests or build cannot be fixed narrowly.
- A safe implementation needs an unapproved service or dependency.
- Shared state cannot be handled safely.
- Review finds an unresolved blocker.
- The PR cannot be merged safely.
- A proposed game cannot meet the arcade quality bar within one focused cycle without first creating a smaller foundation task.

## 23. Reporting

Always finish the active `TASK_LOG.md` section with factual results.

For gameplay work, report:

- Player decision.
- Movement or physics model.
- Failure condition.
- Scoring model.
- Escalation.
- Feedback effects.
- Reduced-motion behavior.
- Teardown evidence.
- Mobile checks.
- Social-loop reuse.

When sending is available, email `ggmmgg9@gmail.com` with cycle status, goal, reason, loop impact, completed work, non-goals, files, exact checks, build, preview, review and merge outcomes, branch, PR, SHAs, decision, product thinking, parked idea, limitation, and next task.

Do not claim an email, review, approval, PR, check, preview, or merge succeeded unless it actually did.

Finish the chat report in concise Arabic and stop after one cycle.
