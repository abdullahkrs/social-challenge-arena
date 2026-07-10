const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const html = readFileSync('index.html', 'utf8');

test('landing page communicates the social challenge promise', () => {
  assert.match(html, /Dare a friend in seconds/i);
  assert.match(html, /one link/i);
  assert.match(html, /Start the 10-second tap challenge/i);
});

test('landing page preserves the MVP viral loop steps', () => {
  for (const step of ['Play', 'Score', 'Share', 'Compare']) assert.match(html, new RegExp(step, 'i'));
});

test('landing page remains no-login for the MVP', () => {
  assert.match(html, /No login/i);
  assert.doesNotMatch(html, /sign in|required account|create account/i);
});

test('page includes the playable challenge controls', () => {
  assert.match(html, /10-Second Tap Sprint/i);
  assert.match(html, /id="start-game"/i);
  assert.match(html, /id="tap-button"/i);
});

test('page includes a focused result state with share and replay actions', () => {
  assert.match(html, /id="result-screen"/i);
  assert.match(html, /Challenge complete/i);
  assert.match(html, /id="result-message"/i);
  assert.match(html, /id="share-result"/i);
  assert.match(html, /id="share-status"/i);
  assert.match(html, /id="play-again"/i);
});
