'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const rendererPath = path.resolve(__dirname, '../../src/game/flight-renderer.js');
const rendererApi = require(rendererPath);

class FakeStyle {
  constructor() {
    this.values = new Map();
  }

  setProperty(name, value) {
    this.values.set(name, String(value));
  }

  removeProperty(name) {
    const value = this.values.get(name) || '';
    this.values.delete(name);
    return value;
  }

  getPropertyValue(name) {
    return this.values.get(name) || '';
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = String(tagName).toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.style = new FakeStyle();
    this.className = '';
    this._textContent = '';
  }

  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index < 0) throw new Error('Child not found.');
    this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  setAttribute(name, value) {
    this.attributes.set(String(name), String(value));
  }

  getAttribute(name) {
    return this.attributes.has(String(name)) ? this.attributes.get(String(name)) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(String(name));
  }

  removeAttribute(name) {
    this.attributes.delete(String(name));
  }

  set textContent(value) {
    this._textContent = String(value);
    for (const child of this.children) child.parentNode = null;
    this.children = [];
  }

  get textContent() {
    return this._textContent;
  }

  set innerHTML(_) {
    throw new Error('innerHTML is forbidden in the fake DOM.');
  }

  get innerHTML() {
    throw new Error('innerHTML is forbidden in the fake DOM.');
  }
}

class FakeDocument {
  constructor() {
    this.created = [];
  }

  createElement(tagName) {
    const element = new FakeElement(tagName, this);
    this.created.push(element);
    return element;
  }
}

function createHarness(options = {}) {
  const document = new FakeDocument();
  const worldLayer = document.createElement('div');
  const entityLayer = document.createElement('div');
  const effectsLayer = document.createElement('div');
  const hudLayer = document.createElement('div');
  const statusLayer = document.createElement('p');
  statusLayer.textContent = options.initialStatus || '';

  const renderer = rendererApi.createFlightRenderer({
    worldLayer,
    entityLayer,
    effectsLayer,
    hudLayer,
    statusLayer,
    reducedMotion: options.reducedMotion || false
  });

  return { document, worldLayer, entityLayer, effectsLayer, hudLayer, statusLayer, renderer };
}

function validSnapshot(overrides = {}) {
  return {
    player: { left: 0.18, right: 0.27, top: 0.42, bottom: 0.5 },
    obstacles: [
      { id: 1, left: 0.62, right: 0.73, gapTop: 0.28, gapBottom: 0.68 }
    ],
    score: 4,
    outcome: 'active',
    events: {},
    announcement: 'Score four',
    ...overrides
  };
}

function findByClass(root, className) {
  const matches = [];
  const visit = (node) => {
    if (String(node.className).split(/\s+/).includes(className)) matches.push(node);
    for (const child of node.children) visit(child);
  };
  visit(root);
  return matches;
}

function allNodes(...roots) {
  const seen = [];
  const visit = (node) => {
    seen.push(node);
    for (const child of node.children) visit(child);
  };
  for (const root of roots) visit(root);
  return seen;
}

test('exports equivalent frozen APIs for CommonJS and browser globals', () => {
  const source = fs.readFileSync(rendererPath, 'utf8');
  const context = { globalThis: {} };
  vm.runInNewContext(source, context, { filename: 'flight-renderer.js' });

  assert.deepEqual(Object.keys(context.globalThis.SocialChallengeGameFlightRenderer), Object.keys(rendererApi));
  assert.equal(typeof rendererApi.createFlightRenderer, 'function');
  assert.ok(Object.isFrozen(rendererApi));
});

test('validates all construction capabilities before mounting nodes', () => {
  const document = new FakeDocument();
  const layer = document.createElement('div');
  const broken = { ownerDocument: document, style: new FakeStyle() };

  assert.throws(() => rendererApi.createFlightRenderer({
    worldLayer: broken,
    entityLayer: layer,
    effectsLayer: layer,
    hudLayer: layer,
    statusLayer: layer
  }), /appendChild/);
  assert.equal(layer.children.length, 0);
});

