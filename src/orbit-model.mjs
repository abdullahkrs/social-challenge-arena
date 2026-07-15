import { clamp, makeRng } from './core.mjs';

export const ORBIT_TURN = 1024;
export const ORBIT_CHUNK_SIZE = 12;
export const ORBIT_LANES = 3;
export const ORBIT_MECHANICS = Object.freeze(['direct', 'lane', 'opposite', 'sequence']);
export const ORBIT_ZONES = Object.freeze(['halo', 'switchyard', 'eclipse', 'crown']);
export const ORBIT_PHASES = Object.freeze(['rise', 'recovery', 'reveal', 'pressure', 'special', 'mastery']);
export const ORBIT_LAYERS = Object.freeze(['understanding', 'application', 'combination', 'deception', 'pressure', 'mastery']);

function mod(value, divisor = ORBIT_TURN) { return ((value % divisor) + divisor) % divisor; }
function tickDistance(a, b) { const delta = Math.abs(mod(a) - mod(b)); return Math.min(delta, ORBIT_TURN - delta); }
function chooseDifferent(rng, value, count = ORBIT_LANES) {
  return (value + 1 + Math.floor(rng() * Math.max(1, count - 1))) % count;
}

export function orbitLayer(index) {
  if (index < 3) return 'understanding';
  if (index < 8) return 'application';
  if (index < 16) return 'combination';
  if (index < 28) return 'deception';
  if (index < 44) return 'pressure';
  return 'mastery';
}

export function orbitPhase(index) {
  const step = mod(index, ORBIT_CHUNK_SIZE);
  if (step <= 2) return 'rise';
  if (step === 3) return 'recovery';
  if (step === 4) return 'reveal';
  if (step <= 7) return 'pressure';
  if (step === 8) return 'special';
  return 'mastery';
}

function mechanicFor(index, layer, rng) {
  if (index < 3) return 'direct';
  if (index < 6) return 'lane';
  if (index < 9) return 'opposite';
  if (index < 12) return 'sequence';
  const unlocked = layer === 'application' ? ORBIT_MECHANICS.slice(0, 2)
    : layer === 'combination' ? ORBIT_MECHANICS.slice(0, 3)
      : ORBIT_MECHANICS;
  return unlocked[(index + Math.floor(rng() * unlocked.length)) % unlocked.length];
}

export function composeOrbitStage(seed, index) {
  if (!Number.isInteger(index) || index < 0) throw new RangeError('Orbit stage index must be a non-negative integer');
  const rng = makeRng((Number(seed) ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0);
  const layer = orbitLayer(index);
  const phase = orbitPhase(index);
  const layerIndex = ORBIT_LAYERS.indexOf(layer);
  const mechanic = mechanicFor(index, layer, rng);
  const cueLane = index === 0 ? 1 : Math.floor(rng() * ORBIT_LANES);
  const sequenceLength = layerIndex >= 4 ? 3 : 2;
  const sequence = Array.from({ length: sequenceLength }, (_, offset) => {
    const candidate = Math.floor(rng() * ORBIT_LANES);
    return offset && candidate === cueLane ? (candidate + 1) % ORBIT_LANES : candidate;
  });
  const memoryRule = rng() > 0.5 ? 'first' : 'last';
  let targetLane = cueLane;
  if (mechanic === 'opposite') targetLane = ORBIT_LANES - 1 - cueLane;
  if (mechanic === 'sequence') targetLane = memoryRule === 'first' ? sequence[0] : sequence.at(-1);
  if (mechanic === 'lane' && index > 3 && rng() > 0.62) targetLane = chooseDifferent(rng, cueLane);

  const recovery = phase === 'recovery';
  const special = phase === 'special';
  const mastery = phase === 'mastery';
  const gateWidth = clamp(148 - layerIndex * 12 - (mastery ? 10 : 0) + (recovery ? 36 : 0), 70, 184);
  const speed = clamp(126 + layerIndex * 17 + index * 1.4 + rng() * 22 - (recovery ? 24 : 0), 112, 238);
  const gateTick = Math.floor(rng() * 32) * 32;
  const direction = rng() > 0.5 ? 1 : -1;
  const startTick = mod(gateTick + direction * (360 + Math.floor(rng() * 130)));
  const maxCycles = recovery ? 3.2 : special ? 2.25 : Math.max(1.65, 2.65 - layerIndex * 0.13);
  const periodMs = ORBIT_TURN / speed * 1000;
  const riskLane = special ? chooseDifferent(rng, targetLane) : null;
  const riskGateTick = special ? mod(gateTick + direction * (190 + Math.floor(rng() * 120))) : null;
  const riskWidth = special ? clamp(gateWidth - 42, 48, 92) : null;
  const decoyCount = index < 5 ? 0 : layerIndex >= 3 ? 2 : 1;
  const decoys = Array.from({ length: decoyCount }, (_, offset) => ({
    lane: (targetLane + offset + 1) % ORBIT_LANES,
    tick: mod(gateTick + direction * (260 + offset * 190 + Math.floor(rng() * 70))),
    width: clamp(gateWidth - 12 - offset * 8, 56, 130),
    symbol: offset % 2 ? '×' : '◇'
  })).filter((decoy) => decoy.lane !== riskLane || tickDistance(decoy.tick, riskGateTick) > 120);

  return Object.freeze({
    index, chunkIndex: Math.floor(index / ORBIT_CHUNK_SIZE), layer, phase,
    zone: ORBIT_ZONES[(Math.floor(index / 6) + (Number(seed) & 3)) % ORBIT_ZONES.length],
    mechanic, cueLane, targetLane, sequence: Object.freeze(sequence), memoryRule,
    gateTick, gateWidth, riskLane, riskGateTick, riskWidth, decoys: Object.freeze(decoys),
    startTick, speed, direction, periodMs: Math.round(periodMs), deadlineMs: Math.round(periodMs * maxCycles),
    restoresChance: recovery && index > 0, special, milestone: index > 0 && index % 6 === 0,
    assistance: layerIndex < 2, maxCycles
  });
}

export function generateOrbitChunk(seed, chunkIndex) {
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) throw new RangeError('Orbit chunk index must be non-negative');
  const start = chunkIndex * ORBIT_CHUNK_SIZE;
  return Object.freeze(Array.from({ length: ORBIT_CHUNK_SIZE }, (_, offset) => composeOrbitStage(seed, start + offset)));
}

