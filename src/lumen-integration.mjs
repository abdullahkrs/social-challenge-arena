import { normalizeLanguage, translate } from './i18n.mjs';

const lumen = document.querySelector('#lumen-lanes');
const gameScreen = document.querySelector('[data-screen="game"]');
const roundCell = document.querySelector('#round-value')?.closest('div');
const roundLabel = roundCell?.querySelector('span');
const roundValue = document.querySelector('#round-value');
const zoneValue = lumen?.querySelector('[data-lumen-zone]');
const distanceValue = lumen?.querySelector('[data-lumen-distance]');
const ruleValues = lumen ? [...lumen.querySelectorAll('[data-lumen-rule]')] : [];
const exitButton = lumen?.querySelector('[data-lumen-exit]');
const laneButtons = lumen ? [...lumen.querySelectorAll('[data-lane]')] : [];
const accessibleSequence = lumen?.querySelector('[data-lumen-accessible-sequence]');
const resultDetail = document.querySelector('#result-detail');
const resultSummary = document.querySelector('#result-summary');
const durationValue = document.querySelector('[data-challenge-id="lumen-lanes"] [data-duration]');

let activeStage = null;
let activeSnapshot = null;
let lastResult = null;
let exitArmed = false;

function language() {
  return normalizeLanguage(document.documentElement.lang);
}

function t(key, values = {}) {
  return translate(language(), key, values);
}

const zoneKeys = {
  prism: 'lumenZonePrism',
  current: 'lumenZoneCurrent',
  signal: 'lumenZoneSignal',
  vault: 'lumenZoneVault'
};

const ruleKeys = {
  direct: 'lumenRuleDirect',
  mirror: 'lumenRuleMirror',
  choice: 'lumenRuleChoice',
  memory: 'lumenRuleMemory'
};

function updateCatalogDuration() {
  if (durationValue && durationValue.textContent !== t('endless')) durationValue.textContent = t('endless');
}

function laneName(index) {
  return t(['laneLeft', 'laneCenter', 'laneRight'][index]);
}

function updateLaneLabels(stage = activeStage) {
  laneButtons.forEach((button, index) => {
    const notes = [];
    if (stage?.mechanic === 'choice' && index === stage.blockedLane) notes.push(t('lumenLaneBlocked'));
    if (stage?.mechanic === 'choice' && index === stage.riskLane) notes.push(t('lumenLaneRisk'));
    button.setAttribute('aria-label', [laneName(index), ...notes].join('. '));
  });
}

function updateAccessibleSequence(stage = activeStage) {
  if (!accessibleSequence) return;
  if (stage?.mechanic !== 'memory' || !Array.isArray(stage.sequence)) {
    accessibleSequence.textContent = '';
    return;
  }
  const watchKey = stage.memoryRule === 'first' ? 'lumenMemoryWatchFirst' : 'lumenMemoryWatchLast';
  accessibleSequence.textContent = `${t(watchKey, { count: stage.sequence.length })}. ${stage.sequence.map(laneName).join(', ')}.`;
}

function updateStage(stage = activeStage, snapshot = activeSnapshot) {
  if (!stage || !lumen) return;
  gameScreen?.setAttribute('data-lumen-active', 'true');
  if (roundLabel) roundLabel.textContent = t('lumenDistance');
  if (roundValue) roundValue.textContent = String((snapshot?.round ?? stage.index) + 1);
  if (zoneValue) zoneValue.textContent = t(zoneKeys[stage.zone] || 'lumenZonePrism');
  if (distanceValue) distanceValue.textContent = t('lumenGate', { value: stage.index + 1 });
  ruleValues.forEach((element) => { element.textContent = t(ruleKeys[stage.mechanic] || 'lumenRuleDirect'); });
  if (exitButton) exitButton.textContent = t(exitArmed ? 'lumenExitNow' : 'lumenEndRun');
  updateLaneLabels(stage);
  updateAccessibleSequence(stage);
}

function updateResult(result = lastResult) {
  if (!result || !resultDetail) return;
  resultDetail.hidden = false;
  resultDetail.textContent = t('lumenResultDetail', {
    gates: result.gates ?? result.round ?? 0,
    combo: result.bestCombo ?? 0,
    accuracy: result.accuracy ?? 0
  });
  if (resultSummary && result.reason === 'ended') resultSummary.textContent = t('lumenEnded');
}

function resetSharedHud() {
  gameScreen?.removeAttribute('data-lumen-active');
  if (roundLabel) roundLabel.textContent = t('round');
  resultDetail?.setAttribute('hidden', '');
  activeStage = null;
  activeSnapshot = null;
  lastResult = null;
  exitArmed = false;
  updateLaneLabels(null);
  updateAccessibleSequence(null);
}

if (lumen) {
  lumen.addEventListener('lumen:start', (event) => {
    lastResult = null;
    resultDetail?.setAttribute('hidden', '');
    activeSnapshot = event.detail.snapshot;
    exitArmed = false;
    updateAccessibleSequence(null);
    gameScreen?.setAttribute('data-lumen-active', 'true');
    if (roundLabel) roundLabel.textContent = t('lumenDistance');
    if (roundValue) roundValue.textContent = '1';
    if (exitButton) exitButton.textContent = t('lumenEndRun');
  });

  lumen.addEventListener('lumen:stage', (event) => {
    activeStage = event.detail.stage;
    activeSnapshot = event.detail.snapshot;
    updateStage();
  });

  lumen.addEventListener('lumen:snapshot', (event) => {
    activeSnapshot = event.detail.snapshot;
    if (activeStage && roundValue) roundValue.textContent = String(activeSnapshot.round + 1);
  });

  lumen.addEventListener('lumen:exit-armed', () => {
    exitArmed = true;
    updateStage();
  });

  lumen.addEventListener('lumen:exit-disarmed', () => {
    exitArmed = false;
    updateStage();
  });

  lumen.addEventListener('lumen:finish', (event) => {
    lastResult = event.detail.result;
    updateAccessibleSequence(null);
    queueMicrotask(() => updateResult());
  });

  new MutationObserver(() => {
    if (lumen.hidden && document.querySelector('[data-screen="game"]')?.hidden === false) resetSharedHud();
  }).observe(lumen, { attributes: true, attributeFilter: ['hidden'] });
}

new MutationObserver(() => {
  updateCatalogDuration();
  if (activeStage) updateStage();
  if (lastResult) updateResult();
  if (!activeStage) updateLaneLabels(null);
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });

if (durationValue) {
  new MutationObserver(updateCatalogDuration).observe(durationValue, { childList: true, characterData: true, subtree: true });
}
queueMicrotask(updateCatalogDuration);
updateCatalogDuration();
updateLaneLabels(null);
if (exitButton) exitButton.textContent = t('lumenEndRun');
