const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {
  PRIMARY_ACTION_TYPE,
  ACTION_INPUT_SOURCES,
  createActionInput
} = require('../../src/game/action-input');

function createEventTarget() {
  const listeners = new Map();

  function getListeners(type) {
    if (!listeners.has(type)) listeners.set(type, []);
    return listeners.get(type);
  }

  return {
    addEventListener(type, listener, options) {
      getListeners(type).push({ listener, options });
    },
    removeEventListener(type, listener, options) {
      const registered = getListeners(type);
      const index = registered.findIndex(entry => (
        entry.listener === listener && entry.options === options
      ));
      if (index >= 0) registered.splice(index, 1);
    },
    dispatch(type, event = {}) {
      for (const entry of [...getListeners(type)]) entry.listener(event);
    },
    takeListener(type) {
      const entry = getListeners(type)[0];
      assert.ok(entry, `Expected a ${type} listener.`);
      return entry.listener;
    },
    count(type) {
      return getListeners(type).length;
    }
  };
}

function createInput(options = {}) {
  const target = options.target || createEventTarget();
  const keyboardTarget = options.keyboardTarget || target;
  const actions = [];
  const input = createActionInput({
    target,
    keyboardTarget,
    supportsPointerEvents: true,
    onAction(action) {
      actions.push(action);
    },
    ...options
  });

  return { input, target, keyboardTarget, actions };
}

function createEvent(overrides = {}) {
  let prevented = 0;
  return {
    target: null,
    preventDefault() {
      prevented += 1;
    },
    get prevented() {
      return prevented;
    },
    ...overrides
  };
}

test('exposes the same dependency-free API through the browser global pattern', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../../src/game/action-input.js'),
    'utf8'
  );
  const context = vm.createContext({});

  vm.runInContext(source, context);

  assert.equal(typeof context.SocialChallengeGameActionInput.createActionInput, 'function');
  assert.equal(
    context.SocialChallengeGameActionInput.PRIMARY_ACTION_TYPE,
    PRIMARY_ACTION_TYPE
  );
});

test('normalizes Space, Enter, and Arrow Up to immutable keyboard actions', () => {
  const { input, keyboardTarget, actions } = createInput();
  input.attach();

  keyboardTarget.dispatch('keydown', createEvent({ code: 'Space' }));
  keyboardTarget.dispatch('keydown', createEvent({ code: 'Enter' }));
  keyboardTarget.dispatch('keydown', createEvent({ code: 'ArrowUp' }));

  assert.equal(actions.length, 3);
  for (const action of actions) {
    assert.deepEqual(action, {
      type: PRIMARY_ACTION_TYPE,
      source: ACTION_INPUT_SOURCES.KEYBOARD
    });
    assert.equal(Object.isFrozen(action), true);
  }
  assert.equal(actions[0], actions[1]);
});

test('accepts numpad Enter as one immutable keyboard action', () => {
  const { input, keyboardTarget, actions } = createInput({ preventDefault: true });
  input.attach();
  const event = createEvent({ code: 'NumpadEnter', key: 'Enter' });

  keyboardTarget.dispatch('keydown', event);

  assert.equal(actions.length, 1);
  assert.deepEqual(actions[0], {
    type: PRIMARY_ACTION_TYPE,
    source: ACTION_INPUT_SOURCES.KEYBOARD
  });
  assert.equal(Object.isFrozen(actions[0]), true);
  assert.equal(event.prevented, 1);
});

test('rejects repeat, modifier, unrelated, and editable-target keyboard input', () => {
  const { input, keyboardTarget, actions } = createInput({ preventDefault: true });
  input.attach();
  const editableParent = {
    tagName: 'DIV',
    getAttribute(name) {
      return name === 'contenteditable' ? 'true' : null;
    }
  };
  const ignoredEvents = [
    createEvent({ code: 'Space', repeat: true }),
    createEvent({ code: 'Enter', ctrlKey: true }),
    createEvent({ code: 'ArrowUp', altKey: true }),
    createEvent({ code: 'Space', metaKey: true }),
    createEvent({ code: 'Enter', shiftKey: true }),
    createEvent({ code: 'KeyA' }),
    createEvent({ code: 'Space', target: { tagName: 'INPUT' } }),
    createEvent({ code: 'Enter', target: { tagName: 'SPAN', parentElement: editableParent } })
  ];

  for (const event of ignoredEvents) keyboardTarget.dispatch('keydown', event);

  assert.equal(actions.length, 0);
  assert.deepEqual(ignoredEvents.map(event => event.prevented), Array(ignoredEvents.length).fill(0));
});

