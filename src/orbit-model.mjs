import { clamp, makeRng } from './core.mjs';

export const ORBIT_CHUNK_SIZE = 12;
export const ORBIT_RING_COUNT = 2;
export const ORBIT_TAU = Math.PI * 2;
export const ORBIT_MECHANICS = Object.freeze(['align', 'switch', 'polarity', 'risk', 'relay']);
export const ORBIT_LAYERS = Object.freeze(['understanding', 'application', 'combination', 'deception', 'pressure', 'mastery']);
export const ORBIT_TENSION = Object.freeze(['rise', 'rise', 'recovery', 'reveal', 'rise', 'special', 'recovery', 'rise', 'special', 'recovery', 'mastery', 'mastery']);
export const ORBIT_ZONES = Object.freeze(['halo', 'crossing', 'cipher', 'surge']);
export const ORBIT_SYMBOLS = Object.freeze(['◆', '●']);

function wrapAngle(value) {
  return ((Number(value) % ORBIT_TAU) + ORBIT_TAU) % ORBIT_TAU;
}

function seededRng(seed, chunkIndex) {
  return makeRng((Number(seed) ^ Math.imul((Number(chunkIndex) + 1) >>> 0, 0x9e3779b1) ^ 0x4f524249) >>> 0);
}

function layerFor(localIndex) {
  return ORBIT_LAYERS[Math.min(5, Math.floor(localIndex / 2))];
}

function mechanicFor(localIndex, tier, rng) {
  const opening = ['align', 'align', 'switch', 'switch', 'align', 'polarity', 'switch', 'polarity', 'risk', 'align', 'relay', 'risk'];
  if (tier === 0) return opening[localIndex];
  const phase = ORBIT_TENSION[localIndex];
  if (phase === 'recovery') return rng() > 0.55 ? 'switch' : 'align';
  if (phase === 'reveal') return rng() > 0.5 ? 'polarity' : 'risk';
  if (phase === 'special' || phase === 'mastery') return rng() > 0.45 ? 'relay' : 'risk';
  return ORBIT_MECHANICS[1 + Math.floor(rng() * (ORBIT_MECHANICS.length - 1))];
}

function stageGates({ rng, mechanic, gateWidth, targetRing, cueSymbol, rule, relaySequence }) {
  const baseAngle = rng() * ORBIT_TAU;
  const offset = 0.72 + rng() * 1.4;
  const symbols = rng() > 0.5 ? [...ORBIT_SYMBOLS] : [...ORBIT_SYMBOLS].reverse();
  const gates = [0, 1].map((ring) => ({
    ring,
    angle: wrapAngle(baseAngle + (ring ? offset : 0)),
    width: gateWidth,
    symbol: symbols[ring],
    kind: ring === targetRing ? 'target' : 'decoy',
    multiplier: 1
  }));

  if (mechanic === 'polarity') {
    const validRing = symbols.findIndex((symbol) => rule === 'match' ? symbol === cueSymbol : symbol !== cueSymbol);
    gates.forEach((gate) => { gate.kind = gate.ring === validRing ? 'target' : 'decoy'; });
    return { gates, validRings: [validRing], targetRing: validRing, relayGates: [] };
  }

  if (mechanic === 'risk') {
    const safeRing = targetRing;
    const riskRing = 1 - safeRing;
    gates[safeRing] = { ...gates[safeRing], kind: 'safe', width: clamp(gateWidth * 1.18, 0.56, 1.08), multiplier: 1 };
    gates[riskRing] = { ...gates[riskRing], kind: 'risk', width: clamp(gateWidth * 0.62, 0.34, 0.64), multiplier: 1.65 };
    return { gates, validRings: [safeRing, riskRing], targetRing: safeRing, relayGates: [] };
  }

  if (mechanic === 'relay') {
    const relayGates = relaySequence.map((ring, index) => ({
      ring,
      angle: wrapAngle(baseAngle + index * (1.05 + rng() * 0.85)),
      width: clamp(gateWidth * (index ? 0.82 : 0.96), 0.38, 0.9),
      symbol: index ? '②' : '①',
      kind: 'relay',
      multiplier: index ? 1.35 : 0.75
    }));
    gates.forEach((gate) => { gate.kind = 'guide'; gate.width = clamp(gateWidth * 0.72, 0.36, 0.7); });
    return { gates, validRings: [relaySequence[0]], targetRing: relaySequence[0], relayGates };
  }

  return { gates, validRings: [targetRing], targetRing, relayGates: [] };
}

