export const SHARE_VERSION = 1;
export const ORBIT_LOCK_ID = 'orbit-lock';
export const ECHO_GRID_ID = 'echo-grid';
export const CHALLENGE_ID = ORBIT_LOCK_ID;
export const CHALLENGE_IDS = Object.freeze([ORBIT_LOCK_ID, ECHO_GRID_ID]);
export const SCORE_MAX = 9999;
export const SEED_MAX = 0xffffffff;
const ALLOWED_KEYS = ['c', 'ck', 's', 't', 'v'];
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

function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
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
