import {
  buildInviteUrl, buildResultSharePayload, CHALLENGE_ID, compareScores, comparisonSymbol,
  createSeed, ECHO_GRID_ID, initialScreenForInvite, parseInvite, screenAfterPageShow
} from './core.mjs';
import { catalog, getChallenge } from './catalog.mjs';
import { isRtl, normalizeLanguage, supportedLanguages, translate } from './i18n.mjs';
import { OrbitLockGame } from './game.mjs';
import { EchoGridGame } from './echo-game.mjs';

function readPreference(key) { try { return localStorage.getItem(key); } catch { return null; } }
function writePreference(key, value) { try { localStorage.setItem(key, value); } catch { /* session-only */ } }

const systemReducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = {
  language: normalizeLanguage(readPreference('sca-language') || navigator.language),
  reducedMotion: readPreference('sca-reduced-motion') === 'true' || systemReducedMotion,
  screen: 'discovery', challengeId: CHALLENGE_ID, seed: createSeed(), invite: null, result: null, invalidInvite: false, events: []
};

const elements = {
  loading: document.querySelector('#loading'), app: document.querySelector('#app'), errorBanner: document.querySelector('#error-banner'),
  language: document.querySelector('#language-select'), motion: document.querySelector('#motion-toggle'), cards: [...document.querySelectorAll('[data-challenge-id]')],
  invitedBadge: document.querySelector('#invited-badge'), targetText: document.querySelector('#target-text'), instructionCard: document.querySelector('.instruction-card'),
  instructionEyebrow: document.querySelector('#instruction-eyebrow'), instructionIcon: document.querySelector('#instruction-icon'),
  instructionTitle: document.querySelector('#instruction-title'), instructionCopy: document.querySelector('#instruction-copy'), instructionTarget: document.querySelector('#instruction-target'),
  startButton: document.querySelector('#start-button'), backButtons: [...document.querySelectorAll('[data-action="back"]')], inviteCatalogButton: document.querySelector('#invite-catalog-button'),
  gameHeading: document.querySelector('#game-heading'), canvas: document.querySelector('#game-canvas'), echoGrid: document.querySelector('#echo-grid'), controlsHint: document.querySelector('#controls-hint'),
  gameStatus: document.querySelector('#game-status'), score: document.querySelector('#score-value'), round: document.querySelector('#round-value'),
  lives: document.querySelector('#lives-value'), combo: document.querySelector('#combo-value'), resultScore: document.querySelector('#result-score'),
  resultHeading: document.querySelector('#result-heading'), resultSummary: document.querySelector('#result-summary'), resultChallenge: document.querySelector('#result-challenge'),
  comparison: document.querySelector('#comparison'), comparisonText: document.querySelector('#comparison-text'), comparisonSymbol: document.querySelector('#comparison-symbol'),
  challengerScore: document.querySelector('#challenger-score'), playerScore: document.querySelector('#player-score'), differenceText: document.querySelector('#difference-text'),
  replayButton: document.querySelector('#replay-button'), newButton: document.querySelector('#new-button'), catalogButton: document.querySelector('#catalog-button'),
  shareButton: document.querySelector('#share-button'), liveRegion: document.querySelector('#live-region')
};

let game = null;
function destroyGame() { game?.destroy(); game = null; }
function track(name, detail = {}) { state.events.push({ name, detail, at: Date.now() }); if (state.events.length > 50) state.events.shift(); }
function t(key, values) { return translate(state.language, key, values); }
function currentChallenge() { return getChallenge(state.challengeId); }
function challengeName() { const challenge = currentChallenge(); return challenge ? t(challenge.nameKey) : ''; }
function announce(message) { elements.liveRegion.textContent = ''; requestAnimationFrame(() => { elements.liveRegion.textContent = message; }); }

