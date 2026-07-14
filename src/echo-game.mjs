import './audio-integration.mjs';
import './echo-integration.mjs';
import { clamp } from './core.mjs';
import { platformAudio } from './audio.mjs';
import { ECHO_BOARD_SIZE, ECHO_CHUNK_SIZE, ECHO_DIRECTIONS, generateEchoChunk, moveCell, scoreEchoStage } from './echo-model.mjs';

const ARROWS = Object.freeze(['↑', '→', '↓', '←']);
const KEY_TO_DIRECTION = Object.freeze({ ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 });

function shellMarkup() {
  const cells = Array.from({ length: ECHO_BOARD_SIZE * ECHO_BOARD_SIZE }, (_, index) => `<span data-echo-cell="${index}"></span>`).join('');
  return `
    <div class="echo-run-head" aria-hidden="true">
      <span><b data-echo-zone></b><i>•</i><em data-echo-rule></em></span>
      <strong data-echo-distance></strong>
    </div>
    <div class="echo-cue-panel">
      <p class="echo-cue-label" data-echo-cue-label aria-hidden="true"></p>
      <div class="echo-sequence" data-echo-sequence aria-hidden="true"></div>
      <div class="echo-cue-actions">
        <button class="ghost" type="button" data-echo-repeat></button>
        <button class="secondary" type="button" data-echo-ready></button>
      </div>
    </div>
    <div class="echo-board" data-echo-board aria-hidden="true">${cells}<span class="echo-marker" data-echo-marker></span></div>
    <p class="sr-only" data-echo-accessible-cue aria-live="polite" aria-atomic="true"></p>
    <div class="echo-controls" data-echo-controls>
      <button type="button" data-echo-direction="0"><span aria-hidden="true">↑</span></button>
      <button type="button" data-echo-direction="3"><span aria-hidden="true">←</span></button>
      <button type="button" data-echo-direction="2"><span aria-hidden="true">↓</span></button>
      <button type="button" data-echo-direction="1"><span aria-hidden="true">→</span></button>
    </div>
    <button class="ghost echo-exit" type="button" data-echo-exit></button>`;
}

