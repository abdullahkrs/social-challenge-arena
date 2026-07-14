import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, css, build] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../ui.css', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8')
]);

test('Font Awesome is local, selective, and included in the production build', () => {
  assert.match(css, /Font Awesome Free 6\.7\.2/);
  assert.match(css, /data:font\/woff2;base64,/);
  assert.doesNotMatch(html, /fontawesome\.com|cdnjs|jsdelivr|unpkg/i);
  assert.doesNotMatch(html, /<svg\b/i);
  assert.match(build, /'ui\.css'/);
  assert.match(build, /'THIRD_PARTY_NOTICES\.md'/);
});

test('shared platform actions expose consistent Font Awesome treatments', () => {
  for (const className of ['fa-gamepad', 'fa-globe', 'fa-universal-access', 'fa-play', 'fa-arrow-left', 'fa-rotate-right', 'fa-share-nodes', 'fa-shuffle', 'fa-list', 'fa-trophy']) {
    assert.match(html, new RegExp(`\\b${className}\\b`), `${className} should be used by a real platform surface`);
    assert.match(css, new RegExp(`\\.${className.replace('-', '\\-')}::before`), `${className} should map to the local subset`);
  }
  assert.match(html, /class="icon-button back-button"[^>]*data-i18n-aria="back"/);
  assert.match(html, /class="fa-icon fa-arrow-left" aria-hidden="true"/);
  assert.match(css, /\[dir=rtl\] \.back-button \.fa-icon/);
});

test('dynamic localized buttons keep icons outside their text content', () => {
  for (const id of ['daily-start-button', 'start-button', 'replay-button', 'share-button', 'new-button', 'catalog-button']) {
    assert.match(html, new RegExp(`id="${id}" class="[^"]*action-icon[^"]*"`));
  }
  assert.match(html, /font-src 'self' data:/);
});
