(function exposeFlightMotion(root, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialChallengeGameFlightMotion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createFlightMotionApi() {
  'use strict';

  const FLIGHT_BOUNDARY_CONTACTS = Object.freeze({
    NONE: 'none',
    TOP: 'top',
    BOTTOM: 'bottom'
  });

  const DEFAULT_CONFIG = Object.freeze({
    top: 0,
    bottom: 1,
    initialPosition: 0.5,
    initialVelocity: 0,
    gravity: 1.8,
    impulseVelocity: -0.72,
    minVelocity: -1.2,
    maxVelocity: 1.5,
    maxDeltaMs: 100
  });

  function readFiniteOption(options, name) {
    const value = Object.prototype.hasOwnProperty.call(options, name)
      ? options[name]
      : DEFAULT_CONFIG[name];

    if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
      throw new TypeError(`${name} must be a finite safe number.`);
    }
    return value;
  }

  function createConfig(options) {
    if (options === null || typeof options !== 'object' || Array.isArray(options)) {
      throw new TypeError('Flight motion options must be an object.');
    }

    const config = {
      top: readFiniteOption(options, 'top'),
      bottom: readFiniteOption(options, 'bottom'),
      initialPosition: readFiniteOption(options, 'initialPosition'),
      initialVelocity: readFiniteOption(options, 'initialVelocity'),
      gravity: readFiniteOption(options, 'gravity'),
      impulseVelocity: readFiniteOption(options, 'impulseVelocity'),
      minVelocity: readFiniteOption(options, 'minVelocity'),
      maxVelocity: readFiniteOption(options, 'maxVelocity'),
      maxDeltaMs: readFiniteOption(options, 'maxDeltaMs')
    };

    if (!(config.top < config.bottom)) {
      throw new RangeError('top must be less than bottom.');
    }
    if (!(config.minVelocity < 0 && config.maxVelocity > 0
      && config.minVelocity < config.maxVelocity)) {
      throw new RangeError('Velocity limits must include distinct upward and downward ranges.');
    }
    if (config.initialPosition < config.top || config.initialPosition > config.bottom) {
      throw new RangeError('initialPosition must be within the world bounds.');
    }
    if (config.initialVelocity < config.minVelocity
      || config.initialVelocity > config.maxVelocity) {
      throw new RangeError('initialVelocity must be within the velocity limits.');
    }
    if (!(config.gravity > 0)) {
      throw new RangeError('gravity must be greater than zero.');
    }
    if (!(config.impulseVelocity < 0
      && config.impulseVelocity >= config.minVelocity
      && config.impulseVelocity <= config.maxVelocity)) {
      throw new RangeError('impulseVelocity must be an upward velocity within the limits.');
    }
    if (!(config.maxDeltaMs > 0)) {
      throw new RangeError('maxDeltaMs must be greater than zero.');
    }

    return Object.freeze({ ...config });
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function createFlightMotion(options = {}) {
    const config = createConfig(options);
    let position = config.initialPosition;
    let velocity = config.initialVelocity;
    let boundaryContact = FLIGHT_BOUNDARY_CONTACTS.NONE;

    function getState() {
      return Object.freeze({ position, velocity, boundaryContact });
    }

    function reset() {
      position = config.initialPosition;
      velocity = config.initialVelocity;
      boundaryContact = FLIGHT_BOUNDARY_CONTACTS.NONE;
      return getState();
    }

    function applyImpulse() {
      velocity = config.impulseVelocity;
      return getState();
    }

    function advance(deltaMs) {
      if (!Number.isFinite(deltaMs) || deltaMs <= 0) return getState();

      const safeDeltaMs = Math.min(deltaMs, config.maxDeltaMs);
      const deltaSeconds = safeDeltaMs / 1000;
      velocity = clamp(
        velocity + (config.gravity * deltaSeconds),
        config.minVelocity,
        config.maxVelocity
      );

      const nextPosition = position + (velocity * deltaSeconds);
      if (nextPosition <= config.top) {
        position = config.top;
        velocity = 0;
        boundaryContact = FLIGHT_BOUNDARY_CONTACTS.TOP;
      } else if (nextPosition >= config.bottom) {
        position = config.bottom;
        velocity = 0;
        boundaryContact = FLIGHT_BOUNDARY_CONTACTS.BOTTOM;
      } else {
        position = nextPosition;
        boundaryContact = FLIGHT_BOUNDARY_CONTACTS.NONE;
      }

      return getState();
    }

    return Object.freeze({ reset, applyImpulse, advance, getState });
  }

  return Object.freeze({ FLIGHT_BOUNDARY_CONTACTS, createFlightMotion });
});
