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

function createResultSummary(taps, durationSeconds = featuredChallenge.durationSeconds) {
  if (!Number.isInteger(taps) || taps < 0) {
    throw new TypeError('Tap score must be a non-negative integer.');
  }
  if (!Number.isInteger(durationSeconds) || durationSeconds <= 0 || durationSeconds > 300) {
    throw new TypeError('Duration must be an integer from 1 to 300 seconds.');
  }

  const tapsPerSecond = taps / durationSeconds;
  let message = 'Try again and build your rhythm.';

  if (tapsPerSecond >= 4) message = 'Fast finish. Can you beat this score?';
  else if (tapsPerSecond >= 2) message = 'Strong pace. Try again and push it higher.';
  else if (taps > 0) message = 'Good start. A steadier rhythm can raise it.';

  return Object.freeze({ taps, durationSeconds, message });
}

if (typeof module !== 'undefined') {
  module.exports = { featuredChallenge, createTapSprintGame, createResultSummary };
}

if (typeof document !== 'undefined') {
  const discoveryView = document.querySelector('#discovery-view');
  const challengeView = document.querySelector('#challenge-view');
  const resultView = document.querySelector('#result-view');
  const startButton = document.querySelector('#start-challenge');
  const tapButton = document.querySelector('#tap-button');
  const backButton = document.querySelector('#back-to-challenges');
  const resultReplayButton = document.querySelector('#result-replay');
  const resultBackButton = document.querySelector('#result-back');
  const timeValue = document.querySelector('#time-value');
  const tapCount = document.querySelector('#tap-count');
  const gameStatus = document.querySelector('#game-status');
  const resultScore = document.querySelector('#result-score');
  const resultMessage = document.querySelector('#result-message');
  const resultAnnouncement = document.querySelector('#result-announcement');

  const requiredElements = [
    discoveryView,
    challengeView,
    resultView,
    startButton,
    tapButton,
    backButton,
    resultReplayButton,
    resultBackButton,
    timeValue,
    tapCount,
    gameStatus,
    resultScore,
    resultMessage,
    resultAnnouncement
  ];

  if (requiredElements.every(Boolean)) {
    const game = createTapSprintGame({
      onUpdate(state) {
        timeValue.textContent = String(state.remainingSeconds);
        tapCount.textContent = String(state.taps);

        const isRunning = state.status === 'running';
        tapButton.disabled = !isRunning;
        tapButton.textContent = isRunning ? 'Tap!' : 'Time!';
        gameStatus.textContent = isRunning ? 'Go!' : 'Ready';
      },
      onComplete(state) {
        const result = createResultSummary(state.taps, state.durationSeconds);
        resultScore.textContent = String(result.taps);
        resultMessage.textContent = result.message;
        resultAnnouncement.textContent = `You scored ${result.taps} taps.`;
        challengeView.hidden = true;
        resultView.hidden = false;
        resultReplayButton.focus();
      }
    });

    function startAttempt() {
      discoveryView.hidden = true;
      resultView.hidden = true;
      challengeView.hidden = false;
      game.start();
      tapButton.focus();
    }

    function returnToDiscovery() {
      game.reset();
      challengeView.hidden = true;
      resultView.hidden = true;
      discoveryView.hidden = false;
      startButton.focus();
    }

    startButton.addEventListener('click', startAttempt);
    tapButton.addEventListener('click', () => game.tap());
    resultReplayButton.addEventListener('click', startAttempt);
    backButton.addEventListener('click', returnToDiscovery);
    resultBackButton.addEventListener('click', returnToDiscovery);
  }
}
