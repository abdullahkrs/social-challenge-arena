const featuredChallenge = Object.freeze({
  id: 'tap-sprint',
  title: 'Tap Sprint',
  category: 'Speed',
  difficulty: 'Easy',
  durationSeconds: 20,
  description: 'Tap as many times as you can before time runs out.',
  goal: 'Get the highest tap count in 20 seconds.'
});

const sharedResultVersion = 1;
const maxSharedScore = 1000000;

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

function validateSharedResult(taps, durationSeconds) {
  const result = createResultSummary(taps, durationSeconds);
  if (result.taps > maxSharedScore) {
    throw new TypeError(`Tap score must not exceed ${maxSharedScore}.`);
  }
  if (result.durationSeconds !== featuredChallenge.durationSeconds) {
    throw new TypeError('Shared duration must match the featured challenge.');
  }
  return result;
}

function createSharedResultUrl(taps, durationSeconds, baseUrl) {
  const result = validateSharedResult(taps, durationSeconds);
  const url = new URL(baseUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('Share URL must use HTTP or HTTPS.');
  }

  url.search = '';
  url.hash = new URLSearchParams({
    v: String(sharedResultVersion),
    challenge: featuredChallenge.id,
    score: String(result.taps),
    duration: String(result.durationSeconds)
  }).toString();
  return url.toString();
}

function parseSharedResultHash(hash) {
  if (typeof hash !== 'string' || hash.length < 2 || hash.length > 180) return null;
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const expectedKeys = ['v', 'challenge', 'score', 'duration'];
  const keys = Array.from(params.keys());

  if (keys.length !== expectedKeys.length) return null;
  if (expectedKeys.some(key => params.getAll(key).length !== 1)) return null;
  if (keys.some(key => !expectedKeys.includes(key))) return null;
  if (params.get('v') !== String(sharedResultVersion)) return null;
  if (params.get('challenge') !== featuredChallenge.id) return null;

  const scoreText = params.get('score');
  const durationText = params.get('duration');
  if (!/^(0|[1-9]\d{0,6})$/.test(scoreText || '')) return null;
  if (!/^[1-9]\d{0,2}$/.test(durationText || '')) return null;

  const taps = Number(scoreText);
  const durationSeconds = Number(durationText);

  try {
    validateSharedResult(taps, durationSeconds);
  } catch {
    return null;
  }

  return Object.freeze({
    version: sharedResultVersion,
    challengeId: featuredChallenge.id,
    taps,
    durationSeconds
  });
}

function createFriendAttemptInvitation(sharedResult) {
  if (!sharedResult || typeof sharedResult !== 'object') {
    throw new TypeError('Shared result is required.');
  }

  const expectedKeys = ['version', 'challengeId', 'taps', 'durationSeconds'];
  const keys = Object.keys(sharedResult);
  if (keys.length !== expectedKeys.length || keys.some(key => !expectedKeys.includes(key))) {
    throw new TypeError('Shared result has an invalid shape.');
  }
  if (sharedResult.version !== sharedResultVersion) {
    throw new TypeError('Shared result version is unsupported.');
  }
  if (sharedResult.challengeId !== featuredChallenge.id) {
    throw new TypeError('Shared challenge is unsupported.');
  }

  const validated = validateSharedResult(sharedResult.taps, sharedResult.durationSeconds);
  return Object.freeze({
    challengeId: featuredChallenge.id,
    challengeTitle: featuredChallenge.title,
    targetTaps: validated.taps,
    durationSeconds: validated.durationSeconds
  });
}

function clearSharedResultHash(locationObject, historyObject) {
  if (!locationObject || !historyObject || typeof historyObject.replaceState !== 'function') {
    return false;
  }

  const pathname = typeof locationObject.pathname === 'string'
    && locationObject.pathname.startsWith('/')
    && !locationObject.pathname.startsWith('//')
    ? locationObject.pathname
    : '/';
  const search = typeof locationObject.search === 'string' && locationObject.search.startsWith('?')
    ? locationObject.search
    : '';

  try {
    historyObject.replaceState(null, '', `${pathname}${search}`);
    return true;
  } catch {
    return false;
  }
}

async function shareResultLink(url, options = {}) {
  let normalizedUrl;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') return 'unavailable';
    normalizedUrl = parsedUrl.toString();
  } catch {
    return 'unavailable';
  }

  const navigatorObject = options.navigatorObject
    || (typeof navigator !== 'undefined' ? navigator : null);
  const payload = {
    title: featuredChallenge.title,
    text: options.text || 'Can you beat my Tap Sprint score?',
    url: normalizedUrl
  };

  if (navigatorObject && typeof navigatorObject.share === 'function') {
    try {
      await navigatorObject.share(payload);
      return 'shared';
    } catch (error) {
      if (error && error.name === 'AbortError') return 'cancelled';
    }
  }

  if (navigatorObject?.clipboard && typeof navigatorObject.clipboard.writeText === 'function') {
    try {
      await navigatorObject.clipboard.writeText(normalizedUrl);
      return 'copied';
    } catch {
      return 'unavailable';
    }
  }

  return 'unavailable';
}

if (typeof module !== 'undefined') {
  module.exports = {
    featuredChallenge,
    createTapSprintGame,
    createResultSummary,
    createSharedResultUrl,
    parseSharedResultHash,
    createFriendAttemptInvitation,
    clearSharedResultHash,
    shareResultLink
  };
}

