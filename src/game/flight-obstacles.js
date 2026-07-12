(function exposeFlightObstacles(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialChallengeGameFlightObstacles = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createFlightObstaclesApi() {
  'use strict';

  const MAX_OBSTACLE_COUNT = 256;
  const MAX_GAP_PATTERN_LENGTH = 256;
  const MAX_RUN_MS = 60 * 60 * 1000;
  const MAX_NORMALIZED_SPEED = 4;
  const MAX_SPEED_INCREASE_PER_SECOND = 4;
  const MAX_RECYCLES_PER_ADVANCE = 4096;
  const MAX_TOTAL_RECYCLES = 1000000;

  const DEFAULT_GAP_PATTERN = Object.freeze([
    Object.freeze({ gapTop: 0.12, gapBottom: 0.48 }),
    Object.freeze({ gapTop: 0.32, gapBottom: 0.68 }),
    Object.freeze({ gapTop: 0.18, gapBottom: 0.54 }),
    Object.freeze({ gapTop: 0.42, gapBottom: 0.78 })
  ]);

  const DEFAULT_CONFIG = Object.freeze({
    obstacleCount: 3,
    obstacleWidth: 0.12,
    spacing: 0.18,
    initialLeft: 0.16,
    gapPattern: DEFAULT_GAP_PATTERN,
    initialSpeed: 0.18,
    maxSpeed: 0.42,
    speedIncreasePerSecond: 0.02,
    maxDeltaMs: 100,
    maxRunMs: 10 * 60 * 1000,
    initialId: 0
  });

  const CONFIG_KEYS = Object.freeze(new Set(Object.keys(DEFAULT_CONFIG)));
  const GAP_KEYS = Object.freeze(new Set(['gapTop', 'gapBottom']));

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function rejectUnknownKeys(object, allowedKeys, owner) {
    for (const key of Object.keys(object)) {
      if (!allowedKeys.has(key)) throw new TypeError(`${owner}.${key} is not supported.`);
    }
  }

  function readOption(options, name) {
    return Object.prototype.hasOwnProperty.call(options, name)
      ? options[name]
      : DEFAULT_CONFIG[name];
  }

  function readFiniteNumber(options, name) {
    const value = readOption(options, name);
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError(`${name} must be a finite number.`);
    }
    return value;
  }

  function readSafeInteger(options, name) {
    const value = readOption(options, name);
    if (!Number.isSafeInteger(value)) throw new TypeError(`${name} must be a safe integer.`);
    return value;
  }

  function normalizeGapPattern(value) {
    if (!Array.isArray(value)) throw new TypeError('gapPattern must be an array.');
    if (value.length < 1 || value.length > MAX_GAP_PATTERN_LENGTH) {
      throw new RangeError(`gapPattern must contain 1 to ${MAX_GAP_PATTERN_LENGTH} entries.`);
    }

    const pattern = [];
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.prototype.hasOwnProperty.call(value, index)) {
        throw new TypeError('gapPattern must not contain sparse entries.');
      }

      const entry = value[index];
      const owner = `gapPattern[${index}]`;
      if (!isObject(entry)) throw new TypeError(`${owner} must be an object.`);
      rejectUnknownKeys(entry, GAP_KEYS, owner);

      if (!Object.prototype.hasOwnProperty.call(entry, 'gapTop')
        || !Object.prototype.hasOwnProperty.call(entry, 'gapBottom')) {
        throw new TypeError(`${owner} must define gapTop and gapBottom.`);
      }

      const gapTop = entry.gapTop;
      const gapBottom = entry.gapBottom;
      if (!Number.isFinite(gapTop) || !Number.isFinite(gapBottom)
        || gapTop < 0 || gapBottom > 1 || !(gapTop < gapBottom)) {
        throw new RangeError(`${owner} must define a finite normalized gap with gapTop less than gapBottom.`);
      }

      pattern.push(Object.freeze({ gapTop, gapBottom }));
    }

    return Object.freeze(pattern);
  }

  function speedAt(config, elapsedMs) {
    const elapsedSeconds = elapsedMs / 1000;
    return Math.min(
      config.maxSpeed,
      config.initialSpeed + (config.speedIncreasePerSecond * elapsedSeconds)
    );
  }

  function distanceAt(config, elapsedMs) {
    const elapsedSeconds = elapsedMs / 1000;
    const accelerationSeconds = (config.maxSpeed - config.initialSpeed)
      / config.speedIncreasePerSecond;
    const acceleratingSeconds = Math.min(elapsedSeconds, accelerationSeconds);
    const cappedSeconds = Math.max(0, elapsedSeconds - accelerationSeconds);

    return (config.initialSpeed * acceleratingSeconds)
      + (0.5 * config.speedIncreasePerSecond * acceleratingSeconds * acceleratingSeconds)
      + (config.maxSpeed * cappedSeconds);
  }

  function estimateRecycleBoundForDistance(config, distance) {
    const rounds = Math.ceil(distance / config.cycleSpan) + 1;
    const estimate = config.obstacleCount * rounds;
    return Number.isSafeInteger(estimate) ? estimate : Number.POSITIVE_INFINITY;
  }

  function createConfig(options) {
    if (!isObject(options)) throw new TypeError('Flight obstacle options must be an object.');
    rejectUnknownKeys(options, CONFIG_KEYS, 'options');

    const obstacleCount = readSafeInteger(options, 'obstacleCount');
    const obstacleWidth = readFiniteNumber(options, 'obstacleWidth');
    const spacing = readFiniteNumber(options, 'spacing');
    const initialLeft = readFiniteNumber(options, 'initialLeft');
    const initialSpeed = readFiniteNumber(options, 'initialSpeed');
    const maxSpeed = readFiniteNumber(options, 'maxSpeed');
    const speedIncreasePerSecond = readFiniteNumber(options, 'speedIncreasePerSecond');
    const maxDeltaMs = readFiniteNumber(options, 'maxDeltaMs');
    const maxRunMs = readSafeInteger(options, 'maxRunMs');
    const initialId = readSafeInteger(options, 'initialId');
    const gapPattern = normalizeGapPattern(readOption(options, 'gapPattern'));

    if (obstacleCount < 1 || obstacleCount > MAX_OBSTACLE_COUNT) {
      throw new RangeError(`obstacleCount must be from 1 to ${MAX_OBSTACLE_COUNT}.`);
    }
    if (!(obstacleWidth > 0 && obstacleWidth <= 1)) {
      throw new RangeError('obstacleWidth must be greater than 0 and at most 1.');
    }
    if (!(spacing > 0 && spacing < 1)) {
      throw new RangeError('spacing must be greater than 0 and less than 1.');
    }
    if (!(initialLeft >= 0 && initialLeft < 1)) {
      throw new RangeError('initialLeft must be a normalized number from 0 up to 1.');
    }
    if (!(initialSpeed > 0 && initialSpeed < maxSpeed)) {
      throw new RangeError('initialSpeed must be greater than 0 and less than maxSpeed.');
    }
    if (!(maxSpeed > 0 && maxSpeed <= MAX_NORMALIZED_SPEED)) {
      throw new RangeError(`maxSpeed must be greater than 0 and at most ${MAX_NORMALIZED_SPEED}.`);
    }
    if (!(speedIncreasePerSecond > 0
      && speedIncreasePerSecond <= MAX_SPEED_INCREASE_PER_SECOND)) {
      throw new RangeError(
        `speedIncreasePerSecond must be greater than 0 and at most ${MAX_SPEED_INCREASE_PER_SECOND}.`
      );
    }
    if (!(maxRunMs > 0 && maxRunMs <= MAX_RUN_MS)) {
      throw new RangeError(`maxRunMs must be from 1 to ${MAX_RUN_MS}.`);
    }
    if (!(maxDeltaMs > 0 && maxDeltaMs <= maxRunMs)) {
      throw new RangeError('maxDeltaMs must be greater than 0 and no greater than maxRunMs.');
    }
    if (initialId < 0) throw new RangeError('initialId must be non-negative.');

    const step = obstacleWidth + spacing;
    const cycleSpan = obstacleCount * step;
    const initialRight = initialLeft + ((obstacleCount - 1) * step) + obstacleWidth;
    if (!(cycleSpan <= 1)) {
      throw new RangeError('The configured obstacle cycle must fit within one normalized world width.');
    }
    if (!(initialRight <= 1)) {
      throw new RangeError('The initial obstacle layout must fit within the normalized world.');
    }

    const partialConfig = {
      obstacleCount,
      obstacleWidth,
      spacing,
      initialLeft,
      gapPattern,
      initialSpeed,
      maxSpeed,
      speedIncreasePerSecond,
      maxDeltaMs,
      maxRunMs,
      initialId,
      step,
      cycleSpan
    };

    const maxStepDistance = maxSpeed * (maxDeltaMs / 1000);
    const maxTotalDistance = distanceAt(partialConfig, maxRunMs);
    const maxPerAdvance = estimateRecycleBoundForDistance(partialConfig, maxStepDistance);
    const maxTotalRecycles = estimateRecycleBoundForDistance(partialConfig, maxTotalDistance);
    if (maxPerAdvance > MAX_RECYCLES_PER_ADVANCE) {
      throw new RangeError('Configuration could require too many recycling operations in one advance.');
    }
    if (maxTotalRecycles > MAX_TOTAL_RECYCLES) {
      throw new RangeError('Configuration could require too many recycling operations in one run.');
    }

    const maximumNextId = initialId + obstacleCount + maxTotalRecycles;
    if (!Number.isSafeInteger(maximumNextId)) {
      throw new RangeError('Configuration cannot preserve safe monotonic obstacle IDs for the bounded run.');
    }

    return Object.freeze({
      ...partialConfig,
      maxTotalRecycles
    });
  }

  function createInitialState(config) {
    const obstacles = [];
    for (let index = 0; index < config.obstacleCount; index += 1) {
      const left = config.initialLeft + (index * config.step);
      const gap = config.gapPattern[index % config.gapPattern.length];
      obstacles.push({
        id: config.initialId + index,
        left,
        right: left + config.obstacleWidth,
        gapTop: gap.gapTop,
        gapBottom: gap.gapBottom
      });
    }

    return {
      elapsedMs: 0,
      speed: config.initialSpeed,
      nextPatternIndex: config.obstacleCount % config.gapPattern.length,
      nextId: config.initialId + config.obstacleCount,
      obstacles
    };
  }

  function freezeObstacle(obstacle) {
    return Object.freeze({
      id: obstacle.id,
      left: Math.max(0, Math.min(1, obstacle.left)),
      right: Math.max(0, Math.min(1, obstacle.right)),
      gapTop: obstacle.gapTop,
      gapBottom: obstacle.gapBottom
    });
  }

  function createFlightObstacles(options = {}) {
    const config = createConfig(options);
    let state = createInitialState(config);

    function getState() {
      return Object.freeze({
        elapsedMs: state.elapsedMs,
        speed: state.speed,
        nextPatternIndex: state.nextPatternIndex,
        nextId: state.nextId,
        obstacles: Object.freeze(state.obstacles.map(freezeObstacle))
      });
    }

    function reset() {
      state = createInitialState(config);
      return getState();
    }

    function advance(deltaMs) {
      if (typeof deltaMs !== 'number' || !Number.isFinite(deltaMs) || deltaMs <= 0) {
        return getState();
      }
      if (state.elapsedMs >= config.maxRunMs) return getState();

      const acceptedDeltaMs = Math.min(
        deltaMs,
        config.maxDeltaMs,
        config.maxRunMs - state.elapsedMs
      );
      if (!(acceptedDeltaMs > 0)) return getState();

      const nextElapsedMs = state.elapsedMs + acceptedDeltaMs;
      const travel = distanceAt(config, nextElapsedMs) - distanceAt(config, state.elapsedMs);
      const obstacles = state.obstacles.map((obstacle) => ({
        id: obstacle.id,
        left: obstacle.left - travel,
        right: obstacle.right - travel,
        gapTop: obstacle.gapTop,
        gapBottom: obstacle.gapBottom
      }));
      let nextPatternIndex = state.nextPatternIndex;
      let nextId = state.nextId;
      let recycleCount = 0;

      while (obstacles[0].right <= 0) {
        recycleCount += 1;
        if (recycleCount > MAX_RECYCLES_PER_ADVANCE) {
          throw new RangeError('Recycling operation bound exceeded.');
        }
        if (!Number.isSafeInteger(nextId) || nextId < 0) {
          throw new RangeError('No safe monotonic obstacle ID remains.');
        }

        const recycled = obstacles.shift();
        const last = obstacles.length > 0 ? obstacles[obstacles.length - 1] : recycled;
        const left = last.right + config.spacing;
        const gap = config.gapPattern[nextPatternIndex];
        obstacles.push({
          id: nextId,
          left,
          right: left + config.obstacleWidth,
          gapTop: gap.gapTop,
          gapBottom: gap.gapBottom
        });
        nextId += 1;
        nextPatternIndex = (nextPatternIndex + 1) % config.gapPattern.length;
      }

      state = {
        elapsedMs: nextElapsedMs,
        speed: speedAt(config, nextElapsedMs),
        nextPatternIndex,
        nextId,
        obstacles
      };
      return getState();
    }

    return Object.freeze({ advance, reset, getState });
  }

  return Object.freeze({
    MAX_OBSTACLE_COUNT,
    MAX_GAP_PATTERN_LENGTH,
    MAX_RUN_MS,
    createFlightObstacles
  });
});