import { clamp } from './core.mjs';
import {
  composeEchoStage, echoChunk, echoChunkSeed, ECHO_CHUNK_SIZE, evaluateEchoMove,
  initialEchoProgress, scoreEndlessEcho, summarizeEchoRun
} from './echo-model.mjs';

export class EchoGridGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.board = container.querySelector('[data-echo-board]');
    this.buttons = [...container.querySelectorAll('[data-cell]')];
    this.memoryActions = container.querySelector('[data-echo-memory-actions]');
    this.repeatButton = container.querySelector('[data-echo-repeat]');
    this.readyButton = container.querySelector('[data-echo-ready]');
    this.exitButton = container.querySelector('[data-echo-exit]');
    if (!this.board || this.buttons.length !== 9 || !this.memoryActions || !this.repeatButton || !this.readyButton || !this.exitButton) {
      throw new Error('Echo Grid requires a nine-cell board, memory controls, and deliberate exit');
    }
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.timers = new Set();
    this.previewTimers = new Set();
    this.running = false;
    this.accepting = false;
    this.terminalPending = false;
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.exitArmed = false;
    this.currentStage = null;
    this.progress = null;
    this.chunkIndex = 0;
  }

  emptySnapshot() {
    return {
      score: 0, round: 0, rounds: Number.MAX_SAFE_INTEGER, lives: 3, combo: 0, precision: 0,
      attempts: 0, correct: 0, cleared: 0, bestCombo: 0, riskRoutes: 0, endless: true
    };
  }

  emit(name, detail = {}) {
    this.container.dispatchEvent(new CustomEvent(`echo:${name}`, {
      bubbles: true,
      detail: { ...detail, seed: this.seed }
    }));
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.seed = Number(seed) >>> 0;
    this.chunkIndex = 0;
    this.plan = echoChunk(this.seed, ECHO_CHUNK_SIZE);
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.accepting = false;
    this.terminalPending = false;
    this.startedAt = performance.now();
    this.container.dataset.reduced = String(this.reducedMotion);
    this.installListeners();
    this.resetVisuals();
    this.publishSnapshot();
    this.emit('start', { snapshot: { ...this.snapshot } });
    this.schedule(() => this.showRound(), 320);
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.activate(index), { signal });
    });
    this.board.addEventListener('keydown', (event) => {
      if (!this.running || !this.accepting || !this.progress) return;
      const delta = ({ ArrowUp: -3, ArrowRight: 1, ArrowDown: 3, ArrowLeft: -1 })[event.key];
      if (delta === undefined) return;
      const current = this.progress.currentCell;
      const next = current + delta;
      const sameRow = Math.floor(current / 3) === Math.floor(next / 3);
      if ((Math.abs(delta) === 1 && !sameRow) || next < 0 || next > 8) return;
      event.preventDefault();
      this.activate(next);
    }, { signal });
    this.repeatButton.addEventListener('click', () => this.replayPreview(), { signal });
    this.readyButton.addEventListener('click', () => this.startResponse(), { signal });
    this.exitButton.addEventListener('click', () => this.requestExit(), { signal });
  }

  schedule(callback, delay, collection = this.timers) {
    const timer = setTimeout(() => {
      collection.delete(timer);
      callback();
    }, Math.max(0, delay));
    collection.add(timer);
    return timer;
  }

  clearTimer(timer, collection = this.timers) {
    if (!timer) return;
    clearTimeout(timer);
    collection.delete(timer);
  }

  clearPreviewTimers() {
    this.previewTimers.forEach(clearTimeout);
    this.previewTimers.clear();
  }

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    this.container.dataset.reduced = String(this.reducedMotion);
  }

  stageAt(index) {
    const requiredChunk = Math.floor(index / ECHO_CHUNK_SIZE);
    if (requiredChunk !== this.chunkIndex) {
      this.chunkIndex = requiredChunk;
      this.plan = echoChunk(echoChunkSeed(this.seed, requiredChunk), ECHO_CHUNK_SIZE);
    }
    return composeEchoStage(this.seed, index, this.plan[index % ECHO_CHUNK_SIZE]);
  }

  resetCells() {
    this.buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = '';
      button.classList.remove('is-lit', 'is-correct', 'is-wrong', 'is-player', 'is-trail', 'is-blocked', 'is-risk', 'is-decoy');
      button.removeAttribute('data-step');
      button.removeAttribute('data-marker');
      button.removeAttribute('aria-current');
    });
  }

  resetVisuals() {
    this.container.removeAttribute('data-feedback');
    this.container.removeAttribute('data-mechanic');
    this.container.removeAttribute('data-phase');
    this.container.removeAttribute('data-zone');
    this.container.removeAttribute('data-exit-armed');
    this.resetCells();
    this.memoryActions.hidden = true;
    this.repeatButton.disabled = true;
    this.readyButton.disabled = true;
    this.exitButton.disabled = false;
    this.exitArmed = false;
  }

  prepareStage(stage) {
    this.clearPreviewTimers();
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.currentStage = stage;
    this.progress = null;
    this.accepting = false;
    this.container.removeAttribute('data-feedback');
    this.container.dataset.mechanic = stage.mechanic;
    this.container.dataset.phase = stage.phase;
    this.container.dataset.zone = stage.zone;
    this.resetCells();
    this.memoryActions.hidden = true;
    this.repeatButton.disabled = true;
    this.readyButton.disabled = true;
    this.emit('route-clear', {});
    this.emit('stage', { stage, snapshot: { ...this.snapshot } });
  }

  showRound() {
    if (!this.running) return;
    const stage = this.stageAt(this.snapshot.round);
    this.prepareStage(stage);
    this.playPreview(stage);
  }

  playPreview(stage) {
    if (!this.running || this.currentStage !== stage) return;
    this.clearPreviewTimers();
    this.accepting = false;
    this.memoryActions.hidden = true;
    this.repeatButton.disabled = true;
    this.readyButton.disabled = true;
    this.resetCells();
    const sequence = [];
    stage.previewPath.forEach((cell, index) => {
      sequence.push({ cell, index, decoy: false });
      if (stage.decoy !== null && index === Math.floor(stage.previewPath.length / 2) - 1) {
        sequence.push({ cell: stage.decoy, index: -1, decoy: true });
      }
    });
    const stepMs = stage.previewStepMs;
    sequence.forEach((entry, order) => {
      this.schedule(() => {
        if (!this.running || this.currentStage !== stage) return;
        const button = this.buttons[entry.cell];
        button.classList.add(entry.decoy ? 'is-decoy' : 'is-lit');
        button.textContent = entry.decoy ? '×' : String(entry.index + 1);
        this.schedule(() => {
          button.classList.remove('is-lit', 'is-decoy');
          button.textContent = '';
        }, 360, this.previewTimers);
      }, order * stepMs, this.previewTimers);
    });
    this.schedule(() => this.presentDecision(stage), sequence.length * stepMs + 120, this.previewTimers);
  }

  presentDecision(stage) {
    if (!this.running || this.currentStage !== stage) return;
    this.clearPreviewTimers();
    this.resetCells();
    this.memoryActions.hidden = false;
    this.repeatButton.disabled = false;
    this.readyButton.disabled = false;
    this.emit('route-ready', { stage });
    this.readyButton.focus({ preventScroll: true });
  }

  replayPreview() {
    if (!this.running || !this.currentStage || this.accepting) return;
    this.playPreview(this.currentStage);
  }

  startResponse() {
    const stage = this.currentStage;
    if (!this.running || !stage || this.accepting) return;
    this.clearPreviewTimers();
    this.memoryActions.hidden = true;
    this.repeatButton.disabled = true;
    this.readyButton.disabled = true;
    this.resetCells();
    stage.blocked.forEach((cell) => {
      const button = this.buttons[cell];
      button.classList.add('is-blocked');
      button.dataset.marker = '×';
      button.textContent = '×';
    });
    if (stage.risk) {
      const riskStart = this.buttons[stage.risk.tiles[0]];
      riskStart.classList.add('is-risk');
      riskStart.dataset.marker = '★';
      riskStart.textContent = '★';
    }
    this.progress = initialEchoProgress(stage);
    this.movePlayer(this.progress.currentCell, false);
    this.buttons.forEach((button) => { button.disabled = false; });
    this.accepting = true;
    this.roundStartedAt = performance.now();
    this.emit('response', { stage });
    this.onAnnounce({ key: `echoPrompt${stage.mechanic[0].toUpperCase()}${stage.mechanic.slice(1)}` });
    this.buttons[this.progress.currentCell].focus({ preventScroll: true });
    this.deadlineTimer = this.schedule(() => this.resolveMiss('slow'), stage.deadlineMs);
  }

  movePlayer(cell, markTrail = true) {
    this.buttons.forEach((button) => {
      if (button.classList.contains('is-player')) {
        button.textContent = button.classList.contains('is-blocked') ? '×' : button.classList.contains('is-risk') ? '★' : button.classList.contains('is-trail') ? '•' : '';
      }
      button.classList.remove('is-player');
      button.removeAttribute('aria-current');
    });
    if (markTrail && this.progress) {
      const previous = this.buttons[this.progress.currentCell];
      previous?.classList.add('is-trail');
      if (previous) previous.textContent = '•';
    }
    const button = this.buttons[cell];
    button.classList.remove('is-risk');
    button.classList.add('is-player');
    button.textContent = '◆';
    button.setAttribute('aria-current', 'step');
  }

  activate(index) {
    if (!this.running || !this.accepting || !this.currentStage || !this.progress) return;
    const previousProgress = this.progress;
    const outcome = evaluateEchoMove(this.currentStage, previousProgress, index);
    if (!outcome.correct && outcome.reason === 'nonadjacent') {
      this.onAnnounce({ key: 'echoAdjacentOnly' });
      return;
    }
    if (!outcome.correct) {
      this.resolveMiss(outcome.reason, index);
      return;
    }
    const previousCell = previousProgress.currentCell;
    if (this.currentStage.risk && previousProgress.riskStep === 0 && previousProgress.pathIndex === this.currentStage.risk.branchIndex && index === this.currentStage.targetPath[previousProgress.pathIndex + 1]) {
      const unusedRisk = this.buttons[this.currentStage.risk.tiles[0]];
      unusedRisk.classList.remove('is-risk');
      unusedRisk.removeAttribute('data-marker');
      unusedRisk.textContent = '';
    }
    this.progress = outcome.progress;
    this.buttons[previousCell].classList.add('is-trail');
    if (this.currentStage.risk && this.progress.riskStep > 0) {
      this.buttons[this.currentStage.risk.tiles[0]].classList.remove('is-risk');
      if (this.progress.riskStep === 1) {
        const second = this.buttons[this.currentStage.risk.tiles[1]];
        second.classList.add('is-risk');
        second.textContent = '★';
      }
    }
    this.movePlayer(index, false);
    if (outcome.complete) this.resolveHit(this.currentStage, this.progress.riskTaken);
    else this.onAnnounce({ key: 'echoStep' });
  }

  resolveHit(stage, riskTaken) {
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    const combo = this.snapshot.combo + 1;
    const result = scoreEndlessEcho({
      stage,
      elapsedMs: performance.now() - this.roundStartedAt,
      combo,
      riskTaken
    });
    this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.bestCombo = Math.max(this.snapshot.bestCombo, combo);
    this.snapshot.precision = result.precision;
    this.snapshot.round += 1;
    this.snapshot.attempts += 1;
    this.snapshot.correct += 1;
    this.snapshot.cleared += 1;
    if (riskTaken) this.snapshot.riskRoutes += 1;
    const restored = stage.recovery && this.snapshot.lives < 3;
    if (restored) this.snapshot.lives += 1;
    this.container.dataset.feedback = 'correct';
    this.buttons[this.progress.currentCell].classList.add('is-correct');
    this.buttons.forEach((button) => { button.disabled = true; });
    this.publishSnapshot();
    this.onAnnounce({
      key: riskTaken ? 'echoRiskCleared' : restored ? 'echoRecovered' : 'echoPathCleared',
      values: { points: result.points }
    });
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
    if (index !== null) this.buttons[index]?.classList.add('is-wrong');
    this.buttons.forEach((button) => { button.disabled = true; });
    this.publishSnapshot();
    const key = kind === 'slow' ? 'echoTooSlow' : kind === 'blocked' ? 'echoBlocked' : 'echoWrongMove';
    this.onAnnounce({ key });
    if (this.snapshot.lives <= 0) {
      this.terminalPending = true;
      this.clearTimer(this.exitTimer);
      this.exitTimer = null;
      this.exitArmed = false;
      this.container.removeAttribute('data-exit-armed');
      this.exitButton.disabled = true;
      this.emit('exit-disarmed', {});
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
    const delay = stage?.phase === 'recovery' ? 760 : stage?.special ? 650 : 520;
    this.schedule(() => this.showRound(), delay);
  }

  requestExit() {
    if (!this.running || this.terminalPending) return;
    if (this.exitArmed) {
      this.finish('ended');
      return;
    }
    this.exitArmed = true;
    this.container.dataset.exitArmed = 'true';
    this.onAnnounce({ key: 'echoExitConfirm' });
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
    this.terminalPending = true;
    this.clearTimer(this.deadlineTimer);
    this.clearTimer(this.exitTimer);
    this.clearPreviewTimers();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.memoryActions.hidden = true;
    this.exitButton.disabled = true;
    this.buttons.forEach((button) => { button.disabled = true; });
    const summary = summarizeEchoRun(this.snapshot);
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
    this.terminalPending = false;
    this.abortController?.abort();
    this.abortController = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.clearPreviewTimers();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.currentStage = null;
    this.progress = null;
    if (this.container && this.buttons) {
      this.resetVisuals();
      this.emit('destroy', {});
    }
  }
}
