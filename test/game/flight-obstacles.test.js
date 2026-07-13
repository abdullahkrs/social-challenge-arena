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

function options(overrides = {}) {
  return {
    obstacleCount: 3,
    obstacleWidth: 0.1,
    spacing: 0.2,
    initialLeft: 0.05,
    initialSpeed: 0.5,
    maxSpeed: 0.8,
    speedIncreasePerSecond: 0.1,
    maxDeltaMs: 1000,
    maxRunMs: 60000,
    initialId: 0,
    gapPattern: [
      { gapTop: 0.1, gapBottom: 0.5 },
      { gapTop: 0.25, gapBottom: 0.7 },
      { gapTop: 0.4, gapBottom: 0.85 },
      { gapTop: 0.2, gapBottom: 0.6 }
    ],
    ...overrides
  };
}

function runSequence(stream) {
  return [
    stream.getState(),
    stream.advance(16),
    stream.advance(84),
    stream.advance(250),
    stream.advance(1000),
    stream.advance(400)
  ];
}

function assertCanonicalSpacing(state, expectedCount, width, spacing) {
  assert.equal(state.obstacles.length, expectedCount);
  for (let index = 1; index < state.obstacles.length; index += 1) {
    const previous = state.obstacles[index - 1];
    const current = state.obstacles[index];
    assert.equal(current.id, previous.id + 1);
    assert.ok(current.left >= previous.right);
    assert.ok(Math.abs((current.left - previous.right) - spacing) < 1e-10);
  }
  for (const obstacle of state.obstacles) {
    assert.ok(obstacle.left >= 0 && obstacle.left <= 1);
    assert.ok(obstacle.right >= 0 && obstacle.right <= 1);
    assert.ok(obstacle.left < obstacle.right);
    assert.ok((obstacle.right - obstacle.left) <= width + 1e-10);
  }
}

function advanceAll(stream, deltas) {
  for (const delta of deltas) stream.advance(delta);
  return stream.getState();
}

test('exposes the same dependency-free API through CommonJS and browser globals', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../src/game/flight-obstacles.js'), 'utf8');
  const context = vm.createContext({});
  vm.runInContext(source, context);
  assert.equal(typeof context.SocialChallengeGameFlightObstacles.createFlightObstacles, 'function');
  assert.equal(context.SocialChallengeGameFlightObstacles.MAX_OBSTACLE_COUNT, MAX_OBSTACLE_COUNT);
  assert.equal(context.SocialChallengeGameFlightObstacles.MAX_GAP_PATTERN_LENGTH, MAX_GAP_PATTERN_LENGTH);
  assert.equal(context.SocialChallengeGameFlightObstacles.MAX_RUN_MS, MAX_RUN_MS);
});

test('rejects unknown, malformed, unsafe, contradictory, or non-normalized configuration', () => {
  const sparsePattern = [];
  sparsePattern.length = 2;
  sparsePattern[1] = { gapTop: 0.2, gapBottom: 0.8 };
  const excessivePattern = Array.from(
    { length: MAX_GAP_PATTERN_LENGTH + 1 },
    () => ({ gapTop: 0.2, gapBottom: 0.8 })
  );
  const invalidOptions = [
    null, [], { unknown: true }, { obstacleCount: 0 },
    { obstacleCount: MAX_OBSTACLE_COUNT + 1 }, { obstacleCount: 1.5 },
    { obstacleWidth: 0 }, { obstacleWidth: 1 }, { spacing: 0 },
    { initialLeft: -0.01 }, { initialLeft: 1 }, { initialSpeed: 0 },
    { maxSpeed: 0.1, initialSpeed: 0.2 }, { speedIncreasePerSecond: 0 },
    { maxDeltaMs: 0 }, { maxRunMs: 0 }, { maxRunMs: MAX_RUN_MS + 1 },
    { maxDeltaMs: 101, maxRunMs: 100 }, { initialId: -1 },
    { initialId: Number.MAX_SAFE_INTEGER },
    { obstacleCount: 1, obstacleWidth: 0.1, spacing: 0.4, initialLeft: 0, initialSpeed: 0.1, maxSpeed: 0.2, speedIncreasePerSecond: 0.1, maxDeltaMs: 10, maxRunMs: 10, initialId: Number.MAX_SAFE_INTEGER - 1 },
    { obstacleCount: 1, obstacleWidth: 1e-12, spacing: 1e-12, initialLeft: 0, initialSpeed: 0.1, maxSpeed: 4, speedIncreasePerSecond: 4, maxDeltaMs: 1000, maxRunMs: 1000 },
    { obstacleCount: 4, obstacleWidth: 0.2, spacing: 0.1 },
    { initialLeft: 0.5, obstacleCount: 2, obstacleWidth: 0.2, spacing: 0.2 },
    { gapPattern: [] }, { gapPattern: sparsePattern }, { gapPattern: excessivePattern },
    { gapPattern: [null] }, { gapPattern: [{ gapTop: 0.2 }] },
    { gapPattern: [{ gapTop: 0.8, gapBottom: 0.2 }] },
    { gapPattern: [{ gapTop: -0.1, gapBottom: 0.5 }] },
    { gapPattern: [{ gapTop: 0.2, gapBottom: 0.8, extra: true }] }
  ];
  for (const invalid of invalidOptions) assert.throws(() => createFlightObstacles(invalid));
});

