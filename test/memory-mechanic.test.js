const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const {
  getChallengeById,
  createSignalEchoGame,
  createSharedResultUrl,
  parseSharedResultHash,
  createFriendAttemptInvitation,
  createComparisonSummary
} = require('../app.js');

function createFakeClock() {
  let nextId = 1;
  const timeouts = new Map();
  const cleared = [];

  return {
    setTimeoutFn(callback, milliseconds) {
      const id = nextId++;
      timeouts.set(id, { callback, milliseconds });
      return id;
    },
    clearTimeoutFn(id) {
      cleared.push(id);
      timeouts.delete(id);
    },
    runNext() {
      const entry = [...timeouts.entries()][0];
      assert.ok(entry, 'a timeout must be active');
      const [id, timer] = entry;
      timeouts.delete(id);
      timer.callback();
      return timer.milliseconds;
    },
    runUntil(predicate, limit = 100) {
      let count = 0;
      while (!predicate()) {
        assert.ok(timeouts.size, 'expected another scheduled state transition');
        this.runNext();
        count += 1;
        assert.ok(count < limit, 'timer loop exceeded safe test limit');
      }
    },
    get nextMilliseconds() {
      return [...timeouts.values()][0]?.milliseconds ?? null;
    },
    get activeTimeouts() { return timeouts.size; },
    get clearedTimeouts() { return cleared; }
  };
}

const sequence = [0, 2, 1, 3, 2];

function reachInput(game, clock) {
  clock.runUntil(() => game.getState().status === 'input');
}

test('Signal Echo is a frozen original four-round memory mechanic', () => {
  const challenge = getChallengeById('signal-echo');
  assert.equal(challenge.title, 'Signal Echo');
  assert.equal(challenge.category, 'Memory');
  assert.equal(challenge.mechanic, 'signal-echo');
  assert.equal(challenge.rounds, 4);
  assert.equal(challenge.startLength, 2);
  assert.equal(challenge.maxScore, 1400);
  assert.deepEqual(challenge.sequence, sequence);
  assert.ok(Object.isFrozen(challenge));
  assert.ok(Object.isFrozen(challenge.sequence));
});

test('Signal Echo plays and repeats four growing patterns for a 1,400 point maximum', () => {
  const clock = createFakeClock();
  const completions = [];
  const game = createSignalEchoGame({
    sequence,
    rounds: 4,
    startLength: 2,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn,
    onComplete: state => completions.push(state)
  });

  game.start();
  for (let round = 1; round <= 4; round += 1) {
    reachInput(game, clock);
    const length = round + 1;
    assert.equal(game.getState().sequenceLength, length);
    for (const pad of sequence.slice(0, length)) {
      const feedback = game.choose(pad);
      assert.equal(feedback.status, 'feedback');
      assert.equal(feedback.feedback, 'correct');
      clock.runNext();
    }
  }

  assert.equal(game.getState().status, 'complete');
  assert.equal(game.getState().score, 1400);
  assert.equal(completions.length, 1);
  assert.equal(clock.activeTimeouts, 0);
});

test('wrong input ends the attempt after visible incorrect feedback', () => {
  const clock = createFakeClock();
  const game = createSignalEchoGame({
    sequence,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });
  game.start();
  reachInput(game, clock);
  const feedback = game.choose(1);
  assert.equal(feedback.status, 'feedback');
  assert.equal(feedback.feedback, 'incorrect');
  assert.equal(feedback.score, 0);
  assert.equal(clock.nextMilliseconds, 360);
  clock.runNext();
  assert.equal(game.getState().status, 'complete');
});

test('reduced motion uses longer still signal steps without changing scoring', () => {
  const clock = createFakeClock();
  const game = createSignalEchoGame({
    sequence,
    reducedMotion: true,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });
  game.start();
  assert.equal(clock.nextMilliseconds, 300);
  clock.runNext();
  assert.equal(game.getState().activePad, 0);
  assert.equal(clock.nextMilliseconds, 650);
  reachInput(game, clock);
  const feedback = game.choose(0);
  assert.equal(feedback.score, 100);
  assert.equal(feedback.reducedMotion, true);
  assert.equal(clock.nextMilliseconds, 250);
});

test('reset and destroy cancel playback and feedback timers safely', () => {
  const clock = createFakeClock();
  const game = createSignalEchoGame({
    sequence,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });
  game.start();
  assert.equal(clock.activeTimeouts, 1);
  game.reset();
  assert.equal(clock.activeTimeouts, 0);
  assert.equal(game.getState().status, 'idle');

  game.start();
  reachInput(game, clock);
  game.choose(0);
  assert.equal(clock.activeTimeouts, 1);
  game.destroy();
  assert.equal(clock.activeTimeouts, 0);
  assert.ok(clock.clearedTimeouts.length >= 2);
});

test('Signal Echo reuses strict social-loop state and rejects scores over 1,400', () => {
  const url = new URL(createSharedResultUrl(
    900,
    20,
    'https://example.com/arena/?unsafe=1#old',
    'signal-echo'
  ));
  const parsed = parseSharedResultHash(url.hash);
  assert.deepEqual(parsed, {
    version: 1,
    challengeId: 'signal-echo',
    taps: 900,
    durationSeconds: 20
  });
  const invitation = createFriendAttemptInvitation(parsed);
  assert.equal(invitation.challengeTitle, 'Signal Echo');
  assert.equal(createComparisonSummary(1000, invitation).message, '100 points ahead.');
  assert.equal(parseSharedResultHash('#v=1&challenge=signal-echo&score=1401&duration=20'), null);
  assert.throws(
    () => createSharedResultUrl(1401, 20, 'https://example.com/', 'signal-echo'),
    /must not exceed 1400/
  );
});

test('memory UI uses native buttons, purposeful feedback, and reduced-motion CSS', () => {
  const app = readFileSync('app.js', 'utf8');
  assert.match(app, /memoryGrid\.setAttribute\('role', 'group'\)/);
  assert.match(app, /button\.type = 'button'/);
  assert.match(app, /button\.addEventListener\('click', \(\) =>/);
  assert.match(app, /data-mode="signal-echo"\]\[data-feedback="correct"\]/);
  assert.match(app, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(app, /if \(game\) game\.destroy\(\)/);
  assert.match(app, /completeAttempt\(state\.score\)/);
});
