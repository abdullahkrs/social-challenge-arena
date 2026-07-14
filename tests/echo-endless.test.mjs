import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  areEchoAdjacent, composeEchoStage, echoChunk, echoChunkSeed, echoLayer, echoPhase,
  ECHO_CHUNK_SIZE, ECHO_MECHANICS, ECHO_PHASES, ECHO_ZONES, evaluateEchoMove,
  initialEchoProgress, scoreEndlessEcho, summarizeEchoRun
} from '../src/echo-model.mjs';

function stages(seed, count = 180) {
  let chunkIndex = -1;
  let plan = [];
  return Array.from({ length: count }, (_, index) => {
    const required = Math.floor(index / ECHO_CHUNK_SIZE);
    if (required !== chunkIndex) {
      chunkIndex = required;
      plan = echoChunk(echoChunkSeed(seed, required));
    }
    return composeEchoStage(seed, index, plan[index % ECHO_CHUNK_SIZE]);
  });
}

test('endless Echo routes are reproducible and different seeds change meaningful decisions', () => {
  const first = stages(0x12345678);
  const replay = stages(0x12345678);
  const other = stages(0x87654321);
  assert.deepEqual(first, replay);
  assert.notDeepEqual(
    first.map(({ mechanic, previewPath, targetPath, blocked, risk, zone, phase }) => ({ mechanic, previewPath, targetPath, blocked, risk, zone, phase })),
    other.map(({ mechanic, previewPath, targetPath, blocked, risk, zone, phase }) => ({ mechanic, previewPath, targetPath, blocked, risk, zone, phase }))
  );
  assert.equal(echoChunkSeed(55, 0), 55);
  assert.notEqual(echoChunkSeed(55, 1), echoChunkSeed(55, 2));
});

test('progression exposes every mechanic, zone, layer, and tension phase with adjacent routes', () => {
  const route = stages(424242, 200);
  assert.deepEqual([...new Set(route.map(({ mechanic }) => mechanic))].sort(), [...ECHO_MECHANICS].sort());
  assert.deepEqual([...new Set(route.map(({ zone }) => zone))].sort(), [...ECHO_ZONES].sort());
  assert.deepEqual([...new Set(route.map(({ phase }) => phase))].sort(), [...ECHO_PHASES].sort());
  assert.deepEqual([...new Set(route.map(({ layer }) => layer))].sort(), ['application', 'combination', 'deception', 'mastery', 'pressure', 'understanding']);
  assert.ok(route.every(({ previewPath, targetPath }) => previewPath.slice(1).every((cell, index) => areEchoAdjacent(previewPath[index], cell)) && targetPath.slice(1).every((cell, index) => areEchoAdjacent(targetPath[index], cell))));
  assert.ok(route.every(({ deadlineMs }) => deadlineMs >= 4300 && deadlineMs <= 11500));
  assert.ok(route.some(({ blocked }) => blocked.length > 0));
  assert.ok(route.some(({ decoy }) => decoy !== null));
  assert.ok(route.some(({ risk }) => risk));
  assert.equal(echoLayer(0), 'understanding');
  assert.equal(echoLayer(80), 'mastery');
  assert.equal(echoPhase(4), 'recovery');
  assert.equal(echoPhase(10), 'special');
});

test('later mechanics change the route decision rather than only timing', () => {
  const route = stages(777, 80);
  const reverse = route.find(({ mechanic, previewPath }) => mechanic === 'reverse' && previewPath[0] !== previewPath.at(-1));
  const mirror = route.find(({ mechanic, previewPath, targetPath }) => mechanic === 'mirror' && previewPath.some((cell, index) => cell !== targetPath[index]));
  const fold = route.find(({ mechanic }) => mechanic === 'fold');
  assert.ok(reverse && mirror && fold);
  assert.deepEqual(reverse.targetPath, [...reverse.previewPath].reverse());
  assert.equal(mirror.targetPath[0] % 3, 2 - (mirror.previewPath[0] % 3));
  assert.equal(fold.targetPath[0] % 3, 2 - (fold.previewPath.at(-1) % 3));
});

test('safe route and optional star detour are both fair valid choices', () => {
  const stage = stages(919191, 240).find(({ risk }) => risk);
  assert.ok(stage);

  let safe = initialEchoProgress(stage);
  while (safe.pathIndex < stage.targetPath.length - 1) {
    const outcome = evaluateEchoMove(stage, safe, stage.targetPath[safe.pathIndex + 1]);
    assert.equal(outcome.correct, true);
    safe = outcome.progress;
  }
  assert.equal(safe.riskTaken, false);

  let risk = initialEchoProgress(stage);
  while (risk.pathIndex < stage.risk.branchIndex) {
    risk = evaluateEchoMove(stage, risk, stage.targetPath[risk.pathIndex + 1]).progress;
  }
  for (const cell of [...stage.risk.tiles, stage.targetPath[stage.risk.branchIndex + 1]]) {
    const outcome = evaluateEchoMove(stage, risk, cell);
    assert.equal(outcome.correct, true);
    risk = outcome.progress;
  }
  while (risk.pathIndex < stage.targetPath.length - 1) risk = evaluateEchoMove(stage, risk, stage.targetPath[risk.pathIndex + 1]).progress;
  assert.equal(risk.riskTaken, true);
});

test('scoring rewards route complexity, pace, streak, and risk without quickly saturating invitations', () => {
  const route = stages(13, 120);
  const basicStage = route.find(({ mechanic, special }) => mechanic === 'trace' && !special);
  const riskStage = route.find(({ risk, mechanic }) => risk && mechanic !== 'trace');
  assert.ok(basicStage && riskStage);
  const basic = scoreEndlessEcho({ stage: basicStage, elapsedMs: basicStage.deadlineMs, combo: 1, riskTaken: false });
  const mastered = scoreEndlessEcho({ stage: riskStage, elapsedMs: 0, combo: 12, riskTaken: true });
  assert.ok(mastered.points > basic.points);
  assert.ok(mastered.points <= 92);
  assert.ok(100 * mastered.points < 9999);
  assert.deepEqual(summarizeEchoRun({ round: 35, cleared: 28, attempts: 35, correct: 28, bestCombo: 9, riskRoutes: 3 }), { paths: 28, bestCombo: 9, accuracy: 80, riskRoutes: 3 });
});

test('runtime keeps one bounded chunk, waits for Ready, and has no fixed completion branch', async () => {
  const source = await readFile(new URL('../src/echo-game.mjs', import.meta.url), 'utf8');
  const integration = await readFile(new URL('../src/echo-integration.mjs', import.meta.url), 'utf8');
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(source, /this\.plan = echoChunk\(this\.seed, ECHO_CHUNK_SIZE\)/);
  assert.match(source, /requiredChunk !== this\.chunkIndex/);
  assert.match(source, /echoChunkSeed\(this\.seed, requiredChunk\)/);
  assert.match(source, /Number\.MAX_SAFE_INTEGER/);
  assert.doesNotMatch(source, /finish\('complete'\)|snapshot\.round >= this\.snapshot\.rounds/);
  assert.match(source, /this\.readyButton\.addEventListener\('click', \(\) => this\.startResponse\(\)/);
  assert.match(source, /this\.roundStartedAt = performance\.now\(\);[\s\S]*stage\.deadlineMs/);
  assert.match(source, /this\.timers\.forEach\(clearTimeout\)/);
  assert.doesNotMatch(source, /setInterval|requestAnimationFrame/);
  assert.match(integration, /routeAnnouncement = 'route'/);
  assert.match(integration, /routeAnnouncement = 'response'/);
  assert.match(html, /data-echo-accessible-route/);
  assert.match(html, /data-echo-repeat/);
  assert.match(html, /data-echo-ready/);
  assert.match(html, /data-echo-exit/);
  assert.equal((html.match(/data-cell=/g) || []).length, 9);
});

test('terminal failure cannot be reclassified as voluntary exit and no remote runtime is added', async () => {
  const files = await Promise.all([
    readFile(new URL('../src/echo-model.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/echo-game.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/echo-integration.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../src/echo.css', import.meta.url), 'utf8')
  ]);
  const game = files[1];
  const terminalMiss = game.match(/if \(this\.snapshot\.lives <= 0\) \{([\s\S]*?)\n    \}/)?.[1] ?? '';
  const requestExit = game.match(/requestExit\(\) \{([\s\S]*?)\n  \}/)?.[1] ?? '';
  assert.match(terminalMiss, /this\.terminalPending = true/);
  assert.match(terminalMiss, /this\.exitButton\.disabled = true/);
  assert.match(requestExit, /if \(!this\.running \|\| this\.terminalPending\) return/);
  assert.doesNotMatch(files.join('\n'), /https?:|fetch\(|XMLHttpRequest|WebSocket|AudioContext|new Audio|localStorage|sessionStorage/);
});
