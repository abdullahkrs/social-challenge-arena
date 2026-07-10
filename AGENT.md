# Agent Operating Guide

This file defines how the development agent must keep Social Challenge Arena moving forward without distraction.

## North Star

Build a mobile-first web MVP where a user can:

1. Discover the challenge.
2. Play or create a challenge quickly.
3. Get a clear score/result.
4. Share one link or result.
5. A friend opens the link and competes.
6. Both sides compare results.
7. The result encourages another share.

Core loop:

Discover → Play/Create Challenge → Get Score/Result → Share → Friend Competes → Compare → Share Again

## Product Thinking Rule

Every cycle must include product thinking, not only coding.

Before selecting the task, answer these questions in the cycle notes:

1. What currently blocks the next step in the core loop?
2. What would make a user more likely to continue or share?
3. What would make a friend more likely to click and compete?
4. What is the smallest implementation that proves this?
5. What creative idea appeared, and should it be implemented now or parked?

Creativity is required, but it must be controlled.

Creative ideas should be handled in one of three ways:

- Implement now only if it is the smallest way to complete the next MVP step.
- Add to EXPERIMENTS.md if it needs validation later.
- Add to BACKLOG.md if it is useful but outside the current MVP step.

Do not let creativity become a reason to change direction every cycle.

## Current MVP Completion Order

Do not skip ahead. Complete the loop in this order:

1. Mobile-first landing page. ✅
2. First playable challenge. ✅
3. Score/result screen.
4. Share/copy challenge link.
5. Friend attempt from shared link.
6. Creator/friend comparison.
7. Share-again prompt.
8. Basic MVP event metrics.

## Cycle Rule

Each development cycle must have exactly one narrow task.

Good tasks:

- Add a focused result screen.
- Add a copy challenge link button.
- Preserve score in URL/local state for friend attempts.
- Add a comparison message between two scores.
- Add a smoke test for the share flow.

Bad tasks:

- Improve the whole UI.
- Add multiple challenge types.
- Add accounts and dashboard.
- Rebuild the app with a new framework.
- Add payment before the loop works.
- Refactor working code without a blocking reason.

## Before Implementing

At the start of every cycle, review:

- AGENT.md
- README.md
- ROADMAP.md
- TASK_LOG.md
- DECISIONS.md
- BACKLOG.md
- EXPERIMENTS.md
- METRICS.md
- CHANGELOG.md
- package.json
- .github/workflows/ci.yml

Then record in TASK_LOG.md:

- Cycle number.
- Goal.
- Why this task now.
- How it serves the core loop.
- Expected files to change.
- What will intentionally not change.
- Product thinking answers from the Product Thinking Rule.
- Any creative ideas parked in BACKLOG.md or EXPERIMENTS.md.

## Continuity Rule

The agent must continue from the previous cycle, not restart from scratch.

At the start of every cycle:

1. Read the latest TASK_LOG.md entry.
2. Read the current MVP completion order.
3. Identify the earliest incomplete loop step.
4. Check whether CI/build/preview is broken.
5. Choose between:
   - Fix a blocker if tests, build, CI, or preview is broken.
   - Otherwise implement the earliest incomplete MVP step.

Do not re-discuss already settled decisions unless they are blocking the product.

## Scope Protection

Do not add any of these before the MVP loop works end-to-end:

- Login or accounts.
- Payment or subscriptions.
- Creator dashboard.
- Admin dashboard.
- Multiple challenge templates.
- AI challenge generation.
- Complex analytics dashboard.
- Native app.
- Real-time multiplayer.
- Social feed.

If a useful idea appears, write it in BACKLOG.md or EXPERIMENTS.md.

## Quality Gate

Every cycle that changes code must keep both commands working:

```bash
npm test
npm run build
```

If a shell/runtime is available, run them before reporting completion.

If a shell/runtime is unavailable, check GitHub Actions for the commit and report the real status. Do not claim success unless tests/build actually passed.

## Preview Gate

The live preview is:

```text
https://abdullahkrs.github.io/social-challenge-arena/
```

Every cycle that changes user-facing behavior must report one of:

- Preview verified live.
- GitHub Actions artifact available.
- Preview not verified and why.

## Security Rules

Never commit:

- API keys.
- Tokens.
- Passwords.
- Private email data.
- Personal user data beyond what is already public in the repository.
- `.env` files.

Before reporting completion, check changed files for secrets and unrelated content.

## Git Rules

Use Conventional Commits only:

- `feat: ...`
- `fix: ...`
- `test: ...`
- `docs: ...`
- `ci: ...`
- `build: ...`
- `chore: ...`

Avoid vague messages such as:

- update
- changes
- misc
- final
- fix stuff

Prefer one commit per cycle when tooling allows it. If the available tool forces multiple commits, document that limitation in TASK_LOG.md and the email report.

## Reporting

Every cycle must end with:

1. TASK_LOG.md update.
2. CHANGELOG.md update when behavior/build/deployment changes.
3. Email report to ggmmgg9@gmail.com, or EMAIL_REPORTS.md if Gmail is unavailable.
4. Arabic chat report with:
   - رقم الدورة
   - هدف الدورة
   - ما الذي تم إنجازه
   - كيف يخدم حلقة الانتشار
   - ما الذي لم يتم تنفيذه عمدًا
   - الملفات المعدلة
   - الاختبارات/التحقق
   - Build
   - GitHub Actions
   - رابط المعاينة
   - Commit
   - البريد الإلكتروني
   - المهمة التالية المقترحة

## Stop Conditions

Stop and report instead of continuing if:

- Tests fail and cannot be fixed within the selected task.
- Build fails and cannot be fixed within the selected task.
- GitHub or Gmail permissions are unavailable.
- The next task would require changing product direction.
- The requested change is outside MVP and not explicitly approved.

## Next Recommended Task

Add a focused result screen that turns the current inline score into a share-ready result state, without implementing full sharing yet.
