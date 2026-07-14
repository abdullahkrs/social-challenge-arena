import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog } from '../src/catalog.mjs';
import {
  composeMirrorStage, evaluateMirrorBoard, generateMirrorChunk, MIRROR_BOARD_SIZE, MIRROR_CHUNK_SIZE,
  MIRROR_MECHANICS, MIRROR_PHASES, MIRROR_RULES, MIRROR_ZONES, mirrorWindow, scoreMirrorStage,
  transformCell, transformPattern
} from '../src/mirror-model.mjs';
import { messages, supportedLanguages, translate } from '../src/i18n.mjs';
import '../src/mirror-copy.mjs';
import '../src/mirror-integration.mjs';

function connected(pattern) {
  const cells = new Set(pattern);
  const seen = new Set([pattern[0]]);
  const queue = [pattern[0]];
  while (queue.length) {
    const cell = queue.shift();
    const row = Math.floor(cell / MIRROR_BOARD_SIZE);
    const column = cell % MIRROR_BOARD_SIZE;
    const candidates = [];
    if (row > 0) candidates.push(cell - MIRROR_BOARD_SIZE);
    if (row < MIRROR_BOARD_SIZE - 1) candidates.push(cell + MIRROR_BOARD_SIZE);
    if (column > 0) candidates.push(cell - 1);
    if (column < MIRROR_BOARD_SIZE - 1) candidates.push(cell + 1);
    for (const candidate of candidates) {
      if (cells.has(candidate) && !seen.has(candidate)) { seen.add(candidate); queue.push(candidate); }
    }
  }
  return seen.size === cells.size;
}

test('Mirror transformations preserve exact deterministic geometry', () => {
  assert.equal(transformCell(6, 'horizontal'), 8);
  assert.equal(transformCell(6, 'vertical'), 16);
  assert.equal(transformCell(6, 'rotate180'), 18);
  assert.equal(transformCell(6, 'rotateRight'), 8);
  assert.deepEqual(transformPattern([6, 7, 12], 'horizontal'), [8, 7, 12]);
  assert.throws(() => transformCell(25, 'horizontal'), RangeError);
  assert.throws(() => transformPattern([6, 6], 'vertical'), RangeError);
});

test('same seed reproduces the endless journey and different seeds change mechanics and boards', () => {
  const sender = mirrorWindow(0x1234abcd, 0, 72);
  const friend = mirrorWindow(0x1234abcd, 0, 72);
  const other = mirrorWindow(0x1234abce, 0, 72);
  assert.deepEqual(sender, friend);
  assert.notDeepEqual(
    sender.map(({ rule, mechanic, sourcePattern, initialOn, cursorStart }) => ({ rule, mechanic, sourcePattern, initialOn, cursorStart })),
    other.map(({ rule, mechanic, sourcePattern, initialOn, cursorStart }) => ({ rule, mechanic, sourcePattern, initialOn, cursorStart }))
  );
});

test('bounded chunks are safe, solvable, distinct, and never imply a fixed ending', () => {
  for (const seed of [0, 1, 0x92f00d, 0xffffffff]) {
    for (let chunkIndex = 0; chunkIndex < 5; chunkIndex += 1) {
      const chunk = generateMirrorChunk(seed, chunkIndex);
      assert.equal(chunk.length, MIRROR_CHUNK_SIZE);
      chunk.forEach((stage, offset) => {
        assert.equal(stage.index, chunkIndex * MIRROR_CHUNK_SIZE + offset);
        assert.ok(stage.sourcePattern.length >= 4 && stage.sourcePattern.length <= 9);
        assert.equal(new Set(stage.sourcePattern).size, stage.sourcePattern.length);
        assert.equal(new Set(stage.targetPattern).size, stage.targetPattern.length);
        assert.ok(connected(stage.sourcePattern));
        assert.deepEqual(stage.targetPattern, transformPattern(stage.sourcePattern, stage.rule));
        assert.ok(stage.initialOn.every((cell) => cell >= 0 && cell < 25));
        assert.ok(stage.locked.every((cell) => stage.targetPattern.includes(cell) && stage.initialOn.includes(cell)));
        assert.ok(stage.cursorStart >= 0 && stage.cursorStart < 25);
        assert.ok(stage.moveBudget > stage.targetPattern.length);
        assert.ok(stage.deadlineMs >= 11000 && stage.deadlineMs <= 26000);
        const solved = evaluateMirrorBoard(stage, new Set(stage.targetPattern), stage.targetPattern.length);
        assert.equal(solved.correct, true);
        assert.equal(solved.missing.length, 0);
        assert.equal(solved.extra.length, 0);
      });
    }
  }
});

test('realistic play windows expose staged layers, multiple decisions, zones, and tension rhythm', () => {
  const stages = mirrorWindow(0x51f15e5d, 0, 96);
  assert.deepEqual(new Set(stages.map((stage) => stage.rule)), new Set(MIRROR_RULES));
  assert.deepEqual(new Set(stages.map((stage) => stage.mechanic)), new Set(MIRROR_MECHANICS));
  assert.deepEqual(new Set(stages.map((stage) => stage.zone)), new Set(MIRROR_ZONES));
  assert.deepEqual(new Set(stages.map((stage) => stage.phase)), new Set(MIRROR_PHASES));
  assert.deepEqual(new Set(stages.map((stage) => stage.layer)), new Set(['understanding', 'application', 'combination', 'deception', 'pressure', 'mastery']));
  assert.ok(new Set(stages.slice(0, 12).map((stage) => stage.mechanic)).size >= 4);
  assert.ok(stages.some((stage) => stage.restoresChance));
  assert.ok(stages.some((stage) => stage.special));
  assert.ok(stages.some((stage) => stage.milestone));
});

