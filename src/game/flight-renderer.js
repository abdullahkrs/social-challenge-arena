(function exposeFlightRenderer(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialChallengeGameFlightRenderer = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createFlightRendererApi() {
  'use strict';

  const FLIGHT_RENDER_OUTCOMES = Object.freeze({
    ACTIVE: 'active',
    FAILED: 'failed'
  });

  const MAX_FLIGHT_SCORE = 999;
  const MAX_RENDERED_OBSTACLES = 256;
  const MAX_STRING_ID_LENGTH = 128;
  const EVENT_NAMES = Object.freeze(['impulse', 'score', 'failure']);

  const SCOPED_STYLES = `
.flight-renderer-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: #f8fafc;
  --flight-player-left: 20%;
  --flight-player-top: 46%;
  --flight-player-width: 9%;
  --flight-player-height: 7%;
}
.flight-renderer-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 74% 18%, rgba(253, 230, 138, 0.5) 0 5%, transparent 5.5%),
    linear-gradient(180deg, #172554 0%, #1e3a8a 48%, #0f766e 100%);
}
.flight-renderer-horizon {
  position: absolute;
  inset: auto -8% -2% -8%;
  height: 24%;
  border-radius: 50% 50% 0 0;
  background: linear-gradient(180deg, #164e63, #083344);
  opacity: 0.94;
}
.flight-renderer-obstacle {
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--flight-obstacle-width);
  transform: translate3d(var(--flight-obstacle-left), 0, 0);
}
.flight-renderer-obstacle-cap {
  position: absolute;
  left: 0;
  width: 100%;
  background: linear-gradient(90deg, #f59e0b, #f97316 58%, #c2410c);
  border: max(1px, 0.25vw) solid rgba(255, 255, 255, 0.45);
  box-shadow: inset 0 0 0 max(1px, 0.3vw) rgba(120, 53, 15, 0.35);
}
.flight-renderer-obstacle-cap::after {
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  height: min(0.45rem, 2.5%);
  background: rgba(255, 255, 255, 0.24);
}
.flight-renderer-obstacle-cap--top {
  top: 0;
  height: var(--flight-gap-top);
  border-radius: 0 0 0.7rem 0.7rem;
}
.flight-renderer-obstacle-cap--top::after { bottom: 5%; }
.flight-renderer-obstacle-cap--bottom {
  top: var(--flight-gap-bottom);
  bottom: 0;
  border-radius: 0.7rem 0.7rem 0 0;
}
.flight-renderer-obstacle-cap--bottom::after { top: 5%; }
.flight-renderer-player {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--flight-player-width);
  height: var(--flight-player-height);
  min-width: 1.75rem;
  min-height: 1.35rem;
  transform: translate3d(var(--flight-player-left), var(--flight-player-top), 0);
  transform-origin: 50% 50%;
}
.flight-renderer-player-core {
  position: absolute;
  inset: 16% 8% 16% 10%;
  border-radius: 48% 58% 50% 42%;
  background: linear-gradient(135deg, #f8fafc 0 38%, #67e8f9 39% 69%, #0891b2 70%);
  box-shadow: 0 0.35rem 0.8rem rgba(8, 145, 178, 0.38);
}
.flight-renderer-player-wing {
  position: absolute;
  left: 34%;
  bottom: -4%;
  width: 46%;
  height: 42%;
  border-radius: 80% 10% 70% 20%;
  background: #fde68a;
  transform: skewX(-18deg);
}
.flight-renderer-player-spark {
  position: absolute;
  right: 78%;
  top: 36%;
  width: 42%;
  height: 28%;
  border-radius: 999px 0 0 999px;
  background: linear-gradient(90deg, transparent, #fb7185 58%, #fef3c7);
  opacity: 0.86;
}
.flight-renderer-player[data-flight-feedback="impulse"] {
  animation: flight-renderer-impulse 220ms cubic-bezier(.2,.9,.3,1);
}
.flight-renderer-score {
  display: inline-grid;
  min-width: 2.75rem;
  min-height: 2.75rem;
  place-items: center;
  padding: 0.3rem 0.6rem;
  border: 1px solid rgba(255,255,255,0.42);
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.72);
  color: #f8fafc;
  font-variant-numeric: tabular-nums;
  font-size: clamp(1.25rem, 7vw, 2rem);
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 0.5rem 1.5rem rgba(2,6,23,0.28);
}
.flight-renderer-score-pop,
.flight-renderer-failure-impact {
  position: absolute;
  pointer-events: none;
}
.flight-renderer-score-pop {
  left: 50%;
  top: 16%;
  transform: translate(-50%, -50%);
  color: #fef08a;
  font-size: clamp(1.25rem, 8vw, 2.25rem);
  font-weight: 950;
  text-shadow: 0 0.18rem 0.45rem rgba(2, 6, 23, 0.7);
  animation: flight-renderer-score-pop 420ms ease-out both;
}
.flight-renderer-failure-impact {
  inset: 0;
  border: clamp(0.35rem, 2.5vw, 0.85rem) solid rgba(251, 113, 133, 0.78);
  box-shadow: inset 0 0 3rem rgba(225, 29, 72, 0.48);
  animation: flight-renderer-impact 360ms ease-out both;
}
.flight-renderer-scene[data-flight-outcome="failed"] .flight-renderer-player-core {
  filter: saturate(0.55) brightness(0.82);
}
@keyframes flight-renderer-impulse {
  45% { transform: translate3d(var(--flight-player-left), var(--flight-player-top), 0) rotate(-9deg) scale(1.08, 0.92); }
}
@keyframes flight-renderer-score-pop {
  0% { opacity: 0; transform: translate(-50%, 25%) scale(0.75); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -85%) scale(1.08); }
}
@keyframes flight-renderer-impact {
  0% { opacity: 0; transform: scale(1.04); }
  35% { opacity: 1; }
  100% { opacity: 0; transform: scale(1); }
}
.flight-renderer-scene[data-flight-reduced-motion="true"] .flight-renderer-player,
.flight-renderer-scene[data-flight-reduced-motion="true"] .flight-renderer-score-pop,
.flight-renderer-scene[data-flight-reduced-motion="true"] .flight-renderer-failure-impact {
  animation: none !important;
}
.flight-renderer-scene[data-flight-reduced-motion="true"] .flight-renderer-player-spark {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .flight-renderer-player,
  .flight-renderer-score-pop,
  .flight-renderer-failure-impact {
    animation: none !important;
  }
  .flight-renderer-player-spark { opacity: 0; }
}`;

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function requireMethod(value, name, owner) {
    if (!value || typeof value[name] !== 'function') {
      throw new TypeError(`${owner} must provide ${name}().`);
    }
  }

  function validateLayer(node, name) {
    requireMethod(node, 'appendChild', name);
    requireMethod(node, 'removeChild', name);
    requireMethod(node, 'setAttribute', name);
    requireMethod(node, 'removeAttribute', name);
    if (!node.style || typeof node.style.setProperty !== 'function') {
      throw new TypeError(`${name} must provide a mutable style declaration.`);
    }
    if (!node.ownerDocument || typeof node.ownerDocument.createElement !== 'function') {
      throw new TypeError(`${name} must provide ownerDocument.createElement().`);
    }
    return node;
  }

  function validateStatusNode(node) {
    if (!node || !('textContent' in node)) {
      throw new TypeError('statusLayer must provide textContent.');
    }
    return node;
  }

  function readNormalizedNumber(object, name, owner) {
    if (!Object.prototype.hasOwnProperty.call(object, name)) {
      throw new TypeError(`${owner}.${name} is required.`);
    }
    const value = object[name];
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError(`${owner}.${name} must be a finite normalized number from 0 to 1.`);
    }
    return value;
  }

  function normalizeBounds(bounds, owner) {
    if (!isObject(bounds)) throw new TypeError(`${owner} must be an object.`);
    const normalized = {
      left: readNormalizedNumber(bounds, 'left', owner),
      right: readNormalizedNumber(bounds, 'right', owner),
      top: readNormalizedNumber(bounds, 'top', owner),
      bottom: readNormalizedNumber(bounds, 'bottom', owner)
    };
    if (!(normalized.left < normalized.right)) {
      throw new RangeError(`${owner}.left must be less than ${owner}.right.`);
    }
    if (!(normalized.top < normalized.bottom)) {
      throw new RangeError(`${owner}.top must be less than ${owner}.bottom.`);
    }
    return normalized;
  }

  function normalizeId(id, owner) {
    if (typeof id === 'string') {
      if (id.trim().length === 0 || id.length > MAX_STRING_ID_LENGTH) {
        throw new RangeError(`${owner}.id must be a non-empty string of at most ${MAX_STRING_ID_LENGTH} characters.`);
      }
      return id;
    }
    if (typeof id === 'number' && Number.isSafeInteger(id) && id >= 0) return id;
    throw new TypeError(`${owner}.id must be a non-negative safe integer or non-empty string.`);
  }

  function idKey(id) {
    return `${typeof id}:${String(id)}`;
  }

  function normalizeObstacle(obstacle, index) {
    const owner = `snapshot.obstacles[${index}]`;
    if (!isObject(obstacle)) throw new TypeError(`${owner} must be an object.`);
    const normalized = {
      id: normalizeId(obstacle.id, owner),
      left: readNormalizedNumber(obstacle, 'left', owner),
      right: readNormalizedNumber(obstacle, 'right', owner),
      gapTop: readNormalizedNumber(obstacle, 'gapTop', owner),
      gapBottom: readNormalizedNumber(obstacle, 'gapBottom', owner)
    };
    if (!(normalized.left < normalized.right)) {
      throw new RangeError(`${owner}.left must be less than ${owner}.right.`);
    }
    if (!(normalized.gapTop < normalized.gapBottom)) {
      throw new RangeError(`${owner}.gapTop must be less than ${owner}.gapBottom.`);
    }
    return normalized;
  }

  function normalizeEvents(events, previousTokens) {
    if (events === undefined) return Object.freeze({});
    if (!isObject(events)) throw new TypeError('snapshot.events must be an object when provided.');

    const normalized = {};
    for (const name of EVENT_NAMES) {
      if (!Object.prototype.hasOwnProperty.call(events, name)) continue;
      const token = events[name];
      if (!Number.isSafeInteger(token) || token < 0) {
        throw new RangeError(`snapshot.events.${name} must be a non-negative safe integer.`);
      }
      if (previousTokens[name] !== null && token < previousTokens[name]) {
        throw new RangeError(`snapshot.events.${name} must be monotonic.`);
      }
      normalized[name] = token;
    }
    return Object.freeze(normalized);
  }

  function normalizeSnapshot(snapshot, previousTokens) {
    if (!isObject(snapshot)) throw new TypeError('Flight render snapshot must be an object.');
    if (!Array.isArray(snapshot.obstacles)) {
      throw new TypeError('snapshot.obstacles must be an array.');
    }
    if (snapshot.obstacles.length > MAX_RENDERED_OBSTACLES) {
      throw new RangeError(`snapshot.obstacles cannot exceed ${MAX_RENDERED_OBSTACLES} entries.`);
    }

    const outcome = snapshot.outcome;
    if (outcome !== FLIGHT_RENDER_OUTCOMES.ACTIVE && outcome !== FLIGHT_RENDER_OUTCOMES.FAILED) {
      throw new RangeError('snapshot.outcome must be active or failed.');
    }
    if (!Number.isSafeInteger(snapshot.score) || snapshot.score < 0 || snapshot.score > MAX_FLIGHT_SCORE) {
      throw new RangeError(`snapshot.score must be a safe integer from 0 to ${MAX_FLIGHT_SCORE}.`);
    }
    if (snapshot.announcement !== undefined && typeof snapshot.announcement !== 'string') {
      throw new TypeError('snapshot.announcement must be a string when provided.');
    }

    const seenIds = new Set();
    const obstacles = [];
    for (let index = 0; index < snapshot.obstacles.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(snapshot.obstacles, index)) {
        throw new TypeError('snapshot.obstacles must not contain sparse entries.');
      }
      const obstacle = normalizeObstacle(snapshot.obstacles[index], index);
      const key = idKey(obstacle.id);
      if (seenIds.has(key)) throw new RangeError(`snapshot.obstacles contains duplicate id ${String(obstacle.id)}.`);
      seenIds.add(key);
      obstacles.push(obstacle);
    }

    return Object.freeze({
      player: Object.freeze(normalizeBounds(snapshot.player, 'snapshot.player')),
      obstacles: Object.freeze(obstacles.map((obstacle) => Object.freeze(obstacle))),
      score: snapshot.score,
      outcome,
      events: normalizeEvents(snapshot.events, previousTokens),
      announcement: snapshot.announcement === undefined ? '' : snapshot.announcement
    });
  }

  function percent(value) {
    const rounded = Math.round(value * 1000000) / 10000;
    return `${rounded}%`;
  }

  function removeIfAttached(parent, child) {
    if (child && child.parentNode === parent) parent.removeChild(child);
  }

  function createFlightRenderer(options) {
    if (!isObject(options)) throw new TypeError('Flight renderer options must be an object.');

    const worldLayer = validateLayer(options.worldLayer, 'worldLayer');
    const entityLayer = validateLayer(options.entityLayer, 'entityLayer');
    const effectsLayer = validateLayer(options.effectsLayer, 'effectsLayer');
    const hudLayer = validateLayer(options.hudLayer, 'hudLayer');
    const statusLayer = validateStatusNode(options.statusLayer);
    const reducedMotion = options.reducedMotion === true;
    if (options.reducedMotion !== undefined && typeof options.reducedMotion !== 'boolean') {
      throw new TypeError('reducedMotion must be a boolean when provided.');
    }

    const documents = [worldLayer, entityLayer, effectsLayer, hudLayer].map((node) => node.ownerDocument);
    if (!documents.every((document) => document === documents[0])) {
      throw new TypeError('All renderer layers must share one ownerDocument.');
    }
    const document = documents[0];
    const originalStatusText = statusLayer.textContent;

    let destroyed = false;
    let lastSnapshot = null;
    let obstacleNodes = new Map();
    let lastTokens = { impulse: null, score: null, failure: null };
    let scorePopNode = null;
    let failureImpactNode = null;

    const styleNode = document.createElement('style');
    styleNode.className = 'flight-renderer-style';
    styleNode.textContent = SCOPED_STYLES;

    const worldRoot = document.createElement('div');
    worldRoot.className = 'flight-renderer-scene';
    worldRoot.setAttribute('data-flight-outcome', FLIGHT_RENDER_OUTCOMES.ACTIVE);
    worldRoot.setAttribute('data-flight-reduced-motion', reducedMotion ? 'true' : 'false');

    const skyNode = document.createElement('div');
    skyNode.className = 'flight-renderer-sky';
    const horizonNode = document.createElement('div');
    horizonNode.className = 'flight-renderer-horizon';
    worldRoot.appendChild(skyNode);
    worldRoot.appendChild(horizonNode);

    const entityRoot = document.createElement('div');
    entityRoot.className = 'flight-renderer-scene';
    entityRoot.setAttribute('data-flight-outcome', FLIGHT_RENDER_OUTCOMES.ACTIVE);
    entityRoot.setAttribute('data-flight-reduced-motion', reducedMotion ? 'true' : 'false');

    const playerNode = document.createElement('div');
    playerNode.className = 'flight-renderer-player';
    const playerCore = document.createElement('span');
    playerCore.className = 'flight-renderer-player-core';
    const playerWing = document.createElement('span');
    playerWing.className = 'flight-renderer-player-wing';
    const playerSpark = document.createElement('span');
    playerSpark.className = 'flight-renderer-player-spark';
    playerNode.appendChild(playerCore);
    playerNode.appendChild(playerWing);
    playerNode.appendChild(playerSpark);
    entityRoot.appendChild(playerNode);

    const effectsRoot = document.createElement('div');
    effectsRoot.className = 'flight-renderer-scene';
    effectsRoot.setAttribute('data-flight-outcome', FLIGHT_RENDER_OUTCOMES.ACTIVE);
    effectsRoot.setAttribute('data-flight-reduced-motion', reducedMotion ? 'true' : 'false');

    const hudRoot = document.createElement('div');
    hudRoot.className = 'flight-renderer-score';
    hudRoot.textContent = '0';

    worldLayer.appendChild(styleNode);
    worldLayer.appendChild(worldRoot);
    entityLayer.appendChild(entityRoot);
    effectsLayer.appendChild(effectsRoot);
    hudLayer.appendChild(hudRoot);

    function assertMounted() {
      if (destroyed) throw new Error('Flight renderer has been destroyed.');
    }

    function createObstacleNode(obstacle) {
      const node = document.createElement('div');
      node.className = 'flight-renderer-obstacle';
      node.setAttribute('data-flight-obstacle-id', idKey(obstacle.id));
      const top = document.createElement('span');
      top.className = 'flight-renderer-obstacle-cap flight-renderer-obstacle-cap--top';
      const bottom = document.createElement('span');
      bottom.className = 'flight-renderer-obstacle-cap flight-renderer-obstacle-cap--bottom';
      node.appendChild(top);
      node.appendChild(bottom);
      return node;
    }

    function applyPlayer(bounds) {
      playerNode.style.setProperty('--flight-player-left', percent(bounds.left));
      playerNode.style.setProperty('--flight-player-top', percent(bounds.top));
      playerNode.style.setProperty('--flight-player-width', percent(bounds.right - bounds.left));
      playerNode.style.setProperty('--flight-player-height', percent(bounds.bottom - bounds.top));
    }

    function applyObstacle(node, obstacle) {
      node.style.setProperty('--flight-obstacle-left', percent(obstacle.left));
      node.style.setProperty('--flight-obstacle-width', percent(obstacle.right - obstacle.left));
      node.style.setProperty('--flight-gap-top', percent(obstacle.gapTop));
      node.style.setProperty('--flight-gap-bottom', percent(obstacle.gapBottom));
    }

    function replaceScorePop(score) {
      removeIfAttached(effectsRoot, scorePopNode);
      scorePopNode = null;
      if (reducedMotion) return;
      const node = document.createElement('div');
      node.className = 'flight-renderer-score-pop';
      node.textContent = `+${score}`;
      effectsRoot.appendChild(node);
      scorePopNode = node;
    }

    function replaceFailureImpact() {
      removeIfAttached(effectsRoot, failureImpactNode);
      failureImpactNode = null;
      if (reducedMotion) return;
      const node = document.createElement('div');
      node.className = 'flight-renderer-failure-impact';
      node.setAttribute('aria-hidden', 'true');
      effectsRoot.appendChild(node);
      failureImpactNode = node;
    }

    function applyEvents(events, score) {
      for (const name of EVENT_NAMES) {
        if (!Object.prototype.hasOwnProperty.call(events, name)) continue;
        const token = events[name];
        const changed = lastTokens[name] === null || token > lastTokens[name];
        lastTokens[name] = token;
        if (!changed) continue;

        if (name === 'impulse') {
          playerNode.removeAttribute('data-flight-feedback');
          if (!reducedMotion) playerNode.setAttribute('data-flight-feedback', 'impulse');
        } else if (name === 'score') {
          replaceScorePop(score);
        } else {
          replaceFailureImpact();
        }
      }
    }

    function render(snapshotInput) {
      assertMounted();
      const snapshot = normalizeSnapshot(snapshotInput, lastTokens);

      const nextKeys = new Set(snapshot.obstacles.map((obstacle) => idKey(obstacle.id)));
      for (const [key, node] of obstacleNodes) {
        if (nextKeys.has(key)) continue;
        removeIfAttached(worldRoot, node);
        obstacleNodes.delete(key);
      }

      for (const obstacle of snapshot.obstacles) {
        const key = idKey(obstacle.id);
        let node = obstacleNodes.get(key);
        if (!node) {
          node = createObstacleNode(obstacle);
          obstacleNodes.set(key, node);
          worldRoot.appendChild(node);
        }
        applyObstacle(node, obstacle);
        worldRoot.appendChild(node);
      }

      applyPlayer(snapshot.player);
      hudRoot.textContent = String(snapshot.score);
      worldRoot.setAttribute('data-flight-outcome', snapshot.outcome);
      entityRoot.setAttribute('data-flight-outcome', snapshot.outcome);
      effectsRoot.setAttribute('data-flight-outcome', snapshot.outcome);
      statusLayer.textContent = snapshot.announcement;
      applyEvents(snapshot.events, snapshot.score);
      lastSnapshot = snapshot;
      return getState();
    }

    function clearObstacles() {
      for (const node of obstacleNodes.values()) removeIfAttached(worldRoot, node);
      obstacleNodes = new Map();
    }

    function reset() {
      assertMounted();
      clearObstacles();
      removeIfAttached(effectsRoot, scorePopNode);
      removeIfAttached(effectsRoot, failureImpactNode);
      scorePopNode = null;
      failureImpactNode = null;
      playerNode.removeAttribute('data-flight-feedback');
      applyPlayer({ left: 0.2, right: 0.29, top: 0.46, bottom: 0.53 });
      hudRoot.textContent = '0';
      worldRoot.setAttribute('data-flight-outcome', FLIGHT_RENDER_OUTCOMES.ACTIVE);
      entityRoot.setAttribute('data-flight-outcome', FLIGHT_RENDER_OUTCOMES.ACTIVE);
      effectsRoot.setAttribute('data-flight-outcome', FLIGHT_RENDER_OUTCOMES.ACTIVE);
      statusLayer.textContent = '';
      lastTokens = { impulse: null, score: null, failure: null };
      lastSnapshot = null;
      return getState();
    }

    function cloneSnapshot(snapshot) {
      if (!snapshot) return null;
      return Object.freeze({
        player: Object.freeze({ ...snapshot.player }),
        obstacles: Object.freeze(snapshot.obstacles.map((obstacle) => Object.freeze({ ...obstacle }))),
        score: snapshot.score,
        outcome: snapshot.outcome,
        events: Object.freeze({ ...snapshot.events }),
        announcement: snapshot.announcement
      });
    }

    function getState() {
      return Object.freeze({
        destroyed,
        reducedMotion,
        obstacleCount: obstacleNodes.size,
        transientCount: Number(Boolean(scorePopNode)) + Number(Boolean(failureImpactNode)),
        lastTokens: Object.freeze({ ...lastTokens }),
        snapshot: cloneSnapshot(lastSnapshot)
      });
    }

    function destroy() {
      if (destroyed) return getState();
      clearObstacles();
      removeIfAttached(effectsRoot, scorePopNode);
      removeIfAttached(effectsRoot, failureImpactNode);
      scorePopNode = null;
      failureImpactNode = null;
      removeIfAttached(worldLayer, styleNode);
      removeIfAttached(worldLayer, worldRoot);
      removeIfAttached(entityLayer, entityRoot);
      removeIfAttached(effectsLayer, effectsRoot);
      removeIfAttached(hudLayer, hudRoot);
      statusLayer.textContent = originalStatusText;
      lastSnapshot = null;
      lastTokens = { impulse: null, score: null, failure: null };
      destroyed = true;
      return getState();
    }

    reset();
    return Object.freeze({ render, reset, destroy, getState });
  }

  return Object.freeze({
    FLIGHT_RENDER_OUTCOMES,
    MAX_FLIGHT_SCORE,
    MAX_RENDERED_OBSTACLES,
    createFlightRenderer
  });
});
