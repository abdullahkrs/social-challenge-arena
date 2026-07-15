import { clamp, makeRng } from './core.mjs';

export const MIRROR_BOARD_SIZE = 5;
export const MIRROR_CELL_COUNT = MIRROR_BOARD_SIZE * MIRROR_BOARD_SIZE;
export const MIRROR_CHUNK_SIZE = 12;
export const MIRROR_RULES = Object.freeze(['horizontal', 'vertical', 'rotate180', 'rotateRight']);
export const MIRROR_MECHANICS = Object.freeze(['rebuild', 'anchor', 'repair', 'sequence']);
export const MIRROR_ZONES = Object.freeze(['gallery', 'crossing', 'vault', 'aurora']);
export const MIRROR_PHASES = Object.freeze(['rising', 'recovery', 'reveal', 'pressure', 'special', 'mastery']);

function mix32(value) {
  let mixed = Number(value) >>> 0;
  mixed ^= mixed >>> 16;
  mixed = Math.imul(mixed, 0x7feb352d);
  mixed ^= mixed >>> 15;
  mixed = Math.imul(mixed, 0x846ca68b);
  mixed ^= mixed >>> 16;
  return mixed >>> 0;
}

export function mirrorChunkSeed(seed, chunkIndex) {
  const base = Number(seed) >>> 0;
  const chunk = Math.max(0, Math.trunc(Number(chunkIndex) || 0));
  return chunk === 0 ? base : mix32(base ^ Math.imul(chunk, 0x9e3779b9));
}

export function mirrorLayer(index) {
  const value = Math.max(0, Math.trunc(Number(index) || 0));
  if (value < 6) return 'understanding';
  if (value < 14) return 'application';
  if (value < 28) return 'combination';
  if (value < 46) return 'deception';
  if (value < 74) return 'pressure';
  return 'mastery';
}

export function mirrorPhase(index) {
  const position = Math.max(0, Math.trunc(Number(index) || 0)) % MIRROR_CHUNK_SIZE;
  if (position <= 3) return 'rising';
  if (position === 4 || position === 10) return 'recovery';
  if (position === 5) return 'reveal';
  if (position <= 8) return 'pressure';
  if (position === 9) return 'special';
  return 'mastery';
}

export function transformCell(index, rule, size = MIRROR_BOARD_SIZE) {
  const safeSize = Math.max(2, Math.trunc(Number(size) || MIRROR_BOARD_SIZE));
  const cell = Math.trunc(Number(index));
  if (!Number.isInteger(cell) || cell < 0 || cell >= safeSize * safeSize) throw new RangeError('Invalid mirror cell');
  const row = Math.floor(cell / safeSize);
  const column = cell % safeSize;
  if (rule === 'horizontal') return row * safeSize + (safeSize - 1 - column);
  if (rule === 'vertical') return (safeSize - 1 - row) * safeSize + column;
  if (rule === 'rotate180') return (safeSize - 1 - row) * safeSize + (safeSize - 1 - column);
  if (rule === 'rotateRight') return column * safeSize + (safeSize - 1 - row);
  throw new RangeError('Invalid mirror rule');
}

export function transformPattern(pattern, rule, size = MIRROR_BOARD_SIZE) {
  if (!Array.isArray(pattern) || pattern.length < 2) throw new RangeError('Invalid mirror pattern');
  const transformed = pattern.map((cell) => transformCell(cell, rule, size));
  if (new Set(transformed).size !== transformed.length) throw new RangeError('Ambiguous transformed pattern');
  return transformed;
}

function neighbours(cell) {
  const row = Math.floor(cell / MIRROR_BOARD_SIZE);
  const column = cell % MIRROR_BOARD_SIZE;
  const result = [];
  if (row > 0) result.push(cell - MIRROR_BOARD_SIZE);
  if (column < MIRROR_BOARD_SIZE - 1) result.push(cell + 1);
  if (row < MIRROR_BOARD_SIZE - 1) result.push(cell + MIRROR_BOARD_SIZE);
  if (column > 0) result.push(cell - 1);
  return result;
}

function connectedPattern(rng, length) {
  const starts = [6, 7, 8, 11, 12, 13, 16, 17, 18];
  const path = [starts[Math.floor(rng() * starts.length)]];
  const used = new Set(path);
  let guard = 0;
  while (path.length < length && guard < 240) {
    guard += 1;
    const base = path[Math.floor(rng() * path.length)];
    const choices = neighbours(base).filter((cell) => !used.has(cell));
    if (!choices.length) continue;
    const next = choices[Math.floor(rng() * choices.length)];
    used.add(next);
    path.push(next);
  }
  if (path.length < length) return connectedPattern(makeRng(Math.floor(rng() * 0xffffffff)), length);
  return path;
}

function zoneFor(seed, index) {
  const offset = mix32((Number(seed) >>> 0) ^ 0x4d495252) % MIRROR_ZONES.length;
  return MIRROR_ZONES[(offset + Math.floor(Math.max(0, index) / MIRROR_CHUNK_SIZE)) % MIRROR_ZONES.length];
}

