const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  FLIGHT_BOUNDARY_CONTACTS,
  createFlightMotion
} = require('../../src/game/flight-motion');

function runSequence(motion) {
  return [
    motion.getState(),
    motion.advance(40),
    motion.applyImpulse(),
    motion.advance(16),
    motion.advance(120),
    motion.applyImpulse(),
    motion.advance(25)
  ];
}

test('exposes the same dependency-free API through the browser global pattern', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../src/game/flight-motion.js'),
    'utf8'
  );
  const context = vm.createContext({});

  vm.runInContext(source, context);

  assert.equal(typeof context.SocialChallengeGameFlightMotion.createFlightMotion, 'function');
  assert.equal(
    context.SocialChallengeGameFlightMotion.FLIGHT_BOUNDARY_CONTACTS.TOP,
    FLIGHT_BOUNDARY_CONTACTS.TOP
  );
});

test('rejects non-finite, unsafe, or contradictory configuration', () => {
  const invalidOptions = [
    null,
    [],
    { top: 1, bottom: 1 },
    { top: 2, bottom: 1 },
    { initialPosition: -0.1 },
    { initialVelocity: 2 },
    { gravity: 0 },
    { gravity: Number.POSITIVE_INFINITY },
    { impulseVelocity: 0.1 },
    { impulseVelocity: -2 },
    { minVelocity: 0 },
    { maxVelocity: 0 },
    { maxDeltaMs: 0 },
    { maxDeltaMs: Number.MAX_SAFE_INTEGER + 1 }
  ];

  for (const options of invalidOptions) {
    assert.throws(() => createFlightMotion(options));
  }
});

test('isolates retained configuration and returns immutable state snapshots', () => {
  const options = {
    top: -1,
    bottom: 2,
    initialPosition: 0.25,
    initialVelocity: 0.1,
    gravity: 2,
    impulseVelocity: -0.5,
    minVelocity: -1,
    maxVelocity: 1,
    maxDeltaMs: 50
  };
  const motion = createFlightMotion(options);
  options.initialPosition = 2;
  options.gravity = 999;

  const first = motion.getState();
  assert.deepEqual(first, {
    position: 0.25,
    velocity: 0.1,
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.NONE
  });
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Reflect.set(first, 'position', 99), false);
  assert.equal(first.position, 0.25);
  assert.notEqual(motion.getState(), first);
  assert.deepEqual(motion.advance(50), {
    position: 0.26,
    velocity: 0.2,
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.NONE
  });
});

test('one explicit impulse applies one bounded upward velocity without queueing', () => {
  const motion = createFlightMotion({
    initialVelocity: 1,
    impulseVelocity: -0.6
  });

  assert.deepEqual(motion.applyImpulse(), {
    position: 0.5,
    velocity: -0.6,
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.NONE
  });
  assert.deepEqual(motion.applyImpulse(), motion.getState());
  assert.equal(motion.getState().velocity, -0.6);
});

test('gravity advances normalized position and velocity deterministically', () => {
  const motion = createFlightMotion({
    initialPosition: 0.4,
    initialVelocity: 0,
    gravity: 2,
    maxDeltaMs: 100
  });

  assert.deepEqual(motion.advance(100), {
    position: 0.42000000000000004,
    velocity: 0.2,
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.NONE
  });
  assert.deepEqual(motion.advance(100), {
    position: 0.4600000000000001,
    velocity: 0.4,
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.NONE
  });
});

test('identical impulse and delta sequences reproduce exactly after reset', () => {
  const motion = createFlightMotion();
  const firstRun = runSequence(motion);

  motion.reset();
  const replay = runSequence(motion);

  assert.deepEqual(replay, firstRun);
});

test('clamps oversized positive deltas and safely ignores invalid deltas', () => {
  const create = () => createFlightMotion({
    initialPosition: 0.25,
    initialVelocity: 0.2,
    gravity: 1,
    maxDeltaMs: 50
  });
  const clamped = create();
  const exact = create();

  assert.deepEqual(clamped.advance(5000), exact.advance(50));
  const before = clamped.getState();
  for (const delta of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.deepEqual(clamped.advance(delta), before);
  }
});

test('keeps velocity within configured finite bounds', () => {
  const falling = createFlightMotion({
    initialPosition: 0,
    gravity: 100,
    maxVelocity: 0.4,
    maxDeltaMs: 10
  });
  const rising = createFlightMotion({
    initialPosition: 1,
    impulseVelocity: -0.3,
    minVelocity: -0.3
  });

  assert.equal(falling.advance(10).velocity, 0.4);
  assert.equal(Number.isFinite(falling.getState().velocity), true);
  assert.equal(rising.applyImpulse().velocity, -0.3);
  assert.equal(Number.isFinite(rising.getState().velocity), true);
});

test('clamps top and bottom crossings and reports immutable boundary contact', () => {
  const topMotion = createFlightMotion({
    initialPosition: 0.01,
    impulseVelocity: -1,
    minVelocity: -1,
    gravity: 0.1,
    maxDeltaMs: 100
  });
  topMotion.applyImpulse();
  const topState = topMotion.advance(100);
  assert.deepEqual(topState, {
    position: 0,
    velocity: 0,
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.TOP
  });
  assert.equal(Object.isFrozen(topState), true);

  const bottomMotion = createFlightMotion({
    initialPosition: 0.99,
    initialVelocity: 1,
    gravity: 1,
    maxVelocity: 1,
    maxDeltaMs: 100
  });
  assert.deepEqual(bottomMotion.advance(100), {
    position: 1,
    velocity: 0,
    boundaryContact: FLIGHT_BOUNDARY_CONTACTS.BOTTOM
  });
});

test('reset restores the exact configured initial state and neutral contact', () => {
  const motion = createFlightMotion({
    top: -1,
    bottom: 1,
    initialPosition: -1,
    initialVelocity: 0.2,
    gravity: 1,
    impulseVelocity: -0.4,
    minVelocity: -0.5,
    maxVelocity: 0.5,
    maxDeltaMs: 40
  });
  const expected = motion.getState();

  motion.applyImpulse();
  motion.advance(40);
  motion.advance(40);

  assert.deepEqual(motion.reset(), expected);
  assert.equal(motion.getState().boundaryContact, FLIGHT_BOUNDARY_CONTACTS.NONE);
});
