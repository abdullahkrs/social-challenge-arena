import './audio-integration.mjs';
import './mirror-copy.mjs';
import './mirror-integration.mjs';
import { clamp } from './core.mjs';
import { platformAudio } from './audio.mjs';
import { normalizeLanguage, translate } from './i18n.mjs';
import {
  evaluateMirrorBoard, generateMirrorChunk, MIRROR_BOARD_SIZE, MIRROR_CELL_COUNT, MIRROR_CHUNK_SIZE,
  scoreMirrorStage, summarizeMirrorRun
} from './mirror-model.mjs';

const RULE_KEYS = Object.freeze({
  horizontal: 'mirrorRuleHorizontal', vertical: 'mirrorRuleVertical', rotate180: 'mirrorRuleRotate180', rotateRight: 'mirrorRuleRotateRight'
});
const MECHANIC_KEYS = Object.freeze({
  rebuild: 'mirrorMechanicRebuild', anchor: 'mirrorMechanicAnchor', repair: 'mirrorMechanicRepair', sequence: 'mirrorMechanicSequence'
});
const ZONE_KEYS = Object.freeze({
  gallery: 'mirrorZoneGallery', crossing: 'mirrorZoneCrossing', vault: 'mirrorZoneVault', aurora: 'mirrorZoneAurora'
});
const KEY_DELTAS = Object.freeze({ ArrowUp: [-1, 0], ArrowRight: [0, 1], ArrowDown: [1, 0], ArrowLeft: [0, -1] });

function shellMarkup() {
  const sourceCells = Array.from({ length: MIRROR_CELL_COUNT }, (_, index) => `<span data-mirror-source-cell="${index}" aria-hidden="true">·</span>`).join('');
  const targetCells = Array.from({ length: MIRROR_CELL_COUNT }, (_, index) => `<button type="button" role="gridcell" data-mirror-target-cell="${index}" tabindex="-1"><span aria-hidden="true">·</span></button>`).join('');
  return `
    <div class="mirror-run-head" aria-hidden="true">
      <span><b data-mirror-zone></b><i>•</i><em data-mirror-rule></em></span>
      <strong data-mirror-progress></strong>
    </div>
    <div class="mirror-task" aria-hidden="true"><strong data-mirror-mechanic></strong><span data-mirror-moves></span></div>
    <div class="mirror-workspace">
      <section class="mirror-panel mirror-source-panel">
        <h3 data-mirror-source-title></h3>
        <div class="mirror-board mirror-source-board" aria-hidden="true">${sourceCells}</div>
        <p class="sr-only" data-mirror-source-description aria-live="polite" aria-atomic="true"></p>
      </section>
      <span class="mirror-transform-mark" aria-hidden="true">⇢</span>
      <section class="mirror-panel mirror-target-panel">
        <h3 data-mirror-target-title></h3>
        <div class="mirror-board mirror-target-board" role="grid" dir="ltr" data-mirror-target-board>${targetCells}</div>
      </section>
    </div>
    <div class="mirror-control-row">
      <div class="mirror-dpad" data-mirror-controls>
        <button type="button" data-mirror-direction="up"><span aria-hidden="true">↑</span></button>
        <button type="button" data-mirror-direction="left"><span aria-hidden="true">←</span></button>
        <button type="button" class="mirror-switch" data-mirror-toggle><span aria-hidden="true">◆</span></button>
        <button type="button" data-mirror-direction="right"><span aria-hidden="true">→</span></button>
        <button type="button" data-mirror-direction="down"><span aria-hidden="true">↓</span></button>
      </div>
      <button class="secondary mirror-check" type="button" data-mirror-check></button>
    </div>
    <button class="ghost mirror-exit" type="button" data-mirror-exit></button>`;
}

