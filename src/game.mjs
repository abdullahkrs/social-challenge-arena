import './audio-integration.mjs';
import './orbit-copy.mjs';
import './orbit-integration.mjs';
import { clamp } from './core.mjs';
import { platformAudio } from './audio.mjs';
import {
  currentOrbitGate, evaluateOrbitLock, generateOrbitChunk, orbitAlignmentBand, orbitGateAngle,
  orbitMarkerAngle, ORBIT_CHUNK_SIZE, ORBIT_RING_COUNT, ORBIT_TAU, scoreOrbitLock, summarizeOrbitRun
} from './orbit-model.mjs';

const KEY_RING = Object.freeze({ ArrowUp: 1, ArrowDown: 0, Digit1: 0, Digit2: 1, Numpad1: 0, Numpad2: 1 });

export class OrbitLockGame {
  constructor({ canvas, container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    this.canvas = canvas instanceof HTMLCanvasElement ? canvas : container?.querySelector('#game-canvas');
    if (!(this.canvas instanceof HTMLCanvasElement)) throw new TypeError('canvas is required');
    this.container = container instanceof HTMLElement ? container : this.canvas.closest('#orbit-lock');
    if (!(this.container instanceof HTMLElement)) throw new Error('Orbit Lock shell is required');
    this.container.hidden = this.canvas.hidden;
    this.context = this.canvas.getContext('2d', { alpha: false });
    if (!this.context) throw new Error('2D canvas is not available');
    this.ringButtons = [...this.container.querySelectorAll('[data-orbit-ring]')];
    this.lockButton = this.container.querySelector('[data-orbit-lock]');
    this.scanButton = this.container.querySelector('[data-orbit-scan]');
    this.exitButton = this.container.querySelector('[data-orbit-exit]');
    if (this.ringButtons.length !== ORBIT_RING_COUNT || !this.lockButton || !this.scanButton || !this.exitButton) {
      throw new Error('Orbit Lock requires two orbit controls, lock, scan, and deliberate exit');
    }
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.resizeObserver = null;
    this.frame = 0;
    this.timers = new Set();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.running = false;
    this.accepting = false;
    this.terminalPending = false;
    this.exitArmed = false;
    this.feedback = null;
    this.lastInputAt = -Infinity;
    this.lastScanAt = -Infinity;
  }

  emptySnapshot() {
    return {
      score: 0, round: 0, rounds: Number.MAX_SAFE_INTEGER, lives: 3, combo: 0, bestCombo: 0,
      attempts: 0, correct: 0, precisionTotal: 0, switches: 0, riskLocks: 0, assists: 0, endless: true
    };
  }

  dispatch(name, detail = {}) {
    this.container.dispatchEvent(new CustomEvent(`orbit:${name}`, {
      bubbles: true,
      detail: { ...detail, seed: this.seed }
    }));
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.seed = Number(seed) >>> 0;
    this.chunkIndex = 0;
    this.chunk = generateOrbitChunk(this.seed, this.chunkIndex);
    this.stageOffset = 0;
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.accepting = false;
    this.terminalPending = false;
    this.startedAt = performance.now();
    this.container.dataset.reduced = String(this.reducedMotion);
    this.installListeners();
    this.resize();
    this.dispatch('start', { snapshot: { ...this.snapshot } });
    this.publishSnapshot();
    this.beginStage();
    this.frame = requestAnimationFrame((time) => this.loop(time));
  }

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    this.container.dataset.reduced = String(this.reducedMotion);
  }

