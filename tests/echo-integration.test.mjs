import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog, getChallenge } from '../src/catalog.mjs';
import { missingTranslations, supportedLanguages, translate } from '../src/i18n.mjs';

test('Echo remains the same live challenge identity while becoming endless', () => {
  assert.equal(catalog.length, 4);
  const echo = getChallenge('echo-grid');
  assert.equal(echo.skill, 'memory');
  assert.equal(echo.endless, true);
  assert.equal(echo.durationSeconds, 0);
});

test('all Echo journey states have Arabic English and Turkish parity', () => {
  assert.deepEqual(missingTranslations(), []);
  const keys = [
    'echoHowTo', 'echoPromptTrace', 'echoPromptReverse', 'echoPromptMirror', 'echoPromptFold',
    'echoPathCleared', 'echoRiskCleared', 'echoTooSlow', 'echoExitConfirm', 'echoEnded',
    'echoResultDetail', 'echoRouteAnnouncement', 'echoResponseAnnouncement', 'echoCellTopLeft', 'echoCellBottomRight'
  ];
  for (const language of supportedLanguages) {
    for (const key of keys) assert.notEqual(translate(language, key), key);
    assert.ok(translate(language, 'echoResultDetail', { paths: 8, combo: 3, accuracy: 90, risk: 1 }).includes('8'));
  }
});

test('the real entry point keeps platform patterns and adds only bounded Echo surfaces', async () => {
  const [html, app, build, css] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../src/app.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/echo.css', import.meta.url), 'utf8')
  ]);
  assert.equal((html.match(/data-challenge-id=/g) || []).length, 4);
  assert.equal((html.match(/data-cell=/g) || []).length, 9);
  assert.match(html, /id="echo-grid"[^>]*role="group"[^>]*dir="ltr"/);
  assert.match(html, /data-echo-board[^>]*aria-keyshortcuts="ArrowUp ArrowRight ArrowDown ArrowLeft"/);
  assert.match(html, /class="result-actions echo-memory-actions"/);
  assert.match(html, /class="ghost echo-exit"/);
  assert.match(html, /\.\/src\/echo\.css/);
  assert.match(html, /\.\/src\/echo-integration\.mjs/);
  assert.match(app, /new EchoGridGame/);
  assert.ok(build.includes("'./src/echo.css'"));
  assert.ok(build.includes("'./src/echo-integration.mjs'"));
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /html\[data-reduced-motion="true"\]/);
  assert.doesNotMatch(html, /fontawesome\.com|cdnjs|jsdelivr|unpkg/i);
});
