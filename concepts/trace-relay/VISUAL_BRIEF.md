# Trace Relay — Ribbon Relay Visual Brief

## Status

- Visual Direction: **production-ready specification for independent QA**.
- Game: **Trace Relay**.
- Treatment: **Ribbon Relay**.
- First-slice dimension: **2D**.
- Scope: discovery through share-again; no runtime code or production assets are included.
- Policy handling: `ISLAMIC_CONTENT_POLICY.md` is applied directly in this specification and later QA. Obsolete standalone Islamic-review gates in the earlier creative brief do not control this delivery.
- Next delivery after QA: Motion Design specification, then one focused architecture decision for the complete vertical slice.

## 1. Visual proposition

### 1.1 Identity: folded signal

Ribbon Relay uses a quiet abstract field in which a broad folded signal passes between irregular route anchors. The identity must feel like a digital handoff rather than an unlock pattern, toy console, circuit board, race, ritual, map, or physical challenge.

The visual hierarchy is:

1. route order and current input state;
2. active anchor and completed progress;
3. round and route-position progress;
4. assistance and finish controls;
5. decorative depth.

Every decorative layer is removable. The game remains understandable in silence, without texture, without particles, and without hue recognition.

### 1.2 Originality boundary

Do not use:

- regular 3×3 or keypad-like placement;
- identical circular dots;
- phone, lock, password, security, circuit, or authentication framing;
- four large colored quadrants or a circular sound-pad layout;
- stars, eyes, crescents, crosses, pentagrams, hexagrams, runes, talismans, ritual marks, sacred architecture, or devotional motifs;
- hearts, lives, skulls, flames, crowns, medals, betting chips, slot-machine cues, loot containers, or monetary reward imagery;
- characters, clothing, bodies, animals, weapons, alcohol, smoking, drugs, unsafe physical imitation, humiliating ranks, or public-leaderboard treatment;
- copied palettes, shapes, layouts, levels, sounds, wording, or trade dress from known games, toys, operating systems, or brands.

The production team must build from this brief and repository-owned primitives only; visual references may be used for general technical study, never as composition or style templates.

## 2. Rendering model and coordinate contract

### 2.1 Dimension

The first slice is flat 2D. Limited depth cues may come from overlap, one-pixel edge highlights, and two fixed elevation levels, but there is no perspective camera, parallax gameplay, lighting simulation, or depth-dependent input.

Future 3D games remain compatible because this game consumes platform contracts for discovery, result, sharing, comparison, localization, accessibility, and lifecycle without requiring those contracts to know its renderer.

### 2.2 Logical board

- Logical board coordinates: `1000 × 1250` units.
- Display aspect: `4:5`.
- Minimum rendered board width at a 320 px viewport: `288 CSS px` with 16 px shell gutters.
- Maximum active board width: `520 CSS px`; the board remains centered in the gameplay column.
- Gameplay geometry is generated once from the challenge seed in logical coordinates and never mirrored in RTL.
- Text, HUD alignment, action order, and comparison columns follow locale direction outside the board.
- No localized text, digit, arrow, or directional word is embedded inside board artwork.

### 2.3 Field-generation rules

For every round:

- place 5, 7, or 9 anchors in an asymmetric, non-grid distribution;
- keep anchor centers inside a board safe inset of 90 logical units horizontally and 105 vertically;
- reserve no straight rows or columns of three; any near-alignment must deviate by at least 55 logical units;
- reject layouts with four or more centers on a common circle-like ring;
- keep each anchor center at least 175 logical units from another for 5 anchors, 145 for 7, and 120 for 9;
- enforce a minimum rendered hit target of 48 × 48 CSS px and a preferred target of 56 × 56 CSS px at 320 px viewport width;
- keep at least 8 CSS px clear space between interactive hit areas at minimum width;
- avoid placing anchors beneath shell controls or labels;
- route crossings may occur only between anchors, never through an unrelated anchor hit area;
- a non-consecutive revisit in round three reuses the same anchor identity and does not introduce a duplicate marker.

