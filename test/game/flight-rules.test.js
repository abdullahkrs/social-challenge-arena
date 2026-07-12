const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  FLIGHT_RULE_OUTCOMES,
  FLIGHT_BOUNDARY_CONTACTS,
  MAX_FLIGHT_SCORE,
  MAX_OBSTACLES_PER_FRAME,
  createFlightRules
} = require('../../src/game/flight-rules');

function player(overrides = {}) {
  return { left: 0.4, right: 0.5, top: 0.4, bottom: 0.5, ...overrides };
}

function obstacle(id, overrides = {}) {
  return {
    id,
    left: 0.6,
    right: 0.7,
    gapTop: 0.3,
    gapBottom: 0.7,
    ...overrides
  };
}

function frame(overrides = {}) {
  return {
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.NONE,
    player: player(),
    obstacles: [],
    ...overrides
  };
}

function runSequence(rules) {
  return [
    rules.getState(),
    rules.evaluate(frame({ obstacles: [obstacle('b'), obstacle('a')] })),
    rules.evaluate(frame({
      player: player({ left: 0.8, right: 0.9 }),
      obstacles: [obstacle('b'), obstacle('a')]
    })),
    rules.evaluate(frame({
      player: player({ left: 0.9, right: 1 }),
      obstacles: [obstacle('a'), obstacle('b')]
    })),
    rules.evaluate(frame({ boundaryContact: FLIGHT_BOUNDARY_CONTACTS.BOTTOM }))
  ];
}

test('exposes the same dependency-free API through the browser global pattern', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../src/game/flight-rules.js'),
    'utf8'
  );
  const context = vm.createContext({});

  vm.runInContext(source, context);

  assert.equal(typeof context.SocialChallengeGameFlightRules.createFlightRules, 'function');
  assert.equal(
    context.SocialChallengeGameFlightRules.FLIGHT_RULE_OUTCOMES.FAILED,
    FLIGHT_RULE_OUTCOMES.FAILED
  );
  assert.equal(context.SocialChallengeGameFlightRules.MAX_FLIGHT_SCORE, MAX_FLIGHT_SCORE);
});

test('rejects unsafe configuration without creating mutable state', () => {
  for (const options of [
    null,
    [],
    { maxScore: -1 },
    { maxScore: 1.5 },
    { maxScore: Number.NaN },
    { maxScore: Number.MAX_SAFE_INTEGER },
    { maxScore: MAX_FLIGHT_SCORE + 1 }
  ]) {
    assert.throws(() => createFlightRules(options));
  }

  assert.deepEqual(createFlightRules({ maxScore: 0 }).getState(), {
    outcome: FLIGHT_RULE_OUTCOMES.ACTIVE,
    score: 0,
    failure: null,
    passedIds: []
  });

  const retainedOptions = { maxScore: 1 };
  const isolated = createFlightRules(retainedOptions);
  retainedOptions.maxScore = MAX_FLIGHT_SCORE;
  const capped = isolated.evaluate(frame({
    player: player({ left: 0.9, right: 1 }),
    obstacles: [obstacle('a'), obstacle('b')]
  }));
  assert.equal(capped.score, 1);
  assert.deepEqual(capped.passedIds, ['a']);
});

test('rejects malformed normalized geometry and leaves prior state unchanged', () => {
  const rules = createFlightRules();
  rules.evaluate(frame({
    player: player({ left: 0.8, right: 0.9 }),
    obstacles: [obstacle('scored')]
  }));
  const before = rules.getState();

  const invalidFrames = [
    null,
    [],
    frame({ boundaryContact: 'side' }),
    frame({ player: null }),
    frame({ player: player({ left: -0.1 }) }),
    frame({ player: player({ left: 0.5, right: 0.5 }) }),
    frame({ player: player({ top: 0.7, bottom: 0.6 }) }),
    frame({ obstacles: null }),
    frame({ obstacles: [null] }),
    frame({ obstacles: [obstacle('bad', { left: 0.7, right: 0.7 })] }),
    frame({ obstacles: [obstacle('bad', { gapTop: 0.8, gapBottom: 0.2 })] }),
    frame({ obstacles: [obstacle('bad', { gapBottom: Number.POSITIVE_INFINITY })] }),
    frame({ obstacles: [obstacle('   ')] }),
    frame({ obstacles: [obstacle(-1)] }),
    frame({ obstacles: [obstacle(1.2)] })
  ];

  const sparse = frame({ obstacles: new Array(1) });
  invalidFrames.push(sparse);

  for (const invalidFrame of invalidFrames) {
    assert.throws(() => rules.evaluate(invalidFrame));
    assert.deepEqual(rules.getState(), before);
  }
});