export function generateOrbitChunk(seed, chunkIndex = 0) {
  const safeChunkIndex = Math.max(0, Math.trunc(Number(chunkIndex) || 0));
  const rng = seededRng(seed, safeChunkIndex);
  const tier = safeChunkIndex;
  const zoneOffset = Math.floor(rng() * ORBIT_ZONES.length);

  return Array.from({ length: ORBIT_CHUNK_SIZE }, (_, localIndex) => {
    const index = safeChunkIndex * ORBIT_CHUNK_SIZE + localIndex;
    const layer = layerFor(localIndex);
    const layerIndex = ORBIT_LAYERS.indexOf(layer);
    const tension = ORBIT_TENSION[localIndex];
    const mechanic = mechanicFor(localIndex, tier, rng);
    const recovery = tension === 'recovery';
    const mastery = tension === 'mastery';
    const pressure = tension === 'rise' || mastery;
    const direction = rng() > 0.5 ? 1 : -1;
    const targetRing = rng() > 0.5 ? 1 : 0;
    const startRing = mechanic === 'switch' ? 1 - targetRing : (rng() > 0.5 ? 1 : 0);
    const cueSymbol = ORBIT_SYMBOLS[Math.floor(rng() * ORBIT_SYMBOLS.length)];
    const rule = mechanic === 'polarity' && rng() > 0.5 ? 'opposite' : 'match';
    const relaySequence = rng() > 0.5 ? [0, 1] : [1, 0];
    const baseWidth = clamp(0.88 - layerIndex * 0.055 - tier * 0.018 + (recovery ? 0.17 : 0), 0.42, 1.04);
    const baseSpeed = clamp(0.92 + layerIndex * 0.11 + tier * 0.055 + rng() * 0.18 - (recovery ? 0.13 : 0), 0.82, 2.25);
    const acceleration = pressure && index > 5 ? direction * (0.035 + rng() * 0.075) : 0;
    const deadlineMs = Math.round(clamp(9300 - layerIndex * 420 - tier * 140 + (recovery ? 1700 : 0), 5600, 10800));
    const gateDriftAmplitude = index > 7 && !recovery ? 0.08 + rng() * 0.12 : 0;
    const gateDriftRate = gateDriftAmplitude ? 0.7 + rng() * 0.55 : 0;
    const generated = stageGates({ rng, mechanic, gateWidth: baseWidth, targetRing, cueSymbol, rule, relaySequence });

    return Object.freeze({
      index,
      localIndex,
      chunkIndex: safeChunkIndex,
      tier,
      layer,
      tension,
      zone: ORBIT_ZONES[(zoneOffset + Math.floor(localIndex / 3)) % ORBIT_ZONES.length],
      mechanic,
      direction,
      startAngle: rng() * ORBIT_TAU,
      startRing,
      speed: baseSpeed,
      acceleration,
      deadlineMs,
      gateDriftAmplitude,
      gateDriftRate,
      gateDriftPhase: rng() * ORBIT_TAU,
      cueSymbol,
      rule,
      targetRing: generated.targetRing,
      validRings: Object.freeze(generated.validRings),
      gates: Object.freeze(generated.gates.map(Object.freeze)),
      relaySequence: Object.freeze(relaySequence),
      relayGates: Object.freeze(generated.relayGates.map(Object.freeze)),
      recovery,
      special: tension === 'special',
      mastery
    });
  });
}

export function orbitMarkerAngle(stage, elapsedMs) {
  const seconds = clamp(Number(elapsedMs) || 0, 0, stage.deadlineMs) / 1000;
  return wrapAngle(stage.startAngle + stage.direction * stage.speed * seconds + 0.5 * stage.acceleration * seconds * seconds);
}

