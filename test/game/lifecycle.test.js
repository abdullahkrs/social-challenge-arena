const test = require('node:test');
const assert = require('node:assert/strict');
const {
  GAME_LIFECYCLE_STATES,
  createGameLifecycle
} = require('../../src/game/lifecycle');

function createScheduler() {
  let nextHandle = 1;
  const frames = new Map();
  const timeouts = new Map();
  const intervals = new Map();
  const cancelledFrames = [];

  return {
    requestAnimationFrameFn(callback) {
      const handle = nextHandle++;
      frames.set(handle, callback);
      return handle;
    },
    cancelAnimationFrameFn(handle) {
      cancelledFrames.push(handle);
      frames.delete(handle);
    },
    setTimeoutFn(callback) {
      const handle = nextHandle++;
      timeouts.set(handle, callback);
      return handle;
    },
    clearTimeoutFn(handle) {
      timeouts.delete(handle);
    },
    setIntervalFn(callback) {
      const handle = nextHandle++;
      intervals.set(handle, callback);
      return handle;
    },
    clearIntervalFn(handle) {
      intervals.delete(handle);
    },
    flushFrame(timestamp) {
      const entry = frames.entries().next().value;
      assert.ok(entry, 'Expected one pending frame.');
      const [handle, callback] = entry;
      frames.delete(handle);
      callback(timestamp);
    },
    takePendingFrame() {
      const entry = frames.entries().next().value;
      assert.ok(entry, 'Expected one pending frame.');
      return entry[1];
    },
    fireTimeout() {
      const entry = timeouts.entries().next().value;
      assert.ok(entry, 'Expected one pending timeout.');
      const [handle, callback] = entry;
      timeouts.delete(handle);
      callback();
    },
    fireInterval() {
      const entry = intervals.entries().next().value;
      assert.ok(entry, 'Expected one pending interval.');
      entry[1]();
    },
    counts() {
      return {
        frames: frames.size,
        timeouts: timeouts.size,
        intervals: intervals.size,
        cancelledFrames: cancelledFrames.length
      };
    }
  };
}

function createLifecycle(scheduler, options = {}) {
  return createGameLifecycle({
    ...scheduler,
    ...options
  });
}

test('uses the explicit lifecycle and ignores invalid transitions deterministically', () => {
  const scheduler = createScheduler();
  const transitions = [];
  const lifecycle = createLifecycle(scheduler, {
    onStateChange(state, previousStatus) {
      transitions.push(`${previousStatus}->${state.status}`);
    }
  });

  assert.equal(lifecycle.getState().status, GAME_LIFECYCLE_STATES.IDLE);
  assert.equal(lifecycle.start().status, GAME_LIFECYCLE_STATES.IDLE);
  assert.equal(lifecycle.finish().status, GAME_LIFECYCLE_STATES.IDLE);

  assert.equal(lifecycle.prepare().status, GAME_LIFECYCLE_STATES.READY);
  assert.equal(lifecycle.prepare().status, GAME_LIFECYCLE_STATES.READY);
  assert.equal(lifecycle.start().status, GAME_LIFECYCLE_STATES.RUNNING);
  assert.equal(lifecycle.start().status, GAME_LIFECYCLE_STATES.RUNNING);
  assert.equal(lifecycle.finish().status, GAME_LIFECYCLE_STATES.FINISHED);
  assert.equal(lifecycle.finish().status, GAME_LIFECYCLE_STATES.FINISHED);
  assert.equal(lifecycle.reset().status, GAME_LIFECYCLE_STATES.IDLE);

  assert.deepEqual(transitions, [
    'idle->ready',
    'ready->running',
    'running->finished',
    'finished->idle'
  ]);
});

test('keeps exactly one frame handle during rapid start and replay calls', () => {
  const scheduler = createScheduler();
  const lifecycle = createLifecycle(scheduler);

  lifecycle.prepare();
  lifecycle.start();
  lifecycle.start();
  lifecycle.setActive(true);
  assert.equal(scheduler.counts().frames, 1);
  assert.equal(lifecycle.getState().framePending, true);

  scheduler.flushFrame(100);
  assert.equal(scheduler.counts().frames, 1);
  assert.equal(lifecycle.getState().frameCount, 1);

  lifecycle.finish();
  assert.equal(scheduler.counts().frames, 0);

  lifecycle.replay();
  lifecycle.replay();
  lifecycle.start();
  assert.equal(lifecycle.getState().status, GAME_LIFECYCLE_STATES.RUNNING);
  assert.equal(scheduler.counts().frames, 1);
});

