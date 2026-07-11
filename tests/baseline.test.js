const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getAppStatus } = require('../app.js');

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('styles.css', 'utf8');

test('baseline exposes a deterministic application status', () => {
  assert.equal(getAppStatus(), 'Preparing the first challenge experience.');
});

test('baseline is mobile-first and accessible', () => {
  assert.match(html, /name="viewport"/i);
  assert.match(html, /<main[^>]+aria-labelledby="page-title"/i);
  assert.match(html, /id="app-status"/i);
  assert.match(css, /min-width:\s*320px/i);
});

test('baseline loads its local assets', () => {
  assert.match(html, /href="styles\.css"/i);
  assert.match(html, /src="app\.js"/i);
});
