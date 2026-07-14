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
  assert.ok(build.includes("'ui.css'"));
  assert.ok(build.includes("'THIRD_PARTY_NOTICES.md'"));
});

test('shared platform actions expose consistent Font Awesome treatments', () => {
  const icons = [
    'fa-gamepad', 'fa-globe', 'fa-universal-access', 'fa-play', 'fa-arrow-left',
    'fa-rotate-right', 'fa-share-nodes', 'fa-shuffle', 'fa-list', 'fa-trophy'
  ];
  for (const className of icons) {
    assert.ok(html.includes(className), `${className} should be used by a real platform surface`);
    assert.ok(css.includes(`.${className}::before`), `${className} should map to the local subset`);
  }
  assert.match(html, /class="icon-button back-button"[^>]*data-i18n-aria="back"/);
  assert.match(html, /class="fa-icon fa-arrow-left" aria-hidden="true"/);
  assert.ok(css.includes('[dir=rtl] .back-button .fa-icon'));
});

test('dynamic localized icon buttons keep glyphs outside their text content', () => {
  for (const id of ['start-button', 'replay-button', 'share-button', 'new-button', 'catalog-button']) {
    const element = html.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`))?.[0] || '';
    assert.ok(element.includes('action-icon'), `${id} should use the shared icon treatment`);
  }
  assert.match(html, /id="daily-start-button" class="primary daily-start"/);
  assert.match(html, /font-src 'self' data:/);
});
