const { test } = require('node:test');
const assert = require('node:assert/strict');
const { TapChallenge } = require('../app.js');

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