if (typeof document !== 'undefined') {
  const friendView = document.querySelector('#friend-view');
  const discoveryView = document.querySelector('#discovery-view');
  const challengeView = document.querySelector('#challenge-view');
  const resultView = document.querySelector('#result-view');
  const friendChallengeName = document.querySelector('#friend-challenge-name');
  const friendDuration = document.querySelector('#friend-duration');
  const friendTargetScore = document.querySelector('#friend-target-score');
  const friendAnnouncement = document.querySelector('#friend-announcement');
  const startFriendButton = document.querySelector('#start-friend-attempt');
  const dismissFriendButton = document.querySelector('#dismiss-friend-attempt');
  const startButton = document.querySelector('#start-challenge');
  const tapButton = document.querySelector('#tap-button');
  const backButton = document.querySelector('#back-to-challenges');
  const shareButton = document.querySelector('#share-result');
  const resultReplayButton = document.querySelector('#result-replay');
  const resultBackButton = document.querySelector('#result-back');
  const timeValue = document.querySelector('#time-value');
  const tapCount = document.querySelector('#tap-count');
  const gameStatus = document.querySelector('#game-status');
  const resultScore = document.querySelector('#result-score');
  const resultMessage = document.querySelector('#result-message');
  const resultAnnouncement = document.querySelector('#result-announcement');
  const shareStatus = document.querySelector('#share-status');
  const shareFallback = document.querySelector('#share-fallback');
  const canonicalLink = document.querySelector('link[rel="canonical"]');

  const requiredElements = [
    friendView,
    discoveryView,
    challengeView,
    resultView,
    friendChallengeName,
    friendDuration,
    friendTargetScore,
    friendAnnouncement,
    startFriendButton,
    dismissFriendButton,
    startButton,
    tapButton,
    backButton,
    shareButton,
    resultReplayButton,
    resultBackButton,
    timeValue,
    tapCount,
    gameStatus,
    resultScore,
    resultMessage,
    resultAnnouncement,
    shareStatus,
    shareFallback,
    canonicalLink
  ];

  if (requiredElements.every(Boolean)) {
    let completedResult = null;
    let activeFriendInvitation = null;

    const incomingShare = parseSharedResultHash(window.location.hash);
    if (window.location.hash && !incomingShare) {
      clearSharedResultHash(window.location, window.history);
    }

    function resetShareState() {
      shareStatus.textContent = '';
      shareFallback.hidden = true;
      shareFallback.removeAttribute('href');
      shareFallback.textContent = 'Open score link';
    }

    function showFriendInvitation(invitation) {
      activeFriendInvitation = invitation;
      friendChallengeName.textContent = invitation.challengeTitle;
      friendDuration.textContent = String(invitation.durationSeconds);
      friendTargetScore.textContent = String(invitation.targetTaps);
      discoveryView.hidden = true;
      challengeView.hidden = true;
      resultView.hidden = true;
      friendView.hidden = false;
      friendAnnouncement.textContent = `${invitation.challengeTitle} challenge. Beat ${invitation.targetTaps} taps in ${invitation.durationSeconds} seconds.`;
      startFriendButton.focus();
    }

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
        completedResult = createResultSummary(state.taps, state.durationSeconds);
        resultScore.textContent = String(completedResult.taps);
        resultMessage.textContent = completedResult.message;
        challengeView.hidden = true;
        resultView.hidden = false;
        resultAnnouncement.textContent = `You scored ${completedResult.taps} taps.`;
        shareButton.focus();
      }
    });

    function startAttempt() {
      completedResult = null;
      friendAnnouncement.textContent = '';
      resultAnnouncement.textContent = '';
      resetShareState();
      friendView.hidden = true;
      discoveryView.hidden = true;
      resultView.hidden = true;
      challengeView.hidden = false;
      game.start();
      tapButton.focus();
    }

    function returnToDiscovery() {
      activeFriendInvitation = null;
      completedResult = null;
      game.reset();
      friendAnnouncement.textContent = '';
      resultAnnouncement.textContent = '';
      resetShareState();
      clearSharedResultHash(window.location, window.history);
      friendView.hidden = true;
      challengeView.hidden = true;
      resultView.hidden = true;
      discoveryView.hidden = false;
      startButton.focus();
    }

    async function shareCompletedResult() {
      if (!completedResult) return;

      const shareUrl = createSharedResultUrl(
        completedResult.taps,
        completedResult.durationSeconds,
        canonicalLink.href
      );
      shareFallback.href = shareUrl;
      shareFallback.textContent = shareUrl;

      const outcome = await shareResultLink(shareUrl, {
        text: `I scored ${completedResult.taps} taps in Tap Sprint. Can you beat it?`
      });

      if (outcome === 'shared') {
        shareStatus.textContent = 'Shared.';
        shareFallback.hidden = true;
      } else if (outcome === 'copied') {
        shareStatus.textContent = 'Link copied.';
        shareFallback.hidden = true;
      } else if (outcome === 'cancelled') {
        shareStatus.textContent = 'Share cancelled.';
        shareFallback.hidden = true;
      } else {
        shareStatus.textContent = 'Link ready below.';
        shareFallback.hidden = false;
      }
    }

    startFriendButton.addEventListener('click', startAttempt);
    dismissFriendButton.addEventListener('click', returnToDiscovery);
    startButton.addEventListener('click', startAttempt);
    tapButton.addEventListener('click', () => game.tap());
    shareButton.addEventListener('click', shareCompletedResult);
    resultReplayButton.addEventListener('click', startAttempt);
    backButton.addEventListener('click', returnToDiscovery);
    resultBackButton.addEventListener('click', returnToDiscovery);

    if (incomingShare) {
      showFriendInvitation(createFriendAttemptInvitation(incomingShare));
    }
  }
}
