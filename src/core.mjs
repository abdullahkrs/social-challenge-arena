export const SHARE_VERSION = 2;
export const RIFT_RELAY_ID = 'rift-relay';
export const CHALLENGE_ID = RIFT_RELAY_ID;
export const CHALLENGE_IDS = Object.freeze([RIFT_RELAY_ID]);
export const SCORE_MAX = 999999;
export const SEED_MAX = 0xffffffff;
export const DAILY_STORAGE_KEY = 'sca-daily-best-v2';

const ALLOWED_KEYS = ['c', 's', 't', 'v'];
const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CHECKSUM_SALT = 'sca-rift-relay-v2';

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

function fnv1aNumber(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function checksum(payload) {
  return fnv1aNumber(`${CHECKSUM_SALT}|${payload}`).toString(36);
}

export function buildInviteUrl(base, { challengeId = RIFT_RELAY_ID, seed, target }) {
  if (!CHALLENGE_IDS.includes(challengeId)) throw new RangeError('Unknown challenge');
  const safeSeed = clamp(Math.trunc(Number(seed) || 0), 0, SEED_MAX) >>> 0;
  const safeTarget = clamp(Math.trunc(Number(target) || 0), 0, SCORE_MAX);
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  const payload = `${SHARE_VERSION}|${challengeId}|${safeSeed}|${safeTarget}`;
  url.searchParams.set('v', String(SHARE_VERSION));
  url.searchParams.set('c', challengeId);
  url.searchParams.set('s', String(safeSeed));
  url.searchParams.set('t', String(safeTarget));
  url.searchParams.set('ck', checksum(payload));
  return url.toString();
}

export function parseInvite(input) {
  const params = input instanceof URLSearchParams ? input : new URLSearchParams(String(input || '').replace(/^\?/, ''));
  if ([...params.keys()].length === 0) return { ok: true, invite: null };
  if ([...params.keys()].some((key) => ![...ALLOWED_KEYS, 'ck'].includes(key))) return { ok: false, reason: 'keys' };
  const version = Number(params.get('v'));
  const challengeId = params.get('c');
  const seed = Number(params.get('s'));
  const target = Number(params.get('t'));
  if (version !== SHARE_VERSION || !CHALLENGE_IDS.includes(challengeId)) return { ok: false, reason: 'challenge' };
  if (!Number.isInteger(seed) || seed < 0 || seed > SEED_MAX) return { ok: false, reason: 'seed' };
  if (!Number.isInteger(target) || target < 0 || target > SCORE_MAX) return { ok: false, reason: 'target' };
  const payload = `${version}|${challengeId}|${seed}|${target}`;
  if (params.get('ck') !== checksum(payload)) return { ok: false, reason: 'checksum' };
  return { ok: true, invite: { challengeId, seed: seed >>> 0, target } };
}

export function compareScores(score, target) {
  const safeScore = clamp(Math.trunc(Number(score) || 0), 0, SCORE_MAX);
  const safeTarget = clamp(Math.trunc(Number(target) || 0), 0, SCORE_MAX);
  if (safeScore > safeTarget) return { outcome: 'win', difference: safeScore - safeTarget };
  if (safeScore < safeTarget) return { outcome: 'lose', difference: safeTarget - safeScore };
  return { outcome: 'tie', difference: 0 };
}

export function utcDateKey(input = new Date()) {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date');
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function dailyChallengeFor(input = new Date()) {
  const dateKey = utcDateKey(input);
  return {
    dateKey,
    challengeId: RIFT_RELAY_ID,
    seed: fnv1aNumber(`rift-daily|${dateKey}`)
  };
}

export function parseDailyBest(input, daily) {
  if (!daily || daily.challengeId !== RIFT_RELAY_ID || !DATE_KEY_PATTERN.test(String(daily.dateKey || ''))) return null;
  try {
    const value = typeof input === 'string' ? JSON.parse(input) : input;
    if (!value || value.dateKey !== daily.dateKey || value.challengeId !== daily.challengeId || value.seed !== daily.seed) return null;
    if (!Number.isInteger(value.best) || value.best < 0 || value.best > SCORE_MAX) return null;
    return value;
  } catch {
    return null;
  }
}