A layout failing any rule is regenerated deterministically from the same seed using the next allowed layout attempt index.

## 3. Anchor system

### 3.1 Family

Anchors are nine repository-owned **folded marker plates**. Each is a rounded irregular octagonal plate sharing the same visual weight but carrying a different edge signature. The family is intentionally neither circular nor symbol-like.

| ID | Silhouette signature | Internal signature |
|---|---|---|
| `A1` | shallow notch on upper-left edge | one short horizontal bar |
| `A2` | clipped upper-right corner | two offset short bars |
| `A3` | broad outward tab on right edge | one vertical bar plus one small square |
| `A4` | narrow inward notch on lower edge | three small squares in an open angle |
| `A5` | clipped lower-left corner | two parallel vertical bars |
| `A6` | broad outward tab on upper edge | one short bar above two small squares |
| `A7` | paired shallow notches on opposite side edges | one centered square inside an open bracket |
| `A8` | diagonal lower-right edge with a shallow notch | three staggered short bars |
| `A9` | narrow outward tab on left edge and clipped top edge | two small squares separated by one short bar |

Constraints:

- signatures are abstract construction marks, not letters, numerals, faces, eyes, stars, flowers, religious signs, flags, weapons, animals, or cultural emblems;
- internal marks never form a closed sacred, occult, or alphabetic glyph;
- silhouettes remain distinguishable at 24 CSS px and in monochrome;
- `A1`–`A9` are implementation IDs only. Accessible names are localized stable ordinals such as “Anchor 1”; they never depend on left/right placement.

### 3.2 Anchor construction

- Preferred visible size at minimum viewport: 38–44 CSS px inside a 56 CSS px target.
- Corner radius: 18–24% of plate height.
- Base outline: 2 CSS px at minimum viewport, scaling to a maximum of 3 CSS px.
- Internal signature stroke: at least 2 CSS px and never thinner than the outline.
- No gradients are required for state recognition.
- A single 1 CSS px upper edge highlight may provide depth on capable devices; fallback removes it.

## 4. Palette and contrast logic

### 4.1 Core tokens

| Token | Value | Use |
|---|---|---|
| `shell-canvas` | `#F6F3EC` | product shell background |
| `shell-ink` | `#13243A` | primary text and strong outline |
| `board-base` | `#13243A` | active board |
| `board-panel` | `#1B304B` | subtle board inset or inactive area |
| `neutral-mark` | `#F6F3EC` | idle anchors and board text-free marks |
| `route-reveal` | `#4FD1C5` | observed route, paired with a continuous light edge |
| `player-trace` | `#F7C948` | confirmed player route, paired with a double-line treatment |
| `incorrect-accent` | `#E66A5E` | restrained wrong-input accent, paired with broken outline |
| `assisted-accent` | `#C3B3FF` | assisted state, paired with diagonal hatch |
| `disabled-mark` | `#7E8B9E` | disabled state with reduced opacity and dashed outline |
| `focus-ring` | `#FFFFFF` | outer focus ring on the dark board |

On `board-base`, white, route teal, player amber, incorrect coral, and assisted violet meet or exceed 4.5:1 contrast. Text must use validated shell combinations and never rely on these game colors without a compliant background.

### 4.2 Non-color rule

Color is always supplementary:

- observed route: solid ribbon with a light outer edge;
- player trace: double-line ribbon with a narrow center channel;
- correct anchor: continuous heavy outline plus filled internal signature;
- incorrect anchor: broken outer outline plus a short exterior tick at the lower edge;
- assisted anchor: diagonal internal hatch plus a small open corner marker;
- disabled anchor: dashed outline and lowered contrast;
- focus: two-ring focus treatment with 2 CSS px clear separation;
- completed round: closed band plus notch count, not color alone.

High-contrast mode may replace all fills with black/white and preserve the same outline, pattern, and line-state distinctions.

## 5. Ribbon and route system

### 5.1 Reveal ribbon