export class MirrorFuseGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.container.className = 'mirror-fuse mirror-circuit';
    this.container.dir = 'ltr';
    this.container.innerHTML = shellMarkup();
    this.sourceCells = [...container.querySelectorAll('[data-mirror-source-cell]')];
    this.targetCells = [...container.querySelectorAll('[data-mirror-target-cell]')];
    this.sourceDescription = container.querySelector('[data-mirror-source-description]');
    this.targetBoard = container.querySelector('[data-mirror-target-board]');
    this.directionButtons = [...container.querySelectorAll('[data-mirror-direction]')];
    this.toggleButton = container.querySelector('[data-mirror-toggle]');
    this.checkButton = container.querySelector('[data-mirror-check]');
    this.exitButton = container.querySelector('[data-mirror-exit]');
    if (this.sourceCells.length !== MIRROR_CELL_COUNT || this.targetCells.length !== MIRROR_CELL_COUNT || !this.sourceDescription || !this.targetBoard || !this.toggleButton || !this.checkButton || !this.exitButton) {
      throw new Error('Mirror Fuse requires complete source, target, controls, and exit surfaces');
    }
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.languageObserver = null;
    this.timers = new Set();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.running = false;
    this.accepting = false;
    this.exitArmed = false;
  }

  emptySnapshot() {
    return { score: 0, round: 0, rounds: 1, lives: 3, combo: 0, bestCombo: 0, patterns: 0, totalActions: 0, correctActions: 0, accuracy: 100 };
  }

  language() { return normalizeLanguage(this.container.ownerDocument.documentElement.lang); }
  t(key, values = {}) { return translate(this.language(), key, values); }
  ruleText(stage = this.stage) { return this.t(RULE_KEYS[stage?.rule] || 'mirrorRuleHorizontal'); }
  mechanicText(stage = this.stage) { return this.t(MECHANIC_KEYS[stage?.mechanic] || 'mirrorMechanicRebuild'); }
  zoneText(stage = this.stage) { return this.t(ZONE_KEYS[stage?.zone] || 'mirrorZoneGallery'); }

  dispatch(name, detail = {}) {
    this.container.dispatchEvent(new CustomEvent(`mirror:${name}`, { detail }));
  }

  schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  clearTimer(timer) {
    if (!timer) return;
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  emitSnapshot() {
    this.snapshot.accuracy = this.snapshot.totalActions
      ? Math.round((this.snapshot.correctActions / this.snapshot.totalActions) * 100)
      : 100;
    const copy = { ...this.snapshot };
    this.onUpdate(copy);
    this.dispatch('snapshot', { snapshot: copy, stage: this.stage, moves: this.moves });
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.seed = Number(seed) >>> 0;
    this.chunkIndex = 0;
    this.chunk = generateMirrorChunk(this.seed, this.chunkIndex);
    this.stageIndex = 0;
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.accepting = false;
    this.startedAt = performance.now();
    this.container.dataset.reduced = String(this.reducedMotion);
    this.installListeners();
    this.installLanguageObserver();
    this.emitSnapshot();
    this.dispatch('start', { snapshot: { ...this.snapshot } });
    this.showStage();
  }

  installListeners() {
    const signal = this.abortController.signal;
    const directions = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1] };
    this.directionButtons.forEach((button) => {
      button.addEventListener('click', () => this.move(...directions[button.dataset.mirrorDirection]), { signal });
    });
    this.toggleButton.addEventListener('click', () => this.toggleCurrent(), { signal });
    this.checkButton.addEventListener('click', () => this.checkPattern(), { signal });
    this.exitButton.addEventListener('click', () => this.requestExit(), { signal });
    this.targetCells.forEach((button, index) => button.addEventListener('click', () => this.activateCell(index), { signal }));
    this.targetBoard.addEventListener('keydown', (event) => {
      if (KEY_DELTAS[event.key]) {
        event.preventDefault();
        this.move(...KEY_DELTAS[event.key]);
      } else if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        this.toggleCurrent();
      }
    }, { signal });
  }

  installLanguageObserver() {
    if (typeof MutationObserver !== 'function') return;
    this.languageObserver = new MutationObserver(() => this.refreshLanguage());
    this.languageObserver.observe(this.container.ownerDocument.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
  }

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    this.container.dataset.reduced = String(this.reducedMotion);
  }

  currentStage() {
    const chunkIndex = Math.floor(this.stageIndex / MIRROR_CHUNK_SIZE);
    if (chunkIndex !== this.chunkIndex) {
      this.chunkIndex = chunkIndex;
      this.chunk = generateMirrorChunk(this.seed, this.chunkIndex);
    }
    return this.chunk[this.stageIndex % MIRROR_CHUNK_SIZE];
  }

  showStage() {
    if (!this.running) return;
    this.disarmExit();
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.stage = this.currentStage();
    this.activeCells = new Set(this.stage.initialOn);
    this.cursor = this.stage.cursorStart;
    this.sequenceProgress = 0;
    this.moves = 0;
    this.wrongActions = 0;
    this.stageStartedAt = null;
    this.accepting = true;
    this.container.removeAttribute('data-feedback');
    this.container.dataset.phase = this.stage.phase;
    this.renderStage();
    this.emitSnapshot();
    this.dispatch('stage', { stage: this.stage, snapshot: { ...this.snapshot } });
    this.onAnnounce({ key: 'mirrorStageReady', values: { value: this.stage.index + 1, rule: this.ruleText(), mechanic: this.mechanicText() }, extraKey: 'mirrorSourceDescription', extraValues: this.sourceDescriptionValues() });
    if (this.stage.index > 0 && (this.stage.milestone || this.stage.phase === 'special')) platformAudio.play('zone', this.stage.index % 4 * 18);
    if (!this.container.contains(this.container.ownerDocument.activeElement)) this.focusCursor();
  }

  beginPressure() {
    if (this.stageStartedAt !== null || !this.accepting) return;
    this.stageStartedAt = performance.now();
    this.deadlineTimer = this.schedule(() => this.resolveMiss('timeout'), this.stage.deadlineMs);
    this.dispatch('pressure', { stage: this.stage });
  }

  sourceDescriptionValues() {
    const cells = this.stage.sourcePattern.map((cell, index) => {
      const coordinate = this.coordinate(cell);
      return this.stage.mechanic === 'sequence' ? `${coordinate} (${this.t('mirrorSequenceNumber', { value: index + 1 })})` : coordinate;
    }).join(', ');
    return { cells, rule: this.ruleText(), mechanic: this.mechanicText() };
  }

  coordinate(cell) {
    return this.t('mirrorCoordinate', { row: Math.floor(cell / MIRROR_BOARD_SIZE) + 1, column: cell % MIRROR_BOARD_SIZE + 1 });
  }

  refreshLanguage() {
    if (!this.stage) return;
    this.renderText();
    this.refreshAccessibility();
  }

  renderText() {
    const q = (selector) => this.container.querySelector(selector);
    q('[data-mirror-zone]').textContent = this.zoneText();
    q('[data-mirror-rule]').textContent = this.ruleText();
    q('[data-mirror-progress]').textContent = this.t('mirrorStep', { value: this.stage.index + 1 });
    q('[data-mirror-mechanic]').textContent = this.mechanicText();
    q('[data-mirror-moves]').textContent = this.t('mirrorMoves', { used: this.moves, budget: this.stage.moveBudget });
    q('[data-mirror-source-title]').textContent = this.t('mirrorSource');
    q('[data-mirror-target-title]').textContent = this.t('mirrorTarget');
    this.checkButton.textContent = this.t('mirrorCheckPattern');
    this.checkButton.hidden = this.stage.mechanic === 'sequence';
    this.toggleButton.setAttribute('aria-label', this.t('mirrorSwitchCell'));
    this.exitButton.textContent = this.t(this.exitArmed ? 'mirrorExitNow' : 'mirrorEndRun');
    const directionLabels = { up: 'mirrorDirectionUp', right: 'mirrorDirectionRight', down: 'mirrorDirectionDown', left: 'mirrorDirectionLeft' };
    this.directionButtons.forEach((button) => button.setAttribute('aria-label', this.t(directionLabels[button.dataset.mirrorDirection])));
    this.container.querySelector('[data-mirror-controls]').setAttribute('aria-label', this.t('mirrorMovementControls'));
    this.targetBoard.setAttribute('aria-label', this.t('mirrorBoardLabel'));
  }

  renderStage() {
    const order = new Map(this.stage.sourcePattern.map((cell, index) => [cell, index + 1]));
    this.sourceCells.forEach((cell, index) => {
      const active = order.has(index);
      cell.dataset.on = String(active);
      cell.textContent = active ? (this.stage.mechanic === 'sequence' ? String(order.get(index)) : '◆') : '·';
      cell.toggleAttribute('data-sequence', active && this.stage.mechanic === 'sequence');
    });
    this.renderTarget();
    this.renderText();
    this.refreshAccessibility();
  }

  renderTarget() {
    const target = new Set(this.stage.targetPattern);
    this.targetCells.forEach((button, index) => {
      const active = this.activeCells.has(index);
      const current = index === this.cursor;
      const locked = this.stage.locked.includes(index);
      button.dataset.on = String(active);
      button.dataset.current = String(current);
      button.toggleAttribute('data-locked', locked);
      button.toggleAttribute('data-solution', Boolean(this.container.dataset.feedback) && target.has(index));
      button.toggleAttribute('data-extra', Boolean(this.container.dataset.feedback) && active && !target.has(index));
      button.tabIndex = current ? 0 : -1;
      button.querySelector('span').textContent = active ? (locked ? '◇' : '◆') : '·';
    });
    const moves = this.container.querySelector('[data-mirror-moves]');
    if (moves) moves.textContent = this.t('mirrorMoves', { used: this.moves, budget: this.stage.moveBudget });
    this.refreshAccessibility();
  }

  refreshAccessibility() {
    if (!this.stage) return;
    this.sourceDescription.textContent = this.t('mirrorSourceDescription', this.sourceDescriptionValues());
    this.targetCells.forEach((button, index) => {
      const extras = [];
      if (index === this.cursor) extras.push(this.t('mirrorCurrent'));
      if (this.stage.locked.includes(index)) extras.push(this.t('mirrorFixed'));
      const sequenceIndex = this.stage.targetPattern.indexOf(index);
      if (this.stage.mechanic === 'sequence' && sequenceIndex >= 0 && sequenceIndex < this.sequenceProgress) extras.push(this.t('mirrorSequenceNumber', { value: sequenceIndex + 1 }));
      button.setAttribute('aria-label', this.t('mirrorTargetCellLabel', {
        coordinate: this.coordinate(index),
        state: this.t(this.activeCells.has(index) ? 'mirrorCellOn' : 'mirrorCellOff'),
        extra: extras.join(', ')
      }));
      button.setAttribute('aria-current', index === this.cursor ? 'true' : 'false');
    });
  }

  focusCursor() {
    this.targetCells[this.cursor]?.focus({ preventScroll: true });
  }

  activateCell(index) {
    if (!this.running || !this.accepting) return;
    if (index === this.cursor) {
      this.toggleCurrent();
      return;
    }
    const row = Math.floor(this.cursor / MIRROR_BOARD_SIZE);
    const column = this.cursor % MIRROR_BOARD_SIZE;
    const nextRow = Math.floor(index / MIRROR_BOARD_SIZE);
    const nextColumn = index % MIRROR_BOARD_SIZE;
    if (Math.abs(row - nextRow) + Math.abs(column - nextColumn) !== 1) {
      this.beginPressure();
      this.snapshot.totalActions += 1;
      this.wrongActions += 1;
      platformAudio.play('wrong', -40);
      this.emitSnapshot();
      this.onAnnounce({ key: 'mirrorNotAdjacent' });
      return;
    }
    this.move(nextRow - row, nextColumn - column);
  }

  move(rowDelta, columnDelta) {
    if (!this.running || !this.accepting) return;
    const row = Math.floor(this.cursor / MIRROR_BOARD_SIZE);
    const column = this.cursor % MIRROR_BOARD_SIZE;
    const nextRow = row + rowDelta;
    const nextColumn = column + columnDelta;
    if (nextRow < 0 || nextRow >= MIRROR_BOARD_SIZE || nextColumn < 0 || nextColumn >= MIRROR_BOARD_SIZE) return;
    this.beginPressure();
    this.cursor = nextRow * MIRROR_BOARD_SIZE + nextColumn;
    this.moves += 1;
    this.snapshot.totalActions += 1;
    this.snapshot.correctActions += 1;
    platformAudio.play('move', (nextColumn - 2) * 12);
    this.renderTarget();
    this.emitSnapshot();
    this.onAnnounce({ key: 'mirrorCursorMoved', values: { row: nextRow + 1, column: nextColumn + 1 } });
    this.focusCursor();
    this.checkMoveBudget();
  }

  toggleCurrent() {
    if (!this.running || !this.accepting) return;
    this.beginPressure();
    this.moves += 1;
    this.snapshot.totalActions += 1;
    if (this.stage.locked.includes(this.cursor)) {
      this.wrongActions += 1;
      platformAudio.play('wrong', -25);
      this.emitSnapshot();
      this.onAnnounce({ key: 'mirrorLocked' });
      this.checkMoveBudget();
      return;
    }

    if (this.stage.mechanic === 'sequence') {
      const expected = this.stage.targetPattern[this.sequenceProgress];
      if (this.cursor !== expected) {
        this.wrongActions += 1;
        this.resolveMiss('sequence');
        return;
      }
      this.activeCells.add(this.cursor);
      this.sequenceProgress += 1;
      this.snapshot.correctActions += 1;
      platformAudio.play('cue', this.sequenceProgress * 16);
      this.renderTarget();
      this.emitSnapshot();
      if (this.sequenceProgress >= this.stage.targetPattern.length) this.resolveSuccess();
      else this.checkMoveBudget();
      return;
    }

    const beforeResult = evaluateMirrorBoard(this.stage, this.activeCells);
    const before = beforeResult.missing.length + beforeResult.extra.length;
    if (this.activeCells.has(this.cursor)) this.activeCells.delete(this.cursor);
    else this.activeCells.add(this.cursor);
    const afterResult = evaluateMirrorBoard(this.stage, this.activeCells);
    const after = afterResult.missing.length + afterResult.extra.length;
    if (after < before) this.snapshot.correctActions += 1;
    else this.wrongActions += 1;
    platformAudio.play('cue', this.activeCells.has(this.cursor) ? 28 : -22);
    this.renderTarget();
    this.emitSnapshot();
    this.onAnnounce({ key: this.activeCells.has(this.cursor) ? 'mirrorCellEnabled' : 'mirrorCellDisabled' });
    this.checkMoveBudget();
  }

  checkPattern() {
    if (!this.running || !this.accepting || this.stage.mechanic === 'sequence') return;
    this.beginPressure();
    this.snapshot.totalActions += 1;
    const result = evaluateMirrorBoard(this.stage, this.activeCells);
    if (result.correct) {
      this.snapshot.correctActions += 1;
      this.resolveSuccess();
    } else {
      this.wrongActions += 1;
      this.resolveMiss('wrong');
    }
  }

  checkMoveBudget() {
    if (this.accepting && this.moves > this.stage.moveBudget) this.resolveMiss('moves');
  }

  resolveSuccess() {
    if (!this.running || !this.accepting) return;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    const combo = this.snapshot.combo + 1;
    const result = scoreMirrorStage({
      stage: this.stage,
      moves: this.moves,
      elapsedMs: this.stageStartedAt !== null ? performance.now() - this.stageStartedAt : 0,
      combo,
      wrongActions: this.wrongActions
    });
    this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.bestCombo = Math.max(this.snapshot.bestCombo, combo);
    this.snapshot.patterns += 1;
    this.snapshot.round = this.stageIndex + 1;
    let restored = false;
    if (this.stage.restoresChance && this.snapshot.lives < 3) {
      this.snapshot.lives += 1;
      restored = true;
    }
    this.container.dataset.feedback = 'correct';
    this.renderTarget();
    this.emitSnapshot();
    platformAudio.play('correct', Math.min(120, combo * 8));
    this.onAnnounce({ key: 'mirrorCorrect', values: { points: result.points }, extraKey: restored ? 'mirrorRecovery' : null });
    this.dispatch('resolved', { correct: true, stage: this.stage, points: result.points, restored });
    this.schedule(() => this.advanceStage(), this.reducedMotion ? 280 : 650);
  }

  resolveMiss(kind) {
    if (!this.running || !this.accepting) return;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    this.snapshot.round = this.stageIndex + 1;
    this.container.dataset.feedback = 'wrong';
    this.renderTarget();
    this.emitSnapshot();
    platformAudio.play('wrong', kind === 'timeout' ? -70 : -20);
    const key = kind === 'timeout' ? 'mirrorTimeout' : kind === 'moves' ? 'mirrorMoveLimit' : kind === 'sequence' ? 'mirrorSequenceWrong' : 'mirrorWrong';
    this.onAnnounce({ key });
    this.dispatch('resolved', { correct: false, stage: this.stage, kind });
    if (this.snapshot.lives <= 0) {
      this.schedule(() => this.finish('failed'), this.reducedMotion ? 320 : 720);
      return;
    }
    this.schedule(() => this.advanceStage(), this.reducedMotion ? 320 : 760);
  }

  advanceStage() {
    if (!this.running) return;
    this.stageIndex += 1;
    this.showStage();
  }

  requestExit() {
    if (!this.running) return;
    if (this.exitArmed) {
      this.disarmExit();
      this.finish('ended');
      return;
    }
    this.exitArmed = true;
    this.exitButton.textContent = this.t('mirrorExitNow');
    this.dispatch('exit-armed');
    this.onAnnounce({ key: 'mirrorExitConfirm' });
    this.exitTimer = this.schedule(() => this.disarmExit(), 3000);
  }

  disarmExit() {
    if (!this.exitArmed && !this.exitTimer) return;
    this.exitArmed = false;
    this.clearTimer(this.exitTimer);
    this.exitTimer = null;
    if (this.exitButton) this.exitButton.textContent = this.t('mirrorEndRun');
    this.dispatch('exit-disarmed');
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.disarmExit();
    const summary = summarizeMirrorRun(this.snapshot);
    const result = { ...this.snapshot, ...summary, reason, durationMs: Math.round(performance.now() - this.startedAt) };
    this.onUpdate({ ...this.snapshot });
    this.dispatch('finish', { result });
    platformAudio.play('finish', reason === 'ended' ? 40 : -35);
    this.onFinish(result);
  }

  destroy() {
    this.running = false;
    this.accepting = false;
    this.abortController?.abort();
    this.abortController = null;
    this.languageObserver?.disconnect();
    this.languageObserver = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.deadlineTimer = null;
    this.exitTimer = null;
    this.exitArmed = false;
    this.container?.removeAttribute('data-feedback');
    this.container?.removeAttribute('data-phase');
  }
}
