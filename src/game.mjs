import { angularDistance, challengePlan, clamp, isGameAttemptKey, scoreAttempt } from './core.mjs';

const TAU = Math.PI * 2;

export class OrbitLockGame {
  constructor({ canvas, onUpdate, onFinish, onAnnounce, reducedMotion = false }) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('canvas is required');
    this.canvas = canvas;
    this.context = canvas.getContext('2d', { alpha: false });
    if (!this.context) throw new Error('2D canvas is not available');
    this.onUpdate = onUpdate;
    this.onFinish = onFinish;
    this.onAnnounce = onAnnounce;
    this.reducedMotion = Boolean(reducedMotion);
    this.abortController = null;
    this.frame = 0;
    this.resizeObserver = null;
    this.running = false;
    this.lastTime = 0;
    this.feedbackUntil = 0;
    this.feedback = null;
    this.particles = [];
    this.snapshot = this.emptySnapshot();
  }

  emptySnapshot() {
    return { score: 0, round: 0, rounds: 12, lives: 3, combo: 0, precision: 0 };
  }

  start(seed) {
    this.destroy();
    this.abortController = new AbortController();
    this.plan = challengePlan(seed, 12);
    this.snapshot = this.emptySnapshot();
    this.angle = 0;
    this.running = true;
    this.lastTime = performance.now();
    this.startedAt = this.lastTime;
    this.feedback = null;
    this.particles = [];
    this.installListeners();
    this.resize();
    this.onUpdate({ ...this.snapshot });
    this.frame = requestAnimationFrame((time) => this.loop(time));
  }

  setReducedMotion(value) {
    this.reducedMotion = Boolean(value);
    if (this.reducedMotion) this.particles = [];
  }

  installListeners() {
    const signal = this.abortController.signal;
    this.canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.attempt();
    }, { signal });
    window.addEventListener('keydown', (event) => {
      if (this.running && isGameAttemptKey(event, this.canvas)) {
        event.preventDefault();
        this.attempt();
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
    const width = Math.max(280, Math.round(rect.width * ratio));
    const height = Math.max(280, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  attempt() {
    if (!this.running) return;
    const stage = this.plan[this.snapshot.round];
    const distance = angularDistance(this.angle, stage.gateAngle);
    const hit = distance <= stage.gateWidth / 2;
    if (hit) {
      const combo = this.snapshot.combo + 1;
      const result = scoreAttempt({ distance, gateWidth: stage.gateWidth, combo, round: this.snapshot.round });
      this.snapshot.score = clamp(this.snapshot.score + result.points, 0, 9999);
      this.snapshot.combo = combo;
      this.snapshot.precision = result.precision;
      this.feedback = { type: 'hit', points: result.points };
      this.spawnParticles(stage.gateAngle);
      this.snapshot.round += 1;
      this.angle = 0;
      this.onAnnounce({ type: 'hit', points: result.points, precision: result.precision });
      if (this.snapshot.round >= this.snapshot.rounds) {
        this.finish('complete');
        return;
      }
    } else {
      this.snapshot.lives -= 1;
      this.snapshot.combo = 0;
      this.snapshot.precision = 0;
      this.feedback = { type: 'miss' };
      this.onAnnounce({ type: 'miss' });
      if (this.snapshot.lives <= 0) {
        this.finish('failed');
        return;
      }
    }
    this.feedbackUntil = performance.now() + (this.reducedMotion ? 260 : 520);
    this.onUpdate({ ...this.snapshot });
  }

  spawnParticles(angle) {
    if (this.reducedMotion) return;
    for (let index = 0; index < 12; index += 1) {
      this.particles.push({
        angle: angle + (index - 5.5) * 0.035,
        radius: 0.58,
        speed: 0.14 + index * 0.004,
        life: 1
      });
    }
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.onUpdate({ ...this.snapshot });
    this.onFinish({ ...this.snapshot, reason, durationMs: Math.round(performance.now() - this.startedAt) });
  }

  loop(time) {
    if (!this.running) return;
    const delta = Math.min(0.05, Math.max(0, (time - this.lastTime) / 1000));
    this.lastTime = time;
    const stage = this.plan[this.snapshot.round];
    this.angle = (this.angle + delta * stage.speed * stage.direction + TAU) % TAU;
    this.updateParticles(delta);
    this.draw(time, stage);
    this.frame = requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  updateParticles(delta) {
    this.particles = this.particles
      .map((particle) => ({
        ...particle,
        radius: particle.radius + particle.speed * delta,
        life: particle.life - delta * 1.8
      }))
      .filter((particle) => particle.life > 0);
  }

  draw(time, stage) {
    const context = this.context;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const size = Math.min(width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = size * 0.31;
    const pulse = this.reducedMotion ? 1 : 1 + Math.sin(time / 260) * 0.025;

    const background = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.7);
    background.addColorStop(0, '#16234b');
    background.addColorStop(0.52, '#0b1230');
    background.addColorStop(1, '#060916');
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.save();
    context.translate(centerX, centerY);
    context.lineCap = 'round';

    context.strokeStyle = 'rgba(133, 159, 255, 0.22)';
    context.lineWidth = size * 0.018;
    context.beginPath();
    context.arc(0, 0, radius, 0, TAU);
    context.stroke();

    context.strokeStyle = '#7cf6d4';
    context.shadowColor = '#7cf6d4';
    context.shadowBlur = this.reducedMotion ? 6 : 18;
    context.lineWidth = size * 0.036;
    context.beginPath();
    context.arc(0, 0, radius, stage.gateAngle - stage.gateWidth / 2, stage.gateAngle + stage.gateWidth / 2);
    context.stroke();

    const markerX = Math.cos(this.angle) * radius;
    const markerY = Math.sin(this.angle) * radius;
    context.fillStyle = '#ffffff';
    context.shadowColor = '#8aa8ff';
    context.shadowBlur = this.reducedMotion ? 8 : 22;
    context.beginPath();
    context.arc(markerX, markerY, size * 0.034 * pulse, 0, TAU);
    context.fill();
    context.strokeStyle = '#5e82ff';
    context.lineWidth = size * 0.012;
    context.stroke();

    context.shadowBlur = 0;
    context.fillStyle = '#f4f7ff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `700 ${Math.round(size * 0.095)}px system-ui, sans-serif`;
    context.fillText(String(this.snapshot.score), 0, -size * 0.01);
    context.fillStyle = '#aebbe8';
    context.font = `600 ${Math.round(size * 0.032)}px system-ui, sans-serif`;
    context.fillText(`${this.snapshot.round + 1}/${this.snapshot.rounds}`, 0, size * 0.085);

    for (const particle of this.particles) {
      const x = Math.cos(particle.angle) * radius * particle.radius;
      const y = Math.sin(particle.angle) * radius * particle.radius;
      context.globalAlpha = particle.life;
      context.fillStyle = '#7cf6d4';
      context.beginPath();
      context.arc(x, y, size * 0.009, 0, TAU);
      context.fill();
    }
    context.globalAlpha = 1;

    if (this.feedback && time < this.feedbackUntil) {
      context.fillStyle = this.feedback.type === 'hit' ? '#7cf6d4' : '#ff9fbc';
      context.font = `800 ${Math.round(size * 0.05)}px system-ui, sans-serif`;
      context.fillText(this.feedback.type === 'hit' ? `+${this.feedback.points}` : '×', 0, size * 0.18);
    }

    context.restore();
  }

  destroy() {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.abortController?.abort();
    this.abortController = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.particles = [];
  }
}