test('replay resets mutable frame state before starting a new run', () => {
  const scheduler = createScheduler();
  const lifecycle = createLifecycle(scheduler, { maxDeltaMs: 50 });

  lifecycle.prepare();
  lifecycle.start();
  scheduler.flushFrame(100);
  scheduler.flushFrame(300);

  assert.deepEqual(
    {
      frameCount: lifecycle.getState().frameCount,
      elapsedMs: lifecycle.getState().elapsedMs
    },
    { frameCount: 2, elapsedMs: 50 }
  );

  lifecycle.finish();
  const replayed = lifecycle.replay();
  assert.equal(replayed.status, GAME_LIFECYCLE_STATES.RUNNING);
  assert.equal(replayed.frameCount, 0);
  assert.equal(replayed.elapsedMs, 0);
  assert.equal(scheduler.counts().frames, 1);
});

test('inactive state blocks frames, timers, intervals, listeners, and stale scoring callbacks', () => {
  const scheduler = createScheduler();
  let score = 0;
  let registeredListener = null;
  const target = {
    addEventListener(type, listener) {
      registeredListener = listener;
    },
    removeEventListener() {
      registeredListener = null;
    }
  };
  const lifecycle = createLifecycle(scheduler, {
    onFrame() {
      score += 1;
    }
  });

  lifecycle.prepare();
  lifecycle.start();
  lifecycle.scheduleTimeout(() => { score += 10; }, 100);
  lifecycle.scheduleInterval(() => { score += 100; }, 100);
  lifecycle.addTemporaryListener(target, 'pointerdown', () => { score += 1000; });
  const staleFrame = scheduler.takePendingFrame();
  lifecycle.setActive(false);

  staleFrame(100);
  scheduler.fireTimeout();
  scheduler.fireInterval();
  registeredListener({ type: 'pointerdown' });
  assert.equal(score, 0);
  assert.equal(scheduler.counts().frames, 0);
  assert.equal(lifecycle.getState().framePending, false);

  lifecycle.setActive(true);
  assert.equal(scheduler.counts().frames, 1);
  scheduler.flushFrame(200);
  scheduler.fireInterval();
  registeredListener({ type: 'pointerdown' });
  assert.equal(score, 1101);

  lifecycle.setActive(false);
  assert.equal(scheduler.counts().frames, 0);
});

test('finish and teardown cancel registered frames, timers, intervals, and listeners', () => {
  const scheduler = createScheduler();
  const removed = [];
  const target = {
    addEventListener() {},
    removeEventListener(type, listener, options) {
      removed.push({ type, listener, options });
    }
  };
  const listener = () => {};
  const lifecycle = createLifecycle(scheduler);

  lifecycle.prepare();
  lifecycle.start();
  lifecycle.scheduleTimeout(() => {}, 100);
  lifecycle.scheduleInterval(() => {}, 100);
  lifecycle.addTemporaryListener(target, 'pointerdown', listener, { passive: true });

  assert.deepEqual(scheduler.counts(), {
    frames: 1,
    timeouts: 1,
    intervals: 1,
    cancelledFrames: 0
  });

  lifecycle.finish();
  assert.equal(lifecycle.getState().status, GAME_LIFECYCLE_STATES.FINISHED);
  assert.deepEqual(scheduler.counts(), {
    frames: 0,
    timeouts: 0,
    intervals: 0,
    cancelledFrames: 1
  });
  assert.equal(removed.length, 1);

  lifecycle.replay();
  lifecycle.scheduleTimeout(() => {}, 100);
  lifecycle.scheduleInterval(() => {}, 100);
  lifecycle.addTemporaryListener(target, 'keydown', listener);
  const tornDown = lifecycle.teardown();

  assert.deepEqual(tornDown, {
    status: GAME_LIFECYCLE_STATES.IDLE,
    active: false,
    destroyed: true,
    framePending: false,
    frameCount: 0,
    elapsedMs: 0
  });
  assert.deepEqual(scheduler.counts(), {
    frames: 0,
    timeouts: 0,
    intervals: 0,
    cancelledFrames: 2
  });
  assert.equal(removed.length, 2);
  assert.equal(lifecycle.prepare().destroyed, true);
  assert.equal(lifecycle.start().status, GAME_LIFECYCLE_STATES.IDLE);
});
