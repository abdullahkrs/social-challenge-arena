import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { catalog } from '../src/catalog.mjs';
import {
  composeOrbitStage, evaluateOrbitWindow, generateOrbitChunk, ORBIT_CHUNK_SIZE, ORBIT_LAYERS,
  ORBIT_MECHANICS, ORBIT_PHASES, ORBIT_ZONES, orbitPositionAt, orbitWindow, scoreOrbitLock
} from '../src/orbit-model.mjs';

const seeds = [0, 1, 0x51f15e5d, 0xffffffff];

test('same seed reproduces every mechanical Orbit decision and different seeds materially diverge', () => {
  const sender = orbitWindow(0x1234abcd, 0, 72);
  const friend = orbitWindow(0x1234abcd, 0, 72);
  const other = orbitWindow(0x1234abce, 0, 72);
  assert.deepEqual(sender, friend);
  assert.notDeepEqual(sender.map(({ mechanic, targetLane, gateTick, speed, riskLane, decoys }) => ({ mechanic, targetLane, gateTick, speed, riskLane, decoys })), other.map(({ mechanic, targetLane, gateTick, speed, riskLane, decoys }) => ({ mechanic, targetLane, gateTick, speed, riskLane, decoys })));
});

test('bounded chunks are endless-safe, readable, and never contain impossible windows', () => {
  for (const seed of seeds) {
    for (let chunkIndex = 0; chunkIndex < 6; chunkIndex += 1) {
      const chunk = generateOrbitChunk(seed, chunkIndex);
      assert.equal(chunk.length, ORBIT_CHUNK_SIZE);
      chunk.forEach((stage, offset) => {
        assert.equal(stage.index, chunkIndex * ORBIT_CHUNK_SIZE + offset);
        assert.ok(stage.targetLane >= 0 && stage.targetLane < 3);
        assert.ok(stage.gateWidth >= 70 && stage.gateWidth <= 184);
        assert.ok(stage.speed >= 112 && stage.speed <= 238);
        assert.ok(stage.deadlineMs > stage.periodMs * 1.5);
        assert.ok(stage.deadlineMs < stage.periodMs * 3.3);
        assert.ok(stage.decoys.length <= 2);
        assert.ok(stage.decoys.every((decoy) => decoy.lane >= 0 && decoy.lane < 3 && decoy.width >= 56));
        const crossing = (stage.gateTick - stage.startTick + (stage.direction < 0 ? 1024 : 0)) / stage.speed * 1000 * stage.direction;
        const elapsed = ((crossing % stage.periodMs) + stage.periodMs) % stage.periodMs;
        const evaluated = evaluateOrbitWindow(stage, { elapsedMs: elapsed, lane: stage.targetLane });
        assert.equal(evaluated.safe, true, `stage ${stage.index} must expose a valid safe window`);
      });
    }
  }
});

test('opening and realistic windows introduce multiple decisions through all progression and tension layers', () => {
  const opening = orbitWindow(0x92f00d, 0, 12);
  const journey = orbitWindow(0x92f00d, 0, 72);
  assert.deepEqual(new Set(opening.map((stage) => stage.mechanic)), new Set(ORBIT_MECHANICS));
  assert.deepEqual(new Set(journey.map((stage) => stage.zone)), new Set(ORBIT_ZONES));
  assert.deepEqual(new Set(journey.map((stage) => stage.phase)), new Set(ORBIT_PHASES));
  assert.deepEqual(new Set(journey.map((stage) => stage.layer)), new Set(ORBIT_LAYERS));
  assert.ok(journey.some((stage) => stage.restoresChance));
  assert.ok(journey.some((stage) => stage.special && stage.riskLane !== null));
  assert.ok(journey.some((stage) => stage.milestone));
  assert.ok(journey.some((stage) => stage.decoys.length === 2));
});

test('position and scoring depend on elapsed truth rather than render-frame cadence', () => {
  const stage = composeOrbitStage(4567, 31);
  const elapsed = 3141.59;
  const direct = orbitPositionAt(stage, elapsed);
  let accumulated = 0;
  for (const delta of [8, 22, 17, 41, 5, 80, 13, 60, 95, 400, 600, 800, 1000]) accumulated += delta;
  const cadenceA = orbitPositionAt(stage, accumulated);
  const cadenceB = orbitPositionAt(stage, accumulated / 3 * 3);
  assert.equal(cadenceA, cadenceB);
  assert.equal(direct, orbitPositionAt(stage, elapsed));
});

