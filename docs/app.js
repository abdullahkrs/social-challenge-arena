const featuredChallenge = Object.freeze({
  id: 'tap-sprint',
  title: 'Tap Sprint',
  category: 'Speed',
  difficulty: 'Easy',
  durationSeconds: 20,
  description: 'Tap as many times as you can before time runs out.',
  goal: 'Get the highest tap count in 20 seconds.'
});

function createTapSprintGame(options = {}) {
  const durationSeconds = Number.isInteger(options.durationSeconds)
    && options.durationSeconds > 0
    && options.durationSeconds <= 300
    ? options.durationSeconds
    : featuredChallenge.durationSeconds;
  const onUpdate = typeof options.onUpdate === 'function' ? options.onUpdate : () => {};
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const setIntervalFn = options.setIntervalFn || setInterval;
  const clearIntervalFn = options.clearIntervalFn || clearInterval;

  let status = 'idle';
  let taps = 0;
  let remainingSeconds = durationSeconds;
  let timerId = null;

  function getState() {
    return Object.freeze({ status, taps, remainingSeconds, durationSeconds });
  }

  function emitUpdate() {
    const snapshot = getState();
    onUpdate(snapshot);
    return snapshot;
  }

  function stopTimer() {
    if (timerId !== null) {
      clearIntervalFn(timerId);
      timerId = null;
    }
  }

  function complete() {
    stopTimer();
    status = 'complete';
    remainingSeconds = 0;
    const snapshot = emitUpdate();
    onComplete(snapshot);
    return snapshot;
  }

  function start() {
    stopTimer();
    status = 'running';
    taps = 0;
    remainingSeconds = durationSeconds;
    const snapshot = emitUpdate();

    timerId = setIntervalFn(() => {
      if (status !== 'running') return;
      remainingSeconds = Math.max(0, remainingSeconds - 1);
      if (remainingSeconds === 0) complete();
      else emitUpdate();
    }, 1000);

    return snapshot;
  }

  function tap() {
    if (status !== 'running') return getState();
    taps += 1;
    return emitUpdate();
  }

  function reset() {
    stopTimer();
    status = 'idle';
    taps = 0;
    remainingSeconds = durationSeconds;
    return emitUpdate();
  }

  function destroy() {
    stopTimer();
  }

  return Object.freeze({ start, tap, reset, destroy, getState });
}

if (typeof module !== 'undefined') {
  module.exports = { featuredChallenge, createTapSprintGame };
}

if (typeof document !== 'undefined') {
  const discoveryView = document.querySelector('#discovery-view');
  const challengeView = document.querySelector('#challenge-view');
  const startButton = document.querySelector('#start-challenge');
  const tapButton = document.querySelector('#tap-button');
  const replayButton = document.querySelector('#replay-challenge');
  const backButton = document.querySelector('#back-to-challenges');
  const timeValue = document.querySelector('#time-value');
  const tapCount = document.querySelector('#tap-count');
  const gameStatus = document.querySelector('#game-status');

  const requiredElements = [
    discoveryView,
    challengeView,
    startButton,
    tapButton,
    replayButton,
    backButton,
    timeValue,
    tapCount,
    gameStatus
  ];

  if (requiredElements.every(Boolean)) {
    const game = createTapSprintGame({
      onUpdate(state) {
        timeValue.textContent = String(state.remainingSeconds);
        tapCount.textContent = String(state.taps);

        const isRunning = state.status === 'running';
        tapButton.disabled = !isRunning;
        tapButton.textContent = isRunning ? 'Tap!' : 'Time!';
        replayButton.hidden = state.status !== 'complete';

        if (isRunning) gameStatus.textContent = 'Go!';
        if (state.status === 'complete') {
          gameStatus.textContent = `Finished with ${state.taps} taps.`;
        }
        if (state.status === 'idle') gameStatus.textContent = 'Ready';
      }
    });

    function openChallenge() {
      discoveryView.hidden = true;
      challengeView.hidden = false;
      game.start();
      tapButton.focus();
    }

    startButton.addEventListener('click', openChallenge);
    tapButton.addEventListener('click', () => game.tap());
    replayButton.addEventListener('click', () => {
      game.start();
      tapButton.focus();
    });
    backButton.addEventListener('click', () => {
      game.reset();
      challengeView.hidden = true;
      discoveryView.hidden = false;
      startButton.focus();
    });
  }
}