test('accepts only a primary left pointer and prevents default only when configured', () => {
  const { input, target, actions } = createInput({ preventDefault: true });
  input.attach();
  const nonPrimary = createEvent({ isPrimary: false, button: 0 });
  const secondaryButton = createEvent({ isPrimary: true, button: 2 });
  const primary = createEvent({ isPrimary: true, button: 0 });

  target.dispatch('pointerdown', nonPrimary);
  target.dispatch('pointerdown', secondaryButton);
  target.dispatch('pointerdown', primary);

  assert.equal(actions.length, 1);
  assert.deepEqual(actions[0], {
    type: PRIMARY_ACTION_TYPE,
    source: ACTION_INPUT_SOURCES.POINTER
  });
  assert.equal(nonPrimary.prevented, 0);
  assert.equal(secondaryButton.prevented, 0);
  assert.equal(primary.prevented, 1);
});

test('uses pointer events without registering a duplicate touch fallback', () => {
  const { input, target, actions } = createInput({ supportsPointerEvents: true });
  input.attach();

  assert.equal(input.getState().inputMode, ACTION_INPUT_SOURCES.POINTER);
  assert.equal(target.count('pointerdown'), 1);
  assert.equal(target.count('touchstart'), 0);
  target.dispatch('pointerdown', createEvent({ isPrimary: true, button: 0 }));
  target.dispatch('touchstart', createEvent({ touches: [{}] }));
  assert.equal(actions.length, 1);
});

test('uses single-touch fallback only when pointer events are unavailable', () => {
  const { input, target, actions } = createInput({
    supportsPointerEvents: false,
    preventDefault: true
  });
  input.attach();
  const noTouch = createEvent({ touches: [] });
  const multiTouch = createEvent({ touches: [{}, {}] });
  const singleTouch = createEvent({ touches: [{}] });

  assert.equal(input.getState().inputMode, ACTION_INPUT_SOURCES.TOUCH);
  assert.equal(target.count('pointerdown'), 0);
  assert.equal(target.count('touchstart'), 1);
  target.dispatch('touchstart', noTouch);
  target.dispatch('touchstart', multiTouch);
  target.dispatch('touchstart', singleTouch);

  assert.equal(actions.length, 1);
  assert.equal(actions[0].source, ACTION_INPUT_SOURCES.TOUCH);
  assert.equal(noTouch.prevented, 0);
  assert.equal(multiTouch.prevented, 0);
  assert.equal(singleTouch.prevented, 1);
});

test('gates callbacks while disabled without preventing ignored input', () => {
  let enabled = false;
  const { input, target, actions } = createInput({
    preventDefault: true,
    isEnabled() {
      return enabled;
    }
  });
  input.attach();
  const disabledEvent = createEvent({ isPrimary: true, button: 0 });
  target.dispatch('pointerdown', disabledEvent);
  assert.equal(actions.length, 0);
  assert.equal(disabledEvent.prevented, 0);

  enabled = true;
  const enabledEvent = createEvent({ isPrimary: true, button: 0 });
  target.dispatch('pointerdown', enabledEvent);
  assert.equal(actions.length, 1);
  assert.equal(enabledEvent.prevented, 1);
});

test('accepted input does not prevent default unless explicitly enabled', () => {
  const { input, keyboardTarget, actions } = createInput({ preventDefault: false });
  input.attach();
  const event = createEvent({ code: 'Space' });

  keyboardTarget.dispatch('keydown', event);

  assert.equal(actions.length, 1);
  assert.equal(event.prevented, 0);
});

test('attach and detach are idempotent and replay-style reattachment stays singular', () => {
  const { input, target, keyboardTarget, actions } = createInput();
  input.attach();
  input.attach();
  assert.equal(target.count('pointerdown'), 1);
  assert.equal(keyboardTarget.count('keydown'), 1);

  const stalePointerListener = target.takeListener('pointerdown');
  input.detach();
  input.detach();
  assert.equal(target.count('pointerdown'), 0);
  assert.equal(keyboardTarget.count('keydown'), 0);

  input.attach();
  input.attach();
  assert.equal(target.count('pointerdown'), 1);
  assert.equal(keyboardTarget.count('keydown'), 1);
  stalePointerListener(createEvent({ isPrimary: true, button: 0 }));
  assert.equal(actions.length, 0);

  target.dispatch('pointerdown', createEvent({ isPrimary: true, button: 0 }));
  assert.equal(actions.length, 1);
});

test('teardown is permanent, idempotent, and rejects retained listeners', () => {
  const { input, target, keyboardTarget, actions } = createInput();
  input.attach();
  const stalePointerListener = target.takeListener('pointerdown');
  const staleKeyboardListener = keyboardTarget.takeListener('keydown');

  assert.deepEqual(input.teardown(), {
    attached: false,
    destroyed: true,
    inputMode: ACTION_INPUT_SOURCES.POINTER
  });
  assert.deepEqual(input.teardown(), input.getState());
  assert.deepEqual(input.attach(), input.getState());
  assert.equal(target.count('pointerdown'), 0);
  assert.equal(keyboardTarget.count('keydown'), 0);

  stalePointerListener(createEvent({ isPrimary: true, button: 0 }));
  staleKeyboardListener(createEvent({ code: 'Space' }));
  assert.equal(actions.length, 0);
});
