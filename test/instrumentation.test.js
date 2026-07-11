const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const {
  privacySafeEventNames,
  createPrivacySafeMetrics,
  attachPrivacySafeInstrumentation
} = require('../metrics.js');

class FakeElement {
  constructor({ hidden = false, textContent = '' } = {}) {
    this.hidden = hidden;
    this.textContent = textContent;
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  click() {
    for (const listener of this.listeners.get('click') || []) listener({ type: 'click', target: this });
  }
}

class FakeMutationObserver {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    this.observed = [];
    FakeMutationObserver.instances.push(this);
  }

  observe(target, options) {
    this.observed.push({ target, options });
  }

  static reset() {
    FakeMutationObserver.instances = [];
  }

  static notify(target, type = 'attributes') {
    for (const observer of FakeMutationObserver.instances) {
      if (observer.observed.some(observation => observation.target === target)) {
        observer.callback([{ target, type, attributeName: type === 'attributes' ? 'hidden' : null }]);
      }
    }
  }
}

function createFakeDocument({ friendVisible = false } = {}) {
  const elements = {
    '#friend-view': new FakeElement({ hidden: !friendVisible }),
    '#discovery-view': new FakeElement({ hidden: friendVisible }),
    '#result-view': new FakeElement({ hidden: true }),
    '#comparison-view': new FakeElement({ hidden: true }),
    '#start-friend-attempt': new FakeElement(),
    '#start-challenge': new FakeElement(),
    '#share-result': new FakeElement(),
    '#share-again': new FakeElement(),
    '#share-status': new FakeElement(),
    '#comparison-share-status': new FakeElement()
  };

  return {
    elements,
    documentObject: {
      querySelector(selector) { return elements[selector] || null; }
    }
  };
}

test('privacy-safe metrics keep only frozen aggregate allowlisted counts', () => {
  const metrics = createPrivacySafeMetrics();

  assert.equal(metrics.track('challenge_viewed'), true);
  assert.equal(metrics.track('challenge_viewed'), true);
  assert.equal(metrics.track('user_email'), false);

  const snapshot = metrics.snapshot();
  assert.deepEqual(Object.keys(snapshot), privacySafeEventNames);
  assert.equal(snapshot.challenge_viewed, 2);
  assert.equal('user_email' in snapshot, false);
  assert.equal('timestamp' in snapshot, false);
  assert.equal('url' in snapshot, false);
  assert.equal('score' in snapshot, false);
  assert.ok(Object.isFrozen(snapshot));
});

test('ordinary loop instrumentation counts views, completion, and successful sharing once per transition', () => {
  FakeMutationObserver.reset();
  const { elements, documentObject } = createFakeDocument();
  const metrics = attachPrivacySafeInstrumentation(documentObject, {
    MutationObserverCtor: FakeMutationObserver
  });

  assert.equal(metrics.snapshot().challenge_viewed, 1);

  elements['#start-challenge'].click();
  elements['#result-view'].hidden = false;
  FakeMutationObserver.notify(elements['#result-view']);
  elements['#share-result'].click();
  elements['#share-status'].textContent = 'Link copied.';
  FakeMutationObserver.notify(elements['#share-status'], 'childList');
  FakeMutationObserver.notify(elements['#share-status'], 'childList');

  assert.deepEqual(metrics.snapshot(), {
    challenge_viewed: 1,
    challenge_started: 1,
    challenge_completed: 1,
    result_viewed: 1,
    share_attempted: 1,
    share_completed: 1,
    shared_link_opened: 0,
    friend_completed: 0,
    comparison_viewed: 0,
    share_again_attempted: 0
  });
});

test('friend loop instrumentation counts shared entry, comparison, and share-again without identity data', () => {
  FakeMutationObserver.reset();
  const { elements, documentObject } = createFakeDocument({ friendVisible: true });
  const metrics = attachPrivacySafeInstrumentation(documentObject, {
    MutationObserverCtor: FakeMutationObserver
  });

  elements['#start-friend-attempt'].click();
  elements['#comparison-view'].hidden = false;
  FakeMutationObserver.notify(elements['#comparison-view']);
  elements['#share-again'].click();
  elements['#comparison-share-status'].textContent = 'Shared.';
  FakeMutationObserver.notify(elements['#comparison-share-status'], 'childList');

  assert.deepEqual(metrics.snapshot(), {
    challenge_viewed: 0,
    challenge_started: 1,
    challenge_completed: 1,
    result_viewed: 0,
    share_attempted: 0,
    share_completed: 1,
    shared_link_opened: 1,
    friend_completed: 1,
    comparison_viewed: 1,
    share_again_attempted: 1
  });
});

test('instrumentation is loaded after application code and contains no persistence or network sink', () => {
  const html = readFileSync('index.html', 'utf8');
  const metricsSource = readFileSync('metrics.js', 'utf8');
  const buildSource = readFileSync('scripts/build.js', 'utf8');

  assert.match(html, /src="app\.js" defer><\/script>[\s\S]*src="metrics\.js" defer><\/script>/);
  assert.match(buildSource, /'metrics\.js'/);
  assert.doesNotMatch(metricsSource, /localStorage|sessionStorage|document\.cookie|fetch\(|sendBeacon|XMLHttpRequest/);
  assert.doesNotMatch(metricsSource, /Date\.now|new Date|location\.|window\.location/);
});
