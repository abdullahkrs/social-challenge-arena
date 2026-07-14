import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  angularDistance, buildInviteUrl, buildResultSharePayload, challengePlan, compareScores, comparisonSymbol,
  dailyChallengeFor, DAILY_EXPANSION_DATE_KEY, DAILY_STORAGE_KEY, echoPlan, encodeInvite, initialScreenForInvite, isGameAttemptKey,
  lumenPlan, mirrorPlan, parseDailyBest, parseInvite, readDailyBest, reflectPattern, scoreAttempt, scoreEchoRound,
  scoreLumenRound, scoreMirrorRound, screenAfterPageShow, shouldRefreshDaily, updateDailyBest, utcDateKey, writeDailyBest
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

test('lumen route is deterministic, bounded, and avoids triple lane repeats', () => {
  const first = lumenPlan(24680); const second = lumenPlan(24680);
  assert.deepEqual(first, second); assert.equal(first.length, 18);
  assert.ok(first.every(({ lane, deadlineMs, drift }) => Number.isInteger(lane) && lane >= 0 && lane <= 2 && deadlineMs >= 920 && deadlineMs <= 1780 && Math.abs(drift) === 1));
  assert.ok(first.every(({ lane }, index) => index < 2 || lane !== first[index - 1].lane || lane !== first[index - 2].lane));
});

test('mirror route is deterministic with one exact reflected option per round', () => {
  const first = mirrorPlan(13579); const second = mirrorPlan(13579);
  assert.deepEqual(first, second); assert.equal(first.length, 10);
  for (const stage of first) {
    assert.equal(stage.source.length, 12);
    assert.equal(stage.options.length, 3);
    assert.ok(stage.correctIndex >= 0 && stage.correctIndex <= 2);
    assert.deepEqual(stage.options[stage.correctIndex], reflectPattern(stage.source, 3));
    assert.equal(new Set(stage.options.map((option) => option.join(''))).size, 3);
    assert.ok(stage.deadlineMs >= 2200 && stage.deadlineMs <= 3760);
  }
  assert.throws(() => reflectPattern([1, 0, 1], 2), /Invalid reflection pattern/);
});

test('catalog exposes four materially different live challenges', () => {
  assert.equal(catalog.length, 4);
  assert.deepEqual(catalog.map(({ id }) => id), ['orbit-lock', 'echo-grid', 'lumen-lanes', 'mirror-fuse']);
  assert.equal(getChallenge('orbit-lock').skill, 'timing');
  assert.equal(getChallenge('echo-grid').skill, 'memory');
  assert.equal(getChallenge('lumen-lanes').skill, 'reaction');
  assert.equal(getChallenge('mirror-fuse').skill, 'spatial');
  assert.equal(getChallenge('unknown'), null);
});

test('UTC date keys are canonical and independent of local offsets', () => {
  assert.equal(utcDateKey(new Date('2026-07-14T00:00:00.000Z')), '2026-07-14');
  assert.equal(utcDateKey('2026-07-13T21:30:00-03:00'), '2026-07-14');
  assert.equal(utcDateKey('2026-12-31T23:59:59.999Z'), '2026-12-31');
  assert.throws(() => utcDateKey('not-a-date'), /Invalid date/);
});

test('daily expansion preserves exact legacy assignments through July and starts on the documented boundary', () => {
  assert.equal(DAILY_EXPANSION_DATE_KEY, '2026-08-01');
  assert.deepEqual(dailyChallengeFor('2026-07-01T12:00:00Z'), { dateKey: '2026-07-01', challengeId: 'lumen-lanes', seed: 1947502761 });
  assert.deepEqual(dailyChallengeFor('2026-07-02T12:00:00Z'), { dateKey: '2026-07-02', challengeId: 'orbit-lock', seed: 2781247653 });
  assert.deepEqual(dailyChallengeFor('2026-07-03T12:00:00Z'), { dateKey: '2026-07-03', challengeId: 'echo-grid', seed: 3295002044 });
  assert.deepEqual(dailyChallengeFor('2026-07-31T23:59:59Z'), { dateKey: '2026-07-31', challengeId: 'echo-grid', seed: 2381426445 });
});