test('scoring rewards precision, efficient movement, streaks, late mastery, and optional risk within bounds', () => {
  const stage = orbitWindow(77, 0, 72).find((candidate) => candidate.special && candidate.riskLane !== null);
  const safeElapsed = ((stage.gateTick - stage.startTick) / (stage.direction * stage.speed) * 1000 % stage.periodMs + stage.periodMs) % stage.periodMs;
  const riskElapsed = ((stage.riskGateTick - stage.startTick) / (stage.direction * stage.speed) * 1000 % stage.periodMs + stage.periodMs) % stage.periodMs;
  const clean = scoreOrbitLock({ stage, elapsedMs: safeElapsed, lane: stage.targetLane, moves: 1, combo: 7 });
  const sloppy = scoreOrbitLock({ stage, elapsedMs: safeElapsed + stage.gateWidth / stage.speed * 420, lane: stage.targetLane, moves: 7, combo: 1 });
  const risk = scoreOrbitLock({ stage, elapsedMs: riskElapsed, lane: stage.riskLane, moves: 1, combo: 7 });
  assert.ok(clean.points > sloppy.points);
  assert.ok(risk.points > clean.points);
  for (const result of [clean, sloppy, risk]) assert.ok(result.points >= 0 && result.points <= 420);
});

test('Orbit is catalogued as endless and runtime owns rate limits, two-step exit, sound, terminal races, and teardown', async () => {
  const orbit = catalog.find((challenge) => challenge.id === 'orbit-lock');
  assert.equal(orbit?.endless, true);
  assert.equal(orbit?.durationSeconds, 0);
  const source = await readFile(new URL('../src/game.mjs', import.meta.url), 'utf8');
  assert.match(source, /generateOrbitChunk\(this\.seed, chunkIndex\)/);
  assert.match(source, /this\.stageIndex \+= 1/);
  assert.doesNotMatch(source, /finish\('complete'\)|challengePlan\(|rounds:\s*12/);
  assert.match(source, /now - this\.lastLockAt < 140/);
  assert.match(source, /this\.exitTimer = this\.schedule\(\(\) => this\.disarmExit\(\), 3000\)/);
  assert.match(source, /requestExit\(\) \{\s*if \(!this\.running \|\| this\.terminalPending\) return;/s);
  assert.match(source, /finish\(reason\) \{\s*if \(!this\.running \|\| \(reason === 'ended' && this\.terminalPending\)\) return;/s);
  assert.match(source, /platformAudio\.play\('move'/);
  assert.match(source, /platformAudio\.play\('correct'/);
  assert.match(source, /platformAudio\.play\('wrong'/);
  assert.match(source, /platformAudio\.play\('zone'/);
  assert.match(source, /this\.abortController\?\.abort\(\)/);
  assert.match(source, /this\.resizeObserver\?\.disconnect\(\)/);
  assert.match(source, /this\.languageObserver\?\.disconnect\(\)/);
  assert.match(source, /this\.timers\.forEach\(clearTimeout\)/);
  assert.doesNotMatch(source, /setInterval|fetch\(|WebSocket|new Audio\(/);
});

test('mobile UI retains focusable visible controls, non-color cues, RTL-safe geometry, and reduced effects', async () => {
  const [source, css, copy] = await Promise.all([
    readFile(new URL('../src/game.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/orbit.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/orbit-copy.mjs', import.meta.url), 'utf8')
  ]);
  assert.match(source, /aria-keyshortcuts/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /event\.code === 'Space' \|\| event\.code === 'Enter'/);
  assert.match(source, /pointerdown/);
  assert.match(source, /data-orbit-status/);
  assert.match(css, /direction:\s*ltr/);
  assert.match(css, /@media \(max-width:390px\)/);
  assert.match(css, /data-state="ready"/);
  assert.match(css, /data-feedback="wrong"/);
  assert.match(css, /data-reduced|reduced-motion/);
  for (const language of ['en', 'ar', 'tr']) assert.match(copy, new RegExp(`${language}: \\{`));
});
