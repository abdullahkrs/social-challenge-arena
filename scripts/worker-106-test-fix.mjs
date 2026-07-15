import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const write = (path, content) => writeFile(new URL(path, root), content, 'utf8');

function replaceRequired(content, before, after, label) {
  if (!content.includes(before)) throw new Error(`Missing test target: ${label}`);
  return content.replace(before, after);
}

let lumen = await read('tests/lumen-endless.test.mjs');
lumen = replaceRequired(
  lumen,
  "  assert.match(integration, /MutationObserver\\(updateCatalogDuration\\)/);",
  "  assert.doesNotMatch(integration, /durationValue|updateCatalogDuration|round-value/);",
  'Lumen direct endless status ownership'
);
await write('tests/lumen-endless.test.mjs', lumen);

let mirror = await read('tests/mirror-game.test.mjs');
mirror = replaceRequired(
  mirror,
  "  assert.equal(mirror?.durationSeconds, 0);",
  "  assert.equal(mirror?.statusKey, 'endless');\n  assert.equal(mirror?.progressLabelKey, 'mirrorPattern');\n  assert.equal('durationSeconds' in mirror, false);",
  'Mirror registry status metadata'
);
await write('tests/mirror-game.test.mjs', mirror);

const onboarding = `import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog } from '../src/catalog.mjs';
import { messages } from '../src/i18n.mjs';
import '../src/orbit-copy.mjs';
import '../src/echo-copy.mjs';
import '../src/mirror-copy.mjs';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('catalog owns localized endless status and challenge progress metadata', () => {
  assert.equal(catalog.length, 4);
  for (const challenge of catalog) {
    assert.equal(challenge.statusKey, 'endless');
    assert.ok(challenge.progressLabelKey);
    assert.equal('durationSeconds' in challenge, false);
  }
});

test('catalog, daily, and invitation share the compact instruction entry', async () => {
  const app = await read('src/app.mjs');
  const dailyStart = app.indexOf('function beginDailyRun()');
  const dailyEnd = app.indexOf('\\n}', dailyStart);
  const dailyBody = app.slice(dailyStart, dailyEnd + 2);
  assert.ok(app.includes("elements.cards.forEach((card) => card.addEventListener('click', () => selectChallenge(card.dataset.challengeId)))"));
  assert.ok(dailyBody.includes("setScreen('instructions')"));
  assert.ok(!dailyBody.includes('safeBeginRun()'));
  assert.ok(app.includes('setScreen(initialScreenForInvite(state.invite))'));
  assert.ok(app.includes('elements.instructionTarget.hidden = !invited && !dailyRecovery'));
});

test('shared platform renders truthful endless catalog and normalized progress directly', async () => {
  const [app, html, catalogSource] = await Promise.all([read('src/app.mjs'), read('index.html'), read('src/catalog.mjs')]);
  assert.ok(app.includes("t(challenge.statusKey || 'endless')"));
  assert.ok(app.includes('function renderProgress(snapshot = state.progressSnapshot)'));
  assert.ok(!app.includes("t('seconds'"));
  assert.ok(!html.includes('1/12'));
  assert.ok(!html.includes('round-value'));
  assert.ok(!html.includes('data-i18n="round"'));
  assert.ok(html.includes('id="progress-label"'));
  assert.ok(html.includes('id="progress-value">1'));
  assert.ok(!catalogSource.includes('durationSeconds'));
  for (const file of ['orbit-integration.mjs', 'echo-integration.mjs', 'lumen-integration.mjs', 'mirror-integration.mjs']) {
    const source = await read('src/' + file);
    assert.ok(!/durationValue|updateCatalogDuration|roundLabel|roundValue|round-value/.test(source), file);
  }
});

test('entry copy stays concise, localized, and truthful about endless exit', () => {
  const keys = ['orbitHowTo', 'echoHowTo', 'lumenHowTo', 'mirrorHowTo'];
  for (const language of ['en', 'ar', 'tr']) {
    for (const key of keys) {
      const copy = messages[language][key];
      assert.ok(copy.length > 35 && copy.length < 190, language + ':' + key);
      assert.ok(copy.split(/[.!؟]+/).filter(Boolean).length <= 2, language + ':' + key);
    }
  }
});
`;
await write('tests/onboarding-status.test.mjs', onboarding);
