const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const nativeFreeze = Object.freeze;
const { installCatalogBootstrap } = require('../catalog-bootstrap.js');
installCatalogBootstrap();
const core = require('../app.js');
const { extendAppExports } = require('../lane-guard.js');
const {
  curatedChallenges,
  getChallengeById,
  createSharedResultUrl,
  parseSharedResultHash,
  createFriendAttemptInvitation
} = extendAppExports(core);

test('catalog bootstrap restores Object.freeze and adds genuine mechanic variety', () => {
  assert.equal(Object.freeze, nativeFreeze);
  assert.ok(curatedChallenges.length >= 6);
  assert.ok(Object.isFrozen(curatedChallenges));
  assert.equal(new Set(curatedChallenges.map(challenge => challenge.id)).size, curatedChallenges.length);
  assert.deepEqual(
    [...new Set(curatedChallenges.map(challenge => challenge.category))].sort(),
    ['Dodge', 'Endurance', 'Memory', 'Rhythm', 'Speed', 'Timing']
  );
  assert.deepEqual(
    [...new Set(curatedChallenges.map(challenge => challenge.difficulty))].sort(),
    ['Easy', 'Hard']
  );
  assert.deepEqual(
    [...new Set(curatedChallenges.map(challenge => challenge.mechanic || 'tap'))].sort(),
    ['center-snap', 'lane-dodge', 'signal-echo', 'tap']
  );

  for (const challenge of curatedChallenges) {
    assert.ok(Object.isFrozen(challenge));
    assert.match(challenge.id, /^[a-z0-9-]+$/);
    assert.ok(challenge.title.length > 0);
    assert.ok(challenge.description.length > 0);
    assert.ok(challenge.goal.length > 0);
    assert.ok(challenge.instruction.length > 0);
    assert.ok(Number.isInteger(challenge.durationSeconds));
    assert.ok(challenge.durationSeconds >= 10 && challenge.durationSeconds <= 45);
    assert.equal(getChallengeById(challenge.id), challenge);
  }

  assert.equal(getChallengeById('unknown'), null);
});

test('every curated challenge round-trips through the validated friend link', () => {
  for (const challenge of curatedChallenges) {
    const url = new URL(createSharedResultUrl(
      42,
      challenge.durationSeconds,
      'https://example.com/arena/?unsafe=1#old',
      challenge.id
    ));
    const parsed = parseSharedResultHash(url.hash);

    assert.deepEqual(parsed, {
      version: 1,
      challengeId: challenge.id,
      taps: 42,
      durationSeconds: challenge.durationSeconds
    });
    assert.deepEqual(createFriendAttemptInvitation(parsed), {
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      targetTaps: 42,
      durationSeconds: challenge.durationSeconds
    });
  }
});

test('shared state rejects known challenges with a mismatched duration', () => {
  assert.equal(
    parseSharedResultHash('#v=1&challenge=turbo-tap&score=42&duration=20'),
    null
  );
  assert.throws(
    () => createSharedResultUrl(42, 20, 'https://example.com/', 'turbo-tap'),
    /selected challenge/
  );
});

test('discovery keeps one primary action and loads the focused adapter in order', () => {
  const html = readFileSync('index.html', 'utf8');
  const css = readFileSync('styles.css', 'utf8');
  const app = readFileSync('app.js', 'utf8');

  assert.match(html, /id="challenge-list"[^>]*role="group"[^>]*aria-label="Choose a challenge"/);
  assert.match(html, /id="selected-title">Tap Sprint</);
  assert.match(html, /id="start-challenge"[^>]*>Play Tap Sprint</);
  assert.match(html, /catalog-bootstrap\.js[\s\S]*app\.js[\s\S]*lane-guard\.js[\s\S]*metrics\.js/);
  assert.match(css, /\.challenge-grid[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.challenge-option[\s\S]*min-width: 0/);
  assert.match(app, /for \(const challenge of curatedChallenges\)/);
  assert.match(app, /createSharedResultUrl\([\s\S]*activeChallenge\.id/);
});
