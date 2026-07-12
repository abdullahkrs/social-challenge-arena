'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  MAX_OBSTACLE_COUNT,
  MAX_GAP_PATTERN_LENGTH,
  MAX_RUN_MS,
  createFlightObstacles
} = require('../../src/game/flight-obstacles');

const SOURCE_PATH = path.join(__dirname, '../../src/game/flight-obstacles.js');

function gaps() {
  return [
    { gapTop: 0.1, gapBottom: 0.4 },
    { gapTop: 0.3, gapBottom: 0.7 },
    { gapTop: 0.5, gapBottom: 0.9 }
  ];
}

function compactState(state) {
  return JSON.parse(JSON.stringify(state));
}

function assertCanonicalSpacing(state, width, spacing) {
  for (let index = 0; index < state.obstacles.length; index += 1) {
    const obstacle = state.obstacles[index];
    assert.equal(Number.isSafeInteger(obstacle.id), true);
    assert.equal(Number.isFinite(obstacle.left), true);
    assert.equal(Number.isFinite(obstacle.right), true);
    assert.equal(Number.isFinite(obstacle.gapTop), true);
    assert.equal(Number.isFinite(obstacle.gapBottom), true);
    assert.ok(obstacle.left >= 0 && obstacle.right <= 1);
    assert.ok(obstacle.left < obstacle.right);
    const visibleWidth = obstacle.right - obstacle.left;
    if (obstacle.left === 0) assert.ok(visibleWidth <= width + 1e-12);
    else assert.ok(Math.abs(visibleWidth - width) < 1e-12);
    if (index > 0) {
      const prior = state.obstacles[index - 1];
      assert.ok(obstacle.left > prior.left);
      assert.ok(Math.abs((obstacle.left - prior.right) - spacing) < 1e-12);
    }
  }
}

test('exposes the same dependency-free API through CommonJS and the browser global', () => {
  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  const context = vm.createContext({});
  vm.runInContext(source, context);

  assert.equal(typeof context.SocialChallengeGameFlightObstacles.createFlightObstacles, 'function');
  assert.equal(
    context.SocialChallengeGameFlightObstacles.MAX_OBSTACLE_COUNT,
    MAX_OBSTACLE_COUNT
  );
  assert.equal(context.SocialChallengeGameFlightObstacles.MAX_GAP_PATTERN_LENGTH, MAX_GAP_PATTERN_LENGTH);
  assert.equal(context.SocialChallengeGameFlightObstacles.MAX_RUN_MS, MAX_RUN_MS);
});

test('rejects unknown, malformed, contradictory, or unbounded configuration before state creation', () => {
  const sparsePattern = [];
  sparsePattern.length = 2;
  sparsePattern[1] = { gapTop: 0.2, gapBottom: 0.8 };
  const invalidOptions = [
    null,
    [],
    { unknown: true },
    { obstacleCount: 0 },
    { obstacleCount: MAX_OBSTACLE_COUNT + 1 },
    { obstacleCount: 1.5 },
    { obstacleWidth: 0 },
    { obstacleWidth: 2 },
    { spacing: 0 },
    { initialLeft: -0.1 },
    { initialLeft: 1 },
    { obstacleCount: 4, obstacleWidth: 0.2, spacing: 0.2 },
    { obstacleCount: 3, obstacleWidth: 0.1, spacing: 0.2, initialLeft: 0.4 },
    { gapPattern: [] },
    { gapPattern: new Array(MAX_GAP_PATTERN_LENGTH + 1).fill({ gapTop: 0.2, gapBottom: 0.8 }) },
    { gapPattern: sparsePattern },
    { gapPattern: [null] },
    { gapPattern: [{ gapTop: 0.2 }] },
    { gapPattern: [{ gapTop: 0.2, gapBottom: 0.8, extra: true }] },
    { gapPattern: [{ gapTop: -0.1, gapBottom: 0.8 }] },
    { gapPattern: [{ gapTop: 0.8, gapBottom: 0.8 }] },
    { gapPattern: [{ gapTop: 0.2, gapBottom: 1.1 }] },
    { initialSpeed: 0 },
    { initialSpeed: 1, maxSpeed: 1 },
    { maxSpeed: 5 },
    { speedIncreasePerSecond: 0 },
    { maxDeltaMs: 0 },
    { maxRunMs: 0 },
    { maxRunMs: MAX_RUN_MS + 1 },
    { maxDeltaMs: 101, maxRunMs: 100 },
    { initialId: -1 },
    { initialId: Number.MAX_SAFE_INTEGER },
    {
      obstacleCount: 1,
      obstacleWidth: 1e-12,
      spacing: 1e-12,
      initialLeft: 0,
      initialSpeed: 0.1,
      maxSpeed: 4,
      speedIncreasePerSecond: 4,
      maxDeltaMs: 1000,
      maxRunMs: 1000
    }
  ];

  for (const options of invalidOptions) assert.throws(() => createFlightObstacles(options));
});

