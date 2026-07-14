import { clamp, makeRng } from './core.mjs';

export const ECHO_BOARD_SIZE = 5;
export const ECHO_CHUNK_SIZE = 12;
export const ECHO_DIRECTIONS = Object.freeze(['up', 'right', 'down', 'left']);
const DELTAS = Object.freeze([[-1, 0], [0, 1], [1, 0], [0, -1]]);
const ZONES = Object.freeze(['garden', 'bridge', 'vault', 'storm']);
const LAYERS = Object.freeze(['understanding', 'application', 'combination', 'deception', 'pressure', 'mastery']);
const TENSION = Object.freeze(['rise', 'rise', 'rise', 'rise', 'recovery', 'reveal', 'pressure', 'pressure', 'pressure', 'special', 'mastery', 'mastery']);

export function inverseDirection(direction) { return (Number(direction) + 2) % 4; }
export function rotateClockwise(direction) { return (Number(direction) + 1) % 4; }
export function rotateCounterClockwise(direction) { return (Number(direction) + 3) % 4; }

export function moveCell(cell, direction, size = ECHO_BOARD_SIZE) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= size * size || !Number.isInteger(direction) || direction < 0 || direction > 3) return -1;
  const row = Math.floor(cell / size);
  const column = cell % size;
  const [dr, dc] = DELTAS[direction] || [0, 0];
  const nextRow = row + dr;
  const nextColumn = column + dc;
  if (nextRow < 0 || nextRow >= size || nextColumn < 0 || nextColumn >= size) return -1;
  return nextRow * size + nextColumn;
}

export function applyMoves(start, moves, size = ECHO_BOARD_SIZE) {
  let cell = start;
  const cells = [start];
  for (const direction of moves) {
    cell = moveCell(cell, direction, size);
    if (cell < 0) return null;
    cells.push(cell);
  }
  return { start, end: cell, cells };
}

function validStarts(moves, size = ECHO_BOARD_SIZE) {
  const starts = [];
  for (let cell = 0; cell < size * size; cell += 1) if (applyMoves(cell, moves, size)) starts.push(cell);
  return starts;
}

function pick(rng, values) { return values[Math.floor(rng() * values.length) % values.length]; }

function generatePath(rng, length, size = ECHO_BOARD_SIZE) {
  const start = Math.floor(rng() * size * size);
  const moves = [];
  let cell = start;
  let previous = -1;
  for (let index = 0; index < length; index += 1) {
    let options = ECHO_DIRECTIONS.map((_, direction) => direction)
      .filter((direction) => moveCell(cell, direction, size) >= 0)
      .filter((direction) => index === 0 || direction !== inverseDirection(previous));
    if (!options.length) options = ECHO_DIRECTIONS.map((_, direction) => direction).filter((direction) => moveCell(cell, direction, size) >= 0);
    const direction = pick(rng, options);
    moves.push(direction);
    cell = moveCell(cell, direction, size);
    previous = direction;
  }
  return { start, moves, end: cell, cells: applyMoves(start, moves, size).cells };
}

export function echoLayer(index) {
  if (index < 4) return LAYERS[0];
  if (index < 8) return LAYERS[1];
  if (index < 12) return LAYERS[2];
  if (index < 18) return LAYERS[3];
  if (index < 26) return LAYERS[4];
  return LAYERS[5];
}

export function echoTension(index) { return TENSION[index % TENSION.length]; }

function mechanicFor(index, rng, tension) {
  const available = ['direct'];
  if (index >= 4) available.push('reverse');
  if (index >= 8) available.push('turn');
  if (index >= 12) available.push('echo');
  if (tension === 'recovery') return 'direct';
  if (tension === 'reveal') return available.at(-1);
  if (tension === 'special' && available.includes('echo')) return 'echo';
  if (tension === 'mastery' && available.length > 2) return pick(rng, available.slice(1));
  return pick(rng, available);
}

function lengthFor(index, tension, rng) {
  const layerBonus = Math.min(4, Math.floor(index / 6));
  const pressureBonus = ['pressure', 'special', 'mastery'].includes(tension) ? 1 : 0;
  const recoveryCut = tension === 'recovery' ? 2 : 0;
  return clamp(3 + layerBonus + pressureBonus - recoveryCut + (rng() > 0.72 ? 1 : 0), 3, 8);
}

