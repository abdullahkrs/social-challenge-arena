import {
  buildInviteUrl, buildResultSharePayload, CHALLENGE_ID, compareScores, comparisonSymbol,
  createSeed, dailyChallengeFor, ECHO_GRID_ID, initialScreenForInvite, LUMEN_LANES_ID, MIRROR_FUSE_ID, parseInvite,
  readDailyBest, screenAfterPageShow, shouldRefreshDaily, shouldRefreshDailyOnPageShow, updateDailyBest, writeDailyBest
} from './core.mjs';
import { catalog, getChallenge } from './catalog.mjs';
import { isRtl, normalizeLanguage, supportedLanguages, translate } from './i18n.mjs';
import { classifyLocationInvite, stripInviteKeysFromUrl } from './invite-location.mjs';
import { OrbitLockGame } from './game.mjs';
import { EchoGridGame } from './echo-game.mjs';
import { LumenLanesGame } from './lumen-game.mjs';
import { MirrorFuseGame } from './mirror-game.mjs';
import './onboarding-copy.mjs';
import { buildFileShareData, buildResultCardModel, isShareCancellation, renderResultCard, supportsFileShare, supportsTextShare } from './share-card.mjs';

function browserStorage() { try { return window.localStorage; } catch { return null; } }
function readPreference(key) { try { return browserStorage()?.getItem(key) ?? null; } catch { return null; } }
function writePreference(key, value) { try { browserStorage()?.setItem(key, value); } catch { /* session-only */ } }

const systemReducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = {
  language: normalizeLanguage(readPreference('sca-language') || navigator.language),
  reducedMotion: readPreference('sca-reduced-motion') === 'true' || systemReducedMotion,
  screen: 'discovery', challengeId: CHALLENGE_ID, seed: createSeed(), invite: null, result: null, invalidInvite: false, events: [],
  daily: null, activeDaily: null, dailyBest: null, dailyStorageAvailable: true,
  hud: { score: 0, progress: 1, lives: 3, combo: 0 }
};

const elements = {
  loading: document.querySelector('#loading'), app: document.querySelector('#app'), errorBanner: document.querySelector('#error-banner'),
  language: document.querySelector('#language-select'), motion: document.querySelector('#motion-toggle'), cards: [...document.querySelectorAll('[data-challenge-id]')],
  invitedBadge: document.querySelector('#invited-badge'), targetText: document.querySelector('#target-text'), instructionCard: document.querySelector('.instruction-card'),
  instructionEyebrow: document.querySelector('#instruction-eyebrow'), instructionIcon: document.querySelector('#instruction-icon'),
  instructionTitle: document.querySelector('#instruction-title'), instructionCopy: document.querySelector('#instruction-copy'), instructionTarget: document.querySelector('#instruction-target'),
  startButton: document.querySelector('#start-button'), backButtons: [...document.querySelectorAll('[data-action="back"]')], inviteCatalogButton: document.querySelector('#invite-catalog-button'),
  dailyEntry: document.querySelector('#daily-entry'), dailyIcon: document.querySelector('#daily-icon'), dailyDate: document.querySelector('#daily-date'),
  dailyChallengeName: document.querySelector('#daily-challenge-name'), dailyTagline: document.querySelector('#daily-tagline'), dailyBest: document.querySelector('#daily-best'),
  dailyStartButton: document.querySelector('#daily-start-button'), gameHeading: document.querySelector('#game-heading'), canvas: document.querySelector('#game-canvas'),
  echoGrid: document.querySelector('#echo-grid'), lumenLanes: document.querySelector('#lumen-lanes'), mirrorFuse: document.querySelector('#mirror-fuse'),
  controlsHint: document.querySelector('#controls-hint'), gameStatus: document.querySelector('#game-status'),
  score: document.querySelector('#score-value'), progressLabel: document.querySelector('#round-value')?.closest('div')?.querySelector('span'),
  progress: document.querySelector('#round-value'), lives: document.querySelector('#lives-value'), combo: document.querySelector('#combo-value'),
  resultScore: document.querySelector('#result-score'), resultHeading: document.querySelector('#result-heading'), resultSummary: document.querySelector('#result-summary'),
  resultChallenge: document.querySelector('#result-challenge'), resultDetail: document.querySelector('#result-detail'), dailyResult: document.querySelector('#daily-result'), comparison: document.querySelector('#comparison'),
  comparisonText: document.querySelector('#comparison-text'), comparisonSymbol: document.querySelector('#comparison-symbol'), challengerScore: document.querySelector('#challenger-score'),
  playerScore: document.querySelector('#player-score'), differenceText: document.querySelector('#difference-text'), replayButton: document.querySelector('#replay-button'),
  newButton: document.querySelector('#new-button'), catalogButton: document.querySelector('#catalog-button'), shareButton: document.querySelector('#share-button'),
  liveRegion: document.querySelector('#live-region')
};

