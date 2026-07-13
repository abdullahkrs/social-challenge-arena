import { clamp, echoPlan, scoreEchoRound } from './core.mjs';

export class EchoGridGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.buttons = [...container.querySelectorAll('[data-cell]')];
    if (this.buttons.length !== 9) throw new Error('Echo Grid requires nine cells');
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.timers = new Set();
    this.running = false;
    this.accepting = false;
  }

  emptySnapshot() { return { score: 0, round: 0, rounds: 8, lives: 3, combo: 0, precision: 0 }; }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.plan = echoPlan(seed, 8);
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.startedAt = performance.now();
    this.installListeners();
    this.onUpdate({ ...this.snapshot });
    this.schedule(() => this.showRound(), 300);
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.activate(index), { signal });
    });
  }

  schedule(callback, delay) {
    const timer = setTimeout(() => { this.timers.delete(timer); callback(); }, delay);
    this.timers.add(timer);
    return timer;
  }

  setReducedMotion(value) { this.reducedMotion = Boolean(value); }

  clearCells() {
    this.buttons.forEach((button) => {
      button.classList.remove('is-lit', 'is-correct', 'is-wrong');
      button.textContent = '';
      button.disabled = true;
    });
  }

  showRound() {
    if (!this.running) return;
    this.accepting = false;
    this.inputIndex = 0;
    this.clearCells();
    const sequence = this.plan[this.snapshot.round];
    this.onAnnounce({ key: 'watchSequence', values: { count: sequence.length } });
    const stepMs = this.reducedMotion ? 520 : 620;
    sequence.forEach((cell, index) => {
      this.schedule(() => {
        if (!this.running) return;
        const button = this.buttons[cell];
        button.classList.add('is-lit');
        button.textContent = String(index + 1);
        this.schedule(() => {
          button.classList.remove('is-lit');
          button.textContent = '';
        }, this.reducedMotion ? 330 : 400);
      }, index * stepMs);
    });
    this.schedule(() => this.beginInput(), sequence.length * stepMs + 120);
  }

  beginInput() {
    if (!this.running) return;
    this.accepting = true;
    this.buttons.forEach((button) => { button.disabled = false; });
    this.onAnnounce({ key: 'yourTurn' });
    this.buttons[0].focus({ preventScroll: true });
  }

  activate(index) {
    if (!this.running || !this.accepting) return;
    const sequence = this.plan[this.snapshot.round];
    const button = this.buttons[index];
    if (index === sequence[this.inputIndex]) {
      button.classList.add('is-correct');
      button.textContent = '✓';
      this.inputIndex += 1;
      this.onAnnounce({ key: 'echoCorrect' });
      this.schedule(() => { button.classList.remove('is-correct'); button.textContent = ''; }, 260);
      if (this.inputIndex === sequence.length) this.completeRound(sequence.length);
      return;
    }

    this.accepting = false;
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    button.classList.add('is-wrong');
    button.textContent = '×';
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key: 'echoWrong' });
    if (this.snapshot.lives <= 0) {
      this.schedule(() => this.finish('failed'), 380);
    } else {
      this.schedule(() => this.showRound(), 650);
    }
  }

  completeRound(length) {
    this.accepting = false;
    this.buttons.forEach((button) => { button.disabled = true; });
    const combo = this.snapshot.combo + 1;
    const points = scoreEchoRound({ length, combo, round: this.snapshot.round });
    this.snapshot.score = clamp(this.snapshot.score + points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.precision = 100;
    this.snapshot.round += 1;
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key: 'roundCleared', values: { points } });
    if (this.snapshot.round >= this.snapshot.rounds) {
      this.schedule(() => this.finish('complete'), 420);
    } else {
      this.schedule(() => this.showRound(), 700);
    }
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    this.accepting = false;
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
    this.buttons?.forEach((button) => {
      button.classList.remove('is-lit', 'is-correct', 'is-wrong');
      button.textContent = '';
      button.disabled = true;
    });
  }
}
