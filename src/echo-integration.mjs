import { normalizeLanguage, translate } from './i18n.mjs';

const echo = document.querySelector('#echo-grid');
const gameScreen = document.querySelector('[data-screen="game"]');
const roundCell = document.querySelector('#round-value')?.closest('div');
const roundLabel = roundCell?.querySelector('span');
const roundValue = document.querySelector('#round-value');
const zoneValue = echo?.querySelector('[data-echo-zone]');
const distanceValue = echo?.querySelector('[data-echo-distance]');
const ruleValues = echo ? [...echo.querySelectorAll('[data-echo-rule]')] : [];
const exitButton = echo?.querySelector('[data-echo-exit]');
const repeatButton = echo?.querySelector('[data-echo-repeat]');
const readyButton = echo?.querySelector('[data-echo-ready]');
const cellButtons = echo ? [...echo.querySelectorAll('[data-cell]')] : [];
const accessibleRoute = echo?.querySelector('[data-echo-accessible-route]');
const resultDetail = document.querySelector('#result-detail');
const resultSummary = document.querySelector('#result-summary');
const durationValue = document.querySelector('[data-challenge-id="echo-grid"] [data-duration]');

let activeStage = null;
let activeSnapshot = null;
let lastResult = null;
let exitArmed = false;
let routeAnnouncement = 'none';

function language() {
  return normalizeLanguage(document.documentElement.lang);
}

function t(key, values = {}) {
  return translate(language(), key, values);
}

const zoneKeys = {
  origin: 'echoZoneOrigin',
  crosswind: 'echoZoneCrosswind',
  reflection: 'echoZoneReflection',
  archive: 'echoZoneArchive'
};

const ruleKeys = {
  trace: 'echoRuleTrace',
  reverse: 'echoRuleReverse',
  mirror: 'echoRuleMirror',
  fold: 'echoRuleFold'
};

const positionKeys = [
  'echoCellTopLeft', 'echoCellTopCenter', 'echoCellTopRight',
  'echoCellMiddleLeft', 'echoCellCenter', 'echoCellMiddleRight',
  'echoCellBottomLeft', 'echoCellBottomCenter', 'echoCellBottomRight'
];

function updateCatalogDuration() {
  if (durationValue && durationValue.textContent !== t('endless')) durationValue.textContent = t('endless');
}

function positionName(index) {
  return t(positionKeys[index] || 'tileLabel', { value: index + 1 });
}

function updateCellLabels(stage = activeStage) {
  cellButtons.forEach((button, index) => {
    const notes = [];
    if (button.classList.contains('is-player')) notes.push(t('echoCurrentPosition'));
    if (stage?.blocked?.includes(index)) notes.push(t('echoBlockedCell'));
    if (stage?.risk?.tiles?.includes(index)) notes.push(t('echoRiskCell'));
    button.setAttribute('aria-label', [positionName(index), ...notes].join('. '));
  });
}

function updateActions(stage = activeStage) {
  if (!stage) return;
  if (repeatButton) {
    repeatButton.textContent = t('replay');
    repeatButton.setAttribute('aria-label', `${t('replay')}: ${t(ruleKeys[stage.mechanic])}`);
  }
  if (readyButton) {
    readyButton.textContent = t('ready');
    readyButton.setAttribute('aria-label', `${t('ready')}: ${t(ruleKeys[stage.mechanic])}`);
  }
}

function routeText(stage = activeStage) {
  if (!stage) return '';
  const route = stage.previewPath.map(positionName).join(', ');
  const decoy = stage.decoy === null ? '' : ` ${t('echoDecoyAnnouncement', { position: positionName(stage.decoy) })}`;
  const risk = stage.risk ? ` ${t('echoRiskAvailable')}` : '';
  return `${t(ruleKeys[stage.mechanic])}. ${t('echoRouteAnnouncement', { count: stage.previewPath.length, route })}${decoy}${risk} ${t('echoReadyInstruction')}`;
}

function updateAccessibleRoute(stage = activeStage) {
  if (!accessibleRoute) return;
  if (!stage || routeAnnouncement === 'none') {
    accessibleRoute.textContent = '';
    return;
  }
  if (routeAnnouncement === 'response') {
    accessibleRoute.textContent = `${t('echoResponseAnnouncement', { rule: t(ruleKeys[stage.mechanic]), start: positionName(stage.targetPath[0]) })}`;
    return;
  }
  accessibleRoute.textContent = routeText(stage);
}

