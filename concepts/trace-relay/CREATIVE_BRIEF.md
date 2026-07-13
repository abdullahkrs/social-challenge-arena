# Trace Relay Creative Brief

## Status and recommendation

- Creative gate status: **selected treatment; concept-level Islamic review pending**.
- Game: **Trace Relay**.
- First-slice dimension: **2D**.
- Selected creative treatment: **Ribbon Relay**.
- Immediate next gate: **Islamic Content Review — Gate A: concept envelope**.
- Mandatory later gate: **Islamic Content Review — Gate B: final user-facing visual, motion, audio, and social materials**.
- Implementation remains blocked until both Islamic review gates, Visual Direction, Motion Design, and focused architecture review are complete.
- This brief defines creative intent and product behavior only. It does not select DOM, SVG, canvas, a framework, permanent architecture, score trust model, or production assets.

## Product promise

A player watches a short route travel through an irregular field of distinctive anchors, reproduces that route across three compact rounds, receives a clear result, and hands the identical hidden challenge to a friend through one language-independent link. Both users can compare fairly, rematch, or share again without registration, public ranking, humiliation, manipulative urgency, or route spoilers.

The experience should be understood in seconds, remain complete in silence, fit a short social-media session, work from 320px upward, and preserve equivalent decisions for touch, pointer, sequential tap, forgiving drag, and keyboard users.

## Creative treatment comparison

The selected product opportunity and 2D decision are fixed. These treatments explore materially different identities for the same Trace Relay mechanic.

| Treatment | Core fantasy | Field and route identity | Strengths | Main risks | Decision |
|---|---|---|---|---|---|
| **Ribbon Relay** | Receive a travelling route, remember its handoff, and pass it onward | An asymmetrical field of large route markers; a broad folded ribbon visits them, then retracts before response | Immediate route readability, strong relay metaphor, spoiler-safe result transformation, language-light, silent-safe, low asset cost, clean reduced-motion equivalent | Ribbon, anchor, and result-mark shapes require exact later review | **Selected** |
| **Harbor Handoff** | Guide a signal between abstract floating stations | Flat island-like plates separated by negative space; a wake-like trail moves between stations | Friendly atmosphere and appealing visual layering while remaining 2D | Decorative complexity can reduce contrast and expand theme scope before the loop is proven | Rejected for first slice |
| **Workshop Sequence** | Rebuild a route through a clean abstract assembly table | Interlocking tabs, sliders, and mechanical traces reveal an ordered path | Tactile cause and effect with strong input-feedback opportunities | Greater resemblance risk to circuit puzzles and branded electronic memory products | Rejected for first slice |

### Why Ribbon Relay wins

Ribbon Relay best balances clarity, fun, social meaning, accessibility, low-end performance, reviewability, feasibility, and originality. The route is a visible handoff rather than a security pattern or a color-and-sound sequence. Its broad line remains readable on small screens, its anchors can communicate state through silhouette and outline rather than color alone, and its result can transform into a compact three-band mark without exposing the solution. It requires no character, clothing, realistic hazardous setting, musical dependency, or heavy asset loading.

## Selected treatment: Ribbon Relay

### Core fantasy

The player completes an abstract digital relay. A broad ribbon briefly travels through a set of route markers. The player remembers the handoff and sends the route onward by selecting the markers in order. After three rounds, the completed round bands form a spoiler-safe result mark that can accompany a friend challenge.

This is not a literal running relay and does not ask users to imitate a physical activity.

### Creative vocabulary

- **Anchor field:** an irregular, non-grid arrangement of five to nine large markers with generous spacing and no phone-like 3×3 layout.
- **Anchors:** distinct abstract geometric markers with unique silhouette or internal-notch patterns. Exact production glyphs are not approved by this brief.
- **Route:** one broad ribbon that visits anchors in sequence. It may cross itself and, in round three, may revisit one earlier anchor non-consecutively.
- **Hidden state:** the ribbon fully retracts; anchors retain identity but no route history.
- **Player trace:** valid ordered selections create confirmed segments. Incorrect input never draws a misleading route.
- **Relay mark:** three compact abstract bands representing completed rounds; it contains no board or solution information.

