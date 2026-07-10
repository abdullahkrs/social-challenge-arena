const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TapChallenge, buildResultMessage, getResultTitle } = require('../app.js');

test('tap challenge starts at zero and scores valid taps', () => {
  const challenge = new TapChallenge(10000);
  challenge.start(1000);
  assert.equal(challenge.score, 0);
  assert.equal(challenge.tap(1001), true);
  assert.equal(challenge.tap(5000), true);
  assert.equal(challenge.score, 2);
});

test('tap challenge rejects taps at and after the deadline', () => {
  const challenge = new TapChallenge(10000);
  challenge.start(1000);
  assert.equal(challenge.tap(11000), false);
  assert.equal(challenge.tap(11001), false);
  assert.equal(challenge.score, 0);
  assert.equal(challenge.active, false);
});

test('starting again resets the score and timer', () => {
  const challenge = new TapChallenge(10000);
  challenge.start(1000);
  challenge.tap(1001);
  challenge.start(5000);
  assert.equal(challenge.score, 0);
  assert.equal(challenge.remainingMs(5000), 10000);
});

test('result titles reward higher scores with deterministic tiers', () => {
  assert.equal(getResultTitle(10), 'Fast Starter');
  assert.equal(getResultTitle(30), 'Rapid Tapper');
  assert.equal(getResultTitle(55), 'Tap Machine');
  assert.equal(getResultTitle(80), 'Lightning Hands');
});

test('result message is ready for a later sharing action', () => {
  assert.equal(buildResultMessage(42), 'I scored 42 taps in 10 seconds. Can you beat me?');
});