test('copies caller configuration and returns fresh deeply immutable snapshots', () => {
  const config = options({ initialId: 7 });
  const stream = createFlightObstacles(config);
  config.initialLeft = 0.9;
  config.initialId = 900;
  config.gapPattern[0].gapTop = 0.49;
  config.gapPattern.push({ gapTop: 0.05, gapBottom: 0.95 });
  const first = stream.getState();
  assert.equal(first.obstacles[0].id, 7);
  assert.equal(first.obstacles[0].gapTop, 0.1);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.obstacles), true);
  assert.equal(Object.isFrozen(first.obstacles[0]), true);
  assert.equal(Reflect.set(first.obstacles[0], 'left', 0.9), false);
  assert.notEqual(stream.getState(), first);
  assert.notEqual(stream.getState().obstacles, first.obstacles);
});

test('creates a normalized non-overlapping initial layout with stable primitive IDs', () => {
  const state = createFlightObstacles(options()).getState();
  assert.equal(state.elapsedMs, 0);
  assert.equal(state.speed, 0.5);
  assert.equal(state.nextPatternIndex, 3);
  assert.equal(state.nextId, 3);
  assert.deepEqual(state.obstacles.map(({ id, gapTop, gapBottom }) => ({ id, gapTop, gapBottom })), [
    { id: 0, gapTop: 0.1, gapBottom: 0.5 },
    { id: 1, gapTop: 0.25, gapBottom: 0.7 },
    { id: 2, gapTop: 0.4, gapBottom: 0.85 }
  ]);
  assertCanonicalSpacing(state, 3, 0.1, 0.2);
});

test('moves obstacles left from explicit accepted delta without owning a loop', () => {
  const state = createFlightObstacles(options()).advance(100);
  assert.equal(state.elapsedMs, 100);
  assert.equal(state.speed, 0.51);
  const expected = [[0, 0.0995], [0.2995, 0.3995], [0.5995, 0.6995]];
  state.obstacles.forEach((obstacle, index) => {
    assert.ok(Math.abs(obstacle.left - expected[index][0]) < 1e-12);
    assert.ok(Math.abs(obstacle.right - expected[index][1]) < 1e-12);
  });
});

test('treats invalid deltas as safe logical no-ops', () => {
  const stream = createFlightObstacles(options());
  const expected = stream.getState();
  for (const delta of [0, -1, '16', null, Number.NaN, Infinity, -Infinity]) {
    assert.deepEqual(stream.advance(delta), expected);
  }
});

test('clamps oversized positive delta to the configured maximum', () => {
  const large = createFlightObstacles(options({ maxDeltaMs: 250 }));
  const exact = createFlightObstacles(options({ maxDeltaMs: 250 }));
  assert.deepEqual(large.advance(100000), exact.advance(250));
});

test('progresses exactly one difficulty dimension and caps speed', () => {
  const stream = createFlightObstacles(options({
    initialSpeed: 0.2, maxSpeed: 0.3, speedIncreasePerSecond: 0.05,
    maxDeltaMs: 1000, maxRunMs: 10000
  }));
  assert.equal(stream.advance(1000).speed, 0.25);
  assert.equal(stream.advance(1000).speed, 0.3);
  assert.equal(stream.advance(1000).speed, 0.3);
  assertCanonicalSpacing(stream.getState(), 3, 0.1, 0.2);
});

test('matches equivalent whole-number accepted partitions', () => {
  const oneFrame = createFlightObstacles(options());
  const fourFrames = createFlightObstacles(options());
  const expected = oneFrame.advance(1000);
  for (let count = 0; count < 4; count += 1) fourFrames.advance(250);
  assert.deepEqual(fourFrames.getState(), expected);
});

test('matches one 100 ms advance and three 100/3 advances including reset replay', () => {
  const oneFrame = createFlightObstacles(options({ maxDeltaMs: 1000 }));
  const threeFrames = createFlightObstacles(options({ maxDeltaMs: 1000 }));
  const expected = oneFrame.advance(100);
  for (let count = 0; count < 3; count += 1) threeFrames.advance(100 / 3);
  assert.deepEqual(threeFrames.getState(), expected);
  assert.deepEqual(threeFrames.reset(), oneFrame.reset());
});

