import { clamp, lumenPlan, makeRng } from './core.mjs';

export const LUMEN_CHUNK_SIZE = 18;
export const LUMEN_MECHANICS = Object.freeze(['direct', 'mirror', 'choice', 'memory']);
export const LUMEN_ZONES = Object.freeze(['prism', 'current', 'signal', 'vault']);
export const LUMEN_PHASES = Object.freeze(['rising', 'recovery', 'reveal', 'pressure', 'special', 'mastery']);

function mix32(value) {
  let mixed = Number(value) >>> 0;
  mixed ^= mixed >>> 16;
  mixed = Math.imul(mixed, 0x7feb352d);
  mixed ^= mixed >>> 15;
  mixed = Math.imul(mixed, 0x846ca68b);
  mixed ^= mixed >>> 16;
  return mixed >>> 0;
}

export function lumenChunkSeed(seed, chunkIndex) {
  const base = Number(seed) >>> 0;
  const chunk = Math.max(0, Math.trunc(Number(chunkIndex) || 0));
  if (chunk === 0) return base;
  return mix32(base ^ Math.imul(chunk, 0x9e3779b9));
}

export function lumenLayer(index) {
  const value = Math.max(0, Math.trunc(Number(index) || 0));
  if (value < 6) return 'understanding';
  if (value < 14) return 'application';
  if (value < 28) return 'combination';
  if (value < 46) return 'deception';
  if (value < 74) return 'pressure';
  return 'mastery';
}

export function lumenPhase(index) {
  const position = Math.max(0, Math.trunc(Number(index) || 0)) % 14;
  if (position <= 3) return 'rising';
  if (position === 4 || position === 11) return 'recovery';
  if (position === 5) return 'reveal';
  if (position <= 9) return 'pressure';
  if (position === 10) return 'special';
  return 'mastery';
}

function zoneFor(seed, index) {
  const offset = mix32((Number(seed) >>> 0) ^ 0x4c554d45) % LUMEN_ZONES.length;
  const zoneStep = Math.floor(Math.max(0, index) / 12);
  return LUMEN_ZONES[(offset + zoneStep) % LUMEN_ZONES.length];
}

function mechanicFor(seed, index, zone, phase) {
  if (index < 6) return 'direct';
  if (index === 6) return 'mirror';
  if (index < 12) return index % 3 === 0 ? 'mirror' : 'direct';
  if (index === 12) return 'choice';
  if (index < 18) return ['direct', 'mirror', 'choice'][index % 3];
  if (index === 18) return 'memory';

  const rng = makeRng(mix32((Number(seed) >>> 0) ^ Math.imul(index + 1, 0x85ebca6b)));
  const zoneBias = {
    prism: ['mirror', 'direct', 'mirror', 'choice', 'memory'],
    current: ['choice', 'direct', 'choice', 'mirror', 'memory'],
    signal: ['memory', 'direct', 'memory', 'mirror', 'choice'],
    vault: ['mirror', 'choice', 'memory', 'direct', 'choice']
  }[zone];

  if (phase === 'recovery') return rng() < 0.72 ? 'direct' : zoneBias[Math.floor(rng() * zoneBias.length)];
  if (phase === 'reveal') {
    const rotation = Math.floor(index / 14) % LUMEN_MECHANICS.length;
    return LUMEN_MECHANICS[rotation];
  }
  if (phase === 'special') return rng() < 0.5 ? 'memory' : 'choice';
  return zoneBias[Math.floor(rng() * zoneBias.length)];
}

function timingFor(index, mechanic, phase, rng) {
  const base = { direct: 1680, mirror: 1950, choice: 2250, memory: 2500 }[mechanic];
  const floor = { direct: 760, mirror: 880, choice: 1050, memory: 1250 }[mechanic];
  const learnedReduction = Math.min(650, Math.floor(index / 3) * 18);
  const phaseOffset = phase === 'recovery' ? 260 : phase === 'pressure' ? -90 : phase === 'mastery' ? -140 : 0;
  const jitter = Math.round((rng() - 0.5) * 140);
  return Math.round(clamp(base - learnedReduction + phaseOffset + jitter, floor, base + 320));
}

function memorySequence(rng, length) {
  const sequence = [];
  while (sequence.length < length) {
    const lane = Math.floor(rng() * 3);
    if (lane !== sequence.at(-1)) sequence.push(lane);
  }
  return sequence;
}

