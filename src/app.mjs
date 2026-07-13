import { buildInviteUrl, CHALLENGE_ID, compareScores, createSeed, parseInvite } from './core.mjs';
import { getChallenge } from './catalog.mjs';
import { isRtl, normalizeLanguage, supportedLanguages, translate } from './i18n.mjs';
import { OrbitLockGame } from './game.mjs';

const state = {
  language: normalizeLanguage(localStorage.getItem('sca-language') || navigator.language),
  reducedMotion: localStorage.getItem('sca-reduced-motion') === 'true' || matchMedia('(prefers-reduced-motion: reduce)').matches,
  screen: 'discovery',
  seed: createSeed(),
  invite: null,
  result: null,
  events: []
};

const elements = {
  loading: document.querySelector('#loading'),
  app: document.querySelector('#app'),
  errorBanner: document.querySelector('#error-banner'),
  language: document.querySelector('#language-select'),
  motion: document.querySelector('#motion-toggle'),
  invitedBadge: document.querySelector('#invited-badge'),
  targetText: document.querySelector('#target-text'),
  playButton: document.querySelector('#play-button'),
  startButton: document.querySelector('#start-button'),
  backButtons: document.querySelectorAll('[data-action="back"]'),
  instructionTarget: document.querySelector('#instruction-target'),
  canvas: document.querySelector('#game-canvas'),
  gameStatus: document.querySelector('#game-status'),
  score: document.querySelector('#score-value'),
  round: document.querySelector('#round-value'),
  lives: document.querySelector('#lives-value'),
  combo: document.querySelector('#combo-value'),
  resultScore: document.querySelector('#result-score'),
  resultHeading: document.querySelector('#result-heading'),
  resultSummary: document.querySelector('#result-summary'),
  comparison: document.querySelector('#comparison'),
  comparisonText: document.querySelector('#comparison-text'),
  replayButton: document.querySelector('#replay-button'),
  newButton: document.querySelector('#new-button'),
  shareButton: document.querySelector('#share-button'),
  liveRegion: document.querySelector('#live-region')
};

let game = null;

function track(name, detail = {}) {
  state.events.push({ name, detail, at: Date.now() });
  if (state.events.length > 50) state.events.shift();
}

function t(key, values) {
  return translate(state.language, key, values);
}

function announce(message) {
  elements.liveRegion.textContent = '';
  requestAnimationFrame(() => { elements.liveRegion.textContent = message; });
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = isRtl(state.language) ? 'rtl' : 'ltr';
  elements.language.value = state.language;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });
  elements.targetText.textContent = state.invite ? t('beatScore', { score: state.invite.target }) : '';
  elements.instructionTarget.textContent = state.invite ? t('beatScore', { score: state.invite.target }) : t('sameRun');
  renderResult();
}

function setScreen(screen) {
  state.screen = screen;
  document.querySelectorAll('[data-screen]').forEach((section) => {
    section.hidden = section.dataset.screen !== screen;
  });
  if (screen !== 'game') game?.destroy();
  const focusTarget = document.querySelector(`[data-screen="${screen}"] h1, [data-screen="${screen}"] h2`);
  focusTarget?.focus({ preventScroll: true });
  track('screen_view', { screen });
}

function updateInviteUI() {
  const invited = Boolean(state.invite);
  elements.invitedBadge.hidden = !invited;
  elements.targetText.textContent = invited ? t('beatScore', { score: state.invite.target }) : '';
  elements.instructionTarget.textContent = invited ? t('beatScore', { score: state.invite.target }) : t('sameRun');
}

function parseLocationInvite() {
  const parsed = parseInvite(window.location.search);
  if (!parsed.ok) {
    elements.errorBanner.hidden = false;
    elements.errorBanner.textContent = t('invalidLink');
    history.replaceState({}, '', `${location.pathname}${location.hash}`);
    track('invite_invalid', { reason: parsed.reason });
    return;
  }
  if (parsed.invite) {
    state.invite = parsed.invite;
    state.seed = parsed.invite.seed;
    track('invite_opened', { challenge: parsed.invite.challengeId, target: parsed.invite.target });
  }
}

function showInstructions() {
  if (!getChallenge(CHALLENGE_ID)) throw new Error('Challenge registry entry missing');
  setScreen('instructions');
}