test('matches the earlier six-decimal adjacent grouping regression', () => {
  const config = options({ maxDeltaMs: 2000, maxRunMs: 10000 });
  const fine = [473.041861, 700.624391, 927.781719, 353.490712, 801.493582];
  const grouped = [1173.666252, 1281.272431, 801.493582];
  const first = createFlightObstacles(config);
  const second = createFlightObstacles(config);
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
  assert.equal(first.getState().elapsedMs, 3256.432265);
  assert.deepEqual(second.reset(), first.reset());
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
});

test('matches the exact QA full-precision adjacent grouping before and after reset', () => {
  const config = options({ maxDeltaMs: 2000, maxRunMs: 10000 });
  const fine = [
    62.18075188891981,
    552.7133556643986,
    18.589001409153315,
    75.29627939408812,
    259.5194619711807
  ];
  const grouped = [fine[0] + fine[1], fine[2] + fine[3], fine[4]];
  const first = createFlightObstacles(config);
  const second = createFlightObstacles(config);
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
  assert.equal(first.getState().elapsedMs, 968.29885);
  assert.deepEqual(second.reset(), first.reset());
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
});

test('matches the latest QA canonical-boundary grouping before and after reset', () => {
  const config = options({ maxDeltaMs: 2000, maxRunMs: 10000 });
  const fine = [
    172.89967110750547,
    97.826896548019036,
    122.29634671371315,
    123.88666472868341,
    483.09042140207896
  ];
  const grouped = [fine[0] + fine[1], fine[2] + fine[3], fine[4]];
  assert.equal(fine.reduce((sum, value) => sum + value, 0), grouped.reduce((sum, value) => sum + value, 0));
  const first = createFlightObstacles(config);
  const second = createFlightObstacles(config);
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
  assert.equal(first.getState().elapsedMs, 1000.000001);
  assert.deepEqual(second.reset(), first.reset());
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
});

test('matches the QA one-ulp grouping boundary before and after reset', () => {
  const config = options({ maxDeltaMs: 2000, maxRunMs: 10000 });
  const fine = [
    224.8161852462906,
    256.09235101909076,
    192.9749484594686,
    235.78527915382975,
    90.33123662132027
  ];
  const grouped = [fine[0] + fine[1], fine[2] + fine[3], fine[4]];
  assert.notEqual(
    fine.reduce((sum, value) => sum + value, 0),
    grouped.reduce((sum, value) => sum + value, 0)
  );
  const first = createFlightObstacles(config);
  const second = createFlightObstacles(config);
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
  assert.equal(first.getState().elapsedMs, 1000.000001);
  assert.deepEqual(second.reset(), first.reset());
  assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
});

test('keeps generated adjacent grouping partitions stable at emitted elapsed precision', () => {
  let seed = 0x9e3779b9;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  }
  for (let sample = 0; sample < 10000; sample += 1) {
    const fine = Array.from({ length: 7 }, () => 0.001 + (random() * 500));
    const grouped = [fine[0] + fine[1], fine[2] + fine[3] + fine[4], fine[5] + fine[6]];
    const first = createFlightObstacles(options({ maxDeltaMs: 2000, maxRunMs: 10000 }));
    const second = createFlightObstacles(options({ maxDeltaMs: 2000, maxRunMs: 10000 }));
    assert.deepEqual(advanceAll(second, grouped), advanceAll(first, fine));
  }
});

test('recycles multiple off-left obstacles canonically with fixed spacing', () => {
  const stream = createFlightObstacles(options({
    initialLeft: 0, initialSpeed: 1, maxSpeed: 1.2, speedIncreasePerSecond: 0.1
  }));
  const state = stream.advance(500);
  assert.deepEqual(state.obstacles.map((obstacle) => obstacle.id), [2, 3, 4]);
  assertCanonicalSpacing(state, 3, 0.1, 0.2);
  assert.equal(state.nextId, 5);
  assert.equal(state.nextPatternIndex, 1);
});

test('cycles the copied deterministic gap pattern in canonical ID order', () => {
  const stream = createFlightObstacles(options({
    obstacleCount: 2, obstacleWidth: 0.1, spacing: 0.3, initialLeft: 0,
    initialSpeed: 0.5, maxSpeed: 0.6, speedIncreasePerSecond: 0.1,
    gapPattern: [{ gapTop: 0.1, gapBottom: 0.4 }, { gapTop: 0.3, gapBottom: 0.7 }]
  }));
  const state = stream.advance(1000);
  assert.deepEqual(state.obstacles.map(({ id, gapTop, gapBottom }) => ({ id, gapTop, gapBottom })), [
    { id: 2, gapTop: 0.1, gapBottom: 0.4 },
    { id: 3, gapTop: 0.3, gapBottom: 0.7 }
  ]);
  assert.equal(state.nextPatternIndex, 0);
});

