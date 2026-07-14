import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  composeLumenStage, evaluateLumenChoice, lumenChunkSeed, lumenLayer, lumenPhase, lumenWindow,
  LUMEN_CHUNK_SIZE, LUMEN_MECHANICS, LUMEN_PHASES, LUMEN_ZONES, scoreEndlessLumen, summarizeLumenRun
} from '../src/lumen-model.mjs';

test('endless Lumen windows are reproducible and different seeds change decisions', () => {
  const first = lumenWindow(0x12345678, 0, 180);
  const replay = lumenWindow(0x12345678, 0, 180);
  const other = lumenWindow(0x87654321, 0, 180);
  assert.deepEqual(first, replay);
  assert.notDeepEqual(
    first.map(({ mechanic, targetLane, blockedLane, riskLane, zone, phase }) => ({ mechanic, targetLane, blockedLane, riskLane, zone, phase })),
    other.map(({ mechanic, targetLane, blockedLane, riskLane, zone, phase }) => ({ mechanic, targetLane, blockedLane, riskLane, zone, phase }))
  );
  assert.equal(first.length, 180);
  assert.equal(lumenChunkSeed(55, 0), 55);
  assert.notEqual(lumenChunkSeed(55, 1), lumenChunkSeed(55, 2));
});

test('realistic endless play exposes four mechanics, zones, layers, and tension phases safely', () => {
  const stages = lumenWindow(424242, 0, 180);
  assert.deepEqual([...new Set(stages.map(({ mechanic }) => mechanic))].sort(), [...LUMEN_MECHANICS].sort());
  assert.deepEqual([...new Set(stages.map(({ zone }) => zone))].sort(), [...LUMEN_ZONES].sort());
  assert.deepEqual([...new Set(stages.map(({ phase }) => phase))].sort(), [...LUMEN_PHASES].sort());
  assert.deepEqual([...new Set(stages.map(({ layer }) => layer))].sort(), ['application', 'combination', 'deception', 'mastery', 'pressure', 'understanding']);
  assert.ok(stages.every(({ deadlineMs }) => deadlineMs >= 760 && deadlineMs <= 2820));
  assert.ok(stages.every(({ cueLane }) => Number.isInteger(cueLane) && cueLane >= 0 && cueLane <= 2));
  assert.ok(stages.some(({ milestone }) => milestone));
  assert.ok(stages.some(({ special }) => special));
  assert.equal(lumenLayer(0), 'understanding');
  assert.equal(lumenLayer(80), 'mastery');
  assert.equal(lumenPhase(4), 'recovery');
});

test('route-choice stages always offer two fair routes and one explicit risk route', () => {
  const choiceStages = lumenWindow(919191, 0, 240).filter(({ mechanic }) => mechanic === 'choice');
  assert.ok(choiceStages.length >= 20);
  for (const stage of choiceStages) {
    const outcomes = [0, 1, 2].map((lane) => evaluateLumenChoice(stage, lane));
    assert.equal(outcomes.filter(({ correct }) => correct).length, 2);
    assert.equal(outcomes.filter(({ risk }) => risk).length, 1);
    assert.equal(outcomes[stage.blockedLane].reason, 'blocked');
  }
});

test('memory and mirror decisions change the required lane rather than only timing', () => {
  const stages = lumenWindow(777, 0, 120);
  const mirror = stages.find(({ mechanic, cueLane }) => mechanic === 'mirror' && cueLane !== 1);
  const memory = stages.find(({ mechanic }) => mechanic === 'memory');
  assert.ok(mirror);
  assert.equal(mirror.targetLane, 2 - mirror.cueLane);
  assert.ok(memory.sequence.length >= 2);
  assert.equal(memory.targetLane, memory.memoryRule === 'first' ? memory.sequence[0] : memory.sequence.at(-1));
  assert.deepEqual(composeLumenStage(777, mirror.index), mirror);
});

test('endless scoring rewards mastery without quickly saturating the strict score bound', () => {
  const direct = lumenWindow(13, 0, 1)[0];
  const choice = lumenWindow(13, 12, 1)[0];
  const basic = scoreEndlessLumen({ stage: direct, elapsedMs: direct.deadlineMs * 0.5, combo: 1, risk: false });
  const mastered = scoreEndlessLumen({ stage: choice, elapsedMs: 0, combo: 12, risk: true });
  assert.ok(mastered.points > basic.points);
  assert.ok(mastered.points <= 78);
  assert.ok(basic.points >= 22);
  assert.ok(120 * mastered.points < 9999);
  assert.deepEqual(summarizeLumenRun({ round: 28, attempts: 30, correct: 24, bestCombo: 9 }), { gates: 28, bestCombo: 9, accuracy: 80 });
});

test('the runtime keeps only one bounded chunk and has no fixed completion branch', async () => {
  const source = await readFile(new URL('../src/lumen-game.mjs', import.meta.url), 'utf8');
  assert.match(source, /this\.plan = lumenPlan\(seed, 18\)/);
  assert.match(source, /requiredChunk !== this\.chunkIndex/);
  assert.match(source, /lumenChunkSeed\(this\.seed, requiredChunk\)/);
  assert.match(source, /Number\.MAX_SAFE_INTEGER/);
  assert.doesNotMatch(source, /snapshot\.round >= this\.snapshot\.rounds|finish\('complete'\)/);
  assert.doesNotMatch(source, /setInterval|requestAnimationFrame/);
  assert.match(source, /this\.timers\.forEach\(clearTimeout\)/);
  assert.equal(LUMEN_CHUNK_SIZE, 18);
});

test('visual movement never reveals the correct lane before the player decides', async () => {
  const source = await readFile(new URL('../src/lumen-game.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /dataset\.target\s*=/);
  assert.match(source, /this\.player\.style\.setProperty\('--player-lane', String\(index\)\)/);
});

test('deliberate exit and accessible memory cues support the endless result journey', async () => {
  const source = await readFile(new URL('../src/lumen-game.mjs', import.meta.url), 'utf8');
  const integration = await readFile(new URL('../src/lumen-integration.mjs', import.meta.url), 'utf8');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(source, /if \(this\.exitArmed\) \{\s*this\.finish\('ended'\)/);
  assert.match(source, /this\.exitTimer = this\.schedule[\s\S]*3000/);
  assert.match(source, /emit\('finish'/);
  assert.match(integration, /lumenResultDetail/);
  assert.match(integration, /stage\.sequence\.map\(laneName\)/);
  assert.match(integration, /MutationObserver\(updateCatalogDuration\)/);
  assert.match(html, /data-lumen-exit/);
  assert.match(html, /data-lumen-accessible-sequence/);
  assert.match(html, /id="result-detail"/);
  assert.equal((html.match(/data-lane=/g) || []).length, 3);
});

test('endless Lumen adds no remote runtime or copied asset dependency', async () => {
  const files = await Promise.all([
    readFile(new URL('../src/lumen-model.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/lumen-game.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/lumen-integration.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/lumen.css', import.meta.url), 'utf8')
  ]);
  const joined = files.join('\n');
  assert.doesNotMatch(joined, /https?:|fetch\(|XMLHttpRequest|WebSocket|AudioContext|new Audio|localStorage|sessionStorage/);
});
