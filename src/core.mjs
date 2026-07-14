export const SHARE_VERSION = 1;
export const ORBIT_LOCK_ID = 'orbit-lock';
export const ECHO_GRID_ID = 'echo-grid';
export const LUMEN_LANES_ID = 'lumen-lanes';
export const CHALLENGE_ID = ORBIT_LOCK_ID;
export const CHALLENGE_IDS = Object.freeze([ORBIT_LOCK_ID, ECHO_GRID_ID, LUMEN_LANES_ID]);
export const SCORE_MAX = 9999;
export const SEED_MAX = 0xffffffff;
export const DAILY_STORAGE_KEY = 'sca-daily-best';
const ALLOWED_KEYS = ['c', 'ck', 's', 't', 'v'];
const DAILY_KEYS = ['best', 'challengeId', 'dateKey', 'seed'];
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Kept stable so every previously generated Orbit Lock and Echo Grid v1 link remains valid.
const CHECKSUM_SALT = 'sca-orbit-lock-v1';

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createSeed(random = Math.random) {
  const sample = Number.isFinite(random()) ? random() : 0.5;
  return Math.floor(clamp(sample, 0, 0.999999999) * (SEED_MAX + 1)) >>> 0;
}

export function makeRng(seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function challengePlan(seed, rounds = 12) {
  const rng = makeRng(seed);
  return Array.from({ length: rounds }, (_, index) => ({
    gateAngle: rng() * Math.PI * 2,
    gateWidth: Math.max(0.42, 0.78 - index * 0.03),
    speed: 1.55 + index * 0.075 + rng() * 0.12,
    direction: rng() > 0.5 ? 1 : -1
  }));
}

export function echoPlan(seed, rounds = 8) {
  const rng = makeRng(seed ^ 0x9e3779b9);
  return Array.from({ length: rounds }, (_, round) => {
    const length = Math.min(6, 2 + Math.floor(round / 2));
    const sequence = [];
    while (sequence.length < length) {
      const candidate = Math.floor(rng() * 9);
      if (candidate !== sequence.at(-1)) sequence.push(candidate);
    }
    return sequence;
  });
}

export function lumenPlan(seed, rounds = 18) {
  const rng = makeRng(seed ^ 0x51f15e5d);
  const plan = [];
  let previous = -1;
  let repeatCount = 0;
  for (let round = 0; round < rounds; round += 1) {
    let lane = Math.floor(rng() * 3);
    if (lane === previous && repeatCount >= 1) lane = (lane + 1 + Math.floor(rng() * 2)) % 3;
    repeatCount = lane === previous ? repeatCount + 1 : 0;
    previous = lane;
    plan.push({
      lane,
      deadlineMs: Math.round(Math.max(920, 1680 - round * 42 + rng() * 100)),
      drift: rng() > 0.5 ? 1 : -1
    });
  }
  return plan;
}

export function angularDistance(a, b) {
  const full = Math.PI * 2;
  return Math.abs(((a - b + Math.PI) % full + full) % full - Math.PI);
}

export function isGameAttemptKey(event, canvas) {
  return Boolean(event)
    && (event.code === 'Space' || event.code === 'Enter')
    && event.target === canvas;
}

export function screenAfterPageShow(event, screen) {
  return event?.persisted && screen === 'game' ? 'instructions' : screen;
}

export function initialScreenForInvite(invite) {
  return invite ? 'instructions' : 'discovery';
}

export function scoreAttempt({ distance, gateWidth, combo, round }) {
  const normalized = clamp(1 - distance / (gateWidth / 2), 0, 1);
  const precision = Math.round(normalized * 100);
  const base = 90 + precision * 2;
  const comboBonus = Math.min(240, Math.max(0, combo - 1) * 30);
  const roundBonus = Math.min(120, Math.max(0, round) * 10);
  return { precision, points: clamp(base + comboBonus + roundBonus, 0, 900) };
}

export function scoreEchoRound({ length, combo, round }) {
  const base = Math.max(2, Math.min(6, Number(length) || 2)) * 85;
  const comboBonus = Math.min(220, Math.max(0, combo - 1) * 35);
  const roundBonus = Math.min(180, Math.max(0, round) * 20);
  return clamp(base + comboBonus + roundBonus, 0, 900);
}

export function scoreLumenRound({ elapsedMs, deadlineMs, combo, round }) {
  const safeDeadline = clamp(Math.round(Number(deadlineMs) || 1000), 600, 2500);
  const safeElapsed = clamp(Math.round(Number(elapsedMs) || safeDeadline), 0, safeDeadline);
  const speed = clamp(1 - safeElapsed / safeDeadline, 0, 1);
  const base = 120 + Math.round(speed * 220);
  const comboBonus = Math.min(120, Math.max(0, combo - 1) * 12);
  const roundBonus = Math.min(40, Math.max(0, round) * 3);
  return { reaction: safeElapsed, points: clamp(base + comboBonus + roundBonus, 0, 500) };
}

export function compareScores(score, target) {
  const safeScore = clamp(Math.trunc(Number(score) || 0), 0, SCORE_MAX);
  const safeTarget = clamp(Math.trunc(Number(target) || 0), 0, SCORE_MAX);
  if (safeScore > safeTarget) return { outcome: 'win', difference: safeScore - safeTarget };
  if (safeScore < safeTarget) return { outcome: 'lose', difference: safeTarget - safeScore };
  return { outcome: 'tie', difference: 0 };
}

export function comparisonSymbol(outcome) {
  return ({ win: '↑', lose: '↓', tie: '=' })[outcome] || '•';
}

export function buildResultSharePayload({ title, text, url }) {
  const normalizedTitle = String(title || '').trim();
  const normalizedText = String(text || '').trim();
  const normalizedUrl = new URL(url).toString();
  return {
    shareData: { title: normalizedTitle, text: normalizedText, url: normalizedUrl },
    clipboardText: normalizedText ? `${normalizedText}\n${normalizedUrl}` : normalizedUrl
  };
}

function fnv1aNumber(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function fnv1a(value) {
  return fnv1aNumber(value).toString(36).padStart(7, '0');
}

function validDate(input) {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date');
  return date;
}

export function utcDateKey(input = new Date()) {
  const date = validDate(input);
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dailyChallengeFor(input = new Date()) {
  const dateKey = utcDateKey(input);
  const challengeHash = fnv1aNumber(`daily|${dateKey}`);
  const challengeId = CHALLENGE_IDS[challengeHash % CHALLENGE_IDS.length];
  const seed = fnv1aNumber(`route|${dateKey}|${challengeId}`);
  return { dateKey, challengeId, seed };
}

export function shouldRefreshDaily(currentDaily, input = new Date(), screen = 'discovery') {
  if (screen !== 'discovery') return false;
  return !currentDaily || currentDaily.dateKey !== utcDateKey(input);
}

export function shouldRefreshDailyOnPageShow(event, currentDaily, input = new Date(), screen = 'discovery') {
  return Boolean(event?.persisted) && shouldRefreshDaily(currentDaily, input, screen);
}

function hasExactKeys(value, expected) {
  return Object.keys(value).sort().join('|') === [...expected].sort().join('|');
}

export function parseDailyBest(input, daily) {
  if (!daily || !DATE_KEY_PATTERN.test(String(daily.dateKey || '')) || !CHALLENGE_IDS.includes(daily.challengeId)) return null;
  if (!Number.isInteger(daily.seed) || daily.seed < 0 || daily.seed > SEED_MAX) return null;
  let value = input;
  try {
    if (typeof value === 'string') value = JSON.parse(value);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value) || !hasExactKeys(value, DAILY_KEYS)) return null;
  if (value.dateKey !== daily.dateKey || value.challengeId !== daily.challengeId || value.seed !== daily.seed) return null;
  if (!Number.isInteger(value.best) || value.best < 0 || value.best > SCORE_MAX) return null;
  return { dateKey: value.dateKey, challengeId: value.challengeId, seed: value.seed, best: value.best };
}

export function updateDailyBest(input, daily, score) {
  const previous = parseDailyBest(input, daily);
  const safeScore = clamp(Math.trunc(Number(score) || 0), 0, SCORE_MAX);
  const previousBest = previous?.best ?? null;
  const best = previousBest === null ? safeScore : Math.max(previousBest, safeScore);
  return {
    record: { dateKey: daily.dateKey, challengeId: daily.challengeId, seed: daily.seed, best },
    previousBest,
    isNewBest: previousBest === null || safeScore > previousBest
  };
}

export function readDailyBest(storage, daily) {
  if (!storage || typeof storage.getItem !== 'function') return { record: null, available: false, discarded: false };
  try {
    const raw = storage.getItem(DAILY_STORAGE_KEY);
    if (raw === null) return { record: null, available: true, discarded: false };
    const record = parseDailyBest(raw, daily);
    if (record) return { record, available: true, discarded: false };
    if (typeof storage.removeItem === 'function') storage.removeItem(DAILY_STORAGE_KEY);
    return { record: null, available: true, discarded: true };
  } catch {
    return { record: null, available: false, discarded: false };
  }
}

export function writeDailyBest(storage, record, daily) {
  const validated = parseDailyBest(record, daily);
  if (!validated || !storage || typeof storage.setItem !== 'function') return false;
  try {
    storage.setItem(DAILY_STORAGE_KEY, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

function payload({ challengeId, seed, target }) {
  return `${SHARE_VERSION}|${challengeId}|${seed >>> 0}|${target}|${CHECKSUM_SALT}`;
}

export function encodeInvite({ challengeId = CHALLENGE_ID, seed, target }) {
  if (!CHALLENGE_IDS.includes(challengeId)) throw new RangeError('Unknown challenge');
  const normalizedSeed = Number(seed) >>> 0;
  const normalizedTarget = clamp(Math.trunc(Number(target) || 0), 0, SCORE_MAX);
  const checksum = fnv1a(payload({ challengeId, seed: normalizedSeed, target: normalizedTarget }));
  return new URLSearchParams({
    v: String(SHARE_VERSION),
    c: challengeId,
    s: normalizedSeed.toString(36),
    t: String(normalizedTarget),
    ck: checksum
  });
}

export function parseInvite(input) {
  const params = input instanceof URLSearchParams ? input : new URLSearchParams(input || '');
  const keys = [...params.keys()].sort();
  if (keys.length === 0) return { ok: true, invite: null };
  if (keys.length !== ALLOWED_KEYS.length || keys.some((key, index) => key !== ALLOWED_KEYS[index])) {
    return { ok: false, reason: 'shape' };
  }
  const challengeId = params.get('c') || '';
  if (params.get('v') !== String(SHARE_VERSION)) return { ok: false, reason: 'version' };
  if (!CHALLENGE_IDS.includes(challengeId)) return { ok: false, reason: 'challenge' };
  const seedText = params.get('s') || '';
  const targetText = params.get('t') || '';
  if (!/^[0-9a-z]{1,7}$/.test(seedText) || !/^(0|[1-9]\d{0,3})$/.test(targetText)) {
    return { ok: false, reason: 'format' };
  }
  const seed = Number.parseInt(seedText, 36);
  const target = Number.parseInt(targetText, 10);
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > SEED_MAX || target < 0 || target > SCORE_MAX) {
    return { ok: false, reason: 'bounds' };
  }
  const expected = fnv1a(payload({ challengeId, seed, target }));
  if (params.get('ck') !== expected) return { ok: false, reason: 'checksum' };
  return { ok: true, invite: { challengeId, seed, target } };
}

export function buildInviteUrl(baseUrl, invite) {
  const url = new URL(baseUrl);
  url.search = encodeInvite(invite).toString();
  url.hash = '';
  return url.toString();
}
