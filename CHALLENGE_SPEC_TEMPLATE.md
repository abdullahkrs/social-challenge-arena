# Challenge Specification Template

Use this template for every new or materially redesigned challenge. Complete it before full implementation. The issue and PR must link to the completed specification.

## 1. Concept decision

- Working title:
- One-sentence player promise:
- Target audience:
- Why this concept is stronger than the rejected alternatives:
- Dominant gameplay dimension: movement / puzzle / focus / pressure
- Secondary gameplay dimension(s):
- Why the concept is suitable for mobile-first play:

## 2. Endless run contract

- Failure or voluntary-exit condition:
- Procedural seed contract:
- How ordinary runs differ meaningfully:
- How friend challenges reproduce a fair route:
- Milestones, zones, or phases without a fixed ending:
- Rare events and special stages:

## 3. Difficulty and tension

Define how the run progresses through:

1. Understanding
2. Application
3. Combination
4. Deception
5. Pressure
6. Mastery

For each layer record:

- new decision introduced;
- new obstacle, rule, or constraint;
- speed/precision/complexity/memory/choice changes;
- fairness cue shown before danger;
- recovery window after pressure;
- mastery reward.

## 4. Movement and controls

- Core movement skill:
- Touch controls:
- Keyboard controls:
- Camera behavior:
- Jump/fall/landing/collision/recovery behavior where applicable:
- Reduced-effects equivalent:
- Low-end-device fallback:

## 5. Puzzle and concentration

- Puzzle or reasoning mechanic:
- Information the player must notice or remember:
- How automatic tapping is prevented:
- How misleading signals remain fair:
- How later decisions differ from opening decisions:

## 6. Scoring and social competition

- Survival or distance score:
- Accuracy/efficiency/mastery components:
- Risk and difficult-route rewards:
- Streak or combo behavior:
- Result details:
- Replay and new-route behavior:
- Share → friend attempt → compare → share-again flow:

## 7. Inspiration Matrix

- Movement references:
- Camera references:
- World-construction references:
- Color and lighting references:
- Animation and feedback references:
- Pacing/failure/restart references:
- Original transformation:
- Elements deliberately not copied:

## 8. Moodboard evidence

Provide 4–8 real gameplay images and 2–3 gameplay motion references. For each reference record:

- source URL;
- exact principle observed;
- where that principle appears in the prototype;
- why the implementation remains distinct.

Do not commit copyrighted screenshots or videos as shipped product assets.

## 9. Shape and color system

- Player silhouette language:
- Safe-world shape language:
- Hazard shape language:
- Interactive/puzzle shape language:
- Foreground/background separation:
- Primary and secondary colors:
- Danger, success, neutral, hint, and special-event colors:
- Color-blind-safe and non-color cues:
- Visual evolution between zones:

## 10. Prototype Gate

The bounded prototype must prove:

- movement feels responsive;
- camera is stable and readable;
- player silhouette is immediately clear;
- obstacles are readable before reaction is required;
- environment has intentional depth;
- colors communicate hierarchy and state;
- animation feedback is synchronized and useful;
- sound feedback is synchronized and optional;
- two generated runs are visibly and mechanically different;
- difficulty and tension escalation are observable;
- the result does not look like placeholder UI, abstract test geometry, or a flat technical demo.

Prototype Gate result: PASS / BLOCKED

Evidence:

## 11. Audio

- Required sound cues and meaning:
- Volume hierarchy:
- Repetition/rate limits:
- Mute and saved preference:
- Browser-gesture behavior:
- Visual or haptic equivalents:
- Asset provenance/licensing:

## 12. Localization, accessibility, and safety

- Arabic RTL:
- English:
- Turkish:
- Focus and screen-reader behavior:
- Touch target and text scaling checks:
- Reduced effects:
- Islamic-content-policy review:
- Privacy/security boundary:

## 13. Visual Quality Comparison

- Reference quality observed:
- Implemented equivalent:
- Known gaps:
- Why the result remains original:

## 14. Verification

- Unit/model tests:
- Deterministic-seed tests:
- Lifecycle/replay/teardown tests:
- Share and friend-link tests:
- Mobile widths:
- Production Visual Review coverage:
- Build and performance budget:
