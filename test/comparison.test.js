const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const {
  createComparisonSummary,
  createComparisonShareUrl,
  createFriendAttemptInvitation,
  parseSharedResultHash
} = require('../app.js');

function invitation(targetTaps = 50) {
  return createFriendAttemptInvitation(
    parseSharedResultHash(`#v=1&challenge=tap-sprint&score=${targetTaps}&duration=20`)
  );
}

test('comparison deterministically covers beat, tie, and short outcomes', () => {
  const beat = createComparisonSummary(52, invitation(50));
  const tie = createComparisonSummary(50, invitation(50));
  const short = createComparisonSummary(49, invitation(50));

  assert.deepEqual(beat, {
    challengeId: 'tap-sprint',
    challengeTitle: 'Tap Sprint',
    targetTaps: 50,
    friendTaps: 52,
    durationSeconds: 20,
    difference: 2,
    outcome: 'beat',
    headline: 'You beat it',
    message: '2 taps ahead.'
  });
  assert.equal(tie.outcome, 'tie');
  assert.equal(tie.message, 'Both scored 50 taps.');
  assert.equal(short.outcome, 'short');
  assert.equal(short.difference, -1);
  assert.equal(short.message, '1 tap short.');
  assert.ok(Object.isFrozen(beat));
});

test('comparison rejects malformed scores and unvalidated invitation state', () => {
  assert.throws(() => createComparisonSummary(-1, invitation()), /non-negative integer/);
  assert.throws(() => createComparisonSummary(10, null), /required/);
  assert.throws(() => createComparisonSummary(10, {
    challengeId: 'tap-sprint',
    challengeTitle: 'Tap Sprint',
    targetTaps: 50,
    durationSeconds: 20,
    extra: 'unsafe'
  }), /invalid shape/);
  assert.throws(() => createComparisonSummary(10, {
    challengeId: 'other',
    challengeTitle: 'Tap Sprint',
    targetTaps: 50,
    durationSeconds: 20
  }), /unsupported/);
  assert.throws(() => createComparisonSummary(1000001, invitation()), /must not exceed/);
});

test('share-again URL promotes the validated friend score as the next target', () => {
  const comparison = createComparisonSummary(57, invitation(50));
  const url = new URL(createComparisonShareUrl(
    comparison,
    'https://example.com/arena/?unsafe=1#old'
  ));

  assert.equal(url.origin, 'https://example.com');
  assert.equal(url.pathname, '/arena/');
  assert.equal(url.search, '');
  assert.deepEqual(parseSharedResultHash(url.hash), {
    version: 1,
    challengeId: 'tap-sprint',
    taps: 57,
    durationSeconds: 20
  });
});

test('share-again rejects missing, extra, or inconsistent comparison state', () => {
  const comparison = createComparisonSummary(57, invitation(50));

  assert.throws(() => createComparisonShareUrl(null, 'https://example.com/'), /required/);
  assert.throws(() => createComparisonShareUrl({ ...comparison, extra: 'unsafe' }, 'https://example.com/'), /invalid shape/);
  assert.throws(() => createComparisonShareUrl({ ...comparison, friendTaps: 58 }, 'https://example.com/'), /inconsistent/);
  assert.throws(() => createComparisonShareUrl(comparison, 'file:///tmp/index.html'), /HTTP or HTTPS/);
});

test('friend completion opens an accessible mobile-safe comparison with share-again', () => {
  const html = readFileSync('index.html', 'utf8');
  const css = readFileSync('styles.css', 'utf8');
  const app = readFileSync('app.js', 'utf8');

  assert.match(html, /id="comparison-view"[^>]*aria-labelledby="comparison-title"[^>]*hidden/);
  assert.match(html, /id="comparison-target-score"/);
  assert.match(html, /id="comparison-friend-score"/);
  assert.match(html, /id="comparison-announcement"[^>]*aria-live="polite"/);
  assert.match(html, /id="comparison-share-status"[^>]*aria-live="polite"/);
  assert.match(html, /id="comparison-share-fallback"[^>]*hidden>Open score link</);
  assert.match(html, /id="share-again"[^>]*>Share your score</);
  assert.match(html, /id="comparison-replay"[^>]*>Try again</);
  assert.match(html, /id="comparison-back"[^>]*>Challenges</);
  assert.match(css, /\.comparison-scores[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.comparison-score strong[\s\S]*overflow-wrap: anywhere/);
  assert.match(css, /\.share-fallback[\s\S]*overflow-wrap: anywhere/);
  assert.match(app, /if \(activeFriendInvitation\)[\s\S]*showComparison\(createComparisonSummary/);
  assert.match(app, /comparisonShareButton\.focus\(\)/);
  assert.match(app, /comparisonShareButton\.addEventListener\('click', shareCompletedComparison\)/);
  assert.match(app, /createComparisonShareUrl\(completedComparison, canonicalLink\.href\)/);
  assert.match(app, /completedComparison\.friendTaps/);
});