test('mounts one bounded scene and maps normalized geometry to percentage transforms', () => {
  const harness = createHarness();
  harness.renderer.render(validSnapshot());

  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  const obstacle = findByClass(harness.worldLayer, 'flight-renderer-obstacle')[0];
  const score = findByClass(harness.hudLayer, 'flight-renderer-score')[0];

  assert.equal(player.style.getPropertyValue('--flight-player-left'), '18%');
  assert.equal(player.style.getPropertyValue('--flight-player-top'), '42%');
  assert.equal(player.style.getPropertyValue('--flight-player-width'), '9%');
  assert.equal(player.style.getPropertyValue('--flight-player-height'), '8%');
  assert.equal(obstacle.style.getPropertyValue('--flight-obstacle-left'), '62%');
  assert.equal(obstacle.style.getPropertyValue('--flight-obstacle-width'), '11%');
  assert.equal(obstacle.style.getPropertyValue('--flight-gap-top'), '28%');
  assert.equal(obstacle.style.getPropertyValue('--flight-gap-bottom'), '68%');
  assert.equal(score.textContent, '4');
  assert.equal(harness.statusLayer.textContent, 'Score four');
});

test('rejects a complete invalid snapshot without partial DOM or state mutation', () => {
  const harness = createHarness();
  harness.renderer.render(validSnapshot());
  const beforeState = harness.renderer.getState();
  const beforeNodes = allNodes(harness.worldLayer, harness.entityLayer, harness.effectsLayer, harness.hudLayer);
  const beforeText = beforeNodes.map((node) => node.textContent);
  const beforeChildren = beforeNodes.map((node) => [...node.children]);

  assert.throws(() => harness.renderer.render(validSnapshot({
    player: { left: 0.4, right: 0.3, top: 0.2, bottom: 0.3 },
    score: 1000,
    obstacles: [{ id: 2, left: 0.4, right: 0.5, gapTop: 0.8, gapBottom: 0.2 }]
  })), /score/);

  assert.deepEqual(harness.renderer.getState(), beforeState);
  assert.deepEqual(beforeNodes.map((node) => node.textContent), beforeText);
  assert.deepEqual(beforeNodes.map((node) => [...node.children]), beforeChildren);
});

test('reuses typed stable IDs, preserves snapshot order, and removes stale obstacles', () => {
  const harness = createHarness();
  harness.renderer.render(validSnapshot({ obstacles: [
    { id: 1, left: 0.1, right: 0.2, gapTop: 0.2, gapBottom: 0.7 },
    { id: '1', left: 0.3, right: 0.4, gapTop: 0.25, gapBottom: 0.72 }
  ] }));
  const firstNodes = findByClass(harness.worldLayer, 'flight-renderer-obstacle');
  assert.equal(firstNodes.length, 2);
  assert.notEqual(firstNodes[0], firstNodes[1]);

  harness.renderer.render(validSnapshot({ obstacles: [
    { id: '1', left: 0.32, right: 0.42, gapTop: 0.26, gapBottom: 0.71 },
    { id: 1, left: 0.12, right: 0.22, gapTop: 0.21, gapBottom: 0.69 }
  ] }));
  const reordered = findByClass(harness.worldLayer, 'flight-renderer-obstacle');
  assert.equal(reordered[0], firstNodes[1]);
  assert.equal(reordered[1], firstNodes[0]);

  harness.renderer.render(validSnapshot({ obstacles: [
    { id: '1', left: 0.5, right: 0.6, gapTop: 0.3, gapBottom: 0.74 }
  ] }));
  const finalNodes = findByClass(harness.worldLayer, 'flight-renderer-obstacle');
  assert.deepEqual(finalNodes, [firstNodes[1]]);
  assert.equal(firstNodes[0].parentNode, null);
});

