import { clamp, lanePlan, scoreLaneRound } from './core.mjs';

const SYMBOLS = ['←', '●', '→'];

export class LaneSparkGame {
  constructor({ container, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(container instanceof HTMLElement)) throw new TypeError('container is required');
    this.container = container;
    this.buttons = [...container.querySelectorAll('[data-lane]')];
    this.signal = container.querySelector('[data-lane-signal]');
    this.timer = container.querySelector('[data-lane-timer]');
    if (this.buttons.length !== 3 || !this.signal || !this.timer) throw new Error('Lane Spark requires three lanes');
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.timers = new Set();
    this.frame = 0;
    this.running = false;
    this.accepting = false;
  }

  emptySnapshot() { return { score: 0, round: 0, rounds: 12, lives: 3, combo: 0, precision: 0 }; }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.plan = lanePlan(seed, 12);
    this.snapshot = this.emptySnapshot();
    this.running = true;
    this.startedAt = performance.now();
    this.installListeners();
    this.resetBoard();
    this.onUpdate({ ...this.snapshot });
    this.schedule(() => this.showRound(), 260);
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.buttons.forEach((button, lane) => {
      button.addEventListener('click', () => this.choose(lane), { signal });
    });
    this.container.addEventListener('keydown', (event) => {
      if (!this.running || !this.container.contains(document.activeElement)) return;
      if (/^Digit[123]$/.test(event.code)) {
        event.preventDefault();
        this.choose(Number(event.code.at(-1)) - 1);
      }
    }, { signal });
  }

  schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    this.container.dataset.reduced = String(this.reducedMotion);
  }

  resetBoard() {
    this.accepting = false;
    this.container.classList.remove('is-active', 'is-correct', 'is-wrong');
    this.container.removeAttribute('data-target');
    this.signal.textContent = '•';
    this.timer.style.width = '100%';
    this.buttons.forEach((button) => { button.disabled = true; button.removeAttribute('aria-pressed'); });
  }

  showRound() {
    if (!this.running) return;
    const stage = this.plan[this.snapshot.round];
    this.accepting = true;
    this.roundStartedAt = performance.now();
    this.roundDeadline = this.roundStartedAt + stage.windowMs;
    this.container.classList.remove('is-correct', 'is-wrong');
    this.container.classList.add('is-active');
    this.container.dataset.target = String(stage.lane);
    this.container.dataset.reduced = String(this.reducedMotion);
    this.signal.textContent = SYMBOLS[stage.lane];
    this.buttons.forEach((button) => { button.disabled = false; button.setAttribute('aria-pressed', 'false'); });
    this.onAnnounce({ key: 'laneSignal', values: { lane: stage.lane + 1 } });
    this.updateTimer();
  }

  updateTimer() {
    if (!this.running || !this.accepting) return;
    const stage = this.plan[this.snapshot.round];
    const remaining = clamp((this.roundDeadline - performance.now()) / stage.windowMs, 0, 1);
    this.timer.style.width = `${Math.round(remaining * 100)}%`;
    if (remaining <= 0) {
      this.miss('laneTimeout');
      return;
    }
    this.frame = requestAnimationFrame(() => this.updateTimer());
  }

  choose(lane) {
    if (!this.running || !this.accepting) return;
    const stage = this.plan[this.snapshot.round];
    if (lane !== stage.lane) {
      this.buttons[lane]?.setAttribute('aria-pressed', 'true');
      this.miss('laneWrong');
      return;
    }
    this.accepting = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    const responseMs = performance.now() - this.roundStartedAt;
    const combo = this.snapshot.combo + 1;
    const result = scoreLaneRound({ responseMs, windowMs: stage.windowMs, combo, round: this.snapshot.round });
    this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
    this.snapshot.combo = combo;
    this.snapshot.precision = result.speed;
    this.snapshot.round += 1;
    this.container.classList.remove('is-active');
    this.container.classList.add('is-correct');
    this.buttons.forEach((button, index) => {
      button.disabled = true;
      button.setAttribute('aria-pressed', String(index === lane));
    });
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key: 'laneCorrect', values: { points: result.points }, extraKey: 'reactionSpeed', extraValues: { value: result.speed } });
    if (this.snapshot.round >= this.snapshot.rounds) this.schedule(() => this.finish('complete'), 380);
    else this.schedule(() => this.showRound(), this.reducedMotion ? 300 : stage.leadMs);
  }

  miss(key) {
    if (!this.running || !this.accepting) return;
    this.accepting = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.snapshot.lives -= 1;
    this.snapshot.combo = 0;
    this.snapshot.precision = 0;
    this.snapshot.round += 1;
    this.container.classList.remove('is-active');
    this.container.classList.add('is-wrong');
    this.buttons.forEach((button) => { button.disabled = true; });
    this.onUpdate({ ...this.snapshot });
    this.onAnnounce({ key });
    if (this.snapshot.lives <= 0) this.schedule(() => this.finish('failed'), 420);
    else if (this.snapshot.round >= this.snapshot.rounds) this.schedule(() => this.finish('complete'), 420);
    else this.schedule(() => this.showRound(), this.reducedMotion ? 320 : 520);
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    this.accepting = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.buttons.forEach((button) => { button.disabled = true; });
    this.onUpdate({ ...this.snapshot });
    this.onFinish({ ...this.snapshot, reason, durationMs: Math.round(performance.now() - this.startedAt) });
  }

  destroy() {
    this.running = false;
    this.accepting = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.abortController?.abort();
    this.abortController = null;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    if (this.buttons && this.signal && this.timer) this.resetBoard();
  }
}
