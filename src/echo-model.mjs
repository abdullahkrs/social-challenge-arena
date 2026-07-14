import { clamp, makeRng } from './core.mjs';

export const ECHO_CHUNK_SIZE = 12;
export const ECHO_MECHANICS = Object.freeze(['trace', 'reverse', 'mirror', 'fold']);
export const ECHO_ZONES = Object.freeze(['origin', 'crosswind', 'reflection', 'archive']);
export const ECHO_PHASES = Object.freeze(['rising', 'recovery', 'reveal', 'pressure', 'special', 'mastery']);

function mix32(value) {
  let mixed = Number(value) >>> 0;
  mixed ^= mixed >>> 16;
  mixed = Math.imul(mixed, 0x7feb352d);
  mixed ^= mixed >>> 15;
  mixed = Math.imul(mixed, 0x846ca68b);
  mixed ^= mixed >>> 16;
  return mixed >>> 0;
}

export function echoChunkSeed(seed, chunkIndex) {
  const base = Number(seed) >>> 0;
  const chunk = Math.max(0, Math.trunc(Number(chunkIndex) || 0));
  if (chunk === 0) return base;
  return mix32(base ^ Math.imul(chunk, 0x85ebca6b));
}

export function echoLayer(index) {
  const value = Math.max(0, Math.trunc(Number(index) || 0));
  if (value < 6) return 'understanding';
  if (value < 14) return 'application';
  if (value < 28) return 'combination';
  if (value < 46) return 'deception';
  if (value < 74) return 'pressure';
  return 'mastery';
}

export function echoPhase(index) {
  const position = Math.max(0, Math.trunc(Number(index) || 0)) % 14;
  if (position <= 3) return 'rising';
  if (position === 4 || position === 11) return 'recovery';
  if (position === 5) return 'reveal';
  if (position <= 9) return 'pressure';
  if (position === 10) return 'special';
  return 'mastery';
}

export function echoNeighbors(cell) {
  const value = Math.trunc(Number(cell));
  if (value < 0 || value > 8) return [];
  const row = Math.floor(value / 3);
  const column = value % 3;
  const output = [];
  if (row > 0) output.push(value - 3);
  if (column < 2) output.push(value + 1);
  if (row < 2) output.push(value + 3);
  if (column > 0) output.push(value - 1);
  return output;
}

export function areEchoAdjacent(first, second) {
  return echoNeighbors(first).includes(second);
}

function mirrorCell(cell) {
  const row = Math.floor(cell / 3);
  const column = cell % 3;
  return row * 3 + (2 - column);
}

function transformPath(path, mechanic) {
  if (mechanic === 'reverse') return [...path].reverse();
  if (mechanic === 'mirror') return path.map(mirrorCell);
  if (mechanic === 'fold') return path.map(mirrorCell).reverse();
  return [...path];
}

function zoneFor(seed, index) {
  const offset = mix32((Number(seed) >>> 0) ^ 0x4543484f) % ECHO_ZONES.length;
  return ECHO_ZONES[(offset + Math.floor(Math.max(0, index) / 11)) % ECHO_ZONES.length];
}

function mechanicFor(index, phase) {
  if (index < 6) return 'trace';
  if (index === 6) return 'reverse';
  if (index < 14) return index % 3 === 0 ? 'reverse' : 'trace';
  if (index === 14) return 'mirror';
  if (index < 28) return ['trace', 'reverse', 'mirror'][index % 3];
  if (index === 28) return 'fold';
  const pool = phase === 'recovery'
    ? ['trace', 'reverse']
    : phase === 'mastery'
      ? ['reverse', 'mirror', 'fold']
      : ECHO_MECHANICS;
  return pool[mix32(index ^ 0x524f5554) % pool.length];
}

function routeLength(index, phase, sample) {
  const layer = echoLayer(index);
  const base = ({ understanding: 4, application: 5, combination: 6, deception: 6, pressure: 7, mastery: 8 })[layer];
  const varied = base + (sample > 0.62 ? 1 : 0);
  return clamp(phase === 'recovery' ? varied - 2 : varied, 4, 9);
}

