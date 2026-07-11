const curatedChallenges = Object.freeze([
  Object.freeze({
    id: 'tap-sprint',
    title: 'Tap Sprint',
    category: 'Speed',
    difficulty: 'Easy',
    durationSeconds: 20,
    description: 'Tap as many times as you can before time runs out.',
    goal: 'Get the highest tap count in 20 seconds.',
    instruction: 'Tap fast until time runs out.'
  }),
  Object.freeze({
    id: 'turbo-tap',
    title: 'Turbo Tap',
    category: 'Speed',
    difficulty: 'Hard',
    durationSeconds: 10,
    description: 'A short burst where every tap matters.',
    goal: 'Get the highest tap count in 10 seconds.',
    instruction: 'Go all out for 10 seconds.'
  }),
  Object.freeze({
    id: 'rhythm-rush',
    title: 'Rhythm Rush',
    category: 'Rhythm',
    difficulty: 'Easy',
    durationSeconds: 25,
    description: 'Find a steady rhythm and keep it moving.',
    goal: 'Build the highest steady tap count in 25 seconds.',
    instruction: 'Find your rhythm and keep tapping.'
  }),
  Object.freeze({
    id: 'tempo-storm',
    title: 'Tempo Storm',
    category: 'Rhythm',
    difficulty: 'Hard',
    durationSeconds: 15,
    description: 'Hold a fast rhythm through a compact round.',
    goal: 'Set the highest tap count in 15 seconds.',
    instruction: 'Hold a fast rhythm to the finish.'
  }),
  Object.freeze({
    id: 'tap-marathon',
    title: 'Tap Marathon',
    category: 'Endurance',
    difficulty: 'Easy',
    durationSeconds: 30,
    description: 'Keep a comfortable pace through a longer round.',
    goal: 'Get the highest tap count in 30 seconds.',
    instruction: 'Stay steady through the longer round.'
  }),
  Object.freeze({
    id: 'endurance-blitz',
    title: 'Endurance Blitz',
    category: 'Endurance',
    difficulty: 'Hard',
    durationSeconds: 45,
    description: 'Keep tapping through the longest curated round.',
    goal: 'Get the highest tap count in 45 seconds.',
    instruction: 'Keep your pace until the final second.'
  })
]);

const featuredChallenge = curatedChallenges[0];
const sharedResultVersion = 1;
const maxSharedScore = 1000000;

function getChallengeById(challengeId) {
  return curatedChallenges.find(challenge => challenge.id === challengeId) || null;
}

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

function validateSharedResult(taps, durationSeconds, challenge = featuredChallenge) {
  const result = createResultSummary(taps, durationSeconds);
  if (!challenge || !getChallengeById(challenge.id)) {
    throw new TypeError('Shared challenge is unsupported.');
  }
  if (result.taps > maxSharedScore) {
    throw new TypeError(`Tap score must not exceed ${maxSharedScore}.`);
  }
  if (result.durationSeconds !== challenge.durationSeconds) {
    throw new TypeError('Shared duration must match the selected challenge.');
  }
  return result;
}

