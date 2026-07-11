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
  }),
  Object.freeze({
    id: 'center-snap',
    title: 'Center Snap',
    category: 'Timing',
    difficulty: 'Easy',
    durationSeconds: 15,
    rounds: 3,
    mechanic: 'center-snap',
    scoreUnit: 'points',
    maxScore: 3000,
    description: 'Stop the moving marker as close to the center as possible.',
    goal: 'Score up to 3,000 points across three precise stops.',
    instruction: 'Stop the marker near the center. You get three tries.'
  }),
  Object.freeze({
    id: 'signal-echo',
    title: 'Signal Echo',
    category: 'Memory',
    difficulty: 'Easy',
    durationSeconds: 20,
    rounds: 4,
    startLength: 2,
    sequence: Object.freeze([0, 2, 1, 3, 2]),
    mechanic: 'signal-echo',
    scoreUnit: 'points',
    maxScore: 1400,
    description: 'Watch a short signal pattern, then repeat it from memory.',
    goal: 'Repeat four growing patterns for up to 1,400 points.',
    instruction: 'Watch the signals. Repeat the pattern when they stop.'
  })
]);

const featuredChallenge = curatedChallenges[0];
const sharedResultVersion = 1;
const maxSharedScore = 1000000;

function getChallengeById(challengeId) {
  return curatedChallenges.find(challenge => challenge.id === challengeId) || null;
}

function getChallengeScoreUnit(challenge = featuredChallenge, score = 2) {
  const plural = challenge?.scoreUnit || 'taps';
  if (score !== 1) return plural;
  if (plural === 'points') return 'point';
  if (plural === 'taps') return 'tap';
  return plural;
}