let game = null;
let activeShare = null;
function destroyGame() { game?.destroy(); game = null; }
function cancelShare() {
  if (!activeShare) return;
  activeShare.controller.abort();
  activeShare.artifact?.dispose();
  activeShare = null;
  elements.shareButton.disabled = false;
  elements.shareButton.removeAttribute('aria-busy');
  renderResult();
}
function track(name, detail = {}) { state.events.push({ name, detail, at: Date.now() }); if (state.events.length > 50) state.events.shift(); }
function t(key, values) { return translate(state.language, key, values); }
function currentChallenge() { return getChallenge(state.challengeId); }
function challengeName() { const challenge = currentChallenge(); return challenge ? t(challenge.nameKey) : ''; }
function announce(message) { elements.liveRegion.textContent = ''; requestAnimationFrame(() => { elements.liveRegion.textContent = message; }); }

function renderCatalog() {
  const skillKeys = { timing: 'skillTiming', memory: 'skillMemory', reaction: 'skillReaction', spatial: 'skillSpatial' };
  elements.cards.forEach((card) => {
    const challenge = getChallenge(card.dataset.challengeId);
    if (!challenge) return;
    const name = t(challenge.nameKey);
    card.querySelector('[data-name]').textContent = name;
    card.querySelector('[data-tagline]').textContent = t(challenge.taglineKey);
    card.querySelector('[data-skill]').textContent = t(skillKeys[challenge.skill] || 'play');
    card.querySelector('[data-duration]').textContent = t(challenge.statusKey);
    card.setAttribute('aria-label', t('challengeCard', { name }));
    card.setAttribute('aria-current', challenge.id === state.challengeId ? 'true' : 'false');
  });
}

function renderHud() {
  const challenge = currentChallenge();
  if (!challenge) return;
  elements.progressLabel.textContent = t(challenge.progressLabelKey);
  elements.score.textContent = String(state.hud.score);
  elements.progress.textContent = String(state.hud.progress);
  elements.lives.textContent = String(state.hud.lives);
  elements.combo.textContent = String(state.hud.combo);
}

function resetHud() {
  state.hud = { score: 0, progress: 1, lives: 3, combo: 0 };
  renderHud();
}

function renderChallengeText() {
  const challenge = currentChallenge();
  if (!challenge) return;
  elements.instructionIcon.textContent = challenge.icon;
  elements.instructionTitle.textContent = t(challenge.nameKey);
  elements.instructionCopy.textContent = t(challenge.howToKey);
  elements.gameHeading.textContent = t(challenge.nameKey);
  elements.controlsHint.textContent = t(challenge.controlsHintKey);
  elements.canvas.setAttribute('aria-label', t('orbitArenaLabel'));
  elements.echoGrid.setAttribute('aria-label', t('echoArenaLabel'));
  elements.lumenLanes.setAttribute('aria-label', t('lumenArenaLabel'));
  elements.mirrorFuse.setAttribute('aria-label', t('mirrorArenaLabel'));
  [...elements.echoGrid.querySelectorAll('[data-cell]')].forEach((button, index) => button.setAttribute('aria-label', t('tileLabel', { value: index + 1 })));
  const laneKeys = ['laneLeft', 'laneCenter', 'laneRight'];
  [...elements.lumenLanes.querySelectorAll('[data-lane]')].forEach((button, index) => button.setAttribute('aria-label', t(laneKeys[index])));
  [...elements.mirrorFuse.querySelectorAll('[data-mirror-option]')].forEach((button, index) => button.setAttribute('aria-label', t('mirrorOptionLabel', { value: index + 1 })));
  elements.resultChallenge.textContent = t(challenge.nameKey);
  renderHud();
}