- Width: 24 logical units, rendering no thinner than 7 CSS px at minimum board size.
- Outer readability edge: 8 logical units total around the ribbon, rendering at least 2 CSS px.
- Ends: flat folded caps, not arrows, flames, trails, or brush strokes.
- Corners: rounded joins with a maximum radius of 28 logical units.
- Crossings: use a deterministic over-under break of 18 logical units around the upper segment; do not use shadows as the only crossing cue.
- The complete route may be visible during observation only, then retracts or disappears fully before input.

### 5.2 Player trace

- Uses the same route geometry between confirmed anchor centers but has a double-line construction distinct from reveal.
- Only correct selections add a segment.
- An incorrect selection never draws a segment toward the incorrect anchor.
- A revisited anchor may show two segment connections without changing its stable identity.
- The trace is cleared between rounds, on restart-current-round, on replay, and on teardown.

### 5.3 Hidden state

After concealment:

- all reveal segments are absent;
- anchors return to their stable idle identity;
- no glow, residue, ordering number, direction hint, opacity trail, or pattern history remains;
- input becomes enabled only after the visual hidden-state contract is complete.

## 6. State matrix

| State | Anchor treatment | Route treatment | Required non-visual support |
|---|---|---|---|
| idle | neutral plate, stable signature, continuous outline | none | stable accessible name |
| reveal-current | heavier continuous outline and filled signature | reveal ribbon reaches anchor | announce current observed position when announcements are enabled |
| reveal-visited | filled signature plus narrow outer ring | visible reveal route | no order number shown |
| hidden-ready | idle treatment restored | none | announce “your turn” outside board |
| keyboard-focus | idle/current state plus two-ring focus | unchanged | focus name and position in traversal |
| pressed | plate inset by max 1 CSS px or equivalent static emphasis | none until judged | input acknowledgement |
| correct | heavy outline, filled signature, small lower notch fill | confirmed player segment | announce progress position |
| incorrect | broken outline, lower exterior tick; no full-board effect | no new segment | concise neutral error announcement |
| assisted-next | assisted hatch and open corner marker until selected | no solution segment before selection | announce next anchor as assisted |
| disabled | dashed outline, lower contrast | route may still reveal in observe phase | disabled semantics |
| round-complete | anchor field fades to neutral board treatment | confirmed trace settles before transition | round result announcement |

Motion Design controls timing but may not remove, merge, or make any state motion-only.

## 7. Discovery and demonstration

### 7.1 Discovery card

The discovery card contains:

- a generic three-anchor micro-field using a seed that is never reused in play;
- one broad ribbon segment shown statically or through restrained motion;
- localized title, one-line purpose, duration signal, and primary start action in shell UI;
- no route solution from an actual challenge;
- no character, rank badge, public count, urgency timer, or flashing callout.

At 320 px, artwork occupies no more than 42% of card height and never pushes the primary action below the initial viewport because of decorative content.

### 7.2 First-time demonstration

The demonstration uses three anchors and two steps:

1. reveal route;
2. conceal;
3. show two sample selections;
4. settle into one generic result band.

Instruction text remains outside the board. Skip/help controls are shell controls with visible focus and locale-aware order. The demo is not score-bearing and does not reveal a production challenge seed.

## 8. Gameplay HUD and controls

### 8.1 HUD hierarchy

Above the board:

- localized game title or compact mode label;
- round indicator: textual `Round 1 of 3` equivalent plus three shaped progress tabs;
- route-position progress: current completed positions over route length.

Below the board:

- context cue: observe, wait, or your turn;
- secondary `Show next` action when eligible;
- tertiary `Finish now` action;
- no timer is visually dominant.

### 8.2 RTL and LTR layout

- Arabic shell uses RTL alignment and logical start/end placement.
- English and Turkish shell use LTR.
- The board, anchor coordinates, route, crossings, and focus traversal IDs do not mirror.
- Button groups use CSS logical properties; icon-only directional arrows are forbidden for core actions.
- Long labels wrap to two lines outside the board and preserve a 44 CSS px control height.
- Mixed-direction challenge links use directional isolation.
- Numeric formatting follows locale, but score comparison preserves clear label-value association.

