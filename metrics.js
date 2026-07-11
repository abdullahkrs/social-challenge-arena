const privacySafeEventNames = Object.freeze([
  'challenge_viewed',
  'challenge_started',
  'challenge_completed',
  'result_viewed',
  'share_attempted',
  'share_completed',
  'shared_link_opened',
  'friend_completed',
  'comparison_viewed',
  'share_again_attempted'
]);

function createPrivacySafeMetrics() {
  const allowed = new Set(privacySafeEventNames);
  const counts = Object.fromEntries(privacySafeEventNames.map(name => [name, 0]));

  return Object.freeze({
    track(name) {
      if (!allowed.has(name)) return false;
      counts[name] += 1;
      return true;
    },
    snapshot() {
      return Object.freeze({ ...counts });
    }
  });
}

function attachPrivacySafeInstrumentation(documentObject, options = {}) {
  if (!documentObject || typeof documentObject.querySelector !== 'function') return null;

  const Observer = options.MutationObserverCtor
    || (typeof MutationObserver === 'function' ? MutationObserver : null);
  if (!Observer) return null;

  const find = id => documentObject.querySelector(`#${id}`);
  const elements = {
    friendView: find('friend-view'),
    discoveryView: find('discovery-view'),
    resultView: find('result-view'),
    comparisonView: find('comparison-view'),
    startFriend: find('start-friend-attempt'),
    start: find('start-challenge'),
    share: find('share-result'),
    shareAgain: find('share-again'),
    shareStatus: find('share-status'),
    shareAgainStatus: find('comparison-share-status')
  };
  if (Object.values(elements).some(element => !element)) return null;

  const metrics = options.metrics || createPrivacySafeMetrics();
  if (typeof metrics.track !== 'function' || typeof metrics.snapshot !== 'function') return null;

  metrics.track(elements.friendView.hidden ? 'challenge_viewed' : 'shared_link_opened');
  elements.start.addEventListener('click', () => metrics.track('challenge_started'));
  elements.startFriend.addEventListener('click', () => metrics.track('challenge_started'));
  elements.share.addEventListener('click', () => metrics.track('share_attempted'));
  elements.shareAgain.addEventListener('click', () => metrics.track('share_again_attempted'));

  let resultVisible = !elements.resultView.hidden;
  let comparisonVisible = !elements.comparisonView.hidden;
  const viewObserver = new Observer(() => {
    const nextResultVisible = !elements.resultView.hidden;
    const nextComparisonVisible = !elements.comparisonView.hidden;

    if (nextResultVisible && !resultVisible) {
      metrics.track('challenge_completed');
      metrics.track('result_viewed');
    }
    if (nextComparisonVisible && !comparisonVisible) {
      metrics.track('challenge_completed');
      metrics.track('friend_completed');
      metrics.track('comparison_viewed');
    }

    resultVisible = nextResultVisible;
    comparisonVisible = nextComparisonVisible;
  });
  const viewOptions = { attributes: true, attributeFilter: ['hidden'] };
  viewObserver.observe(elements.resultView, viewOptions);
  viewObserver.observe(elements.comparisonView, viewOptions);

  let resultShareStatus = elements.shareStatus.textContent;
  let comparisonShareStatus = elements.shareAgainStatus.textContent;
  const statusObserver = new Observer(() => {
    const nextResultStatus = elements.shareStatus.textContent;
    const nextComparisonStatus = elements.shareAgainStatus.textContent;
    const successful = status => status === 'Shared.' || status === 'Link copied.';

    if (nextResultStatus !== resultShareStatus && successful(nextResultStatus)) {
      metrics.track('share_completed');
    }
    if (nextComparisonStatus !== comparisonShareStatus && successful(nextComparisonStatus)) {
      metrics.track('share_completed');
    }

    resultShareStatus = nextResultStatus;
    comparisonShareStatus = nextComparisonStatus;
  });
  const statusOptions = { childList: true, characterData: true, subtree: true };
  statusObserver.observe(elements.shareStatus, statusOptions);
  statusObserver.observe(elements.shareAgainStatus, statusOptions);

  return metrics;
}

if (typeof module !== 'undefined') {
  module.exports = {
    privacySafeEventNames,
    createPrivacySafeMetrics,
    attachPrivacySafeInstrumentation
  };
}

if (typeof document !== 'undefined') {
  const metrics = attachPrivacySafeInstrumentation(document);
  if (metrics && typeof window !== 'undefined') {
    Object.defineProperty(window, 'socialChallengeMetrics', {
      value: metrics,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
}
