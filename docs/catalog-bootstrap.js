(function initializeCatalogBootstrap(root) {
  'use strict';

  const laneGuardChallenge = Object.freeze({
    id: 'lane-guard',
    title: 'Lane Guard',
    category: 'Dodge',
    difficulty: 'Easy',
    durationSeconds: 18,
    waves: 6,
    obstaclePattern: Object.freeze([0, 2, 1, 2, 0, 1]),
    mechanic: 'lane-dodge',
    scoreUnit: 'points',
    maxScore: 600,
    description: 'Switch between three lanes to avoid incoming obstacles.',
    goal: 'Clear six obstacle waves for up to 600 points.',
    instruction: 'Choose a safe lane before each obstacle reaches you.'
  });

  function installCatalogBootstrap() {
    const nativeFreeze = Object.freeze;
    let active = true;

    Object.freeze = function freezeWithLaneGuard(value) {
      if (active
        && Array.isArray(value)
        && value.length === 8
        && value[0]?.id === 'tap-sprint'
        && value[value.length - 1]?.id === 'signal-echo') {
        active = false;
        Object.freeze = nativeFreeze;
        return nativeFreeze([...value, laneGuardChallenge]);
      }
      return nativeFreeze(value);
    };

    return function restoreObjectFreeze() {
      if (active) {
        active = false;
        Object.freeze = nativeFreeze;
      }
    };
  }

  if (typeof module !== 'undefined') {
    module.exports = { laneGuardChallenge, installCatalogBootstrap };
  }

  if (typeof document !== 'undefined') {
    root.__restoreLaneGuardCatalogBootstrap = installCatalogBootstrap();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