test('future daily fixtures deterministically select all four challenge IDs', () => {
  const fixtures = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04'].map((dateKey) => dailyChallengeFor(`${dateKey}T12:00:00Z`));
  assert.deepEqual(fixtures.map(({ challengeId }) => challengeId), ['echo-grid', 'orbit-lock', 'mirror-fuse', 'lumen-lanes']);
  assert.equal(new Set(fixtures.map(({ seed }) => seed)).size, 4);
  assert.ok(fixtures.every(({ seed }) => Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff));
  assert.deepEqual(fixtures[2], dailyChallengeFor('2026-08-03T23:59:59Z'));
});

test('daily rollover refreshes only on a safe discovery return', () => {
  const current = dailyChallengeFor('2026-07-14T10:00:00Z');
  assert.equal(shouldRefreshDaily(current, '2026-07-14T23:59:59Z', 'discovery'), false);
  assert.equal(shouldRefreshDaily(current, '2026-07-15T00:00:01Z', 'game'), false);
  assert.equal(shouldRefreshDaily(current, '2026-07-15T00:00:01Z', 'result'), false);
  assert.equal(shouldRefreshDaily(current, '2026-07-15T00:00:01Z', 'discovery'), true);
});

test('daily best accepts only the exact current route and bounded score', () => {
  const daily = dailyChallengeFor('2026-08-03T12:00:00Z');
  const valid = { ...daily, best: 3210 };
  assert.deepEqual(parseDailyBest(JSON.stringify(valid), daily), valid);
  assert.equal(parseDailyBest('{broken', daily), null);
  assert.equal(parseDailyBest({ ...valid, extra: true }, daily), null);
  assert.equal(parseDailyBest({ ...valid, dateKey: '2026-08-02' }, daily), null);
  assert.equal(parseDailyBest({ ...valid, challengeId: 'unknown' }, daily), null);
  assert.equal(parseDailyBest({ ...valid, seed: daily.seed + 1 }, daily), null);
  assert.equal(parseDailyBest({ ...valid, best: 10000 }, daily), null);
});

test('daily best updates only upward and keeps the exact route', () => {
  const daily = dailyChallengeFor('2026-08-03T12:00:00Z');
  const first = updateDailyBest(null, daily, 600);
  assert.equal(first.isNewBest, true); assert.equal(first.previousBest, null); assert.equal(first.record.best, 600);
  const lower = updateDailyBest(first.record, daily, 500);
  assert.equal(lower.isNewBest, false); assert.equal(lower.previousBest, 600); assert.equal(lower.record.best, 600);
  const higher = updateDailyBest(lower.record, daily, 900);
  assert.equal(higher.isNewBest, true); assert.equal(higher.record.best, 900);
  assert.deepEqual({ dateKey: higher.record.dateKey, challengeId: higher.record.challengeId, seed: higher.record.seed }, daily);
});

test('corrupt or stale local best is discarded and storage failure stays playable', () => {
  const daily = dailyChallengeFor('2026-08-03T12:00:00Z');
  const corrupt = memoryStorage({ [DAILY_STORAGE_KEY]: JSON.stringify({ ...daily, best: 120, extra: 'x' }) });
  assert.deepEqual(readDailyBest(corrupt, daily), { record: null, available: true, discarded: true });
  assert.equal(corrupt.value(DAILY_STORAGE_KEY), undefined);
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(readDailyBest(blocked, daily), { record: null, available: false, discarded: false });
  const session = updateDailyBest(null, daily, 77).record;
  assert.equal(writeDailyBest(blocked, session, daily), false);
  assert.equal(session.best, 77);
});

