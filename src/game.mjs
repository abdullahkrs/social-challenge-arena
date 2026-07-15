import './audio-integration.mjs';
import './orbit-copy.mjs';
import { clamp } from './core.mjs';
import { platformAudio } from './audio.mjs';
import { normalizeLanguage, translate } from './i18n.mjs';
import {
  evaluateOrbitWindow, generateOrbitChunk, ORBIT_CHUNK_SIZE, ORBIT_LANES, ORBIT_TURN,
  scoreOrbitLock, summarizeOrbitRun
} from './orbit-model.mjs';

const TAU = Math.PI * 2;
const ZONE_KEYS = Object.freeze({ halo: 'orbitZoneHalo', switchyard: 'orbitZoneSwitchyard', eclipse: 'orbitZoneEclipse', crown: 'orbitZoneCrown' });
const RULE_KEYS = Object.freeze({ direct: 'orbitRuleDirect', lane: 'orbitRuleLane', opposite: 'orbitRuleOpposite', sequence: 'orbitRuleSequence' });
const RING_KEYS = Object.freeze(['orbitRingInner', 'orbitRingMiddle', 'orbitRingOuter']);
const ZONE_COLORS = Object.freeze({
  halo: ['#7cf6d4', '#7897ff'], switchyard: ['#ffd47a', '#7cf6d4'],
  eclipse: ['#ff9fbc', '#7897ff'], crown: ['#d9b3ff', '#7cf6d4']
});

