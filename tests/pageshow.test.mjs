import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dailyChallengeFor, shouldRefreshDailyOnPageShow } from '../src/core.mjs';

test('persisted discovery restore refreshes a rolled-over daily route using injected time only', async () => {
  const current = dailyChallengeFor('2026-07-14T23:59:00Z');
  assert.equal(shouldRefreshDailyOnPageShow({ persisted: true }, current, '2026-07-14T23:59:59Z', 'discovery'), false);
  assert.equal(shouldRefreshDailyOnPageShow({ persisted: true }, current, '2026-07-15T00:00:01Z', 'discovery'), true);
  assert.equal(shouldRefreshDailyOnPageShow({ persisted: true }, current, '2026-07-15T00:00:01Z', 'game'), false);
  assert.equal(shouldRefreshDailyOnPageShow({ persisted: false }, current, '2026-07-15T00:00:01Z', 'discovery'), false);

  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /function handlePageShow\(event, input = new Date\(\)\)/);
  assert.match(source, /shouldRefreshDailyOnPageShow\(event, state\.daily, input, state\.screen\)[\s\S]*refreshDailyChallenge\(input\)/);
});
