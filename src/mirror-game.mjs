import { clamp, mirrorPlan, scoreMirrorRound } from './core.mjs';
import { normalizeLanguage, translate } from './i18n.mjs';

export class MirrorFuseGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.sourceGrid = container.querySelector('[data-mirror-source]');
    this.sourceDescription = container.querySelector('[data-mirror-source-description]');
    this.buttons = [...container.querySelectorAll('[data-mirror-option]')];
    this.optionGrids = this.buttons.map((button) => button.querySelector('[data-mirror-grid]'));
    this.marks = this.buttons.map((button) => button.querySelector('[data-mirror-mark]'));
    if (!this.sourceGrid || !this.sourceDescription || this.buttons.length !== 3 || this.optionGrids.some((grid) => !grid) || this.marks.some((mark) => !mark)) {
      throw new Error('Mirror Fuse requires one source grid, one source description, and three complete options');
    }
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.languageObserver = null;
    this.timers = new Set();
    this.deadlineTimer = null;
    this.running = false;
    this.accepting = false;
    this.visibleStage = null;
    this.ensureCells(this.sourceGrid);
    this.optionGrids.forEach((grid) => this.ensureCells(grid));
  }

  ensureCells(grid) {
    if (grid.children.length === 12) return;
    grid.replaceChildren(...Array.from({ length: 12 }, () => {
      const cell = document.createElement('span');
      cell.setAttribute('aria-hidden', 'true');
      return cell;
    }));
  }

  emptySnapshot() {
    return { score: 0, round: 0, rounds: 10, lives: 3, combo: 0, precision: 0 };
  }

  language() {
    return normalizeLanguage(this.container.ownerDocument.documentElement.lang);
  }

  t(key, values = {}) {
    return translate(this.language(), key, values);
  }

  describePattern(pattern) {
    return Array.from({ length: 3 }, (_, row) => {
      const cells = pattern
        .slice(row * 4, row * 4 + 4)
        .map((cell) => this.t(cell === 1 ? 'mirrorCellOn' : 'mirrorCellOff'))
        .join(', ');
      return this.t('mirrorPatternRow', { row: row + 1, cells });
    }).join('. ');
  }

  refreshAccessibility(stage = this.visibleStage) {
    if (!stage) return;
    const sourcePattern = this.describePattern(stage.source);
    this.sourceDescription.textContent = this.t('mirrorSourcePattern', { pattern: sourcePattern });
    this.buttons.forEach((button, index) => {
      button.setAttribute('aria-label', this.t('mirrorOptionPattern', {
        value: index + 1,
        pattern: this.describePattern(stage.options[index])
      }));
    });
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.plan = mirrorPlan(seed, 10);
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.accepting = false;
    this.startedAt = performance.now();
    this.container.dataset.reduced = String(this.reducedMotion);
    this.installListeners();
    this.installLanguageObserver();
    this.resetVisuals();
    this.onUpdate({ ...this.snapshot });
    this.schedule(() => this.showRound(), 320);
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.activate(index), { signal });
    });
  }

  installLanguageObserver() {
    if (typeof MutationObserver !== 'function') return;
    this.languageObserver = new MutationObserver(() => this.refreshAccessibility());
    this.languageObserver.observe(this.container.ownerDocument.documentElement, { attributes: true, attributeFilter: ['lang'] });
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

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    this.container.dataset.reduced = String(this.reducedMotion);
  }

  renderPattern(grid, pattern) {
    [...grid.children].forEach((cell, index) => {
      const active = pattern[index] === 1;
      cell.dataset.on = String(active);
      cell.textContent = active ? '◆' : '·';
    });
  }

  resetVisuals() {
    this.container.removeAttribute('data-feedback');
    this.visibleStage = null;
    this.sourceDescription.textContent = '';
    this.sourceGrid.querySelectorAll('span').forEach((cell) => {
      cell.removeAttribute('data-on');
      cell.textContent = '·';
    });
    this.buttons.forEach((button, index) => {
      button.disabled = true;
      button.classList.remove('is-correct', 'is-wrong');
      button.setAttribute('aria-label', this.t('mirrorOptionLabel', { value: index + 1 }));
      this.marks[index].textContent = '';
      this.optionGrids[index].querySelectorAll('span').forEach((cell) => {
        cell.removeAttribute('data-on');
        cell.textContent = '·';
      });
    });
  }

  showRound() {
    if (!this.running) return;
    if (this.snapshot.round >= this.snapshot.rounds) {
      this.finish('complete');
      return;
    }
    const stage = this.plan[this.snapshot.round];
    this.visibleStage = stage;
    this.accepting = true;
    this.container.removeAttribute('data-feedback');
    this.renderPattern(this.sourceGrid, stage.source);
    this.buttons.forEach((button, index) => {
      button.disabled = false;
      button.classList.remove('is-correct', 'is-wrong');
      this.marks[index].textContent = '';
      this.renderPattern(this.optionGrids[index], stage.options[index]);
    });
    this.refreshAccessibility(stage);
    this.roundStartedAt = performance.now();
    if (!this.container.contains(this.container.ownerDocument.activeElement)) this.buttons[0].focus({ preventScroll: true });
    this.onAnnounce({
      key: 'mirrorPrompt',
      extraKey: 'mirrorSourcePattern',
      extraValues: { pattern: this.describePattern(stage.source) }
    });
    this.deadlineTimer = this.schedule(() => this.resolveMiss('slow'), stage.deadlineMs);
  }

  activate(index) {
    if (!this.running || !this.accepting) return;
    const stage = this.plan[this.snapshot.round];
    if (index === stage.correctIndex) this.resolveHit(index, stage);
    else this.resolveMiss('wrong', index);
  }

  disableOptions() {
    this.buttons.forEach((button) => { button.disabled = true; });
  }

  resolveHit(index, stage) {
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    const combo = this.snapshot.combo + 1;
    const result = scoreMirrorRound({
      elapsedMs: performance.now() - this.roundStartedAt,
      deadlineMs: stage.deadlineMs,
      combo,
      round: this.snapshot.round
    });
    this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.precision = Math.round(clamp(1 - result.response / stage.deadlineMs, 0, 1) * 100);
    this.snapshot.round += 1;
    this.container.dataset.feedback = 'correct';
    this.buttons[index].classList.add('is-correct');
    this.marks[index].textContent = '✓';
    this.disableOptions();
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key: 'mirrorCorrect', values: { points: result.points } });
    this.advance();
  }

  resolveMiss(kind, index = null) {
    if (!this.running || !this.accepting) return;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    const stage = this.plan[this.snapshot.round];
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    this.snapshot.precision = 0;
    this.snapshot.round += 1;
    this.container.dataset.feedback = 'wrong';
    if (index !== null) {
      this.buttons[index]?.classList.add('is-wrong');
      if (this.marks[index]) this.marks[index].textContent = '×';
    }
    this.buttons[stage.correctIndex].classList.add('is-correct');
    this.marks[stage.correctIndex].textContent = '✓';
    this.disableOptions();
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key: kind === 'slow' ? 'mirrorTooSlow' : 'mirrorWrong' });
    if (this.snapshot.lives <= 0) {
      this.schedule(() => this.finish('failed'), 520);
      return;
    }
    this.advance();
  }

  advance() {
    if (this.snapshot.round >= this.snapshot.rounds) this.schedule(() => this.finish('complete'), 520);
    else this.schedule(() => this.showRound(), 720);
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.disableOptions();
    this.onUpdate({ ...this.snapshot });
    this.onFinish({ ...this.snapshot, reason, durationMs: Math.round(performance.now() - this.startedAt) });
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
    if (this.container && this.sourceGrid && this.sourceDescription && this.buttons) this.resetVisuals();
  }
}
