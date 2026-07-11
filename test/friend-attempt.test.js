const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const {
  createFriendAttemptInvitation,
  clearSharedResultHash,
  parseSharedResultHash
} = require('../app.js');

test('friend invitation is frozen and contains only validated challenge context', () => {
  const shared = parseSharedResultHash('#v=1&challenge=tap-sprint&score=73&duration=20');
  const invitation = createFriendAttemptInvitation(shared);

  assert.deepEqual(invitation, {
    challengeId: 'tap-sprint',
    challengeTitle: 'Tap Sprint',
    targetTaps: 73,
    durationSeconds: 20
  });
  assert.ok(Object.isFrozen(invitation));
  assert.equal('outcome' in invitation, false);
  assert.equal('comparison' in invitation, false);
});

test('friend invitation rejects malformed, unsupported, extra, or oversized state', () => {
  assert.throws(() => createFriendAttemptInvitation(null), /required/);
  assert.throws(() => createFriendAttemptInvitation({
    version: 1,
    challengeId: 'tap-sprint',
    taps: 10,
    durationSeconds: 20,
    extra: 'unsafe'
  }), /invalid shape/);
  assert.throws(() => createFriendAttemptInvitation({
    version: 2,
    challengeId: 'tap-sprint',
    taps: 10,
    durationSeconds: 20
  }), /unsupported/);
  assert.throws(() => createFriendAttemptInvitation({
    version: 1,
    challengeId: 'other',
    taps: 10,
    durationSeconds: 20
  }), /unsupported/);
  assert.throws(() => createFriendAttemptInvitation({
    version: 1,
    challengeId: 'tap-sprint',
    taps: 1000001,
    durationSeconds: 20
  }), /must not exceed/);
});

test('shared result cleanup removes only the fragment and preserves a safe path and query', () => {
  let replacement = null;
  const historyObject = {
    replaceState(state, title, url) {
      assert.equal(state, null);
      assert.equal(title, '');
      replacement = url;
    }
  };

  assert.equal(clearSharedResultHash({ pathname: '/arena/', search: '?mode=quick' }, historyObject), true);
  assert.equal(replacement, '/arena/?mode=quick');
  assert.equal(clearSharedResultHash(null, historyObject), false);
  assert.equal(clearSharedResultHash({ pathname: 'javascript:alert(1)', search: 'unsafe=1' }, historyObject), true);
  assert.equal(replacement, '/');
  assert.equal(clearSharedResultHash({ pathname: '//evil.example', search: '' }, historyObject), true);
  assert.equal(replacement, '/');
  assert.equal(clearSharedResultHash({ pathname: '/arena/', search: '' }, {
    replaceState() { throw new Error('blocked'); }
  }), false);
});

test('friend entry is accessible, mobile-safe, and stops before comparison', () => {
  const html = readFileSync('index.html', 'utf8');
  const css = readFileSync('styles.css', 'utf8');
  const app = readFileSync('app.js', 'utf8');

  assert.match(html, /id="friend-view"[^>]*aria-labelledby="friend-title"[^>]*hidden/);
  assert.match(html, /id="friend-target-score"/);
  assert.match(html, /id="friend-announcement"[^>]*aria-live="polite"/);
  assert.match(html, /id="start-friend-attempt"[^>]*>Try to beat it</);
  assert.match(html, /id="dismiss-friend-attempt"[^>]*>Browse challenges</);
  assert.match(css, /\.friend-target strong[\s\S]*overflow-wrap: anywhere/);
  assert.match(css, /\.primary-action,[\s\S]*min-height: 3rem/);
  assert.match(app, /friendTargetScore\.textContent = String\(invitation\.targetTaps\)/);
  assert.match(app, /startFriendButton\.addEventListener\('click', startAttempt\)/);
  assert.match(app, /dismissFriendButton\.addEventListener\('click', returnToDiscovery\)/);
  assert.doesNotMatch(app, /\b(winner|winMessage|lossMessage|comparisonView)\b/);
});
