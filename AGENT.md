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

Build a mobile-first web product where a user can:

Discover a challenge  
→ Play it quickly  
→ Get a clear result  
→ Share one challenge/result link  
→ A friend opens it and competes  
→ Both results are compared  
→ The comparison encourages another share.

Use these terms until private challenge creation exists:

- Original player
- Sharer
- Friend or challenger

Do not call the original player a creator unless that person created the challenge.

## 3. Product constitution

1. Mobile first.
2. No login for the initial product loop.
3. One obvious primary action per state.
4. Every task must advance or protect the social competition loop.
5. Keep the experience fast, visual, low-text, and understandable within seconds.
6. Do not rebuild working functionality without evidence of a defect or blocker.
7. Do not add payments, public feeds, profiles, followers, likes, chat, or real-time multiplayer before validation.
8. Do not add unsafe, humiliating, illegal, discriminatory, self-harm, sexual-minor, or privacy-invasive challenges.
9. Prefer the highest product impact per unit of work.
10. Gameplay variety must be real, not cosmetic.

## 4. Repository and cycle continuity

At the start of every cycle:

1. Read this file first.
2. Review the source-of-truth documents when available.
3. Inspect `main`, latest commits, open pull requests, scripts, tests, build, and preview state.
4. Continue any planned, in-progress, blocked, or open-PR task before starting another.
5. Create every new cycle branch from the current `main` head.
6. Target `main` directly. Stacked, promotion, and consolidation pull requests are forbidden.
7. Complete exactly one narrow task per cycle.
8. Do not force-push, rewrite history, use destructive Git commands, or include unrelated changes.

The absence of external automation is not a blocker. Use repository scripts and available preview evidence.

## 5. Architecture preference

Prefer:

- Static mobile-first HTML, CSS, and vanilla JavaScript.
- Node.js 20 or newer.
- Node.js built-in test runner.
- A simple static build output.
- GitHub Pages-compatible `docs/` preview files.

Do not introduce a framework, database, bundler, package, or external service unless it is necessary, documented in `DECISIONS.md`, and is the only task of that cycle.

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

## 7. Task selection

Use actual code and `TASK_LOG.md` as the source of truth.

1. Continue unfinished or blocked work first.
2. Otherwise select the earliest incomplete `ROADMAP.md` stage.
3. If documented completion conflicts with code or tests, fix the inconsistency as the cycle task.
4. Do not select broad tasks such as “improve the UI” or “make games better.”
5. Choose the smallest task with measurable acceptance criteria and focused tests.

Before product edits, update one cycle section in `TASK_LOG.md` with the cycle number, time, status, task, goal, reason, loop impact, acceptance criteria, expected files, non-goals, strategic review, product-thinking answers, and parked idea.

## 8. One-cycle engine

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

## 9. Genuine challenge diversity

Curated variety is not complete merely because six challenge names exist.

A challenge counts as meaningfully different only when its primary player decisions, timing, input pattern, failure conditions, or scoring model differ materially from the others.

Changing only the title, text, visual theme, target icon, duration, speed, difficulty label, tap requirement, or score threshold does **not** create a new mechanic.

The curated set must include:

- At least 6 playable challenges.
- At least 4 genuinely different gameplay mechanics before variety may be called complete.
- A target of 5–6 mechanics when practical.
- At least 3 themes or categories.
- At least 2 difficulty levels.
- Shared discovery, result, sharing, friend-attempt, comparison, and navigation flows.
- Reusable mechanic adapters and data-driven challenge definitions where compatible.

Preferred mechanic families include:

- **Reaction:** respond when a target appears, similar in spirit to classic target-hitting games.
- **Memory:** repeat a visual or sound sequence, similar in spirit to classic pattern-memory games.
- **Timing:** stop, stack, or act inside a moving success zone.
- **Dodge:** move or choose lanes to avoid animated obstacles.
- **Rhythm:** follow a timed beat or repeating input pattern.
- **Quick puzzle:** sort, match, rotate, or choose the correct item under time pressure.
- **Precision:** guide, aim, balance, or hold within a bounded target.

Classic and popular games may inspire a mechanic, but implementation must remain original:

- Do not copy protected names, characters, artwork, sounds, music, levels, layouts, wording, logos, or distinctive trade dress.
- Use original challenge names, graphics, sounds, rules, and presentation.
- Describe inspiration only by generic mechanic, never by claiming affiliation or direct reproduction.

Add a new mechanic in its own focused cycle. It must reuse the existing product loop and must not duplicate result, sharing, comparison, or navigation systems.

If the current curated set is mechanically repetitive, reopening the variety stage is required even if `ROADMAP.md` previously marked it complete.

## 10. Motion and animation

Gameplay should feel alive through purposeful motion.

Every playable mechanic should include at least two purposeful motion or feedback behaviors where appropriate, such as:

- Countdown pulse or entrance.
- Animated target appearance, movement, or disappearance.
- Immediate correct, incorrect, hit, miss, combo, or danger feedback.
- Progress, timing-zone, obstacle, sequence, or score motion.
- Clear transition between discovery, gameplay, result, and comparison.

Animation rules:

1. Motion must communicate state, timing, cause, feedback, or progression; decorative motion alone is insufficient.
2. Animation must not delay the primary action or make scoring ambiguous.
3. Avoid excessive flashing, rapid full-screen movement, motion sickness triggers, and distracting infinite loops.
4. Respect `prefers-reduced-motion`; provide a clear low-motion or instant-state equivalent.
5. Do not make success depend solely on color, sound, or animation.
6. Preserve keyboard input, visible focus, touch targets, semantic announcements, and readable contrast.
7. Prefer CSS transforms and opacity for lightweight motion when suitable.
8. Cancel timers and animations safely when replaying, navigating away, or completing an attempt.
9. Tests must verify state transitions and reduced-motion-safe behavior where practical; do not test only CSS class existence.
10. Check animation behavior at 320px and one width from 360–430px.

A challenge with static controls and only a generic button press does not satisfy the animated-gameplay requirement unless static presentation is essential to that mechanic and the exception is documented.

## 11. Private challenge creation

Private creation must remain:

- No-login.
- Private by link.
- Based on an existing supported mechanic.
- Limited to short validated text and bounded options.
- Safe against malformed or executable content.
- Free of public discovery, profiles, moderation dashboards, and creator analytics.

Private creation must not create arbitrary executable rules or a new engine.

## 12. Mobile UX

1. Design from 320px upward; prioritize 360–430px.
2. No horizontal scrolling.
3. Keep the main action and critical game state visible.
4. Use one obvious primary action per state.
5. Avoid unnecessary onboarding, modals, explanatory cards, and long marketing text.
6. Keep titles, helper text, and labels short.
7. Interactive targets should be at least 44×44 CSS pixels.
8. Preserve keyboard access, visible focus, semantic structure, adequate contrast, language consistency, and RTL when Arabic is used.
9. Do not fabricate rankings, records, popularity, or social proof.

## 13. Implementation, security, and quality

- Make the minimum change.
- Preserve the existing framework and conventions.
- Avoid broad refactoring, formatting, redesign, migration, or upgrades.
- Add focused behavior tests for behavior changes.
- Keep the product no-login unless a separate approved stage changes that.
- Validate URL, hash, clipboard, storage, and shared state.
- Use safe DOM APIs for untrusted values.
- Never commit secrets, personal data, or `.env` files.
- Run the current test and build commands.
- Run configured lint/type-check commands when relevant.
- Manually exercise changed paths when browser tools are available.
- Inspect the final diff for scope, secrets, accessibility, motion safety, and privacy.
- Never use an older result as evidence for a new change.

For user-facing work report exactly one preview status:

1. Preview verified live for the relevant deployed commit.
2. Repository preview output verified for the relevant commit.
3. Preview not verified, with the exact reason.

## 14. Definition of done

A task is complete only when:

1. Acceptance criteria are satisfied in code.
2. Focused tests pass when required.
3. Build and configured checks pass.
4. User-facing behavior is preview-verified or accurately marked unverified.
5. Mobile, accessibility, reduced-motion, security, and privacy checks pass where relevant.
6. Source and `docs/` preview files are synchronized.
7. The complete PR diff has been reviewed.
8. No blocking finding, unresolved required review comment, or merge conflict remains.
9. The PR targets `main` and is squash-merged safely.
10. `TASK_LOG.md` records factual evidence.

For challenge-variety work, definition of done additionally requires evidence of a genuinely different mechanic and purposeful animation. Cosmetic variants cannot satisfy acceptance criteria.

## 15. Review and automatic merge

Review the entire pull-request diff, existing comments, threads, mergeability, and conflicts.

Blocking findings include correctness, security, privacy, accessibility, motion-safety, broken tests/build, acceptance failure, cosmetic-only variety, duplicated systems, unrelated scope, and merge conflicts.

Fix narrow blockers in the same cycle, rerun checks, and re-review. Do not merge while a blocking finding remains.

For a clean review:

1. Add a factual self-review comment without claiming independent approval.
2. Resolve addressed threads.
3. Squash-merge using the expected head SHA when supported.
4. Verify the PR reports merged and record the merge SHA.
5. If safe merging is unavailable, mark the cycle blocked and stop.

## 16. Git rules

- Create every cycle branch from current `main`.
- Target `main` directly.
- Use Conventional Commits.
- Prefer one focused commit when tooling permits.
- Keep source, tests, documentation, and preview files synchronized.
- Never fabricate Git, review, PR, or merge actions.
- Never force-push or rewrite history.
- Do not create stacked, promotion, or consolidation PRs.

## 17. Stop conditions

Stop rather than broaden scope when the repository cannot be read or written, unrelated changes conflict, product direction must change without a decision, tests/build cannot be fixed narrowly, a safe implementation needs an unapproved service, shared state cannot be handled safely, review finds an unresolved blocker, or the PR cannot be merged safely.

## 18. Reporting

Always finish the active `TASK_LOG.md` section with factual results.

When sending is available, email `ggmmgg9@gmail.com` with cycle status, goal, reason, loop impact, completed work, non-goals, files, exact checks, build, preview, review and merge outcomes, branch, PR, SHAs, decision, product thinking, parked idea, limitation, and next task.

Do not claim an email, review, approval, PR, check, or merge succeeded unless it actually did.

Finish the chat report in concise Arabic labeled lines and stop after one cycle.
