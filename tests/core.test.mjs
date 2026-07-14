import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  angularDistance, buildInviteUrl, buildResultSharePayload, challengePlan, compareScores, comparisonSymbol,
  dailyChallengeFor, DAILY_STORAGE_KEY, echoPlan, encodeInvite, initialScreenForInvite, isGameAttemptKey,
  lanePlan, parseDailyBest, parseInvite, readDailyBest, scoreAttempt, scoreEchoRound, scoreLaneRound,
  screenAfterPageShow, shouldRefreshDaily, updateDailyBest, utcDateKey, writeDailyBest
} from '../src/core.mjs';
import { catalog, getChallenge } from '../src/catalog.mjs';
import { missingTranslations, supportedLanguages, translate } from '../src/i18n.mjs';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    value(key) { return values.get(key); }
  };
}

test('orbit plan is deterministic and bounded', () => {
  const first = challengePlan(12345);
  assert.deepEqual(first, challengePlan(12345));
  assert.equal(first.length, 12);
  assert.ok(first.every((stage) => stage.gateWidth >= 0.42 && stage.speed > 1));
});

test('echo plan is deterministic, bounded, and avoids immediate repeats', () => {
  const first = echoPlan(98765);
  assert.deepEqual(first, echoPlan(98765));
  assert.equal(first.length, 8);
  assert.ok(first.every((sequence) => sequence.length >= 2 && sequence.length <= 6));
  assert.ok(first.flat().every((cell) => Number.isInteger(cell) && cell >= 0 && cell <= 8));
  assert.ok(first.every((sequence) => sequence.every((cell, index) => index === 0 || cell !== sequence[index - 1])));
});

test('lane plan is deterministic, bounded, and never repeats a lane three times', () => {
  const first = lanePlan(24680);
  assert.deepEqual(first, lanePlan(24680));
  assert.equal(first.length, 12);
  assert.ok(first.every(({ lane, windowMs, leadMs }) => lane >= 0 && lane <= 2 && windowMs >= 980 && leadMs >= 260));
  for (let index = 2; index < first.length; index += 1) {
    assert.notEqual(first[index].lane === first[index - 1].lane && first[index].lane === first[index - 2].lane, true);
  }
});

test('catalog exposes three materially different live challenges', () => {
  assert.equal(catalog.length, 3);
  assert.deepEqual(catalog.map(({ id }) => id), ['orbit-lock', 'echo-grid', 'lane-spark']);
  assert.deepEqual(catalog.map(({ skill }) => skill), ['timing', 'memory', 'reaction']);
  assert.equal(getChallenge('unknown'), null);
});

test('UTC date keys are canonical and independent of local offsets', () => {
  assert.equal(utcDateKey(new Date('2026-07-14T00:00:00.000Z')), '2026-07-14');
  assert.equal(utcDateKey('2026-07-13T21:30:00-03:00'), '2026-07-14');
  assert.equal(utcDateKey('2026-12-31T23:59:59.999Z'), '2026-12-31');
  assert.throws(() => utcDateKey('not-a-date'), /Invalid date/);
});

test('daily route is deterministic and injected dates prove all three challenges', () => {
  const lane = dailyChallengeFor('2026-07-01T12:00:00Z');
  const orbit = dailyChallengeFor('2026-07-02T12:00:00Z');
  const echo = dailyChallengeFor('2026-07-03T12:00:00Z');
  assert.equal(lane.challengeId, 'lane-spark');
  assert.equal(orbit.challengeId, 'orbit-lock');
  assert.equal(echo.challengeId, 'echo-grid');
  assert.deepEqual(lane, dailyChallengeFor('2026-07-01T23:59:59Z'));
  assert.equal(new Set([lane.seed, orbit.seed, echo.seed]).size, 3);
});

