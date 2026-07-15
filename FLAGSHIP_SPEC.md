# Flagship Challenge — Rift Relay

## Decision

Rift Relay is the single replacement flagship for the catalog reset.

It is an endless mobile-first puzzle runner in which the player guides an original energy courier through a procedurally generated modular world. The player must move, jump, switch lanes, and solve short signal-gate rules while pressure escalates.

## Gameplay balance

- Dominant dimension: movement and route reading.
- Secondary dimension: fast puzzle interpretation.
- Supporting dimensions: focused attention and escalating pressure.

## Core controls

- Swipe or arrow left/right: change lane.
- Tap, Space, or Arrow Up: jump.
- Swipe down or Arrow Down: slide.
- A contextual choice panel appears only at puzzle gates.

## Endless structure

The run continues until failure or voluntary exit.

Each seeded run generates recurring but non-identical zones:

1. **Flow** — readable movement and basic obstacles.
2. **Signal** — choose a gate using a visible rule.
3. **Fusion** — movement and puzzle decisions overlap.
4. **Distortion** — decoys and altered route constraints appear.
5. **Surge** — short mastery test with higher risk and score.
6. **Recovery** — a brief lower-pressure transition before the next cycle.

Later cycles recombine mechanics with tighter precision, more route choices, rule memory, moving obstacles, and rare events. Difficulty never increases through speed alone.

## Procedural generation

A deterministic seed generates:

- zone order and length;
- lane geometry;
- obstacle families and spacing;
- safe and risky routes;
- puzzle-gate rules and answers;
- recovery windows;
- rare events and visual transitions;
- score multipliers and mastery opportunities.

Ordinary replay uses a new seed. Friend competition uses the same seed and route contract.

## Scoring

Score combines:

- distance survived;
- route difficulty;
- accurate puzzle decisions;
- precision and near-miss mastery;
- maintained streak;
- optional risky-route bonuses;
- special-event completion.

## Visual direction

- Art family: stylized low-poly / layered 2.5D arcade world.
- Player silhouette: compact original energy courier with a bright directional core and trailing ribbon.
- Environment: modular floating paths, arches, rails, gates, bridges, and atmospheric layers.
- Safe state: cyan/teal plus shape cues.
- Interactive state: amber plus ring/diamond cues.
- Danger state: coral/red plus spikes, bars, or broken silhouettes.
- Recovery state: softer blue-violet and wider spacing.
- Information is never communicated by color alone.

## Inspiration matrix

- Movement responsiveness: immediate one-action feedback associated with obstacle-dodging arcade games.
- Momentum and pacing: readable acceleration and speed staging associated with platform runners.
- Camera: forward chase composition with enough look-ahead to read hazards.
- World construction: modular generated segments and visibly distinct zones.
- Puzzle rhythm: brief rules that can be understood under motion pressure.
- Failure/restart: fast, clear, and immediate.

The implementation must remain original and must not copy characters, branded items, signature objects, exact palettes, levels, textures, UI, sounds, or recognizable compositions from reference games.

## Prototype gate

Full implementation may proceed only after a bounded prototype proves:

- responsive lane movement, jump, and slide;
- stable chase camera illusion;
- clear player silhouette;
- obstacle readability at mobile width;
- layered environment depth;
- functional color hierarchy;
- synchronized movement, warning, success, and collision sound cues;
- visible procedural difference between at least three seeds;
- a clear transition from Flow to Signal to Fusion.

## Platform journey

Discover → instructions → endless run → result → replay/new route → share → friend run with same seed → compare → share again.
