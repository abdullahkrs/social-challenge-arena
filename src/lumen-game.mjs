import { clamp, lumenPlan } from './core.mjs';
import {
  composeLumenStage, evaluateLumenChoice, lumenChunkSeed, LUMEN_CHUNK_SIZE, scoreEndlessLumen, summarizeLumenRun
} from './lumen-model.mjs';

const CUES = ['←', '◆', '→'];
const BASE_PROMPTS = ['lanePromptLeft', 'lanePromptCenter', 'lanePromptRight'];

export class LumenLanesGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.cue = container.querySelector('[data-lumen-cue]');
    this.sequence = container.querySelector('[data-lumen-sequence]');
    this.player = container.querySelector('[data-lumen-player]');
    this.buttons = [...container.querySelectorAll('[data-lane]')];
    this.exitButton = container.querySelector('[data-lumen-exit]');
    if (!this.cue || !this.sequence || !this.player || this.buttons.length !== 3 || !this.exitButton) {
      throw new Error('Lumen Lanes requires a cue, sequence, player, three lanes, and deliberate exit');
    }
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.timers = new Set();
    this.running = false;
    this.accepting = false;
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.exitArmed = false;
    this.chunkIndex = 0;
    this.currentStage = null;
  }

  emptySnapshot() {
    return {
      score: 0, round: 0, rounds: Number.MAX_SAFE_INTEGER, lives: 3, combo: 0, precision: 0,
      attempts: 0, correct: 0, bestCombo: 0, endless: true
    };
  }

  emit(name, detail = {}) {
    this.container.dispatchEvent(new CustomEvent(`lumen:${name}`, {
      bubbles: true,
      detail: { ...detail, seed: this.seed }
    }));
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.seed = Number(seed) >>> 0;
    this.chunkIndex = 0;
    this.plan = lumenPlan(seed, 18);
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.accepting = false;
    this.startedAt = performance.now();
    this.container.dataset.reduced = String(this.reducedMotion);
    this.installListeners();
    this.resetVisuals();
    this.publishSnapshot();
    this.emit('start', { snapshot: { ...this.snapshot } });
    this.schedule(() => this.showRound(), 360);
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.activate(index), { signal });
    });
    this.container.addEventListener('keydown', (event) => {
      if (!this.running || !this.accepting) return;
      const lane = ({ ArrowLeft: 0, ArrowDown: 1, ArrowUp: 1, ArrowRight: 2 })[event.key];
      if (lane === undefined) return;
      event.preventDefault();
      this.activate(lane);
    }, { signal });
    this.exitButton.addEventListener('click', () => this.requestExit(), { signal });
  }

  schedule(callback, delay) {
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

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    this.container.dataset.reduced = String(this.reducedMotion);
  }

  resetVisuals() {
    this.container.removeAttribute('data-target');
    this.container.removeAttribute('data-feedback');
    this.container.removeAttribute('data-mechanic');
    this.container.removeAttribute('data-phase');
    this.container.removeAttribute('data-zone');
    this.container.removeAttribute('data-exit-armed');
    this.cue.textContent = '◆';
    this.sequence.hidden = true;
    this.sequence.textContent = '';
    this.player.style.setProperty('--player-lane', '1');
    this.buttons.forEach((button) => {
      button.disabled = true;
      button.classList.remove('is-correct', 'is-wrong', 'is-blocked', 'is-risk');
      button.removeAttribute('data-marker');
    });
    this.exitButton.disabled = false;
    this.exitArmed = false;
  }

  stageAt(index) {
    const requiredChunk = Math.floor(index / LUMEN_CHUNK_SIZE);
    if (requiredChunk !== this.chunkIndex) {
      this.chunkIndex = requiredChunk;
      this.plan = lumenPlan(lumenChunkSeed(this.seed, requiredChunk), LUMEN_CHUNK_SIZE);
    }
    return composeLumenStage(this.seed, index, this.plan[index % LUMEN_CHUNK_SIZE]);
  }

  prepareStage(stage) {
    this.currentStage = stage;
    this.accepting = false;
    this.container.removeAttribute('data-feedback');
    this.container.removeAttribute('data-target');
    this.container.dataset.mechanic = stage.mechanic;
    this.container.dataset.phase = stage.phase;
    this.container.dataset.zone = stage.zone;
    this.container.style.setProperty('--lane-drift', String(stage.drift));
    this.buttons.forEach((button) => {
      button.disabled = false;
      button.classList.remove('is-correct', 'is-wrong', 'is-blocked', 'is-risk');
      button.removeAttribute('data-marker');
    });
    if (stage.mechanic === 'choice') {
      this.buttons[stage.blockedLane].classList.add('is-blocked');
      this.buttons[stage.blockedLane].dataset.marker = '×';
      this.buttons[stage.riskLane].classList.add('is-risk');
      this.buttons[stage.riskLane].dataset.marker = '★';
    }
    this.emit('stage', { stage, snapshot: { ...this.snapshot } });
  }

  showRound() {
    if (!this.running) return;
    const stage = this.stageAt(this.snapshot.round);
    this.prepareStage(stage);

    if (stage.mechanic === 'memory') {
      this.playMemorySequence(stage);
      return;
    }

    this.sequence.hidden = true;
    this.sequence.textContent = '';
    this.cue.textContent = stage.mechanic === 'choice' ? '×' : CUES[stage.cueLane];
    this.accepting = true;
    this.roundStartedAt = performance.now();
    if (!this.container.contains(document.activeElement)) this.buttons[1].focus({ preventScroll: true });
    const promptKey = stage.mechanic === 'mirror'
      ? 'lumenMirrorPrompt'
      : stage.mechanic === 'choice'
        ? 'lumenChoicePrompt'
        : BASE_PROMPTS[stage.cueLane];
    this.onAnnounce({ key: promptKey });
    this.deadlineTimer = this.schedule(() => this.resolveMiss('slow'), stage.deadlineMs);
  }

  playMemorySequence(stage) {
    this.sequence.hidden = false;
    this.sequence.textContent = '';
    this.cue.textContent = '•';
    const watchKey = stage.memoryRule === 'first' ? 'lumenMemoryWatchFirst' : 'lumenMemoryWatchLast';
    this.onAnnounce({ key: watchKey, values: { count: stage.sequence.length } });
    const stepMs = Math.max(220, Math.round(stage.previewMs / stage.sequence.length));

    stage.sequence.forEach((lane, index) => {
      this.schedule(() => {
        if (!this.running || this.currentStage !== stage) return;
        this.cue.textContent = CUES[lane];
        this.sequence.textContent = stage.sequence.slice(0, index + 1).map((value) => CUES[value]).join(' ');
      }, index * stepMs);
    });

    this.schedule(() => {
      if (!this.running || this.currentStage !== stage) return;
      this.cue.textContent = '?';
      this.sequence.textContent = stage.sequence.map(() => '•').join(' ');
      this.accepting = true;
      this.roundStartedAt = performance.now();
      const chooseKey = stage.memoryRule === 'first' ? 'lumenMemoryChooseFirst' : 'lumenMemoryChooseLast';
      this.onAnnounce({ key: chooseKey });
      this.deadlineTimer = this.schedule(() => this.resolveMiss('slow'), stage.deadlineMs);
    }, stage.previewMs + 140);
  }

  activate(index) {
    if (!this.running || !this.accepting || !this.currentStage) return;
    this.player.style.setProperty('--player-lane', String(index));
    const outcome = evaluateLumenChoice(this.currentStage, index);
    if (outcome.correct) {
      this.resolveHit(index, this.currentStage, outcome.risk);
    } else {
      this.resolveMiss(outcome.reason === 'blocked' ? 'blocked' : 'wrong', index);
    }
  }

  resolveHit(index, stage, risk = false) {
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    const combo = this.snapshot.combo + 1;
    const result = scoreEndlessLumen({
      stage,
      elapsedMs: performance.now() - this.roundStartedAt,
      combo,
      risk
    });
    this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.bestCombo = Math.max(this.snapshot.bestCombo, combo);
    this.snapshot.precision = result.precision;
    this.snapshot.round += 1;
    this.snapshot.attempts += 1;
    this.snapshot.correct += 1;
    this.container.dataset.feedback = 'correct';
    this.cue.textContent = risk ? '★' : '✓';
    this.buttons[index].classList.add('is-correct');
    this.buttons.forEach((button) => { button.disabled = true; });
    this.publishSnapshot();
    this.onAnnounce({ key: risk ? 'lumenRiskCleared' : 'lumenGateCleared', values: { points: result.points } });
    this.advance(stage);
  }

  resolveMiss(kind, index = null) {
    if (!this.running || !this.accepting) return;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    this.snapshot.precision = 0;
    this.snapshot.round += 1;
    this.snapshot.attempts += 1;
    this.container.dataset.feedback = 'wrong';
    this.cue.textContent = '×';
    if (index !== null) this.buttons[index]?.classList.add('is-wrong');
    this.buttons.forEach((button) => { button.disabled = true; });
    this.publishSnapshot();
    this.onAnnounce({ key: kind === 'slow' ? 'laneTooSlow' : kind === 'blocked' ? 'lumenBlocked' : 'laneWrong' });
    if (this.snapshot.lives <= 0) {
      this.schedule(() => this.finish('failed'), 440);
      return;
    }
    this.advance(this.currentStage);
  }

  publishSnapshot() {
    const snapshot = { ...this.snapshot };
    this.onUpdate(snapshot);
    this.emit('snapshot', { snapshot, stage: this.currentStage });
  }

  advance(stage) {
    const delay = stage?.phase === 'recovery' ? 760 : stage?.special ? 620 : 500;
    this.schedule(() => this.showRound(), delay);
  }

  requestExit() {
    if (!this.running) return;
    if (this.exitArmed) {
      this.finish('ended');
      return;
    }
    this.exitArmed = true;
    this.container.dataset.exitArmed = 'true';
    this.onAnnounce({ key: 'lumenExitConfirm' });
    this.emit('exit-armed', {});
    this.clearTimer(this.exitTimer);
    this.exitTimer = this.schedule(() => {
      this.exitArmed = false;
      this.container.removeAttribute('data-exit-armed');
      this.emit('exit-disarmed', {});
    }, 3000);
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.clearTimer(this.exitTimer);
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.buttons.forEach((button) => { button.disabled = true; });
    const summary = summarizeLumenRun(this.snapshot);
    const result = {
      ...this.snapshot,
      ...summary,
      reason,
      durationMs: Math.round(performance.now() - this.startedAt)
    };
    this.publishSnapshot();
    this.emit('finish', { result });
    this.onFinish(result);
  }

  destroy() {
    this.running = false;
    this.accepting = false;
    this.abortController?.abort();
    this.abortController = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.currentStage = null;
    if (this.container && this.cue && this.buttons) {
      this.resetVisuals();
      this.emit('destroy', {});
    }
  }
}
