const test = require('node:test');
const assert = require('node:assert/strict');
const { createTapSprintGame } = require('../app.js');

function createFakeClock() {
  let intervalCallback = null;
  let clearCount = 0;

  return {
    setIntervalFn(callback, milliseconds) {
      assert.equal(milliseconds, 1000);
      intervalCallback = callback;
      return 7;
    },
    clearIntervalFn(timerId) {
      assert.equal(timerId, 7);
      clearCount += 1;
    },
    tick(times = 1) {
      assert.ok(intervalCallback, 'game interval must be scheduled before ticking');
      for (let index = 0; index < times; index += 1) intervalCallback();
    },
    get clearCount() { return clearCount; }
  };
}

test('tap sprint starts, counts taps, and completes at zero', () => {
  const clock = createFakeClock();
  const updates = [];
  const completions = [];
  const game = createTapSprintGame({
    durationSeconds: 3,
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn,
    onUpdate: state => updates.push(state),
    onComplete: state => completions.push(state)
  });

  assert.deepEqual(game.getState(), {
    status: 'idle', taps: 0, remainingSeconds: 3, durationSeconds: 3
  });

  game.start();
  game.tap();
  game.tap();
  clock.tick(2);

  assert.deepEqual(game.getState(), {
    status: 'running', taps: 2, remainingSeconds: 1, durationSeconds: 3
  });

  clock.tick();

  assert.deepEqual(game.getState(), {
    status: 'complete', taps: 2, remainingSeconds: 0, durationSeconds: 3
  });
  assert.equal(clock.clearCount, 1);
  assert.equal(completions.length, 1);
  assert.equal(completions[0].taps, 2);
  assert.ok(updates.length >= 5);
});

test('late taps are ignored and replay starts a clean attempt', () => {
  const clock = createFakeClock();
  const game = createTapSprintGame({
    durationSeconds: 1,
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn
  });

  game.start();
  game.tap();
  clock.tick();
  game.tap();

  assert.equal(game.getState().taps, 1);
  assert.equal(game.getState().status, 'complete');

  game.start();

  assert.deepEqual(game.getState(), {
    status: 'running', taps: 0, remainingSeconds: 1, durationSeconds: 1
  });
});

test('reset cancels an active attempt and restores idle state', () => {
  const clock = createFakeClock();
  const game = createTapSprintGame({
    durationSeconds: 5,
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn
  });

  game.start();
  game.tap();
  const resetState = game.reset();

  assert.deepEqual(resetState, {
    status: 'idle', taps: 0, remainingSeconds: 5, durationSeconds: 5
  });
  assert.equal(clock.clearCount, 1);
});
