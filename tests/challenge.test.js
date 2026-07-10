const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  TapChallenge,
  buildResultMessage,
  buildShareData,
  buildShareUrl,
  getResultTitle,
  normalizeShareScore,
  shareOrCopyResult,
} = require('../app.js');

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

test('result message is ready for sharing action', () => {
  assert.equal(buildResultMessage(42), 'I scored 42 taps in 10 seconds. Can you beat me?');
});

test('share score is bounded and integer-only', () => {
  assert.equal(normalizeShareScore(-1), 0);
  assert.equal(normalizeShareScore(42.9), 42);
  assert.equal(normalizeShareScore(1200), 999);
  assert.equal(normalizeShareScore('not-a-score'), 0);
});

test('share url uses URL APIs and carries minimal challenge state', () => {
  const url = new URL(buildShareUrl(42, 'https://abdullahkrs.github.io/social-challenge-arena/?old=true#frag'));
  assert.equal(url.origin, 'https://abdullahkrs.github.io');
  assert.equal(url.pathname, '/social-challenge-arena/');
  assert.equal(url.searchParams.get('challenge'), 'tap-10s');
  assert.equal(url.searchParams.get('score'), '42');
  assert.equal(url.searchParams.has('old'), false);
  assert.equal(url.hash, '');
});

test('share data includes title text and canonical url', () => {
  const shareData = buildShareData(8, 'https://abdullahkrs.github.io/social-challenge-arena/');
  assert.equal(shareData.title, '10-Second Tap Sprint');
  assert.equal(shareData.text, 'I scored 8 taps in 10 seconds. Can you beat me?');
  assert.equal(shareData.url, 'https://abdullahkrs.github.io/social-challenge-arena/?challenge=tap-10s&score=8');
});

test('share result uses native share when available', async () => {
  let shared;
  const result = await shareOrCopyResult(9, {
    href: 'https://abdullahkrs.github.io/social-challenge-arena/',
    navigator: { share: async (data) => { shared = data; } },
  });
  assert.equal(result.ok, true);
  assert.equal(result.method, 'native');
  assert.equal(shared.url, 'https://abdullahkrs.github.io/social-challenge-arena/?challenge=tap-10s&score=9');
});

test('share result falls back to clipboard copy', async () => {
  let copied = '';
  const result = await shareOrCopyResult(7, {
    href: 'https://abdullahkrs.github.io/social-challenge-arena/',
    navigator: {},
    clipboard: { writeText: async (value) => { copied = value; } },
  });
  assert.equal(result.ok, true);
  assert.equal(result.method, 'copy');
  assert.match(copied, /I scored 7 taps/);
  assert.match(copied, /challenge=tap-10s&score=7/);
});

test('share result reports unavailable copy support', async () => {
  const result = await shareOrCopyResult(7, {
    href: 'https://abdullahkrs.github.io/social-challenge-arena/',
    navigator: {},
  });
  assert.equal(result.ok, false);
  assert.equal(result.method, 'unavailable');
});
