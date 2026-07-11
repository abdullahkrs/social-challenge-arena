function getAppStatus() {
  return 'Preparing the first challenge experience.';
}

if (typeof module !== 'undefined') {
  module.exports = { getAppStatus };
}

if (typeof document !== 'undefined') {
  const status = document.querySelector('#app-status');
  if (status) status.textContent = getAppStatus();
}