test('daily best persistence stores only date challenge seed and best', () => {
  const daily = dailyChallengeFor('2026-08-03T12:00:00Z');
  const storage = memoryStorage();
  const record = updateDailyBest(null, daily, 456).record;
  assert.equal(writeDailyBest(storage, record, daily), true);
  assert.deepEqual(Object.keys(JSON.parse(storage.value(DAILY_STORAGE_KEY))).sort(), ['best', 'challengeId', 'dateKey', 'seed']);
  assert.deepEqual(readDailyBest(storage, daily).record, record);
});

test('strict invite round-trips all challenges and keeps the legacy v1 shape', () => {
  const orbit = encodeInvite({ seed: 4294967295, target: 4321 });
  assert.deepEqual(parseInvite(orbit), { ok: true, invite: { challengeId: 'orbit-lock', seed: 4294967295, target: 4321 } });
  for (const challengeId of ['echo-grid', 'lumen-lanes', 'mirror-fuse']) {
    const invite = encodeInvite({ challengeId, seed: 77, target: 900 });
    assert.deepEqual(parseInvite(invite), { ok: true, invite: { challengeId, seed: 77, target: 900 } });
    invite.set('t', '901'); assert.deepEqual(parseInvite(invite), { ok: false, reason: 'checksum' });
  }
});

test('strict invite rejects extras unknown challenges malformed values and out-of-range score', () => {
  const valid = encodeInvite({ seed: 7, target: 100 }); valid.set('lang', 'ar');
  assert.deepEqual(parseInvite(valid), { ok: false, reason: 'shape' });
  assert.deepEqual(parseInvite('v=1&c=unknown&s=1&t=10&ck=x'), { ok: false, reason: 'challenge' });
  assert.deepEqual(parseInvite('v=1&c=orbit-lock&s=-1&t=10&ck=x'), { ok: false, reason: 'format' });
  assert.deepEqual(parseInvite('v=1&c=orbit-lock&s=1&t=10000&ck=x'), { ok: false, reason: 'format' });
  assert.throws(() => encodeInvite({ challengeId: 'unknown', seed: 1, target: 1 }), /Unknown challenge/);
});

test('valid fourth-challenge invitation takes precedence and invalid links recover', () => {
  const valid = parseInvite(encodeInvite({ challengeId: 'mirror-fuse', seed: 18, target: 750 }));
  assert.equal(initialScreenForInvite(valid.invite), 'instructions');
  assert.equal(valid.invite.challengeId, 'mirror-fuse');
  const invalid = parseInvite('v=1&c=mirror-fuse&s=i&t=751&ck=wrong');
  assert.equal(invalid.ok, false);
  assert.equal(initialScreenForInvite(null), 'discovery');
});

test('invite URL is language-independent and clears fragments', () => {
  const url = buildInviteUrl('https://example.com/play?lang=ar#result', { challengeId: 'mirror-fuse', seed: 8, target: 250 });
  const parsed = new URL(url); assert.equal(parsed.hash, ''); assert.equal(parsed.searchParams.has('lang'), false);
  assert.equal(parseInvite(parsed.search).invite.challengeId, 'mirror-fuse');
});

test('daily score shares as a strict non-expiring same-route invitation', () => {
  const daily = dailyChallengeFor('2026-08-03T12:00:00Z');
  const url = buildInviteUrl('https://example.com/', { challengeId: daily.challengeId, seed: daily.seed, target: 812 });
  assert.deepEqual(parseInvite(new URL(url).search).invite, { challengeId: daily.challengeId, seed: daily.seed, target: 812 });
  assert.equal(daily.challengeId, 'mirror-fuse');
});

test('localized native and clipboard invitation payloads include challenge score CTA and strict URL', () => {
  for (const language of supportedLanguages) {
    const text = translate(language, 'challengeShareText', { name: 'Mirror X', score: 321 });
    const payload = buildResultSharePayload({ title: 'Mirror X', text, url: 'https://example.com/?v=1&c=mirror-fuse&s=1&t=321&ck=abc' });
    assert.equal(payload.shareData.text, text);
    assert.match(payload.shareData.text, /Mirror X/);
    assert.match(payload.shareData.text, /321/);
    assert.equal(payload.clipboardText, `${text}\n${payload.shareData.url}`);
  }
});

