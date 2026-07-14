import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  angularDistance, buildInviteUrl, buildResultSharePayload, challengePlan, compareScores, comparisonSymbol,
  echoPlan, encodeInvite, initialScreenForInvite, isGameAttemptKey, parseInvite, scoreAttempt, scoreEchoRound, screenAfterPageShow
} from '../src/core.mjs';
import { catalog, getChallenge } from '../src/catalog.mjs';
import { missingTranslations, supportedLanguages, translate } from '../src/i18n.mjs';

test('orbit plan is deterministic and bounded', () => {
  const first = challengePlan(12345); const second = challengePlan(12345);
  assert.deepEqual(first, second); assert.equal(first.length, 12);
  assert.ok(first.every((stage) => stage.gateWidth >= 0.42 && stage.speed > 1));
});

test('echo plan is deterministic, bounded, and avoids immediate repeats', () => {
  const first = echoPlan(98765); const second = echoPlan(98765);
  assert.deepEqual(first, second); assert.equal(first.length, 8);
  assert.ok(first.every((sequence) => sequence.length >= 2 && sequence.length <= 6));
  assert.ok(first.flat().every((cell) => Number.isInteger(cell) && cell >= 0 && cell <= 8));
  assert.ok(first.every((sequence) => sequence.every((cell, index) => index === 0 || cell !== sequence[index - 1])));
});

test('catalog exposes two materially different live challenges', () => {
  assert.equal(catalog.length, 2);
  assert.deepEqual(catalog.map(({ id }) => id), ['orbit-lock', 'echo-grid']);
  assert.equal(getChallenge('orbit-lock').skill, 'timing');
  assert.equal(getChallenge('echo-grid').skill, 'memory');
  assert.equal(getChallenge('unknown'), null);
});

test('strict invite round-trips both challenges and keeps legacy v1 shape', () => {
  const orbit = encodeInvite({ seed: 4294967295, target: 4321 });
  assert.deepEqual(parseInvite(orbit), { ok: true, invite: { challengeId: 'orbit-lock', seed: 4294967295, target: 4321 } });
  const echo = encodeInvite({ challengeId: 'echo-grid', seed: 77, target: 900 });
  assert.deepEqual(parseInvite(echo), { ok: true, invite: { challengeId: 'echo-grid', seed: 77, target: 900 } });
  echo.set('t', '901'); assert.deepEqual(parseInvite(echo), { ok: false, reason: 'checksum' });
});

test('strict invite rejects extras, unknown challenges, malformed values, and out-of-range score', () => {
  const valid = encodeInvite({ seed: 7, target: 100 }); valid.set('lang', 'ar');
  assert.deepEqual(parseInvite(valid), { ok: false, reason: 'shape' });
  assert.deepEqual(parseInvite('v=1&c=unknown&s=1&t=10&ck=x'), { ok: false, reason: 'challenge' });
  assert.deepEqual(parseInvite('v=1&c=orbit-lock&s=-1&t=10&ck=x'), { ok: false, reason: 'format' });
  assert.deepEqual(parseInvite('v=1&c=orbit-lock&s=1&t=10000&ck=x'), { ok: false, reason: 'format' });
  assert.throws(() => encodeInvite({ challengeId: 'unknown', seed: 1, target: 1 }), /Unknown challenge/);
});

test('valid invitations boot to the direct invite surface and invalid ones recover to discovery', () => {
  const valid = parseInvite(encodeInvite({ challengeId: 'echo-grid', seed: 18, target: 750 }));
  assert.equal(initialScreenForInvite(valid.invite), 'instructions');
  const invalid = parseInvite('v=1&c=echo-grid&s=i&t=751&ck=wrong');
  assert.equal(invalid.ok, false);
  assert.equal(initialScreenForInvite(null), 'discovery');
});

test('invite URL is language-independent and clears fragments', () => {
  const url = buildInviteUrl('https://example.com/play?lang=ar#result', { challengeId: 'echo-grid', seed: 8, target: 250 });
  const parsed = new URL(url); assert.equal(parsed.hash, ''); assert.equal(parsed.searchParams.has('lang'), false);
  assert.equal(parseInvite(parsed.search).invite.challengeId, 'echo-grid');
});

test('localized native and clipboard invitation payloads include challenge, score, CTA, and strict URL', () => {
  for (const language of supportedLanguages) {
    const text = translate(language, 'challengeShareText', { name: 'Orbit X', score: 321 });
    const payload = buildResultSharePayload({ title: 'Orbit X', text, url: 'https://example.com/?v=1&c=orbit-lock&s=1&t=321&ck=abc' });
    assert.equal(payload.shareData.text, text);
    assert.match(payload.shareData.text, /Orbit X/);
    assert.match(payload.shareData.text, /321/);
    assert.equal(payload.clipboardText, `${text}\n${payload.shareData.url}`);
  }
});

