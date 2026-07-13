# Art Direction

## Product identity

Social Challenge Arena should feel energetic, original, readable, playful, and modern. Every game may have its own world, but all games must still feel like part of one social arcade platform.

## Default production path

1. Polished 2D.
2. 2.5D when depth materially improves the mechanic.
3. Lightweight 3D only after the 2D pipeline, social loop, localization, and mobile-performance gates are stable.

Do not choose 3D only for novelty.

## Shared visual principles

- Readable in the first three seconds.
- Strong silhouette for the player and hazards.
- Clear depth ordering and danger zones.
- Minimal instructional text.
- High contrast without excessive glare.
- Original shapes, characters, worlds, and effects.
- UI remains visually quieter than gameplay.
- Result screens preserve the game's identity while reusing the shared social shell.

## 2D guidance

Prefer vector-like shapes, CSS/SVG/canvas rendering, sprites only when they add meaningful character or motion, bounded texture use, and resolution-independent coordinates. Use sprite atlases or reusable effect assets only after a real need is proven.

## 2.5D guidance

Use perspective, layered parallax, depth scaling, lighting cues, or simple model renders while preserving a simple deterministic 2D gameplay plane where practical.

## Lightweight 3D guidance

A 3D game must define:

- why depth is required by the mechanic;
- camera model;
- geometry and material budget;
- lighting strategy;
- loading budget;
- low-end mobile fallback;
- reduced-motion camera behavior;
- deterministic gameplay coordinates;
- asset ownership and licensing;
- teardown and context-loss behavior.

Avoid large worlds, realistic rendering, complex shaders, uncontrolled physics, and long loading sequences.

## Originality boundary

Never copy protected characters, environments, logos, levels, signature palettes, sound identities, UI layouts, animation signatures, or trade dress. Extract generic emotional or mechanical inspiration only.

## Required visual states

Every active game needs approved visuals for:

- discovery tile;
- ready state;
- active play;
- danger or near miss;
- success or score gain;
- failure;
- replay;
- result;
- share preview;
- reduced motion.
