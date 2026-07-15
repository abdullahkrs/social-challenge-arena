# Flagship Challenge Direction

This document is a mandatory product and quality reference for every new or materially upgraded challenge.

## Product identity

The platform is not a catalog of short micro-games. It is a platform of original endless challenges that combine:

- movement;
- puzzle-solving;
- focused attention;
- escalating pressure.

Each challenge must be understandable within seconds, meaningfully different on every run, difficult to sustain, and rewarding to master.

## Mandatory challenge contract

Every challenge must:

- continue until failure or voluntary exit;
- use procedural variation that changes routes, obstacles, puzzles, rules, timing, zones, risk, and decisions;
- support reproducible seeded friend attempts for fair comparison;
- have one dominant gameplay dimension and at least one secondary dimension;
- progress through understanding, application, combination, deception, pressure, and mastery;
- alternate rising tension with short recovery windows, mechanic reveals, special events, and mastery tests;
- increase difficulty through decisions, precision, constraints, memory, route choice, rule combinations, obstacles, zones, and modifiers—not speed alone;
- reward survival together with accuracy, efficiency, mastery, risk, streaks, puzzle completion, or difficult routes;
- include immediate replay, new route, share, friend attempt, compare, and share-again;
- include purposeful optional sound effects through the shared audio system;
- support Arabic RTL, English, Turkish, touch, keyboard, accessibility, reduced effects, teardown, and mobile performance.

A repeated input loop with minor speed changes is not an acceptable challenge.

## Autonomous concept selection

The Worker Swarm must generate several materially different concepts internally and select exactly one without owner approval.

Compare concepts against:

- broad audience appeal;
- endless replayability;
- procedural variety;
- movement and puzzle depth;
- concentration and tension rhythm;
- social competition;
- originality;
- mobile suitability;
- accessibility;
- performance and maintainability;
- Islamic-content safety;
- reversible implementation risk.

Do not create separate concept issues or approval gates.

## Visual Reference Pass

Before finalizing movement, camera, animation, environment, colors, or pacing, review real public gameplay videos and screenshots. Do not rely only on memory, game names, trailers, logos, or cover art.

High-level reference families may include arcade obstacle games, momentum platformers, forward runners, side-scrollers, puzzle-action games, and modular generated worlds. Named examples may include Flappy Bird, Sonic, Super Mario, Pepsiman, and Minecraft, but only as reference material.

Extract and document:

- movement responsiveness and timing;
- jump, fall, landing, collision, and recovery;
- acceleration and momentum;
- camera angle, distance, follow behavior, and transitions;
- obstacle silhouette, scale, spacing, and rhythm;
- player-to-world scale;
- foreground/background separation;
- modular environment construction;
- zone transitions;
- success, danger, failure, and restart feedback;
- color hierarchy and readability.

Strong genre-level visual inspiration is allowed. Do not copy protected characters, brands, items, exact game-associated palettes, levels, textures, UI, audio, music, signature poses, signature animations, trade dress, or recognizable compositions.

## Required design evidence

Before full implementation, produce:

### Inspiration Matrix

Cover:

- movement;
- camera;
- world construction;
- colors;
- feedback;
- pacing;
- original identity.

### Moodboard evidence

Review and cite:

- 4–8 gameplay images;
- 2–3 gameplay motion references.

Do not commit copyrighted reference media as product assets. Store links and concise observations in the issue or PR.

### Bounded visual gameplay prototype

Prove:

- movement feel;
- camera behavior;
- player silhouette;
- obstacle readability;
- environment depth;
- color hierarchy;
- animation feedback;
- sound synchronization.

Do not proceed to full implementation while the result still looks like placeholder UI, abstract test geometry, or a visually flat technical demo.

### Visual Quality Comparison

The PR must state:

- reference quality observed;
- implemented equivalent;
- known gaps;
- why the result remains original.

## Shape and color rules

Shapes and colors must support fast decisions.

Define:

- player or controlled-object shape language;
- environment modules;
- obstacle families;
- puzzle and interaction shapes;
- safe, interactive, dangerous, neutral, success, and special-event states;
- how forms and colors evolve across zones and difficulty;
- non-color indicators for low-vision and color-blind users.

Different zones must change composition, obstacles, atmosphere, or mechanics—not only background color.

## Platform consistency and challenge diversity

The platform shell remains consistent in navigation, typography, spacing, Font Awesome interface icons, controls, result, sharing, localization, accessibility, and audio preferences.

Each challenge may have a distinct art family, camera, environment, palette, and motion identity.

Do not create two consecutive challenges with the same control style, puzzle structure, pressure pattern, progression model, or art family.

## Rejection criteria

Reject or block a challenge when:

- it has a fixed short ending;
- runs feel substantially identical;
- procedural variation is cosmetic;
- difficulty increases only through speed;
- the same action repeats without new decisions;
- no zones, mechanics, constraints, puzzles, modifiers, or special events emerge;
- the player can progress through repetitive tapping without attention;
- maximum intensity is constant and recovery windows are absent;
- the visual result resembles placeholder UI or a technical prototype;
- obstacles, player, background, or states are hard to distinguish;
- critical information depends only on color or sound;
- the result closely copies recognizable protected game identity.

## Delivery rule

One issue, one branch, one coherent PR, one QA outcome, then production review. Do not build a generic engine, split specialist PRs, or ask the owner to choose the concept.