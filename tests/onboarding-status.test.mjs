import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

function functionBody(text, name, nextName) {
  const start = text.indexOf(`function ${name}`);
  const end = nextName ? text.indexOf(`function ${nextName}`, start + 1) : text.length;
  assert.notEqual(start, -1, `${name} must exist`);
  return text.slice(start, end === -1 ? text.length : end);
}

test('the central registry owns endless status and progress labels', async () => {
  const catalog = await source('src/catalog.mjs');
  assert.equal((catalog.match(/statusKey: 'endless'/g) || []).length, 4);
  assert.equal((catalog.match(/progressLabelKey:/g) || []).length, 4);
  assert.equal((catalog.match(/endless: true/g) || []).length, 4);
  assert.equal((catalog.match(/durationSeconds: 0/g) || []).length, 4, 'legacy metadata remains compatible but is never rendered');
});

test('all languages use concise progressive entry copy', async () => {
  const copy = await source('src/onboarding-copy.mjs');
  assert.equal((copy.match(/catalogHint:/g) || []).length, 3);
  for (const key of ['orbitHowTo', 'echoHowTo', 'lumenHowTo', 'mirrorHowTo']) {
    assert.equal((copy.match(new RegExp(`${key}:`, 'g')) || []).length, 3, `${key} exists in three languages`);
  }
  assert.match(copy, /chances/);
  assert.match(copy, /فرص/);
  assert.match(copy, /Hakların/);
  assert.doesNotMatch(copy, /Later gates|البوابات اللاحقة|Sonraki kapılar/);
});

test('catalog, daily, and invitation use one instruction surface', async () => {
  const app = await source('src/app.mjs');
  const daily = functionBody(app, 'beginDailyRun', 'renderResult');
  assert.match(daily, /setScreen\('instructions'\)/);
  assert.doesNotMatch(daily, /safeBeginRun\(/);
  assert.match(app, /setScreen\(initialScreenForInvite\(state\.invite\)\)/);
  assert.match(app, /if \(openInstructions\) setScreen\('instructions'\)/);
  assert.match(app, /instructionTarget\.textContent = invited/);
  assert.match(app, /instructionTarget\.hidden = !invited && !dailyEntry/);
});

test('the platform renders truthful endless catalog and progress state directly', async () => {
  const [app, html] = await Promise.all([source('src/app.mjs'), source('index.html')]);
  assert.match(app, /textContent = t\(challenge\.statusKey\)/);
  assert.match(app, /textContent = t\(challenge\.progressLabelKey\)/);
  assert.doesNotMatch(app, /snapshot\.rounds/);
  assert.doesNotMatch(app, /t\('seconds'/);
  assert.doesNotMatch(html, /1\/12|~0s|Fast multilingual/i);
  assert.match(html, /id="round-value">1</);
  assert.match(html, /Four endless skill journeys/);
});

test('challenge integrations no longer repair core catalog or shared HUD truth', async () => {
  for (const file of ['src/orbit-integration.mjs', 'src/echo-integration.mjs', 'src/lumen-integration.mjs', 'src/mirror-integration.mjs']) {
    const text = await source(file);
    assert.doesNotMatch(text, /data-duration|updateCatalogDuration|#round-value/);
  }
});

test('zero-attempt Echo exits render 0% instead of perfect accuracy', async () => {
  const echo = functionBody(await source('src/echo-integration.mjs'), 'updateResult', 'resetSharedState');
  assert.match(echo, /Number\(result\.totalMoves\)/);
  assert.match(echo, /const accuracy = attempts > 0 \? \(result\.accuracy \?\? 0\) : 0;/);
  assert.match(echo, /echoResultDetail[\s\S]*accuracy/);
});

test('zero-attempt Mirror exits render 0% instead of perfect accuracy', async () => {
  const mirror = functionBody(await source('src/mirror-integration.mjs'), 'updateResult', 'resetSharedState');
  assert.match(mirror, /Number\(result\.totalActions\)/);
  assert.match(mirror, /const accuracy = attempts > 0 \? \(result\.accuracy \?\? 0\) : 0;/);
  assert.match(mirror, /mirrorResultDetail[\s\S]*accuracy/);
});

test('the instruction card has at most two visible text blocks before Start', async () => {
  const html = await source('index.html');
  const card = html.slice(html.indexOf('<div class="instruction-card">'), html.indexOf('<button id="start-button"'));
  assert.match(card, /instruction-eyebrow[^>]*hidden/);
  assert.match(card, /instruction-target[^>]*hidden/);
  assert.equal((card.match(/<p /g) || []).length, 2, 'hidden context and concise objective are the only paragraphs');
  assert.equal((card.match(/<strong /g) || []).length, 1, 'one optional context/target block exists');
});

test('focused files remain inside the static no-network boundary', async () => {
  const [html, app, copy] = await Promise.all([source('index.html'), source('src/app.mjs'), source('src/onboarding-copy.mjs')]);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(`${app}\n${copy}`, /https?:\/\//);
});