test('rejects sparse, duplicate, excessive, and invalid obstacle snapshots', () => {
  const harness = createHarness();
  const sparse = [];
  sparse.length = 1;
  assert.throws(() => harness.renderer.render(validSnapshot({ obstacles: sparse })), /sparse/);
  assert.throws(() => harness.renderer.render(validSnapshot({ obstacles: [
    { id: 1, left: 0.1, right: 0.2, gapTop: 0.2, gapBottom: 0.7 },
    { id: 1, left: 0.3, right: 0.4, gapTop: 0.2, gapBottom: 0.7 }
  ] })), /duplicate/);
  assert.throws(() => harness.renderer.render(validSnapshot({ obstacles: Array.from({ length: 257 }, (_, id) => ({
    id, left: 0.1, right: 0.2, gapTop: 0.2, gapBottom: 0.7
  })) })), /cannot exceed/);
  assert.throws(() => harness.renderer.render(validSnapshot({ obstacles: [
    { id: {}, left: 0.1, right: 0.2, gapTop: 0.2, gapBottom: 0.7 }
  ] })), /id/);
});

test('enforces score bounds and explicit outcomes', () => {
  const harness = createHarness();
  harness.renderer.render(validSnapshot({ score: 0, outcome: 'active' }));
  harness.renderer.render(validSnapshot({ score: 999, outcome: 'failed' }));
  assert.equal(harness.renderer.getState().snapshot.score, 999);
  assert.equal(harness.renderer.getState().snapshot.outcome, 'failed');
  assert.throws(() => harness.renderer.render(validSnapshot({ score: -1 })), /score/);
  assert.throws(() => harness.renderer.render(validSnapshot({ outcome: 'finished' })), /outcome/);
});

test('presents exactly three token-driven bounded feedback paths without node growth', () => {
  const harness = createHarness();
  const first = validSnapshot({
    score: 5,
    outcome: 'failed',
    events: { impulse: 1, score: 1, failure: 1 }
  });
  harness.renderer.render(first);

  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  assert.equal(player.getAttribute('data-flight-feedback'), 'impulse');
  assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-score-pop').length, 1);
  assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-failure-impact').length, 1);
  assert.equal(harness.renderer.getState().transientCount, 2);

  for (let token = 2; token <= 50; token += 1) {
    harness.renderer.render(validSnapshot({
      score: Math.min(999, token),
      outcome: 'failed',
      events: { impulse: token, score: token, failure: token }
    }));
    assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-score-pop').length, 1);
    assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-failure-impact').length, 1);
    assert.equal(harness.renderer.getState().transientCount, 2);
  }

  assert.throws(() => harness.renderer.render(validSnapshot({ events: { impulse: 49 } })), /monotonic/);
});

test('copies announcements only through textContent and never interprets markup', () => {
  const harness = createHarness();
  const unsafeLooking = '<img src=x onerror=alert(1)> & score';
  harness.renderer.render(validSnapshot({ announcement: unsafeLooking }));
  assert.equal(harness.statusLayer.textContent, unsafeLooking);
});

test('explicit reduced motion preserves geometry, score, failure, and announcement while suppressing effects', () => {
  const harness = createHarness({ reducedMotion: true });
  harness.renderer.render(validSnapshot({
    score: 9,
    outcome: 'failed',
    announcement: 'Failed at nine',
    events: { impulse: 1, score: 1, failure: 1 }
  }));

  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  const scene = findByClass(harness.entityLayer, 'flight-renderer-scene')[0];
  assert.equal(scene.getAttribute('data-flight-reduced-motion'), 'true');
  assert.equal(player.hasAttribute('data-flight-feedback'), false);
  assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-score-pop').length, 0);
  assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-failure-impact').length, 0);
  assert.equal(player.style.getPropertyValue('--flight-player-left'), '18%');
  assert.equal(findByClass(harness.hudLayer, 'flight-renderer-score')[0].textContent, '9');
  assert.equal(scene.getAttribute('data-flight-outcome'), 'failed');
  assert.equal(harness.statusLayer.textContent, 'Failed at nine');

  const style = findByClass(harness.worldLayer, 'flight-renderer-style')[0].textContent;
  assert.match(style, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(style, /\.flight-renderer-/);
});

test('reset returns a neutral bounded mounted scene and clears tokens and transient nodes', () => {
  const harness = createHarness();
  harness.renderer.render(validSnapshot({ events: { impulse: 3, score: 4, failure: 5 }, outcome: 'failed' }));
  const state = harness.renderer.reset();
  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];

  assert.equal(state.obstacleCount, 0);
  assert.equal(state.transientCount, 0);
  assert.equal(state.snapshot, null);
  assert.deepEqual(state.lastTokens, { impulse: null, score: null, failure: null });
  assert.equal(player.style.getPropertyValue('--flight-player-left'), '20%');
  assert.equal(player.style.getPropertyValue('--flight-player-top'), '46%');
  assert.equal(findByClass(harness.hudLayer, 'flight-renderer-score')[0].textContent, '0');
  assert.equal(harness.statusLayer.textContent, '');
});