function generatePath(rng, length) {
  const route = [Math.floor(rng() * 9)];
  while (route.length < length) {
    const current = route.at(-1);
    const previous = route.at(-2);
    let options = echoNeighbors(current).filter((cell) => cell !== previous);
    const recent = new Set(route.slice(-4));
    const fresh = options.filter((cell) => !recent.has(cell));
    if (fresh.length) options = fresh;
    route.push(options[Math.floor(rng() * options.length)]);
  }
  return route;
}

function findRisk(stagePath, blocked, rng) {
  const candidates = [];
  for (let index = 0; index < stagePath.length - 1; index += 1) {
    const current = stagePath[index];
    const next = stagePath[index + 1];
    const currentRow = Math.floor(current / 3);
    const currentColumn = current % 3;
    const nextRow = Math.floor(next / 3);
    const nextColumn = next % 3;
    if (currentRow === nextRow) {
      for (const row of [currentRow - 1, currentRow + 1]) {
        if (row < 0 || row > 2) continue;
        const tiles = [row * 3 + currentColumn, row * 3 + nextColumn];
        if (tiles.every((cell) => !blocked.includes(cell) && !stagePath.includes(cell))) candidates.push({ branchIndex: index, tiles });
      }
    } else if (currentColumn === nextColumn) {
      for (const column of [currentColumn - 1, currentColumn + 1]) {
        if (column < 0 || column > 2) continue;
        const tiles = [currentRow * 3 + column, nextRow * 3 + column];
        if (tiles.every((cell) => !blocked.includes(cell) && !stagePath.includes(cell))) candidates.push({ branchIndex: index, tiles });
      }
    }
  }
  if (!candidates.length) return null;
  return candidates[Math.floor(rng() * candidates.length)];
}

export function echoChunk(seed, size = ECHO_CHUNK_SIZE) {
  const count = clamp(Math.trunc(Number(size) || ECHO_CHUNK_SIZE), 1, ECHO_CHUNK_SIZE);
  const rng = makeRng(Number(seed) >>> 0);
  return Array.from({ length: count }, () => ({
    routeSample: rng(),
    routeSeed: Math.floor(rng() * 0x100000000) >>> 0,
    modifierSeed: Math.floor(rng() * 0x100000000) >>> 0
  }));
}

export function composeEchoStage(seed, index, skeleton = null) {
  const safeIndex = Math.max(0, Math.trunc(Number(index) || 0));
  const phase = echoPhase(safeIndex);
  const layer = echoLayer(safeIndex);
  const zone = zoneFor(seed, safeIndex);
  const source = skeleton || echoChunk(echoChunkSeed(seed, Math.floor(safeIndex / ECHO_CHUNK_SIZE)))[safeIndex % ECHO_CHUNK_SIZE];
  const rng = makeRng(mix32((Number(seed) >>> 0) ^ source.routeSeed ^ Math.imul(safeIndex + 1, 0x9e3779b9)));
  const mechanic = mechanicFor(safeIndex, phase);
  const previewPath = generatePath(rng, routeLength(safeIndex, phase, source.routeSample));
  const targetPath = transformPath(previewPath, mechanic);

  const unused = Array.from({ length: 9 }, (_, cell) => cell).filter((cell) => !targetPath.includes(cell));
  const blockedWanted = safeIndex < 12 || phase === 'recovery' ? 0 : layer === 'mastery' && unused.length > 1 ? 2 : 1;
  const blocked = [];
  while (blocked.length < blockedWanted && unused.length) {
    blocked.push(unused.splice(Math.floor(rng() * unused.length), 1)[0]);
  }

  const special = phase === 'special' || (layer === 'mastery' && safeIndex % 5 === 0);
  const risk = special ? findRisk(targetPath, blocked, rng) : null;
  const decoyPool = Array.from({ length: 9 }, (_, cell) => cell)
    .filter((cell) => !previewPath.includes(cell) && !blocked.includes(mirrorCell(cell)));
  const decoy = safeIndex >= 28 && phase !== 'recovery' && decoyPool.length
    ? decoyPool[Math.floor(rng() * decoyPool.length)]
    : null;
  const moves = targetPath.length - 1;
  const pressure = ({ understanding: 0, application: 250, combination: 600, deception: 900, pressure: 1250, mastery: 1550 })[layer];
  const deadlineMs = Math.round(clamp(5200 + moves * 850 - pressure + rng() * 500 + (phase === 'recovery' ? 1400 : 0), 4300, 11500));

  return Object.freeze({
    index: safeIndex,
    layer,
    phase,
    zone,
    mechanic,
    previewPath: Object.freeze(previewPath),
    targetPath: Object.freeze(targetPath),
    blocked: Object.freeze(blocked),
    risk: risk ? Object.freeze({ branchIndex: risk.branchIndex, tiles: Object.freeze(risk.tiles) }) : null,
    decoy,
    deadlineMs,
    previewStepMs: 540,
    special,
    milestone: safeIndex > 0 && safeIndex % 10 === 0,
    recovery: phase === 'recovery'
  });
}

