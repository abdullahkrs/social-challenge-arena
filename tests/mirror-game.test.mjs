import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mirrorPlan, scoreMirrorRound } from '../src/core.mjs';
import { supportedLanguages, translate } from '../src/i18n.mjs';

test('zero-millisecond Mirror Fuse response is preserved as the fastest valid input', () => {
  const route = { deadlineMs: 3000, combo: 1, round: 0 };
  const zero = scoreMirrorRound({ ...route, elapsedMs: 0 });
  const one = scoreMirrorRound({ ...route, elapsedMs: 1 });

  assert.deepEqual(zero, { response: 0, points: 480 });
  assert.ok(zero.points >= one.points);
  assert.equal(scoreMirrorRound({ ...route, elapsedMs: Number.NaN }).response, 3000);
  assert.equal(scoreMirrorRound({ ...route }).response, 3000);
});

test('sender and friend receive the same Mirror Fuse route and score calculation', () => {
  const sender = mirrorPlan(0x1234abcd, 10);
  const friend = mirrorPlan(0x1234abcd, 10);
  assert.deepEqual(sender, friend);

  const input = { elapsedMs: 740, deadlineMs: sender[0].deadlineMs, combo: 3, round: 0 };
  assert.deepEqual(scoreMirrorRound(input), scoreMirrorRound(input));
});

test('Mirror Fuse owns timers and listeners and reduced effects do not alter decisions or deadlines', async () => {
  const source = await readFile(new URL('../src/mirror-game.mjs', import.meta.url), 'utf8');
  assert.match(source, /this\.plan = mirrorPlan\(seed, 10\)/);
  assert.match(source, /this\.abortController\?\.abort\(\)/);
  assert.match(source, /this\.timers\.forEach\(clearTimeout\)/);
  assert.match(source, /this\.deadlineTimer = this\.schedule\(\(\) => this\.resolveMiss\('slow'\), stage\.deadlineMs\)/);
  assert.match(source, /this\.marks\[index\]\.textContent = '✓'/);
  assert.match(source, /this\.marks\[index\]\.textContent = '×'/);
  assert.doesNotMatch(source, /reducedMotion\s*\?\s*\d+/);
  assert.doesNotMatch(source, /setInterval|requestAnimationFrame/);
});

test('Mirror Fuse exposes localized source and option patterns to assistive technology', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const source = await readFile(new URL('../src/mirror-game.mjs', import.meta.url), 'utf8');

  assert.match(html, /id="mirror-source-description" class="sr-only" data-mirror-source-description/);
  assert.equal((html.match(/aria-describedby="mirror-source-description"/g) || []).length, 3);
  assert.match(source, /this\.sourceDescription\.textContent = this\.t\('mirrorSourcePattern'/);
  assert.match(source, /button\.setAttribute\('aria-label', this\.t\('mirrorOptionPattern'/);
  assert.match(source, /extraKey: 'mirrorSourcePattern'/);
  assert.match(source, /this\.languageObserver\?\.disconnect\(\)/);

  for (const language of supportedLanguages) {
    const row = translate(language, 'mirrorPatternRow', { row: 1, cells: `${translate(language, 'mirrorCellOn')}, ${translate(language, 'mirrorCellOff')}` });
    const sourceLabel = translate(language, 'mirrorSourcePattern', { pattern: row });
    const optionLabel = translate(language, 'mirrorOptionPattern', { value: 2, pattern: row });
    assert.ok(sourceLabel.includes(row));
    assert.ok(optionLabel.includes(row));
    assert.ok(optionLabel.includes('2'));
  }
});