function buildStage(seed, index, rng) {
  const tension = echoTension(index);
  const layer = echoLayer(index);
  const mechanic = mechanicFor(index, rng, tension);
  const length = lengthFor(index, tension, rng);
  const expectedPath = generatePath(rng, length);
  let responseStart = expectedPath.start;
  let expectedMoves = expectedPath.moves;
  let displayMoves = expectedMoves;
  let displayStart = responseStart;
  let echoFlags = expectedMoves.map(() => false);

  if (mechanic === 'reverse') {
    const displayPath = generatePath(rng, length);
    displayStart = displayPath.start;
    displayMoves = displayPath.moves;
    responseStart = displayPath.end;
    expectedMoves = [...displayMoves].reverse().map(inverseDirection);
  } else if (mechanic === 'turn') {
    expectedMoves = expectedPath.moves;
    displayMoves = expectedMoves.map(rotateCounterClockwise);
    const starts = validStarts(displayMoves);
    displayStart = pick(rng, starts);
  } else if (mechanic === 'echo') {
    expectedMoves = expectedPath.moves;
    let starts = [];
    for (let attempt = 0; attempt < 18 && !starts.length; attempt += 1) {
      echoFlags = expectedMoves.map((_, moveIndex) => moveIndex > 0 && rng() > (index < 18 ? 0.74 : 0.6));
      if (!echoFlags.some(Boolean)) echoFlags[Math.min(expectedMoves.length - 1, 1 + Math.floor(rng() * Math.max(1, expectedMoves.length - 1)))] = true;
      displayMoves = expectedMoves.map((direction, moveIndex) => echoFlags[moveIndex] ? inverseDirection(direction) : direction);
      starts = validStarts(displayMoves);
    }
    if (!starts.length) {
      for (let moveIndex = 0; moveIndex < expectedMoves.length && !starts.length; moveIndex += 1) {
        echoFlags = expectedMoves.map((_, candidate) => candidate === moveIndex);
        displayMoves = expectedMoves.map((direction, candidate) => echoFlags[candidate] ? inverseDirection(direction) : direction);
        starts = validStarts(displayMoves);
      }
    }
    if (!starts.length) throw new Error('Echo generator could not place an opposed cue path');
    displayStart = pick(rng, starts);
  }

  const displayPath = applyMoves(displayStart, displayMoves);
  const responsePath = applyMoves(responseStart, expectedMoves);
  if (!displayPath || !responsePath) throw new Error('Echo generator produced an invalid path');

  const timed = index >= 7 && tension !== 'recovery' && tension !== 'reveal';
  const deadlineMs = timed ? clamp(9800 - index * 115 - length * 260 + Math.round(rng() * 350), 3600, 8800) : null;
  const zoneShift = Math.floor((seed >>> 5) % ZONES.length);
  const zone = ZONES[(Math.floor(index / 6) + zoneShift) % ZONES.length];

  return Object.freeze({
    index, zone, layer, tension, mechanic, length,
    displayStart, displayMoves: Object.freeze([...displayMoves]), displayCells: Object.freeze([...displayPath.cells]),
    responseStart, expectedMoves: Object.freeze([...expectedMoves]), responseCells: Object.freeze([...responsePath.cells]),
    echoFlags: Object.freeze([...echoFlags]), deadlineMs,
    recovery: tension === 'recovery', special: tension === 'special', mastery: tension === 'mastery'
  });
}

export function generateEchoChunk(seed, chunkIndex = 0, size = ECHO_CHUNK_SIZE) {
  const safeSize = clamp(Math.trunc(size) || ECHO_CHUNK_SIZE, 1, ECHO_CHUNK_SIZE);
  const safeChunk = Math.max(0, Math.trunc(chunkIndex) || 0);
  const mixedSeed = (Number(seed) ^ Math.imul(safeChunk + 1, 0x45d9f3b) ^ 0x2c1b3c6d) >>> 0;
  const rng = makeRng(mixedSeed);
  return Object.freeze(Array.from({ length: safeSize }, (_, offset) => buildStage(Number(seed) >>> 0, safeChunk * ECHO_CHUNK_SIZE + offset, rng)));
}

export function scoreEchoStage({ stage, combo = 0, assists = 0, remainingMs = 0 }) {
  if (!stage) return 0;
  const mechanicBonus = { direct: 0, reverse: 6, turn: 10, echo: 14 }[stage.mechanic] || 0;
  const phaseBonus = (stage.special ? 8 : 0) + (stage.mastery ? 10 : 0);
  const comboBonus = Math.min(18, Math.max(0, combo) * 2);
  const timeBonus = stage.deadlineMs ? Math.round(clamp(remainingMs / stage.deadlineMs, 0, 1) * 10) : 4;
  const assistPenalty = Math.min(18, Math.max(0, assists) * 6);
  return clamp(18 + stage.length * 4 + mechanicBonus + phaseBonus + comboBonus + timeBonus - assistPenalty, 8, 78);
}

export function summarizeEchoStages(stages) {
  return {
    mechanics: [...new Set(stages.map((stage) => stage.mechanic))],
    zones: [...new Set(stages.map((stage) => stage.zone))],
    layers: [...new Set(stages.map((stage) => stage.layer))],
    tensions: [...new Set(stages.map((stage) => stage.tension))]
  };
}
