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

function createResultSummary(options = {}) {
  const challenge = options.challenge;
  const score = options.score;
  const unit = options.unit;
  const message = options.message;

  const validChallenge = challenge
    && typeof challenge.id === 'string'
    && challenge.id.length > 0
    && typeof challenge.title === 'string'
    && challenge.title.length > 0;

  if (!validChallenge) return null;
  if (!Number.isInteger(score) || score < 0 || score > 100000) return null;
  if (typeof unit !== 'string' || unit.length === 0 || unit.length > 20) return null;
  if (typeof message !== 'string' || message.length === 0 || message.length > 120) return null;

  return Object.freeze({
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    score,
    unit,
    message
  });
}

function getTapSprintMessage(taps) {
  if (taps === 0) return 'Try again and build your rhythm.';
  if (taps < 40) return 'Good start. Can you beat it?';
  if (taps < 80) return 'Fast run. Go again?';
  return 'Rapid run. Can you top it?';
}

function createTapSprintResult(state) {
  if (!state || state.status !== 'complete') return null;

  return createResultSummary({
    challenge: featuredChallenge,
    score: state.taps,
    unit: 'taps',
    message: getTapSprintMessage(state.taps)
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    featuredChallenge,
    createTapSprintGame,
    createResultSummary,
    createTapSprintResult,
    getTapSprintMessage
  };
}

if (typeof document !== 'undefined') {
  const discoveryView = document.querySelector('#discovery-view');
  const challengeView = document.querySelector('#challenge-view');
  const resultView = document.querySelector('#result-view');
  const startButton = document.querySelector('#start-challenge');
  const tapButton = document.querySelector('#tap-button');
  const gameBackButton = document.querySelector('#back-to-challenges');
  const timeValue = document.querySelector('#time-value');
  const tapCount = document.querySelector('#tap-count');
  const gameStatus = document.querySelector('#game-status');
  const resultTitle = document.querySelector('#result-title');
  const resultScore = document.querySelector('#result-score');
  const resultUnit = document.querySelector('#result-unit');
  const resultMessage = document.querySelector('#result-message');
  const replayButton = document.querySelector('#replay-challenge');
  const resultBackButton = document.querySelector('#result-back-to-challenges');

  const requiredElements = [
    discoveryView,
    challengeView,
    resultView,
    startButton,
    tapButton,
    gameBackButton,
    timeValue,
    tapCount,
    gameStatus,
    resultTitle,
    resultScore,
    resultUnit,
    resultMessage,
    replayButton,
    resultBackButton
  ];

  if (requiredElements.every(Boolean)) {
    function showView(activeView) {
      discoveryView.hidden = activeView !== discoveryView;
      challengeView.hidden = activeView !== challengeView;
      resultView.hidden = activeView !== resultView;
    }

    function renderResult(summary) {
      if (!summary) {
        showDiscovery();
        return false;
      }

      resultTitle.textContent = summary.challengeTitle;
      resultScore.textContent = String(summary.score);
      resultUnit.textContent = summary.unit;
      resultMessage.textContent = summary.message;
      showView(resultView);
      replayButton.focus();
      return true;
    }

    const game = createTapSprintGame({
      onUpdate(state) {
        timeValue.textContent = String(state.remainingSeconds);
        tapCount.textContent = String(state.taps);

        const isRunning = state.status === 'running';
        tapButton.disabled = !isRunning;
        tapButton.textContent = isRunning ? 'Tap!' : 'Time!';

        if (isRunning) gameStatus.textContent = 'Go!';
        if (state.status === 'complete') gameStatus.textContent = 'Complete';
        if (state.status === 'idle') gameStatus.textContent = 'Ready';
      },
      onComplete(state) {
        renderResult(createTapSprintResult(state));
      }
    });

    function startAttempt() {
      showView(challengeView);
      game.start();
      tapButton.focus();
    }

    function showDiscovery() {
      game.reset();
      showView(discoveryView);
      startButton.focus();
    }

    startButton.addEventListener('click', startAttempt);
    tapButton.addEventListener('click', () => game.tap());
    replayButton.addEventListener('click', startAttempt);
    gameBackButton.addEventListener('click', showDiscovery);
    resultBackButton.addEventListener('click', showDiscovery);
  }
}
