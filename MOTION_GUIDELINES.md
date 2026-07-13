# Motion Guidelines

Animation and game feel must communicate gameplay, not decorate it.

## Required motion brief per game

- Input response.
- Active-play motion.
- Danger and near-miss feedback.
- Success, failure, combo, score, and result transitions.
- Camera behavior for 3D or pseudo-3D.
- Particle and effect budgets.
- Reduced-motion equivalents.
- Teardown and replay reset behavior.

## Rules

- Preserve immediate input response and unambiguous scoring.
- Avoid excessive flashing, motion sickness, full-screen shake, distracting loops, and unbounded particles.
- Respect `prefers-reduced-motion` without changing player decisions or scoring opportunities.
- Stop and remove transient motion on navigation, replay, failure, and teardown.
- Test repeated replay for duplicate loops, retained effects, and memory growth.
