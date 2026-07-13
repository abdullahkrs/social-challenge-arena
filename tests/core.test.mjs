import test from 'node:test';
import assert from 'node:assert/strict';
import {
  angularDistance,
  buildInviteUrl,
  challengePlan,
  compareScores,
  encodeInvite,
  parseInvite,
  scoreAttempt
} from '../src/core.mjs';
import { missingTranslations, supportedLanguages, translate } from '../src/i18n.mjs';

test('challenge plan is deterministic and bounded', () => {
  const first = challengePlan(12345);
  const second = challengePlan(12345);
  assert.deepEqual(first, second);
  assert.equal(first.length, 12);
  assert.ok(first.every((stage) => stage.gateWidth >= 0.42 && stage.speed > 1));
});

test('strict invite round-trips and rejects mutation', () => {
  const params = encodeInvite({ seed: 4294967295, target: 4321 });
  assert.deepEqual(parseInvite(params), {
    ok: true,
    invite: { challengeId: 'orbit-lock', seed: 4294967295, target: 4321 }
  });
  params.set('t', '4322');
  assert.deepEqual(parseInvite(params), { ok: false, reason: 'checksum' });
});

test('strict invite rejects extras, malformed values, and out-of-range score', () => {
  const valid = encodeInvite({ seed: 7, target: 100 });
  valid.set('lang', 'ar');
  assert.deepEqual(parseInvite(valid), { ok: false, reason: 'shape' });
  assert.deepEqual(parseInvite('v=1&c=orbit-lock&s=-1&t=10&ck=x'), { ok: false, reason: 'format' });
  assert.deepEqual(parseInvite('v=1&c=orbit-lock&s=1&t=10000&ck=x'), { ok: false, reason: 'format' });
});

test('invite URL is language-independent and clears fragments', () => {
  const url = buildInviteUrl('https://example.com/play?lang=ar#result', { seed: 8, target: 250 });
  const parsed = new URL(url);
  assert.equal(parsed.hash, '');
  assert.equal(parsed.searchParams.has('lang'), false);
  assert.equal(parseInvite(parsed.search).ok, true);
});

test('score comparison handles win, loss, and tie', () => {
  assert.deepEqual(compareScores(500, 400), { outcome: 'win', difference: 100 });
  assert.deepEqual(compareScores(400, 500), { outcome: 'lose', difference: 100 });
  assert.deepEqual(compareScores(500, 500), { outcome: 'tie', difference: 0 });
});

test('angular distance wraps and scoring remains bounded', () => {
  assert.ok(angularDistance(0.05, Math.PI * 2 - 0.05) < 0.11);
  const score = scoreAttempt({ distance: 0, gateWidth: 0.5, combo: 20, round: 20 });
  assert.equal(score.precision, 100);
  assert.ok(score.points <= 900);
});

test('all required languages have the same message keys', () => {
  assert.deepEqual(supportedLanguages, ['ar', 'en', 'tr']);
  assert.deepEqual(missingTranslations(), []);
  assert.equal(translate('ar', 'beatScore', { score: 99 }).includes('99'), true);
  assert.equal(translate('tr', 'beatScore', { score: 99 }).includes('99'), true);
});
