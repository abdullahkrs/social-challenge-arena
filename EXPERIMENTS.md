# Experiments

Track testable product hypotheses before they become committed roadmap work.

## Entry format

- Experiment ID.
- Hypothesis.
- Audience.
- Product behavior tested.
- 2D/3D form.
- Islamic-content status.
- Active languages.
- Success and failure signals.
- Smallest safe test.
- Privacy constraints.
- Decision: pass / iterate / stop / blocked.

## Active experiments

### E-2026-001 — Trace Relay social-loop validation

- Hypothesis: A language-light, deterministic spatial-memory challenge that takes less than roughly 45 seconds will convert a meaningful share of recipients into players because both people receive the same route, a clear score to beat, immediate comparison, and a one-step rematch.
- Audience: casual social-media users, competitive friends, families, mixed-age users, Arabic-, English-, and Turkish-speaking users, and users on low-end through high-end mobile devices.
- Product behavior tested:
  - discovery-to-start conversion;
  - understanding without mandatory long instructions;
  - three-round completion;
  - replay after result;
  - sharing a challenge link;
  - recipient open-to-start and completion;
  - comparison view;
  - rematch or share-again.
- 2D/3D form: 2D. The experiment must validate the shared shell and game lifecycle without selecting a permanent 3D framework. The architecture must leave future 2.5D and 3D games isolated behind the same platform contracts.
- Islamic-content status: pending mandatory Islamic Content Review. The proposed abstract geometry, non-monetary score, friendly asynchronous competition, and absence of characters or unsafe imitation show no apparent prohibited element, but this is not a religious approval.
- Active languages: Arabic with complete RTL, English, and Turkish. The challenge seed and board geometry are language-independent and identical across locales; shell and result surfaces follow locale direction.
- Pre-launch success thresholds:
  - at least 80% of moderated first-time testers can explain the goal after the visual demonstration without opening optional instructions;
  - at least 90% can start and finish one round using their available input mode;
  - no critical Islamic-policy, localization, accessibility, privacy, originality, lifecycle, or low-end performance blocker;
  - replay and teardown tests show no duplicate input handlers, animation loops, timers, or retained transient effects.
- Initial released success signals, to be reassessed after a sufficient sample:
  - discovery view → challenge start: at least 35%;
  - started session → three-round completion: at least 70%;
  - result → replay: at least 25%;
  - result → share attempt: at least 12%;
  - recipient challenge open → start: at least 45%;
  - recipient start → completion: at least 65%;
  - comparison view → rematch or share-again: at least 15% combined;
  - p75 playable interaction within 2.5 seconds on the representative budget Android test profile over ordinary 4G;
  - stable 30 fps minimum during active play on the low-end test profile, with 60 fps as the target on capable devices.
- Failure signals:
  - fewer than 70% of moderated testers understand the mechanic quickly;
  - completion below 50% without a clear fixable difficulty cause;
  - recipient open-to-start below 25%;
  - share attempt below 5%;
  - users describe the concept or presentation as an imitation of an operating-system unlock pattern, Simon-style product, or another recognizable game;
  - touch, sequential tap, pointer, and keyboard create materially different scoring opportunities;
  - RTL, Turkish labels, reduced motion, focus, contrast, or low-end performance causes task failure;
  - the challenge link leaks the route, accepts unsafe input, or misrepresents a claimed score.
- Smallest safe test: one real product entry point; one discovery card; one original Trace Relay board; three seeded rounds; result, replay, strict share link, friend challenge, comparison, and share-again; no account, public feed, leaderboard, chat, payment, UGC, or live multiplayer.
- Privacy constraints: collect only privacy-safe aggregate funnel and performance events needed for the listed signals; no invasive fingerprinting, contact upload, precise location, public identity, behavioral advertising profile, or unnecessary persistent identifier. Document retention and score-link trust assumptions before implementation.
- Decision: blocked pending Creative Director, Islamic Content Review, Visual Direction, Motion Design, focused architecture decision, implementation, localization, and independent QA.

## Completed experiments

None.