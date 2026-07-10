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

function buildResultMessage(score) {
  return `I scored ${score} taps in 10 seconds. Can you beat me?`;
}

if (typeof module !== 'undefined') {
  module.exports = { TapChallenge, getResultTitle, buildResultMessage };
}

if (typeof document !== 'undefined') {
  const game = new TapChallenge();
  const challenge = document.querySelector('#sample-challenge');
  const openButton = document.querySelector('#open-challenge');
  const startButton = document.querySelector('#start-game');
  const tapButton = document.querySelector('#tap-button');
  const playAgainButton = document.querySelector('#play-again');
  const gameplay = document.querySelector('#gameplay');
  const resultScreen = document.querySelector('#result-screen');
  const timeLeft = document.querySelector('#time-left');
  const score = document.querySelector('#score');
  const finalScore = document.querySelector('#final-score');
  const resultTitle = document.querySelector('#result-heading');
  const resultMessage = document.querySelector('#result-message');
  let timerId;

  function resetView() {
    clearInterval(timerId);
    timeLeft.textContent = '10.0';
    score.textContent = '0';
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
    timeLeft.textContent = '0.0';
    finalScore.textContent = String(game.score);
    resultTitle.textContent = getResultTitle(game.score);
    resultMessage.textContent = buildResultMessage(game.score);
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
    score.textContent = '0';
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

  playAgainButton.addEventListener('click', resetView);
}
