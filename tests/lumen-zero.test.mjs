import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreLumenRound } from '../src/core.mjs';

test('zero-millisecond Lumen reaction is preserved as valid fastest input', () => {
  const route = { deadlineMs: 1000, combo: 1, round: 0 };
  const zero = scoreLumenRound({ ...route, elapsedMs: 0 });
  const one = scoreLumenRound({ ...route, elapsedMs: 1 });

  assert.deepEqual(zero, { reaction: 0, points: 340 });
  assert.ok(zero.points >= one.points);
  assert.equal(scoreLumenRound({ ...route, elapsedMs: Number.NaN }).reaction, 1000);
  assert.equal(scoreLumenRound({ ...route }).reaction, 1000);
});
