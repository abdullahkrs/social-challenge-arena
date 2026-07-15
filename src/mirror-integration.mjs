import './mirror-copy.mjs';
import { messages, normalizeLanguage, translate } from './i18n.mjs';

Object.assign(messages.en, { mirrorDirectionUp: 'Up', mirrorDirectionRight: 'Right', mirrorDirectionDown: 'Down', mirrorDirectionLeft: 'Left' });
Object.assign(messages.ar, { mirrorDirectionUp: 'أعلى', mirrorDirectionRight: 'يمين', mirrorDirectionDown: 'أسفل', mirrorDirectionLeft: 'يسار' });
Object.assign(messages.tr, { mirrorDirectionUp: 'Yukarı', mirrorDirectionRight: 'Sağ', mirrorDirectionDown: 'Aşağı', mirrorDirectionLeft: 'Sol' });

if (typeof document !== 'undefined') {
  const mirror = document.querySelector('#mirror-fuse');
  const gameScreen = document.querySelector('[data-screen="game"]');
  const gameStatus = document.querySelector('#game-status');
  const liveRegion = document.querySelector('#live-region');
  const resultDetail = document.querySelector('#result-detail');
  const resultSummary = document.querySelector('#result-summary');
  const ruleKeys = { horizontal: 'mirrorRuleHorizontal', vertical: 'mirrorRuleVertical', rotate180: 'mirrorRuleRotate180', rotateRight: 'mirrorRuleRotateRight' };
  const mechanicKeys = { rebuild: 'mirrorMechanicRebuild', anchor: 'mirrorMechanicAnchor', repair: 'mirrorMechanicRepair', sequence: 'mirrorMechanicSequence' };
  let activeStage = null;
  let lastResult = null;

  function language() { return normalizeLanguage(document.documentElement.lang); }
  function t(key, values = {}) { return translate(language(), key, values); }

  function stageStatus() {
    if (!activeStage) return '';
    return t('mirrorStageReady', {
      value: activeStage.index + 1,
      rule: t(ruleKeys[activeStage.rule] || 'mirrorRuleHorizontal'),
      mechanic: t(mechanicKeys[activeStage.mechanic] || 'mirrorMechanicRebuild')
    });
  }

  function updateActiveStatus(announce = false) {
    if (!activeStage || gameScreen?.hidden !== false) return;
    const message = stageStatus();
    if (gameStatus) gameStatus.textContent = message;
    if (announce && liveRegion) {
      liveRegion.textContent = '';
      queueMicrotask(() => { liveRegion.textContent = message; });
    }
  }

  function updateResult(result = lastResult) {
    if (!result || !resultDetail) return;
    const attempts = Math.max(0, Number(result.totalActions) || 0);
    const accuracy = attempts > 0 ? (result.accuracy ?? 0) : 0;
    resultDetail.hidden = false;
    resultDetail.textContent = t('mirrorResultDetail', {
      patterns: result.patterns ?? result.round ?? 0,
      combo: result.bestCombo ?? 0,
      accuracy
    });
    if (resultSummary && result.reason === 'ended') resultSummary.textContent = t('mirrorEnded');
  }

  function resetSharedState() {
    gameScreen?.removeAttribute('data-mirror-active');
    resultDetail?.setAttribute('hidden', '');
    activeStage = null;
    lastResult = null;
  }

  if (mirror) {
    mirror.addEventListener('mirror:start', () => {
      activeStage = null;
      lastResult = null;
      resultDetail?.setAttribute('hidden', '');
      gameScreen?.setAttribute('data-mirror-active', 'true');
    });
    mirror.addEventListener('mirror:stage', (event) => {
      activeStage = event.detail.stage;
      gameScreen?.setAttribute('data-mirror-active', 'true');

      // The shared live region owns stage announcements. Keeping the hidden
      // spatial description non-live prevents overlapping duplicate speech.
      const sourceDescription = mirror.querySelector('[data-mirror-source-description]');
      sourceDescription?.removeAttribute('aria-live');
      sourceDescription?.removeAttribute('aria-atomic');

      // Return keyboard focus to the generated board after every transition,
      // including stages completed from the separate Check pattern control.
      queueMicrotask(() => {
        mirror.querySelector('[data-mirror-target-cell][data-current="true"]')?.focus({ preventScroll: true });
      });
    });
    mirror.addEventListener('mirror:finish', (event) => {
      lastResult = event.detail.result;
      queueMicrotask(() => updateResult());
    });
    new MutationObserver(() => {
      if (mirror.hidden && gameScreen?.hidden === false) resetSharedState();
    }).observe(mirror, { attributes: true, attributeFilter: ['hidden'] });
  }

  new MutationObserver(() => {
    updateActiveStatus(true);
    updateResult();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
}
