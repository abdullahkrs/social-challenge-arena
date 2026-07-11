const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { metricEventNames, createSessionMetrics } = require('../app.js');

test('session metrics use a frozen, explicit viral-loop allowlist', () => {
  assert.deepEqual(metricEventNames, [
    'challenge_viewed',
    'challenge_started',
    'challenge_completed',
    'result_viewed',
    'share_attempted',
    'share_completed',
    'shared_link_opened',
    'friend_completed',
    'comparison_viewed',
    'share_again_attempted',
    'share_again_completed'
  ]);
  assert.ok(Object.isFrozen(metricEventNames));
});

test('session metrics count events and emit only fixed non-identifying fields', () => {
  const dispatched = [];
  const metrics = createSessionMetrics({ dispatch: detail => dispatched.push(detail) });
  const first = metrics.record('challenge_viewed');
  const second = metrics.record('challenge_viewed');
  metrics.record('share_attempted');

  assert.deepEqual(first, { name: 'challenge_viewed', challengeId: 'tap-sprint', count: 1 });
  assert.deepEqual(second, { name: 'challenge_viewed', challengeId: 'tap-sprint', count: 2 });
  assert.deepEqual(Object.keys(first), ['name', 'challengeId', 'count']);
  assert.ok(Object.isFrozen(first));
  assert.equal(dispatched.length, 3);
  assert.equal(metrics.snapshot().challenge_viewed, 2);
  assert.equal(metrics.snapshot().share_attempted, 1);
  assert.ok(Object.isFrozen(metrics.snapshot()));
});

test('unsupported events are rejected and dispatch failures cannot break the loop', () => {
  const metrics = createSessionMetrics({ dispatch() { throw new Error('listener failed'); } });
  assert.throws(() => metrics.record('score_73'), /not allowlisted/);
  assert.equal(metrics.snapshot().challenge_viewed, 0);
  assert.doesNotThrow(() => metrics.record('challenge_viewed'));
  assert.equal(metrics.snapshot().challenge_viewed, 1);
});

test('loop wiring records milestones without persistence, network, scores, URLs, or free text', () => {
  const app = readFileSync('app.js', 'utf8');
  for (const name of metricEventNames) assert.match(app, new RegExp(`metrics\\.record\\('${name}'\\)`));
  assert.doesNotMatch(app, /localStorage|sessionStorage|document\.cookie|sendBeacon|fetch\s*\(/);
  assert.match(app, /Object\.freeze\(\{\s*name,\s*challengeId: featuredChallenge\.id,\s*count: counts\[name\]/);
  assert.doesNotMatch(app, /metrics\.record\([^)]*(taps|score|url|message)/i);
});
