const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { featuredChallenge } = require('../app.js');

test('featured challenge metadata is complete and bounded', () => {
  assert.equal(featuredChallenge.id, 'tap-sprint');
  assert.equal(featuredChallenge.title, 'Tap Sprint');
  assert.equal(featuredChallenge.category, 'Speed');
  assert.equal(featuredChallenge.difficulty, 'Easy');
  assert.equal(featuredChallenge.durationSeconds, 20);
  assert.ok(featuredChallenge.description.length > 0);
  assert.ok(featuredChallenge.goal.length > 0);
});

test('landing page exposes friend entry, discovery, gameplay, result, and share states', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /id="friend-view"[^>]*hidden/);
  assert.match(html, /id="start-friend-attempt"/);
  assert.match(html, /id="dismiss-friend-attempt"/);
  assert.match(html, /Pick\. Play\. Compete\./);
  assert.match(html, /Tap Sprint/);
  assert.match(html, /id="start-challenge"/);
  assert.match(html, /id="challenge-view"[^>]*hidden/);
  assert.match(html, /id="tap-button"/);
  assert.match(html, /id="result-view"[^>]*hidden/);
  assert.match(html, /id="share-result"/);
  assert.doesNotMatch(html, /\b(compare|comparison|winner|won|lost|tie)\b/i);
});
