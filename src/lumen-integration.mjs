import { normalizeLanguage, translate } from './i18n.mjs';

const lumen = document.querySelector('#lumen-lanes');
const gameScreen = document.querySelector('[data-screen="game"]');
const zoneValue = lumen?.querySelector('[data-lumen-zone]');
const distanceValue = lumen?.querySelector('[data-lumen-distance]');
const ruleValues = lumen ? [...lumen.querySelectorAll('[data-lumen-rule]')] : [];
const exitButton = lumen?.querySelector('[data-lumen-exit]');
const laneButtons = lumen ? [...lumen.querySelectorAll('[data-lane]')] : [];
const accessibleSequence = lumen?.querySelector('[data-lumen-accessible-sequence]');
const resultDetail = document.querySelector('#result-detail');
const resultSummary = document.querySelector('#result-summary');

let activeStage = null;
let activeSnapshot = null;
let lastResult = null;
let exitArmed = false;
let memoryAnnouncement = 'none';

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


function laneName(index) {
  return t(['laneLeft', 'laneCenter', 'laneRight'][index]);
}

function memoryKeys(stage = activeStage) {
  return {
    watchKey: stage?.memoryRule === 'first' ? 'lumenMemoryWatchFirst' : 'lumenMemoryWatchLast',
    chooseKey: stage?.memoryRule === 'first' ? 'lumenMemoryChooseFirst' : 'lumenMemoryChooseLast'
  };
}

function updateLaneLabels(stage = activeStage) {
  laneButtons.forEach((button, index) => {
    const notes = [];
    if (stage?.mechanic === 'choice' && index === stage.blockedLane) notes.push(t('lumenLaneBlocked'));
    if (stage?.mechanic === 'choice' && index === stage.riskLane) notes.push(t('lumenLaneRisk'));
    button.setAttribute('aria-label', [laneName(index), ...notes].join('. '));
  });
}

function updateMemoryActions(stage = activeStage) {
  const repeatButton = lumen?.querySelector('[data-lumen-memory-repeat]');
  const readyButton = lumen?.querySelector('[data-lumen-memory-ready]');
  if (stage?.mechanic !== 'memory' || !Array.isArray(stage.sequence)) return;
  const { watchKey, chooseKey } = memoryKeys(stage);
  if (repeatButton) {
    repeatButton.textContent = t('replay');
    repeatButton.setAttribute('aria-label', `${t('replay')}: ${t(watchKey, { count: stage.sequence.length })}`);
  }
  if (readyButton) {
    readyButton.textContent = t('ready');
    readyButton.setAttribute('aria-label', `${t('ready')}: ${t(chooseKey)}`);
  }
}

function updateAccessibleSequence(stage = activeStage) {
  if (!accessibleSequence) return;
  if (stage?.mechanic !== 'memory' || !Array.isArray(stage.sequence) || memoryAnnouncement === 'none') {
    accessibleSequence.textContent = '';
    return;
  }
  const { watchKey, chooseKey } = memoryKeys(stage);
  if (memoryAnnouncement === 'choose') {
    accessibleSequence.textContent = `${t(chooseKey)}.`;
    return;
  }
  accessibleSequence.textContent = `${t(watchKey, { count: stage.sequence.length })}. ${stage.sequence.map(laneName).join(', ')}. ${t(chooseKey)}. ${t('ready')}.`;
}

function updateStage(stage = activeStage, snapshot = activeSnapshot) {
  if (!stage || !lumen) return;
  gameScreen?.setAttribute('data-lumen-active', 'true');
  if (zoneValue) zoneValue.textContent = t(zoneKeys[stage.zone] || 'lumenZonePrism');
  if (distanceValue) distanceValue.textContent = t('lumenGate', { value: stage.index + 1 });
  ruleValues.forEach((element) => { element.textContent = t(ruleKeys[stage.mechanic] || 'lumenRuleDirect'); });
  if (exitButton) exitButton.textContent = t(exitArmed ? 'lumenExitNow' : 'lumenEndRun');
  updateLaneLabels(stage);
  updateMemoryActions(stage);
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
  resultDetail?.setAttribute('hidden', '');
  activeStage = null;
  activeSnapshot = null;
  lastResult = null;
  exitArmed = false;
  memoryAnnouncement = 'none';
  updateLaneLabels(null);
  updateAccessibleSequence(null);
}

if (lumen) {
  lumen.addEventListener('lumen:start', (event) => {
    lastResult = null;
    resultDetail?.setAttribute('hidden', '');
    activeSnapshot = event.detail.snapshot;
    exitArmed = false;
    memoryAnnouncement = 'none';
    updateAccessibleSequence(null);
    gameScreen?.setAttribute('data-lumen-active', 'true');
    if (exitButton) exitButton.textContent = t('lumenEndRun');
  });

  lumen.addEventListener('lumen:memory-clear', () => {
    memoryAnnouncement = 'none';
    updateAccessibleSequence(null);
  });

  lumen.addEventListener('lumen:stage', (event) => {
    activeStage = event.detail.stage;
    activeSnapshot = event.detail.snapshot;
    memoryAnnouncement = 'none';
    updateStage();
    updateAccessibleSequence();
  });

  lumen.addEventListener('lumen:memory-ready', (event) => {
    activeStage = event.detail.stage;
    memoryAnnouncement = 'sequence';
    updateMemoryActions();
    updateAccessibleSequence();
  });

  lumen.addEventListener('lumen:memory-response', (event) => {
    activeStage = event.detail.stage;
    memoryAnnouncement = 'choose';
    updateAccessibleSequence();
  });

  lumen.addEventListener('lumen:snapshot', (event) => {
    activeSnapshot = event.detail.snapshot;
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
    memoryAnnouncement = 'none';
    updateAccessibleSequence(null);
    queueMicrotask(() => updateResult());
  });

  new MutationObserver(() => {
    if (lumen.hidden && document.querySelector('[data-screen="game"]')?.hidden === false) resetSharedHud();
  }).observe(lumen, { attributes: true, attributeFilter: ['hidden'] });
}

new MutationObserver(() => {
  if (activeStage) updateStage();
  if (lastResult) updateResult();
  if (!activeStage) updateLaneLabels(null);
  updateAccessibleSequence();
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });

updateLaneLabels(null);
if (exitButton) exitButton.textContent = t('lumenEndRun');
