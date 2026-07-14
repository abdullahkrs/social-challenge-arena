import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ECHO_CHUNK_SIZE, applyMoves, generateEchoChunk, scoreEchoStage, summarizeEchoStages
} from '../src/echo-model.mjs';

test('echo chunks are deterministic, bounded, and mechanically varied', () => {
  const first = generateEchoChunk(0x12345678, 0);
  const repeat = generateEchoChunk(0x12345678, 0);
  const next = generateEchoChunk(0x12345678, 1);
  assert.equal(first.length, ECHO_CHUNK_SIZE);
  assert.deepEqual(first, repeat);
  assert.notDeepEqual(first, next);
  for (const stage of [...first, ...next]) {
    const displayPath = applyMoves(stage.displayStart, stage.displayMoves);
    const responsePath = applyMoves(stage.responseStart, stage.expectedMoves);
    assert.ok(displayPath?.cells.every(Number.isInteger));
    assert.ok(responsePath?.cells.every(Number.isInteger));
    assert.equal(stage.displayMoves.length, stage.expectedMoves.length);
    assert.ok(stage.length >= 3 && stage.length <= 8);
  }
});

test('realistic echo run reaches all progression and tension families', () => {
  const stages = Array.from({ length: 4 }, (_, chunk) => generateEchoChunk(77, chunk)).flat();
  const summary = summarizeEchoStages(stages);
  assert.deepEqual(summary.mechanics.sort(), ['direct', 'echo', 'reverse', 'turn']);
  assert.deepEqual(summary.layers, ['understanding', 'application', 'combination', 'deception', 'pressure', 'mastery']);
  for (const phase of ['rise', 'recovery', 'reveal', 'pressure', 'special', 'mastery']) assert.ok(summary.tensions.includes(phase));
  assert.ok(summary.zones.length >= 4);
});

test('cross-seed variation changes route and rules, not only cosmetics', () => {
  const a = generateEchoChunk(1, 1);
  const b = generateEchoChunk(2, 1);
  assert.notDeepEqual(a.map((stage) => stage.expectedMoves), b.map((stage) => stage.expectedMoves));
  assert.notDeepEqual(a.map((stage) => [stage.mechanic, stage.responseStart, stage.deadlineMs]), b.map((stage) => [stage.mechanic, stage.responseStart, stage.deadlineMs]));
});

test('score rewards mastery while staying inside invitation bounds', () => {
  const stage = generateEchoChunk(42, 2)[10];
  const assisted = scoreEchoStage({ stage, combo: 1, assists: 2, remainingMs: 0 });
  const mastered = scoreEchoStage({ stage, combo: 8, assists: 0, remainingMs: stage.deadlineMs || 0 });
  assert.ok(mastered > assisted);
  assert.ok(assisted >= 8);
  assert.ok(mastered <= 78);
  assert.ok(mastered * 100 < 9999);
});