test('rematch links keep each challenge and deterministic route while using the new score', () => {
  for (const challengeId of ['orbit-lock', 'echo-grid', 'lumen-lanes', 'mirror-fuse']) {
    const url = buildInviteUrl('https://example.com/', { challengeId, seed: 4242, target: 987 });
    assert.deepEqual(parseInvite(new URL(url).search).invite, { challengeId, seed: 4242, target: 987 });
  }
});

test('score comparison handles win loss and tie with non-color symbols', () => {
  assert.deepEqual(compareScores(500, 400), { outcome: 'win', difference: 100 });
  assert.deepEqual(compareScores(400, 500), { outcome: 'lose', difference: 100 });
  assert.deepEqual(compareScores(500, 500), { outcome: 'tie', difference: 0 });
  assert.equal(comparisonSymbol('win'), '↑'); assert.equal(comparisonSymbol('lose'), '↓'); assert.equal(comparisonSymbol('tie'), '=');
});

test('all four scoring models remain bounded and deterministic', () => {
  assert.ok(angularDistance(0.05, Math.PI * 2 - 0.05) < 0.11);
  const orbit = scoreAttempt({ distance: 0, gateWidth: 0.5, combo: 20, round: 20 });
  assert.equal(orbit.precision, 100); assert.ok(orbit.points <= 900);
  assert.equal(scoreEchoRound({ length: 99, combo: 99, round: 99 }), 900);
  const fast = scoreLumenRound({ elapsedMs: 0, deadlineMs: 1000, combo: 99, round: 99 });
  const slow = scoreLumenRound({ elapsedMs: 1000, deadlineMs: 1000, combo: 1, round: 0 });
  assert.ok(fast.points <= 500 && fast.points > slow.points);
  const mirrorFast = scoreMirrorRound({ elapsedMs: 0, deadlineMs: 3000, combo: 99, round: 99 });
  const mirrorSlow = scoreMirrorRound({ elapsedMs: 3000, deadlineMs: 3000, combo: 1, round: 0 });
  assert.ok(mirrorFast.points <= 650 && mirrorFast.points > mirrorSlow.points);
  assert.deepEqual(scoreMirrorRound({ elapsedMs: 500, deadlineMs: 3000, combo: 4, round: 2 }), scoreMirrorRound({ elapsedMs: 500, deadlineMs: 3000, combo: 4, round: 2 }));
});

test('all required languages have matching keys and localized fourth-challenge states', () => {
  assert.deepEqual(supportedLanguages, ['ar', 'en', 'tr']); assert.deepEqual(missingTranslations(), []);
  for (const language of supportedLanguages) {
    assert.ok(translate(language, 'mirrorName').length > 2);
    assert.ok(translate(language, 'mirrorHowTo').length > 8);
    assert.ok(translate(language, 'mirrorPrompt').length > 2);
    assert.ok(translate(language, 'mirrorCorrect', { points: 10 }).includes('10'));
    assert.ok(translate(language, 'mirrorOptionLabel', { value: 2 }).includes('2'));
    assert.ok(translate(language, 'challengeCard', { name: 'X' }).includes('X'));
    assert.ok(translate(language, 'rematchShareText', { name: 'X', score: 10 }).includes('10'));
    assert.ok(translate(language, 'comparisonAnnouncement', { outcome: 'O', target: 1, score: 2, difference: 1 }).includes('2'));
    assert.ok(translate(language, 'dailyPlayLabel', { name: 'X' }).includes('X'));
  }
});