function updateStage(stage = activeStage, snapshot = activeSnapshot) {
  if (!stage || !echo) return;
  gameScreen?.setAttribute('data-echo-active', 'true');
  if (roundLabel) roundLabel.textContent = t('echoDistance');
  if (roundValue) roundValue.textContent = String((snapshot?.round ?? stage.index) + 1);
  if (zoneValue) zoneValue.textContent = t(zoneKeys[stage.zone] || 'echoZoneOrigin');
  if (distanceValue) distanceValue.textContent = t('echoPath', { value: stage.index + 1 });
  ruleValues.forEach((element) => { element.textContent = t(ruleKeys[stage.mechanic] || 'echoRuleTrace'); });
  if (exitButton) exitButton.textContent = t(exitArmed ? 'echoExitNow' : 'echoEndRun');
  updateActions(stage);
  updateCellLabels(stage);
}

function updateResult(result = lastResult) {
  if (!result || !resultDetail) return;
  resultDetail.hidden = false;
  resultDetail.textContent = t('echoResultDetail', {
    paths: result.paths ?? result.cleared ?? 0,
    combo: result.bestCombo ?? 0,
    accuracy: result.accuracy ?? 0,
    risk: result.riskRoutes ?? 0
  });
  if (resultSummary && result.reason === 'ended') resultSummary.textContent = t('echoEnded');
}

function resetSharedHud() {
  gameScreen?.removeAttribute('data-echo-active');
  if (roundLabel) roundLabel.textContent = t('round');
  resultDetail?.setAttribute('hidden', '');
  activeStage = null;
  activeSnapshot = null;
  lastResult = null;
  exitArmed = false;
  routeAnnouncement = 'none';
  updateCellLabels(null);
  updateAccessibleRoute(null);
}

if (echo) {
  echo.addEventListener('echo:start', (event) => {
    lastResult = null;
    resultDetail?.setAttribute('hidden', '');
    activeSnapshot = event.detail.snapshot;
    exitArmed = false;
    routeAnnouncement = 'none';
    updateAccessibleRoute(null);
    gameScreen?.setAttribute('data-echo-active', 'true');
    if (roundLabel) roundLabel.textContent = t('echoDistance');
    if (roundValue) roundValue.textContent = '1';
    if (exitButton) exitButton.textContent = t('echoEndRun');
  });

  echo.addEventListener('echo:route-clear', () => {
    routeAnnouncement = 'none';
    updateAccessibleRoute(null);
  });

  echo.addEventListener('echo:stage', (event) => {
    activeStage = event.detail.stage;
    activeSnapshot = event.detail.snapshot;
    routeAnnouncement = 'none';
    updateStage();
    updateAccessibleRoute();
  });

  echo.addEventListener('echo:route-ready', (event) => {
    activeStage = event.detail.stage;
    routeAnnouncement = 'route';
    updateStage();
    updateAccessibleRoute();
  });

  echo.addEventListener('echo:response', (event) => {
    activeStage = event.detail.stage;
    routeAnnouncement = 'response';
    updateStage();
    updateAccessibleRoute();
  });

  echo.addEventListener('echo:snapshot', (event) => {
    activeSnapshot = event.detail.snapshot;
    if (activeStage && roundValue) roundValue.textContent = String(activeSnapshot.round + 1);
    updateCellLabels();
  });

  echo.addEventListener('echo:exit-armed', () => {
    exitArmed = true;
    updateStage();
  });

  echo.addEventListener('echo:exit-disarmed', () => {
    exitArmed = false;
    updateStage();
  });

  echo.addEventListener('echo:finish', (event) => {
    lastResult = event.detail.result;
    routeAnnouncement = 'none';
    updateAccessibleRoute(null);
    queueMicrotask(() => updateResult());
  });

  new MutationObserver(() => {
    if (echo.hidden && document.querySelector('[data-screen="game"]')?.hidden === false) resetSharedHud();
  }).observe(echo, { attributes: true, attributeFilter: ['hidden'] });
}

new MutationObserver(() => {
  updateCatalogDuration();
  if (activeStage) updateStage();
  if (lastResult) updateResult();
  if (!activeStage) updateCellLabels(null);
  updateAccessibleRoute();
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });

if (durationValue) {
  new MutationObserver(updateCatalogDuration).observe(durationValue, { childList: true, characterData: true, subtree: true });
}
queueMicrotask(updateCatalogDuration);
updateCatalogDuration();
updateCellLabels(null);
if (exitButton) exitButton.textContent = t('echoEndRun');