The field must not use evenly spaced dots, a security-screen frame, four colored quadrants, a circular sound pad, numbered keypad styling, or a recognizable toy layout.

## Complete game loop

### Session target

- Typical first session: **30–45 seconds**, including the optional demonstration.
- No mandatory registration.
- No hard fail that ends the whole session after one mistake.
- No countdown pressure during observation.
- Accuracy and progress dominate score; active reproduction time is only a small capped component.

### Round structure

| Round | Field size | Route length | Purpose |
|---|---:|---:|---|
| 1 | 5 anchors | 4 selections | Establish observe → hide → reproduce with generous spacing |
| 2 | 7 anchors | 5 selections | Increase visual choice without changing the core decision |
| 3 | 9 anchors | 6 selections | Complete the relay; one non-consecutive anchor revisit may appear |

The deterministic challenge seed defines all field layouts and routes. The same seed produces the same decisions for every locale and supported input mode. Gameplay geometry never mirrors in RTL.

### Observe phase

1. A concise round label and language-light observe cue appear outside the board.
2. The route ribbon visits each anchor in sequence.
3. Every visited anchor changes through at least two channels, such as outline plus pattern or silhouette.
4. The complete route remains visible briefly, then retracts fully.
5. Input remains disabled until concealment completes.

Reduced-motion presentation uses discrete state changes and short fades while preserving the same total observation opportunity.

### Reproduction phase

The player may use any supported interaction without selecting a separate mode:

- sequential touch taps;
- forgiving touch or pointer drag with anchor snapping;
- sequential pointer clicks;
- keyboard spatial navigation or deterministic focus traversal plus confirmation.

The game judges selected anchor order, not path-drawing precision. Drag distance, pointer smoothness, swipe velocity, and handwriting-like accuracy never affect score.

### Correct input

- Immediate non-color-only anchor confirmation.
- A confirmed segment locks from the previous correct anchor.
- Progress advances by one position.
- Silent play remains complete; future audio is optional and separately reviewed.

### Incorrect input and assistance

- Wrong input does not erase completed progress or restart the round.
- The incorrect anchor receives restrained feedback; no full-screen shake, flashing, alarm, humiliation, or punitive wording.
- The expected route position stays unchanged so the player can correct immediately.
- After two wrong attempts on one position or a meaningful idle interval, an optional **show next** action becomes available.
- Assistance reveals only the next required anchor, marks that position as assisted, and removes first-try mastery credit for that position while preserving progress.
- **Finish now** produces a friendly partial result rather than trapping the user.

### Round and session completion

- Each completed round settles into one compact band.
- The next round starts from clean field and input state.
- After round three, the bands align into the generic relay mark.
- The result shows total score plus mastery, progress, and flow.
- The route, anchor positions, field layout, seed, and solution never appear on result or share surfaces.

## Score composition and tie behavior

Creative score intent is a maximum of **1000 points**:

- **Mastery — 700:** route positions selected correctly on the first attempt without assistance.
- **Progress — 200:** route positions ultimately completed, including corrected or assisted positions.
- **Flow — 100:** capped active-reproduction bonus after concealment; thresholds must allow every supported input path to earn the full ceiling.

Speed can never compensate for substantially lower mastery. Observation time, hidden-page pause time, reduced-motion preference, locale direction, and optional-instruction viewing do not reduce score.

Tie order:

1. higher total score;
2. higher mastery;
3. more completed route positions;
4. lower active reproduction time;
5. explicit shared tie when all values match.

Architecture review must validate the exact formula, time measurement, pause rules, input fairness, and score-claim trust model without changing this priority order.

## State-by-state user journey

### 1. Discovery entry

The user sees a compact game card, a static or restrained micro-demonstration of a ribbon visiting irregular anchors, one primary start action, and a short localized duration signal. The card contains no long explanation, route spoiler, public leaderboard, character, or culture-specific idiom.

The intended understanding is: watch the route, repeat it, pass the same challenge to a friend.

### 2. First-time demonstration