function formatDailyDate(dateKey) {
  try {
    return new Intl.DateTimeFormat(state.language, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${dateKey}T12:00:00Z`));
  } catch {
    return dateKey;
  }
}

function dailyBestText(record = state.dailyBest) {
  const parts = [record ? t('dailyBest', { score: record.best }) : t('dailyNoBest')];
  if (!state.dailyStorageAvailable) parts.push(t('dailySessionOnly'));
  return parts.join(' · ');
}

function renderDailyEntry() {
  if (!state.daily) return;
  const challenge = getChallenge(state.daily.challengeId);
  if (!challenge) return;
  const name = t(challenge.nameKey);
  elements.dailyEntry.dataset.challenge = challenge.id;
  elements.dailyIcon.textContent = challenge.icon;
  elements.dailyDate.textContent = formatDailyDate(state.daily.dateKey);
  elements.dailyChallengeName.textContent = name;
  elements.dailyTagline.textContent = t(challenge.taglineKey);
  elements.dailyBest.textContent = dailyBestText();
  elements.dailyStartButton.textContent = t('dailyPlay');
  elements.dailyStartButton.setAttribute('aria-label', t('dailyPlayLabel', { name }));
}

function refreshDailyChallenge(input = new Date()) {
  if (!shouldRefreshDaily(state.daily, input, state.screen)) {
    renderDailyEntry();
    return;
  }
  state.daily = dailyChallengeFor(input);
  const stored = readDailyBest(browserStorage(), state.daily);
  state.dailyBest = stored.record;
  state.dailyStorageAvailable = stored.available;
  renderDailyEntry();
  track('daily_refreshed', { dateKey: state.daily.dateKey, challenge: state.daily.challengeId });
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.documentElement.dir = isRtl(state.language) ? 'rtl' : 'ltr';
  document.title = t('appName');
  elements.language.value = state.language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  renderCatalog(); renderChallengeText(); renderDailyEntry(); updateEntryUI(); renderResult();
  if (state.invalidInvite) elements.errorBanner.textContent = t('invalidLink');
}

function focusScreen(screen) {
  const target = screen === 'instructions' && state.invite
    ? elements.startButton
    : document.querySelector(`[data-screen="${screen}"] h1, [data-screen="${screen}"] h2`);
  target?.focus({ preventScroll: true });
}

function setScreen(screen) {
  if (screen !== 'result') cancelShare();
  state.screen = screen;
  if (screen === 'discovery') {
    state.activeDaily = null;
    refreshDailyChallenge(new Date());
  }
  document.querySelectorAll('[data-screen]').forEach((section) => { section.hidden = section.dataset.screen !== screen; });
  if (screen !== 'game') destroyGame();
  updateEntryUI();
  focusScreen(screen);
  track('screen_view', { screen, challenge: state.challengeId });
}

function updateEntryUI() {
  const invited = Boolean(state.invite);
  const dailyEntry = Boolean(state.activeDaily && !invited);
  const name = challengeName();
  document.documentElement.dataset.entry = invited ? 'invite' : dailyEntry ? 'daily' : 'normal';
  elements.invitedBadge.hidden = !invited;
  elements.targetText.textContent = invited ? `${name} · ${t('beatScore', { score: state.invite.target })}` : '';
  elements.instructionCard.classList.toggle('is-invite', invited);
  elements.instructionCard.classList.toggle('is-daily', dailyEntry);
  elements.instructionEyebrow.hidden = true;
  elements.instructionEyebrow.textContent = '';
  elements.backButtons.forEach((button) => { button.hidden = invited; });
  elements.inviteCatalogButton.hidden = !invited;
  elements.startButton.textContent = invited ? t('acceptChallenge', { name }) : dailyEntry ? t('dailyPlay') : t('start');
  elements.instructionTarget.hidden = !invited && !dailyEntry;
  elements.instructionTarget.textContent = invited
    ? `${t('invited')} · ${t('challengerTarget', { score: state.invite.target })}`
    : dailyEntry ? `${t('dailyTitle')} · ${t('dailySameRoute')}` : '';
  const descriptions = ['instruction-copy'];
  if (!elements.instructionTarget.hidden) descriptions.push('instruction-target');
  elements.startButton.setAttribute('aria-describedby', descriptions.join(' '));
}

function parseLocationInvite() {
  const parsed = classifyLocationInvite(window.location.search, parseInvite);
  if (!parsed.ok) {
    state.invalidInvite = true; elements.errorBanner.hidden = false; elements.errorBanner.textContent = t('invalidLink');
    history.replaceState({}, '', stripInviteKeysFromUrl(window.location.href));
    track('invite_invalid', { reason: parsed.reason }); return;
  }
  if (parsed.invite) {
    state.invite = parsed.invite; state.activeDaily = null; state.seed = parsed.invite.seed; state.challengeId = parsed.invite.challengeId;
    track('invite_opened', { challenge: parsed.invite.challengeId, target: parsed.invite.target });
  }
}

function selectChallenge(id, openInstructions = true) {
  const challenge = getChallenge(id);
  if (!challenge) return;
  state.activeDaily = null;
  if (state.invite && state.invite.challengeId !== id) {
    state.invite = null; state.seed = createSeed(); history.replaceState({}, '', location.pathname);
  }
  state.challengeId = id; state.result = null; resetHud(); renderCatalog(); renderChallengeText(); updateEntryUI();
  track('challenge_selected', { challenge: id });
  if (openInstructions) setScreen('instructions');
}

function handleGameAnnouncement(event) {
  let message = t(event.key, event.values);
  if (event.extraKey) message = `${message}. ${t(event.extraKey, event.extraValues)}`;
  elements.gameStatus.textContent = message; announce(message);
}

function dailyResultText(dailyResult) {
  if (!dailyResult) return '';
  const parts = [t(dailyResult.isNewBest ? 'dailyNewBest' : 'dailyBest', { score: dailyResult.best })];
  if (!dailyResult.storageAvailable) parts.push(t('dailySessionOnly'));
  return parts.join(' · ');
}

function resultAnnouncement() {
  if (!state.result) return '';
  let message;
  if (!state.invite) {
    message = t('finalScore', { score: state.result.score });
  } else {
    const comparison = compareScores(state.result.score, state.invite.target);
    message = t('comparisonAnnouncement', {
      outcome: t(comparison.outcome, { difference: comparison.difference }),
      target: state.invite.target,
      score: state.result.score,
      difference: comparison.difference
    });
  }
  const dailyText = dailyResultText(state.result.dailyBest);
  return dailyText ? `${message}. ${dailyText}.` : message;
}

function beginRun() {
  const challenge = currentChallenge();
  if (!challenge) throw new Error('Challenge registry entry missing');
  resetHud();
  elements.resultDetail.hidden = true;
  elements.resultDetail.textContent = '';
  setScreen('game'); state.result = null; elements.gameStatus.textContent = t('ready');
  const callbacks = {
    reducedMotion: state.reducedMotion,
    onUpdate: (snapshot) => {
      state.hud = {
        score: snapshot.score,
        progress: Math.max(1, Number(snapshot.round ?? 0) + 1),
        lives: snapshot.lives,
        combo: snapshot.combo
      };
      renderHud();
    },
    onAnnounce: handleGameAnnouncement,
    onFinish: (result) => {
      const finished = { ...result };
      if (state.activeDaily) {
        const outcome = updateDailyBest(state.dailyBest, state.activeDaily, result.score);
        state.dailyBest = outcome.record;
        state.dailyStorageAvailable = writeDailyBest(browserStorage(), outcome.record, state.activeDaily);
        finished.dailyBest = { best: outcome.record.best, isNewBest: outcome.isNewBest, storageAvailable: state.dailyStorageAvailable };
      }
      state.result = finished;
      track('run_finished', { challenge: state.challengeId, score: result.score, reason: result.reason, round: result.round, daily: Boolean(state.activeDaily) });
      renderResult(); setScreen('result'); announce(resultAnnouncement());
    }
  };

  elements.canvas.hidden = true;
  elements.echoGrid.hidden = true;
  elements.lumenLanes.hidden = true;
  elements.mirrorFuse.hidden = true;
  if (state.challengeId === ECHO_GRID_ID) {
    elements.echoGrid.hidden = false;
    game = new EchoGridGame({ container: elements.echoGrid, ...callbacks });
  } else if (state.challengeId === LUMEN_LANES_ID) {
    elements.lumenLanes.hidden = false;
    game = new LumenLanesGame({ container: elements.lumenLanes, ...callbacks });
  } else if (state.challengeId === MIRROR_FUSE_ID) {
    elements.mirrorFuse.hidden = false;
    game = new MirrorFuseGame({ container: elements.mirrorFuse, ...callbacks });
  } else {
    elements.canvas.hidden = false;
    game = new OrbitLockGame({ canvas: elements.canvas, ...callbacks });
  }
  game.start(state.seed);
  if (state.challengeId === CHALLENGE_ID) elements.canvas.focus();
  track('run_started', { challenge: state.challengeId, seed: state.seed, invited: Boolean(state.invite), daily: Boolean(state.activeDaily) });
}

function beginDailyRun() {
  refreshDailyChallenge(new Date());
  if (!state.daily) return;
  state.activeDaily = { ...state.daily };
  state.invite = null;
  state.challengeId = state.activeDaily.challengeId;
  state.seed = state.activeDaily.seed;
  state.result = null;
  history.replaceState({}, '', location.pathname);
  resetHud(); renderCatalog(); renderChallengeText(); updateEntryUI();
  setScreen('instructions');
}

function renderResult() {
  if (!state.result) return;
  elements.resultScore.textContent = state.result.score; elements.resultHeading.textContent = t('resultTitle');
  const reasonKey = state.result.reason === 'complete' ? 'complete' : state.result.reason === 'ended' ? 'ended' : 'failed';
  elements.resultSummary.textContent = t(reasonKey);
  elements.resultChallenge.textContent = challengeName();
  elements.dailyResult.hidden = !state.result.dailyBest;
  elements.dailyResult.textContent = dailyResultText(state.result.dailyBest);
  elements.newButton.hidden = Boolean(state.activeDaily);
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

async function copyOrPrompt(payload, session) {
  try {
    await navigator.clipboard.writeText(payload.clipboardText);
    if (activeShare !== session || session.controller.signal.aborted) return;
    announce(t('copied'));
    track('share_completed', { challenge: state.challengeId, method: 'clipboard', score: state.result.score });
  } catch {
    if (activeShare !== session || session.controller.signal.aborted) return;
    const copied = window.prompt(t('shareUnavailable'), payload.clipboardText);
    if (activeShare !== session || session.controller.signal.aborted) return;
    elements.shareButton.focus({ preventScroll: true });
    announce(t('shareFallback'));
    track('share_fallback', { accepted: copied !== null });
  }
}

function resultCardModel() {
  const comparison = state.invite ? compareScores(state.result.score, state.invite.target) : null;
  return buildResultCardModel({
    challengeId: state.challengeId,
    language: state.language,
    direction: isRtl(state.language) ? 'rtl' : 'ltr',
    appName: t('appName'),
    challengeName: challengeName(),
    score: state.result.score,
    challengerScore: state.invite?.target,
    labels: {
      score: t('score'), challenger: t('challenger'), you: t('you'), duel: t('shareCardDuel'),
      outcome: comparison ? t(comparison.outcome, { difference: comparison.difference }) : '',
      callToAction: t('shareCardCallToAction'), privacy: t('privacy')
    }
  });
}

async function shareResult() {
  if (!state.result || activeShare) return;
  const session = { controller: new AbortController(), artifact: null };
  activeShare = session;
  elements.shareButton.disabled = true;
  elements.shareButton.setAttribute('aria-busy', 'true');
  elements.shareButton.textContent = t('sharePreparing');
  announce(t('sharePreparing'));
  const url = buildInviteUrl(location.href, { challengeId: state.challengeId, seed: state.seed, target: state.result.score });
  const name = challengeName();
  const text = t(state.invite ? 'rematchShareText' : 'challengeShareText', { name, score: state.result.score });
  const payload = buildResultSharePayload({ title: name, text, url });
  let artifact = null;
  try {
    try {
      artifact = await renderResultCard(resultCardModel(), { signal: session.controller.signal });
      if (activeShare !== session || session.controller.signal.aborted) return;
      session.artifact = artifact;
      track('share_card_rendered', { challenge: state.challengeId, bytes: artifact.size, invited: Boolean(state.invite) });
    } catch (error) {
      if (isShareCancellation(error) || session.controller.signal.aborted) return;
      track('share_card_failed', { challenge: state.challengeId, reason: error?.name || 'render' });
    }

    if (artifact?.file && supportsFileShare(navigator, artifact.file)) {
      try {
        await navigator.share(buildFileShareData(payload.shareData, artifact.file));
        if (activeShare !== session || session.controller.signal.aborted) return;
        announce(t('shareComplete'));
        track('share_completed', { challenge: state.challengeId, method: 'native-file', score: state.result.score });
        return;
      } catch (error) {
        if (activeShare !== session || session.controller.signal.aborted) return;
        if (isShareCancellation(error)) {
          announce(t('shareCancelled'));
          track('share_cancelled', { challenge: state.challengeId, method: 'native-file' });
          return;
        }
        track('native_share_failed', { challenge: state.challengeId, method: 'native-file', reason: error?.name || 'share' });
      }
    }
    if (supportsTextShare(navigator, payload.shareData)) {
      try {
        await navigator.share(payload.shareData);
        if (activeShare !== session || session.controller.signal.aborted) return;
        announce(t('shareComplete'));
        track('share_completed', { challenge: state.challengeId, method: 'native-text', score: state.result.score });
        return;
      } catch (error) {
        if (activeShare !== session || session.controller.signal.aborted) return;
        if (isShareCancellation(error)) {
          announce(t('shareCancelled'));
          track('share_cancelled', { challenge: state.challengeId, method: 'native-text' });
          return;
        }
        track('native_share_failed', { challenge: state.challengeId, method: 'native-text', reason: error?.name || 'share' });
      }
    }
    if (activeShare === session && !session.controller.signal.aborted) await copyOrPrompt(payload, session);
  } finally {
    artifact?.dispose();
    if (activeShare === session) {
      activeShare = null;
      elements.shareButton.disabled = false;
      elements.shareButton.removeAttribute('aria-busy');
      renderResult();
    }
  }
}

function handleRunError(error) {
  console.error(error); destroyGame(); elements.errorBanner.hidden = false; elements.errorBanner.textContent = t('loadError');
  announce(t('loadError')); setScreen('discovery');
}
function safeBeginRun() { try { beginRun(); } catch (error) { handleRunError(error); } }

function handlePageShow(event, input = new Date()) {
  const nextScreen = screenAfterPageShow(event, state.screen);
  if (nextScreen === state.screen) {
    if (shouldRefreshDailyOnPageShow(event, state.daily, input, state.screen)) refreshDailyChallenge(input);
    return;
  }
  state.result = null; setScreen(nextScreen); announce(t('ready')); track('bfcache_restored', { screen: nextScreen });
}

function bindEvents() {
  elements.language.addEventListener('change', () => {
    cancelShare();
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
  elements.dailyStartButton.addEventListener('click', beginDailyRun);
  elements.startButton.addEventListener('click', safeBeginRun);
  elements.backButtons.forEach((button) => button.addEventListener('click', () => setScreen('discovery')));
  elements.inviteCatalogButton.addEventListener('click', () => setScreen('discovery'));
  elements.replayButton.addEventListener('click', safeBeginRun);
  elements.newButton.addEventListener('click', () => {
    state.activeDaily = null; state.seed = createSeed(); state.invite = null; history.replaceState({}, '', location.pathname); resetHud(); updateEntryUI(); setScreen('instructions');
  });
  elements.catalogButton.addEventListener('click', () => {
    state.activeDaily = null; state.seed = createSeed(); state.invite = null; history.replaceState({}, '', location.pathname); resetHud(); updateEntryUI(); setScreen('discovery');
  });
  elements.shareButton.addEventListener('click', shareResult);
  window.addEventListener('pagehide', destroyGame);
  window.addEventListener('pagehide', cancelShare);
  window.addEventListener('pageshow', handlePageShow);
}

function boot() {
  try {
    parseLocationInvite(); bindEvents(); applyLanguage(); document.documentElement.dataset.reducedMotion = String(state.reducedMotion);
    elements.loading.hidden = true; elements.app.hidden = false; setScreen(initialScreenForInvite(state.invite));
    track('app_ready', { language: state.language, challenges: catalog.length, invited: Boolean(state.invite), daily: state.daily?.dateKey || null });
  } catch (error) {
    console.error(error); elements.loading.textContent = t('loadError'); elements.loading.setAttribute('role', 'alert');
  }
}

supportedLanguages.forEach((language) => {
  const option = elements.language.querySelector(`option[value="${language}"]`);
  if (option) option.textContent = language === 'ar' ? 'العربية' : language === 'tr' ? 'Türkçe' : 'English';
});
boot();
