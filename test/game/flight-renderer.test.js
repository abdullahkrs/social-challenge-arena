'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rendererPath = path.join(__dirname, '../../src/game/flight-renderer.js');
const rendererSource = fs.readFileSync(rendererPath, 'utf8');
const api = require(rendererPath);

class FakeStyle {
  constructor() {
    this.values = new Map();
  }

  setProperty(name, value) {
    this.values.set(name, String(value));
  }

  getPropertyValue(name) {
    return this.values.get(name) || '';
  }

  removeProperty(name) {
    const previous = this.getPropertyValue(name);
    this.values.delete(name);
    return previous;
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
    this.children = [];
    this.attributes = new Map();
    this.style = new FakeStyle();
    this.className = '';
    this.textContent = '';
  }

  appendChild(child) {
    if (!child || typeof child !== 'object') throw new TypeError('child is required');
    if (child.parentNode) child.parentNode.removeChild(child);
    this.children.push(child);
    child.parentNode = this;
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index < 0) throw new Error('child not found');
    this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  get innerHTML() {
    throw new Error('innerHTML must not be read');
  }

  set innerHTML(_value) {
    throw new Error('innerHTML must not be written');
  }
}

class FakeDocument {
  createElement(tagName) {
    return new FakeElement(tagName, this);
  }
}

function createHarness(options = {}) {
  const document = new FakeDocument();
  const worldLayer = document.createElement('div');
  const entityLayer = document.createElement('div');
  const effectsLayer = document.createElement('div');
  const hudLayer = document.createElement('div');
  const statusLayer = document.createElement('div');
  statusLayer.textContent = options.statusText || 'original';

  const renderer = api.createFlightRenderer({
    worldLayer,
    entityLayer,
    effectsLayer,
    hudLayer,
    statusLayer,
    reducedMotion: options.reducedMotion === true
  });

  return {
    document,
    worldLayer,
    entityLayer,
    effectsLayer,
    hudLayer,
    statusLayer,
    renderer
  };
}

function snapshot(overrides = {}) {
  return {
    player: { left: 0.18, right: 0.27, top: 0.37, bottom: 0.44 },
    obstacles: [
      { id: 'a', left: 0.62, right: 0.7, gapTop: 0.28, gapBottom: 0.63 }
    ],
    score: 4,
    outcome: api.FLIGHT_RENDER_OUTCOMES.ACTIVE,
    events: {},
    announcement: '',
    ...overrides
  };
}

function findByClass(root, className) {
  const result = [];
  const visit = (node) => {
    if (String(node.className).split(/\s+/).includes(className)) result.push(node);
    for (const child of node.children || []) visit(child);
  };
  visit(root);
  return result;
}

function countTree(root) {
  let count = 1;
  for (const child of root.children || []) count += countTree(child);
  return count;
}

test('exports the same frozen API through CommonJS and browser global paths', () => {
  assert.equal(typeof api.createFlightRenderer, 'function');
  assert.equal(api.MAX_FLIGHT_SCORE, 999);
  assert.equal(api.MAX_RENDERED_OBSTACLES, 256);
  assert.ok(Object.isFrozen(api));

  const sandbox = { globalThis: {} };
  vm.runInNewContext(rendererSource, sandbox, { filename: 'flight-renderer.js' });
  const browserApi = sandbox.globalThis.SocialChallengeGameFlightRenderer;
  assert.equal(typeof browserApi.createFlightRenderer, 'function');
  assert.deepEqual(
    Object.keys(browserApi).sort(),
    Object.keys(api).sort()
  );
});

test('validates constructor capabilities before mounting any renderer nodes', () => {
  const document = new FakeDocument();
  const layer = document.createElement('div');
  const status = document.createElement('div');
  const invalid = { ...layer, appendChild: null };

  assert.throws(() => api.createFlightRenderer({
    worldLayer: invalid,
    entityLayer: layer,
    effectsLayer: layer,
    hudLayer: layer,
    statusLayer: status
  }), /worldLayer must provide appendChild/);
  assert.equal(layer.children.length, 0);
});

test('rejects an invalid snapshot without partial DOM or state mutation', () => {
  const harness = createHarness();
  harness.renderer.render(snapshot({ score: 7, announcement: 'safe' }));
  const beforeState = harness.renderer.getState();
  const beforeWorldCount = countTree(harness.worldLayer);
  const beforeStatus = harness.statusLayer.textContent;

  assert.throws(() => harness.renderer.render(snapshot({
    player: { left: 0.4, right: 0.2, top: 0.1, bottom: 0.2 },
    score: 8,
    announcement: 'must not apply'
  })), /left must be less than/);

  assert.deepEqual(harness.renderer.getState(), beforeState);
  assert.equal(countTree(harness.worldLayer), beforeWorldCount);
  assert.equal(harness.statusLayer.textContent, beforeStatus);
});