A short skippable demonstration shows three anchors, a two-step reveal, concealment, two sample selections, and a compact result cue. It uses icons and minimal localized verbs. Returning users proceed directly to round one unless they reopen help.

### 3. Direct shared-link entry

The recipient sees a friendly score to beat without requiring a sender identity, a generic relay mark, confirmation that both users receive the same challenge, one primary play action, and a localized fallback for invalid or unsupported links. Raw seed data never appears in user-facing copy.

### 4. Active play

For each round the user observes, waits for concealment, reproduces through an available input path, corrects mistakes without full reset, may request one-step help, and completes or finishes early. The HUD contains only round, route-position progress, optional help, and finish control.

### 5. Partial success

A player who finishes early, leaves a route incomplete, or uses assistance still receives completed positions, mastery achieved, a friendly improvement cue, and valid replay/share actions. Copy must never label the user as a loser, weak, embarrassing, or bad at memory.

### 6. Result

The result presents total score out of 1000, mastery, progress, flow, completed rounds or positions, replay, challenge-a-friend, and an optional concise score explanation. The relay mark is the share-worthy moment and communicates state through band count, outline, and shape treatment—not color alone.

### 7. Replay

Replay starts a clean run with no retained segments, duplicate input handlers, old timers/effects, or score carryover. The same challenge may be replayed for personal improvement where product rules permit; a new challenge receives a new deterministic seed.

### 8. Friend comparison

Both results receive equal visual weight: total score, mastery, progress, flow, tie or lead statement, rematch, and share again. Friendly tone intents include “You led on mastery,” “Your scores matched,” and “A new relay is ready.” Avoid destroyed, crushed, humiliated, revenge, streak pressure, countdown threats, or repeated notification pressure.

### 9. Rematch and share-again

- **Rematch:** creates a fresh deterministic route and language-independent link.
- **Share again:** shares the current result and challenge entry without revealing the route.
- The product never auto-posts, accesses contacts without explicit action, or requires sharing to continue.

## Spoiler-safe share contract

Allowed share content:

- Trace Relay identity;
- total score;
- mastery/progress/flow summary;
- completion state;
- generic relay mark;
- friendly invitation;
- language-independent link.

Forbidden share content:

- anchor field layout;
- route segments or visited order;
- seed value or solution preview;
- active-play screenshot;
- sender personal data by default;
- humiliating comparison copy;
- fake urgency.

Link-preview imagery remains generic even when the URL identifies a specific challenge.

## Input and accessibility contract

All supported users make the same ordered-anchor decisions. No input path receives unique hints, shorter routes, different geometry, or a higher score ceiling.

- Touch sequential tap is first-class.
- Forgiving drag is optional and never precision-scored.
- Pointer sequential click is first-class.
- Keyboard navigation and confirmation are first-class.
- Visible focus is always required.
- Anchor hit areas remain large and separated from 320px upward.
- Each state uses at least two channels among silhouette, outline, pattern, line state, accessible announcement, optional color, and optional reviewed sound.
- The game cannot depend on hue recognition, sound recognition, rapid animation, or drag dexterity.
- Stable accessible names must not rely on ambiguous left/right wording under RTL.
- Page hiding pauses active timing. Return offers continue or restart-current-round; restarting clears partial trace state.
- Reduced motion preserves route order, dwell opportunity, decisions, assistance, information, and score ceiling.

## Multilingual and RTL constraints

Arabic with complete RTL, English, and Turkish are mandatory from the first implementation architecture.

- Geometry, anchor IDs, route order, seed, and score rules are language-independent.
- The board never mirrors in RTL.
- Shell hierarchy, text alignment, action order, results, comparison, and announcements follow locale direction.
- Challenge URLs contain no locale and resolve through safe local preference or fallback.
- No text is embedded in artwork.
- Avoid wordplay, reading-speed mechanics, culture-specific metaphors, and long mandatory instructions.
- Mixed-direction links and identifiers require directional isolation.
- Score, time, decimals, digit shaping, punctuation, and round notation require locale-specific validation.
- Long labels wrap outside the active board and never cover anchors.