export function composeLumenStage(seed, index, baseStage = null) {
  const globalIndex = Math.max(0, Math.trunc(Number(index) || 0));
  const chunkIndex = Math.floor(globalIndex / LUMEN_CHUNK_SIZE);
  const localIndex = globalIndex % LUMEN_CHUNK_SIZE;
  const fallbackPlan = lumenPlan(lumenChunkSeed(seed, chunkIndex), LUMEN_CHUNK_SIZE);
  const laneStage = baseStage || fallbackPlan[localIndex];
  const stageRng = makeRng(mix32((Number(seed) >>> 0) ^ Math.imul(globalIndex + 31, 0x27d4eb2d)));
  const layer = lumenLayer(globalIndex);
  const phase = lumenPhase(globalIndex);
  const zone = zoneFor(seed, globalIndex);
  const mechanic = mechanicFor(seed, globalIndex, zone, phase);
  const cueLane = laneStage.lane;
  const stage = {
    index: globalIndex,
    chunkIndex,
    localIndex,
    zone,
    layer,
    phase,
    mechanic,
    cueLane,
    targetLane: cueLane,
    deadlineMs: timingFor(globalIndex, mechanic, phase, stageRng),
    drift: laneStage.drift,
    milestone: globalIndex > 0 && globalIndex % 12 === 0,
    special: phase === 'special' || phase === 'mastery',
    modifier: phase === 'recovery' ? 'calm' : phase === 'special' ? 'surge' : phase === 'mastery' ? 'focus' : 'flow'
  };

  if (mechanic === 'mirror') {
    stage.targetLane = 2 - cueLane;
  } else if (mechanic === 'choice') {
    stage.blockedLane = cueLane;
    const allowed = [0, 1, 2].filter((lane) => lane !== stage.blockedLane);
    stage.riskLane = allowed[Math.floor(stageRng() * allowed.length)];
    stage.targetLane = null;
  } else if (mechanic === 'memory') {
    const length = globalIndex < 36 ? 2 : globalIndex < 72 ? 3 : 4;
    stage.sequence = memorySequence(stageRng, length);
    stage.memoryRule = globalIndex < 28 || stageRng() < 0.55 ? 'first' : 'last';
    stage.targetLane = stage.memoryRule === 'first' ? stage.sequence[0] : stage.sequence.at(-1);
    stage.previewMs = Math.round(clamp(1320 - Math.floor(globalIndex / 8) * 45, 720, 1320));
  }

  return Object.freeze(stage);
}

export function lumenWindow(seed, start = 0, count = 72) {
  const safeStart = Math.max(0, Math.trunc(Number(start) || 0));
  const safeCount = clamp(Math.trunc(Number(count) || 0), 0, 720);
  const chunks = new Map();
  return Array.from({ length: safeCount }, (_, offset) => {
    const index = safeStart + offset;
    const chunkIndex = Math.floor(index / LUMEN_CHUNK_SIZE);
    if (!chunks.has(chunkIndex)) {
      chunks.set(chunkIndex, lumenPlan(lumenChunkSeed(seed, chunkIndex), LUMEN_CHUNK_SIZE));
    }
    return composeLumenStage(seed, index, chunks.get(chunkIndex)[index % LUMEN_CHUNK_SIZE]);
  });
}

export function evaluateLumenChoice(stage, lane) {
  const selected = Math.trunc(Number(lane));
  if (!stage || !Number.isInteger(selected) || selected < 0 || selected > 2) {
    return { correct: false, risk: false, reason: 'invalid' };
  }
  if (stage.mechanic === 'choice') {
    const correct = selected !== stage.blockedLane;
    return { correct, risk: correct && selected === stage.riskLane, reason: correct ? 'route' : 'blocked' };
  }
  return { correct: selected === stage.targetLane, risk: false, reason: selected === stage.targetLane ? 'target' : 'wrong' };
}

export function scoreEndlessLumen({ stage, elapsedMs, combo = 0, risk = false }) {
  const deadline = clamp(Math.round(Number(stage?.deadlineMs) || 1600), 600, 3200);
  const elapsed = clamp(Math.round(Number.isFinite(Number(elapsedMs)) ? Number(elapsedMs) : deadline), 0, deadline);
  const reaction = clamp(1 - elapsed / deadline, 0, 1);
  const progress = 22;
  const reactionBonus = Math.round(reaction * 18);
  const streakBonus = Math.min(10, Math.max(0, Math.trunc(combo) - 1));
  const mechanicBonus = { direct: 0, mirror: 6, choice: 8, memory: 11 }[stage?.mechanic] ?? 0;
  const riskBonus = risk ? 16 : 0;
  const phaseBonus = stage?.phase === 'special' ? 6 : stage?.phase === 'mastery' ? 8 : 0;
  return {
    reactionMs: elapsed,
    precision: Math.round(reaction * 100),
    points: clamp(progress + reactionBonus + streakBonus + mechanicBonus + riskBonus + phaseBonus, 0, 90)
  };
}

export function summarizeLumenRun(snapshot = {}) {
  const attempts = Math.max(0, Math.trunc(Number(snapshot.attempts) || 0));
  const correct = clamp(Math.trunc(Number(snapshot.correct) || 0), 0, attempts);
  return {
    gates: Math.max(0, Math.trunc(Number(snapshot.round) || 0)),
    bestCombo: Math.max(0, Math.trunc(Number(snapshot.bestCombo) || 0)),
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 0
  };
}
