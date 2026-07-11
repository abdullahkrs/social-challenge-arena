const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { installCatalogBootstrap } = require('../catalog-bootstrap.js');
installCatalogBootstrap();
const core = require('../app.js');
const {
  createLaneDodgeGame,
  extendAppExports
} = require('../lane-guard.js');
const {
  getChallengeById,
  getChallengeFormat,
  createResultSummary,
  createSharedResultUrl,
  parseSharedResultHash,
  createFriendAttemptInvitation,
  createComparisonSummary
} = extendAppExports(core);

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
    get nextMilliseconds() {
      return [...timeouts.values()][0]?.milliseconds ?? null;
    },
    get activeTimeouts() { return timeouts.size; },
    get clearedTimeouts() { return cleared; }
  };
}

function finishWave(game, clock) {
  clock.runNext();
  clock.runNext();
  clock.runNext();
}

test('Lane Guard is a frozen original six-wave lane-dodge mechanic', () => {
  const challenge = getChallengeById('lane-guard');
  assert.equal(challenge.title, 'Lane Guard');
  assert.equal(challenge.category, 'Dodge');
  assert.equal(challenge.mechanic, 'lane-dodge');
  assert.equal(challenge.waves, 6);
  assert.equal(challenge.maxScore, 600);
  assert.equal(getChallengeFormat(challenge), '6 waves');
  assert.deepEqual(challenge.obstaclePattern, [0, 2, 1, 2, 0, 1]);
  assert.ok(Object.isFrozen(challenge));
  assert.ok(Object.isFrozen(challenge.obstaclePattern));
});

test('Lane Guard clears six deterministic waves for a 600 point maximum', () => {
  const clock = createFakeClock();
  const completions = [];
  const pattern = [0, 2, 1, 2, 0, 1];
  const game = createLaneDodgeGame({
    obstaclePattern: pattern,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn,
    onComplete: state => completions.push(state)
  });

  game.start();
  for (let index = 0; index < pattern.length; index += 1) {
    const safeLane = (pattern[index] + 1) % 3;
    assert.equal(game.chooseLane(safeLane).playerLane, safeLane);
    finishWave(game, clock);
    assert.equal(game.getState().feedback, 'clear');
    assert.equal(game.getState().score, (index + 1) * 100);
    clock.runNext();
  }

  assert.equal(game.getState().status, 'complete');
  assert.equal(game.getState().score, 600);
  assert.equal(completions.length, 1);
  assert.equal(clock.activeTimeouts, 0);
  assert.equal(createResultSummary(600, 18, getChallengeById('lane-guard')).message,
    'Perfect escape. Can a friend clear every wave?');
});

test('collision gives explicit hit feedback and ends the attempt', () => {
  const clock = createFakeClock();
  const game = createLaneDodgeGame({
    obstaclePattern: [1, 0],
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });

  game.start();
  finishWave(game, clock);
  assert.equal(game.getState().status, 'feedback');
  assert.equal(game.getState().feedback, 'hit');
  assert.equal(game.getState().score, 0);
  assert.equal(clock.nextMilliseconds, 420);
  clock.runNext();
  assert.equal(game.getState().status, 'complete');
});

test('lane choices are bounded and ignored outside active movement', () => {
  const clock = createFakeClock();
  const game = createLaneDodgeGame({
    obstaclePattern: [0],
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });

  assert.equal(game.chooseLane(2).playerLane, 1);
  game.start();
  assert.equal(game.chooseLane(2).playerLane, 2);
  assert.equal(game.chooseLane(3).playerLane, 2);
  finishWave(game, clock);
  assert.equal(game.chooseLane(0).playerLane, 2);
});

test('reduced motion uses slower discrete obstacle steps without changing scoring', () => {
  const clock = createFakeClock();
  const game = createLaneDodgeGame({
    obstaclePattern: [0],
    reducedMotion: true,
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });

  game.start();
  assert.equal(clock.nextMilliseconds, 650);
  game.chooseLane(2);
  finishWave(game, clock);
  assert.equal(game.getState().feedback, 'clear');
  assert.equal(game.getState().score, 100);
  assert.equal(game.getState().reducedMotion, true);
  assert.equal(clock.nextMilliseconds, 300);
});

test('reset and destroy cancel movement and feedback timers safely', () => {
  const clock = createFakeClock();
  const game = createLaneDodgeGame({
    obstaclePattern: [0, 2],
    setTimeoutFn: clock.setTimeoutFn,
    clearTimeoutFn: clock.clearTimeoutFn
  });

  game.start();
  assert.equal(clock.activeTimeouts, 1);
  game.reset();
  assert.equal(clock.activeTimeouts, 0);
  assert.equal(game.getState().status, 'idle');

  game.start();
  game.chooseLane(1);
  finishWave(game, clock);
  assert.equal(clock.activeTimeouts, 1);
  game.destroy();
  assert.equal(clock.activeTimeouts, 0);
  assert.ok(clock.clearedTimeouts.length >= 2);
});

test('Lane Guard reuses strict social-loop state and rejects scores over 600', () => {
  const url = new URL(createSharedResultUrl(
    400,
    18,
    'https://example.com/arena/?unsafe=1#old',
    'lane-guard'
  ));
  const parsed = parseSharedResultHash(url.hash);
  assert.deepEqual(parsed, {
    version: 1,
    challengeId: 'lane-guard',
    taps: 400,
    durationSeconds: 18
  });
  const invitation = createFriendAttemptInvitation(parsed);
  assert.equal(invitation.challengeTitle, 'Lane Guard');
  assert.equal(createComparisonSummary(500, invitation).message, '100 points ahead.');
  assert.equal(parseSharedResultHash('#v=1&challenge=lane-guard&score=601&duration=18'), null);
  assert.throws(
    () => createSharedResultUrl(601, 18, 'https://example.com/', 'lane-guard'),
    /must not exceed 600/
  );
});

test('dodge UI uses native controls, text feedback, reduced motion, and build synchronization', () => {
  const lane = readFileSync('lane-guard.js', 'utf8');
  const bootstrap = readFileSync('catalog-bootstrap.js', 'utf8');
  const build = readFileSync('scripts/build.js', 'utf8');
  assert.match(bootstrap, /Object\.freeze = nativeFreeze/);
  assert.match(lane, /board\.setAttribute\('role', 'group'\)/);
  assert.match(lane, /button\.type = 'button'/);
  assert.match(lane, /laneNames = \['Left', 'Center', 'Right'\]/);
  assert.match(lane, /Collision in the/);
  assert.match(lane, /data-mode="lane-guard"\]\[data-feedback="clear"\]/);
  assert.match(lane, /data-mode="lane-guard"\]\[data-feedback="hit"\]/);
  assert.match(lane, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(lane, /\.lane-guard-obstacle \{ transition: none; \}/);
  assert.match(lane, /min-height: 3rem/);
  assert.match(lane, /laneGame\.destroy\(\)/);
  assert.match(build, /'catalog-bootstrap\.js'/);
  assert.match(build, /'lane-guard\.js'/);
});
