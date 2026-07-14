import './mirror-copy.mjs';
import { normalizeLanguage, translate } from './i18n.mjs';

if (typeof document !== 'undefined') {
  const mirror = document.querySelector('#mirror-fuse');
  const gameScreen = document.querySelector('[data-screen="game"]');
  const roundCell = document.querySelector('#round-value')?.closest('div');
  const roundLabel = roundCell?.querySelector('span');
  const roundValue = document.querySelector('#round-value');
  const resultDetail = document.querySelector('#result-detail');
  const resultSummary = document.querySelector('#result-summary');
  const durationValue = document.querySelector('[data-challenge-id="mirror-fuse"] [data-duration]');
  let activeStage = null;
  let activeSnapshot = null;
  let lastResult = null;

  function language() { return normalizeLanguage(document.documentElement.lang); }
  function t(key, values = {}) { return translate(language(), key, values); }
  function updateCatalogDuration() { if (durationValue && durationValue.textContent !== t('endless')) durationValue.textContent = t('endless'); }

  function updateHud() {
    if (!mirror || !activeStage) return;
    gameScreen?.setAttribute('data-mirror-active', 'true');
    if (roundLabel) roundLabel.textContent = t('mirrorPattern');
    if (roundValue) roundValue.textContent = String((activeSnapshot?.round ?? activeStage.index) + 1);
  }

  function updateResult(result = lastResult) {
    if (!result || !resultDetail) return;
    resultDetail.hidden = false;
    resultDetail.textContent = t('mirrorResultDetail', {
      patterns: result.patterns ?? result.round ?? 0,
      combo: result.bestCombo ?? 0,
      accuracy: result.accuracy ?? 0
    });
    if (resultSummary && result.reason === 'ended') resultSummary.textContent = t('mirrorEnded');
  }

  function resetSharedHud() {
    gameScreen?.removeAttribute('data-mirror-active');
    if (roundLabel) roundLabel.textContent = t('round');
    resultDetail?.setAttribute('hidden', '');
    activeStage = null;
    activeSnapshot = null;
    lastResult = null;
  }

  if (mirror) {
    mirror.addEventListener('mirror:start', (event) => {
      activeSnapshot = event.detail.snapshot;
      activeStage = null;
      lastResult = null;
      resultDetail?.setAttribute('hidden', '');
      gameScreen?.setAttribute('data-mirror-active', 'true');
      if (roundLabel) roundLabel.textContent = t('mirrorPattern');
      if (roundValue) roundValue.textContent = '1';
    });
    mirror.addEventListener('mirror:stage', (event) => {
      activeStage = event.detail.stage;
      activeSnapshot = event.detail.snapshot;
      updateHud();
    });
    mirror.addEventListener('mirror:snapshot', (event) => {
      activeSnapshot = event.detail.snapshot;
      if (roundValue) roundValue.textContent = String((activeSnapshot.round ?? 0) + 1);
    });
    mirror.addEventListener('mirror:finish', (event) => {
      lastResult = event.detail.result;
      queueMicrotask(() => updateResult());
    });
    new MutationObserver(() => {
      if (mirror.hidden && gameScreen?.hidden === false) resetSharedHud();
    }).observe(mirror, { attributes: true, attributeFilter: ['hidden'] });
  }

  new MutationObserver(() => {
    updateCatalogDuration();
    updateHud();
    updateResult();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
  if (durationValue) new MutationObserver(updateCatalogDuration).observe(durationValue, { childList: true, characterData: true, subtree: true });
  queueMicrotask(updateCatalogDuration);
}
