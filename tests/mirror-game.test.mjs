import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mirrorPlan, reflectPattern, scoreMirrorRound } from '../src/core.mjs';
import {
  describeMirrorPattern,
  MIRROR_CELL_COUNT,
  MIRROR_COLUMNS,
  MIRROR_ROWS
} from '../src/mirror-game.mjs';
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

test('Mirror Fuse uses one 4-by-3 geometry contract for rendering, reflection, and spoken rows', async () => {
  const source = [1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1];
  const expectedRows = [
    [1, 0, 1],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1]
  ];
  const spoken = describeMirrorPattern(source, (key, values = {}) => {
    if (key === 'mirrorCellOn') return '1';
    if (key === 'mirrorCellOff') return '0';
    return `row ${values.row}: ${values.cells}`;
  });

  assert.equal(MIRROR_ROWS, 4);
  assert.equal(MIRROR_COLUMNS, 3);
  assert.equal(MIRROR_CELL_COUNT, 12);
  assert.equal(spoken, 'row 1: 1, 0, 1. row 2: 0, 1, 0. row 3: 1, 1, 0. row 4: 0, 0, 1');

  const reflected = reflectPattern(source, MIRROR_COLUMNS);
  assert.deepEqual(reflected, expectedRows.flatMap((row) => [...row].reverse()));

  const stage = mirrorPlan(0x92f00d, 1)[0];
  assert.equal(stage.source.length, MIRROR_CELL_COUNT);
  assert.deepEqual(stage.options[stage.correctIndex], reflectPattern(stage.source, MIRROR_COLUMNS));

  const implementation = await readFile(new URL('../src/mirror-game.mjs', import.meta.url), 'utf8');
  assert.match(implementation, /grid\.style\.gridTemplateColumns = `repeat\(\$\{MIRROR_COLUMNS\}, 1fr\)`/);
  assert.match(implementation, /grid\.style\.gridTemplateRows = `repeat\(\$\{MIRROR_ROWS\}, 1fr\)`/);
  assert.match(implementation, /reflectPattern\(stage\.source, MIRROR_COLUMNS\)/);
  assert.match(implementation, /Array\.from\(\{ length: MIRROR_ROWS \}/);
  assert.match(implementation, /slice\(row \* MIRROR_COLUMNS, \(row \+ 1\) \* MIRROR_COLUMNS\)/);
});
