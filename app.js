const featuredChallenge = Object.freeze({
  id: 'tap-sprint',
  title: 'Tap Sprint',
  category: 'Speed',
  difficulty: 'Easy',
  durationSeconds: 20,
  description: 'Tap as many times as you can before time runs out.',
  goal: 'Get the highest tap count in 20 seconds.'
});

function toggleChallengeDetails(button, details) {
  const willOpen = details.hidden;
  details.hidden = !willOpen;
  button.setAttribute('aria-expanded', String(willOpen));
  button.textContent = willOpen ? 'Hide details' : 'View challenge';
  return willOpen;
}

if (typeof module !== 'undefined') {
  module.exports = { featuredChallenge, toggleChallengeDetails };
}

if (typeof document !== 'undefined') {
  const button = document.querySelector('#discover-challenge');
  const details = document.querySelector('#challenge-details');

  if (button && details) {
    button.addEventListener('click', () => toggleChallengeDetails(button, details));
  }
}
