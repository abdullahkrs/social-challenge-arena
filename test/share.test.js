const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createSharedResultUrl,
  parseSharedResultHash,
  shareResultLink
} = require('../app.js');

test('shared result URL is canonical, deterministic, and round-trips validated state', () => {
  const urlText = createSharedResultUrl(
    73,
    20,
    'https://example.com/game/?unsafe=1#old'
  );
  const url = new URL(urlText);

  assert.equal(url.origin, 'https://example.com');
  assert.equal(url.pathname, '/game/');
  assert.equal(url.search, '');
  assert.deepEqual(parseSharedResultHash(url.hash), {
    version: 1,
    challengeId: 'tap-sprint',
    taps: 73,
    durationSeconds: 20
  });
});

test('shared result state rejects malformed, duplicated, unsupported, or oversized input', () => {
  assert.equal(parseSharedResultHash('#v=1&challenge=tap-sprint&score=-1&duration=20'), null);
  assert.equal(parseSharedResultHash('#v=1&challenge=tap-sprint&score=1.5&duration=20'), null);
  assert.equal(parseSharedResultHash('#v=2&challenge=tap-sprint&score=10&duration=20'), null);
  assert.equal(parseSharedResultHash('#v=1&challenge=other&score=10&duration=20'), null);
  assert.equal(parseSharedResultHash('#v=1&challenge=tap-sprint&score=10&score=11&duration=20'), null);
  assert.equal(parseSharedResultHash('#v=1&challenge=tap-sprint&score=10&duration=20&extra=x'), null);
  assert.equal(parseSharedResultHash('#v=1&challenge=tap-sprint&score=1000001&duration=20'), null);
  assert.equal(parseSharedResultHash('#v=1&challenge=tap-sprint&score=10&duration=19'), null);
  assert.equal(parseSharedResultHash(`#${'x'.repeat(181)}`), null);
  assert.throws(() => createSharedResultUrl(10, 20, 'file:///tmp/index.html'), /HTTP or HTTPS/);
});

test('share action prefers Web Share and reports a completed share', async () => {
  let received = null;
  const outcome = await shareResultLink('https://example.com/#score', {
    navigatorObject: {
      async share(payload) { received = payload; }
    },
    text: 'Challenge me'
  });

  assert.equal(outcome, 'shared');
  assert.equal(received.text, 'Challenge me');
  assert.equal(received.url, 'https://example.com/#score');
});

test('share action falls back to clipboard and respects cancellation', async () => {
  let copied = null;
  const copiedOutcome = await shareResultLink('https://example.com/#score', {
    navigatorObject: {
      async share() { throw new Error('unsupported'); },
      clipboard: { async writeText(value) { copied = value; } }
    }
  });
  assert.equal(copiedOutcome, 'copied');
  assert.equal(copied, 'https://example.com/#score');

  const cancelledOutcome = await shareResultLink('https://example.com/#score', {
    navigatorObject: {
      async share() {
        const error = new Error('cancelled');
        error.name = 'AbortError';
        throw error;
      },
      clipboard: { async writeText() { throw new Error('must not copy after cancellation'); } }
    }
  });
  assert.equal(cancelledOutcome, 'cancelled');
});

test('share action reports unavailable when browser share and clipboard are absent', async () => {
  const outcome = await shareResultLink('https://example.com/#score', { navigatorObject: {} });
  assert.equal(outcome, 'unavailable');
});

test('share action rejects non-HTTP links before invoking browser APIs', async () => {
  let invoked = false;
  const outcome = await shareResultLink('javascript:alert(1)', {
    navigatorObject: {
      async share() { invoked = true; },
      clipboard: { async writeText() { invoked = true; } }
    }
  });

  assert.equal(outcome, 'unavailable');
  assert.equal(invoked, false);
});