test('rejects duplicate stable IDs and excessive frame lists without partial scoring', () => {
  const rules = createFlightRules();
  const passedPlayer = player({ left: 0.8, right: 0.9 });

  assert.throws(() => rules.evaluate(frame({
    player: passedPlayer,
    obstacles: [obstacle('same'), obstacle('same', { left: 0.1, right: 0.2 })]
  })));
  assert.deepEqual(rules.getState().passedIds, []);

  const tooMany = Array.from(
    { length: MAX_OBSTACLES_PER_FRAME + 1 },
    (_, index) => obstacle(index)
  );
  assert.throws(() => rules.evaluate(frame({ obstacles: tooMany })));
  assert.equal(rules.getState().score, 0);
});

test('treats boundary top or bottom contact as immediate terminal failure', () => {
  for (const contact of [FLIGHT_BOUNDARY_CONTACTS.TOP, FLIGHT_BOUNDARY_CONTACTS.BOTTOM]) {
    const rules = createFlightRules();
    const state = rules.evaluate(frame({
      boundaryContact: contact,
      player: player({ left: 0.8, right: 0.9 }),
      obstacles: [obstacle('would-score')]
    }));

    assert.deepEqual(state, {
      outcome: FLIGHT_RULE_OUTCOMES.FAILED,
      score: 0,
      failure: { type: 'boundary', boundaryContact: contact },
      passedIds: []
    });
    assert.equal(Object.isFrozen(state.failure), true);
  }
});

test('uses conservative edge contact: touching is not separated and safe-gap edges fail', () => {
  const horizontalTouch = createFlightRules();
  assert.equal(horizontalTouch.evaluate(frame({
    player: player({ left: 0.5, right: 0.6, top: 0.4, bottom: 0.5 }),
    obstacles: [obstacle('touch')]
  })).score, 0);
  assert.equal(horizontalTouch.getState().outcome, FLIGHT_RULE_OUTCOMES.ACTIVE);

  const gapTopTouch = createFlightRules();
  assert.equal(gapTopTouch.evaluate(frame({
    player: player({ left: 0.6, right: 0.65, top: 0.3, bottom: 0.4 }),
    obstacles: [obstacle('upper')]
  })).outcome, FLIGHT_RULE_OUTCOMES.FAILED);

  const gapBottomTouch = createFlightRules();
  assert.equal(gapBottomTouch.evaluate(frame({
    player: player({ left: 0.6, right: 0.65, top: 0.6, bottom: 0.7 }),
    obstacles: [obstacle('lower')]
  })).outcome, FLIGHT_RULE_OUTCOMES.FAILED);

  const passageTouch = createFlightRules();
  assert.equal(passageTouch.evaluate(frame({
    player: player({ left: 0.7, right: 0.8 }),
    obstacles: [obstacle('not-behind')]
  })).score, 0);
});

test('detects obstacle collision outside the safe gap and chooses failure ID deterministically', () => {
  const first = createFlightRules();
  const second = createFlightRules();
  const collidingPlayer = player({ left: 0.6, right: 0.65, top: 0.2, bottom: 0.4 });
  const obstacles = [obstacle('z'), obstacle('a')];

  const firstState = first.evaluate(frame({ player: collidingPlayer, obstacles }));
  const secondState = second.evaluate(frame({
    player: collidingPlayer,
    obstacles: [...obstacles].reverse()
  }));

  assert.deepEqual(firstState, secondState);
  assert.deepEqual(firstState.failure, { type: 'obstacle', obstacleId: 'a' });
});

test('keeps a strictly enclosed player safe while horizontally overlapping a corridor', () => {
  const rules = createFlightRules();
  const state = rules.evaluate(frame({
    player: player({ left: 0.6, right: 0.65, top: 0.31, bottom: 0.69 }),
    obstacles: [obstacle('safe')]
  }));

  assert.deepEqual(state, {
    outcome: FLIGHT_RULE_OUTCOMES.ACTIVE,
    score: 0,
    failure: null,
    passedIds: []
  });
});

test('awards exactly one point only after an obstacle is strictly behind the player', () => {
  const rules = createFlightRules();
  const before = frame({
    player: player({ left: 0.69, right: 0.79 }),
    obstacles: [obstacle('gate')]
  });
  const after = frame({
    player: player({ left: 0.71, right: 0.81 }),
    obstacles: [obstacle('gate')]
  });

  assert.equal(rules.evaluate(before).score, 0);
  assert.equal(rules.evaluate(after).score, 1);
  assert.equal(rules.evaluate(after).score, 1);
  assert.deepEqual(rules.getState().passedIds, ['gate']);
});

