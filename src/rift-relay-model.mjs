const UINT32_MAX = 0xffffffff;

export const RIFT_RELAY_ID = 'rift-relay';
export const RIFT_ZONE_TYPES = Object.freeze(['flow', 'signal', 'fusion', 'distortion', 'surge', 'recovery']);
export const RIFT_LANES = Object.freeze([0, 1, 2]);

export function normalizeSeed(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(UINT32_MAX, Math.trunc(number))) >>> 0;
}

export function createRiftRng(seed) {
  let state = normalizeSeed(seed) || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, values) {
  return values[Math.floor(rng() * values.length) % values.length];
}

function shuffledLanes(rng) {
  const lanes = [...RIFT_LANES];
  for (let index = lanes.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [lanes[index], lanes[swap]] = [lanes[swap], lanes[index]];
  }
  return lanes;
}

function difficultyFor(cycle, zoneIndex) {
  const progress = cycle * RIFT_ZONE_TYPES.length + zoneIndex;
  return Object.freeze({
    speed: Math.min(2.15, 0.9 + progress * 0.045),
    precision: Math.min(0.82, 0.18 + progress * 0.025),
    complexity: Math.min(6, 1 + Math.floor(progress / 3)),
    memory: Math.min(4, Math.floor(progress / 5)),
    decoys: Math.min(3, Math.floor(progress / 4))
  });
}

function obstacleFor(rng, zoneType, difficulty) {
  const available = ['barrier', 'gap'];
  if (difficulty.complexity >= 2) available.push('low-beam');
  if (difficulty.complexity >= 3) available.push('moving-block');
  if (difficulty.complexity >= 4) available.push('split-gate');
  if (zoneType === 'distortion' || zoneType === 'surge') available.push('decoy-gate');

  const lanes = shuffledLanes(rng);
  const blockedCount = Math.min(2, difficulty.complexity >= 4 && rng() > 0.45 ? 2 : 1);
  return Object.freeze({
    type: pick(rng, available),
    blockedLanes: Object.freeze(lanes.slice(0, blockedCount)),
    safeLane: lanes[blockedCount] ?? lanes.at(-1),
    timing: Math.round(1100 - difficulty.speed * 170 + rng() * 180),
    moving: difficulty.complexity >= 3 && rng() > 0.66
  });
}

function puzzleFor(rng, difficulty) {
  const ruleTypes = ['match-shape', 'avoid-symbol'];
  if (difficulty.complexity >= 2) ruleTypes.push('greater-value');
  if (difficulty.memory >= 1) ruleTypes.push('remember-last');
  if (difficulty.complexity >= 4) ruleTypes.push('apply-two-rules');

  const answers = shuffledLanes(rng);
  const correctLane = answers[0];
  return Object.freeze({
    rule: pick(rng, ruleTypes),
    correctLane,
    decoyLanes: Object.freeze(answers.slice(1, 1 + difficulty.decoys)),
    cue: Math.floor(rng() * 6),
    memoryDepth: difficulty.memory
  });
}

export function generateRiftZone(seed, cycle = 0, zoneIndex = 0) {
  const safeCycle = Math.max(0, Math.trunc(Number(cycle) || 0));
  const safeZoneIndex = Math.max(0, Math.trunc(Number(zoneIndex) || 0)) % RIFT_ZONE_TYPES.length;
  const zoneType = RIFT_ZONE_TYPES[safeZoneIndex];
  const mixedSeed = normalizeSeed(seed) ^ Math.imul(safeCycle + 1, 0x9e3779b1) ^ Math.imul(safeZoneIndex + 1, 0x85ebca6b);
  const rng = createRiftRng(mixedSeed);
  const difficulty = difficultyFor(safeCycle, safeZoneIndex);

  const baseSegments = zoneType === 'recovery' ? 4 : zoneType === 'surge' ? 9 : 6;
  const segmentCount = baseSegments + Math.min(4, Math.floor(safeCycle / 2));
  const segments = [];

  for (let index = 0; index < segmentCount; index += 1) {
    const isPuzzle = ['signal', 'fusion', 'distortion', 'surge'].includes(zoneType)
      && (index === segmentCount - 1 || rng() > 0.7);
    segments.push(Object.freeze({
      index,
      kind: isPuzzle ? 'puzzle' : 'movement',
      obstacle: obstacleFor(rng, zoneType, difficulty),
      puzzle: isPuzzle ? puzzleFor(rng, difficulty) : null,
      riskyRoute: rng() > 0.72,
      rewardMultiplier: rng() > 0.72 ? 1.5 : 1,
      spacing: Math.round((zoneType === 'recovery' ? 1.35 : 1) * (95 + rng() * 45))
    }));
  }

  return Object.freeze({
    id: `${safeCycle}-${safeZoneIndex}`,
    type: zoneType,
    cycle: safeCycle,
    zoneIndex: safeZoneIndex,
    difficulty,
    visualVariant: Math.floor(rng() * 5),
    rareEvent: zoneType !== 'recovery' && rng() > 0.92 ? pick(rng, ['gravity-pulse', 'shadow-route', 'signal-storm']) : null,
    segments: Object.freeze(segments)
  });
}

export function generateRiftRun(seed, zoneCount = 12) {
  const count = Math.max(1, Math.min(120, Math.trunc(Number(zoneCount) || 12)));
  return Object.freeze(Array.from({ length: count }, (_, index) => {
    const cycle = Math.floor(index / RIFT_ZONE_TYPES.length);
    const zoneIndex = index % RIFT_ZONE_TYPES.length;
    return generateRiftZone(seed, cycle, zoneIndex);
  }));
}

export function scoreRiftAction({ distance = 0, accuracy = 0, streak = 0, risk = 1, puzzle = false } = {}) {
  const safeDistance = Math.max(0, Number(distance) || 0);
  const safeAccuracy = Math.max(0, Math.min(1, Number(accuracy) || 0));
  const safeStreak = Math.max(0, Math.trunc(Number(streak) || 0));
  const safeRisk = Math.max(1, Math.min(2, Number(risk) || 1));
  const base = 40 + Math.round(safeDistance * 2) + Math.round(safeAccuracy * 160);
  const mastery = Math.min(240, safeStreak * 12);
  const puzzleBonus = puzzle ? 120 : 0;
  return Math.round((base + mastery + puzzleBonus) * safeRisk);
}