test('daily rollover refreshes only on a safe discovery return', () => {
  const current = dailyChallengeFor('2026-07-14T10:00:00Z');
  assert.equal(shouldRefreshDaily(current, '2026-07-14T23:59:59Z', 'discovery'), false);
  assert.equal(shouldRefreshDaily(current, '2026-07-15T00:00:01Z', 'game'), false);
  assert.equal(shouldRefreshDaily(current, '2026-07-15T00:00:01Z', 'result'), false);
  assert.equal(shouldRefreshDaily(current, '2026-07-15T00:00:01Z', 'discovery'), true);
});

test('daily best accepts only the exact current route and bounded score', () => {
  const daily = dailyChallengeFor('2026-07-14T12:00:00Z');
  const valid = { ...daily, best: 3210 };
  assert.deepEqual(parseDailyBest(JSON.stringify(valid), daily), valid);
  assert.equal(parseDailyBest('{broken', daily), null);
  assert.equal(parseDailyBest({ ...valid, extra: true }, daily), null);
  assert.equal(parseDailyBest({ ...valid, dateKey: '2026-07-13' }, daily), null);
  assert.equal(parseDailyBest({ ...valid, challengeId: 'unknown' }, daily), null);
  assert.equal(parseDailyBest({ ...valid, seed: daily.seed + 1 }, daily), null);
  assert.equal(parseDailyBest({ ...valid, best: 10000 }, daily), null);
});

test('daily best updates only upward and keeps the exact route', () => {
  const daily = dailyChallengeFor('2026-07-14T12:00:00Z');
  const first = updateDailyBest(null, daily, 600);
  assert.equal(first.isNewBest, true);
  const lower = updateDailyBest(first.record, daily, 500);
  assert.equal(lower.isNewBest, false);
  assert.equal(lower.record.best, 600);
  const higher = updateDailyBest(lower.record, daily, 900);
  assert.equal(higher.isNewBest, true);
  assert.equal(higher.record.best, 900);
  assert.deepEqual({ dateKey: higher.record.dateKey, challengeId: higher.record.challengeId, seed: higher.record.seed }, daily);
});

test('corrupt or blocked local best never prevents play', () => {
  const daily = dailyChallengeFor('2026-07-14T12:00:00Z');
  const corrupt = memoryStorage({ [DAILY_STORAGE_KEY]: JSON.stringify({ ...daily, best: 120, extra: 'x' }) });
  assert.deepEqual(readDailyBest(corrupt, daily), { record: null, available: true, discarded: true });
  assert.equal(corrupt.value(DAILY_STORAGE_KEY), undefined);
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(readDailyBest(blocked, daily), { record: null, available: false, discarded: false });
  assert.equal(writeDailyBest(blocked, updateDailyBest(null, daily, 77).record, daily), false);
});

test('daily persistence stores only the approved four fields', () => {
  const daily = dailyChallengeFor('2026-07-14T12:00:00Z');
  const storage = memoryStorage();
  const record = updateDailyBest(null, daily, 456).record;
  assert.equal(writeDailyBest(storage, record, daily), true);
  assert.deepEqual(Object.keys(JSON.parse(storage.value(DAILY_STORAGE_KEY))).sort(), ['best', 'challengeId', 'dateKey', 'seed']);
});

test('strict invite round-trips all challenges and keeps legacy v1 shape', () => {
  for (const challengeId of ['orbit-lock', 'echo-grid', 'lane-spark']) {
    const encoded = encodeInvite({ challengeId, seed: 77, target: 900 });
    assert.deepEqual(parseInvite(encoded), { ok: true, invite: { challengeId, seed: 77, target: 900 } });
    assert.deepEqual([...encoded.keys()].sort(), ['c', 'ck', 's', 't', 'v']);
  }
  const legacy = encodeInvite({ seed: 4294967295, target: 4321 });
  assert.deepEqual(parseInvite(legacy).invite, { challengeId: 'orbit-lock', seed: 4294967295, target: 4321 });
});

