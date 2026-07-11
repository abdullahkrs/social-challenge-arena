const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createResultSummary } = require('../app.js');

test('result summary validates the completed score and returns deterministic feedback', () => {
  const zero = createResultSummary(0, 20);
  const steady = createResultSummary(20, 20);
  const strong = createResultSummary(50, 20);
  const fast = createResultSummary(80, 20);

  assert.deepEqual(zero, {
    taps: 0,
    durationSeconds: 20,
    message: 'Try again and build your rhythm.'
  });
  assert.equal(steady.message, 'Good start. A steadier rhythm can raise it.');
  assert.equal(strong.message, 'Strong pace. Try again and push it higher.');
  assert.equal(fast.message, 'Fast finish. Can you beat this score?');
  assert.ok(Object.isFrozen(fast));
});

test('result summary rejects malformed score or duration values', () => {
  assert.throws(() => createResultSummary(-1, 20), /non-negative integer/);
  assert.throws(() => createResultSummary(2.5, 20), /non-negative integer/);
  assert.throws(() => createResultSummary(10, 0), /1 to 300 seconds/);
  assert.throws(() => createResultSummary(10, 301), /1 to 300 seconds/);
});

test('result view presents the score with replay and discovery actions', () => {
  const html = readFileSync('index.html', 'utf8');

  assert.match(html, /id="result-score"/);
  assert.match(html, /id="result-message"/);
  assert.match(html, /id="result-announcement"[^>]*aria-live="polite"/);
  assert.match(html, /id="result-replay"[^>]*>Play again</);
  assert.match(html, /id="result-back"[^>]*>Challenges</);
});