function createSharedResultUrl(
  taps,
  durationSeconds,
  baseUrl,
  challengeId = featuredChallenge.id
) {
  const challenge = getChallengeById(challengeId);
  if (!challenge) throw new TypeError('Shared challenge is unsupported.');
  const result = validateSharedResult(taps, durationSeconds, challenge);
  const url = new URL(baseUrl);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('Share URL must use HTTP or HTTPS.');
  }

  url.search = '';
  url.hash = new URLSearchParams({
    v: String(sharedResultVersion),
    challenge: challenge.id,
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

  const challenge = getChallengeById(params.get('challenge'));
  if (!challenge) return null;

  const scoreText = params.get('score');
  const durationText = params.get('duration');
  if (!/^(0|[1-9]\d{0,6})$/.test(scoreText || '')) return null;
  if (!/^[1-9]\d{0,2}$/.test(durationText || '')) return null;

  const taps = Number(scoreText);
  const durationSeconds = Number(durationText);

  try {
    validateSharedResult(taps, durationSeconds, challenge);
  } catch {
    return null;
  }

  return Object.freeze({
    version: sharedResultVersion,
    challengeId: challenge.id,
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

  const challenge = getChallengeById(sharedResult.challengeId);
  if (!challenge) throw new TypeError('Shared challenge is unsupported.');

  const validated = validateSharedResult(
    sharedResult.taps,
    sharedResult.durationSeconds,
    challenge
  );
  return Object.freeze({
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    targetTaps: validated.taps,
    durationSeconds: validated.durationSeconds
  });
}

function createComparisonSummary(friendTaps, invitation) {
  if (!invitation || typeof invitation !== 'object') {
    throw new TypeError('Friend invitation is required.');
  }

  const expectedKeys = ['challengeId', 'challengeTitle', 'targetTaps', 'durationSeconds'];
  const keys = Object.keys(invitation);
  if (keys.length !== expectedKeys.length || keys.some(key => !expectedKeys.includes(key))) {
    throw new TypeError('Friend invitation has an invalid shape.');
  }

  const challenge = getChallengeById(invitation.challengeId);
  if (!challenge || invitation.challengeTitle !== challenge.title) {
    throw new TypeError('Friend invitation challenge is unsupported.');
  }

  const target = validateSharedResult(
    invitation.targetTaps,
    invitation.durationSeconds,
    challenge
  );
  const friend = validateSharedResult(friendTaps, invitation.durationSeconds, challenge);
  const difference = friend.taps - target.taps;

  let outcome = 'tie';
  let headline = 'It is a tie';
  let message = `Both scored ${target.taps} taps.`;

  if (difference > 0) {
    outcome = 'beat';
    headline = 'You beat it';
    message = `${difference} tap${difference === 1 ? '' : 's'} ahead.`;
  } else if (difference < 0) {
    const shortBy = Math.abs(difference);
    outcome = 'short';
    headline = 'So close';
    message = `${shortBy} tap${shortBy === 1 ? '' : 's'} short.`;
  }

  return Object.freeze({
    challengeId: challenge.id,
    challengeTitle: challenge.title,
    targetTaps: target.taps,
    friendTaps: friend.taps,
    durationSeconds: friend.durationSeconds,
    difference,
    outcome,
    headline,
    message
  });
}

function createComparisonShareUrl(comparison, baseUrl) {
  if (!comparison || typeof comparison !== 'object') {
    throw new TypeError('Completed comparison is required.');
  }

  const expectedKeys = [
    'challengeId',
    'challengeTitle',
    'targetTaps',
    'friendTaps',
    'durationSeconds',
    'difference',
    'outcome',
    'headline',
    'message'
  ];
  const keys = Object.keys(comparison);
  if (keys.length !== expectedKeys.length || keys.some(key => !expectedKeys.includes(key))) {
    throw new TypeError('Completed comparison has an invalid shape.');
  }

  const validated = createComparisonSummary(comparison.friendTaps, {
    challengeId: comparison.challengeId,
    challengeTitle: comparison.challengeTitle,
    targetTaps: comparison.targetTaps,
    durationSeconds: comparison.durationSeconds
  });

  if (expectedKeys.some(key => comparison[key] !== validated[key])) {
    throw new TypeError('Completed comparison is inconsistent.');
  }

  return createSharedResultUrl(
    validated.friendTaps,
    validated.durationSeconds,
    baseUrl,
    validated.challengeId
  );
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
    title: options.title || featuredChallenge.title,
    text: options.text || 'Can you beat my challenge score?',
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
    curatedChallenges,
    featuredChallenge,
    getChallengeById,
    createTapSprintGame,
    createResultSummary,
    createSharedResultUrl,
    parseSharedResultHash,
    createFriendAttemptInvitation,
    createComparisonSummary,
    createComparisonShareUrl,
    clearSharedResultHash,
    shareResultLink
  };
}

if (typeof document !== 'undefined') {
  const friendView = document.querySelector('#friend-view');
  const discoveryView = document.querySelector('#discovery-view');
  const challengeView = document.querySelector('#challenge-view');
  const resultView = document.querySelector('#result-view');
  const comparisonView = document.querySelector('#comparison-view');
  const challengeList = document.querySelector('#challenge-list');
  const selectedCategory = document.querySelector('#selected-category');
  const selectedTitle = document.querySelector('#selected-title');
  const selectedMeta = document.querySelector('#selected-meta');
  const friendChallengeName = document.querySelector('#friend-challenge-name');
  const friendDuration = document.querySelector('#friend-duration');
  const friendTargetScore = document.querySelector('#friend-target-score');
  const friendAnnouncement = document.querySelector('#friend-announcement');
  const startFriendButton = document.querySelector('#start-friend-attempt');
  const dismissFriendButton = document.querySelector('#dismiss-friend-attempt');
  const startButton = document.querySelector('#start-challenge');
  const gameEyebrow = document.querySelector('#game-eyebrow');
  const gameTitle = document.querySelector('#game-title');
  const gameInstruction = document.querySelector('#game-instruction');
  const tapButton = document.querySelector('#tap-button');
  const backButton = document.querySelector('#back-to-challenges');
  const resultEyebrow = document.querySelector('#result-eyebrow');
  const shareButton = document.querySelector('#share-result');
  const resultReplayButton = document.querySelector('#result-replay');
  const resultBackButton = document.querySelector('#result-back');
  const comparisonEyebrow = document.querySelector('#comparison-eyebrow');
  const comparisonScores = document.querySelector('#comparison-scores');
  const comparisonTargetScore = document.querySelector('#comparison-target-score');
  const comparisonFriendScore = document.querySelector('#comparison-friend-score');
  const comparisonOutcome = document.querySelector('#comparison-outcome');
  const comparisonMessage = document.querySelector('#comparison-message');
  const comparisonAnnouncement = document.querySelector('#comparison-announcement');
  const comparisonShareButton = document.querySelector('#share-again');
  const comparisonShareStatus = document.querySelector('#comparison-share-status');
  const comparisonShareFallback = document.querySelector('#comparison-share-fallback');
  const comparisonReplayButton = document.querySelector('#comparison-replay');
  const comparisonBackButton = document.querySelector('#comparison-back');
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
    comparisonView,
    challengeList,
    selectedCategory,
    selectedTitle,
    selectedMeta,
    friendChallengeName,
    friendDuration,
    friendTargetScore,
    friendAnnouncement,
    startFriendButton,
    dismissFriendButton,
    startButton,
    gameEyebrow,
    gameTitle,
    gameInstruction,
    tapButton,
    backButton,
    resultEyebrow,
    shareButton,
    resultReplayButton,
    resultBackButton,
    comparisonEyebrow,
    comparisonScores,
    comparisonTargetScore,
    comparisonFriendScore,
    comparisonOutcome,
    comparisonMessage,
    comparisonAnnouncement,
    comparisonShareButton,
    comparisonShareStatus,
    comparisonShareFallback,
    comparisonReplayButton,
    comparisonBackButton,
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
    let activeChallenge = featuredChallenge;
    let completedResult = null;
    let completedComparison = null;
    let activeFriendInvitation = null;
    let game = null;

    const incomingShare = parseSharedResultHash(window.location.hash);
    if (window.location.hash && !incomingShare) {
      clearSharedResultHash(window.location, window.history);
    }

    function resetShareState(statusElement, fallbackElement) {
      statusElement.textContent = '';
      fallbackElement.hidden = true;
      fallbackElement.removeAttribute('href');
      fallbackElement.textContent = 'Open score link';
    }

    function resetAllShareStates() {
      resetShareState(shareStatus, shareFallback);
      resetShareState(comparisonShareStatus, comparisonShareFallback);
    }

    function showShareOutcome(outcome, statusElement, fallbackElement) {
      if (outcome === 'shared') {
        statusElement.textContent = 'Shared.';
        fallbackElement.hidden = true;
      } else if (outcome === 'copied') {
        statusElement.textContent = 'Link copied.';
        fallbackElement.hidden = true;
      } else if (outcome === 'cancelled') {
        statusElement.textContent = 'Share cancelled.';
        fallbackElement.hidden = true;
      } else {
        statusElement.textContent = 'Link ready below.';
        fallbackElement.hidden = false;
      }
    }

    function updateSelectedChallenge() {
      selectedCategory.textContent = activeChallenge.category;
      selectedTitle.textContent = activeChallenge.title;
      selectedMeta.textContent = `${activeChallenge.difficulty} · ${activeChallenge.durationSeconds} sec`;
      startButton.textContent = `Play ${activeChallenge.title}`;

      for (const option of challengeList.querySelectorAll('[data-challenge-id]')) {
        const selected = option.dataset.challengeId === activeChallenge.id;
        option.setAttribute('aria-pressed', selected ? 'true' : 'false');
      }
    }

    function selectChallenge(challenge) {
      if (!challenge) return;
      activeChallenge = challenge;
      updateSelectedChallenge();
    }

    function renderChallengeCatalog() {
      const fragment = document.createDocumentFragment();

      for (const challenge of curatedChallenges) {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'challenge-option';
        option.dataset.challengeId = challenge.id;
        option.setAttribute('aria-pressed', 'false');
        option.setAttribute(
          'aria-label',
          `${challenge.title}, ${challenge.category}, ${challenge.difficulty}, ${challenge.durationSeconds} seconds`
        );

        const category = document.createElement('span');
        category.className = 'challenge-option-category';
        category.textContent = challenge.category;

        const title = document.createElement('strong');
        title.textContent = challenge.title;

        const meta = document.createElement('span');
        meta.className = 'challenge-option-meta';
        meta.textContent = `${challenge.difficulty} · ${challenge.durationSeconds}s`;

        option.append(category, title, meta);
        option.addEventListener('click', () => selectChallenge(challenge));
        fragment.append(option);
      }

      challengeList.replaceChildren(fragment);
      updateSelectedChallenge();
    }

    function showFriendInvitation(invitation) {
      activeFriendInvitation = invitation;
      activeChallenge = getChallengeById(invitation.challengeId);
      updateSelectedChallenge();
      friendChallengeName.textContent = invitation.challengeTitle;
      friendDuration.textContent = String(invitation.durationSeconds);
      friendTargetScore.textContent = String(invitation.targetTaps);
      discoveryView.hidden = true;
      challengeView.hidden = true;
      resultView.hidden = true;
      comparisonView.hidden = true;
      friendView.hidden = false;
      friendAnnouncement.textContent = `${invitation.challengeTitle} challenge. Beat ${invitation.targetTaps} taps in ${invitation.durationSeconds} seconds.`;
      startFriendButton.focus();
    }

    function showComparison(comparison) {
      completedComparison = comparison;
      resetShareState(comparisonShareStatus, comparisonShareFallback);
      comparisonEyebrow.textContent = `${comparison.challengeTitle} complete`;
      comparisonScores.setAttribute('aria-label', `${comparison.challengeTitle} score comparison`);
      comparisonTargetScore.textContent = String(comparison.targetTaps);
      comparisonFriendScore.textContent = String(comparison.friendTaps);
      comparisonOutcome.textContent = comparison.headline;
      comparisonMessage.textContent = comparison.message;
      friendView.hidden = true;
      discoveryView.hidden = true;
      challengeView.hidden = true;
      resultView.hidden = true;
      comparisonView.hidden = false;
      comparisonAnnouncement.textContent = `${comparison.headline}. Target ${comparison.targetTaps} taps. You scored ${comparison.friendTaps} taps. ${comparison.message}`;
      comparisonShareButton.focus();
    }

    function configureGame() {
      if (game) game.destroy();

      gameEyebrow.textContent = `${activeChallenge.category} challenge`;
      gameTitle.textContent = activeChallenge.title;
      gameInstruction.textContent = activeChallenge.instruction;
      timeValue.textContent = String(activeChallenge.durationSeconds);
      tapCount.textContent = '0';

      game = createTapSprintGame({
        durationSeconds: activeChallenge.durationSeconds,
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
          challengeView.hidden = true;

          if (activeFriendInvitation) {
            showComparison(createComparisonSummary(completedResult.taps, activeFriendInvitation));
            return;
          }

          completedComparison = null;
          resultEyebrow.textContent = `${activeChallenge.title} complete`;
          resultScore.textContent = String(completedResult.taps);
          resultMessage.textContent = completedResult.message;
          comparisonView.hidden = true;
          resultView.hidden = false;
          resultAnnouncement.textContent = `You scored ${completedResult.taps} taps in ${activeChallenge.title}.`;
          shareButton.focus();
        }
      });
    }

    function startAttempt() {
      completedResult = null;
      completedComparison = null;
      friendAnnouncement.textContent = '';
      resultAnnouncement.textContent = '';
      comparisonAnnouncement.textContent = '';
      resetAllShareStates();
      friendView.hidden = true;
      discoveryView.hidden = true;
      resultView.hidden = true;
      comparisonView.hidden = true;
      challengeView.hidden = false;
      configureGame();
      game.start();
      tapButton.focus();
    }

    function returnToDiscovery() {
      activeFriendInvitation = null;
      completedResult = null;
      completedComparison = null;
      if (game) game.reset();
      friendAnnouncement.textContent = '';
      resultAnnouncement.textContent = '';
      comparisonAnnouncement.textContent = '';
      resetAllShareStates();
      clearSharedResultHash(window.location, window.history);
      friendView.hidden = true;
      challengeView.hidden = true;
      resultView.hidden = true;
      comparisonView.hidden = true;
      discoveryView.hidden = false;
      updateSelectedChallenge();
      startButton.focus();
    }

    async function shareCompletedResult() {
      if (!completedResult) return;

      const shareUrl = createSharedResultUrl(
        completedResult.taps,
        completedResult.durationSeconds,
        canonicalLink.href,
        activeChallenge.id
      );
      shareFallback.href = shareUrl;
      shareFallback.textContent = shareUrl;

      const outcome = await shareResultLink(shareUrl, {
        title: activeChallenge.title,
        text: `I scored ${completedResult.taps} taps in ${activeChallenge.title}. Can you beat it?`
      });

      showShareOutcome(outcome, shareStatus, shareFallback);
    }

    async function shareCompletedComparison() {
      if (!completedComparison) return;

      const shareUrl = createComparisonShareUrl(completedComparison, canonicalLink.href);
      comparisonShareFallback.href = shareUrl;
      comparisonShareFallback.textContent = shareUrl;

      const outcome = await shareResultLink(shareUrl, {
        title: completedComparison.challengeTitle,
        text: `I scored ${completedComparison.friendTaps} taps in ${completedComparison.challengeTitle}. Can you beat it?`
      });

      showShareOutcome(outcome, comparisonShareStatus, comparisonShareFallback);
    }

    renderChallengeCatalog();

    startFriendButton.addEventListener('click', startAttempt);
    dismissFriendButton.addEventListener('click', returnToDiscovery);
    startButton.addEventListener('click', startAttempt);
    tapButton.addEventListener('click', () => game?.tap());
    shareButton.addEventListener('click', shareCompletedResult);
    comparisonShareButton.addEventListener('click', shareCompletedComparison);
    resultReplayButton.addEventListener('click', startAttempt);
    comparisonReplayButton.addEventListener('click', startAttempt);
    backButton.addEventListener('click', returnToDiscovery);
    resultBackButton.addEventListener('click', returnToDiscovery);
    comparisonBackButton.addEventListener('click', returnToDiscovery);

    if (incomingShare) {
      showFriendInvitation(createFriendAttemptInvitation(incomingShare));
    }
  }
}