function ruleFor(index, phase, rng) {
  if (index < 2) return 'horizontal';
  if (index < 4) return index % 2 ? 'vertical' : 'horizontal';
  if (index < 8) return ['horizontal', 'vertical'][Math.floor(rng() * 2)];
  if (index < 14) return ['horizontal', 'vertical', 'rotate180'][Math.floor(rng() * 3)];
  const pool = phase === 'recovery' ? ['horizontal', 'vertical', 'rotate180'] : MIRROR_RULES;
  return pool[Math.floor(rng() * pool.length)];
}

function mechanicFor(index, phase, rng) {
  const opening = ['rebuild', 'rebuild', 'rebuild', 'anchor', 'rebuild', 'anchor', 'repair', 'rebuild', 'anchor', 'sequence', 'repair', 'sequence'];
  if (index < opening.length) return opening[index];
  if (phase === 'recovery') return rng() < 0.7 ? 'rebuild' : 'anchor';
  if (phase === 'special' || phase === 'mastery') return rng() < 0.55 ? 'sequence' : 'repair';
  return MIRROR_MECHANICS[Math.floor(rng() * MIRROR_MECHANICS.length)];
}

function sampleUnique(rng, values, count) {
  const pool = [...values];
  const selected = [];
  while (pool.length && selected.length < count) {
    selected.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return selected;
}

function manhattan(a, b) {
  const ar = Math.floor(a / MIRROR_BOARD_SIZE);
  const ac = a % MIRROR_BOARD_SIZE;
  const br = Math.floor(b / MIRROR_BOARD_SIZE);
  const bc = b % MIRROR_BOARD_SIZE;
  return Math.abs(ar - br) + Math.abs(ac - bc);
}

function routeCost(start, cells, fixedOrder = false) {
  const remaining = [...cells];
  let current = start;
  let cost = 0;
  while (remaining.length) {
    let nextIndex = 0;
    if (!fixedOrder) {
      let best = Infinity;
      remaining.forEach((cell, index) => {
        const distance = manhattan(current, cell);
        if (distance < best) { best = distance; nextIndex = index; }
      });
    }
    const [next] = remaining.splice(nextIndex, 1);
    cost += manhattan(current, next) + 1;
    current = next;
  }
  return cost;
}

function stageTiming(index, patternLength, mechanic, phase, rng) {
  const base = 17000 + patternLength * 900 + (mechanic === 'sequence' ? 3500 : mechanic === 'repair' ? 1800 : 0);
  const learned = Math.min(5000, Math.floor(index / 5) * 220);
  const phaseOffset = phase === 'recovery' ? 4500 : phase === 'special' ? -900 : phase === 'mastery' ? -1500 : 0;
  const jitter = Math.round((rng() - 0.5) * 1200);
  return Math.round(clamp(base - learned + phaseOffset + jitter, 11000, 26000));
}

export function composeMirrorStage(seed, index) {
  const globalIndex = Math.max(0, Math.trunc(Number(index) || 0));
  const rng = makeRng(mix32(mirrorChunkSeed(seed, Math.floor(globalIndex / MIRROR_CHUNK_SIZE)) ^ Math.imul(globalIndex + 17, 0x85ebca6b)));
  const layer = mirrorLayer(globalIndex);
  const phase = mirrorPhase(globalIndex);
  const zone = zoneFor(seed, globalIndex);
  const mechanic = mechanicFor(globalIndex, phase, rng);
  const rule = ruleFor(globalIndex, phase, rng);
  const lengthBase = layer === 'understanding' ? 4 : layer === 'application' ? 5 : layer === 'combination' ? 6 : layer === 'deception' ? 7 : 8;
  const patternLength = Math.min(9, lengthBase + (phase === 'mastery' ? 1 : 0));
  const sourcePattern = connectedPattern(rng, patternLength);
  const targetPattern = transformPattern(sourcePattern, rule);
  const targetSet = new Set(targetPattern);
  const cursorStarts = [0, 4, 20, 24, 12].filter((cell) => !targetSet.has(cell));
  const cursorStart = cursorStarts[Math.floor(rng() * cursorStarts.length)] ?? 0;
  let initialOn = [];
  let locked = [];
  let workCells = [...targetPattern];

  if (mechanic === 'anchor') {
    locked = sampleUnique(rng, targetPattern, patternLength >= 7 ? 2 : 1);
    initialOn = [...locked];
    workCells = targetPattern.filter((cell) => !locked.includes(cell));
  } else if (mechanic === 'repair') {
    const retained = sampleUnique(rng, targetPattern, Math.max(1, Math.floor(patternLength / 2)));
    const decoyPool = Array.from({ length: MIRROR_CELL_COUNT }, (_, cell) => cell).filter((cell) => !targetSet.has(cell));
    const decoys = sampleUnique(rng, decoyPool, patternLength >= 7 ? 2 : 1);
    initialOn = [...retained, ...decoys];
    workCells = [...targetPattern.filter((cell) => !retained.includes(cell)), ...decoys];
  }

  const minimumActions = routeCost(cursorStart, mechanic === 'sequence' ? targetPattern : workCells, mechanic === 'sequence');
  const margin = phase === 'recovery' ? 10 : phase === 'mastery' ? 3 : 6;
  return Object.freeze({
    index: globalIndex,
    chunkIndex: Math.floor(globalIndex / MIRROR_CHUNK_SIZE),
    localIndex: globalIndex % MIRROR_CHUNK_SIZE,
    layer,
    phase,
    zone,
    rule,
    mechanic,
    sourcePattern: Object.freeze(sourcePattern),
    targetPattern: Object.freeze(targetPattern),
    initialOn: Object.freeze(initialOn),
    locked: Object.freeze(locked),
    cursorStart,
    moveBudget: minimumActions + margin,
    deadlineMs: stageTiming(globalIndex, patternLength, mechanic, phase, rng),
    milestone: globalIndex > 0 && globalIndex % MIRROR_CHUNK_SIZE === 0,
    special: phase === 'special' || phase === 'mastery',
    restoresChance: phase === 'recovery'
  });
}

export function generateMirrorChunk(seed, chunkIndex) {
  const safeChunk = Math.max(0, Math.trunc(Number(chunkIndex) || 0));
  return Object.freeze(Array.from({ length: MIRROR_CHUNK_SIZE }, (_, localIndex) => composeMirrorStage(seed, safeChunk * MIRROR_CHUNK_SIZE + localIndex)));
}

export function mirrorWindow(seed, start = 0, count = 72) {
  const safeStart = Math.max(0, Math.trunc(Number(start) || 0));
  const safeCount = clamp(Math.trunc(Number(count) || 0), 0, 720);
  return Array.from({ length: safeCount }, (_, offset) => composeMirrorStage(seed, safeStart + offset));
}

export function evaluateMirrorBoard(stage, activeCells, sequenceProgress = 0) {
  if (!stage) return { correct: false, missing: [], extra: [], sequenceComplete: false };
  const active = new Set([...activeCells].map((cell) => Math.trunc(Number(cell))).filter((cell) => cell >= 0 && cell < MIRROR_CELL_COUNT));
  const target = new Set(stage.targetPattern);
  const missing = [...target].filter((cell) => !active.has(cell));
  const extra = [...active].filter((cell) => !target.has(cell));
  return {
    correct: missing.length === 0 && extra.length === 0,
    missing,
    extra,
    sequenceComplete: stage.mechanic === 'sequence' && sequenceProgress >= stage.targetPattern.length
  };
}

export function scoreMirrorStage({ stage, moves = 0, elapsedMs, combo = 0, wrongActions = 0 }) {
  const budget = Math.max(1, Math.trunc(Number(stage?.moveBudget) || 1));
  const safeMoves = clamp(Math.trunc(Number(moves) || 0), 0, budget * 3);
  const deadline = clamp(Math.round(Number(stage?.deadlineMs) || 18000), 8000, 30000);
  const elapsed = clamp(Math.round(Number.isFinite(Number(elapsedMs)) ? Number(elapsedMs) : deadline), 0, deadline);
  const efficiency = clamp(1 - Math.max(0, safeMoves - Math.ceil(budget * 0.55)) / budget, 0, 1);
  const focus = clamp(1 - Math.max(0, Math.trunc(Number(wrongActions) || 0)) * 0.25, 0, 1);
  const pace = clamp(1 - elapsed / deadline, 0, 1);
  const progress = 48;
  const mastery = Math.round(efficiency * 42 + focus * 28 + pace * 18);
  const mechanicBonus = { rebuild: 0, anchor: 8, repair: 13, sequence: 18 }[stage?.mechanic] ?? 0;
  const ruleBonus = { horizontal: 0, vertical: 4, rotate180: 9, rotateRight: 13 }[stage?.rule] ?? 0;
  const streakBonus = Math.min(20, Math.max(0, Math.trunc(Number(combo) || 0) - 1) * 3);
  const phaseBonus = stage?.phase === 'special' ? 10 : stage?.phase === 'mastery' ? 14 : 0;
  return {
    points: clamp(progress + mastery + mechanicBonus + ruleBonus + streakBonus + phaseBonus, 0, 220),
    efficiency: Math.round(efficiency * 100),
    focus: Math.round(focus * 100),
    elapsedMs: elapsed
  };
}

export function summarizeMirrorRun(snapshot = {}) {
  const actions = Math.max(0, Math.trunc(Number(snapshot.totalActions) || 0));
  const correctActions = clamp(Math.trunc(Number(snapshot.correctActions) || 0), 0, actions);
  return {
    patterns: Math.max(0, Math.trunc(Number(snapshot.patterns ?? snapshot.round) || 0)),
    bestCombo: Math.max(0, Math.trunc(Number(snapshot.bestCombo) || 0)),
    accuracy: actions ? Math.round((correctActions / actions) * 100) : 100
  };
}