test('daily entry four cards and Mirror Fuse options are accessible in the real entry point', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<input id="motion-toggle" type="checkbox" aria-label="Reduce effects" data-i18n-aria="reduceMotion">/);
  assert.match(html, /id="daily-entry"[^>]*aria-labelledby="daily-title"/);
  assert.match(html, /id="daily-start-button" class="primary daily-start"/);
  assert.match(html, /id="daily-result" class="daily-result" hidden/);
  assert.match(html, /id="invite-catalog-button"/);
  assert.match(html, /id="challenger-score"/); assert.match(html, /id="player-score"/); assert.match(html, /id="difference-text"/);
  assert.equal((html.match(/data-challenge-id=/g) || []).length, 4);
  assert.equal((html.match(/data-cell=/g) || []).length, 9);
  assert.equal((html.match(/data-lane=/g) || []).length, 3);
  assert.equal((html.match(/data-mirror-option=/g) || []).length, 3);
  assert.match(html, /id="mirror-fuse"[^>]*role="group"[^>]*dir="ltr"/);
  assert.match(html, /data-mirror-mark aria-hidden="true"/);
});

test('game keyboard attempts are consumed only from the focused canvas target', () => {
  const canvas = {};
  assert.equal(isGameAttemptKey({ code: 'Space', target: canvas }, canvas), true);
  assert.equal(isGameAttemptKey({ code: 'Enter', target: canvas }, canvas), true);
  assert.equal(isGameAttemptKey({ code: 'Space', target: { tagName: 'SELECT' } }, canvas), false);
  assert.equal(isGameAttemptKey({ code: 'Enter', target: { tagName: 'INPUT' } }, canvas), false);
  assert.equal(isGameAttemptKey({ code: 'KeyA', target: canvas }, canvas), false);
});

test('app owns one daily route preserves strict sharing and hosts all four games', async () => {
  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /parseLocationInvite\(\); bindEvents\(\); applyLanguage\(\)/);
  assert.match(source, /setScreen\(initialScreenForInvite\(state\.invite\)\)/);
  assert.match(source, /elements\.dailyStartButton\.addEventListener\('click', beginDailyRun\)/);
  assert.match(source, /state\.activeDaily = \{ \.\.\.state\.daily \}/);
  assert.match(source, /elements\.newButton\.hidden = Boolean\(state\.activeDaily\)/);
  assert.match(source, /navigator\.clipboard\.writeText\(payload\.clipboardText\)/);
  assert.match(source, /new OrbitLockGame/); assert.match(source, /new EchoGridGame/); assert.match(source, /new LumenLanesGame/); assert.match(source, /new MirrorFuseGame/);
  assert.doesNotMatch(source, /setInterval|GameEngine|PluginRegistry|CalendarService|RetentionEngine/);
});

test('lumen lifecycle owns timers and reduced effects never changes route or deadlines', async () => {
  const source = await readFile(new URL('../src/lumen-game.mjs', import.meta.url), 'utf8');
  assert.match(source, /this\.plan = lumenPlan\(seed, 18\)/);
  assert.match(source, /this\.abortController\?\.abort\(\)/);
  assert.match(source, /this\.timers\.forEach\(clearTimeout\)/);
  assert.match(source, /this\.deadlineTimer = this\.schedule\(\(\) => this\.resolveMiss\('slow'\), stage\.deadlineMs\)/);
  assert.doesNotMatch(source, /reducedMotion\s*\?\s*\d+/);
});

test('persisted back-forward cache restore returns an interrupted run without refreshing its daily route', async () => {
  assert.equal(screenAfterPageShow({ persisted: true }, 'game'), 'instructions');
  assert.equal(screenAfterPageShow({ persisted: false }, 'game'), 'game');
  assert.equal(screenAfterPageShow({ persisted: true }, 'result'), 'result');
  const source = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.match(source, /window\.addEventListener\('pagehide', destroyGame\);/);
  assert.match(source, /window\.addEventListener\('pageshow', handlePageShow\);/);
  assert.match(source, /if \(screen === 'discovery'\)[\s\S]*refreshDailyChallenge\(new Date\(\)\)/);
  assert.doesNotMatch(source, /pagehide[^\n]*once/);
});