export function orbitGateAngle(stage, gate, elapsedMs) {
  if (!stage.gateDriftAmplitude) return gate.angle;
  const seconds = clamp(Number(elapsedMs) || 0, 0, stage.deadlineMs) / 1000;
  return wrapAngle(gate.angle + Math.sin(seconds * stage.gateDriftRate + stage.gateDriftPhase) * stage.gateDriftAmplitude);
}

export function orbitAngularDistance(a, b) {
  return Math.abs(((Number(a) - Number(b) + Math.PI) % ORBIT_TAU + ORBIT_TAU) % ORBIT_TAU - Math.PI);
}

export function currentOrbitGate(stage, selectedRing, lockIndex = 0) {
  if (stage.mechanic === 'relay') return stage.relayGates[Math.min(lockIndex, stage.relayGates.length - 1)];
  return stage.gates[clamp(Math.trunc(Number(selectedRing) || 0), 0, ORBIT_RING_COUNT - 1)];
}

export function evaluateOrbitLock(stage, { elapsedMs, selectedRing, lockIndex = 0 } = {}) {
  const ring = clamp(Math.trunc(Number(selectedRing) || 0), 0, ORBIT_RING_COUNT - 1);
  const gate = currentOrbitGate(stage, ring, lockIndex);
  const requiredRing = stage.mechanic === 'relay' ? stage.relaySequence[lockIndex] : null;
  const validRing = requiredRing === null ? stage.validRings.includes(ring) : ring === requiredRing;
  const markerAngle = orbitMarkerAngle(stage, elapsedMs);
  const gateAngle = orbitGateAngle(stage, gate, elapsedMs);
  const distance = orbitAngularDistance(markerAngle, gateAngle);
  const hit = validRing && distance <= gate.width / 2;
  const precision = Math.round(clamp(1 - distance / Math.max(0.001, gate.width / 2), 0, 1) * 100);
  return Object.freeze({ hit, validRing, ring, gate, markerAngle, gateAngle, distance, precision });
}

export function scoreOrbitLock(stage, evaluation, { combo = 0, switches = 0, assistChecks = 0, relayPartial = false } = {}) {
  const progress = Math.min(150, stage.index * 4);
  const precision = evaluation.precision * (relayPartial ? 0.72 : 1.35);
  const comboBonus = Math.min(180, Math.max(0, Number(combo) - 1) * 18);
  const mechanicBonus = { align: 0, switch: 30, polarity: 55, risk: 60, relay: 75 }[stage.mechanic] || 0;
  const efficientControl = Math.max(0, 24 - Math.max(0, Number(switches) - 1) * 8);
  const riskBonus = evaluation.gate.kind === 'risk' ? 145 : evaluation.gate.kind === 'relay' ? 50 : 0;
  const assistAdjustment = Math.min(24, Math.max(0, Number(assistChecks)) * 4);
  const points = Math.round((95 + progress + precision + comboBonus + mechanicBonus + efficientControl + riskBonus - assistAdjustment) * (evaluation.gate.multiplier || 1));
  return clamp(points, 30, relayPartial ? 360 : 850);
}

export function orbitAlignmentBand(stage, evaluation) {
  if (!evaluation.validRing) return 'wrong-ring';
  const ratio = evaluation.distance / Math.max(0.001, evaluation.gate.width / 2);
  if (ratio <= 1) return 'inside';
  if (ratio <= 2.2) return 'near';
  return 'far';
}

export function summarizeOrbitRun(snapshot = {}) {
  const attempts = Math.max(0, Math.trunc(Number(snapshot.attempts) || 0));
  const correct = Math.max(0, Math.trunc(Number(snapshot.correct) || 0));
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : 100;
  const precision = correct ? Math.round((Number(snapshot.precisionTotal) || 0) / correct) : 0;
  return Object.freeze({ accuracy: clamp(accuracy, 0, 100), precision: clamp(precision, 0, 100) });
}