function renderCatalog() {
  elements.cards.forEach((card) => {
    const challenge = getChallenge(card.dataset.challengeId);
    if (!challenge) return;
    const name = t(challenge.nameKey);
    card.querySelector('[data-name]').textContent = name;
    card.querySelector('[data-tagline]').textContent = t(challenge.taglineKey);
    card.querySelector('[data-skill]').textContent = t(challenge.skill === 'timing' ? 'skillTiming' : 'skillMemory');
    card.querySelector('[data-duration]').textContent = t('seconds', { value: challenge.durationSeconds });
    card.setAttribute('aria-label', t('challengeCard', { name }));
    card.setAttribute('aria-current', challenge.id === state.challengeId ? 'true' : 'false');
  });
}

function renderChallengeText() {
  const challenge = currentChallenge();
  if (!challenge) return;
  elements.instructionIcon.textContent = challenge.icon;
  elements.instructionTitle.textContent = t(challenge.nameKey);
  elements.instructionCopy.textContent = t(challenge.howToKey);
  elements.gameHeading.textContent = t(challenge.nameKey);
  elements.controlsHint.textContent = t(challenge.controlsHintKey);
  elements.canvas.setAttribute('aria-label', t(challenge.arenaLabelKey));
  elements.echoGrid.setAttribute('aria-label', t(challenge.arenaLabelKey));
  [...elements.echoGrid.querySelectorAll('[data-cell]')].forEach((button, index) => button.setAttribute('aria-label', t('tileLabel', { value: index + 1 })));
  elements.resultChallenge.textContent = t(challenge.nameKey);
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = isRtl(state.language) ? 'rtl' : 'ltr';
  document.title = t('appName');
  elements.language.value = state.language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  renderCatalog(); renderChallengeText(); updateInviteUI(); renderResult();
  if (state.invalidInvite) elements.errorBanner.textContent = t('invalidLink');
}

function focusScreen(screen) {
  const target = screen === 'instructions' && state.invite
    ? elements.startButton
    : document.querySelector(`[data-screen="${screen}"] h1, [data-screen="${screen}"] h2`);
  target?.focus({ preventScroll: true });
}

function setScreen(screen) {
  state.screen = screen;
  document.querySelectorAll('[data-screen]').forEach((section) => { section.hidden = section.dataset.screen !== screen; });
  if (screen !== 'game') destroyGame();
  focusScreen(screen);
  track('screen_view', { screen, challenge: state.challengeId });
}

function updateInviteUI() {
  const invited = Boolean(state.invite);
  const name = challengeName();
  document.documentElement.dataset.invited = String(invited);
  elements.invitedBadge.hidden = !invited;
  elements.targetText.textContent = invited ? `${name} · ${t('beatScore', { score: state.invite.target })}` : '';
  elements.instructionCard.classList.toggle('is-invite', invited);
  elements.instructionEyebrow.hidden = !invited;
  elements.instructionEyebrow.textContent = invited ? t('invited') : '';
  elements.backButtons.forEach((button) => { button.hidden = invited; });
  elements.inviteCatalogButton.hidden = !invited;
  elements.startButton.textContent = invited ? t('acceptChallenge', { name }) : t('start');
  elements.instructionTarget.textContent = invited ? t('challengerTarget', { score: state.invite.target }) : t('sameRun');
}

function parseLocationInvite() {
  const parsed = parseInvite(window.location.search);
  if (!parsed.ok) {
    state.invalidInvite = true; elements.errorBanner.hidden = false; elements.errorBanner.textContent = t('invalidLink');
    history.replaceState({}, '', `${location.pathname}${location.hash}`); track('invite_invalid', { reason: parsed.reason }); return;
  }
  if (parsed.invite) {
    state.invite = parsed.invite; state.seed = parsed.invite.seed; state.challengeId = parsed.invite.challengeId;
    track('invite_opened', { challenge: parsed.invite.challengeId, target: parsed.invite.target });
  }
}

