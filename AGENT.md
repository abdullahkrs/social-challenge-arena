# Agent Operating System

This file defines the durable operating policy for autonomous development of **Social Challenge Arena**.

## 1. Precedence and mandatory reading

Instruction precedence:

1. Explicit user instruction for the current task.
2. `AGENT.md`.
3. The assigned GitHub issue.
4. `agents/README.md`.
5. The active role file under `agents/`.
6. `DECISIONS.md`.
7. `ROADMAP.md` and `TASK_LOG.md`.
8. Repository conventions.

Every agent must read in this order:

1. `AGENT.md`.
2. `agents/README.md`.
3. Its role file.
4. Its assigned issue.
5. Relevant source-of-truth documents and code.

Never invent repository, test, build, review, preview, trend, or user evidence.

## 2. Product north star

Build a mobile-first social arcade product where a user can:

Discover an original game → play within seconds → experience satisfying movement and tension → get a clear result → share one link → a friend competes → results are compared → the comparison encourages another share.

The product is a collection of original, polished, short-form arcade games connected by one shared social loop. It is not a board of static micro-challenges.

## 3. Product constitution

- Mobile first and no-login for the initial loop.
- One obvious primary action per state.
- Gameplay must feel responsive, lively, visual, and understandable within seconds.
- Polish, game feel, replay appeal, accessibility, and motion quality are requirements.
- Reuse stable result, sharing, friend-attempt, comparison, share-again, metrics, and navigation systems.
- Do not add payments, public feeds, profiles, followers, likes, chat, or real-time multiplayer before validation.
- Do not add unsafe, humiliating, illegal, discriminatory, self-harm, sexual-minor, or privacy-invasive content.
- Do not fabricate rankings, popularity, records, social proof, trends, or validation.

## 4. Legacy catalog

All challenges that existed before the arcade reset are legacy.

- Do not polish, reskin, rebalance, translate, promote, expand, or add variants to legacy challenges.
- Keep only the minimum temporary fallback until the first flagship replacement is complete.
- After the flagship passes all quality gates, hide legacy challenges from ordinary discovery.
- Preserve strict old-link compatibility only while `ROADMAP.md` explicitly requires it.
- Do not base new private creation on legacy mechanics.
- Stable shared systems remain protected from unnecessary rebuilding; legacy gameplay does not.

## 5. Multi-agent operating model

The repository uses specialized roles defined in `agents/README.md`:

- Coordinator.
- Creative Director.
- Social Trends Scout.
- Game Engine.
- Game Experience.
- Localization.
- QA Review.

Mandatory rules:

1. No specialized agent may assign work to itself.
2. Product, research, or documentation work requires one open issue marked `ready-for-agent`.
3. The issue must identify exactly one owner role, dependencies, allowed files, forbidden files, acceptance criteria, non-goals, required evidence, and QA focus.
4. If no valid assignment exists, stop without creating a branch, commit, or PR.
5. The Coordinator is the only role allowed to create ordinary implementation assignments.
6. Creative and Trends agents propose; they do not change product direction, `ROADMAP.md`, or product code directly.
7. Implementation agents open PRs but do not independently approve or merge their own work.
8. QA must be performed by a role that did not implement the change.
9. Implementation requires `QA: PASS` before merge unless the repository owner explicitly overrides the gate.
10. Two active issues must not own overlapping files.
11. Every branch starts from current `main`; every PR targets `main` directly.
12. Stacked, promotion, and consolidation PRs are forbidden.
13. One issue equals one narrow task, one branch, and one PR.
14. Continue an existing assigned PR or blocker before accepting another issue.

## 6. Role workflow

```text
Social Trends Scout → qualified public signal
Creative Director → original concept or experiment
Coordinator → issue contract and dependency order
Implementation role → focused PR marked ready-for-qa
QA Review → QA: PASS or QA: BLOCKED
Coordinator → final review, squash merge, next assignment
```

The Coordinator may merge only when:

- the PR base is `main`;
- required checks and evidence are current;
- QA has posted `QA: PASS`;
- no blocking comments, unresolved required threads, conflicts, or scope drift remain;
- the expected head SHA still matches.

## 7. Repository continuity and Git

At the start of every run:

- inspect current `main`, latest commits, open issues, open PRs, assignments, dependencies, and conflicts;
- continue unfinished work before starting anything new;
- never force-push, rewrite history, use destructive reset, or include unrelated changes;
- use Conventional Commits;
- keep source, tests, documentation, and `docs/` preview synchronized;
- never claim a branch, PR, QA result, merge, email, test, build, or preview succeeded unless verified.

## 8. Task selection

- Continue an assigned in-progress or blocked issue first.
- Otherwise the Coordinator selects the earliest incomplete arcade-reset stage in `ROADMAP.md` or an owner-approved experiment.
- Choose the smallest measurable task.
- Add at most one gameplay mechanic per issue.
- Do not add a second replacement game before the flagship is complete, share-compatible, QA-passed, and merged.
- Do not start localization before the flagship interface is stable unless localization blocks it.
- Do not expand private creation before one replacement arcade mechanic is safely reusable.

Before product edits, the assigned issue and `TASK_LOG.md` must state the goal, reason, loop impact, acceptance criteria, expected files, non-goals, strategic review, product-thinking answers, and parked idea.

Gameplay acceptance criteria must define player decision, input, movement or physics, failure, bounded scoring, escalation, feedback, reduced motion, teardown, and social-loop reuse.

## 9. Arcade quality bar

A replacement game must include:

- a dedicated mobile game viewport;
- a visible player-controlled object or meaningful world interaction;
- immediate input response;
- meaningful movement, physics, momentum, aiming, collision, balance, rhythm, or spatial timing;
- escalating pressure;
- clear active play, danger, failure, result, replay, and share states;
- a skill-based bounded score;
- at least three purposeful feedback effects where appropriate, such as score pop, impact, particles, restrained shake, squash-and-stretch, danger pulse, combo feedback, trail, or polished transition;
- a satisfying result transition;
- touch and keyboard parity where practical;
- a reduced-motion equivalent;
- safe teardown;
- reuse of the shared social loop.

A static control panel, renamed legacy mechanic, shallow reskin, or decorative-only animation cannot pass.

## 10. Originality

Generic arcade mechanics may inspire work, but names, characters, art, music, sounds, levels, layouts, wording, logos, storylines, and distinctive trade dress must be original.

The Social Trends Scout extracts behavior patterns, not surface content. Public trend research must not become copying.

## 11. Gameplay lifecycle and performance

Real-time games use one authoritative lifecycle, normally:

```text
idle → ready → running → finished
```

Rules:

- only one update loop may exist;
- use bounded delta time or fixed-step logic when fairness depends on timing;
- ignore input outside valid states;
- stop score changes immediately on finish or failure;
- cancel all animation frames, timers, intervals, temporary listeners, particles, and transient nodes on replay, navigation, failure, and completion;
- reset mutable state before replay;
- prevent duplicate loops during rapid replay or navigation;
- avoid unbounded DOM growth, forced-layout churn, background gameplay, and replay memory growth;
- use device-independent coordinates where practical;
- validate shared scores against strict game-specific bounds.

Duplicate loops, missing teardown, unbounded effects, memory growth, or frame-dependent unfair scoring are blocking.

## 12. Accessibility and reduced motion

- Design from 320px upward and prioritize 360–430px.
- No horizontal overflow.
- Touch targets are at least 44×44 CSS pixels.
- Preserve visible focus, readable contrast, semantic announcements, and keyboard access.
- Do not make success depend only on color, sound, or animation.
- Do not trap focus or fire gameplay shortcuts inside unrelated editable controls.
- `prefers-reduced-motion` must preserve decisions and scoring while disabling unnecessary shake, trails, parallax, and particles.

## 13. Localization

Localization is a shared system:

1. English.
2. Arabic with full RTL.
3. Turkish after English and Arabic pass.

Use one central dictionary or module, language-independent shared links, allowlisted local language preference, document `lang` and `dir` updates, RTL and long-label tests, and no visible untranslated keys. Do not translate legacy challenges.

## 14. Architecture

Prefer static HTML, CSS, vanilla JavaScript, Node.js 20+, built-in tests, static build output, and GitHub Pages-compatible `docs/` files.

Use `requestAnimationFrame`, transforms, opacity, and deterministic simulation where appropriate. Do not introduce a framework, database, bundler, game engine, package, or external service unless a dedicated architecture issue proves it necessary and records the decision.

Build only the minimum reusable foundation required by the next one or two planned games; do not create a general-purpose engine.

## 15. Privacy and security

- Keep the product no-login unless an approved stage changes it.
- Validate URL, hash, clipboard, storage, and shared state.
- Use safe DOM APIs for untrusted values.
- Never commit secrets, personal data, or `.env` files.
- Trend research may use current public sources only and must not store private posts, profiles, contacts, private groups, user-level datasets, prohibited scraping output, or unnecessary individual quotes.
- Metrics remain privacy-safe unless an explicit approved decision changes them.

## 16. Quality gate

Run current repository tests, build, and relevant lint/type checks. Never reuse old evidence.

For gameplay, verify when applicable:

- start, active play, failure, finish, replay, and navigation;
- input parity;
- collision and boundaries;
- scoring and escalation;
- rapid replay without duplicate loops;
- teardown during navigation;
- reduced motion;
- 320px and one 360–430px width;
- shared-link validation;
- friend attempt, comparison, and share-again reuse;
- source and `docs/` synchronization.

When tools are unavailable, report exact missing checks and do not invent evidence.

For user-facing work report exactly one preview state: live preview verified, repository preview output verified, or preview not verified with the exact reason.

## 17. QA and merge

The implementation agent performs factual self-review, marks the PR ready for QA, and stops.

The QA agent reviews the entire issue and PR and posts exactly one leading outcome:

- `QA: PASS`
- `QA: BLOCKED`

Blocking findings include correctness, security, privacy, accessibility, unsafe motion, broken checks, acceptance failure, static or shallow gameplay, copied identity, missing teardown, duplicate loops, unbounded effects, unfair scoring, broken shared state, duplicated social-loop systems, translation or RTL failure, unrelated scope, and conflicts.

The Coordinator fixes only coordination blockers, verifies QA and mergeability, squash-merges with the expected head SHA, verifies merged status, records the merge SHA, and then creates the next assignment.

## 18. Stop conditions

Stop without broadening scope when no valid assignment exists, dependencies are unmerged, files overlap another active issue, the repository cannot be read or written, safe work needs an unapproved dependency, checks cannot be fixed narrowly, review has an unresolved blocker, or merge is unsafe.

## 19. Reporting

Record factual results in the assigned issue, PR, and relevant `TASK_LOG.md` entry.

When email sending is available, send the run report to `ggmmgg9@gmail.com`.

Finish chat reports in concise Arabic. Stop after one assigned issue, one trend scan, one creative review, or one QA review according to the active role.
