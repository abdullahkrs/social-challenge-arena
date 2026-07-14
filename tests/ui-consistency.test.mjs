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

const retainedIcons = [
  'fa-gamepad', 'fa-globe', 'fa-universal-access', 'fa-arrow-left', 'fa-trophy', 'fa-user-group'
];

test('Font Awesome is local, selective, licensed, and included in the production build', () => {
  assert.match(css, /Font Awesome Free 6\.7\.2/);
  assert.match(css, /data:font\/woff2;base64,/);
  assert.doesNotMatch(html, /fontawesome\.com|cdnjs|jsdelivr|unpkg/i);
  assert.doesNotMatch(html, /<svg\b/i);
  assert.doesNotMatch(css, /\.action-icon::before/);
  assert.match(notices, /Fonts: SIL Open Font License 1\.1 \(SIL OFL 1\.1\)/);
  assert.ok(build.includes("'ui.css'"));
  assert.ok(build.includes("'THIRD_PARTY_NOTICES.md'"));
  assert.deepEqual(
    [...css.matchAll(/\.(fa-[\w-]+)::before/g)].map((match) => match[1]),
    retainedIcons
  );
});

test('retained platform icons use explicit accessible Font Awesome treatments', () => {
  for (const className of retainedIcons) {
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

test('localized text actions do not expose Font Awesome pseudo-element glyphs', () => {
  const ids = [
    'daily-start-button', 'start-button', 'invite-catalog-button',
    'share-button', 'replay-button', 'new-button', 'catalog-button'
  ];
  for (const id of ids) {
    const openingTag = html.match(new RegExp(`<button[^>]*id="${id}"[^>]*>`))?.[0] || '';
    assert.ok(openingTag, `${id} should remain a real button`);
    assert.doesNotMatch(openingTag, /\baction-icon\b/, `${id} must not use pseudo-element action icons`);
    assert.doesNotMatch(openingTag, /\bfa-[\w-]+\b/, `${id} must not expose a Font Awesome glyph in its accessible name`);
  }
  assert.match(html, /font-src 'self' data:/);
});
