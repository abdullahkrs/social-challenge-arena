import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, css, accessibilityCss, notices, build] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../ui.css', import.meta.url), 'utf8'),
  readFile(new URL('../ui-accessibility.css', import.meta.url), 'utf8'),
  readFile(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8')
]);

test('Font Awesome is local, selective, licensed, and included in the production build', () => {
  assert.match(css, /Font Awesome Free 6\.7\.2/);
  assert.match(css, /data:font\/woff2;base64,/);
  assert.doesNotMatch(html, /fontawesome\.com|cdnjs|jsdelivr|unpkg/i);
  assert.doesNotMatch(html, /<svg\b/i);
  assert.match(notices, /Fonts: SIL Open Font License 1\.1 \(SIL OFL 1\.1\)/);
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

test('mobile reduced-effects control keeps a visible recognizable indicator', () => {
  assert.match(html, /class="fa-icon fa-universal-access" aria-hidden="true"/);
  assert.match(html, /id="motion-toggle"[^>]*data-i18n-aria="reduceMotion"/);
  assert.match(accessibilityCss, /\.motion-control input\s*\{[^}]*position:\s*static;[^}]*opacity:\s*1;/s);
  assert.match(accessibilityCss, /\.motion-control \.fa-icon\s*\{[^}]*display:\s*inline-flex;/s);
  assert.doesNotMatch(accessibilityCss, /\.motion-control \.fa-icon\s*\{[^}]*display:\s*none;/s);
});

test('dynamic localized icon buttons keep glyphs outside their text content', () => {
  for (const id of ['start-button', 'replay-button', 'share-button', 'new-button', 'catalog-button']) {
    const element = html.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`))?.[0] || '';
    assert.ok(element.includes('action-icon'), `${id} should use the shared icon treatment`);
  }
  assert.match(html, /id="daily-start-button" class="primary daily-start"/);
  assert.match(html, /font-src 'self' data:/);
});