function selectChallenge(id, openInstructions = true) {
  const challenge = getChallenge(id);
  if (!challenge) return;
  if (state.invite && state.invite.challengeId !== id) {
    state.invite = null; state.seed = createSeed(); history.replaceState({}, '', location.pathname);
  }
  state.challengeId = id; state.result = null; renderCatalog(); renderChallengeText(); updateInviteUI();
  track('challenge_selected', { challenge: id });
  if (openInstructions) setScreen('instructions');
}

function handleGameAnnouncement(event) {
  let message = t(event.key, event.values);
  if (event.extraKey) message = `${message}. ${t(event.extraKey, event.extraValues)}`;
  elements.gameStatus.textContent = message; announce(message);
}

function resultAnnouncement() {
  if (!state.result) return '';
  if (!state.invite) return t('finalScore', { score: state.result.score });
  const comparison = compareScores(state.result.score, state.invite.target);
  return t('comparisonAnnouncement', {
    outcome: t(comparison.outcome, { difference: comparison.difference }),
    target: state.invite.target,
    score: state.result.score,
    difference: comparison.difference
  });
}

function beginRun() {
  const challenge = currentChallenge();
  if (!challenge) throw new Error('Challenge registry entry missing');
  setScreen('game'); state.result = null; elements.gameStatus.textContent = t('ready');
  const callbacks = {
    reducedMotion: state.reducedMotion,
    onUpdate: (snapshot) => {
      elements.score.textContent = snapshot.score;
      elements.round.textContent = `${Math.min(snapshot.round + 1, snapshot.rounds)}/${snapshot.rounds}`;
      elements.lives.textContent = snapshot.lives; elements.combo.textContent = snapshot.combo;
    },
    onAnnounce: handleGameAnnouncement,
    onFinish: (result) => {
      state.result = result; track('run_finished', { challenge: state.challengeId, score: result.score, reason: result.reason, round: result.round });
      renderResult(); setScreen('result'); announce(resultAnnouncement());
    }
  };
  if (state.challengeId === ECHO_GRID_ID) {
    elements.canvas.hidden = true; elements.echoGrid.hidden = false;
    game = new EchoGridGame({ container: elements.echoGrid, ...callbacks });
  } else {
    elements.canvas.hidden = false; elements.echoGrid.hidden = true;
    game = new OrbitLockGame({ canvas: elements.canvas, ...callbacks });
  }
  game.start(state.seed);
  if (state.challengeId !== ECHO_GRID_ID) elements.canvas.focus();
  track('run_started', { challenge: state.challengeId, seed: state.seed, invited: Boolean(state.invite) });
}

function renderResult() {
  if (!state.result) return;
  elements.resultScore.textContent = state.result.score; elements.resultHeading.textContent = t('resultTitle');
  elements.resultSummary.textContent = t(state.result.reason === 'complete' ? 'complete' : 'failed');
  elements.resultChallenge.textContent = challengeName();
  if (state.invite) {
    const comparison = compareScores(state.result.score, state.invite.target);
    const outcomeText = t(comparison.outcome, { difference: comparison.difference });
    elements.comparison.hidden = false;
    elements.comparison.dataset.outcome = comparison.outcome;
    elements.comparisonText.textContent = outcomeText;
    elements.comparisonSymbol.textContent = comparisonSymbol(comparison.outcome);
    elements.challengerScore.textContent = state.invite.target;
    elements.playerScore.textContent = state.result.score;
    elements.differenceText.textContent = t('differenceValue', { difference: comparison.difference });
    elements.comparison.setAttribute('aria-label', t('comparisonAnnouncement', {
      outcome: outcomeText, target: state.invite.target, score: state.result.score, difference: comparison.difference
    }));
    elements.shareButton.textContent = t('shareAgain');
  } else {
    elements.comparison.hidden = true; elements.comparison.removeAttribute('data-outcome'); elements.comparison.removeAttribute('aria-label');
    elements.comparisonText.textContent = ''; elements.comparisonSymbol.textContent = ''; elements.differenceText.textContent = '';
    elements.shareButton.textContent = t('share');
  }
}