test('copies caller configuration and returns fresh deeply immutable snapshots', () => {
  const pattern = gaps();
  const options = {
    obstacleCount: 2,
    obstacleWidth: 0.1,
    spacing: 0.2,
    initialLeft: 0.2,
    gapPattern: pattern,
    initialSpeed: 0.2,
    maxSpeed: 0.4,
    speedIncreasePerSecond: 0.1,
    maxDeltaMs: 100,
    maxRunMs: 1000,
    initialId: 7
  };
  const stream = createFlightObstacles(options);
  options.initialLeft = 0.9;
  pattern[0].gapTop = 0.9;
  pattern.push({ gapTop: 0, gapBottom: 1 });

  const first = stream.getState();
  assert.deepEqual(first.obstacles, [
    { id: 7, left: 0.2, right: 0.30000000000000004, gapTop: 0.1, gapBottom: 0.4 },
    { id: 8, left: 0.5, right: 0.6, gapTop: 0.3, gapBottom: 0.7 }
  ]);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.obstacles), true);
  assert.equal(Object.isFrozen(first.obstacles[0]), true);
  assert.equal(Reflect.set(first.obstacles[0], 'left', 99), false);
  assert.equal(Reflect.set(first.obstacles, 0, null), false);
  assert.notEqual(stream.getState(), first);
  assert.notEqual(stream.getState().obstacles, first.obstacles);
});

test('creates a normalized canonical initial layout with deterministic IDs and gap position', () => {
  const stream = createFlightObstacles({
    obstacleCount: 3,
    obstacleWidth: 0.1,
    spacing: 0.2,
    initialLeft: 0.05,
    gapPattern: gaps(),
    initialId: 11
  });
  const state = stream.getState();

  assert.equal(state.elapsedMs, 0);
  assert.equal(state.speed, 0.18);
  assert.equal(state.nextPatternIndex, 0);
  assert.equal(state.nextId, 14);
  assert.deepEqual(state.obstacles.map(({ id, gapTop, gapBottom }) => ({ id, gapTop, gapBottom })), [
    { id: 11, gapTop: 0.1, gapBottom: 0.4 },
    { id: 12, gapTop: 0.3, gapBottom: 0.7 },
    { id: 13, gapTop: 0.5, gapBottom: 0.9 }
  ]);
  assertCanonicalSpacing(state, 0.1, 0.2);
  assert.ok(state.obstacles[0].left >= 0);
  assert.ok(state.obstacles.at(-1).right <= 1);
});

test('moves every obstacle left from explicit accepted time using one speed progression', () => {
  const stream = createFlightObstacles({
    obstacleCount: 2,
    obstacleWidth: 0.1,
    spacing: 0.3,
    initialLeft: 0.4,
    initialSpeed: 0.2,
    maxSpeed: 0.6,
    speedIncreasePerSecond: 0.2,
    maxDeltaMs: 1000,
    maxRunMs: 5000
  });
  const initial = stream.getState();
  const next = stream.advance(1000);
  const expectedTravel = 0.2 + (0.5 * 0.2);

  assert.equal(next.elapsedMs, 1000);
  assert.equal(next.speed, 0.4);
  for (let index = 0; index < next.obstacles.length; index += 1) {
    assert.ok(Math.abs(next.obstacles[index].left - (initial.obstacles[index].left - expectedTravel)) < 1e-12);
    assert.ok(Math.abs(next.obstacles[index].right - (initial.obstacles[index].right - expectedTravel)) < 1e-12);
  }
  assertCanonicalSpacing(next, 0.1, 0.3);
});

