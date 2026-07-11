const privateResultVersion = 1;
const privateChallengeId = 'private-tap';
const privateDurations = Object.freeze([10, 20, 30]);
const maxPrivateScore = 1000000;

function normalizePrivateTitle(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Private challenge title must be text.');
  }

  const title = value.trim().replace(/\s+/g, ' ');
  if (!/^[A-Za-z0-9][A-Za-z0-9 ]{2,23}$/.test(title)) {
    throw new TypeError('Use 3–24 letters, numbers, and spaces.');
  }
  return title;
}

function validatePrivateDuration(value) {
  const durationSeconds = Number(value);
  if (!Number.isInteger(durationSeconds) || !privateDurations.includes(durationSeconds)) {
    throw new TypeError('Private challenge duration is unsupported.');
  }
  return durationSeconds;
}

function validatePrivateScore(value) {
  const taps = Number(value);
  if (!Number.isInteger(taps) || taps < 0 || taps > maxPrivateScore) {
    throw new TypeError(`Tap score must be an integer from 0 to ${maxPrivateScore}.`);
  }
  return taps;
}

function createPrivateChallenge(title, durationSeconds) {
  const safeTitle = normalizePrivateTitle(title);
  const safeDuration = validatePrivateDuration(durationSeconds);

  return Object.freeze({
    id: privateChallengeId,
    title: safeTitle,
    category: 'Private',
    difficulty: 'Custom',
    durationSeconds: safeDuration,
    instruction: 'Tap fast until time runs out.'
  });
}

function createPrivateResultUrl(title, taps, durationSeconds, baseUrl) {
  const challenge = createPrivateChallenge(title, durationSeconds);
  const safeScore = validatePrivateScore(taps);
  const url = new URL(baseUrl);

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('Share URL must use HTTP or HTTPS.');
  }

  url.search = '';
  url.hash = new URLSearchParams({
    v: String(privateResultVersion),
    title: challenge.title,
    score: String(safeScore),
    duration: String(challenge.durationSeconds)
  }).toString();
  return url.toString();
}

function parsePrivateResultHash(hash) {
  if (typeof hash !== 'string' || hash.length < 2 || hash.length > 220) return null;

  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const expectedKeys = ['v', 'title', 'score', 'duration'];
  const keys = Array.from(params.keys());

  if (keys.length !== expectedKeys.length) return null;
  if (expectedKeys.some(key => params.getAll(key).length !== 1)) return null;
  if (keys.some(key => !expectedKeys.includes(key))) return null;
  if (params.get('v') !== String(privateResultVersion)) return null;

  const rawTitle = params.get('title');
  const scoreText = params.get('score');
  const durationText = params.get('duration');
  if (!/^(0|[1-9]\d{0,6})$/.test(scoreText || '')) return null;
  if (!/^(10|20|30)$/.test(durationText || '')) return null;

  try {
    const title = normalizePrivateTitle(rawTitle);
    if (title !== rawTitle) return null;

    return Object.freeze({
      version: privateResultVersion,
      title,
      targetTaps: validatePrivateScore(Number(scoreText)),
      durationSeconds: validatePrivateDuration(Number(durationText))
    });
  } catch {
    return null;
  }
}

function createPrivateComparison(friendTaps, sharedResult) {
  if (!sharedResult || typeof sharedResult !== 'object') {
    throw new TypeError('Private shared result is required.');
  }

  const expectedKeys = ['version', 'title', 'targetTaps', 'durationSeconds'];
  const keys = Object.keys(sharedResult);
  if (keys.length !== expectedKeys.length || keys.some(key => !expectedKeys.includes(key))) {
    throw new TypeError('Private shared result has an invalid shape.');
  }
  if (sharedResult.version !== privateResultVersion) {
    throw new TypeError('Private shared result version is unsupported.');
  }

  const challenge = createPrivateChallenge(sharedResult.title, sharedResult.durationSeconds);
  const targetTaps = validatePrivateScore(sharedResult.targetTaps);
  const safeFriendTaps = validatePrivateScore(friendTaps);
  const difference = safeFriendTaps - targetTaps;

  let outcome = 'tie';
  let headline = 'It is a tie';
  let message = `Both scored ${targetTaps} taps.`;

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
    title: challenge.title,
    targetTaps,
    friendTaps: safeFriendTaps,
    durationSeconds: challenge.durationSeconds,
    difference,
    outcome,
    headline,
    message
  });
}