export class EchoGridGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.container.className = 'echo-journey';
    this.container.dir = 'ltr';
    this.container.innerHTML = shellMarkup();
    this.cells = [...container.querySelectorAll('[data-echo-cell]')];
    this.marker = container.querySelector('[data-echo-marker]');
    this.sequence = container.querySelector('[data-echo-sequence]');
    this.repeatButton = container.querySelector('[data-echo-repeat]');
    this.readyButton = container.querySelector('[data-echo-ready]');
    this.directionButtons = [...container.querySelectorAll('[data-echo-direction]')];
    this.exitButton = container.querySelector('[data-echo-exit]');
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.timers = new Set();
    this.running = false;
    this.phase = 'idle';
  }

  emptySnapshot() {
    return { score: 0, round: 0, rounds: 1, lives: 3, combo: 0, bestCombo: 0, correctMoves: 0, totalMoves: 0, accuracy: 100, gates: 0 };
  }

  dispatch(name, detail = {}) {
    this.container.dispatchEvent(new CustomEvent(`echo:${name}`, { detail }));
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.seed = Number(seed) >>> 0;
    this.chunkIndex = 0;
    this.chunk = generateEchoChunk(this.seed, this.chunkIndex);
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.startedAt = performance.now();
    this.stageStartedAt = 0;
    this.assists = 0;
    this.exitArmed = false;
    this.installListeners();
    this.onUpdate({ ...this.snapshot });
    this.dispatch('start', { snapshot: { ...this.snapshot } });
    void platformAudio.unlock();
    this.schedule(() => this.showStage(), 260);
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.directionButtons.forEach((button) => button.addEventListener('click', () => this.activate(Number(button.dataset.echoDirection)), { signal }));
    this.repeatButton.addEventListener('click', () => this.replayCue(), { signal });
    this.readyButton.addEventListener('click', () => this.beginResponse(), { signal });
    this.exitButton.addEventListener('click', () => this.requestExit(), { signal });
    this.container.addEventListener('keydown', (event) => {
      if (!(event.key in KEY_TO_DIRECTION)) return;
      event.preventDefault();
      this.activate(KEY_TO_DIRECTION[event.key]);
    }, { signal });
  }

  setReducedMotion(value) { this.reducedMotion = Boolean(value); }

  schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (this.running) callback();
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  currentStage() {
    const localIndex = this.snapshot.round % ECHO_CHUNK_SIZE;
    if (localIndex === 0 && this.snapshot.round > 0 && this.chunkIndex !== Math.floor(this.snapshot.round / ECHO_CHUNK_SIZE)) {
      this.chunkIndex = Math.floor(this.snapshot.round / ECHO_CHUNK_SIZE);
      this.chunk = generateEchoChunk(this.seed, this.chunkIndex);
    }
    return this.chunk[localIndex];
  }

  setControlsEnabled(enabled) {
    this.directionButtons.forEach((button) => { button.disabled = !enabled; });
  }

  setMarker(cell) {
    const row = Math.floor(cell / ECHO_BOARD_SIZE);
    const column = cell % ECHO_BOARD_SIZE;
    this.marker.style.gridRow = String(row + 1);
    this.marker.style.gridColumn = String(column + 1);
    this.currentCell = cell;
  }

  clearBoard() {
    this.cells.forEach((cell) => cell.classList.remove('is-cue', 'is-goal', 'is-wrong', 'is-correct'));
  }

  renderCue(stage, visibleCount = 0) {
    this.sequence.replaceChildren(...stage.displayMoves.map((direction, index) => {
      const cue = document.createElement('span');
      cue.textContent = ARROWS[direction];
      cue.dataset.direction = ECHO_DIRECTIONS[direction];
      if (stage.echoFlags[index]) {
        cue.classList.add('is-echo');
        const mark = document.createElement('small');
        mark.textContent = '↺';
        cue.append(mark);
      }
      cue.classList.toggle('is-visible', index < visibleCount);
      return cue;
    }));
  }

  showStage() {
    if (!this.running) return;
    this.clearTimers();
    this.phase = 'watch';
    this.assists = 0;
    this.inputIndex = 0;
    this.exitArmed = false;
    this.stage = this.currentStage();
    this.clearBoard();
    this.setControlsEnabled(false);
    this.repeatButton.hidden = true;
    this.readyButton.hidden = true;
    this.setMarker(this.stage.displayStart);
    this.renderCue(this.stage, 0);
    this.dispatch('stage', { stage: this.stage, snapshot: { ...this.snapshot } });
    this.onAnnounce({ key: 'echoWatchPath', values: { count: this.stage.length } });
    if (this.stage.index > 0 && this.stage.index % 6 === 0) platformAudio.play('zone', (this.stage.index % 4) * 35);
    this.presentCue();
  }

  presentCue() {
    if (!this.running) return;
    this.clearTimers();
    this.phase = 'watch';
    this.clearBoard();
    this.setMarker(this.stage.displayStart);
    this.renderCue(this.stage, 0);
    let cell = this.stage.displayStart;
    const stepMs = 470;
    this.stage.displayMoves.forEach((direction, index) => {
      this.schedule(() => {
        if (!this.running || this.phase !== 'watch') return;
        cell = moveCell(cell, direction);
        this.setMarker(cell);
        this.cells[cell]?.classList.add('is-cue');
        this.renderCue(this.stage, index + 1);
        platformAudio.play('cue', index * 22);
      }, index * stepMs + 120);
    });
    this.schedule(() => this.cueReady(), this.stage.displayMoves.length * stepMs + 260);
  }

  cueReady() {
    if (!this.running) return;
    this.phase = 'ready';
    this.repeatButton.hidden = this.assists >= 2;
    this.readyButton.hidden = false;
    this.dispatch('cue-ready', { stage: this.stage, assists: this.assists });
    this.onAnnounce({ key: 'echoCueReady' });
    this.readyButton.focus({ preventScroll: true });
  }

  replayCue() {
    if (!this.running || this.phase !== 'ready' || this.assists >= 2) return;
    this.assists += 1;
    this.repeatButton.hidden = true;
    this.readyButton.hidden = true;
    this.dispatch('cue-replay', { stage: this.stage, assists: this.assists });
    this.presentCue();
  }

  beginResponse() {
    if (!this.running || this.phase !== 'ready') return;
    this.clearTimers();
    this.phase = 'response';
    this.inputIndex = 0;
    this.setMarker(this.stage.responseStart);
    this.clearBoard();
    this.sequence.querySelectorAll('span').forEach((cue) => cue.classList.remove('is-visible'));
    this.repeatButton.hidden = true;
    this.readyButton.hidden = true;
    this.setControlsEnabled(true);
    this.stageStartedAt = performance.now();
    this.dispatch('response', { stage: this.stage });
    this.onAnnounce({ key: 'echoMoveNow' });
    this.directionButtons[0].focus({ preventScroll: true });
    if (this.stage.deadlineMs) this.schedule(() => this.failMove('echoTooSlow'), this.stage.deadlineMs);
  }

  activate(direction) {
    if (!this.running || this.phase !== 'response') return;
    const expected = this.stage.expectedMoves[this.inputIndex];
    this.snapshot.totalMoves += 1;
    if (direction !== expected || moveCell(this.currentCell, direction) < 0) {
      this.failMove('echoWrongMove');
      return;
    }
    this.currentCell = moveCell(this.currentCell, direction);
    this.setMarker(this.currentCell);
    this.cells[this.currentCell]?.classList.add('is-correct');
    this.snapshot.correctMoves += 1;
    this.inputIndex += 1;
    platformAudio.play('move', direction * 28);
    this.onAnnounce({ key: 'echoStepCorrect', values: { value: this.inputIndex, count: this.stage.length } });
    if (this.inputIndex >= this.stage.expectedMoves.length) this.completeStage();
  }

  failMove(key) {
    if (!this.running || !['response', 'ready'].includes(this.phase)) return;
    this.clearTimers();
    this.phase = 'recovery';
    this.setControlsEnabled(false);
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    this.snapshot.accuracy = this.snapshot.totalMoves ? Math.round((this.snapshot.correctMoves / this.snapshot.totalMoves) * 100) : 0;
    this.cells[this.currentCell]?.classList.add('is-wrong');
    this.onUpdate({ ...this.snapshot });
    this.dispatch('snapshot', { snapshot: { ...this.snapshot } });
    this.onAnnounce({ key });
    platformAudio.play('wrong');
    if (this.snapshot.lives <= 0) this.schedule(() => this.finish('failed'), 620);
    else this.schedule(() => this.showStage(), 820);
  }

  completeStage() {
    if (!this.running || this.phase !== 'response') return;
    this.clearTimers();
    this.phase = 'success';
    this.setControlsEnabled(false);
    const elapsed = performance.now() - this.stageStartedAt;
    const remainingMs = this.stage.deadlineMs ? Math.max(0, this.stage.deadlineMs - elapsed) : 0;
    const nextCombo = this.snapshot.combo + 1;
    const points = scoreEchoStage({ stage: this.stage, combo: nextCombo, assists: this.assists, remainingMs });
    this.snapshot.score = clamp(this.snapshot.score + points, 0, 9999);
    this.snapshot.combo = nextCombo;
    this.snapshot.bestCombo = Math.max(this.snapshot.bestCombo, nextCombo);
    this.snapshot.round += 1;
    this.snapshot.gates = this.snapshot.round;
    this.snapshot.accuracy = this.snapshot.totalMoves ? Math.round((this.snapshot.correctMoves / this.snapshot.totalMoves) * 100) : 100;
    let recovered = false;
    if (this.stage.recovery && this.snapshot.lives < 3) {
      this.snapshot.lives += 1;
      recovered = true;
    }
    this.onUpdate({ ...this.snapshot });
    this.dispatch('snapshot', { snapshot: { ...this.snapshot } });
    this.onAnnounce({ key: 'echoTrailCleared', values: { points }, extraKey: recovered ? 'echoRecovery' : undefined });
    platformAudio.play(this.stage.special || this.stage.mastery ? 'zone' : 'correct', this.stage.length * 18);
    this.schedule(() => this.showStage(), this.stage.recovery ? 1180 : 760);
  }

  requestExit() {
    if (!this.running) return;
    if (!this.exitArmed) {
      this.exitArmed = true;
      this.dispatch('exit-armed');
      this.onAnnounce({ key: 'echoExitConfirm' });
      this.schedule(() => {
        this.exitArmed = false;
        this.dispatch('exit-disarmed');
      }, 3000);
      return;
    }
    this.finish('ended');
  }

  finish(reason) {
    if (!this.running) return;
    this.clearTimers();
    this.running = false;
    this.phase = 'finished';
    this.setControlsEnabled(false);
    const result = { ...this.snapshot, reason, durationMs: Math.round(performance.now() - this.startedAt) };
    platformAudio.play('finish');
    this.onUpdate({ ...this.snapshot });
    this.onFinish(result);
    this.dispatch('finish', { result });
  }

  destroy() {
    this.running = false;
    this.phase = 'idle';
    this.abortController?.abort();
    this.abortController = null;
    this.clearTimers();
    this.cells?.forEach((cell) => cell.classList.remove('is-cue', 'is-goal', 'is-wrong', 'is-correct'));
    this.sequence?.replaceChildren();
    this.setControlsEnabled?.(false);
  }
}