export function orbitWindow(seed, start = 0, count = 48) {
  if (!Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count < 0 || count > 512) throw new RangeError('Invalid Orbit window');
  return Array.from({ length: count }, (_, offset) => composeOrbitStage(seed, start + offset));
}

export function orbitPositionAt(stage, elapsedMs) {
  const elapsed = Math.max(0, Number(elapsedMs) || 0);
  return mod(stage.startTick + stage.direction * stage.speed * elapsed / 1000);
}

export function evaluateOrbitWindow(stage, { elapsedMs, lane }) {
  const safeLane = Number(lane) === stage.targetLane;
  const position = orbitPositionAt(stage, elapsedMs);
  const safeDistance = tickDistance(position, stage.gateTick);
  const safe = safeLane && safeDistance <= stage.gateWidth / 2;
  const riskLane = stage.riskLane !== null && Number(lane) === stage.riskLane;
  const riskDistance = stage.riskGateTick === null ? ORBIT_TURN : tickDistance(position, stage.riskGateTick);
  const risk = riskLane && riskDistance <= stage.riskWidth / 2;
  return {
    position, safe, risk, hit: safe || risk,
    kind: risk ? 'risk' : safe ? 'safe' : safeLane || riskLane ? 'timing' : 'lane',
    distance: risk ? riskDistance : safeDistance,
    width: risk ? stage.riskWidth : stage.gateWidth
  };
}

export function scoreOrbitLock({ stage, elapsedMs, lane, moves = 0, combo = 1 }) {
  const window = evaluateOrbitWindow(stage, { elapsedMs, lane });
  if (!window.hit) return { ...window, points: 0, precision: 0, efficiency: 0, riskBonus: 0 };
  const precision = Math.round(clamp(1 - window.distance / (window.width / 2), 0, 1) * 100);
  const efficiency = Math.round(clamp(100 - Math.max(0, Number(moves) || 0) * 14, 35, 100));
  const layerBonus = ORBIT_LAYERS.indexOf(stage.layer) * 10;
  const comboBonus = Math.min(80, Math.max(0, Number(combo) - 1) * 10);
  const riskBonus = window.risk ? 70 : 0;
  const specialBonus = stage.special ? 18 : 0;
  const points = clamp(Math.round(52 + precision * 1.25 + efficiency * 0.35 + layerBonus + comboBonus + riskBonus + specialBonus), 0, 420);
  return { ...window, points, precision, efficiency, riskBonus };
}

export function summarizeOrbitRun(snapshot) {
  const attempts = Math.max(0, Number(snapshot?.attempts) || 0);
  const gates = Math.max(0, Number(snapshot?.gates) || 0);
  return {
    gates,
    accuracy: attempts ? Math.round(gates / attempts * 100) : 0,
    bestCombo: Math.max(0, Number(snapshot?.bestCombo) || 0),
    riskLocks: Math.max(0, Number(snapshot?.riskLocks) || 0)
  };
}