function createPrivateComparisonShareUrl(comparison, baseUrl) {
  if (!comparison || typeof comparison !== 'object') {
    throw new TypeError('Completed private comparison is required.');
  }

  const expectedKeys = [
    'title',
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
    throw new TypeError('Completed private comparison has an invalid shape.');
  }

  const validated = createPrivateComparison(comparison.friendTaps, {
    version: privateResultVersion,
    title: comparison.title,
    targetTaps: comparison.targetTaps,
    durationSeconds: comparison.durationSeconds
  });

  if (expectedKeys.some(key => comparison[key] !== validated[key])) {
    throw new TypeError('Completed private comparison is inconsistent.');
  }

  return createPrivateResultUrl(
    validated.title,
    validated.friendTaps,
    validated.durationSeconds,
    baseUrl
  );
}

if (typeof module !== 'undefined') {
  module.exports = {
    privateResultVersion,
    privateChallengeId,
    privateDurations,
    normalizePrivateTitle,
    validatePrivateDuration,
    validatePrivateScore,
    createPrivateChallenge,
    createPrivateResultUrl,
    parsePrivateResultHash,
    createPrivateComparison,
    createPrivateComparisonShareUrl
  };
}

if (typeof document !== 'undefined') {
  const builderView = document.querySelector('#private-builder-view');
  const inviteView = document.querySelector('#private-invite-view');
  const gameView = document.querySelector('#private-game-view');
  const resultView = document.querySelector('#private-result-view');
  const comparisonView = document.querySelector('#private-comparison-view');
  const form = document.querySelector('#private-form');
  const titleInput = document.querySelector('#private-title');
  const durationSelect = document.querySelector('#private-duration');
  const formStatus = document.querySelector('#private-form-status');
  const inviteTitle = document.querySelector('#private-invite-title');
  const inviteDuration = document.querySelector('#private-invite-duration');
  const inviteTarget = document.querySelector('#private-invite-target');
  const inviteAnnouncement = document.querySelector('#private-invite-announcement');
  const startInviteButton = document.querySelector('#private-start-invite');
  const dismissInviteButton = document.querySelector('#private-dismiss-invite');
  const gameTitle = document.querySelector('#private-game-title');
  const gameTime = document.querySelector('#private-time-value');
  const gameTaps = document.querySelector('#private-tap-count');
  const tapButton = document.querySelector('#private-tap-button');
  const gameStatus = document.querySelector('#private-game-status');
  const gameBackButton = document.querySelector('#private-game-back');
  const resultTitle = document.querySelector('#private-result-title');
  const resultScore = document.querySelector('#private-result-score');
  const resultMessage = document.querySelector('#private-result-message');
  const resultAnnouncement = document.querySelector('#private-result-announcement');
  const resultShareButton = document.querySelector('#private-share-result');
  const resultShareStatus = document.querySelector('#private-share-status');
  const resultShareFallback = document.querySelector('#private-share-fallback');
  const resultReplayButton = document.querySelector('#private-result-replay');
  const resultEditButton = document.querySelector('#private-result-edit');
  const comparisonTitle = document.querySelector('#private-comparison-title');
  const comparisonTarget = document.querySelector('#private-comparison-target');
  const comparisonFriend = document.querySelector('#private-comparison-friend');
  const comparisonOutcome = document.querySelector('#private-comparison-outcome');
  const comparisonMessage = document.querySelector('#private-comparison-message');
  const comparisonAnnouncement = document.querySelector('#private-comparison-announcement');
  const comparisonShareButton = document.querySelector('#private-share-again');
  const comparisonShareStatus = document.querySelector('#private-comparison-share-status');
  const comparisonShareFallback = document.querySelector('#private-comparison-share-fallback');
  const comparisonReplayButton = document.querySelector('#private-comparison-replay');
  const comparisonCreateButton = document.querySelector('#private-comparison-create');
  const canonicalLink = document.querySelector('link[rel="canonical"]');

  const requiredElements = [
    builderView,
    inviteView,
    gameView,
    resultView,
    comparisonView,
    form,
    titleInput,
    durationSelect,
    formStatus,
    inviteTitle,
    inviteDuration,
    inviteTarget,
    inviteAnnouncement,
    startInviteButton,
    dismissInviteButton,
    gameTitle,
    gameTime,
    gameTaps,
    tapButton,
    gameStatus,
    gameBackButton,
    resultTitle,
    resultScore,
    resultMessage,
    resultAnnouncement,
    resultShareButton,
    resultShareStatus,
    resultShareFallback,
    resultReplayButton,
    resultEditButton,
    comparisonTitle,
    comparisonTarget,
    comparisonFriend,
    comparisonOutcome,
    comparisonMessage,
    comparisonAnnouncement,
    comparisonShareButton,
    comparisonShareStatus,
    comparisonShareFallback,
    comparisonReplayButton,
    comparisonCreateButton,
    canonicalLink
  ];

  if (requiredElements.every(Boolean)) {
    let activeChallenge = null;
    let activeSharedResult = null;
    let completedResult = null;
    let completedComparison = null;
    let game = null;

    function hideAllViews() {
      builderView.hidden = true;
      inviteView.hidden = true;
      gameView.hidden = true;
      resultView.hidden = true;
      comparisonView.hidden = true;
    }

    function resetShareState(statusElement, fallbackElement) {
      statusElement.textContent = '';
      fallbackElement.hidden = true;
      fallbackElement.removeAttribute('href');
      fallbackElement.textContent = 'Open private link';
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

    function showBuilder() {
      activeSharedResult = null;
      completedResult = null;
      completedComparison = null;
      if (game) game.reset();
      clearSharedResultHash(window.location, window.history);
      formStatus.textContent = '';
      resetShareState(resultShareStatus, resultShareFallback);
      resetShareState(comparisonShareStatus, comparisonShareFallback);
      hideAllViews();
      builderView.hidden = false;
      titleInput.focus();
    }

    function showInvite(sharedResult) {
      activeSharedResult = sharedResult;
      activeChallenge = createPrivateChallenge(sharedResult.title, sharedResult.durationSeconds);
      inviteTitle.textContent = activeChallenge.title;
      inviteDuration.textContent = String(activeChallenge.durationSeconds);
      inviteTarget.textContent = String(sharedResult.targetTaps);
      inviteAnnouncement.textContent = `${activeChallenge.title}. Beat ${sharedResult.targetTaps} taps in ${activeChallenge.durationSeconds} seconds.`;
      hideAllViews();
      inviteView.hidden = false;
      startInviteButton.focus();
    }

    function showResult(state) {
      completedResult = createResultSummary(state.taps, state.durationSeconds);
      resultTitle.textContent = `${activeChallenge.title} complete`;
      resultScore.textContent = String(completedResult.taps);
      resultMessage.textContent = completedResult.message;
      resultAnnouncement.textContent = `You scored ${completedResult.taps} taps in ${activeChallenge.title}.`;
      resetShareState(resultShareStatus, resultShareFallback);
      hideAllViews();
      resultView.hidden = false;
      resultShareButton.focus();
    }

    function showComparison(state) {
      completedComparison = createPrivateComparison(state.taps, activeSharedResult);
      comparisonTitle.textContent = activeChallenge.title;
      comparisonTarget.textContent = String(completedComparison.targetTaps);
      comparisonFriend.textContent = String(completedComparison.friendTaps);
      comparisonOutcome.textContent = completedComparison.headline;
      comparisonMessage.textContent = completedComparison.message;
      comparisonAnnouncement.textContent = `${completedComparison.headline}. Target ${completedComparison.targetTaps} taps. You scored ${completedComparison.friendTaps} taps. ${completedComparison.message}`;
      resetShareState(comparisonShareStatus, comparisonShareFallback);
      hideAllViews();
      comparisonView.hidden = false;
      comparisonShareButton.focus();
    }

    function configureGame() {
      if (game) game.destroy();
      gameTitle.textContent = activeChallenge.title;
      gameTime.textContent = String(activeChallenge.durationSeconds);
      gameTaps.textContent = '0';

      game = createTapSprintGame({
        durationSeconds: activeChallenge.durationSeconds,
        onUpdate(state) {
          gameTime.textContent = String(state.remainingSeconds);
          gameTaps.textContent = String(state.taps);
          const running = state.status === 'running';
          tapButton.disabled = !running;
          tapButton.textContent = running ? 'Tap!' : 'Time!';
          gameStatus.textContent = running ? 'Go!' : 'Ready';
        },
        onComplete(state) {
          if (activeSharedResult) showComparison(state);
          else showResult(state);
        }
      });
    }

    function startAttempt() {
      completedResult = null;
      completedComparison = null;
      inviteAnnouncement.textContent = '';
      resultAnnouncement.textContent = '';
      comparisonAnnouncement.textContent = '';
      resetShareState(resultShareStatus, resultShareFallback);
      resetShareState(comparisonShareStatus, comparisonShareFallback);
      hideAllViews();
      gameView.hidden = false;
      configureGame();
      game.start();
      tapButton.focus();
    }

    async function shareResult() {
      if (!completedResult || !activeChallenge) return;
      const shareUrl = createPrivateResultUrl(
        activeChallenge.title,
        completedResult.taps,
        completedResult.durationSeconds,
        canonicalLink.href
      );
      resultShareFallback.href = shareUrl;
      resultShareFallback.textContent = shareUrl;
      const outcome = await shareResultLink(shareUrl, {
        title: activeChallenge.title,
        text: `I scored ${completedResult.taps} taps in ${activeChallenge.title}. Can you beat it?`
      });
      showShareOutcome(outcome, resultShareStatus, resultShareFallback);
    }

    async function shareComparison() {
      if (!completedComparison) return;
      const shareUrl = createPrivateComparisonShareUrl(completedComparison, canonicalLink.href);
      comparisonShareFallback.href = shareUrl;
      comparisonShareFallback.textContent = shareUrl;
      const outcome = await shareResultLink(shareUrl, {
        title: completedComparison.title,
        text: `I scored ${completedComparison.friendTaps} taps in ${completedComparison.title}. Can you beat it?`
      });
      showShareOutcome(outcome, comparisonShareStatus, comparisonShareFallback);
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        activeChallenge = createPrivateChallenge(titleInput.value, durationSelect.value);
        activeSharedResult = null;
        titleInput.value = activeChallenge.title;
        formStatus.textContent = '';
        startAttempt();
      } catch (error) {
        formStatus.textContent = error instanceof Error ? error.message : 'Check the challenge details.';
        titleInput.focus();
      }
    });

    startInviteButton.addEventListener('click', startAttempt);
    dismissInviteButton.addEventListener('click', showBuilder);
    tapButton.addEventListener('click', () => game?.tap());
    gameBackButton.addEventListener('click', showBuilder);
    resultShareButton.addEventListener('click', shareResult);
    resultReplayButton.addEventListener('click', startAttempt);
    resultEditButton.addEventListener('click', showBuilder);
    comparisonShareButton.addEventListener('click', shareComparison);
    comparisonReplayButton.addEventListener('click', startAttempt);
    comparisonCreateButton.addEventListener('click', showBuilder);

    const incomingShare = parsePrivateResultHash(window.location.hash);
    if (window.location.hash && !incomingShare) {
      clearSharedResultHash(window.location, window.history);
    }

    if (incomingShare) showInvite(incomingShare);
    else showBuilder();
  }
}