  isShortcutTarget(target) {
    return target === this.canvas
      || target === document.body
      || (target instanceof Element && this.container.contains(target));
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.ringButtons.forEach((button) => {
      button.addEventListener('click', () => this.selectRing(Number(button.dataset.orbitRing)), { signal });
    });
    this.lockButton.addEventListener('click', () => this.attempt(), { signal });
    this.scanButton.addEventListener('click', () => this.scanAlignment(), { signal });
    this.exitButton.addEventListener('click', () => this.requestExit(), { signal });
    window.addEventListener('keydown', (event) => {
      if (!this.running || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!this.isShortcutTarget(event.target)) return;
      const ring = KEY_RING[event.code];
      if (ring !== undefined) {
        event.preventDefault();
        this.selectRing(ring);
        return;
      }
      if ((event.code === 'Space' || event.code === 'Enter') && (event.target === this.canvas || event.target === document.body)) {
        event.preventDefault();
        this.attempt();
        return;
      }
      if (event.code === 'KeyS' && (event.target === this.canvas || event.target === document.body)) {
        event.preventDefault();
        this.scanAlignment();
      }
    }, { signal });
    window.addEventListener('resize', () => this.resize(), { signal, passive: true });
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
    }
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(280, Math.round((rect.width || 320) * ratio));
    const height = Math.max(280, Math.round((rect.height || 320) * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  currentStage() {
    return this.chunk[this.stageOffset];
  }

  beginStage() {
    if (!this.running) return;
    if (this.stageOffset >= ORBIT_CHUNK_SIZE) {
      this.chunkIndex += 1;
      this.chunk = generateOrbitChunk(this.seed, this.chunkIndex);
      this.stageOffset = 0;
    }
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.disarmExit();
    this.stage = this.currentStage();
    this.selectedRing = this.stage.startRing;
    this.lockIndex = 0;
    this.stageSwitches = 0;
    this.stageAssists = 0;
    this.feedback = null;
    this.accepting = true;
    this.stageStartedAt = performance.now();
    this.lastInputAt = -Infinity;
    this.updateControls();
    const stage = this.stage;
    this.deadlineTimer = this.setTimer(() => this.handleMiss('orbitTimeout'), stage.deadlineMs);
    if (this.previousZone && this.previousZone !== stage.zone) platformAudio.play('zone', stage.zone.length * 7);
    this.previousZone = stage.zone;
    this.dispatch('stage', { stage, snapshot: { ...this.snapshot }, selectedRing: this.selectedRing, lockIndex: this.lockIndex });
    this.onAnnounce({ key: 'orbitGate', values: { value: stage.index + 1 } });
  }

  zoneKey(zone) {
    return ({ halo: 'orbitZoneHalo', crossing: 'orbitZoneCrossing', cipher: 'orbitZoneCipher', surge: 'orbitZoneSurge' })[zone] || 'orbitZoneHalo';
  }

  ruleTextKey(stage) {
    if (stage.mechanic === 'align') return 'orbitRuleAlign';
    if (stage.mechanic === 'switch') return 'orbitRuleSwitch';
    if (stage.mechanic === 'polarity') return stage.rule === 'opposite' ? 'orbitRuleOpposite' : 'orbitRuleMatch';
    if (stage.mechanic === 'risk') return 'orbitRuleRisk';
    return 'orbitRuleRelay';
  }

  elapsed(now = performance.now()) {
    return clamp(now - this.stageStartedAt, 0, this.stage?.deadlineMs || 0);
  }

  selectRing(ring) {
    if (!this.running || !this.accepting || this.terminalPending) return;
    const safeRing = clamp(Math.trunc(Number(ring) || 0), 0, ORBIT_RING_COUNT - 1);
    if (safeRing === this.selectedRing) return;
    this.selectedRing = safeRing;
    this.stageSwitches += 1;
    this.snapshot.switches += 1;
    platformAudio.play('move', safeRing ? 70 : -50);
    this.updateControls();
    this.dispatch('selection', { stage: this.stage, selectedRing: safeRing, lockIndex: this.lockIndex });
    this.onAnnounce({ key: safeRing ? 'orbitMovedOuter' : 'orbitMovedInner' });
  }

  attempt(now = performance.now()) {
    if (!this.running || !this.accepting || this.terminalPending) return;
    if (now - this.lastInputAt < 170) return;
    this.lastInputAt = now;
    const evaluation = evaluateOrbitLock(this.stage, {
      elapsedMs: this.elapsed(now), selectedRing: this.selectedRing, lockIndex: this.lockIndex
    });
    this.snapshot.attempts += 1;
    if (!evaluation.hit) {
      this.handleMiss(evaluation.validRing ? 'orbitMissed' : 'orbitWrongOrbit');
      return;
    }

    const relayPartial = this.stage.mechanic === 'relay' && this.lockIndex === 0;
    const combo = relayPartial ? this.snapshot.combo : this.snapshot.combo + 1;
    const points = scoreOrbitLock(this.stage, evaluation, {
      combo, switches: this.stageSwitches, assistChecks: this.stageAssists, relayPartial
    });
    this.snapshot.score = clamp(this.snapshot.score + points, 0, 9999);
    this.snapshot.correct += 1;
    this.snapshot.precisionTotal += evaluation.precision;
    if (evaluation.gate.kind === 'risk') this.snapshot.riskLocks += 1;
    platformAudio.play('correct', evaluation.precision - 45);

    if (relayPartial) {
      this.lockIndex = 1;
      this.feedback = { type: 'hit', points, until: now + (this.reducedMotion ? 220 : 420) };
      this.stageStartedAt = now;
      this.clearTimer(this.deadlineTimer);
      this.deadlineTimer = this.setTimer(() => this.handleMiss('orbitTimeout'), this.stage.deadlineMs);
      this.selectedRing = this.stage.relaySequence[1];
      this.updateControls();
      this.dispatch('relay', { stage: this.stage, snapshot: { ...this.snapshot }, selectedRing: this.selectedRing, lockIndex: this.lockIndex, points });
      this.publishSnapshot();
      this.onAnnounce({ key: 'orbitRelayLocked', values: { step: 1, total: 2, points } });
      return;
    }

    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.snapshot.combo += 1;
    this.snapshot.bestCombo = Math.max(this.snapshot.bestCombo, this.snapshot.combo);
    this.snapshot.round += 1;
    if (this.stage.recovery && this.snapshot.lives < 3) {
      this.snapshot.lives += 1;
      this.onAnnounce({ key: 'orbitRecovery' });
    } else {
      this.onAnnounce({ key: 'orbitLocked', values: { points } });
    }
    this.feedback = { type: 'hit', points, until: now + (this.reducedMotion ? 220 : 480) };
    this.container.dataset.feedback = 'correct';
    this.publishSnapshot();
    this.dispatch('cleared', { stage: this.stage, snapshot: { ...this.snapshot }, points, evaluation });
    this.setTimer(() => {
      this.container.removeAttribute('data-feedback');
      this.stageOffset += 1;
      this.beginStage();
    }, this.reducedMotion ? 230 : 500);
  }

  handleMiss(key) {
    if (!this.running || !this.accepting || this.terminalPending) return;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    this.feedback = { type: 'miss', until: performance.now() + (this.reducedMotion ? 220 : 500) };
    this.container.dataset.feedback = 'wrong';
    platformAudio.play('wrong', -15);
    this.onAnnounce({ key });
    if (this.snapshot.lives <= 0) {
      this.terminalPending = true;
      this.disarmExit();
      this.exitButton.disabled = true;
    }
    this.publishSnapshot();
    this.dispatch('miss', { stage: this.stage, snapshot: { ...this.snapshot }, key });
    this.setTimer(() => {
      this.container.removeAttribute('data-feedback');
      if (this.snapshot.lives <= 0) this.finish('failed');
      else {
        this.stageOffset += 1;
        this.beginStage();
      }
    }, this.reducedMotion ? 240 : 520);
  }

  scanAlignment(now = performance.now()) {
    if (!this.running || !this.accepting || this.terminalPending || now - this.lastScanAt < 650) return;
    this.lastScanAt = now;
    this.stageAssists += 1;
    this.snapshot.assists += 1;
    const evaluation = evaluateOrbitLock(this.stage, {
      elapsedMs: this.elapsed(now), selectedRing: this.selectedRing, lockIndex: this.lockIndex
    });
    const band = orbitAlignmentBand(this.stage, evaluation);
    const key = ({ inside: 'orbitScanInside', near: 'orbitScanNear', far: 'orbitScanFar', 'wrong-ring': 'orbitScanWrongRing' })[band];
    platformAudio.play('cue', band === 'inside' ? 130 : band === 'near' ? 40 : -80);
    this.onAnnounce({ key });
    this.dispatch('scan', { band, stage: this.stage, selectedRing: this.selectedRing, lockIndex: this.lockIndex });
  }

  requestExit() {
    if (!this.running || this.terminalPending) return;
    if (this.exitArmed) {
      this.finish('ended');
      return;
    }
    this.exitArmed = true;
    this.dispatch('exit-armed');
    this.onAnnounce({ key: 'orbitExitConfirm' });
    this.clearTimer(this.exitTimer);
    this.exitTimer = this.setTimer(() => this.disarmExit(), 3000);
  }

  disarmExit() {
    this.clearTimer(this.exitTimer);
    this.exitTimer = null;
    if (!this.exitArmed) return;
    this.exitArmed = false;
    this.dispatch('exit-disarmed');
  }

  updateControls() {
    this.ringButtons.forEach((button, index) => {
      button.disabled = !this.running || !this.accepting || this.terminalPending;
      button.setAttribute('aria-pressed', String(index === this.selectedRing));
      button.classList.toggle('is-selected', index === this.selectedRing);
    });
    this.lockButton.disabled = !this.running || !this.accepting || this.terminalPending;
    this.scanButton.disabled = !this.running || !this.accepting || this.terminalPending;
    this.exitButton.disabled = !this.running || this.terminalPending;
  }

  publishSnapshot() {
    this.onUpdate({ ...this.snapshot });
    this.dispatch('snapshot', { snapshot: { ...this.snapshot } });
  }

  setTimer(callback, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, Math.max(0, delay));
    this.timers.add(timer);
    return timer;
  }

  clearTimer(timer) {
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  finish(reason) {
    if (!this.running || (reason === 'ended' && this.terminalPending)) return;
    this.running = false;
    this.accepting = false;
    this.terminalPending = true;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.disarmExit();
    this.updateControls();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    const summary = summarizeOrbitRun(this.snapshot);
    const result = { ...this.snapshot, ...summary, reason, durationMs: Math.round(performance.now() - this.startedAt) };
    this.publishSnapshot();
    this.dispatch('finish', { result });
    platformAudio.play('finish', reason === 'ended' ? 50 : -40);
    this.onFinish(result);
  }

  loop(time) {
    if (!this.running) return;
    this.draw(time);
    this.frame = requestAnimationFrame((next) => this.loop(next));
  }

  draw(time) {
    const stage = this.stage;
    if (!stage) return;
    const context = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const size = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radii = [size * 0.245, size * 0.355];
    const elapsed = this.elapsed(time);
    const markerAngle = orbitMarkerAngle(stage, elapsed);
    const background = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.72);
    background.addColorStop(0, '#192858');
    background.addColorStop(0.52, '#0b1435');
    background.addColorStop(1, '#050817');
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
    context.save();
    context.translate(centerX, centerY);
    context.lineCap = 'round';

    radii.forEach((radius, ring) => {
      context.strokeStyle = ring === this.selectedRing ? 'rgba(124, 246, 212, .52)' : 'rgba(147, 166, 235, .22)';
      context.lineWidth = size * (ring === this.selectedRing ? 0.018 : 0.012);
      context.beginPath();
      context.arc(0, 0, radius, 0, ORBIT_TAU);
      context.stroke();
    });

    const visibleGates = stage.mechanic === 'relay' ? [stage.relayGates[this.lockIndex]] : stage.gates;
    visibleGates.forEach((gate) => {
      const radius = radii[gate.ring];
      const angle = orbitGateAngle(stage, gate, elapsed);
      const palette = gate.kind === 'risk' ? '#ffcf6b' : gate.kind === 'safe' ? '#7cf6d4' : gate.kind === 'decoy' ? '#ff9fbc' : '#a99cff';
      context.strokeStyle = palette;
      context.shadowColor = palette;
      context.shadowBlur = this.reducedMotion ? 5 : 15;
      context.lineWidth = size * (gate.kind === 'decoy' ? 0.018 : 0.03);
      context.globalAlpha = gate.kind === 'decoy' ? 0.52 : 1;
      context.beginPath();
      context.arc(0, 0, radius, angle - gate.width / 2, angle + gate.width / 2);
      context.stroke();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      const labelX = Math.cos(angle) * radius;
      const labelY = Math.sin(angle) * radius;
      context.fillStyle = palette;
      context.font = `800 ${Math.round(size * 0.035)}px system-ui, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(gate.kind === 'risk' ? '★' : gate.kind === 'safe' ? '◇' : gate.symbol || '◆', labelX, labelY);
    });

    const markerRadius = radii[this.selectedRing];
    const markerX = Math.cos(markerAngle) * markerRadius;
    const markerY = Math.sin(markerAngle) * markerRadius;
    const pulse = this.reducedMotion ? 1 : 1 + Math.sin(time / 180) * 0.08;
    context.fillStyle = '#ffffff';
    context.shadowColor = '#86a6ff';
    context.shadowBlur = this.reducedMotion ? 8 : 20;
    context.beginPath();
    context.arc(markerX, markerY, size * 0.027 * pulse, 0, ORBIT_TAU);
    context.fill();
    context.strokeStyle = '#5f83ff';
    context.lineWidth = size * 0.009;
    context.stroke();
    context.shadowBlur = 0;

    context.fillStyle = '#f5f7ff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `850 ${Math.round(size * 0.09)}px system-ui, sans-serif`;
    context.fillText(String(this.snapshot.score), 0, -size * 0.015);
    context.fillStyle = '#aebbe8';
    context.font = `750 ${Math.round(size * 0.03)}px system-ui, sans-serif`;
    const progress = Math.max(0, 1 - elapsed / stage.deadlineMs);
    context.fillText(`${stage.index + 1} · ${Math.round(progress * 100)}%`, 0, size * 0.075);

    if (this.feedback && time < this.feedback.until) {
      context.fillStyle = this.feedback.type === 'hit' ? '#7cf6d4' : '#ff9fbc';
      context.font = `900 ${Math.round(size * 0.046)}px system-ui, sans-serif`;
      context.fillText(this.feedback.type === 'hit' ? `+${this.feedback.points}` : '×', 0, size * 0.15);
    }
    context.restore();
  }

  destroy() {
    this.running = false;
    this.accepting = false;
    this.terminalPending = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.abortController?.abort();
    this.abortController = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.exitArmed = false;
    this.feedback = null;
    this.previousZone = null;
    this.container?.removeAttribute('data-feedback');
    this.updateControls();
  }
}
