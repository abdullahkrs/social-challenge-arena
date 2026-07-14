import { normalizeLanguage, translate } from './i18n.mjs';

function ensureStylesheet() {
  if (document.querySelector('link[href="./src/echo.css"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './src/echo.css';
  document.head.append(link);
}
ensureStylesheet();

const echo = document.querySelector('#echo-grid');
const gameScreen = document.querySelector('[data-screen="game"]');
const roundCell = document.querySelector('#round-value')?.closest('div');
const roundLabel = roundCell?.querySelector('span');
const roundValue = document.querySelector('#round-value');
const resultDetail = document.querySelector('#result-detail');
const resultSummary = document.querySelector('#result-summary');
const durationValue = document.querySelector('[data-challenge-id="echo-grid"] [data-duration]');
let activeStage = null;
let activeSnapshot = null;
let lastResult = null;
let exitArmed = false;
let cueVisible = false;

function language() { return normalizeLanguage(document.documentElement.lang); }
function t(key, values = {}) { return translate(language(), key, values); }
const zoneKeys = { garden: 'echoZoneGarden', bridge: 'echoZoneBridge', vault: 'echoZoneVault', storm: 'echoZoneStorm' };
const ruleKeys = { direct: 'echoRuleDirect', reverse: 'echoRuleReverse', turn: 'echoRuleTurn', echo: 'echoRuleEcho' };
const directionKeys = ['echoDirectionUp', 'echoDirectionRight', 'echoDirectionDown', 'echoDirectionLeft'];

function q(selector) { return echo?.querySelector(selector); }
function updateCatalogDuration() { if (durationValue && durationValue.textContent !== t('endless')) durationValue.textContent = t('endless'); }
function directionName(direction, marked = false) { return `${marked ? `${t('echoOppositeMark')} ` : ''}${t(directionKeys[direction])}`; }

function updateControls() {
  const buttons = echo ? [...echo.querySelectorAll('[data-echo-direction]')] : [];
  buttons.forEach((button) => button.setAttribute('aria-label', t(directionKeys[Number(button.dataset.echoDirection)])));
  const repeat = q('[data-echo-repeat]');
  const ready = q('[data-echo-ready]');
  const exit = q('[data-echo-exit]');
  if (repeat) repeat.textContent = t('echoReplayCue');
  if (ready) ready.textContent = t('echoReadyMove');
  if (exit) exit.textContent = t(exitArmed ? 'echoExitNow' : 'echoEndRun');
  const controls = q('[data-echo-controls]');
  if (controls) controls.setAttribute('aria-label', t('echoMovementControls'));
}

function updateStage() {
  if (!activeStage || !echo) return;
  gameScreen?.setAttribute('data-echo-active', 'true');
  echo.dataset.phase = echo.dataset.phase || 'watch';
  if (roundLabel) roundLabel.textContent = t('echoTrail');
  if (roundValue) roundValue.textContent = String((activeSnapshot?.round ?? activeStage.index) + 1);
  const zone = q('[data-echo-zone]');
  const rule = q('[data-echo-rule]');
  const distance = q('[data-echo-distance]');
  const cueLabel = q('[data-echo-cue-label]');
  if (zone) zone.textContent = t(zoneKeys[activeStage.zone] || 'echoZoneGarden');
  if (rule) rule.textContent = t(ruleKeys[activeStage.mechanic] || 'echoRuleDirect');
  if (distance) distance.textContent = t('echoStep', { value: activeStage.index + 1 });
  if (cueLabel) cueLabel.textContent = t(cueVisible ? 'echoCueReady' : 'echoWatchPath', { count: activeStage.length });
  updateControls();
}

function updateAccessibleCue(mode = cueVisible ? 'ready' : 'watch') {
  const output = q('[data-echo-accessible-cue]');
  if (!output || !activeStage) return;
  if (mode === 'response') {
    output.textContent = `${t(ruleKeys[activeStage.mechanic])}. ${t('echoMoveNow')}.`;
    return;
  }
  const sequence = activeStage.displayMoves.map((direction, index) => directionName(direction, activeStage.echoFlags[index])).join(', ');
  output.textContent = `${t(ruleKeys[activeStage.mechanic])}. ${t('echoAccessibleSequence', { sequence })}. ${t('echoCueReady')}.`;
}

function updateResult(result = lastResult) {
  if (!result || !resultDetail) return;
  resultDetail.hidden = false;
  resultDetail.textContent = t('echoResultDetail', { trails: result.gates ?? result.round ?? 0, combo: result.bestCombo ?? 0, accuracy: result.accuracy ?? 0 });
  if (resultSummary && result.reason === 'ended') resultSummary.textContent = t('echoEnded');
}

function resetSharedHud() {
  gameScreen?.removeAttribute('data-echo-active');
  if (roundLabel) roundLabel.textContent = t('round');
  resultDetail?.setAttribute('hidden', '');
  activeStage = null; activeSnapshot = null; lastResult = null; exitArmed = false; cueVisible = false;
}

if (echo) {
  echo.addEventListener('echo:start', (event) => {
    activeSnapshot = event.detail.snapshot; lastResult = null; cueVisible = false; exitArmed = false;
    resultDetail?.setAttribute('hidden', '');
    gameScreen?.setAttribute('data-echo-active', 'true');
    if (roundLabel) roundLabel.textContent = t('echoTrail');
    if (roundValue) roundValue.textContent = '1';
    updateControls();
  });
  echo.addEventListener('echo:stage', (event) => {
    activeStage = event.detail.stage; activeSnapshot = event.detail.snapshot; cueVisible = false; echo.dataset.phase = 'watch'; updateStage(); updateAccessibleCue('watch');
  });
  echo.addEventListener('echo:cue-ready', () => { cueVisible = true; echo.dataset.phase = 'ready'; updateStage(); updateAccessibleCue('ready'); });
  echo.addEventListener('echo:cue-replay', () => { cueVisible = false; echo.dataset.phase = 'watch'; updateStage(); updateAccessibleCue('watch'); });
  echo.addEventListener('echo:response', () => { cueVisible = false; echo.dataset.phase = 'response'; updateStage(); updateAccessibleCue('response'); });
  echo.addEventListener('echo:snapshot', (event) => { activeSnapshot = event.detail.snapshot; if (roundValue) roundValue.textContent = String(activeSnapshot.round + 1); });
  echo.addEventListener('echo:exit-armed', () => { exitArmed = true; updateControls(); });
  echo.addEventListener('echo:exit-disarmed', () => { exitArmed = false; updateControls(); });
  echo.addEventListener('echo:finish', (event) => { lastResult = event.detail.result; queueMicrotask(() => updateResult()); });
  new MutationObserver(() => { if (echo.hidden && gameScreen?.hidden === false) resetSharedHud(); }).observe(echo, { attributes: true, attributeFilter: ['hidden'] });
}

new MutationObserver(() => { updateCatalogDuration(); updateStage(); updateResult(); updateControls(); if (activeStage) updateAccessibleCue(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
if (durationValue) new MutationObserver(updateCatalogDuration).observe(durationValue, { childList: true, characterData: true, subtree: true });
queueMicrotask(updateCatalogDuration);
