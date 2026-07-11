const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const {
  getChallengeById,
  createCenterSnapGame,
  getCenterSnapFeedback,
  createSharedResultUrl,
  parseSharedResultHash,
  createFriendAttemptInvitation,
  createComparisonSummary
} = require('../app.js');

function createFakeClock() {
  let nextId = 1;
  const intervals = new Map();
  const timeouts = new Map();
  const clearedIntervals = [];
  const clearedTimeouts = [];

  return {
    setIntervalFn(callback, milliseconds) {
      const id = nextId++;
      intervals.set(id, { callback, milliseconds });
      return id;
    },
    clearIntervalFn(id) {
      clearedIntervals.push(id);
      intervals.delete(id);
    },
    setTimeoutFn(callback, milliseconds) {
      const id = nextId++;
      timeouts.set(id, { callback, milliseconds });
      return id;
    },
    clearTimeoutFn(id) {
      clearedTimeouts.push(id);
      timeouts.delete(id);
    },
    tickInterval(times = 1) {
      for (let index = 0; index < times; index += 1) {
        const active = [...intervals.values()];
        assert.ok(active.length, 'movement interval must be active');
        for (const timer of active) timer.callback();
      }
    },
    runTimeout() {
      const entry = [...timeouts.entries()][0];
      assert.ok(entry, 'feedback timeout must be active');
      const [id, timer] = entry;
      timeouts.delete(id);
      timer.callback();
    },
    get intervalMilliseconds() {
      return [...intervals.values()][0]?.milliseconds ?? null;
    },
    get timeoutMilliseconds() {
      return [...timeouts.values()][0]?.milliseconds ?? null;
    },
    get activeIntervals() { return intervals.size; },
    get activeTimeouts() { return timeouts.size; },
    get clearedIntervals() { return clearedIntervals; },
    get clearedTimeouts() { return clearedTimeouts; }
  };
}

test('Center Snap is an original three-stop timing mechanic with bounded points', () => {
  const challenge = getChallengeById('center-snap');

  assert.deepEqual(challenge, {
    id: 'center-snap',
    title: 'Center Snap',
    category: 'Timing',
    difficulty: 'Easy',
    durationSeconds: 15,
    rounds: 3,
    mechanic: 'center-snap',
    scoreUnit: 'points',
    maxScore: 3000,
    description: 'Stop the moving marker as close to the center as possible.',
    goal: 'Score up to 3,000 points across three precise stops.',
    instruction: 'Stop the marker near the center. You get three tries.'
  });
  assert.ok(Object.isFrozen(challenge));
});

test('Center Snap scores three timing decisions and completes with 3,000 centered points', () => {
  const clock = createFakeClock();
  const completions = [];
  const game = createCenterSnapGame({
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn,
    onComplete: state => completions.push(state)
  });

  game.start();
  for (let round = 1; round <= 3; round += 1) {
    clock.tickInterval(40);
    const feedback = game.stop();
    assert.equal(feedback.status, 'feedback');
    assert.equal(feedback.round, round);
    assert.equal(feedback.lastPoints, 1000);
    assert.equal(feedback.score, round * 1000);
    assert.equal(getCenterSnapFeedback(feedback.lastPoints), 'Centered');
    assert.equal(clock.timeoutMilliseconds, 500);
    clock.runTimeout();
  }

  assert.deepEqual(game.getState(), {
    status: 'complete',
    round: 3,
    rounds: 3,
    score: 3000,
    position: 50,
    lastPoints: 1000,
    reducedMotion: false
  });
  assert.equal(completions.length, 1);
  assert.equal(clock.activeIntervals, 0);
  assert.equal(clock.activeTimeouts, 0);
});

test('reduced motion uses slow discrete marker steps without changing scoring', () => {
  const clock = createFakeClock();
  const game = createCenterSnapGame({
    reducedMotion: true,
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });

  game.start();
  assert.equal(clock.intervalMilliseconds, 500);
  clock.tickInterval(4);
  assert.equal(game.getState().position, 50);
  const stopped = game.stop();
  assert.equal(stopped.lastPoints, 1000);
  assert.equal(stopped.reducedMotion, true);
  assert.equal(clock.timeoutMilliseconds, 250);
});

test('reset and destroy cancel movement and feedback timers safely', () => {
  const clock = createFakeClock();
  const game = createCenterSnapGame({
    setIntervalFn: clock.setIntervalFn,
    clearIntervalFn: clock.clearIntervalFn,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });

  game.start();
  assert.equal(clock.activeIntervals, 1);
  game.reset();
  assert.equal(clock.activeIntervals, 0);
  assert.equal(game.getState().status, 'idle');

  game.start();
  game.stop();
  assert.equal(clock.activeTimeouts, 1);
  game.destroy();
  assert.equal(clock.activeTimeouts, 0);
  assert.ok(clock.clearedIntervals.length >= 2);
  assert.equal(clock.clearedTimeouts.length, 1);
});

test('Center Snap reuses strict shared links, friend entry, and point-aware comparison', () => {
  const url = new URL(createSharedResultUrl(
    2400,
    15,
    'https://example.com/arena/?unsafe=1#old',
    'center-snap'
  ));
  const parsed = parseSharedResultHash(url.hash);

  assert.deepEqual(parsed, {
    version: 1,
    challengeId: 'center-snap',
    taps: 2400,
    durationSeconds: 15
  });
  const invitation = createFriendAttemptInvitation(parsed);
  assert.deepEqual(invitation, {
    challengeId: 'center-snap',
    challengeTitle: 'Center Snap',
    targetTaps: 2400,
    durationSeconds: 15
  });
  assert.equal(createComparisonSummary(2600, invitation).message, '200 points ahead.');
  assert.equal(parseSharedResultHash('#v=1&challenge=center-snap&score=3001&duration=15'), null);
  assert.throws(
    () => createSharedResultUrl(3001, 15, 'https://example.com/', 'center-snap'),
    /must not exceed 3000/
  );
});

test('timing UI provides purposeful feedback and reduced-motion fallback', () => {
  const html = readFileSync('index.html', 'utf8');
  const css = readFileSync('styles.css', 'utf8');
  const app = readFileSync('app.js', 'utf8');

  assert.match(html, /id="timing-board"[^>]*aria-label="Center timing meter"[^>]*hidden/);
  assert.match(html, /id="timing-marker"/);
  assert.match(html, /id="timing-readout"/);
  assert.match(html, /id="score-unit"/);
  assert.match(css, /\.timing-marker[\s\S]*transition: left 40ms linear/);
  assert.match(css, /data-feedback="centered"/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none !important/);
  assert.match(app, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
  assert.match(app, /if \(game\) game\.destroy\(\)/);
});