Required copy intents, not final translations: Start, Watch, Your turn, Round 1 of 3, Show next, Finish now, Score, Mastery, Progress, Flow, Replay, Challenge a friend, Compare, Rematch, Share again, invalid-link fallback, and paused-session recovery.

## Two-stage Islamic Content Review contract

No religious PASS is claimed by Creative Direction.

### Gate A — concept envelope, immediate next gate

The Islamic Content Review Agent can review the complete concept now without waiting for production assets.

Gate A packet:

- Theme: abstract digital handoff using geometry and ribbon-like route graphics.
- Characters and clothing: none.
- Environment: neutral abstract field; no sacred, ritual, occult, devotional, or realistic hazardous setting.
- Symbol direction: abstract non-devotional geometry only; no exact production glyph is approved at this stage.
- Audio boundary: not required; experience complete in silence; no audio proposal is approved at this stage.
- Rewards: score, progress, replay, and friendly private comparison only.
- Monetization: none in this slice.
- Chance: deterministic generation; no wager, betting, loot box, monetary chance reward, or purchasable advantage.
- Social pressure: private asynchronous invitation; no public leaderboard/feed, humiliation, contact harvesting, forced sharing, or manipulative urgency.
- Physical safety: no real-world imitation or physical challenge.

Gate A must return **PASS**, **REVISE**, or **ESCALATE** for the concept envelope, including the abstract relay metaphor, reward model, private social framing, silent-complete boundary, and forbidden symbol/theme categories.

A Gate A PASS authorizes Visual Direction and Motion Design to create review packets only inside the approved envelope. It does **not** approve final glyphs, the relay mark, celebration fragments, motion treatment, audio, or production social copy.

### Gate B — final user-facing materials, mandatory before architecture or implementation

After Visual Direction and Motion Design finish, a second Islamic Content Review is mandatory. Gate B must inspect the actual proposed user-facing materials:

1. exact anchor/glyph sheet and state variants;
2. exact three-band relay mark and share-card composition;
3. final celebration fragments, particles, and result transformation;
4. final motion storyboard or timing specification for reveal, errors, completion, comparison, and rematch;
5. every proposed audio element, or explicit confirmation that the release is silent;
6. final challenge, comparison, assistance, result, and share wording intents or production copy;
7. any asset provenance or visual reference that introduces cultural or symbolic uncertainty.

Gate B must return **PASS**, **REVISE**, or **ESCALATE**. Architecture and implementation may not begin until Gate B records PASS for the complete user-facing packet. Later implementation changes that alter reviewed content must return to Islamic review before release.

## Originality teardown

### Distinction from phone unlock patterns

- irregular field, never a standard 3×3 grid;
- large varied markers, never identical dots;
- observe-and-reproduce context, never security or unlocking language;
- sequential tap and keyboard are first-class, not continuous drag only;
- route may cross itself and may revisit an anchor in round three;
- three-round mastery/progress/flow result rather than binary unlock success;
- private same-seed comparison and rematch;
- spoiler-safe result mark that hides the route.

### Distinction from Simon-style products

- no four-color quadrant layout;
- no cumulative one-more-step loop;
- no sound-dependent sequence;
- no branded color order or circular pad;
- no single-error elimination;
- changing spatial field across rounds;
- identical seeded friend challenge with structured comparison.

### Rejection list

Do not use 3×3 dot grids; lock/password/security metaphors; four large colored pads; repeating musical-note sequences; copied toy sounds; circular console layouts; branded palettes or logos; hearts, lives, fail buzzers, skulls, flames, crowns, or humiliating ranks; known characters, mascots, levels, screenshots, or wording; public leaderboards, streak threats, revenge language, or forced invitations.

## Visual Direction handoff

After Gate A PASS, Visual Direction must resolve:

1. final anchor silhouette and internal-pattern family;
2. irregular field-generation rules and minimum spacing;
3. ribbon width, corners, crossings, concealment, and player trace;
4. neutral background and board boundary without security-screen resemblance;
5. complete state matrix for idle, reveal, hidden, focus, selected, correct, incorrect, assisted, disabled, and completed;
6. high-contrast and color-independent palette logic;
7. HUD, result, comparison, rematch, and share hierarchy for RTL and LTR;
8. relay mark and generic spoiler-safe link preview;
9. low-end fallback with no lost gameplay information;
10. asset inventory, provenance, licensing, naming, compression, and loading plan;
11. forbidden-reference comparison and originality review;
12. exact Gate B visual review packet for Islamic Content Review.

Visual Direction output is **not implementation-approved** until Gate B PASS.

## Motion Design handoff

After Gate A PASS, Motion Design must resolve:

1. route-reveal cadence and total observation window;
2. concealment timing and input-enable boundary;
3. immediate input confirmation;
4. correct-segment lock behavior;
5. restrained wrong-input and near-miss feedback;
6. assistance reveal;
7. round completion and next-round transition;
8. final relay-mark transformation;
9. comparison and rematch transition;
10. reduced-motion equivalents with equal information and scoring opportunity;
11. bounded particle/effect budgets;
12. replay reset, navigation teardown, pause, and resume behavior;
13. exact Gate B motion, celebration, and audio review packet for Islamic Content Review.

No flashing, full-screen shake, motion-only instruction, punitive failure animation, distracting idle loop, or unbounded particles. Motion Design output is **not implementation-approved** until Gate B PASS.

## Feasibility and performance constraints

- Preserve 2D for the first slice; depth-like layering may be visual only.
- Use at most nine active anchors and one active route presentation per round.
- Prefer repository-owned procedural or lightweight vector-style assets; final rendering choice belongs to architecture review.
- First meaningful interaction target: within 2.5 seconds on the representative budget Android profile over ordinary 4G.
- Active-play target: stable 30 fps minimum and 60 fps on capable devices.
- Keep effects bounded, removable, and silent-safe.
- Provide reduced-detail fallback without changing geometry, decisions, route visibility, state clarity, or score ceiling.
- Support clean pause, replay, navigation teardown, and repeated sessions without duplicate handlers, timers, effects, or retained board state.

## Creative risks and mitigations

| Risk | Mitigation before implementation |
|---|---|
| Resembles an unlock pattern | Enforce irregular field, varied markers, relay vocabulary, tap/keyboard emphasis, route revisit, and forbidden-reference review |
| Route is hard to perceive on small screens | Broad route, large anchors, limited field size, strong spacing, complete-route hold, and high-contrast state pairs |
| Flow scoring disadvantages some input paths | Keep flow at 10%, use generous capped thresholds, pause correctly, and validate full score access across inputs |
| Assistance feels punitive | Preserve progress, remove only first-try mastery for the assisted step, and use neutral wording |
| Shared result spoils the route | Exclude field, route, anchor order, seed, active-play screenshot, and specific preview solution |
| RTL changes challenge fairness | Never mirror board geometry or route order; adapt only shell and text direction |
| Final symbols, celebration, motion, audio, or copy introduce uncertainty | Require Gate B Islamic review on exact materials before architecture or implementation |
| Scope expands into a generic engine | Implement only contracts required by this complete vertical slice |

## Unambiguous gate sequence

1. **Creative Direction complete** — Ribbon Relay selected.
2. **Islamic Content Review Gate A** — review and approve/revise/escalate the concept envelope.
3. **Visual Direction and Motion Design** — create production specifications and exact Gate B review packets inside the Gate A envelope.
4. **Islamic Content Review Gate B** — mandatory review of exact user-facing visuals, motion, celebration, audio, and social materials.
5. **Focused architecture decision** — only after Gate B PASS.
6. **One complete vertical-slice implementation issue** — discovery through share-again.
7. **Localization and independent QA** before merge or release.

## Acceptance handoff

Creative Direction recommends **Ribbon Relay** as the single Trace Relay treatment to advance.

The immediate next action is **Islamic Content Review Gate A**. A concept-level PASS does not authorize implementation. Visual Direction and Motion Design must then produce exact review packets, followed by mandatory **Islamic Content Review Gate B** before architecture or implementation. This two-stage sequence removes the dependency loop while ensuring every final user-facing element receives specialist approval.