test('resists repeated and reordered frames and canonicalizes simultaneous pass order', () => {
  const rules = createFlightRules();
  const passedFrame = frame({
    player: player({ left: 0.8, right: 0.9 }),
    obstacles: [
      obstacle('b'),
      obstacle(3),
      obstacle('a'),
      obstacle(1)
    ]
  });

  const first = rules.evaluate(passedFrame);
  assert.deepEqual(first.passedIds, [1, 3, 'a', 'b']);
  assert.equal(first.score, 4);

  const reordered = rules.evaluate(frame({
    player: passedFrame.player,
    obstacles: [...passedFrame.obstacles].reverse()
  }));
  assert.deepEqual(reordered, first);

  const olderSnapshot = rules.evaluate(frame({
    obstacles: [obstacle('a'), obstacle(1)]
  }));
  assert.deepEqual(olderSnapshot, first);
});

test('caps score and retained pass IDs at the configured strict maximum', () => {
  const rules = createFlightRules({ maxScore: 2 });
  const state = rules.evaluate(frame({
    player: player({ left: 0.9, right: 1 }),
    obstacles: [obstacle('c'), obstacle('a'), obstacle('b')]
  }));

  assert.equal(state.score, 2);
  assert.deepEqual(state.passedIds, ['a', 'b']);

  const capped = rules.evaluate(frame({
    player: player({ left: 0.9, right: 1 }),
    obstacles: [obstacle('d')]
  }));
  assert.deepEqual(capped, state);
  assert.ok(capped.score <= MAX_FLIGHT_SCORE);
});

test('terminal failure freezes outcome, score, failure, and pass history until reset', () => {
  const rules = createFlightRules();
  rules.evaluate(frame({
    player: player({ left: 0.8, right: 0.9 }),
    obstacles: [obstacle('first')]
  }));
  const failed = rules.evaluate(frame({ boundaryContact: FLIGHT_BOUNDARY_CONTACTS.TOP }));

  const afterFailure = rules.evaluate(frame({
    player: player({ left: 0.9, right: 1 }),
    obstacles: [obstacle('second')]
  }));
  assert.deepEqual(afterFailure, failed);

  assert.deepEqual(rules.reset(), {
    outcome: FLIGHT_RULE_OUTCOMES.ACTIVE,
    score: 0,
    failure: null,
    passedIds: []
  });
});

test('replays the exact failure, score, and canonical passed-ID sequence after reset', () => {
  const rules = createFlightRules();
  const firstRun = runSequence(rules);

  rules.reset();
  const replay = runSequence(rules);

  assert.deepEqual(replay, firstRun);
});

test('returns fresh immutable snapshots without exposing mutable pass history', () => {
  const rules = createFlightRules();
  rules.evaluate(frame({
    player: player({ left: 0.8, right: 0.9 }),
    obstacles: [obstacle('frozen')]
  }));

  const first = rules.getState();
  const second = rules.getState();
  assert.notEqual(first, second);
  assert.notEqual(first.passedIds, second.passedIds);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.passedIds), true);
  assert.equal(Reflect.set(first, 'score', 99), false);
  assert.throws(() => first.passedIds.push('mutate'));
  assert.deepEqual(rules.getState().passedIds, ['frozen']);
});

test('isolates retained caller mutation from validated prior and internal state', () => {
  const rules = createFlightRules();
  const suppliedPlayer = player({ left: 0.8, right: 0.9 });
  const suppliedObstacle = obstacle('stable');
  const suppliedFrame = frame({
    player: suppliedPlayer,
    obstacles: [suppliedObstacle]
  });

  const state = rules.evaluate(suppliedFrame);
  suppliedPlayer.left = 0;
  suppliedObstacle.id = 'changed';
  suppliedObstacle.right = 1;
  suppliedFrame.boundaryContact = FLIGHT_BOUNDARY_CONTACTS.TOP;
  suppliedFrame.obstacles.push(obstacle('extra'));

  assert.deepEqual(state, {
    outcome: FLIGHT_RULE_OUTCOMES.ACTIVE,
    score: 1,
    failure: null,
    passedIds: ['stable']
  });
  assert.deepEqual(rules.getState(), state);
});

test('introduces no asynchronous or browser side-effect path', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../src/game/flight-rules.js'),
    'utf8'
  );
  const forbidden = [
    'requestAnimationFrame',
    'setTimeout',
    'setInterval',
    'addEventListener',
    'document.',
    'localStorage',
    'sessionStorage',
    'fetch(',
    'XMLHttpRequest',
    'navigator.',
    'location.',
    'analytics'
  ];

  for (const token of forbidden) assert.equal(source.includes(token), false, token);
});
