import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRiftRun, generateRiftZone, RIFT_RELAY_ID, scoreRiftAction } from '../src/rift-relay-model.mjs';
import { buildInviteUrl, CHALLENGE_IDS, dailyChallengeFor, parseInvite } from '../src/core.mjs';
import { catalog } from '../src/catalog.mjs';

test('Rift Relay is the only shipped challenge', () => {
  assert.equal(RIFT_RELAY_ID, 'rift-relay');
  assert.deepEqual(CHALLENGE_IDS, ['rift-relay']);
  assert.equal(catalog.length, 1);
  assert.equal(catalog[0].id, 'rift-relay');
});

test('same seed produces the same route', () => {
  assert.deepEqual(generateRiftRun(123456, 18), generateRiftRun(123456, 18));
  assert.notDeepEqual(generateRiftRun(123456, 18), generateRiftRun(654321, 18));
});

test('zones progress across movement, puzzles, pressure and recovery', () => {
  const zones = generateRiftRun(42, 12);
  assert.ok(zones.some((zone) => zone.type === 'recovery'));
  assert.ok(zones.some((zone) => zone.type === 'surge'));
  assert.ok(zones.some((zone) => zone.segments.some((segment) => segment.kind === 'puzzle')));
  assert.ok(zones.every((zone) => zone.segments.length >= 4));
  assert.deepEqual(generateRiftZone(42, 2, 3), generateRiftZone(42, 2, 3));
});

test('score rewards accuracy, streak, risk and puzzle mastery', () => {
  const basic = scoreRiftAction({ distance: 10, accuracy: 0.5, streak: 0, risk: 1, puzzle: false });
  const mastered = scoreRiftAction({ distance: 10, accuracy: 1, streak: 8, risk: 1.5, puzzle: true });
  assert.ok(mastered > basic);
});

test('friend links only accept Rift Relay and preserve seed and target', () => {
  const url = buildInviteUrl('https://example.test/game', { seed: 987, target: 4321 });
  const parsed = parseInvite(new URL(url).search);
  assert.deepEqual(parsed, { ok: true, invite: { challengeId: 'rift-relay', seed: 987, target: 4321 } });
  assert.equal(parseInvite('?v=2&c=unknown&s=1&t=2&ck=x').ok, false);
});

test('daily challenge always resolves to the flagship with a stable seed', () => {
  const first = dailyChallengeFor(new Date('2026-07-15T00:00:00Z'));
  const second = dailyChallengeFor(new Date('2026-07-15T20:00:00Z'));
  assert.deepEqual(first, second);
  assert.equal(first.challengeId, 'rift-relay');
});
