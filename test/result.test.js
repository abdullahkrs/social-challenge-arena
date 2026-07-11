const test = require('node:test');
const assert = require('node:assert/strict');
const {
  featuredChallenge,
  createResultSummary,
  createTapSprintResult
} = require('../app.js');

test('completed tap sprint state creates a reusable result summary', () => {
  const result = createTapSprintResult({
    status: 'complete',
    taps: 64,
    remainingSeconds: 0,
    durationSeconds: 20
  });

  assert.deepEqual(result, {
    challengeId: 'tap-sprint',
    challengeTitle: 'Tap Sprint',
    score: 64,
    unit: 'taps',
    message: 'Fast run. Go again?'
  });
});

test('invalid or incomplete result data is rejected safely', () => {
  assert.equal(createTapSprintResult({ status: 'running', taps: 10 }), null);
  assert.equal(createTapSprintResult({ status: 'complete', taps: -1 }), null);
  assert.equal(createResultSummary({
    challenge: featuredChallenge,
    score: Number.NaN,
    unit: 'taps',
    message: 'Invalid'
  }), null);
});

test('completion opens the result view and replay starts a clean attempt', () => {
  let intervalCallback = null;

  class FakeElement {
    constructor() {
      this.hidden = false;
      this.disabled = false;
      this.textContent = '';
      this.listeners = new Map();
      this.focused = false;
    }

    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    }

    click() {
      const listener = this.listeners.get('click');
      if (listener) listener();
    }

    focus() {
      this.focused = true;
    }
  }

  const ids = [
    'discovery-view',
    'challenge-view',
    'result-view',
    'start-challenge',
    'tap-button',
    'back-to-challenges',
    'time-value',
    'tap-count',
    'game-status',
    'result-title',
    'result-score',
    'result-unit',
    'result-message',
    'replay-challenge',
    'result-back-to-challenges'
  ];
  const elements = Object.fromEntries(ids.map(id => [id, new FakeElement()]));
  elements['challenge-view'].hidden = true;
  elements['result-view'].hidden = true;

  const originalDocument = global.document;
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;

  global.document = {
    querySelector(selector) {
      return elements[selector.slice(1)] || null;
    }
  };
  global.setInterval = callback => {
    intervalCallback = callback;
    return 7;
  };
  global.clearInterval = () => {};

  delete require.cache[require.resolve('../app.js')];
  require('../app.js');

  elements['start-challenge'].click();
  elements['tap-button'].click();
  elements['tap-button'].click();
  for (let second = 0; second < 20; second += 1) intervalCallback();

  assert.equal(elements['challenge-view'].hidden, true);
  assert.equal(elements['result-view'].hidden, false);
  assert.equal(elements['result-title'].textContent, 'Tap Sprint');
  assert.equal(elements['result-score'].textContent, '2');
  assert.equal(elements['result-unit'].textContent, 'taps');
  assert.equal(elements['replay-challenge'].focused, true);

  elements['replay-challenge'].click();

  assert.equal(elements['result-view'].hidden, true);
  assert.equal(elements['challenge-view'].hidden, false);
  assert.equal(elements['tap-count'].textContent, '0');
  assert.equal(elements['tap-button'].disabled, false);

  global.document = originalDocument;
  global.setInterval = originalSetInterval;
  global.clearInterval = originalClearInterval;
  delete require.cache[require.resolve('../app.js')];
});
