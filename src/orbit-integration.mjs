import './orbit-copy.mjs';
import { normalizeLanguage, translate } from './i18n.mjs';

function ensureOrbitShell() {
  const canvas = document.querySelector('#game-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return null;
  const existing = canvas.closest('#orbit-lock');
  if (existing) return existing;
  const shell = document.createElement('div');
  shell.id = 'orbit-lock';
  shell.className = 'orbit-lock';
  shell.setAttribute('role', 'group');
  shell.setAttribute('dir', 'ltr');
  shell.setAttribute('aria-label', 'Endless Orbit Lock precision journey');
  canvas.before(shell);
  shell.innerHTML = `
    <div class="orbit-run-head" aria-hidden="true"><span><b data-orbit-zone>Halo approach</b><i>•</i><em data-orbit-rule>Lock the marked orbit</em></span><strong data-orbit-progress>Gate 1</strong></div>
    <div class="orbit-stage"><div class="orbit-legend" aria-hidden="true"><span>◎</span><span>◉</span></div></div>
    <p class="sr-only" data-orbit-accessible-stage aria-live="polite" aria-atomic="true"></p>
    <div class="orbit-controls" role="group"><button class="orbit-ring-button" type="button" data-orbit-ring="0" aria-pressed="true"><span class="orbit-ring-symbol" aria-hidden="true">◎</span><span data-orbit-ring-label>Inner orbit</span></button><button class="primary orbit-lock-button" type="button" data-orbit-lock><span class="orbit-lock-mark" aria-hidden="true">◆</span><span data-orbit-lock-label>Lock</span></button><button class="orbit-ring-button" type="button" data-orbit-ring="1" aria-pressed="false"><span class="orbit-ring-symbol" aria-hidden="true">◉</span><span data-orbit-ring-label>Outer orbit</span></button></div>
    <div class="orbit-secondary-actions"><button class="secondary" type="button" data-orbit-scan>Check alignment</button><button class="ghost" type="button" data-orbit-exit>End journey</button></div>`;
  shell.querySelector('.orbit-stage').prepend(canvas);
  return shell;
}

if (!document.querySelector('link[data-orbit-style]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./orbit.css', import.meta.url).href;
  link.dataset.orbitStyle = '';
  document.head.append(link);
}

const orbit = ensureOrbitShell();
const gameScreen = document.querySelector('[data-screen="game"]');
const zoneValue = orbit?.querySelector('[data-orbit-zone]');
const ruleValue = orbit?.querySelector('[data-orbit-rule]');
const progressValue = orbit?.querySelector('[data-orbit-progress]');
const accessibleStage = orbit?.querySelector('[data-orbit-accessible-stage]');
const ringButtons = orbit ? [...orbit.querySelectorAll('[data-orbit-ring]')] : [];
const lockButton = orbit?.querySelector('[data-orbit-lock]');
const scanButton = orbit?.querySelector('[data-orbit-scan]');
const exitButton = orbit?.querySelector('[data-orbit-exit]');
const canvas = orbit?.querySelector('#game-canvas');
const resultDetail = document.querySelector('#result-detail');
const resultSummary = document.querySelector('#result-summary');

let activeStage = null;
let activeSnapshot = null;
let selectedRing = 0;
let lockIndex = 0;
let lastResult = null;
let exitArmed = false;

function language() { return normalizeLanguage(document.documentElement.lang); }
function t(key, values = {}) { return translate(language(), key, values); }

const zoneKeys = { halo: 'orbitZoneHalo', crossing: 'orbitZoneCrossing', cipher: 'orbitZoneCipher', surge: 'orbitZoneSurge' };
function ringName(ring) { return t(ring ? 'orbitOuter' : 'orbitInner'); }
function ruleText(stage = activeStage, relayIndex = lockIndex) {
  if (!stage) return '';
  if (stage.mechanic === 'align') return t('orbitRuleAlign');
  if (stage.mechanic === 'switch') return t('orbitRuleSwitch');
  if (stage.mechanic === 'polarity') return t(stage.rule === 'opposite' ? 'orbitRuleOpposite' : 'orbitRuleMatch', { symbol: stage.cueSymbol });
  if (stage.mechanic === 'risk') return t('orbitRuleRisk');
  return t('orbitRuleRelay', { step: relayIndex + 1, total: stage.relaySequence.length, orbit: ringName(stage.relaySequence[relayIndex]) });
}

function windowName(stage = activeStage, relayIndex = lockIndex) {
  if (!stage) return t('orbitWindowMedium');
  const gate = stage.mechanic === 'relay' ? stage.relayGates[relayIndex] : stage.gates[selectedRing];
  if (gate.width >= .76) return t('orbitWindowWide');
  if (gate.width >= .52) return t('orbitWindowMedium');
  return t('orbitWindowTight');
}


function updateControls() {
  ringButtons.forEach((button, index) => {
    const name = ringName(index);
    button.querySelector('[data-orbit-ring-label]')?.replaceChildren(name);
    button.setAttribute('aria-label', name);
    button.setAttribute('aria-keyshortcuts', index ? 'ArrowUp 2' : 'ArrowDown 1');
  });
  if (lockButton) {
    lockButton.querySelector('[data-orbit-lock-label]')?.replaceChildren(t('orbitLock'));
    lockButton.setAttribute('aria-label', t('orbitLock'));
    lockButton.setAttribute('aria-keyshortcuts', 'Space Enter');
  }
  if (scanButton) {
    scanButton.textContent = t('orbitCheck');
    scanButton.setAttribute('aria-label', t('orbitCheck'));
    scanButton.setAttribute('aria-keyshortcuts', 'S');
  }
  if (exitButton) exitButton.textContent = t(exitArmed ? 'orbitExitNow' : 'orbitEndRun');
}

function updateStage() {
  if (!activeStage || !orbit) return;
  gameScreen?.setAttribute('data-orbit-active', 'true');
  if (zoneValue) zoneValue.textContent = t(zoneKeys[activeStage.zone] || 'orbitZoneHalo');
  if (ruleValue) ruleValue.textContent = ruleText();
  if (progressValue) progressValue.textContent = t('orbitGate', { value: activeStage.index + 1 });
  if (canvas) canvas.setAttribute('aria-label', t('orbitArenaLabel'));
  if (accessibleStage) {
    accessibleStage.textContent = t('orbitAccessibleStage', {
      rule: ruleText(),
      orbit: ringName(selectedRing),
      direction: t(activeStage.direction > 0 ? 'orbitClockwise' : 'orbitCounterClockwise'),
      window: windowName()
    });
  }
  updateControls();
}

function updateResult(result = lastResult) {
  if (!result || !resultDetail) return;
  resultDetail.hidden = false;
  resultDetail.textContent = t('orbitResultDetail', {
    gates: result.round ?? 0,
    combo: result.bestCombo ?? 0,
    precision: result.precision ?? 0,
    accuracy: result.accuracy ?? 0
  });
  if (resultSummary && result.reason === 'ended') resultSummary.textContent = t('orbitEnded');
}

function resetSharedHud() {
  gameScreen?.removeAttribute('data-orbit-active');
  resultDetail?.setAttribute('hidden', '');
  activeStage = null;
  activeSnapshot = null;
  lastResult = null;
  selectedRing = 0;
  lockIndex = 0;
  exitArmed = false;
  if (accessibleStage) accessibleStage.textContent = '';
  updateControls();
}

if (orbit) {
  orbit.addEventListener('orbit:start', (event) => {
    activeSnapshot = event.detail.snapshot;
    activeStage = null;
    lastResult = null;
    exitArmed = false;
    resultDetail?.setAttribute('hidden', '');
    gameScreen?.setAttribute('data-orbit-active', 'true');
    updateControls();
  });
  orbit.addEventListener('orbit:stage', (event) => {
    activeStage = event.detail.stage;
    activeSnapshot = event.detail.snapshot;
    selectedRing = event.detail.selectedRing;
    lockIndex = event.detail.lockIndex || 0;
    orbit.dataset.phase = activeStage.tension;
    updateStage();
  });
  orbit.addEventListener('orbit:selection', (event) => {
    selectedRing = event.detail.selectedRing;
    lockIndex = event.detail.lockIndex || 0;
    updateStage();
  });
  orbit.addEventListener('orbit:relay', (event) => {
    activeStage = event.detail.stage;
    activeSnapshot = event.detail.snapshot;
    selectedRing = event.detail.selectedRing;
    lockIndex = event.detail.lockIndex;
    updateStage();
  });
  orbit.addEventListener('orbit:snapshot', (event) => {
    activeSnapshot = event.detail.snapshot;
  });
  orbit.addEventListener('orbit:exit-armed', () => { exitArmed = true; updateControls(); });
  orbit.addEventListener('orbit:exit-disarmed', () => { exitArmed = false; updateControls(); });
  orbit.addEventListener('orbit:finish', (event) => {
    lastResult = event.detail.result;
    queueMicrotask(() => updateResult());
  });
  const canvasVisibility = orbit.querySelector('#game-canvas');
  if (canvasVisibility) {
    const syncVisibility = () => { orbit.hidden = canvasVisibility.hidden; };
    new MutationObserver(syncVisibility).observe(canvasVisibility, { attributes: true, attributeFilter: ['hidden'] });
    syncVisibility();
  }
  new MutationObserver(() => {
    if (orbit.hidden && gameScreen?.hidden === false) resetSharedHud();
  }).observe(orbit, { attributes: true, attributeFilter: ['hidden'] });
}

new MutationObserver(() => {
  updateControls();
  if (activeStage) updateStage();
  if (lastResult) updateResult();
}).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });

updateControls();
