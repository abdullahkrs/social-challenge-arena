(function exposeActionInput(root, factory) {
  const api = factory(root);

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SocialChallengeGameActionInput = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createActionInputApi(root) {
  'use strict';

  const PRIMARY_ACTION_TYPE = 'primary-action';
  const ACTION_INPUT_SOURCES = Object.freeze({
    KEYBOARD: 'keyboard',
    POINTER: 'pointer',
    TOUCH: 'touch'
  });
  const ACTIONS = Object.freeze({
    [ACTION_INPUT_SOURCES.KEYBOARD]: Object.freeze({
      type: PRIMARY_ACTION_TYPE,
      source: ACTION_INPUT_SOURCES.KEYBOARD
    }),
    [ACTION_INPUT_SOURCES.POINTER]: Object.freeze({
      type: PRIMARY_ACTION_TYPE,
      source: ACTION_INPUT_SOURCES.POINTER
    }),
    [ACTION_INPUT_SOURCES.TOUCH]: Object.freeze({
      type: PRIMARY_ACTION_TYPE,
      source: ACTION_INPUT_SOURCES.TOUCH
    })
  });
  const ACCEPTED_KEY_IDENTIFIERS = new Set([
    'Space',
    ' ',
    'Spacebar',
    'Enter',
    'ArrowUp'
  ]);
  const EDITABLE_TAGS = new Set(['input', 'textarea', 'select']);

  function isEventTarget(target) {
    return Boolean(target
      && typeof target.addEventListener === 'function'
      && typeof target.removeEventListener === 'function');
  }

  function isEditableTarget(target) {
    const visited = new Set();
    let current = target;

    while (current && !visited.has(current)) {
      visited.add(current);
      const tagName = String(current.tagName || current.nodeName || '').toLowerCase();
      if (EDITABLE_TAGS.has(tagName) || current.isContentEditable === true) return true;

      if (typeof current.getAttribute === 'function') {
        const contentEditable = current.getAttribute('contenteditable');
        const normalizedContentEditable = contentEditable === null
          ? null
          : String(contentEditable).toLowerCase();
        if (normalizedContentEditable === ''
          || normalizedContentEditable === 'true'
          || normalizedContentEditable === 'plaintext-only') return true;
      }

      current = current.parentElement || current.parentNode || null;
    }

    return false;
  }

  function getKeyboardIdentifier(event) {
    if (event && typeof event.code === 'string' && event.code) return event.code;
    return event && typeof event.key === 'string' ? event.key : '';
  }

  function createActionInput(options = {}) {
    const actionTarget = options.target || root;
    const keyboardTarget = options.keyboardTarget || actionTarget;
    const onAction = options.onAction;
    const isEnabled = typeof options.isEnabled === 'function'
      ? options.isEnabled
      : () => true;
    const preventDefault = options.preventDefault === true;
    const supportsPointerEvents = typeof options.supportsPointerEvents === 'boolean'
      ? options.supportsPointerEvents
      : typeof root.PointerEvent === 'function';
    const inputMode = supportsPointerEvents
      ? ACTION_INPUT_SOURCES.POINTER
      : ACTION_INPUT_SOURCES.TOUCH;

    if (!isEventTarget(actionTarget) || !isEventTarget(keyboardTarget)) {
      throw new TypeError('Action and keyboard event targets are required.');
    }
    if (typeof onAction !== 'function') {
      throw new TypeError('An onAction callback is required.');
    }

    let attached = false;
    let destroyed = false;
    let listenerGeneration = 0;
    let listenerRemovers = [];

    function getState() {
      return Object.freeze({ attached, destroyed, inputMode });
    }

    function gateIsEnabled() {
      try {
        return Boolean(isEnabled());
      } catch {
        return false;
      }
    }

    function emitAction(event, source, generation) {
      if (destroyed
        || !attached
        || generation !== listenerGeneration
        || !gateIsEnabled()) return false;

      if (preventDefault && event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      onAction(ACTIONS[source]);
      return true;
    }

    function addManagedListener(target, type, listener, listenerOptions) {
      target.addEventListener(type, listener, listenerOptions);
      listenerRemovers.push(() => {
        target.removeEventListener(type, listener, listenerOptions);
      });
    }

    function attach() {
      if (destroyed || attached) return getState();

      listenerGeneration += 1;
      const generation = listenerGeneration;
      const keyboardListener = event => {
        if (!event
          || event.repeat === true
          || event.altKey === true
          || event.ctrlKey === true
          || event.metaKey === true
          || event.shiftKey === true
          || isEditableTarget(event.target)
          || !ACCEPTED_KEY_IDENTIFIERS.has(getKeyboardIdentifier(event))) return;

        emitAction(event, ACTION_INPUT_SOURCES.KEYBOARD, generation);
      };
      const actionListener = supportsPointerEvents
        ? event => {
          if (!event || event.isPrimary !== true || event.button !== 0) return;
          emitAction(event, ACTION_INPUT_SOURCES.POINTER, generation);
        }
        : event => {
          if (!event || !event.touches || event.touches.length !== 1) return;
          emitAction(event, ACTION_INPUT_SOURCES.TOUCH, generation);
        };
      const actionListenerOptions = { passive: !preventDefault };

      attached = true;
      try {
        addManagedListener(keyboardTarget, 'keydown', keyboardListener);
        addManagedListener(
          actionTarget,
          supportsPointerEvents ? 'pointerdown' : 'touchstart',
          actionListener,
          actionListenerOptions
        );
      } catch (error) {
        attached = false;
        listenerGeneration += 1;
        for (const remove of listenerRemovers.splice(0)) remove();
        throw error;
      }

      return getState();
    }

    function detach() {
      if (!attached) return getState();

      attached = false;
      listenerGeneration += 1;
      for (const remove of listenerRemovers.splice(0)) remove();
      return getState();
    }

    function teardown() {
      if (destroyed) return getState();

      detach();
      destroyed = true;
      listenerGeneration += 1;
      return getState();
    }

    return Object.freeze({ attach, detach, teardown, getState });
  }

  return Object.freeze({
    PRIMARY_ACTION_TYPE,
    ACTION_INPUT_SOURCES,
    createActionInput
  });
});