export function initialEchoProgress(stage) {
  return { pathIndex: 0, riskStep: 0, riskTaken: false, currentCell: stage.targetPath[0] };
}

export function evaluateEchoMove(stage, progress, cell) {
  const chosen = Math.trunc(Number(cell));
  const current = progress.currentCell;
  if (!areEchoAdjacent(current, chosen)) return { correct: false, reason: 'nonadjacent', progress };
  if (stage.blocked.includes(chosen)) return { correct: false, reason: 'blocked', progress };

  if (progress.riskStep === 1) {
    if (chosen !== stage.risk?.tiles[1]) return { correct: false, reason: 'wrong', progress };
    return { correct: true, complete: false, risk: true, progress: { ...progress, riskStep: 2, currentCell: chosen } };
  }
  if (progress.riskStep === 2) {
    const rejoin = stage.targetPath[progress.pathIndex + 1];
    if (chosen !== rejoin) return { correct: false, reason: 'wrong', progress };
    const next = { pathIndex: progress.pathIndex + 1, riskStep: 0, riskTaken: true, currentCell: chosen };
    return { correct: true, complete: next.pathIndex === stage.targetPath.length - 1, risk: true, progress: next };
  }

  const nextSafe = stage.targetPath[progress.pathIndex + 1];
  if (stage.risk && progress.pathIndex === stage.risk.branchIndex && chosen === stage.risk.tiles[0]) {
    return { correct: true, complete: false, risk: true, progress: { ...progress, riskStep: 1, riskTaken: true, currentCell: chosen } };
  }
  if (chosen !== nextSafe) return { correct: false, reason: 'wrong', progress };
  const next = { ...progress, pathIndex: progress.pathIndex + 1, currentCell: chosen };
  return { correct: true, complete: next.pathIndex === stage.targetPath.length - 1, risk: progress.riskTaken, progress: next };
}

export function scoreEndlessEcho({ stage, elapsedMs, combo, riskTaken = false }) {
  const safeDeadline = clamp(Math.round(Number(stage?.deadlineMs) || 7000), 4000, 12000);
  const elapsed = clamp(Math.round(Number.isFinite(Number(elapsedMs)) ? Number(elapsedMs) : safeDeadline), 0, safeDeadline);
  const pace = clamp(1 - elapsed / safeDeadline, 0, 1);
  const mechanicBonus = ({ trace: 0, reverse: 7, mirror: 9, fold: 14 })[stage?.mechanic] || 0;
  const phaseBonus = stage?.phase === 'mastery' ? 8 : stage?.special ? 6 : 0;
  const pathBonus = clamp((stage?.targetPath?.length || 4) * 4, 16, 36);
  const comboBonus = Math.min(10, Math.max(0, Number(combo) - 1));
  const riskBonus = riskTaken ? 10 : 0;
  const points = clamp(16 + pathBonus + mechanicBonus + phaseBonus + Math.round(pace * 8) + comboBonus + riskBonus, 20, 92);
  return { points, response: elapsed, precision: Math.round(pace * 100) };
}

export function summarizeEchoRun(snapshot) {
  const attempts = Math.max(0, Math.trunc(Number(snapshot?.attempts) || 0));
  const correct = clamp(Math.trunc(Number(snapshot?.correct) || 0), 0, attempts);
  return {
    paths: Math.max(0, Math.trunc(Number(snapshot?.cleared) || 0)),
    bestCombo: Math.max(0, Math.trunc(Number(snapshot?.bestCombo) || 0)),
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    riskRoutes: Math.max(0, Math.trunc(Number(snapshot?.riskRoutes) || 0))
  };
}