test('assigns monotonic non-reused safe IDs across recycled snapshots', () => {
  const stream = createFlightObstacles(options({ maxRunMs: 30000 }));
  const retired = new Set();
  let previousIds = stream.getState().obstacles.map((obstacle) => obstacle.id);
  for (let step = 0; step < 30; step += 1) {
    const state = stream.advance(1000);
    const ids = state.obstacles.map((obstacle) => obstacle.id);
    for (const id of previousIds) if (!ids.includes(id)) retired.add(id);
    for (const id of ids) {
      assert.equal(Number.isSafeInteger(id), true);
      assert.equal(id >= 0, true);
      assert.equal(retired.has(id), false);
    }
    assert.equal(state.nextId, ids[ids.length - 1] + 1);
    previousIds = ids;
  }
});

test('keeps long-run state finite, bounded, canonical, and fixed-size', () => {
  const stream = createFlightObstacles(options({
    obstacleCount: 4, obstacleWidth: 0.05, spacing: 0.15, initialLeft: 0.01,
    initialSpeed: 0.5, maxSpeed: 1, speedIncreasePerSecond: 0.25,
    maxDeltaMs: 50, maxRunMs: 20000
  }));
  let state;
  for (let step = 0; step < 500; step += 1) state = stream.advance(50);
  assert.equal(state.elapsedMs, 20000);
  assert.equal(state.speed, 1);
  assert.equal(Number.isFinite(state.elapsedMs), true);
  assert.equal(Number.isFinite(state.speed), true);
  assert.equal(Number.isSafeInteger(state.nextId), true);
  assertCanonicalSpacing(state, 4, 0.05, 0.15);
  assert.equal(JSON.stringify(state).length < 1000, true);
  assert.deepEqual(stream.advance(50), state);
});

test('reset restores exact initial and replay state', () => {
  const stream = createFlightObstacles(options());
  const initial = stream.getState();
  const firstRun = runSequence(stream);
  assert.deepEqual(stream.reset(), initial);
  assert.deepEqual(runSequence(stream), firstRun);
});

test('identical configuration and accepted deltas produce byte-equivalent state', () => {
  const first = createFlightObstacles(options());
  const second = createFlightObstacles(options());
  const deltas = [16, 16, 33, 100, 1000, 5000, -1, NaN, 250];
  for (const delta of deltas) assert.deepEqual(second.advance(delta), first.advance(delta));
  assert.equal(JSON.stringify(second.getState()), JSON.stringify(first.getState()));
});

test('keeps every emitted obstacle normalized while partially exiting', () => {
  const stream = createFlightObstacles();
  for (let frame = 0; frame < 500; frame += 1) {
    const state = stream.advance(100);
    for (const obstacle of state.obstacles) {
      assert.equal(obstacle.left >= 0 && obstacle.left <= 1, true);
      assert.equal(obstacle.right >= 0 && obstacle.right <= 1, true);
      assert.equal(obstacle.left < obstacle.right, true);
      assert.equal(obstacle.gapTop >= 0 && obstacle.gapTop < obstacle.gapBottom, true);
      assert.equal(obstacle.gapBottom <= 1, true);
    }
  }
});

test('does not calculate collision, failure, score, lifecycle, input, feedback, or rendering', () => {
  const state = createFlightObstacles(options()).advance(100);
  assert.deepEqual(Object.keys(state).sort(), ['elapsedMs', 'nextId', 'nextPatternIndex', 'obstacles', 'speed']);
  for (const forbidden of [
    'score', 'failure', 'outcome', 'player', 'velocity', 'boundaryContact',
    'events', 'feedback', 'lifecycle', 'input', 'html', 'style'
  ]) assert.equal(Object.prototype.hasOwnProperty.call(state, forbidden), false);
});

test('introduces no asynchronous, browser, network, storage, URL, analytics, or random side effects', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../src/game/flight-obstacles.js'), 'utf8');
  const forbiddenPatterns = [
    /Math\.random/, /requestAnimationFrame/, /cancelAnimationFrame/, /setTimeout/,
    /setInterval/, /addEventListener/, /MutationObserver/, /document\./, /window\./,
    /fetch\s*\(/, /XMLHttpRequest/, /localStorage/, /sessionStorage/, /location\./,
    /history\./, /analytics/i, /innerHTML/
  ];
  for (const pattern of forbiddenPatterns) assert.doesNotMatch(source, pattern);
});