test('rematch links keep the same challenge and deterministic route while using the new score', () => {
  for (const challengeId of ['orbit-lock', 'echo-grid']) {
    const url = buildInviteUrl('https://example.com/', { challengeId, seed: 4242, target: 987 });
    assert.deepEqual(parseInvite(new URL(url).search).invite, { challengeId, seed: 4242, target: 987 });
  }
});

test('score comparison handles win, loss, and tie with non-color symbols', () => {
  assert.deepEqual(compareScores(500, 400), { outcome: 'win', difference: 100 });
  assert.deepEqual(compareScores(400, 500), { outcome: 'lose', difference: 100 });
  assert.deepEqual(compareScores(500, 500), { outcome: 'tie', difference: 0 });
  assert.equal(comparisonSymbol('win'), '↑'); assert.equal(comparisonSymbol('lose'), '↓'); assert.equal(comparisonSymbol('tie'), '=');
});

test('both scoring models remain bounded', () => {
  assert.ok(angularDistance(0.05, Math.PI * 2 - 0.05) < 0.11);
  const orbit = scoreAttempt({ distance: 0, gateWidth: 0.5, combo: 20, round: 20 });
  assert.equal(orbit.precision, 100); assert.ok(orbit.points <= 900);
  assert.equal(scoreEchoRound({ length: 99, combo: 99, round: 99 }), 900);
});

test('all required languages have the same message keys and localized social copy', () => {
  assert.deepEqual(supportedLanguages, ['ar', 'en', 'tr']); assert.deepEqual(missingTranslations(), []);
  for (const language of supportedLanguages) {
    assert.ok(translate(language, 'echoName').length > 2);
    assert.ok(translate(language, 'challengeCard', { name: 'X' }).includes('X'));
    assert.ok(translate(language, 'rematchShareText', { name: 'X', score: 10 }).includes('10'));
    assert.ok(translate(language, 'comparisonAnnouncement', { outcome: 'O', target: 1, score: 2, difference: 1 }).includes('2'));
  }
});

test('direct invite entry and compact settings remain accessible in the real entry point', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<input id="motion-toggle" type="checkbox" aria-label="Reduce effects" data-i18n-aria="reduceMotion">/);
  assert.match(html, /id="invite-catalog-button"/);
  assert.match(html, /id="challenger-score"/); assert.match(html, /id="player-score"/); assert.match(html, /id="difference-text"/);
  assert.equal((html.match(/data-challenge-id=/g) || []).length, 2);
  assert.equal((html.match(/data-cell=/g) || []).length, 9);
});

test('game keyboard attempts are consumed only from the focused canvas target', () => {
  const canvas = {};
  assert.equal(isGameAttemptKey({ code: 'Space', target: canvas }, canvas), true);
  assert.equal(isGameAttemptKey({ code: 'Enter', target: canvas }, canvas), true);
  assert.equal(isGameAttemptKey({ code: 'Space', target: { tagName: 'SELECT' } }, canvas), false);
  assert.equal(isGameAttemptKey({ code: 'Enter', target: { tagName: 'INPUT' } }, canvas), false);
  assert.equal(isGameAttemptKey({ code: 'KeyA', target: canvas }, canvas), false);
});

test('app routes invites directly, copies full invitation content, and hosts both games', async () => {
  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /setScreen\(initialScreenForInvite\(state\.invite\)\)/);
  assert.match(source, /navigator\.clipboard\.writeText\(payload\.clipboardText\)/);
  assert.match(source, /window\.prompt\(t\('shareUnavailable'\), payload\.clipboardText\)/);
  assert.match(source, /new OrbitLockGame/); assert.match(source, /new EchoGridGame/);
  assert.doesNotMatch(source, /GameEngine|PluginRegistry/);
});

test('persisted back-forward cache restore returns an interrupted run to instructions', async () => {
  assert.equal(screenAfterPageShow({ persisted: true }, 'game'), 'instructions');
  assert.equal(screenAfterPageShow({ persisted: false }, 'game'), 'game');
  assert.equal(screenAfterPageShow({ persisted: true }, 'result'), 'result');
  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /window\.addEventListener\('pagehide', destroyGame\);/);
  assert.match(source, /window\.addEventListener\('pageshow', handlePageShow\);/);
  assert.doesNotMatch(source, /pagehide[^\n]*once/);
});
