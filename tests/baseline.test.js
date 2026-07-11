const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');

test('application remains mobile-first and accessible', () => {
  assert.match(html, /name="viewport"/i);
  assert.match(html, /<main[^>]*class="shell"/i);
  assert.match(html, /id="discovery-view"[^>]+aria-labelledby="page-title"/i);
  assert.match(html, /id="page-title"/i);
  assert.match(css, /min-width:\s*320px/i);
});

test('application loads its local assets', () => {
  assert.match(html, /href="styles\.css"/i);
  assert.match(html, /src="app\.js"/i);
});