async function shareResult() {
  if (!state.result) return;
  const url = buildInviteUrl(location.href, { challengeId: state.challengeId, seed: state.seed, target: state.result.score });
  const name = challengeName();
  const text = t(state.invite ? 'rematchShareText' : 'challengeShareText', { name, score: state.result.score });
  const payload = buildResultSharePayload({ title: name, text, url });
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare(payload.shareData))) {
      await navigator.share(payload.shareData); track('share_completed', { challenge: state.challengeId, method: 'native', score: state.result.score }); return;
    }
    await navigator.clipboard.writeText(payload.clipboardText); announce(t('copied')); elements.shareButton.textContent = t('copied');
    track('share_completed', { challenge: state.challengeId, method: 'clipboard', score: state.result.score });
  } catch (error) {
    if (error?.name === 'AbortError') return;
    const copied = window.prompt(t('shareUnavailable'), payload.clipboardText); elements.shareButton.focus({ preventScroll: true });
    track('share_fallback', { accepted: copied !== null });
  }
}

function handleRunError(error) {
  console.error(error); destroyGame(); elements.errorBanner.hidden = false; elements.errorBanner.textContent = t('loadError');
  announce(t('loadError')); setScreen('discovery');
}
function safeBeginRun() { try { beginRun(); } catch (error) { handleRunError(error); } }

function handlePageShow(event) {
  const nextScreen = screenAfterPageShow(event, state.screen);
  if (nextScreen === state.screen) return;
  state.result = null; setScreen(nextScreen); announce(t('ready')); track('bfcache_restored', { screen: nextScreen });
}

function bindEvents() {
  elements.language.addEventListener('change', () => {
    state.language = normalizeLanguage(elements.language.value); writePreference('sca-language', state.language); applyLanguage();
    track('language_changed', { language: state.language });
  });
  elements.motion.checked = state.reducedMotion;
  elements.motion.addEventListener('change', () => {
    state.reducedMotion = elements.motion.checked; writePreference('sca-reduced-motion', String(state.reducedMotion));
    document.documentElement.dataset.reducedMotion = String(state.reducedMotion); game?.setReducedMotion(state.reducedMotion);
    track('reduced_motion_changed', { enabled: state.reducedMotion });
  });
  elements.cards.forEach((card) => card.addEventListener('click', () => selectChallenge(card.dataset.challengeId)));
  elements.startButton.addEventListener('click', safeBeginRun);
  elements.backButtons.forEach((button) => button.addEventListener('click', () => setScreen('discovery')));
  elements.inviteCatalogButton.addEventListener('click', () => setScreen('discovery'));
  elements.replayButton.addEventListener('click', safeBeginRun);
  elements.newButton.addEventListener('click', () => {
    state.seed = createSeed(); state.invite = null; history.replaceState({}, '', location.pathname); updateInviteUI(); setScreen('instructions');
  });
  elements.catalogButton.addEventListener('click', () => {
    state.seed = createSeed(); state.invite = null; history.replaceState({}, '', location.pathname); updateInviteUI(); setScreen('discovery');
  });
  elements.shareButton.addEventListener('click', shareResult);
  window.addEventListener('pagehide', destroyGame);
  window.addEventListener('pageshow', handlePageShow);
}

function boot() {
  try {
    parseLocationInvite(); bindEvents(); applyLanguage(); document.documentElement.dataset.reducedMotion = String(state.reducedMotion);
    elements.loading.hidden = true; elements.app.hidden = false; setScreen(initialScreenForInvite(state.invite));
    track('app_ready', { language: state.language, challenges: catalog.length, invited: Boolean(state.invite) });
  } catch (error) {
    console.error(error); elements.loading.textContent = t('loadError'); elements.loading.setAttribute('role', 'alert');
  }
}

supportedLanguages.forEach((language) => {
  const option = elements.language.querySelector(`option[value="${language}"]`);
  if (option) option.textContent = language === 'ar' ? 'العربية' : language === 'tr' ? 'Türkçe' : 'English';
});
boot();
