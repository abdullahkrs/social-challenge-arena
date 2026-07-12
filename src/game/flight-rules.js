(function exposeFlightRules(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialChallengeGameFlightRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createFlightRulesApi() {
  'use strict';

  const FLIGHT_RULE_OUTCOMES = Object.freeze({
    ACTIVE: 'active',
    FAILED: 'failed'
  });

  const FLIGHT_BOUNDARY_CONTACTS = Object.freeze({
    NONE: 'none',
    TOP: 'top',
    BOTTOM: 'bottom'
  });

  const MAX_FLIGHT_SCORE = 999;
  const MAX_OBSTACLES_PER_FRAME = 256;
  const MAX_STRING_ID_LENGTH = 128;

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
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

  function normalizePlayer(player) {
    if (!isObject(player)) throw new TypeError('frame.player must be an object.');

    const normalized = {
      left: readNormalizedNumber(player, 'left', 'frame.player'),
      right: readNormalizedNumber(player, 'right', 'frame.player'),
      top: readNormalizedNumber(player, 'top', 'frame.player'),
      bottom: readNormalizedNumber(player, 'bottom', 'frame.player')
    };

    if (!(normalized.left < normalized.right)) {
      throw new RangeError('frame.player.left must be less than frame.player.right.');
    }
    if (!(normalized.top < normalized.bottom)) {
      throw new RangeError('frame.player.top must be less than frame.player.bottom.');
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

  function compareIds(left, right) {
    if (typeof left !== typeof right) return typeof left === 'number' ? -1 : 1;
    if (typeof left === 'number') return left - right;
    return left < right ? -1 : left > right ? 1 : 0;
  }

  function normalizeObstacle(obstacle, index) {
    const owner = `frame.obstacles[${index}]`;
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

  function normalizeFrame(frame) {
    if (!isObject(frame)) throw new TypeError('Flight rule frame must be an object.');

    const boundaryContact = frame.boundaryContact;
    if (!Object.values(FLIGHT_BOUNDARY_CONTACTS).includes(boundaryContact)) {
      throw new RangeError('frame.boundaryContact must be none, top, or bottom.');
    }

    if (!Array.isArray(frame.obstacles)) {
      throw new TypeError('frame.obstacles must be an array.');
    }
    if (frame.obstacles.length > MAX_OBSTACLES_PER_FRAME) {
      throw new RangeError(`frame.obstacles cannot exceed ${MAX_OBSTACLES_PER_FRAME} entries.`);
    }

    const seenIds = new Set();
    const obstacles = [];
    for (let index = 0; index < frame.obstacles.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(frame.obstacles, index)) {
        throw new TypeError('frame.obstacles must not contain sparse entries.');
      }

      const obstacle = normalizeObstacle(frame.obstacles[index], index);
      const key = idKey(obstacle.id);
      if (seenIds.has(key)) throw new RangeError(`frame.obstacles contains duplicate id ${String(obstacle.id)}.`);
      seenIds.add(key);
      obstacles.push(obstacle);
    }

    obstacles.sort((left, right) => compareIds(left.id, right.id));
    return {
      boundaryContact,
      player: normalizePlayer(frame.player),
      obstacles
    };
  }

  function createConfig(options) {
    if (!isObject(options)) throw new TypeError('Flight rule options must be an object.');

    const maxScore = Object.prototype.hasOwnProperty.call(options, 'maxScore')
      ? options.maxScore
      : MAX_FLIGHT_SCORE;

    if (!Number.isSafeInteger(maxScore) || maxScore < 0 || maxScore > MAX_FLIGHT_SCORE) {
      throw new RangeError(`maxScore must be a safe integer from 0 to ${MAX_FLIGHT_SCORE}.`);
    }

    return Object.freeze({ maxScore });
  }

  function horizontallyTouchesOrOverlaps(player, obstacle) {
    return player.right >= obstacle.left && player.left <= obstacle.right;
  }

  function touchesOrLeavesSafeGap(player, obstacle) {
    return player.top <= obstacle.gapTop || player.bottom >= obstacle.gapBottom;
  }

  function findFailure(frame) {
    if (frame.boundaryContact === FLIGHT_BOUNDARY_CONTACTS.TOP
      || frame.boundaryContact === FLIGHT_BOUNDARY_CONTACTS.BOTTOM) {
      return Object.freeze({
        type: 'boundary',
        boundaryContact: frame.boundaryContact
      });
    }

    for (const obstacle of frame.obstacles) {
      if (horizontallyTouchesOrOverlaps(frame.player, obstacle)
        && touchesOrLeavesSafeGap(frame.player, obstacle)) {
        return Object.freeze({ type: 'obstacle', obstacleId: obstacle.id });
      }
    }

    return null;
  }

  function createFlightRules(options = {}) {
    const config = createConfig(options);
    let outcome = FLIGHT_RULE_OUTCOMES.ACTIVE;
    let score = 0;
    let failure = null;
    let passedIds = [];
    let passedKeys = new Set();

    function getState() {
      return Object.freeze({
        outcome,
        score,
        failure,
        passedIds: Object.freeze([...passedIds])
      });
    }

    function reset() {
      outcome = FLIGHT_RULE_OUTCOMES.ACTIVE;
      score = 0;
      failure = null;
      passedIds = [];
      passedKeys = new Set();
      return getState();
    }

    function evaluate(frameInput) {
      const frame = normalizeFrame(frameInput);
      if (outcome === FLIGHT_RULE_OUTCOMES.FAILED) return getState();

      const nextFailure = findFailure(frame);
      if (nextFailure) {
        outcome = FLIGHT_RULE_OUTCOMES.FAILED;
        failure = nextFailure;
        return getState();
      }

      if (score >= config.maxScore) return getState();

      for (const obstacle of frame.obstacles) {
        if (!(obstacle.right < frame.player.left)) continue;

        const key = idKey(obstacle.id);
        if (passedKeys.has(key)) continue;

        passedKeys.add(key);
        passedIds.push(obstacle.id);
        score += 1;
        if (score >= config.maxScore) break;
      }

      return getState();
    }

    return Object.freeze({ reset, evaluate, getState });
  }

  return Object.freeze({
    FLIGHT_RULE_OUTCOMES,
    FLIGHT_BOUNDARY_CONTACTS,
    MAX_FLIGHT_SCORE,
    MAX_OBSTACLES_PER_FRAME,
    createFlightRules
  });
});