test('scoring rewards mastery, efficiency, focus, rules, and special phases within bounds', () => {
  const simple = composeMirrorStage(9876, 0);
  const mastery = composeMirrorStage(9876, 83);
  const clean = scoreMirrorStage({ stage: mastery, moves: 8, elapsedMs: 3000, combo: 6, wrongActions: 0 });
  const sloppy = scoreMirrorStage({ stage: mastery, moves: mastery.moveBudget * 2, elapsedMs: mastery.deadlineMs, combo: 1, wrongActions: 4 });
  const opening = scoreMirrorStage({ stage: simple, moves: simple.moveBudget, elapsedMs: simple.deadlineMs, combo: 1, wrongActions: 1 });
  assert.ok(clean.points > sloppy.points);
  assert.ok(clean.points > opening.points);
  for (const result of [clean, sloppy, opening]) {
    assert.ok(result.points >= 0 && result.points <= 220);
    assert.ok(result.efficiency >= 0 && result.efficiency <= 100);
    assert.ok(result.focus >= 0 && result.focus <= 100);
  }
});

test('Mirror Fuse is endless in the catalog and its runtime owns lifecycle, exit, sound, and first-input timing', async () => {
  const mirror = catalog.find((challenge) => challenge.id === 'mirror-fuse');
  assert.equal(mirror?.endless, true);
  assert.equal(mirror?.durationSeconds, 0);
  const source = await readFile(new URL('../src/mirror-game.mjs', import.meta.url), 'utf8');
  assert.match(source, /generateMirrorChunk\(this\.seed, this\.chunkIndex\)/);
  assert.match(source, /this\.stageIndex \+= 1/);
  assert.doesNotMatch(source, /finish\('complete'\)|rounds:\s*10|mirrorPlan\(/);
  assert.match(source, /this\.stageStartedAt = null/);
  assert.match(source, /this\.deadlineTimer = this\.schedule\(\(\) => this\.resolveMiss\('timeout'\), this\.stage\.deadlineMs\)/);
  assert.match(source, /this\.exitTimer = this\.schedule\(\(\) => this\.disarmExit\(\), 3000\)/);
  assert.match(source, /this\.abortController\?\.abort\(\)/);
  assert.match(source, /this\.languageObserver\?\.disconnect\(\)/);
  assert.match(source, /this\.timers\.forEach\(clearTimeout\)/);
  assert.match(source, /platformAudio\.play\('move'/);
  assert.match(source, /platformAudio\.play\('correct'/);
  assert.match(source, /platformAudio\.play\('wrong'/);
  assert.match(source, /platformAudio\.play\('zone'/);
  assert.doesNotMatch(source, /setInterval|requestAnimationFrame|fetch\(|WebSocket|Audio\(/);
});

test('Arabic, English, and Turkish provide complete endless Mirror copy and non-audio equivalents', () => {
  const keys = [
    'mirrorTagline', 'mirrorHowTo', 'mirrorControlsHint', 'mirrorArenaLabel', 'mirrorPattern', 'mirrorSource', 'mirrorTarget',
    'mirrorCheckPattern', 'mirrorEndRun', 'mirrorExitNow', 'mirrorResultDetail', 'mirrorRuleHorizontal', 'mirrorRuleVertical',
    'mirrorRuleRotate180', 'mirrorRuleRotateRight', 'mirrorMechanicRebuild', 'mirrorMechanicAnchor', 'mirrorMechanicRepair',
    'mirrorMechanicSequence', 'mirrorSourceDescription', 'mirrorTargetCellLabel', 'mirrorDirectionUp', 'mirrorDirectionRight',
    'mirrorDirectionDown', 'mirrorDirectionLeft'
  ];
  assert.deepEqual([...supportedLanguages].sort(), ['ar', 'en', 'tr']);
  for (const language of supportedLanguages) {
    for (const key of keys) assert.equal(typeof messages[language][key], 'string', `${language}.${key}`);
    assert.ok(translate(language, 'mirrorStageReady', { value: 7, rule: 'R', mechanic: 'M' }).includes('7'));
    assert.ok(translate(language, 'mirrorSourceDescription', { cells: '1', rule: 'R', mechanic: 'M' }).includes('1'));
  }
});

test('responsive UI preserves explicit spatial LTR geometry, focus, non-color cues, and reduced effects', async () => {
  const css = await readFile(new URL('../mirror.css', import.meta.url), 'utf8');
  const source = await readFile(new URL('../src/mirror-game.mjs', import.meta.url), 'utf8');
  assert.match(css, /\.mirror-circuit\s*\{[^}]*direction:\s*ltr/s);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /data-current="true"/);
  assert.match(css, /data-locked/);
  assert.match(css, /data-extra/);
  assert.match(css, /data-reduced/);
  assert.match(source, /role="gridcell"/);
  assert.match(source, /aria-current/);
  assert.match(source, /mirrorSourceDescription/);
  assert.match(source, /event\.code === 'Space' \|\| event\.code === 'Enter'/);
});
