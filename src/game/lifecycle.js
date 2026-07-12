(function exposeLifecycle(root, factory) {
  const api = factory(root);

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialChallengeGameLifecycle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createLifecycleApi(root) {
  'use strict';

  const GAME_LIFECYCLE_STATES = Object.freeze({
    IDLE: 'idle',
    READY: 'ready',
    RUNNING: 'running',
    FINISHED: 'finished'
  });

  const defaultRequestFrame = typeof root.requestAnimationFrame === 'function'
    ? root.requestAnimationFrame.bind(root)
    : callback => root.setTimeout(() => callback(Date.now()), 16);
  const defaultCancelFrame = typeof root.cancelAnimationFrame === 'function'
    ? root.cancelAnimationFrame.bind(root)
    : handle => root.clearTimeout(handle);

  function createGameLifecycle(options = {}) {
    const requestFrame = options.requestAnimationFrameFn || defaultRequestFrame;
    const cancelFrame = options.cancelAnimationFrameFn || defaultCancelFrame;
    const setTimeoutFn = options.setTimeoutFn || root.setTimeout.bind(root);
    const clearTimeoutFn = options.clearTimeoutFn || root.clearTimeout.bind(root);
    const setIntervalFn = options.setIntervalFn || root.setInterval.bind(root);
    const clearIntervalFn = options.clearIntervalFn || root.clearInterval.bind(root);
    const onFrame = typeof options.onFrame === 'function' ? options.onFrame : () => {};
    const onStateChange = typeof options.onStateChange === 'function'
      ? options.onStateChange
      : () => {};
    const maxDeltaMs = Number.isFinite(options.maxDeltaMs) && options.maxDeltaMs > 0
      ? options.maxDeltaMs
      : 100;

    if (typeof requestFrame !== 'function' || typeof cancelFrame !== 'function') {
      throw new TypeError('Animation frame scheduler functions are required.');
    }

    let status = GAME_LIFECYCLE_STATES.IDLE;
    let active = options.active !== false;
    let destroyed = false;
    let frameHandle = null;
    let frameToken = 0;
    let runToken = 0;
    let timerToken = 0;
    let frameCount = 0;
    let elapsedMs = 0;
    let lastTimestamp = null;

    const timeoutHandles = new Set();
    const intervalHandles = new Set();
    const listenerRemovers = new Set();

    function getState() {
      return Object.freeze({
        status,
        active,
        destroyed,
        framePending: frameHandle !== null,
        frameCount,
        elapsedMs
      });
    }

    function emitStateChange(previousStatus) {
      const snapshot = getState();
      if (previousStatus !== status) onStateChange(snapshot, previousStatus);
      return snapshot;
    }

    function cancelPendingFrame() {
      frameToken += 1;
      if (frameHandle !== null) {
        cancelFrame(frameHandle);
        frameHandle = null;
      }
    }

    function clearTimeouts() {
      for (const handle of timeoutHandles) clearTimeoutFn(handle);
      timeoutHandles.clear();
    }

    function clearIntervals() {
      for (const handle of intervalHandles) clearIntervalFn(handle);
      intervalHandles.clear();
    }

    function invalidateTimers() {
      timerToken += 1;
      clearTimeouts();
      clearIntervals();
    }

    function clearListeners() {
      for (const remove of listenerRemovers) remove();
      listenerRemovers.clear();
    }

    function clearTransientResources() {
      runToken += 1;
      cancelPendingFrame();
      invalidateTimers();
      clearListeners();
    }

    function resetRunState() {
      frameCount = 0;
      elapsedMs = 0;
      lastTimestamp = null;
    }

    function scheduleFrame() {
      if (destroyed
        || !active
        || status !== GAME_LIFECYCLE_STATES.RUNNING
        || frameHandle !== null) return getState();

      const token = frameToken;
      let scheduledHandle = null;
      scheduledHandle = requestFrame(timestamp => {
        if (frameHandle === scheduledHandle) frameHandle = null;
        if (destroyed
          || !active
          || status !== GAME_LIFECYCLE_STATES.RUNNING
          || token !== frameToken) return;

        const safeTimestamp = Number.isFinite(timestamp) ? timestamp : Date.now();
        const rawDelta = lastTimestamp === null ? 0 : Math.max(0, safeTimestamp - lastTimestamp);
        const deltaMs = Math.min(rawDelta, maxDeltaMs);
        lastTimestamp = safeTimestamp;
        frameCount += 1;
        elapsedMs += deltaMs;

        onFrame(Object.freeze({
          timestamp: safeTimestamp,
          deltaMs,
          frameCount,
          elapsedMs,
          lifecycle: getState()
        }));

        if (!destroyed
          && active
          && status === GAME_LIFECYCLE_STATES.RUNNING
          && token === frameToken) scheduleFrame();
      });
      frameHandle = scheduledHandle;

      return getState();
    }

    function prepare() {
      if (destroyed || status !== GAME_LIFECYCLE_STATES.IDLE) return getState();
      const previousStatus = status;
      resetRunState();
      status = GAME_LIFECYCLE_STATES.READY;
      return emitStateChange(previousStatus);
    }

    function start() {
      if (destroyed || status !== GAME_LIFECYCLE_STATES.READY) return getState();
      const previousStatus = status;
      status = GAME_LIFECYCLE_STATES.RUNNING;
      emitStateChange(previousStatus);
      scheduleFrame();
      return getState();
    }

    function finish() {
      if (destroyed || status !== GAME_LIFECYCLE_STATES.RUNNING) return getState();
      const previousStatus = status;
      clearTransientResources();
      status = GAME_LIFECYCLE_STATES.FINISHED;
      return emitStateChange(previousStatus);
    }

    function reset() {
      if (destroyed) return getState();
      const previousStatus = status;
      clearTransientResources();
      resetRunState();
      status = GAME_LIFECYCLE_STATES.IDLE;
      return emitStateChange(previousStatus);
    }

    function replay() {
      if (destroyed || status !== GAME_LIFECYCLE_STATES.FINISHED) return getState();
      clearTransientResources();
      resetRunState();
      const previousStatus = status;
      status = GAME_LIFECYCLE_STATES.READY;
      emitStateChange(previousStatus);
      return start();
    }

    function setActive(nextActive) {
      if (destroyed || typeof nextActive !== 'boolean' || active === nextActive) {
        return getState();
      }

      active = nextActive;
      timerToken += 1;
      if (!active) {
        lastTimestamp = null;
        cancelPendingFrame();
        clearTimeouts();
        clearIntervals();
      } else if (status === GAME_LIFECYCLE_STATES.RUNNING) {
        scheduleFrame();
      }
      return getState();
    }

    function scheduleTimeout(callback, delayMs = 0) {
      if (destroyed || typeof callback !== 'function') return null;
      const currentRunToken = runToken;
      const currentTimerToken = timerToken;
      let handle = null;
      handle = setTimeoutFn(() => {
        timeoutHandles.delete(handle);
        if (!destroyed
          && active
          && status === GAME_LIFECYCLE_STATES.RUNNING
          && currentRunToken === runToken
          && currentTimerToken === timerToken) callback();
      }, Math.max(0, Number(delayMs) || 0));
      timeoutHandles.add(handle);
      return handle;
    }

    function scheduleInterval(callback, delayMs = 0) {
      if (destroyed || typeof callback !== 'function') return null;
      const currentRunToken = runToken;
      const currentTimerToken = timerToken;
      const handle = setIntervalFn(() => {
        if (!destroyed
          && active
          && status === GAME_LIFECYCLE_STATES.RUNNING
          && currentRunToken === runToken
          && currentTimerToken === timerToken) callback();
      }, Math.max(0, Number(delayMs) || 0));
      intervalHandles.add(handle);
      return handle;
    }

    function addTemporaryListener(target, type, listener, listenerOptions) {
      if (destroyed
        || !target
        || typeof target.addEventListener !== 'function'
        || typeof target.removeEventListener !== 'function'
        || typeof type !== 'string'
        || typeof listener !== 'function') return () => {};

      const token = runToken;
      let removed = false;
      const guardedListener = event => {
        if (!destroyed
          && active
          && status === GAME_LIFECYCLE_STATES.RUNNING
          && token === runToken) {
          listener.call(target, event);
        }
      };
      target.addEventListener(type, guardedListener, listenerOptions);
      const remove = () => {
        if (removed) return;
        removed = true;
        target.removeEventListener(type, guardedListener, listenerOptions);
        listenerRemovers.delete(remove);
      };
      listenerRemovers.add(remove);
      return remove;
    }

    function teardown() {
      if (destroyed) return getState();
      const previousStatus = status;
      clearTransientResources();
      resetRunState();
      active = false;
      destroyed = true;
      status = GAME_LIFECYCLE_STATES.IDLE;
      return emitStateChange(previousStatus);
    }

    return Object.freeze({
      prepare,
      start,
      finish,
      reset,
      replay,
      setActive,
      scheduleTimeout,
      scheduleInterval,
      addTemporaryListener,
      teardown,
      getState
    });
  }

  return Object.freeze({ GAME_LIFECYCLE_STATES, createGameLifecycle });
});
