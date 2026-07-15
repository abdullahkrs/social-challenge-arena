# Rift Relay Redesign Plan

Issue: #117
Branch: `redesign/rift-relay-depth`

## Decision

The current production loop is rejected as a flagship challenge. It is a simple avoidance runner with weak mastery, weak inspiration translation, and mostly speed-based pressure. The redesign is a gameplay rebuild, not a visual patch.

## New core challenge

The player carries a three-part signal through a collapsing route. Every zone asks the player to preserve, transform, and deliver that signal while moving.

A run combines:
- lane movement and jumping;
- reading route symbols;
- remembering a short signal state;
- applying a rule to choose the correct gate;
- deciding between safe and high-value routes;
- recovering after pressure sections.

Failure can come from collision, applying the wrong rule, losing the remembered signal, or taking an unsafe route without enough precision.

## Inspiration matrix

Genre-level qualities to study and transform:

| Area | Quality to study | Original transformation |
|---|---|---|
| Movement | immediate swipe response and readable lane commitment | signal carrier with momentum and controlled lane-lock windows |
| Camera | strong forward depth and early obstacle readability | layered rift corridor with route silhouettes and widening field of view |
| Puzzle telegraphing | one clear visual rule before action | floating signal grammar using shape, count, direction and pulse order |
| Pressure pacing | short intense sequences followed by relief | six-stage cycle with explicit recovery chambers |
| Risk/reward | visible optional dangerous path | unstable side routes that multiply score but alter the next rule |
| Feedback | strong success/failure response | route resonance, signal integrity effects and concise sound cues |

No recognizable characters, brands, exact levels, palettes, textures, interface layouts, music, sounds or signature animations may be copied.

## Six-stage difficulty curve

### 1. Understanding
- One obstacle family.
- One direct rule: follow the matching signal.
- Long decision window.
- No decoys.

### 2. Application
- Movement and one rule occur together.
- Gaps and blocked lanes appear.
- The player must swipe or jump while selecting the correct signal route.

### 3. Combination
- Two rules combine, such as shape plus direction.
- Safe and risky routes diverge.
- Short memory sequences begin.

### 4. Deception
- Decoy symbols and inverse rules appear.
- Some cues are delayed or partially hidden.
- The player must distinguish the active rule from decorative noise.

### 5. Pressure
- Route constraints, moving obstacles and shorter windows stack.
- Recovery becomes less frequent.
- Risk paths can alter the next zone's rule set.

### 6. Mastery
- Mixed rule tests use movement, memory, inversion, timing and route planning.
- Rare events modify gravity, visibility or signal order.
- Success requires learned skill rather than reaction speed alone.

## Mechanic families

1. Match: choose the gate matching the active shape or value.
2. Invert: choose the opposite direction, color family or lane relation.
3. Memory: remember first, last or missing signal in a sequence.
4. Transform: apply a two-step rule, such as rotate then avoid.
5. Route risk: choose safe integrity or unstable score multiplier.
6. Recovery: restore one chance by completing a low-pressure precision section.

## Zone structure

- Signal Foundry: teaches and applies direct rules.
- Split Current: combines movement with route choice.
- Echo Vault: memory and missing-signal puzzles.
- False Horizon: decoys, inversion and delayed cues.
- Surge Corridor: stacked pressure and scarce recovery.
- Resonance Chamber: mastery test followed by a short recovery window.

## Prototype gate

Before replacing production code, the branch must demonstrate:
- three mechanically distinct zones;
- four rule families;
- the complete understanding-to-mastery curve in one seeded run;
- touch-first movement with no permanent gameplay button row;
- clear visual depth, obstacle hierarchy and player silhouette;
- measurable difficulty growth across rules, memory, precision, constraints and pressure;
- reproducible friend runs using the same seed.

The redesign may not be merged based only on CI. It requires manual mobile play review and production visual evidence.