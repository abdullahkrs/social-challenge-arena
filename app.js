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

if (typeof module !== 'undefined') module.exports = { TapChallenge };

if (typeof document !== 'undefined') {
  const game = new TapChallenge();
  const challenge = document.querySelector('#sample-challenge');
  const openButton = document.querySelector('#open-challenge');
  const startButton = document.querySelector('#start-game');
  const tapButton = document.querySelector('#tap-button');
  const playAgainButton = document.querySelector('#play-again');
  const result = document.querySelector('#result');
  const timeLeft = document.querySelector('#time-left');
  const score = document.querySelector('#score');
  const finalScore = document.querySelector('#final-score');
  let timerId;

  function resetView() {
    clearInterval(timerId);
    timeLeft.textContent = '10.0';
    score.textContent = '0';
    result.hidden = true;
    playAgainButton.hidden = true;
    tapButton.hidden = true;
    tapButton.disabled = true;
    startButton.hidden = false;
  }

  function completeGame() {
    clearInterval(timerId);
    game.finish();
    timeLeft.textContent = '0.0';
    finalScore.textContent = String(game.score);
    tapButton.disabled = true;
    tapButton.hidden = true;
    result.hidden = false;
    playAgainButton.hidden = false;
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
    result.hidden = true;
    playAgainButton.hidden = true;
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
