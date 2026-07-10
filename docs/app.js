const SUPPORTED_CHALLENGE_ID = 'tap-10s';
const MAX_SHARED_SCORE = 999;

class TapChallenge {
  constructor(durationMs = 10000) {
    this.durationMs = durationMs;
    this.score = 0;
    this.endsAt = 0;
    this.active = false;
  }

  start(now = Date.now()) {
    this.score = 0;
    this.endsAt = now + this.durationMs;
    this.active = true;
  }

  tap(now = Date.now()) {
    if (!this.active || now >= this.endsAt) {
      this.finish();
      return false;
    }
    this.score += 1;
    return true;
  }

  remainingMs(now = Date.now()) {
    return this.active ? Math.max(0, this.endsAt - now) : 0;
  }

  finish() {
    this.active = false;
    return this.score;
  }
}

function getResultTitle(score) {
  if (score >= 80) return 'Lightning Hands';
  if (score >= 55) return 'Tap Machine';
  if (score >= 30) return 'Rapid Tapper';
  return 'Fast Starter';
}

function normalizeShareScore(score) {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return 0;
  return Math.max(0, Math.min(MAX_SHARED_SCORE, Math.trunc(numericScore)));
}

function buildResultMessage(score) {
  return `I scored ${normalizeShareScore(score)} taps in 10 seconds. Can you beat me?`;
}

function buildShareUrl(score, baseHref = 'https://abdullahkrs.github.io/social-challenge-arena/') {
  const url = new URL(baseHref);
  url.search = '';
  url.hash = '';
  url.searchParams.set('challenge', SUPPORTED_CHALLENGE_ID);
  url.searchParams.set('score', String(normalizeShareScore(score)));
  return url.toString();
}

function buildShareData(score, baseHref) {
  const safeScore = normalizeShareScore(score);
  return {
    title: '10-Second Tap Sprint',
    text: buildResultMessage(safeScore),
    url: buildShareUrl(safeScore, baseHref),
  };
}

async function shareOrCopyResult(score, services = {}) {
  const shareData = buildShareData(score, services.href || 'https://abdullahkrs.github.io/social-challenge-arena/');
  const nav = services.navigator;
  const clipboard = services.clipboard || nav?.clipboard;

  if (nav?.share) {
    await nav.share(shareData);
    return { ok: true, method: 'native', url: shareData.url };
  }

  if (!clipboard?.writeText) {
    return { ok: false, method: 'unavailable', url: shareData.url };
  }

  await clipboard.writeText(`${shareData.text}\n${shareData.url}`);
  return { ok: true, method: 'copy', url: shareData.url };
}

if (typeof module !== 'undefined') {
  module.exports = {
    TapChallenge,
    getResultTitle,
    normalizeShareScore,
    buildResultMessage,
    buildShareUrl,
    buildShareData,
    shareOrCopyResult,
  };
}

if (typeof document !== 'undefined') {
  const game = new TapChallenge();
  const challenge = document.querySelector('#sample-challenge');
  const openButton = document.querySelector('#open-challenge');
  const startButton = document.querySelector('#start-game');
  const tapButton = document.querySelector('#tap-button');
  const shareButton = document.querySelector('#share-result');
  const playAgainButton = document.querySelector('#play-again');
  const gameplay = document.querySelector('#gameplay');
  const resultScreen = document.querySelector('#result-screen');
  const timeLeft = document.querySelector('#time-left');
  const score = document.querySelector('#score');
  const finalScore = document.querySelector('#final-score');
  const resultTitle = document.querySelector('#result-heading');
  const resultMessage = document.querySelector('#result-message');
  const shareStatus = document.querySelector('#share-status');
  let timerId;
  let lastScore = 0;

  function setShareStatus(message, state = '') {
    shareStatus.textContent = message;
    shareStatus.className = `share-status${state ? ` ${state}` : ''}`;
  }

  function resetView() {
    clearInterval(timerId);
    lastScore = 0;
    timeLeft.textContent = '10.0';
    score.textContent = '0';
    setShareStatus('');
    gameplay.hidden = false;
    resultScreen.hidden = true;
    tapButton.hidden = true;
    tapButton.disabled = true;
    startButton.hidden = false;
    startButton.focus();
  }

  function completeGame() {
    clearInterval(timerId);
    game.finish();
    lastScore = normalizeShareScore(game.score);
    timeLeft.textContent = '0.0';
    finalScore.textContent = String(lastScore);
    resultTitle.textContent = getResultTitle(lastScore);
    resultMessage.textContent = buildResultMessage(lastScore);
    setShareStatus('');
    tapButton.disabled = true;
    tapButton.hidden = true;
    gameplay.hidden = true;
    resultScreen.hidden = false;
    resultScreen.focus();
    resultScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function refreshTimer() {
    const remaining = game.remainingMs();
    timeLeft.textContent = (remaining / 1000).toFixed(1);
    if (remaining === 0) completeGame();
  }

  openButton.addEventListener('click', () => {
    challenge.hidden = false;
    challenge.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  startButton.addEventListener('click', () => {
    game.start();
    lastScore = 0;
    score.textContent = '0';
    setShareStatus('');
    resultScreen.hidden = true;
    gameplay.hidden = false;
    startButton.hidden = true;
    tapButton.hidden = false;
    tapButton.disabled = false;
    tapButton.focus();
    refreshTimer();
    timerId = setInterval(refreshTimer, 100);
  });

  tapButton.addEventListener('click', () => {
    if (game.tap()) score.textContent = String(game.score);
    else completeGame();
  });

  shareButton.addEventListener('click', async () => {
    shareButton.disabled = true;
    setShareStatus('Preparing link...');
    try {
      const result = await shareOrCopyResult(lastScore, {
        href: window.location.href,
        navigator: window.navigator,
      });
      if (!result.ok) {
        setShareStatus('Copy is unavailable on this browser.', 'error');
      } else if (result.method === 'native') {
        setShareStatus('Share sheet opened.', 'success');
      } else {
        setShareStatus('Challenge link copied.', 'success');
      }
    } catch (error) {
      if (error?.name === 'AbortError') setShareStatus('Share canceled.');
      else setShareStatus('Could not share or copy the link.', 'error');
    } finally {
      shareButton.disabled = false;
    }
  });

  playAgainButton.addEventListener('click', resetView);
}
