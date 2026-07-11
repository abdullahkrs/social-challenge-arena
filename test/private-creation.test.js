const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const {
  privateDurations,
  normalizePrivateTitle,
  createPrivateChallenge,
  createPrivateResultUrl,
  parsePrivateResultHash,
  createPrivateComparison,
  createPrivateComparisonShareUrl
} = require('../private.js');

test('private title and duration are strictly bounded', () => {
  assert.deepEqual(privateDurations, [10, 20, 30]);
  assert.equal(normalizePrivateTitle('  Family   Tap  '), 'Family Tap');
  assert.deepEqual(createPrivateChallenge('Office Battle 2', 30), {
    id: 'private-tap',
    title: 'Office Battle 2',
    category: 'Private',
    difficulty: 'Custom',
    durationSeconds: 30,
    instruction: 'Tap fast until time runs out.'
  });

  for (const title of ['', 'ab', 'bad!', 'a'.repeat(25), '<script>']) {
    assert.throws(() => normalizePrivateTitle(title), /3–24|text/);
  }
  for (const duration of [0, 15, 45, 300, 'abc']) {
    assert.throws(() => createPrivateChallenge('Safe Name', duration), /duration/);
  }
});

test('private result links round-trip only normalized safe state', () => {
  const url = new URL(createPrivateResultUrl(
    'Family Tap',
    42,
    20,
    'https://example.com/create.html?unsafe=1#old'
  ));

  assert.equal(url.search, '');
  assert.deepEqual(parsePrivateResultHash(url.hash), {
    version: 1,
    title: 'Family Tap',
    targetTaps: 42,
    durationSeconds: 20
  });
});

test('private result parsing rejects malformed and expanded state', () => {
  const invalidHashes = [
    '',
    '#v=2&title=Family+Tap&score=42&duration=20',
    '#v=1&title=ab&score=42&duration=20',
    '#v=1&title=Family%21&score=42&duration=20',
    '#v=1&title=Family++Tap&score=42&duration=20',
    '#v=1&title=Family+Tap&score=-1&duration=20',
    '#v=1&title=Family+Tap&score=1000001&duration=20',
    '#v=1&title=Family+Tap&score=42&duration=15',
    '#v=1&title=Family+Tap&score=42&duration=20&extra=1',
    '#v=1&title=Family+Tap&title=Other&score=42&duration=20'
  ];

  for (const hash of invalidHashes) assert.equal(parsePrivateResultHash(hash), null);
  assert.throws(
    () => createPrivateResultUrl('Family Tap', 42, 20, 'javascript:alert(1)'),
    /HTTP or HTTPS/
  );
});

test('friend comparison validates shape and promotes the friend score', () => {
  const shared = {
    version: 1,
    title: 'Family Tap',
    targetTaps: 40,
    durationSeconds: 20
  };
  const comparison = createPrivateComparison(47, shared);

  assert.deepEqual(comparison, {
    title: 'Family Tap',
    targetTaps: 40,
    friendTaps: 47,
    durationSeconds: 20,
    difference: 7,
    outcome: 'beat',
    headline: 'You beat it',
    message: '7 taps ahead.'
  });

  const sharedAgain = new URL(createPrivateComparisonShareUrl(
    comparison,
    'https://example.com/create.html'
  ));
  assert.deepEqual(parsePrivateResultHash(sharedAgain.hash), {
    version: 1,
    title: 'Family Tap',
    targetTaps: 47,
    durationSeconds: 20
  });

  assert.throws(
    () => createPrivateComparison(47, { ...shared, extra: true }),
    /invalid shape/
  );
  assert.throws(
    () => createPrivateComparisonShareUrl({ ...comparison, friendTaps: 99 }, 'https://example.com/'),
    /inconsistent/
  );
});

test('creation page exposes one compact safe form and the full private loop', () => {
  const index = readFileSync('index.html', 'utf8');
  const html = readFileSync('create.html', 'utf8');
  const css = readFileSync('private.css', 'utf8');
  const script = readFileSync('private.js', 'utf8');

  assert.match(index, /href="create\.html"[^>]*>Create private challenge</);
  assert.match(html, /id="private-form"[^>]*novalidate/);
  assert.match(html, /id="private-title"[^>]*minlength="3"[^>]*maxlength="24"/);
  assert.match(html, /id="private-duration"[\s\S]*value="10"[\s\S]*value="20"[\s\S]*value="30"/);
  assert.match(html, /id="private-share-result"[^>]*>Share private challenge</);
  assert.match(html, /id="private-share-again"[^>]*>Share your score</);
  assert.match(css, /\.private-field input,[\s\S]*min-width: 0/);
  assert.match(css, /min-height: 3rem/);
  assert.match(script, /createTapSprintGame\(/);
  assert.match(script, /textContent =/);
  assert.doesNotMatch(script, /innerHTML|eval\(|new Function|localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest/);

  const finalViewEnd = html.lastIndexOf('</section>');
  for (const id of [
    'private-invite-announcement',
    'private-result-announcement',
    'private-comparison-announcement'
  ]) {
    assert.ok(html.indexOf(`id="${id}"`) > finalViewEnd, `${id} must remain outside hidden views`);
  }
});