## 9. Round progression

- Round one uses five anchors and one completed-band placeholder.
- Round two uses seven anchors and two band placeholders.
- Round three uses nine anchors and completes the three-band mark.
- A round completion never uses fireworks, confetti storms, crowns, trophies, dancing characters, full-screen flashes, or triumph over another person.
- Visual completion is a restrained transformation: the current round trace compresses into one abstract band while the board returns to neutral.
- Partial completion produces an open band with a clear incomplete edge, not a failure cross or broken-heart symbol.

## 10. Result system

### 10.1 Relay mark

The relay mark is three centered horizontal folded bands in a `5:4` container. Each band has a unique terminal notch count—one, two, or three—and a fixed geometry independent of the played route.

Band states:

- mastered: solid band plus closed outline;
- completed after correction: double-line band;
- assisted: diagonal hatch plus open corner marker;
- incomplete: outline-only band with an open terminal edge.

The mark never encodes anchor positions, route segments, order, seed, time, sender identity, or locale.

### 10.2 Result hierarchy

1. total score out of 1000;
2. relay mark;
3. mastery, progress, and flow rows with labels, values, and distinct line/pattern tokens;
4. completed positions or rounds;
5. replay and challenge-a-friend actions;
6. optional score explanation.

No category uses shame language, red failure screens, rank tiers, elimination, revenge, streak pressure, or fake scarcity.

### 10.3 Partial result

Partial results use the same surface and visual weight as full results. Incomplete bands remain clear but calm. Replay and sharing remain available. The surface emphasizes recorded progress, not failure.

## 11. Friend entry and comparison

### 11.1 Shared-link entry

- generic relay mark;
- localized score to beat;
- statement that both users receive the same challenge;
- one primary play action;
- no sender avatar, personal data, route art, seed value, or public engagement metric by default.

### 11.2 Comparison

Both players receive equal column or stacked-card weight.

- At widths below 560 px, cards stack in logical reading order.
- At wider widths, cards form two equal columns; Arabic order follows shell direction while data association remains explicit.
- Lead/tie communication uses text plus a small neutral edge marker, never a crown, podium, size domination, dimmed loser, or destructive language.
- Mastery, progress, and flow use the same row order and scale for both players.
- Rematch and share-again remain voluntary and visually secondary to the comparison result.

## 12. Share and link-preview composition

### 12.1 Spoiler-safe share card

Supported compositions:

- square `1080 × 1080`;
- landscape `1200 × 630`;
- responsive in-app share preview.

Safe content:

- product and game identity;
- total score;
- mastery/progress/flow summary;
- generic relay mark;
- friendly localized invitation;
- language-independent link handled outside raster art where the platform permits.

Forbidden content:

- active board, anchors from the played field, route, seed, solution, visited order, screenshots of play, sender personal data, urgency, humiliation, public ranking, or fake audience counts.

The generic external link preview uses a fixed neutral three-band mark and no individual score, ensuring that crawlers cannot expose route or private result data.

### 12.2 Text handling

Game artwork contains no baked text. Share text is a separate localized composition layer with font fallback, bidirectional isolation, wrapping, and safe-area rules. If reliable localized image rendering is not available, use a text-free generic preview and share localized text in the platform share payload.

## 13. Asset inventory and provenance

