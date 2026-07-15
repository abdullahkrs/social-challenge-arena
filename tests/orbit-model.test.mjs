import test from 'node:test';
import assert from 'node:assert/strict';
import {
  currentOrbitGate, evaluateOrbitLock, generateOrbitChunk, orbitAlignmentBand, orbitGateAngle,
  orbitMarkerAngle, ORBIT_CHUNK_SIZE, ORBIT_LAYERS, ORBIT_MECHANICS, ORBIT_TENSION,
  scoreOrbitLock, summarizeOrbitRun
} from '../src/orbit-model.mjs';

function bestEvaluation(stage, ring, lockIndex = 0) {
  let best = null;
  for (let elapsedMs = 0; elapsedMs <= stage.deadlineMs; elapsedMs += 4) {
    const evaluation = evaluateOrbitLock(stage, { elapsedMs, selectedRing: ring, lockIndex });
    if (!best || evaluation.distance < best.distance) best = { ...evaluation, elapsedMs };
  }
  return best;
}

test('Orbit chunks are bounded, endless-ready, deterministic, and mechanically varied', () => {
  const first = generateOrbitChunk(123456, 0);
  const again = generateOrbitChunk(123456, 0);
  const next = generateOrbitChunk(123456, 1);
  const other = generateOrbitChunk(654321, 0);
  assert.deepEqual(first, again);
  assert.equal(first.length, ORBIT_CHUNK_SIZE);
  assert.equal(next.length, ORBIT_CHUNK_SIZE);
  assert.equal(next[0].index, ORBIT_CHUNK_SIZE);
  assert.notDeepEqual(first, other);
  assert.deepEqual(new Set(first.map(({ layer }) => layer)), new Set(ORBIT_LAYERS));
  assert.ok(new Set(first.map(({ mechanic }) => mechanic)).size >= 4);
  assert.ok(new Set([...first, ...next].map(({ mechanic }) => mechanic)).size === ORBIT_MECHANICS.length);
  assert.ok(new Set(first.map(({ tension }) => tension)).size >= 5);
  assert.ok(ORBIT_TENSION.includes('recovery') && ORBIT_TENSION.includes('special') && ORBIT_TENSION.includes('mastery'));
});

test('generated stages stay readable, finite, and contain reachable valid windows', () => {
  for (let seed = 0; seed < 60; seed += 1) {
    for (let chunkIndex = 0; chunkIndex < 3; chunkIndex += 1) {
      for (const stage of generateOrbitChunk(seed * 7919, chunkIndex)) {
        assert.ok(Number.isFinite(stage.speed) && stage.speed >= .8 && stage.speed <= 2.25);
        assert.ok(Number.isFinite(stage.deadlineMs) && stage.deadlineMs >= 5600 && stage.deadlineMs <= 10800);
        assert.ok(stage.gates.every((gate) => gate.width >= .34 && gate.width <= 1.08));
        const ring = stage.mechanic === 'relay' ? stage.relaySequence[0] : stage.validRings[0];
        const evaluation = bestEvaluation(stage, ring, 0);
        assert.ok(evaluation.hit, `unreachable stage ${stage.index} seed ${seed}`);
        if (stage.mechanic === 'relay') {
          const second = bestEvaluation(stage, stage.relaySequence[1], 1);
          assert.ok(second.hit, `unreachable relay second lock ${stage.index}`);
        }
      }
    }
  }
});

test('same elapsed input has frame-cadence-independent truth', () => {
  const stage = generateOrbitChunk(98765, 2)[10];
  const elapsed = 3472;
  const directMarker = orbitMarkerAngle(stage, elapsed);
  const cadenceA = [16, 17, 15, 33, 8, 22];
  const cadenceB = [120, 5, 61, 9];
  assert.equal(orbitMarkerAngle(stage, cadenceA.reduce((_, __) => elapsed, 0)), directMarker);
  assert.equal(orbitMarkerAngle(stage, cadenceB.reduce((_, __) => elapsed, 0)), directMarker);
  const gate = currentOrbitGate(stage, stage.mechanic === 'relay' ? stage.relaySequence[0] : stage.validRings[0], 0);
  assert.equal(orbitGateAngle(stage, gate, elapsed), orbitGateAngle(stage, gate, elapsed));
});

test('rules reject wrong orbits, distinguish risk, and keep score bounded', () => {
  const stages = generateOrbitChunk(424242, 0);
  const polarity = stages.find(({ mechanic }) => mechanic === 'polarity');
  const valid = bestEvaluation(polarity, polarity.validRings[0]);
  const invalidRing = 1 - polarity.validRings[0];
  const invalid = evaluateOrbitLock(polarity, { elapsedMs: valid.elapsedMs, selectedRing: invalidRing });
  assert.equal(valid.hit, true);
  assert.equal(invalid.hit, false);
  assert.equal(invalid.validRing, false);
  assert.equal(orbitAlignmentBand(polarity, invalid), 'wrong-ring');

  const risk = stages.find(({ mechanic }) => mechanic === 'risk');
  const safeRing = risk.gates.find(({ kind }) => kind === 'safe').ring;
  const riskRing = risk.gates.find(({ kind }) => kind === 'risk').ring;
  const safe = bestEvaluation(risk, safeRing);
  const daring = bestEvaluation(risk, riskRing);
  const safePoints = scoreOrbitLock(risk, safe, { combo: 3, switches: 1 });
  const riskPoints = scoreOrbitLock(risk, daring, { combo: 3, switches: 1 });
  assert.ok(riskPoints > safePoints);
  assert.ok(safePoints >= 30 && riskPoints <= 850);
});

test('alignment checks preserve same-seed score parity', () => {
  const stage = generateOrbitChunk(20260715, 1).find(({ mechanic }) => mechanic !== 'relay');
  const evaluation = bestEvaluation(stage, stage.validRings[0]);
  const withoutChecks = scoreOrbitLock(stage, evaluation, { combo: 4, switches: 1, assistChecks: 0 });
  const withChecks = scoreOrbitLock(stage, evaluation, { combo: 4, switches: 1, assistChecks: 12 });
  assert.equal(withChecks, withoutChecks);
});

test('zero-attempt result detail stays truthful after deliberate exit', () => {
  assert.deepEqual(summarizeOrbitRun({ attempts: 0, correct: 0 }), { accuracy: 0, precision: 0 });
  assert.deepEqual(summarizeOrbitRun({ attempts: 8, correct: 6, precisionTotal: 510 }), { accuracy: 75, precision: 85 });
});
