import { clamp, lumenPlan, scoreLumenRound } from './core.mjs';

const CUES = ['←', '◆', '→'];
const PROMPTS = ['lanePromptLeft', 'lanePromptCenter', 'lanePromptRight'];

export class LumenLanesGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.cue = container.querySelector('[data-lumen-cue]');
    this.buttons = [...container.querySelectorAll('[data-lane]')];
    if (!this.cue || this.buttons.length !== 3) throw new Error('Lumen Lanes requires one cue and three lanes');
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.timers = new Set();
    this.running = false;
    this.accepting = false;
    this.deadlineTimer = null;
  }

  emptySnapshot() {
    return { score: 0, round: 0, rounds: 18, lives: 3, combo: 0, precision: 0 };
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.plan = lumenPlan(seed, 18);
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.accepting = false;
    this.startedAt = performance.now();
    this.container.dataset.reduced = String(this.reducedMotion);
    this.installListeners();
    this.resetVisuals();
    this.onUpdate({ ...this.snapshot });
    this.schedule(() => this.showRound(), 420);
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.activate(index), { signal });
    });
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

  resetVisuals() {
    this.container.removeAttribute('data-target');
    this.container.removeAttribute('data-feedback');
    this.cue.textContent = '◆';
    this.buttons.forEach((button) => {
      button.disabled = true;
      button.classList.remove('is-correct', 'is-wrong');
    });
  }

  showRound() {
    if (!this.running) return;
    if (this.snapshot.round >= this.snapshot.rounds) {
      this.finish('complete');
      return;
    }
    this.accepting = true;
    this.container.removeAttribute('data-feedback');
    this.buttons.forEach((button) => {
      button.disabled = false;
      button.classList.remove('is-correct', 'is-wrong');
    });
    const stage = this.plan[this.snapshot.round];
    this.container.dataset.target = String(stage.lane);
    this.container.style.setProperty('--lane-drift', String(stage.drift));
    this.cue.textContent = CUES[stage.lane];
    this.roundStartedAt = performance.now();
    if (!this.container.contains(document.activeElement)) this.buttons[1].focus({ preventScroll: true });
    this.onAnnounce({ key: PROMPTS[stage.lane] });
    this.deadlineTimer = this.schedule(() => this.resolveMiss('slow'), stage.deadlineMs);
  }

  activate(index) {
    if (!this.running || !this.accepting) return;
    const stage = this.plan[this.snapshot.round];
    if (index === stage.lane) {
      this.resolveHit(index, stage);
    } else {
      this.resolveMiss('wrong', index);
    }
  }

  resolveHit(index, stage) {
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    const combo = this.snapshot.combo + 1;
    const result = scoreLumenRound({
      elapsedMs: performance.now() - this.roundStartedAt,
      deadlineMs: stage.deadlineMs,
      combo,
      round: this.snapshot.round
    });
    this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.precision = Math.round(clamp(1 - result.reaction / stage.deadlineMs, 0, 1) * 100);
    this.snapshot.round += 1;
    this.container.dataset.feedback = 'correct';
    this.cue.textContent = '✓';
    this.buttons[index].classList.add('is-correct');
    this.buttons.forEach((button) => { button.disabled = true; });
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key: 'laneCorrect', values: { points: result.points } });
    this.advance();
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
    this.container.dataset.feedback = 'wrong';
    this.cue.textContent = '×';
    if (index !== null) this.buttons[index]?.classList.add('is-wrong');
    this.buttons.forEach((button) => { button.disabled = true; });
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key: kind === 'slow' ? 'laneTooSlow' : 'laneWrong' });
    if (this.snapshot.lives <= 0) {
      this.schedule(() => this.finish('failed'), 480);
      return;
    }
    this.advance();
  }

  advance() {
    if (this.snapshot.round >= this.snapshot.rounds) {
      this.schedule(() => this.finish('complete'), 480);
    } else {
      this.schedule(() => this.showRound(), 700);
    }
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    this.accepting = false;
    this.clearTimer(this.deadlineTimer);
    this.deadlineTimer = null;
    this.buttons.forEach((button) => { button.disabled = true; });
    this.onUpdate({ ...this.snapshot });
    this.onFinish({ ...this.snapshot, reason, durationMs: Math.round(performance.now() - this.startedAt) });
  }

  destroy() {
    this.running = false;
    this.accepting = false;
    this.abortController?.abort();
    this.abortController = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.deadlineTimer = null;
    if (this.container && this.cue && this.buttons) this.resetVisuals();
  }
}