| Asset ID | Type | Description | Source and ownership | Budget |
|---|---|---|---|---:|
| `tr-anchor-a1` … `tr-anchor-a9` | vector path or procedural geometry | nine folded marker plates and internal signatures | authored from first principles for this repository; no external asset | combined ≤ 18 KB gzip |
| `tr-ribbon-reveal` | procedural stroke definition | reveal ribbon, edge, caps, joins, crossing break | repository-authored tokens | ≤ 2 KB gzip |
| `tr-ribbon-player` | procedural stroke definition | player double-line trace | repository-authored tokens | ≤ 2 KB gzip |
| `tr-relay-mark` | vector/procedural component | three fixed spoiler-safe result bands and state variants | repository-authored | ≤ 8 KB gzip |
| `tr-board-texture` | optional procedural pattern | very low-contrast board grain; decorative only | generated in code/CSS; no bitmap required | ≤ 1 KB gzip |
| `tr-share-backdrop` | vector/procedural composition | generic link-preview field with relay mark | repository-authored | ≤ 12 KB gzip excluding localized text |

Rules:

- record author, date, tool, license/ownership, and source file for every committed asset;
- default license status is repository-owned unless an approved license record says otherwise;
- no downloaded icon pack, stock character, traced logo, copied screenshot, or generated asset with unclear rights;
- optimize SVG with deterministic tooling while preserving accessible implementation semantics;
- strip metadata not needed for attribution or provenance;
- no base64-embedded raster data inside SVG;
- assets must remain individually removable without breaking platform contracts.

## 14. Loading and performance budgets

### 14.1 Initial visual payload

Excluding shared platform fonts and code:

- critical Trace Relay visual assets: target ≤ 35 KB gzip, hard ceiling 50 KB gzip;
- no critical raster image;
- no video, animated image, 3D model, texture atlas, or external font unique to this game;
- discovery art loads with the card; gameplay-only primitives may load after intent or through the same small vector bundle;
- share-rendering resources load only when result/share UI is reached.

### 14.2 Runtime visual budget

Representative budget Android profile:

- stable 30 fps minimum; target 60 fps on capable devices;
- at most 9 active anchors and 1 active route system;
- target ≤ 180 rendered vector/DOM nodes for the active board, hard ceiling 240;
- no unbounded particle emitter;
- at most 12 short-lived decorative fragments during result transition on capable devices; zero in fallback;
- no blur filter above 8 CSS px, no backdrop filter, and no continuously animated large shadow;
- avoid per-frame layout reads, raster canvas resizing, and full-board repaint for an anchor-only state change;
- first meaningful interaction remains targeted within 2.5 seconds on ordinary 4G.

Architecture must measure these budgets on the selected renderer rather than treating them as assumed evidence.

## 15. Low-end, reduced-detail, and failure fallback

### 15.1 Low-end mode

Low-end mode removes:

- texture;
- depth highlight;
- route crossing shadow or soft edge;
- decorative fragments;
- transition blur;
- any nonessential idle motion.

It preserves:

- identical board geometry and route order;
- all anchor silhouettes and internal signatures;
- route width and crossing break;
- every state outline/pattern;
- full hit targets, focus, announcements, assistance, score ceiling, result data, and share actions.

### 15.2 Reduced motion

Reduced motion is a Motion Design responsibility, but the visual system requires discrete valid states:

- reveal may step between anchors with short fades;
- concealment may switch to hidden through one brief fade;
- correct and incorrect states may change instantly;
- result bands may appear sequentially without travel or compression animation;
- no information, observation opportunity, score, or control depends on motion.

### 15.3 Asset failure

If optional visual assets fail:

- render anchors and ribbons from inline procedural primitives;
- remove texture and share backdrop;
- preserve shell text, controls, score, relay mark outline, and comparison;
- never block play because a decorative asset or generated preview failed.

## 16. Accessibility requirements

- Start validation at 320 CSS px width and 200% text zoom for shell surfaces.
- Maintain visible keyboard focus with at least 3:1 contrast against adjacent colors.
- Keep minimum interactive target 48 × 48 CSS px and preferred 56 × 56.
- Do not use color, sound, animation, path-drawing precision, or rapid reaction as the only information channel.
- Maintain stable localized anchor names independent of visual position and locale direction.
- Do not place instructional text over the board.
- Ensure shell text meets WCAG AA contrast; game-state graphics use strong contrast plus outline/pattern redundancy.
- Support forced-colors/high-contrast treatment using system colors and preserved silhouettes.
- Announcements describe observe, hidden-ready, correct progress, incorrect input, assistance, round completion, result, pause, and recovery without reading the hidden solution during reproduction.
- Focus order is deterministic and defined by stable anchor IDs, not visual left-to-right order.