function beginRun() {
  setScreen('game');
  state.result = null;
  elements.gameStatus.textContent = t('ready');
  game = new OrbitLockGame({
    canvas: elements.canvas,
    reducedMotion: state.reducedMotion,
    onUpdate: (snapshot) => {
      elements.score.textContent = snapshot.score;
      elements.round.textContent = `${Math.min(snapshot.round + 1, snapshot.rounds)}/${snapshot.rounds}`;
      elements.lives.textContent = snapshot.lives;
      elements.combo.textContent = snapshot.combo;
    },
    onAnnounce: (event) => {
      const message = event.type === 'hit'
        ? `${t('hit', { points: event.points })}. ${t('precision', { value: event.precision })}`
        : t('miss');
      elements.gameStatus.textContent = message;
      announce(message);
    },
    onFinish: (result) => {
      state.result = result;
      track('run_finished', { score: result.score, reason: result.reason, round: result.round });
      renderResult();
      setScreen('result');
      announce(t('finalScore', { score: result.score }));
    }
  });
  game.start(state.seed);
  elements.canvas.focus();
  track('run_started', { seed: state.seed, invited: Boolean(state.invite) });
}

function renderResult() {
  if (!state.result) return;
  elements.resultScore.textContent = state.result.score;
  elements.resultHeading.textContent = t('resultTitle');
  elements.resultSummary.textContent = t(state.result.reason === 'complete' ? 'complete' : 'failed');
  if (state.invite) {
    const comparison = compareScores(state.result.score, state.invite.target);
    elements.comparison.hidden = false;
    elements.comparisonText.textContent = `${t(comparison.outcome, { difference: comparison.difference })} · ${t('target', { score: state.invite.target })}`;
    elements.shareButton.textContent = t('shareAgain');
  } else {
    elements.comparison.hidden = true;
    elements.comparisonText.textContent = '';
    elements.shareButton.textContent = t('share');
  }
}

async function shareResult() {
  if (!state.result) return;
  const url = buildInviteUrl(location.href, { challengeId: CHALLENGE_ID, seed: state.seed, target: state.result.score });
  const shareData = { title: t('challengeName'), text: `${t('challengeName')} · ${state.result.score}`, url };
  try {
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
      track('share_completed', { method: 'native', score: state.result.score });
      return;
    }
    await navigator.clipboard.writeText(url);
    announce(t('copied'));
    elements.gameStatus.textContent = t('copied');
    track('share_completed', { method: 'clipboard', score: state.result.score });
  } catch (error) {
    if (error?.name === 'AbortError') return;
    const copied = window.prompt(t('shareUnavailable'), url);
    track('share_fallback', { accepted: copied !== null });
  }
}

function bindEvents() {
  elements.language.addEventListener('change', () => {
    state.language = normalizeLanguage(elements.language.value);
    localStorage.setItem('sca-language', state.language);
    applyLanguage();
    track('language_changed', { language: state.language });
  });
  elements.motion.checked = state.reducedMotion;
  elements.motion.addEventListener('change', () => {
    state.reducedMotion = elements.motion.checked;
    localStorage.setItem('sca-reduced-motion', String(state.reducedMotion));
    document.documentElement.dataset.reducedMotion = String(state.reducedMotion);
    game?.setReducedMotion(state.reducedMotion);
    track('reduced_motion_changed', { enabled: state.reducedMotion });
  });
  elements.playButton.addEventListener('click', showInstructions);
  elements.startButton.addEventListener('click', beginRun);
  elements.backButtons.forEach((button) => button.addEventListener('click', () => setScreen('discovery')));
  elements.replayButton.addEventListener('click', beginRun);
  elements.newButton.addEventListener('click', () => {
    state.seed = createSeed();
    state.invite = null;
    history.replaceState({}, '', location.pathname);
    updateInviteUI();
    showInstructions();
  });
  elements.shareButton.addEventListener('click', shareResult);
  window.addEventListener('pagehide', () => game?.destroy(), { once: true });
}

function boot() {
  try {
    parseLocationInvite();
    bindEvents();
    updateInviteUI();
    applyLanguage();
    document.documentElement.dataset.reducedMotion = String(state.reducedMotion);
    elements.loading.hidden = true;
    elements.app.hidden = false;
    setScreen('discovery');
    track('app_ready', { language: state.language });
  } catch (error) {
    console.error(error);
    elements.loading.textContent = t('loadError');
    elements.loading.setAttribute('role', 'alert');
  }
}

supportedLanguages.forEach((language) => {
  const option = elements.language.querySelector(`option[value="${language}"]`);
  if (option) option.textContent = language === 'ar' ? 'العربية' : language === 'tr' ? 'Türkçe' : 'English';
});

boot();