test('treats zero, negative, non-number, and non-finite deltas as safe no-ops', () => {
  const stream = createFlightObstacles();
  const before = compactState(stream.getState());
  for (const delta of [0, -1, '16', null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.deepEqual(compactState(stream.advance(delta)), before);
  }
});

test('clamps oversized deltas and saturates accepted simulation time at the bounded run limit', () => {
  const options = {
    obstacleCount: 1,
    obstacleWidth: 0.1,
    spacing: 0.4,
    initialLeft: 0.8,
    initialSpeed: 0.1,
    maxSpeed: 0.2,
    speedIncreasePerSecond: 0.1,
    maxDeltaMs: 50,
    maxRunMs: 120
  };
  const clamped = createFlightObstacles(options);
  const exact = createFlightObstacles(options);

  assert.deepEqual(compactState(clamped.advance(5000)), compactState(exact.advance(50)));
  clamped.advance(50);
  const saturated = clamped.advance(50);
  assert.equal(saturated.elapsedMs, 120);
  assert.deepEqual(compactState(clamped.advance(50)), compactState(saturated));
});

test('caps horizontal speed without changing width, spacing, count, or configured gap cycle', () => {
  const stream = createFlightObstacles({
    obstacleCount: 2,
    obstacleWidth: 0.08,
    spacing: 0.32,
    initialLeft: 0.1,
    gapPattern: gaps(),
    initialSpeed: 0.1,
    maxSpeed: 0.3,
    speedIncreasePerSecond: 0.2,
    maxDeltaMs: 1000,
    maxRunMs: 5000
  });

  for (let index = 0; index < 5; index += 1) stream.advance(1000);
  const state = stream.getState();
  assert.equal(state.speed, 0.3);
  assert.equal(state.obstacles.length, 2);
  assertCanonicalSpacing(state, 0.08, 0.32);
  for (const obstacle of state.obstacles) {
    assert.equal(gaps().some((gap) => gap.gapTop === obstacle.gapTop && gap.gapBottom === obstacle.gapBottom), true);
  }
});

test('recycles off-left obstacles canonically with fixed spacing, cycling gaps, and new IDs', () => {
  const stream = createFlightObstacles({
    obstacleCount: 3,
    obstacleWidth: 0.1,
    spacing: 0.2,
    initialLeft: 0.02,
    gapPattern: gaps(),
    initialSpeed: 0.5,
    maxSpeed: 0.6,
    speedIncreasePerSecond: 0.1,
    maxDeltaMs: 500,
    maxRunMs: 2000,
    initialId: 20
  });

  const state = stream.advance(300);
  assert.deepEqual(state.obstacles.map((obstacle) => obstacle.id), [21, 22, 23]);
  assert.deepEqual(
    state.obstacles.map(({ gapTop, gapBottom }) => ({ gapTop, gapBottom })),
    [gaps()[1], gaps()[2], gaps()[0]]
  );
  assert.equal(state.nextId, 24);
  assert.equal(state.nextPatternIndex, 1);
  assertCanonicalSpacing(state, 0.1, 0.2);
});


test('clips a partially off-left corridor to the merged normalized rules and renderer shape', () => {
  const stream = createFlightObstacles({
    obstacleCount: 2,
    obstacleWidth: 0.1,
    spacing: 0.3,
    initialLeft: 0.02,
    initialSpeed: 0.2,
    maxSpeed: 0.3,
    speedIncreasePerSecond: 0.1,
    maxDeltaMs: 100,
    maxRunMs: 1000
  });

  const state = stream.advance(100);
  assert.equal(state.obstacles[0].left, 0);
  assert.ok(state.obstacles[0].right > 0 && state.obstacles[0].right <= 1);
  for (const obstacle of state.obstacles) {
    assert.ok(obstacle.left >= 0 && obstacle.left <= 1);
    assert.ok(obstacle.right >= 0 && obstacle.right <= 1);
    assert.ok(obstacle.left < obstacle.right);
    assert.ok(obstacle.gapTop >= 0 && obstacle.gapBottom <= 1);
    assert.ok(obstacle.gapTop < obstacle.gapBottom);
  }
});

test('handles canonical multi-obstacle and repeated recycling in one bounded advance', () => {
  const stream = createFlightObstacles({
    obstacleCount: 2,
    obstacleWidth: 0.05,
    spacing: 0.05,
    initialLeft: 0,
    gapPattern: gaps(),
    initialSpeed: 2,
    maxSpeed: 3,
    speedIncreasePerSecond: 1,
    maxDeltaMs: 500,
    maxRunMs: 500,
    initialId: 100
  });

  const state = stream.advance(500);
  assert.equal(state.obstacles.length, 2);
  assertCanonicalSpacing(state, 0.05, 0.05);
  assert.equal(new Set(state.obstacles.map((obstacle) => obstacle.id)).size, 2);
  assert.equal(state.obstacles.every((obstacle) => obstacle.id >= 100), true);
  assert.equal(state.nextId > Math.max(...state.obstacles.map((obstacle) => obstacle.id)), true);
  assert.equal(state.obstacles[0].right > 0, true);
});

test('supports a single-obstacle stream without overlap or recycling stalls', () => {
  const stream = createFlightObstacles({
    obstacleCount: 1,
    obstacleWidth: 0.1,
    spacing: 0.2,
    initialLeft: 0,
    gapPattern: gaps(),
    initialSpeed: 1,
    maxSpeed: 1.5,
    speedIncreasePerSecond: 0.5,
    maxDeltaMs: 500,
    maxRunMs: 500,
    initialId: 4
  });
  const state = stream.advance(500);

  assert.equal(state.obstacles.length, 1);
  assert.equal(state.obstacles[0].right > 0, true);
  assert.equal(state.obstacles[0].id >= 5, true);
  assert.equal(state.nextId, state.obstacles[0].id + 1);
});

test('preserves monotonic non-reused safe IDs throughout the configured bounded run', () => {
  const stream = createFlightObstacles({
    obstacleCount: 3,
    obstacleWidth: 0.08,
    spacing: 0.12,
    initialLeft: 0.02,
    gapPattern: gaps(),
    initialSpeed: 0.8,
    maxSpeed: 1.2,
    speedIncreasePerSecond: 0.2,
    maxDeltaMs: 100,
    maxRunMs: 10000,
    initialId: 500
  });
  const seen = new Set(stream.getState().obstacles.map((obstacle) => obstacle.id));
  let priorNextId = stream.getState().nextId;

  for (let index = 0; index < 100; index += 1) {
    const state = stream.advance(100);
    assert.equal(state.obstacles.length, 3);
    assert.equal(Number.isFinite(state.elapsedMs), true);
    assert.equal(Number.isFinite(state.speed), true);
    assert.equal(Number.isSafeInteger(state.nextId), true);
    assert.equal(state.nextId >= priorNextId, true);
    assertCanonicalSpacing(state, 0.08, 0.12);
    for (const obstacle of state.obstacles) {
      if (obstacle.id >= priorNextId) {
        assert.equal(seen.has(obstacle.id), false);
        seen.add(obstacle.id);
      }
    }
    priorNextId = state.nextId;
  }

  const finalState = stream.getState();
  assert.equal(finalState.elapsedMs, 10000);
  assert.equal(finalState.speed <= 1.2, true);
  assert.equal(finalState.obstacles.length, 3);
  assert.equal(Object.keys(finalState).sort().join(','), 'elapsedMs,nextId,nextPatternIndex,obstacles,speed');
});

test('replays the same accepted delta sequence byte-for-byte after reset', () => {
  const stream = createFlightObstacles({
    obstacleCount: 3,
    obstacleWidth: 0.08,
    spacing: 0.14,
    initialLeft: 0.03,
    gapPattern: gaps(),
    initialSpeed: 0.7,
    maxSpeed: 1.1,
    speedIncreasePerSecond: 0.2,
    maxDeltaMs: 200,
    maxRunMs: 5000,
    initialId: 30
  });
  const deltas = [16, 33, 250, 0, -5, 87, 199, 200, 42];
  const firstRun = deltas.map((delta) => compactState(stream.advance(delta)));

  const initialAfterReset = compactState(stream.reset());
  const replay = deltas.map((delta) => compactState(stream.advance(delta)));
  const fresh = compactState(createFlightObstacles({
    obstacleCount: 3,
    obstacleWidth: 0.08,
    spacing: 0.14,
    initialLeft: 0.03,
    gapPattern: gaps(),
    initialSpeed: 0.7,
    maxSpeed: 1.1,
    speedIncreasePerSecond: 0.2,
    maxDeltaMs: 200,
    maxRunMs: 5000,
    initialId: 30
  }).getState());

  assert.deepEqual(initialAfterReset, fresh);
  assert.deepEqual(replay, firstRun);
});

test('produces frame-rate-independent progression for equivalent accepted time', () => {
  const options = {
    obstacleCount: 2,
    obstacleWidth: 0.1,
    spacing: 0.3,
    initialLeft: 0.5,
    initialSpeed: 0.2,
    maxSpeed: 0.8,
    speedIncreasePerSecond: 0.3,
    maxDeltaMs: 100,
    maxRunMs: 1000
  };
  const single = createFlightObstacles(options);
  const chunked = createFlightObstacles(options);
  const one = single.advance(100);
  for (let index = 0; index < 4; index += 1) chunked.advance(25);
  const four = chunked.getState();

  assert.equal(one.elapsedMs, four.elapsedMs);
  assert.equal(one.speed, four.speed);
  assert.equal(one.nextId, four.nextId);
  assert.equal(one.nextPatternIndex, four.nextPatternIndex);
  for (let index = 0; index < one.obstacles.length; index += 1) {
    assert.ok(Math.abs(one.obstacles[index].left - four.obstacles[index].left) < 1e-12);
    assert.ok(Math.abs(one.obstacles[index].right - four.obstacles[index].right) < 1e-12);
  }
});

test('rejects ID ranges that cannot remain safe for the full bounded run', () => {
  assert.throws(() => createFlightObstacles({
    obstacleCount: 1,
    obstacleWidth: 0.1,
    spacing: 0.4,
    initialLeft: 0,
    initialSpeed: 0.1,
    maxSpeed: 0.2,
    speedIncreasePerSecond: 0.1,
    maxDeltaMs: 10,
    maxRunMs: 10,
    initialId: Number.MAX_SAFE_INTEGER - 1
  }), /safe monotonic obstacle IDs/);
});

test('keeps long-run state bounded with no retained obstacle or ID history', () => {
  const stream = createFlightObstacles({
    obstacleCount: 4,
    obstacleWidth: 0.05,
    spacing: 0.15,
    initialLeft: 0.01,
    gapPattern: gaps(),
    initialSpeed: 0.5,
    maxSpeed: 1,
    speedIncreasePerSecond: 0.25,
    maxDeltaMs: 50,
    maxRunMs: 20000,
    initialId: 0
  });

  for (let index = 0; index < 500; index += 1) stream.advance(50);
  const state = stream.getState();
  assert.equal(state.elapsedMs, 20000);
  assert.equal(state.speed, 1);
  assert.equal(state.obstacles.length, 4);
  assertCanonicalSpacing(state, 0.05, 0.15);
  assert.equal(JSON.stringify(state).length < 1000, true);
  assert.deepEqual(compactState(stream.advance(50)), compactState(state));
});

test('introduces no timer, listener, DOM, network, storage, URL, analytics, or random side effect', () => {
  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  const forbidden = [
    'Math.random',
    'setTimeout',
    'setInterval',
    'requestAnimationFrame',
    'addEventListener',
    'MutationObserver',
    'document.',
    'fetch(',
    'XMLHttpRequest',
    'localStorage',
    'sessionStorage',
    'location.',
    'history.',
    'analytics',
    'innerHTML'
  ];
  for (const token of forbidden) assert.equal(source.includes(token), false, token);

  const guardedMath = Object.create(Math);
  Object.defineProperty(guardedMath, 'random', {
    value() { throw new Error('random used'); },
    writable: false,
    configurable: false
  });
  Object.freeze(guardedMath);
  const context = vm.createContext({ Math: guardedMath });
  vm.runInContext(source, context);
  const stream = context.SocialChallengeGameFlightObstacles.createFlightObstacles();
  stream.advance(16);
  stream.reset();
});

test('does not calculate collision, scoring, failure, lifecycle, input, feedback, or rendering state', () => {
  const state = createFlightObstacles().advance(16);
  const forbiddenKeys = [
    'score', 'failure', 'outcome', 'collision', 'player', 'velocity',
    'boundaryContact', 'events', 'feedback', 'lifecycle', 'input'
  ];
  for (const key of forbiddenKeys) assert.equal(Object.hasOwn(state, key), false);
  for (const obstacle of state.obstacles) {
    assert.deepEqual(Object.keys(obstacle).sort(), ['gapBottom', 'gapTop', 'id', 'left', 'right']);
  }
});