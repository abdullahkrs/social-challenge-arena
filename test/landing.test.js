const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { featuredChallenge, toggleChallengeDetails } = require('../app.js');

test('featured challenge metadata is complete and bounded', () => {
  assert.equal(featuredChallenge.id, 'tap-sprint');
  assert.equal(featuredChallenge.title, 'Tap Sprint');
  assert.equal(featuredChallenge.category, 'Speed');
  assert.equal(featuredChallenge.difficulty, 'Easy');
  assert.equal(featuredChallenge.durationSeconds, 20);
  assert.ok(featuredChallenge.description.length > 0);
  assert.ok(featuredChallenge.goal.length > 0);
});

test('landing page exposes one clear discovery action', () => {
  const html = readFileSync('index.html', 'utf8');
  assert.match(html, /Pick\. Play\. Compete\./);
  assert.match(html, /Tap Sprint/);
  assert.match(html, /id="discover-challenge"/);
  assert.match(html, /aria-controls="challenge-details"/);
  assert.doesNotMatch(html, /share|compare|score/i);
});

test('discovery action toggles details and accessible state', () => {
  const attributes = new Map();
  const button = {
    textContent: 'View challenge',
    setAttribute(name, value) { attributes.set(name, value); }
  };
  const details = { hidden: true };

  assert.equal(toggleChallengeDetails(button, details), true);
  assert.equal(details.hidden, false);
  assert.equal(attributes.get('aria-expanded'), 'true');
  assert.equal(button.textContent, 'Hide details');

  assert.equal(toggleChallengeDetails(button, details), false);
  assert.equal(details.hidden, true);
  assert.equal(attributes.get('aria-expanded'), 'false');
  assert.equal(button.textContent, 'View challenge');
});