test('destroy removes only renderer-created nodes, restores status text, and is idempotent', () => {
  const harness = createHarness({ initialStatus: 'Original status' });
  const callerWorldNode = harness.document.createElement('div');
  harness.worldLayer.appendChild(callerWorldNode);
  harness.renderer.render(validSnapshot({ announcement: 'Changed' }));

  const first = harness.renderer.destroy();
  const second = harness.renderer.destroy();

  assert.equal(first.destroyed, true);
  assert.deepEqual(second, first);
  assert.deepEqual(harness.worldLayer.children, [callerWorldNode]);
  assert.equal(harness.entityLayer.children.length, 0);
  assert.equal(harness.effectsLayer.children.length, 0);
  assert.equal(harness.hudLayer.children.length, 0);
  assert.equal(harness.statusLayer.textContent, 'Original status');
  assert.throws(() => harness.renderer.render(validSnapshot()), /destroyed/);
});

test('returns deeply immutable fresh state and isolates caller mutation', () => {
  const harness = createHarness();
  const input = validSnapshot({ events: { impulse: 1 } });
  harness.renderer.render(input);
  input.player.left = 0.9;
  input.obstacles[0].left = 0.9;
  input.events.impulse = 99;

  const state = harness.renderer.getState();
  assert.equal(state.snapshot.player.left, 0.18);
  assert.equal(state.snapshot.obstacles[0].left, 0.62);
  assert.equal(state.snapshot.events.impulse, 1);
  assert.ok(Object.isFrozen(state));
  assert.ok(Object.isFrozen(state.snapshot));
  assert.ok(Object.isFrozen(state.snapshot.player));
  assert.ok(Object.isFrozen(state.snapshot.obstacles));
  assert.ok(Object.isFrozen(state.snapshot.obstacles[0]));
  assert.equal(Reflect.set(state.snapshot.player, 'left', 0.8), false);
  assert.notEqual(harness.renderer.getState(), state);
});

test('keeps DOM counts bounded through repeated render and reset cycles', () => {
  const harness = createHarness();
  for (let cycle = 0; cycle < 100; cycle += 1) {
    harness.renderer.render(validSnapshot({
      obstacles: Array.from({ length: 12 }, (_, index) => ({
        id: `${cycle % 3}:${index}`,
        left: index / 20,
        right: index / 20 + 0.04,
        gapTop: 0.2,
        gapBottom: 0.72
      })),
      score: cycle % 100,
      outcome: cycle % 4 === 0 ? 'failed' : 'active',
      events: { impulse: cycle, score: cycle, failure: cycle }
    }));
    assert.equal(harness.renderer.getState().obstacleCount, 12);
    assert.ok(allNodes(harness.worldLayer, harness.entityLayer, harness.effectsLayer, harness.hudLayer).length <= 64);
    harness.renderer.reset();
    assert.equal(harness.renderer.getState().obstacleCount, 0);
    assert.ok(allNodes(harness.worldLayer, harness.entityLayer, harness.effectsLayer, harness.hudLayer).length <= 28);
  }
});

test('does not use loops, listeners, timers, observers, network, storage, URL, or analytics side effects', () => {
  const source = fs.readFileSync(rendererPath, 'utf8');
  const forbidden = [
    'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'setInterval',
    'addEventListener', 'removeEventListener', 'MutationObserver', 'ResizeObserver',
    'fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'location.',
    'history.', 'navigator.sendBeacon', 'innerHTML'
  ];
  for (const token of forbidden) assert.equal(source.includes(token), false, `Unexpected side effect token: ${token}`);
});