test('strict invite rejects extras, unknown challenges, malformed values, and tampering', () => {
  const valid = encodeInvite({ challengeId: 'lane-spark', seed: 7, target: 100 });
  valid.set('lang', 'ar');
  assert.deepEqual(parseInvite(valid), { ok: false, reason: 'shape' });
  assert.deepEqual(parseInvite('v=1&c=unknown&s=1&t=10&ck=x'), { ok: false, reason: 'challenge' });
  assert.deepEqual(parseInvite('v=1&c=orbit-lock&s=-1&t=10&ck=x'), { ok: false, reason: 'format' });
  const tampered = encodeInvite({ challengeId: 'lane-spark', seed: 9, target: 500 });
  tampered.set('t', '501');
  assert.deepEqual(parseInvite(tampered), { ok: false, reason: 'checksum' });
});

test('valid invitations take precedence at boot and invalid ones recover to discovery', () => {
  const valid = parseInvite(encodeInvite({ challengeId: 'lane-spark', seed: 18, target: 750 }));
  assert.equal(initialScreenForInvite(valid.invite), 'instructions');
  assert.equal(initialScreenForInvite(null), 'discovery');
});

test('invite URL is language-independent and clears fragments', () => {
  const url = buildInviteUrl('https://example.com/play?lang=ar#result', {
    challengeId: 'lane-spark', seed: 8, target: 250
  });
  const parsed = new URL(url);
  assert.equal(parsed.hash, '');
  assert.equal(parsed.searchParams.has('lang'), false);
  assert.equal(parseInvite(parsed.search).invite.challengeId, 'lane-spark');
});

test('daily score shares as a strict non-expiring same-route invitation', () => {
  const daily = dailyChallengeFor('2026-07-01T12:00:00Z');
  const url = buildInviteUrl('https://example.com/', { challengeId: daily.challengeId, seed: daily.seed, target: 812 });
  assert.deepEqual(parseInvite(new URL(url).search).invite, {
    challengeId: daily.challengeId, seed: daily.seed, target: 812
  });
});

test('localized native and clipboard payloads include challenge, score, CTA, and strict URL', () => {
  for (const language of supportedLanguages) {
    const text = translate(language, 'challengeShareText', { name: 'Lane X', score: 321 });
    const payload = buildResultSharePayload({
      title: 'Lane X', text, url: 'https://example.com/?v=1&c=lane-spark&s=1&t=321&ck=abc'
    });
    assert.match(payload.shareData.text, /Lane X/);
    assert.match(payload.shareData.text, /321/);
    assert.equal(payload.clipboardText, `${text}\n${payload.shareData.url}`);
  }
});

test('rematch links keep each challenge and deterministic route while using the new score', () => {
  for (const challengeId of ['orbit-lock', 'echo-grid', 'lane-spark']) {
    const url = buildInviteUrl('https://example.com/', { challengeId, seed: 4242, target: 987 });
    assert.deepEqual(parseInvite(new URL(url).search).invite, { challengeId, seed: 4242, target: 987 });
  }
});

test('score comparison handles win, loss, and tie with non-color symbols', () => {
  assert.deepEqual(compareScores(500, 400), { outcome: 'win', difference: 100 });
  assert.deepEqual(compareScores(400, 500), { outcome: 'lose', difference: 100 });
  assert.deepEqual(compareScores(500, 500), { outcome: 'tie', difference: 0 });
  assert.equal(comparisonSymbol('win'), '↑');
  assert.equal(comparisonSymbol('lose'), '↓');
  assert.equal(comparisonSymbol('tie'), '=');
});

test('all three scoring models remain bounded', () => {
  assert.ok(angularDistance(0.05, Math.PI * 2 - 0.05) < 0.11);
  assert.ok(scoreAttempt({ distance: 0, gateWidth: 0.5, combo: 20, round: 20 }).points <= 900);
  assert.equal(scoreEchoRound({ length: 99, combo: 99, round: 99 }), 900);
  const fast = scoreLaneRound({ responseMs: 0, windowMs: 1000, combo: 99, round: 99 });
  const slow = scoreLaneRound({ responseMs: 1000, windowMs: 1000, combo: 1, round: 0 });
  assert.ok(fast.points <= 800);
  assert.ok(fast.points > slow.points);
  assert.equal(fast.speed, 100);
});

