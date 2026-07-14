import './echo-copy.mjs';
import { platformAudio } from './audio.mjs';
import { normalizeLanguage, translate } from './i18n.mjs';

function readMuted() { try { return window.localStorage.getItem('sca-sound-muted') === 'true'; } catch { return false; } }
function writeMuted(value) { try { window.localStorage.setItem('sca-sound-muted', String(value)); } catch { /* session-only */ } }
function language() { return normalizeLanguage(document.documentElement.lang); }
function t(key) { return translate(language(), key); }

const controls = document.querySelector('.topbar .controls');
let toggle = document.querySelector('#sound-toggle');
if (!toggle && controls) {
  const label = document.createElement('label');
  label.className = 'motion-control sound-control';
  label.innerHTML = '<span class="fa-icon fa-gamepad" aria-hidden="true"></span><input id="sound-toggle" type="checkbox"><span data-sound-label></span>';
  controls.append(label);
  toggle = label.querySelector('#sound-toggle');
}

function render() {
  if (!toggle) return;
  const muted = toggle.checked;
  toggle.setAttribute('aria-label', t(muted ? 'soundOff' : 'soundOn'));
  const label = toggle.closest('label')?.querySelector('[data-sound-label]');
  if (label) label.textContent = t('soundEffects');
}

if (toggle) {
  toggle.checked = readMuted();
  platformAudio.setMuted(toggle.checked);
  render();
  toggle.addEventListener('change', () => {
    platformAudio.setMuted(toggle.checked);
    writeMuted(toggle.checked);
    render();
    if (!toggle.checked) {
      void platformAudio.unlock();
      platformAudio.play('correct');
    }
  });
}

new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
window.addEventListener('pagehide', () => platformAudio.suspend());