function installStylesheet(document) {
  if (document.querySelector('link[data-orbit-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./orbit.css', import.meta.url).href;
  link.dataset.orbitStyle = '';
  document.head.append(link);
}

function shellMarkup() {
  return `<div class="orbit-run-head" aria-hidden="true"><span><b data-orbit-zone></b><i>•</i><em data-orbit-rule></em></span><strong data-orbit-progress></strong></div>
    <p class="orbit-status" data-orbit-status data-state="approach"></p>
    <div class="orbit-actions" role="group" data-orbit-actions>
      <button type="button" data-orbit-in><span aria-hidden="true">−</span><small></small></button>
      <button type="button" class="orbit-lock" data-orbit-lock data-ready="false"><span aria-hidden="true">◎</span><small></small></button>
      <button type="button" data-orbit-out><span aria-hidden="true">＋</span><small></small></button>
    </div>
    <button type="button" class="ghost orbit-exit" data-orbit-exit></button>`;
}

function patchCatalog(document) {
  const value = document.querySelector('[data-challenge-id="orbit-lock"] [data-duration]');
  if (!value) return;
  const endless = translate(normalizeLanguage(document.documentElement.lang), 'endless');
  if (value.textContent !== endless) value.textContent = endless;
}

if (typeof document !== 'undefined') {
  installStylesheet(document);
  queueMicrotask(() => patchCatalog(document));
  new MutationObserver(() => patchCatalog(document)).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
}

export class OrbitLockGame {
  constructor({ canvas, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('canvas is required');
    this.canvas = canvas;
    this.document = canvas.ownerDocument;
    this.window = this.document.defaultView;
    this.context = canvas.getContext('2d', { alpha: false });
    if (!this.context) throw new Error('2D canvas is not available');
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.runtime = this.document.createElement('div');
    this.runtime.className = 'orbit-runtime';
    this.runtime.dir = 'ltr';
    this.runtime.innerHTML = shellMarkup();
    this.canvas.after(this.runtime);
    this.zoneValue = this.runtime.querySelector('[data-orbit-zone]');
    this.ruleValue = this.runtime.querySelector('[data-orbit-rule]');
    this.progressValue = this.runtime.querySelector('[data-orbit-progress]');
    this.statusValue = this.runtime.querySelector('[data-orbit-status]');
    this.inButton = this.runtime.querySelector('[data-orbit-in]');
    this.outButton = this.runtime.querySelector('[data-orbit-out]');
    this.lockButton = this.runtime.querySelector('[data-orbit-lock]');
    this.exitButton = this.runtime.querySelector('[data-orbit-exit]');
    this.abortController = null;
    this.resizeObserver = null;
    this.languageObserver = null;
    this.timers = new Set();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.frame = 0;
    this.running = false;
    this.accepting = false;
    this.terminalPending = false;
    this.exitArmed = false;
    this.feedback = null;
    this.feedbackUntil = 0;
    this.particles = [];
    this.windowOpen = false;
    this.announcedCycle = -1;
    this.lastMoveAt = -Infinity;
    this.lastLockAt = -Infinity;
    this.lastAccessibleUpdate = 0;
  }

  emptySnapshot() {
    return { score: 0, round: 0, rounds: 1, lives: 3, combo: 0, bestCombo: 0, gates: 0, attempts: 0, riskLocks: 0, precisionTotal: 0 };
  }

  language() { return normalizeLanguage(this.document.documentElement.lang); }
  t(key, values = {}) { return translate(this.language(), key, values); }
  zoneText(stage = this.stage) { return this.t(ZONE_KEYS[stage?.zone] || 'orbitZoneHalo'); }
  ruleText(stage = this.stage) { return this.t(RULE_KEYS[stage?.mechanic] || 'orbitRuleDirect'); }
  ringText(lane = this.currentLane) { return this.t(RING_KEYS[clamp(Number(lane) || 0, 0, ORBIT_LANES - 1)]); }

  schedule(callback, delay) {
    const timer = setTimeout(() => { this.timers.delete(timer); callback(); }, delay);
    this.timers.add(timer);
    return timer;
  }

  clearTimer(timer) {
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  start(seed) {
    this.stopRuntime();
    this.abortController = new AbortController();
    this.seed = Number(seed) >>> 0;
    this.chunkIndex = 0;
    this.chunk = generateOrbitChunk(this.seed, 0);
    this.stageIndex = 0;
    this.currentLane = 1;
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.accepting = false;
    this.terminalPending = false;
    this.exitArmed = false;
    this.startedAt = performance.now();
    this.runtime.dataset.reduced = String(this.reducedMotion);
    this.installListeners();
    this.installLanguageObserver();
    this.resize();
    this.emitSnapshot();
    this.showStage();
    this.frame = requestAnimationFrame((time) => this.loop(time));
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.inButton.addEventListener('click', () => this.move(-1), { signal });
    this.outButton.addEventListener('click', () => this.move(1), { signal });
    this.lockButton.addEventListener('click', () => this.lock(), { signal });
    this.exitButton.addEventListener('click', () => this.requestExit(), { signal });
    this.canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const position = rect.width ? (event.clientX - rect.left) / rect.width : 0.5;
      if (position < 0.34) this.move(-1);
      else if (position > 0.66) this.move(1);
      else this.lock();
    }, { signal });
    this.canvas.addEventListener('keydown', (event) => {
      if (!this.running) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); this.move(-1); }
      else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); this.move(1); }
      else if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); this.lock(); }
    }, { signal });
    this.window.addEventListener('resize', () => this.resize(), { signal, passive: true });
    if ('ResizeObserver' in this.window) {
      this.resizeObserver = new this.window.ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
    }
  }

  installLanguageObserver() {
    if (typeof MutationObserver !== 'function') return;
    this.languageObserver = new MutationObserver(() => this.refreshLanguage());
    this.languageObserver.observe(this.document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
  }

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    this.runtime.dataset.reduced = String(this.reducedMotion);
    if (this.reducedMotion) this.particles = [];
  }

  currentStage() {
    const chunkIndex = Math.floor(this.stageIndex / ORBIT_CHUNK_SIZE);
    if (chunkIndex !== this.chunkIndex) {
      this.chunkIndex = chunkIndex;
      this.chunk = generateOrbitChunk(this.seed, chunkIndex);
    }
    return this.chunk[this.stageIndex % ORBIT_CHUNK_SIZE];
  }

  showStage() {
    if (!this.running) return;
    this.disarmExit();
    this.terminalPending = false;
    this.exitButton.disabled = false;
    this.clearTimer(this.deadlineTimer);
    this.stage = this.currentStage();
    this.stageStartedAt = performance.now();
    this.stageMoves = 0;
    this.accepting = true;
    this.windowOpen = false;
    this.announcedCycle = -1;
    this.feedback = null;
    this.runtime.removeAttribute('data-feedback');
    this.runtime.dataset.phase = this.stage.phase;
    this.deadlineTimer = this.schedule(() => this.resolveMiss('timeout'), this.stage.deadlineMs);
    this.renderText();
    this.emitSnapshot();
    const sequence = this.stage.sequence.map((lane) => this.ringText(lane)).join(', ');
    const extraKey = this.stage.mechanic === 'sequence'
      ? (this.stage.memoryRule === 'first' ? 'orbitSequenceFirst' : 'orbitSequenceLast')
      : null;
    this.onAnnounce({
      key: 'orbitStageReady',
      values: { value: this.stage.index + 1, rule: this.ruleText(), lane: this.ringText() },
      extraKey, extraValues: { sequence }
    });
    if (this.stage.milestone || this.stage.special) platformAudio.play('zone', (this.stage.index % 5) * 18);
  }

  refreshLanguage() {
    patchCatalog(this.document);
    if (!this.stage) return;
    this.renderText();
    this.refreshAccessibility(this.windowOpen);
  }

  renderText() {
    this.zoneValue.textContent = this.zoneText();
    this.ruleValue.textContent = this.ruleText();
    this.progressValue.textContent = this.t('orbitGate', { value: this.stage.index + 1 });
    this.inButton.querySelector('small').textContent = this.t('orbitMoveIn');
    this.outButton.querySelector('small').textContent = this.t('orbitMoveOut');
    this.lockButton.querySelector('small').textContent = this.t('orbitLock');
    this.inButton.setAttribute('aria-label', `${this.t('orbitMoveIn')}. ${this.ringText()}`);
    this.outButton.setAttribute('aria-label', `${this.t('orbitMoveOut')}. ${this.ringText()}`);
    this.lockButton.setAttribute('aria-label', this.t('orbitLock'));
    this.exitButton.textContent = this.t(this.exitArmed ? 'orbitExitNow' : 'orbitEndRun');
    this.exitButton.disabled = this.terminalPending;
    this.canvas.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Space Enter');
    this.runtime.querySelector('[data-orbit-actions]').setAttribute('aria-label', this.t('orbitArenaLabel'));
    this.refreshAccessibility(this.windowOpen);
  }

  refreshAccessibility(open) {
    const status = this.t(open ? 'orbitAligned' : 'orbitApproaching');
    this.statusValue.textContent = status;
    this.statusValue.dataset.state = open ? 'ready' : 'approach';
    this.lockButton.dataset.ready = String(open);
    const state = this.t('orbitState', { zone: this.zoneText(), rule: this.ruleText(), lane: this.ringText(), status });
    this.canvas.setAttribute('aria-label', `${this.t('orbitArenaLabel')}. ${state}`);
    this.lockButton.setAttribute('aria-label', `${this.t('orbitLock')}. ${state}`);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(this.window.devicePixelRatio || 1, 2);
    const width = Math.max(280, Math.round(rect.width * ratio));
    const height = Math.max(280, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  emitSnapshot() {
    this.snapshot.rounds = Math.max(1, this.snapshot.round + 1);
    this.onUpdate({ ...this.snapshot });
    const roundValue = this.document.querySelector('#round-value');
    const roundLabel = roundValue?.closest('div')?.querySelector('span');
    if (roundLabel) roundLabel.textContent = this.t('orbitGateLabel');
    if (roundValue) roundValue.textContent = String(this.stageIndex + 1);
  }

  move(delta) {
    if (!this.running || !this.accepting) return;
    const now = performance.now();
    if (now - this.lastMoveAt < 70) return;
    this.lastMoveAt = now;
    const next = clamp(this.currentLane + Math.sign(delta), 0, ORBIT_LANES - 1);
    if (next === this.currentLane) return;
    this.currentLane = next;
    this.stageMoves += 1;
    platformAudio.play('move', (next - 1) * 28);
    this.renderText();
    this.onAnnounce({ key: 'orbitStageReady', values: { value: this.stage.index + 1, rule: this.ruleText(), lane: this.ringText() } });
  }

  lock() {
    if (!this.running || !this.accepting) return;
    const now = performance.now();
    if (now - this.lastLockAt < 140) return;
    this.lastLockAt = now;
    this.snapshot.attempts += 1;
    platformAudio.play('cue', (this.currentLane - 1) * 24);
    const result = scoreOrbitLock({ stage: this.stage, elapsedMs: now - this.stageStartedAt, lane: this.currentLane, moves: this.stageMoves, combo: this.snapshot.combo + 1 });
    if (result.hit) this.resolveSuccess(result);
    else this.resolveMiss(result.kind === 'lane' ? 'lane' : 'timing');
  }

  resolveSuccess(result) {
    if (!this.running || !this.accepting) return;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    const combo = this.snapshot.combo + 1;
    this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.bestCombo = Math.max(this.snapshot.bestCombo, combo);
    this.snapshot.gates += 1;
    this.snapshot.precisionTotal += result.precision;
    this.snapshot.round = this.stageIndex + 1;
    if (result.risk) this.snapshot.riskLocks += 1;
    let restored = false;
    if (this.stage.restoresChance && this.snapshot.lives < 3) { this.snapshot.lives += 1; restored = true; }
    this.feedback = { type: 'correct', points: result.points };
    this.feedbackUntil = performance.now() + (this.reducedMotion ? 260 : 620);
    this.runtime.dataset.feedback = 'correct';
    this.spawnParticles(result.risk ? this.stage.riskGateTick : this.stage.gateTick, result.risk);
    this.emitSnapshot();
    platformAudio.play('correct', Math.min(140, combo * 9 + (result.risk ? 40 : 0)));
    this.onAnnounce({ key: result.risk ? 'orbitRiskCorrect' : 'orbitCorrect', values: { points: result.points }, extraKey: restored ? 'orbitRecovery' : null });
    this.schedule(() => this.advanceStage(), this.reducedMotion ? 280 : 650);
  }

  resolveMiss(kind) {
    if (!this.running || !this.accepting) return;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    if (kind === 'timeout') this.snapshot.attempts += 1;
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    this.snapshot.round = this.stageIndex + 1;
    if (this.snapshot.lives <= 0) {
      this.terminalPending = true;
      this.disarmExit();
      this.exitButton.disabled = true;
    }
    this.feedback = { type: 'wrong' };
    this.feedbackUntil = performance.now() + (this.reducedMotion ? 280 : 700);
    this.runtime.dataset.feedback = 'wrong';
    this.emitSnapshot();
    platformAudio.play('wrong', kind === 'timeout' ? -70 : -25);
    this.onAnnounce({ key: kind === 'lane' ? 'orbitWrongLane' : kind === 'timeout' ? 'orbitTimeout' : 'orbitMiss' });
    if (this.terminalPending) { this.schedule(() => this.finish('failed'), this.reducedMotion ? 320 : 760); return; }
    this.schedule(() => this.advanceStage(), this.reducedMotion ? 330 : 780);
  }

  advanceStage() {
    if (!this.running) return;
    this.stageIndex += 1;
    this.showStage();
  }

  requestExit() {
    if (!this.running || this.terminalPending) return;
    if (this.exitArmed) { this.disarmExit(); this.finish('ended'); return; }
    this.exitArmed = true;
    this.exitButton.textContent = this.t('orbitExitNow');
    this.onAnnounce({ key: 'orbitExitConfirm' });
    this.exitTimer = this.schedule(() => this.disarmExit(), 3000);
  }

  disarmExit() {
    if (!this.exitArmed && !this.exitTimer) return;
    this.exitArmed = false;
    this.clearTimer(this.exitTimer);
    this.exitTimer = null;
    if (this.exitButton) this.exitButton.textContent = this.t('orbitEndRun');
  }

  finish(reason) {
    if (!this.running || (reason === 'ended' && this.terminalPending)) return;
    this.running = false;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.disarmExit();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    const result = { ...this.snapshot, ...summarizeOrbitRun(this.snapshot), reason, durationMs: Math.round(performance.now() - this.startedAt) };
    this.onUpdate({ ...this.snapshot });
    platformAudio.play('finish', reason === 'ended' ? 35 : -35);
    this.onFinish(result);
    queueMicrotask(() => this.renderResult(result));
  }

  renderResult(result) {
    const detail = this.document.querySelector('#result-detail');
    const summary = this.document.querySelector('#result-summary');
    if (detail) {
      detail.hidden = false;
      detail.textContent = this.t('orbitResultDetail', { gates: result.gates, combo: result.bestCombo, accuracy: result.accuracy, risk: result.riskLocks });
    }
    if (summary && result.reason === 'ended') summary.textContent = this.t('orbitEnded');
  }

  spawnParticles(tick, risk) {
    if (this.reducedMotion) return;
    const angle = tick / ORBIT_TURN * TAU;
    for (let index = 0; index < 12; index += 1) this.particles.push({ angle: angle + (index - 5.5) * .045, radius: .65, speed: .15 + index * .005, life: 1, risk });
    if (this.particles.length > 24) this.particles.splice(0, this.particles.length - 24);
  }

  loop(time) {
    if (!this.running) return;
    this.updateParticles(1 / 60);
    const elapsed = Math.max(0, time - this.stageStartedAt);
    const windowState = evaluateOrbitWindow(this.stage, { elapsedMs: elapsed, lane: this.currentLane });
    const open = windowState.hit;
    if (open !== this.windowOpen && time - this.lastAccessibleUpdate > 120) {
      this.windowOpen = open;
      this.lastAccessibleUpdate = time;
      this.refreshAccessibility(open);
    }
    if (open) {
      const cycle = Math.floor(elapsed / this.stage.periodMs);
      if (cycle !== this.announcedCycle) { this.announcedCycle = cycle; this.onAnnounce({ key: 'orbitWindowOpen' }); }
    }
    this.draw(time, elapsed, windowState.position);
    this.frame = requestAnimationFrame((next) => this.loop(next));
  }

  updateParticles(delta) {
    this.particles = this.particles.map((particle) => ({ ...particle, radius: particle.radius + particle.speed * delta, life: particle.life - delta * 1.75 })).filter((particle) => particle.life > 0);
  }

  draw(time, elapsed, position) {
    const c = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const size = Math.min(width, height);
    const cx = width / 2;
    const cy = height / 2;
    const colors = ZONE_COLORS[this.stage.zone] || ZONE_COLORS.halo;
    const bg = c.createRadialGradient(cx, cy, 0, cx, cy, size * .72);
    bg.addColorStop(0, '#182550'); bg.addColorStop(.55, '#0b1230'); bg.addColorStop(1, '#060916');
    c.fillStyle = bg; c.fillRect(0, 0, width, height);
    c.save(); c.translate(cx, cy); c.lineCap = 'round';
    const radii = [size * .22, size * .31, size * .40];
    radii.forEach((radius, lane) => {
      c.strokeStyle = lane === this.currentLane ? 'rgba(255,255,255,.38)' : 'rgba(133,159,255,.18)';
      c.lineWidth = size * (lane === this.currentLane ? .018 : .012);
      c.beginPath(); c.arc(0, 0, radius, 0, TAU); c.stroke();
    });
    this.drawGate(c, radii[this.stage.targetLane], this.stage.gateTick, this.stage.gateWidth, colors[0], '◇');
    if (this.stage.riskLane !== null) this.drawGate(c, radii[this.stage.riskLane], this.stage.riskGateTick, this.stage.riskWidth, '#ffd47a', '★');
    for (const decoy of this.stage.decoys) this.drawGate(c, radii[decoy.lane], decoy.tick, decoy.width, '#ff9fbc', '×', true);
    const angle = position / ORBIT_TURN * TAU;
    const radius = radii[this.currentLane];
    const pulse = this.reducedMotion ? 1 : 1 + Math.sin(time / 160) * .08;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    c.fillStyle = '#fff'; c.shadowColor = colors[1]; c.shadowBlur = this.reducedMotion ? 7 : 22;
    c.save(); c.translate(x, y); c.rotate(angle + Math.PI / 4); c.fillRect(-size * .024 * pulse, -size * .024 * pulse, size * .048 * pulse, size * .048 * pulse); c.restore();
    c.shadowBlur = 0;
    c.fillStyle = '#f5f7ff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `800 ${Math.round(size * .085)}px system-ui,sans-serif`; c.fillText(String(this.snapshot.score), 0, -size * .02);
    c.fillStyle = '#aebbe8'; c.font = `700 ${Math.round(size * .032)}px system-ui,sans-serif`;
    c.fillText(`${this.stage.index + 1} · ${this.stage.mechanic === 'opposite' ? '↔' : this.stage.mechanic === 'sequence' ? '1·2' : '◇'}`, 0, size * .075);
    const progress = clamp(elapsed / this.stage.deadlineMs, 0, 1);
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = size * .015; c.beginPath(); c.arc(0, 0, size * .13, -.5 * Math.PI, 1.5 * Math.PI); c.stroke();
    c.strokeStyle = progress > .78 ? '#ff9fbc' : colors[0]; c.beginPath(); c.arc(0, 0, size * .13, -.5 * Math.PI, -.5 * Math.PI + TAU * progress); c.stroke();
    for (const particle of this.particles) {
      c.globalAlpha = particle.life; c.fillStyle = particle.risk ? '#ffd47a' : colors[0];
      c.beginPath(); c.arc(Math.cos(particle.angle) * size * particle.radius, Math.sin(particle.angle) * size * particle.radius, size * .007, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
    if (this.feedback && time < this.feedbackUntil) {
      c.fillStyle = this.feedback.type === 'correct' ? colors[0] : '#ff9fbc';
      c.font = `900 ${Math.round(size * .047)}px system-ui,sans-serif`;
      c.fillText(this.feedback.type === 'correct' ? `+${this.feedback.points}` : '×', 0, size * .18);
    }
    c.restore();
  }

  drawGate(context, radius, tick, width, color, symbol, dashed = false) {
    const center = tick / ORBIT_TURN * TAU;
    const arcWidth = width / ORBIT_TURN * TAU;
    context.save();
    context.strokeStyle = color;
    context.lineWidth = Math.max(8, this.canvas.width * .015);
    context.setLineDash(dashed ? [8, 8] : []);
    context.beginPath(); context.arc(0, 0, radius, center - arcWidth / 2, center + arcWidth / 2); context.stroke();
    context.setLineDash([]);
    context.fillStyle = color; context.font = `900 ${Math.round(this.canvas.width * .026)}px system-ui,sans-serif`;
    context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillText(symbol, Math.cos(center) * radius, Math.sin(center) * radius);
    context.restore();
  }

  stopRuntime() {
    this.running = false;
    this.accepting = false;
    this.terminalPending = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.abortController?.abort();
    this.abortController = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.languageObserver?.disconnect();
    this.languageObserver = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.exitArmed = false;
    this.particles = [];
    if (this.exitButton) this.exitButton.disabled = false;
  }

  destroy() {
    this.stopRuntime();
    const roundValue = this.document.querySelector('#round-value');
    const roundLabel = roundValue?.closest('div')?.querySelector('span');
    if (roundLabel) roundLabel.textContent = this.t('round');
    this.runtime?.remove();
  }
}