test('all required languages have matching keys and localized lane states', () => {
  assert.deepEqual(supportedLanguages, ['ar', 'en', 'tr']);
  assert.deepEqual(missingTranslations(), []);
  for (const language of supportedLanguages) {
    assert.ok(translate(language, 'laneName').length > 2);
    assert.ok(translate(language, 'laneHowTo').length > 8);
    assert.ok(translate(language, 'laneCorrect', { points: 10 }).includes('10'));
    assert.ok(translate(language, 'dailyPlayLabel', { name: 'X' }).includes('X'));
    assert.ok(translate(language, 'rematchShareText', { name: 'X', score: 10 }).includes('10'));
  }
});

test('real entry point exposes three compact choices and accessible lane controls', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<input id="motion-toggle" type="checkbox" aria-label="Reduce effects" data-i18n-aria="reduceMotion">/);
  assert.match(html, /id="daily-entry"[^>]*aria-labelledby="daily-title"/);
  assert.match(html, /id="lane-board"[^>]*role="group"/);
  assert.equal((html.match(/data-challenge-id=/g) || []).length, 3);
  assert.equal((html.match(/data-cell=/g) || []).length, 9);
  assert.equal((html.match(/data-lane="/g) || []).length, 3);
  assert.match(html, /data-lane="0" aria-keyshortcuts="1"/);
  assert.match(html, /id="challenger-score"/);
  assert.match(html, /id="player-score"/);
});

test('game keyboard attempts are consumed only from the focused canvas target', () => {
  const canvas = {};
  assert.equal(isGameAttemptKey({ code: 'Space', target: canvas }, canvas), true);
  assert.equal(isGameAttemptKey({ code: 'Enter', target: canvas }, canvas), true);
  assert.equal(isGameAttemptKey({ code: 'Space', target: { tagName: 'SELECT' } }, canvas), false);
  assert.equal(isGameAttemptKey({ code: 'KeyA', target: canvas }, canvas), false);
});

test('app hosts all three games without introducing a generic engine', async () => {
  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /parseLocationInvite\(\); bindEvents\(\); applyLanguage\(\)/);
  assert.match(source, /setScreen\(initialScreenForInvite\(state\.invite\)\)/);
  assert.match(source, /elements\.dailyStartButton\.addEventListener\('click', beginDailyRun\)/);
  assert.match(source, /new OrbitLockGame/);
  assert.match(source, /new EchoGridGame/);
  assert.match(source, /new LaneSparkGame/);
  assert.match(source, /navigator\.clipboard\.writeText\(payload\.clipboardText\)/);
  assert.doesNotMatch(source, /setInterval|GameEngine|PluginRegistry|CalendarService|RetentionEngine/);
});

test('lane game owns bounded timers, frame, listeners, and teardown', async () => {
  const source = await readFile(new URL('../src/lane-game.mjs', import.meta.url), 'utf8');
  assert.match(source, /this\.abortController = new AbortController\(\)/);
  assert.match(source, /this\.timers = new Set\(\)/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /cancelAnimationFrame/);
  assert.match(source, /this\.abortController\?\.abort\(\)/);
  assert.match(source, /this\.timers\.forEach\(clearTimeout\)/);
  assert.doesNotMatch(source, /setInterval|WebGL|DeviceMotion|AudioContext/);
});

test('persisted back-forward cache restore returns an interrupted run without changing route', async () => {
  assert.equal(screenAfterPageShow({ persisted: true }, 'game'), 'instructions');
  assert.equal(screenAfterPageShow({ persisted: false }, 'game'), 'game');
  assert.equal(screenAfterPageShow({ persisted: true }, 'result'), 'result');
  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /window\.addEventListener\('pagehide', destroyGame\);/);
  assert.match(source, /window\.addEventListener\('pageshow', handlePageShow\);/);
  assert.doesNotMatch(source, /pagehide[^\n]*once/);
});