## 17. Islamic-content policy record

- Content themes: neutral abstract digital handoff and memory challenge.
- Characters and clothing: none.
- Symbols and environments: non-devotional folded geometric plates and bands only; no sacred, occult, ritual, worship, astrological, talismanic, or culturally sensitive motif.
- Audio approach: visuals are complete in silence; no audio is approved by this brief.
- Reward and monetization: score, progress, replay, and private friendly comparison only; no payment, wager, chance reward, loot box, purchasable advantage, or monetary framing.
- Social pressure and safety: private asynchronous invitation; no public leaderboard, humiliation, forced sharing, contact harvesting, urgency threat, unsafe imitation, or physical challenge.
- Regional and cultural sensitivity: avoid flags, national patterns, religious architecture, script-like glyphs, gestures, idioms, and culturally owned motifs.
- Review result: **PASS for Visual Direction scope**, subject to independent QA of this exact specification and later QA of implemented materials.

If implementation or Motion Design introduces a questionable symbol, theme, effect, audio element, reward cue, or social treatment, it must be removed or replaced with a clearly neutral alternative. No owner referral or standalone review gate is created.

## 18. Motion Design handoff

Motion Design must use this visual state model and define:

1. reveal cadence and complete-route hold;
2. concealment and exact input-enable boundary;
3. focus, press, correct, incorrect, and assistance timing;
4. crossing treatment without loss of readability;
5. round trace-to-band transition;
6. final three-band result presentation;
7. comparison, rematch, share-again, pause, resume, replay, and teardown behavior;
8. reduced-motion equivalents for every transition;
9. maximum 12 decorative fragments on capable devices and zero in fallback;
10. silent release unless a later issue explicitly defines and validates audio.

Motion may not change anchor geometry, route information, state redundancy, spoiler rules, policy boundaries, or multilingual layout contracts.

## 19. Architecture handoff

The focused architecture decision must validate:

- SVG, canvas, DOM, or hybrid rendering against the node, payload, frame, focus, and forced-colors budgets;
- deterministic field generation and rejection rules;
- stable anchor IDs and accessible names;
- route crossing and revisit rendering;
- CSS logical layout outside a non-mirrored board;
- procedural fallback when optional assets fail;
- screenshot/share rendering without exposing route or private data;
- pause, hidden-page timing, replay reset, navigation teardown, and repeated sessions;
- low-end detection or user-controlled reduced-detail behavior without changing gameplay;
- isolation from future 2.5D/3D renderers through shared platform contracts.

## 20. QA checklist

Independent QA should block for any of the following:

- board resembles a phone unlock grid, Simon-like product, known toy, or copied trade dress;
- any anchor or relay mark resembles a prohibited, devotional, occult, culturally sensitive, alphabetic, or brand symbol;
- gameplay geometry mirrors in RTL;
- route, seed, or solution appears on result, comparison, share, or link preview;
- a state depends on color, motion, or sound alone;
- focus, hit targets, text wrapping, or contrast fail at 320 px;
- Arabic, English, or Turkish shell cannot fit without covering the board;
- low-end or reduced-motion mode loses information or score access;
- visual payload, node count, or effects exceed the stated ceilings without measured justification;
- social comparison visually humiliates or diminishes either player;
- asset provenance is missing or rights are unclear;
- implementation introduces audio, monetization, public ranking, characters, or other out-of-scope content.

## 21. Completion statement

This visual system resolves the player field, anchors, route, hidden state, input feedback, HUD, round progression, results, comparison, rematch, share composition, assets, loading, fallback, accessibility, multilingual behavior, originality, policy boundaries, and implementation budgets for Ribbon Relay. It preserves the selected 2D decision and directly unlocks Motion Design and the focused architecture review after independent QA.