function getChallengeFormat(challenge = featuredChallenge) {
  if (challenge.mechanic === 'center-snap') return `${challenge.rounds} stops`;
  if (challenge.mechanic === 'signal-echo') return `${challenge.rounds} rounds`;
  return `${challenge.durationSeconds} sec`;
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

function createCenterSnapGame(options = {}) {
  const rounds = Number.isInteger(options.rounds) && options.rounds >= 1 && options.rounds <= 10
    ? options.rounds
    : 3;
  const reducedMotion = options.reducedMotion === true;
  const onUpdate = typeof options.onUpdate === 'function' ? options.onUpdate : () => {};
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const setIntervalFn = options.setIntervalFn || setInterval;
  const clearIntervalFn = options.clearIntervalFn || clearInterval;
  const setTimeoutFn = options.setTimeoutFn || setTimeout;
  const clearTimeoutFn = options.clearTimeoutFn || clearTimeout;
  const movementIntervalMs = reducedMotion ? 500 : 40;
  const movementStep = reducedMotion ? 12.5 : 1.25;
  const feedbackDurationMs = reducedMotion ? 250 : 500;

  let status = 'idle';
  let round = 0;
  let score = 0;
  let position = 0;
  let direction = 1;
  let lastPoints = null;
  let movementTimerId = null;
  let feedbackTimerId = null;

  function getState() {
    return Object.freeze({
      status,
      round,
      rounds,
      score,
      position,
      lastPoints,
      reducedMotion
    });
  }

  function emitUpdate() {
    const snapshot = getState();
    onUpdate(snapshot);
    return snapshot;
  }

  function stopMovement() {
    if (movementTimerId !== null) {
      clearIntervalFn(movementTimerId);
      movementTimerId = null;
    }
  }

  function stopFeedback() {
    if (feedbackTimerId !== null) {
      clearTimeoutFn(feedbackTimerId);
      feedbackTimerId = null;
    }
  }

  function stopTimers() {
    stopMovement();
    stopFeedback();
  }

  function complete() {
    stopTimers();
    status = 'complete';
    const snapshot = emitUpdate();
    onComplete(snapshot);
    return snapshot;
  }

  function beginRound() {
    stopMovement();
    feedbackTimerId = null;
    round += 1;
    status = 'running';
    position = 0;
    direction = 1;
    lastPoints = null;
    const snapshot = emitUpdate();

    movementTimerId = setIntervalFn(() => {
      if (status !== 'running') return;
      position += direction * movementStep;

      if (position >= 100) {
        position = 100;
        direction = -1;
      } else if (position <= 0) {
        position = 0;
        direction = 1;
      }

      emitUpdate();
    }, movementIntervalMs);

    return snapshot;
  }

  function start() {
    stopTimers();
    status = 'idle';
    round = 0;
    score = 0;
    position = 0;
    direction = 1;
    lastPoints = null;
    return beginRound();
  }

  function stop() {
    if (status !== 'running') return getState();
    stopMovement();

    const distanceFromCenter = Math.abs(position - 50);
    lastPoints = Math.max(0, Math.round(1000 - (distanceFromCenter * 20)));
    score += lastPoints;
    status = 'feedback';
    const snapshot = emitUpdate();

    feedbackTimerId = setTimeoutFn(() => {
      feedbackTimerId = null;
      if (status !== 'feedback') return;
      if (round >= rounds) complete();
      else beginRound();
    }, feedbackDurationMs);

    return snapshot;
  }

  function reset() {
    stopTimers();
    status = 'idle';
    round = 0;
    score = 0;
    position = 0;
    direction = 1;
    lastPoints = null;
    return emitUpdate();
  }

  function destroy() {
    stopTimers();
  }

  return Object.freeze({ start, stop, reset, destroy, getState });
}

function getCenterSnapPositionLabel(position) {
  const safePosition = Number(position);
  if (!Number.isFinite(safePosition)) return 'Marker position unavailable';
  const distance = Math.abs(safePosition - 50);
  if (distance <= 5) return 'Marker centered';
  if (distance <= 18) return safePosition < 50 ? 'Marker near center on the left' : 'Marker near center on the right';
  return safePosition < 50 ? 'Marker left of center' : 'Marker right of center';
}

function getCenterSnapFeedback(points) {
  if (points >= 800) return 'Centered';
  if (points >= 400) return 'Near';
  return 'Missed';
}

function createSignalEchoGame(options = {}) {
  const sourceSequence = Array.isArray(options.sequence) ? options.sequence : [0, 2, 1, 3, 2];
  const sequence = sourceSequence.every(value => Number.isInteger(value) && value >= 0 && value <= 3)
    ? [...sourceSequence]
    : [0, 2, 1, 3, 2];
  const requestedRounds = Number.isInteger(options.rounds) ? options.rounds : 4;
  const rounds = requestedRounds >= 1 && requestedRounds <= 6 ? requestedRounds : 4;
  const requestedStartLength = Number.isInteger(options.startLength) ? options.startLength : 2;
  const startLength = requestedStartLength >= 1
    && requestedStartLength + rounds - 1 <= sequence.length
    ? requestedStartLength
    : 2;
  const reducedMotion = options.reducedMotion === true;
  const onUpdate = typeof options.onUpdate === 'function' ? options.onUpdate : () => {};
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : () => {};
  const setTimeoutFn = options.setTimeoutFn || setTimeout;
  const clearTimeoutFn = options.clearTimeoutFn || clearTimeout;
  const playbackOnMs = reducedMotion ? 650 : 320;
  const playbackGapMs = reducedMotion ? 220 : 120;
  const feedbackDurationMs = reducedMotion ? 250 : 360;
  const roundLeadInMs = reducedMotion ? 300 : 180;

  let status = 'idle';
  let round = 0;
  let sequenceLength = startLength;
  let inputIndex = 0;
  let score = 0;
  let activePad = null;
  let lastPad = null;
  let feedback = null;
  let playbackIndex = -1;
  let timerId = null;

  function getState() {
    return Object.freeze({
      status,
      round,
      rounds,
      sequenceLength,
      inputIndex,
      score,
      activePad,
      lastPad,
      feedback,
      playbackIndex,
      reducedMotion
    });
  }

  function emitUpdate() {
    const snapshot = getState();
    onUpdate(snapshot);
    return snapshot;
  }

  function clearTimer() {
    if (timerId !== null) {
      clearTimeoutFn(timerId);
      timerId = null;
    }
  }

  function schedule(callback, milliseconds) {
    clearTimer();
    timerId = setTimeoutFn(() => {
      timerId = null;
      callback();
    }, milliseconds);
  }

  function complete() {
    clearTimer();
    status = 'complete';
    activePad = null;
    feedback = null;
    playbackIndex = -1;
    const snapshot = emitUpdate();
    onComplete(snapshot);
    return snapshot;
  }

  function enterInput() {
    if (status !== 'playback') return getState();
    status = 'input';
    activePad = null;
    feedback = null;
    playbackIndex = -1;
    return emitUpdate();
  }

  function playStep(index) {
    if (status !== 'playback') return;
    if (index >= sequenceLength) {
      schedule(enterInput, playbackGapMs);
      return;
    }

    playbackIndex = index;
    activePad = sequence[index];
    emitUpdate();
    schedule(() => {
      if (status !== 'playback') return;
      activePad = null;
      emitUpdate();
      schedule(() => playStep(index + 1), playbackGapMs);
    }, playbackOnMs);
  }

  function beginRound() {
    clearTimer();
    round += 1;
    sequenceLength = startLength + round - 1;
    inputIndex = 0;
    activePad = null;
    lastPad = null;
    feedback = null;
    playbackIndex = -1;
    status = 'playback';
    const snapshot = emitUpdate();
    schedule(() => playStep(0), roundLeadInMs);
    return snapshot;
  }

  function start() {
    clearTimer();
    status = 'idle';
    round = 0;
    sequenceLength = startLength;
    inputIndex = 0;
    score = 0;
    activePad = null;
    lastPad = null;
    feedback = null;
    playbackIndex = -1;
    return beginRound();
  }

  function choose(pad) {
    if (status !== 'input' || !Number.isInteger(pad) || pad < 0 || pad > 3) {
      return getState();
    }

    const expectedPad = sequence[inputIndex];
    lastPad = pad;
    activePad = pad;
    status = 'feedback';

    if (pad === expectedPad) {
      inputIndex += 1;
      score += 100;
      feedback = 'correct';
      const snapshot = emitUpdate();
      schedule(() => {
        activePad = null;
        feedback = null;
        if (inputIndex >= sequenceLength) {
          if (round >= rounds) complete();
          else beginRound();
        } else {
          status = 'input';
          emitUpdate();
        }
      }, feedbackDurationMs);
      return snapshot;
    }

    feedback = 'incorrect';
    const snapshot = emitUpdate();
    schedule(complete, feedbackDurationMs);
    return snapshot;
  }

  function reset() {
    clearTimer();
    status = 'idle';
    round = 0;
    sequenceLength = startLength;
    inputIndex = 0;
    score = 0;
    activePad = null;
    lastPad = null;
    feedback = null;
    playbackIndex = -1;
    return emitUpdate();
  }

  function destroy() {
    clearTimer();
  }

  return Object.freeze({ start, choose, reset, destroy, getState });
}

function createResultSummary(taps, durationSeconds = featuredChallenge.durationSeconds, challenge = featuredChallenge) {
  if (!Number.isInteger(taps) || taps < 0) {
    throw new TypeError('Tap score must be a non-negative integer.');
  }
  if (!Number.isInteger(durationSeconds) || durationSeconds <= 0 || durationSeconds > 300) {
    throw new TypeError('Duration must be an integer from 1 to 300 seconds.');
  }

  let message = 'Try again and build your rhythm.';

  if (challenge?.mechanic === 'signal-echo') {
    message = 'Watch the pattern once more and build it step by step.';
    if (taps >= 1400) message = 'Perfect recall. Can a friend match every signal?';
    else if (taps >= 800) message = 'Strong memory. One longer pattern can raise it.';
    else if (taps > 0) message = 'Good start. Lock in the order and try again.';
  } else if (challenge?.mechanic === 'center-snap') {
    message = 'Try again and aim closer to the center.';
    if (taps >= 2700) message = 'Precision finish. Can a friend beat it?';
    else if (taps >= 1800) message = 'Strong timing. One cleaner stop can raise it.';
    else if (taps > 0) message = 'Good start. Watch the center and snap again.';
  } else {
    const tapsPerSecond = taps / durationSeconds;
    if (tapsPerSecond >= 4) message = 'Fast finish. Can you beat this score?';
    else if (tapsPerSecond >= 2) message = 'Strong pace. Try again and push it higher.';
    else if (taps > 0) message = 'Good start. A steadier rhythm can raise it.';
  }

  return Object.freeze({ taps, durationSeconds, message });
}

function validateSharedResult(taps, durationSeconds, challenge = featuredChallenge) {
  if (!challenge || !getChallengeById(challenge.id)) {
    throw new TypeError('Shared challenge is unsupported.');
  }

  const result = createResultSummary(taps, durationSeconds, challenge);
  const scoreLimit = Number.isInteger(challenge.maxScore) ? challenge.maxScore : maxSharedScore;
  if (result.taps > scoreLimit) {
    throw new TypeError(`Challenge score must not exceed ${scoreLimit}.`);
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
  let message = `Both scored ${target.taps} ${getChallengeScoreUnit(challenge, target.taps)}.`;

  if (difference > 0) {
    outcome = 'beat';
    headline = 'You beat it';
    message = `${difference} ${getChallengeScoreUnit(challenge, difference)} ahead.`;
  } else if (difference < 0) {
    const shortBy = Math.abs(difference);
    outcome = 'short';
    headline = 'So close';
    message = `${shortBy} ${getChallengeScoreUnit(challenge, shortBy)} short.`;
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
    getChallengeScoreUnit,
    getChallengeFormat,
    createTapSprintGame,
    createCenterSnapGame,
    createSignalEchoGame,
    getCenterSnapPositionLabel,
    getCenterSnapFeedback,
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
  const friendScoreUnit = document.querySelector('#friend-score-unit');
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
  const comparisonTargetLabel = document.querySelector('#comparison-target-label');
  const comparisonFriendLabel = document.querySelector('#comparison-friend-label');
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
  const timeLabel = document.querySelector('#time-label');
  const tapCount = document.querySelector('#tap-count');
  const scoreUnit = document.querySelector('#score-unit');
  const timingBoard = document.querySelector('#timing-board');
  const timingMarker = document.querySelector('#timing-marker');
  const timingReadout = document.querySelector('#timing-readout');
  const timingTrack = timingBoard?.querySelector('.timing-track');
  const gameStatus = document.querySelector('#game-status');
  const resultScore = document.querySelector('#result-score');
  const resultScoreUnit = document.querySelector('#result-score-unit');
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
    friendScoreUnit,
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
    comparisonTargetLabel,
    comparisonFriendLabel,
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
    timeLabel,
    tapCount,
    scoreUnit,
    timingBoard,
    timingMarker,
    timingReadout,
    timingTrack,
    gameStatus,
    resultScore,
    resultScoreUnit,
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
    let memoryGrid = null;
    let memoryButtons = [];

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
      selectedMeta.textContent = `${activeChallenge.difficulty} · ${getChallengeFormat(activeChallenge)}`;
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
          `${challenge.title}, ${challenge.category}, ${challenge.difficulty}, ${getChallengeFormat(challenge)}`
        );

        const category = document.createElement('span');
        category.className = 'challenge-option-category';
        category.textContent = challenge.category;

        const title = document.createElement('strong');
        title.textContent = challenge.title;

        const meta = document.createElement('span');
        meta.className = 'challenge-option-meta';
        meta.textContent = `${challenge.difficulty} · ${getChallengeFormat(challenge)}`;

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
      const targetUnit = getChallengeScoreUnit(activeChallenge, invitation.targetTaps);
      const challengeFormat = getChallengeFormat(activeChallenge);
      friendChallengeName.textContent = invitation.challengeTitle;
      friendDuration.textContent = challengeFormat;
      friendTargetScore.textContent = String(invitation.targetTaps);
      friendScoreUnit.textContent = `${targetUnit} to beat`;
      discoveryView.hidden = true;
      challengeView.hidden = true;
      resultView.hidden = true;
      comparisonView.hidden = true;
      friendView.hidden = false;
      friendAnnouncement.textContent = `${invitation.challengeTitle} challenge. Beat ${invitation.targetTaps} ${targetUnit} in ${challengeFormat}.`;
      startFriendButton.focus();
    }

    function showComparison(comparison) {
      completedComparison = comparison;
      resetShareState(comparisonShareStatus, comparisonShareFallback);
      const challenge = getChallengeById(comparison.challengeId);
      const targetUnit = getChallengeScoreUnit(challenge, comparison.targetTaps);
      const friendUnit = getChallengeScoreUnit(challenge, comparison.friendTaps);
      comparisonEyebrow.textContent = `${comparison.challengeTitle} complete`;
      comparisonScores.setAttribute('aria-label', `${comparison.challengeTitle} score comparison in ${challenge.scoreUnit || 'taps'}`);
      comparisonTargetLabel.textContent = `Target (${targetUnit})`;
      comparisonFriendLabel.textContent = `Your score (${friendUnit})`;
      comparisonTargetScore.textContent = String(comparison.targetTaps);
      comparisonFriendScore.textContent = String(comparison.friendTaps);
      comparisonOutcome.textContent = comparison.headline;
      comparisonMessage.textContent = comparison.message;
      friendView.hidden = true;
      discoveryView.hidden = true;
      challengeView.hidden = true;
      resultView.hidden = true;
      comparisonView.hidden = false;
      comparisonAnnouncement.textContent = `${comparison.headline}. Target ${comparison.targetTaps} ${targetUnit}. You scored ${comparison.friendTaps} ${friendUnit}. ${comparison.message}`;
      comparisonShareButton.focus();
    }

    function completeAttempt(score) {
      completedResult = createResultSummary(
        score,
        activeChallenge.durationSeconds,
        activeChallenge
      );
      challengeView.hidden = true;

      if (activeFriendInvitation) {
        showComparison(createComparisonSummary(completedResult.taps, activeFriendInvitation));
        return;
      }

      completedComparison = null;
      const unit = getChallengeScoreUnit(activeChallenge, completedResult.taps);
      resultEyebrow.textContent = `${activeChallenge.title} complete`;
      resultScore.textContent = String(completedResult.taps);
      resultScoreUnit.textContent = unit;
      resultMessage.textContent = completedResult.message;
      comparisonView.hidden = true;
      resultView.hidden = false;
      resultAnnouncement.textContent = `You scored ${completedResult.taps} ${unit} in ${activeChallenge.title}.`;
      shareButton.focus();
    }

    function ensureSignalEchoBoard() {
      if (memoryGrid) return;

      if (!document.querySelector('#signal-echo-styles')) {
        const style = document.createElement('style');
        style.id = 'signal-echo-styles';
        style.textContent = `
          .signal-echo-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
            margin-block: 0.15rem 0.8rem;
          }
          .signal-echo-pad {
            min-width: 0;
            min-height: 4rem;
            border: 2px solid rgba(196, 181, 253, 0.45);
            border-radius: 1rem;
            background: rgba(15, 23, 42, 0.82);
            color: #f8fafc;
            font-weight: 800;
            cursor: pointer;
            transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease;
          }
          .signal-echo-pad:disabled { cursor: default; opacity: 0.82; }
          .signal-echo-pad[data-active="true"] {
            transform: scale(1.06);
            border-color: #f8fafc;
            background: #4f46e5;
          }
          .signal-echo-pad[data-last="true"] { outline: 3px solid rgba(248, 250, 252, 0.78); }
          .timing-board[data-mode="signal-echo"][data-feedback="correct"] .signal-echo-pad[data-last="true"] {
            animation: signal-echo-correct 300ms ease;
            background: #15803d;
          }
          .timing-board[data-mode="signal-echo"][data-feedback="incorrect"] .signal-echo-pad[data-last="true"] {
            animation: signal-echo-incorrect 300ms ease;
            background: #b91c1c;
          }
          @keyframes signal-echo-correct { 50% { transform: scale(1.08); } }
          @keyframes signal-echo-incorrect {
            33% { transform: translateX(-0.35rem); }
            66% { transform: translateX(0.35rem); }
          }
          @media (prefers-reduced-motion: reduce) {
            .signal-echo-pad { transition: none; }
            .signal-echo-pad[data-active="true"] { transform: none !important; }
            .timing-board[data-mode="signal-echo"] .signal-echo-pad { animation: none !important; }
          }
        `;
        document.head.append(style);
      }

      memoryGrid = document.createElement('div');
      memoryGrid.className = 'signal-echo-grid';
      memoryGrid.setAttribute('role', 'group');
      memoryGrid.setAttribute('aria-label', 'Repeat the signal pattern');
      const labels = ['North signal', 'East signal', 'West signal', 'South signal'];
      memoryButtons = labels.map((label, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'signal-echo-pad';
        button.dataset.memoryPad = String(index);
        button.textContent = String(index + 1);
        button.setAttribute('aria-label', label);
        button.addEventListener('click', () => {
          if (game && typeof game.choose === 'function') game.choose(index);
        });
        memoryGrid.append(button);
        return button;
      });
      timingBoard.prepend(memoryGrid);
    }

    function resetMechanicBoard() {
      timingBoard.removeAttribute('data-mode');
      timingBoard.removeAttribute('data-feedback');
      timingBoard.setAttribute('aria-label', 'Center timing meter');
      timingTrack.hidden = false;
      if (memoryGrid) memoryGrid.hidden = true;
      for (const button of memoryButtons) {
        button.disabled = true;
        button.removeAttribute('data-active');
        button.removeAttribute('data-last');
      }
      tapButton.hidden = false;
    }

    function configureTapGame() {
      resetMechanicBoard();
      timingBoard.hidden = true;
      timingBoard.removeAttribute('data-feedback');
      tapButton.classList.remove('timing-action');
      timeLabel.textContent = 'seconds';
      scoreUnit.textContent = 'taps';
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
          completeAttempt(state.taps);
        }
      });
    }

    function configureCenterSnapGame() {
      resetMechanicBoard();
      const reducedMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      timingBoard.hidden = false;
      timingBoard.removeAttribute('data-feedback');
      tapButton.classList.add('timing-action');
      timeLabel.textContent = 'rounds';
      scoreUnit.textContent = 'points';
      timeValue.textContent = `0/${activeChallenge.rounds}`;
      tapCount.textContent = '0';
      timingMarker.style.left = '0%';
      timingReadout.textContent = reducedMotion
        ? 'Reduced motion: the marker moves in clear steps.'
        : 'Watch the marker and stop it near the center.';

      game = createCenterSnapGame({
        rounds: activeChallenge.rounds,
        reducedMotion,
        onUpdate(state) {
          timeValue.textContent = `${state.round}/${state.rounds}`;
          tapCount.textContent = String(state.score);
          timingMarker.style.left = `${state.position}%`;

          if (state.status === 'running') {
            timingBoard.removeAttribute('data-feedback');
            timingReadout.textContent = `Round ${state.round} of ${state.rounds}. ${getCenterSnapPositionLabel(state.position)}.`;
            tapButton.disabled = false;
            tapButton.textContent = 'Stop';
            gameStatus.textContent = `Round ${state.round}: stop near the center`;
          } else if (state.status === 'feedback') {
            const feedback = getCenterSnapFeedback(state.lastPoints);
            timingBoard.dataset.feedback = feedback.toLowerCase();
            timingReadout.textContent = `${feedback}. +${state.lastPoints} points.`;
            tapButton.disabled = true;
            tapButton.textContent = 'Locked';
            gameStatus.textContent = `${feedback}: ${state.score} points total`;
          } else if (state.status === 'complete') {
            timingBoard.removeAttribute('data-feedback');
            tapButton.disabled = true;
            tapButton.textContent = 'Done';
            gameStatus.textContent = 'Three stops complete';
          } else {
            tapButton.disabled = true;
            tapButton.textContent = 'Stop';
            gameStatus.textContent = 'Ready';
          }
        },
        onComplete(state) {
          completeAttempt(state.score);
        }
      });
    }

    function configureSignalEchoGame() {
      const reducedMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ensureSignalEchoBoard();
      resetMechanicBoard();
      timingBoard.hidden = false;
      timingBoard.dataset.mode = 'signal-echo';
      timingBoard.setAttribute('aria-label', 'Signal Echo memory board');
      timingTrack.hidden = true;
      memoryGrid.hidden = false;
      tapButton.hidden = true;
      timeLabel.textContent = 'rounds';
      scoreUnit.textContent = 'points';
      timeValue.textContent = `0/${activeChallenge.rounds}`;
      tapCount.textContent = '0';
      timingReadout.textContent = reducedMotion
        ? 'Reduced motion: signals change in clear, still steps.'
        : 'Watch the signals, then repeat them.';

      let previousStatus = 'idle';
      game = createSignalEchoGame({
        rounds: activeChallenge.rounds,
        startLength: activeChallenge.startLength,
        sequence: activeChallenge.sequence,
        reducedMotion,
        onUpdate(state) {
          timeValue.textContent = `${state.round}/${state.rounds}`;
          tapCount.textContent = String(state.score);
          timingBoard.removeAttribute('data-feedback');

          for (const [index, button] of memoryButtons.entries()) {
            button.disabled = state.status !== 'input';
            button.dataset.active = state.activePad === index ? 'true' : 'false';
            button.dataset.last = state.lastPad === index ? 'true' : 'false';
          }

          if (state.status === 'playback') {
            const signalNames = ['North', 'East', 'West', 'South'];
            timingReadout.textContent = `Watch round ${state.round}: ${state.sequenceLength} signals.`;
            gameStatus.textContent = state.activePad === null
              ? 'Watch the pattern'
              : `${signalNames[state.activePad]} signal`;
          } else if (state.status === 'input') {
            timingReadout.textContent = `Your turn. Signal ${state.inputIndex + 1} of ${state.sequenceLength}.`;
            gameStatus.textContent = 'Repeat the pattern';
            if (previousStatus === 'playback') memoryButtons[0].focus();
          } else if (state.status === 'feedback') {
            timingBoard.dataset.feedback = state.feedback;
            timingReadout.textContent = state.feedback === 'correct'
              ? `Correct. ${state.score} points.`
              : `Not this one. ${state.score} points.`;
            gameStatus.textContent = state.feedback === 'correct' ? 'Correct signal' : 'Pattern ended';
          } else if (state.status === 'complete') {
            timingReadout.textContent = `Attempt complete. ${state.score} points.`;
            gameStatus.textContent = 'Memory attempt complete';
          } else {
            gameStatus.textContent = 'Ready';
          }

          previousStatus = state.status;
        },
        onComplete(state) {
          completeAttempt(state.score);
        }
      });
    }

    function configureGame() {
      if (game) game.destroy();

      gameEyebrow.textContent = `${activeChallenge.category} challenge`;
      gameTitle.textContent = activeChallenge.title;
      gameInstruction.textContent = activeChallenge.instruction;

      if (activeChallenge.mechanic === 'center-snap') configureCenterSnapGame();
      else if (activeChallenge.mechanic === 'signal-echo') configureSignalEchoGame();
      else configureTapGame();
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
      if (!tapButton.hidden) tapButton.focus();
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
      const unit = getChallengeScoreUnit(activeChallenge, completedResult.taps);

      const outcome = await shareResultLink(shareUrl, {
        title: activeChallenge.title,
        text: `I scored ${completedResult.taps} ${unit} in ${activeChallenge.title}. Can you beat it?`
      });

      showShareOutcome(outcome, shareStatus, shareFallback);
    }

    async function shareCompletedComparison() {
      if (!completedComparison) return;

      const shareUrl = createComparisonShareUrl(completedComparison, canonicalLink.href);
      comparisonShareFallback.href = shareUrl;
      comparisonShareFallback.textContent = shareUrl;
      const challenge = getChallengeById(completedComparison.challengeId);
      const unit = getChallengeScoreUnit(challenge, completedComparison.friendTaps);

      const outcome = await shareResultLink(shareUrl, {
        title: completedComparison.challengeTitle,
        text: `I scored ${completedComparison.friendTaps} ${unit} in ${completedComparison.challengeTitle}. Can you beat it?`
      });
      showShareOutcome(outcome, comparisonShareStatus, comparisonShareFallback);
    }

    function activateGameAction() {
      if (!game) return;
      if (activeChallenge.mechanic === 'center-snap') game.stop();
      else if (activeChallenge.mechanic !== 'signal-echo') game.tap();
    }

    renderChallengeCatalog();

    startFriendButton.addEventListener('click', startAttempt);
    dismissFriendButton.addEventListener('click', returnToDiscovery);
    startButton.addEventListener('click', startAttempt);
    tapButton.addEventListener('click', activateGameAction);
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