test('maps normalized coordinates with scene-relative left/top properties', () => {
  const harness = createHarness();
  harness.renderer.render(snapshot());

  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  const obstacle = findByClass(harness.worldLayer, 'flight-renderer-obstacle')[0];
  const style = findByClass(harness.worldLayer, 'flight-renderer-style')[0];

  assert.equal(player.style.getPropertyValue('--flight-player-left'), '18%');
  assert.equal(player.style.getPropertyValue('--flight-player-top'), '37%');
  assert.equal(player.style.getPropertyValue('--flight-player-width'), '9%');
  assert.equal(player.style.getPropertyValue('--flight-player-height'), '7%');
  assert.equal(obstacle.style.getPropertyValue('--flight-obstacle-left'), '62%');
  assert.equal(obstacle.style.getPropertyValue('--flight-obstacle-width'), '8%');
  assert.match(style.textContent, /left: var\(--flight-player-left\)/);
  assert.match(style.textContent, /top: var\(--flight-player-top\)/);
  assert.match(style.textContent, /left: var\(--flight-obstacle-left\)/);
  assert.doesNotMatch(style.textContent, /translate3d\(var\(--flight-player-left\)/);
  assert.doesNotMatch(style.textContent, /translate3d\(var\(--flight-obstacle-left\)/);
});

test('preserves exact normalized player geometry at 320px including an edge placement', () => {
  const harness = createHarness();
  harness.renderer.render(snapshot({
    player: { left: 0.9, right: 0.99, top: 0.12, bottom: 0.19 }
  }));

  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  const style = findByClass(harness.worldLayer, 'flight-renderer-style')[0];
  const playfieldWidth = 280;
  const left = Number.parseFloat(player.style.getPropertyValue('--flight-player-left')) * playfieldWidth / 100;
  const width = Number.parseFloat(player.style.getPropertyValue('--flight-player-width')) * playfieldWidth / 100;
  const right = left + width;
  const playerRule = style.textContent.match(/\.flight-renderer-player \{([\s\S]*?)\n\}/)[1];

  assert.equal(Math.round(left * 10) / 10, 252);
  assert.equal(Math.round(width * 10) / 10, 25.2);
  assert.equal(Math.round(right * 10) / 10, 277.2);
  assert.ok(right <= playfieldWidth);
  assert.doesNotMatch(playerRule, /min-(?:width|height|inline-size|block-size)/);
});

test('reuses typed stable obstacle IDs, removes stale nodes, and preserves requested order', () => {
  const harness = createHarness();
  harness.renderer.render(snapshot({ obstacles: [
    { id: 1, left: 0.2, right: 0.25, gapTop: 0.2, gapBottom: 0.6 },
    { id: '1', left: 0.4, right: 0.45, gapTop: 0.25, gapBottom: 0.65 }
  ] }));

  const first = findByClass(harness.worldLayer, 'flight-renderer-obstacle');
  assert.equal(first.length, 2);
  assert.notEqual(first[0], first[1]);
  assert.equal(first[0].getAttribute('data-flight-obstacle-id'), 'number:1');
  assert.equal(first[1].getAttribute('data-flight-obstacle-id'), 'string:1');

  harness.renderer.render(snapshot({ obstacles: [
    { id: '1', left: 0.5, right: 0.56, gapTop: 0.22, gapBottom: 0.61 },
    { id: 2, left: 0.72, right: 0.78, gapTop: 0.3, gapBottom: 0.7 }
  ] }));

  const second = findByClass(harness.worldLayer, 'flight-renderer-obstacle');
  assert.equal(second.length, 2);
  assert.equal(second[0], first[1]);
  assert.notEqual(second[1], first[0]);
  assert.equal(first[0].parentNode, null);
  assert.equal(second[0].style.getPropertyValue('--flight-obstacle-left'), '50%');
});

test('enforces obstacle, duplicate-ID, and bounded-score contracts', () => {
  const harness = createHarness();
  const obstacles = Array.from({ length: api.MAX_RENDERED_OBSTACLES + 1 }, (_, index) => ({
    id: index,
    left: 0.1,
    right: 0.2,
    gapTop: 0.2,
    gapBottom: 0.7
  }));

  assert.throws(() => harness.renderer.render(snapshot({ obstacles })), /cannot exceed/);
  assert.throws(() => harness.renderer.render(snapshot({ score: 1000 })), /0 to 999/);
  assert.throws(() => harness.renderer.render(snapshot({ obstacles: [
    { id: 'x', left: 0.1, right: 0.2, gapTop: 0.2, gapBottom: 0.7 },
    { id: 'x', left: 0.3, right: 0.4, gapTop: 0.2, gapBottom: 0.7 }
  ] })), /duplicate id/);
});

test('replaces the player body for every new impulse token so feedback reliably restarts', () => {
  const harness = createHarness();
  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  const neutralBody = player.children[0];

  harness.renderer.render(snapshot({ events: { impulse: 1 } }));
  const firstImpulseBody = player.children[0];
  assert.notEqual(firstImpulseBody, neutralBody);
  assert.match(firstImpulseBody.className, /flight-renderer-player-body--impulse/);

  harness.renderer.render(snapshot({ events: { impulse: 2 } }));
  const secondImpulseBody = player.children[0];
  assert.notEqual(secondImpulseBody, firstImpulseBody);

  harness.renderer.render(snapshot({ events: { impulse: 4 } }));
  const jumpedTokenBody = player.children[0];
  assert.notEqual(jumpedTokenBody, secondImpulseBody);

  harness.renderer.render(snapshot({ events: { impulse: 4 } }));
  assert.equal(player.children[0], jumpedTokenBody);
  assert.equal(player.children.length, 1);
});

test('renders exactly the three bounded feedback paths without transient accumulation', () => {
  const harness = createHarness();

  for (let token = 1; token <= 40; token += 1) {
    harness.renderer.render(snapshot({
      score: token,
      outcome: token === 40 ? api.FLIGHT_RENDER_OUTCOMES.FAILED : api.FLIGHT_RENDER_OUTCOMES.ACTIVE,
      events: { impulse: token, score: token, failure: token }
    }));
    assert.equal(harness.renderer.getState().transientCount, 2);
    assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-score-pop').length, 1);
    assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-failure-impact').length, 1);
    assert.equal(findByClass(harness.entityLayer, 'flight-renderer-player-body').length, 1);
  }
});

test('copies announcements only through textContent and preserves markup as inert text', () => {
  const harness = createHarness();
  const announcement = '<img src=x onerror=alert(1)> score';
  harness.renderer.render(snapshot({ announcement }));
  assert.equal(harness.statusLayer.textContent, announcement);
});

test('system reduced-motion CSS hides retained score and failure overlays', () => {
  const harness = createHarness();
  harness.renderer.render(snapshot({
    score: 9,
    outcome: api.FLIGHT_RENDER_OUTCOMES.FAILED,
    events: { score: 1, failure: 1 }
  }));

  const style = findByClass(harness.worldLayer, 'flight-renderer-style')[0];
  assert.equal(harness.renderer.getState().transientCount, 2);
  assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-score-pop').length, 1);
  assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-failure-impact').length, 1);
  assert.match(
    style.textContent,
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\.flight-renderer-score-pop,\s*\.flight-renderer-failure-impact \{\s*display: none !important;\s*animation: none !important;\s*\}/
  );
});

test('reduced motion preserves geometry, score, outcome, and announcements while suppressing effects', () => {
  const harness = createHarness({ reducedMotion: true });
  harness.renderer.render(snapshot({
    score: 9,
    outcome: api.FLIGHT_RENDER_OUTCOMES.FAILED,
    announcement: 'failed',
    events: { impulse: 1, score: 1, failure: 1 }
  }));

  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  const playerBody = findByClass(harness.entityLayer, 'flight-renderer-player-body')[0];
  const entityRoot = findByClass(harness.entityLayer, 'flight-renderer-scene')[0];
  const hud = findByClass(harness.hudLayer, 'flight-renderer-score')[0];

  assert.equal(player.style.getPropertyValue('--flight-player-left'), '18%');
  assert.equal(player.style.getPropertyValue('--flight-player-top'), '37%');
  assert.equal(hud.textContent, '9');
  assert.equal(entityRoot.getAttribute('data-flight-outcome'), 'failed');
  assert.equal(harness.statusLayer.textContent, 'failed');
  assert.equal(playerBody.className, 'flight-renderer-player-body');
  assert.equal(harness.renderer.getState().transientCount, 0);
});

test('reset restores a neutral mounted scene and clears all mutable feedback state', () => {
  const harness = createHarness();
  harness.renderer.render(snapshot({
    score: 12,
    outcome: api.FLIGHT_RENDER_OUTCOMES.FAILED,
    announcement: 'done',
    events: { impulse: 3, score: 3, failure: 3 }
  }));

  const state = harness.renderer.reset();
  const player = findByClass(harness.entityLayer, 'flight-renderer-player')[0];
  const hud = findByClass(harness.hudLayer, 'flight-renderer-score')[0];

  assert.equal(state.snapshot, null);
  assert.equal(state.obstacleCount, 0);
  assert.equal(state.transientCount, 0);
  assert.deepEqual(state.lastTokens, { impulse: null, score: null, failure: null });
  assert.equal(player.style.getPropertyValue('--flight-player-left'), '20%');
  assert.equal(player.style.getPropertyValue('--flight-player-top'), '46%');
  assert.equal(hud.textContent, '0');
  assert.equal(harness.statusLayer.textContent, '');
});

test('destroy removes only renderer-owned nodes, restores status text, and is idempotent', () => {
  const harness = createHarness({ statusText: 'before' });
  const externalWorldNode = harness.document.createElement('div');
  harness.worldLayer.appendChild(externalWorldNode);
  harness.renderer.render(snapshot({ events: { impulse: 1, score: 1, failure: 1 } }));

  const first = harness.renderer.destroy();
  const second = harness.renderer.destroy();

  assert.equal(first.destroyed, true);
  assert.deepEqual(second, first);
  assert.equal(harness.worldLayer.children.length, 1);
  assert.equal(harness.worldLayer.children[0], externalWorldNode);
  assert.equal(harness.entityLayer.children.length, 0);
  assert.equal(harness.effectsLayer.children.length, 0);
  assert.equal(harness.hudLayer.children.length, 0);
  assert.equal(harness.statusLayer.textContent, 'before');
  assert.throws(() => harness.renderer.render(snapshot()), /destroyed/);
  assert.throws(() => harness.renderer.reset(), /destroyed/);
});

test('state snapshots are deeply frozen and isolated from caller mutation', () => {
  const harness = createHarness();
  const input = snapshot({
    player: { left: 0.1, right: 0.2, top: 0.3, bottom: 0.4 },
    obstacles: [{ id: 'stable', left: 0.5, right: 0.6, gapTop: 0.2, gapBottom: 0.7 }],
    events: { impulse: 1 }
  });
  const state = harness.renderer.render(input);

  input.player.left = 0.9;
  input.obstacles[0].left = 0.9;
  input.events.impulse = 99;

  assert.equal(state.snapshot.player.left, 0.1);
  assert.equal(state.snapshot.obstacles[0].left, 0.5);
  assert.equal(state.snapshot.events.impulse, 1);
  assert.ok(Object.isFrozen(state));
  assert.ok(Object.isFrozen(state.snapshot));
  assert.ok(Object.isFrozen(state.snapshot.player));
  assert.ok(Object.isFrozen(state.snapshot.obstacles));
  assert.ok(Object.isFrozen(state.snapshot.obstacles[0]));
  assert.ok(Object.isFrozen(state.snapshot.events));
});

test('100 render/reset cycles keep obstacle and transient DOM counts bounded', () => {
  const harness = createHarness();

  for (let cycle = 1; cycle <= 100; cycle += 1) {
    const obstacles = Array.from({ length: 12 }, (_, index) => ({
      id: index,
      left: 0.05 + index * 0.07,
      right: 0.09 + index * 0.07,
      gapTop: 0.2,
      gapBottom: 0.65
    }));
    harness.renderer.render(snapshot({
      obstacles,
      score: cycle % 100,
      events: { impulse: cycle, score: cycle, failure: cycle }
    }));

    assert.equal(harness.renderer.getState().obstacleCount, 12);
    assert.equal(harness.renderer.getState().transientCount, 2);
    assert.equal(findByClass(harness.worldLayer, 'flight-renderer-obstacle').length, 12);
    assert.equal(findByClass(harness.entityLayer, 'flight-renderer-player-body').length, 1);
    assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-score-pop').length, 1);
    assert.equal(findByClass(harness.effectsLayer, 'flight-renderer-failure-impact').length, 1);

    harness.renderer.reset();
    assert.equal(harness.renderer.getState().obstacleCount, 0);
    assert.equal(harness.renderer.getState().transientCount, 0);
  }
});

test('module contains no asynchronous, input, network, storage, URL, analytics, or unsafe HTML side effects', () => {
  for (const forbidden of [
    'addEventListener',
    'removeEventListener',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'setTimeout',
    'setInterval',
    'fetch(',
    'XMLHttpRequest',
    'localStorage',
    'sessionStorage',
    'location.',
    'history.',
    'innerHTML',
    'insertAdjacentHTML',
    'analytics'
  ]) {
    assert.equal(rendererSource.includes(forbidden), false, `unexpected side-effect token: ${forbidden}`);
  }
});
