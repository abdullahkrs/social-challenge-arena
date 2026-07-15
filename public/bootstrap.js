(() => {
  const byId = (id) => document.getElementById(id);
  const screens = () => [...document.querySelectorAll('[data-screen]')];
  const show = (name) => {
    screens().forEach((el) => { el.hidden = el.dataset.screen !== name; });
    document.querySelector(`[data-screen="${name}"] button, [data-screen="${name}"] h1`)?.focus?.({ preventScroll: true });
  };

  const open = byId('open-button');
  const back = byId('back-button');
  const start = byId('start-button');
  const status = byId('game-status');

  open?.addEventListener('click', () => show('instructions'));
  back?.addEventListener('click', () => show('discovery'));

  start?.addEventListener('click', () => {
    window.setTimeout(() => {
      const gameScreen = document.querySelector('[data-screen="game"]');
      const canvas = document.querySelector('#phaser-game canvas');
      if (!gameScreen?.hidden || canvas) return;
      if (status) status.textContent = 'Game runtime failed to start. Refresh the page and try again.';
      start.disabled = false;
      start.removeAttribute('aria-busy');
    }, 2500);
  });

  window.addEventListener('error', (event) => {
    console.error('Pulsebound bootstrap caught an error:', event.error || event.message);
  });
})();
