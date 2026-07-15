import { generateRiftZone, scoreRiftAction } from './rift-relay-model.mjs';

const LANES = [0, 1, 2];
const SWIPE_THRESHOLD = 34;
const TAP_MAX_DISTANCE = 18;
const TAP_MAX_MS = 320;

export class RiftRelayGame {
  constructor({ container, reducedMotion = false, onUpdate = () => {}, onAnnounce = () => {}, onFinish = () => {} }) {
    this.container = container;
    this.reducedMotion = reducedMotion;
    this.onUpdate = onUpdate;
    this.onAnnounce = onAnnounce;
    this.onFinish = onFinish;
    this.abort = new AbortController();
    this.running = false;
    this.frame = 0;
    this.lastTime = 0;
    this.seed = 0;
    this.lane = 1;
    this.score = 0;
    this.combo = 0;
    this.lives = 3;
    this.zoneNumber = 0;
    this.segmentIndex = 0;
    this.progress = 0;
    this.jumpUntil = 0;
    this.active = null;
    this.pointer = null;
  }

  start(seed) {
    this.seed = Number(seed) >>> 0;
    this.running = true;
    this.bind();
    this.renderPlayer();
    this.loadSegment();
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame((time) => this.tick(time));
    this.container.focus({ preventScroll: true });
  }

  bind() {
    const signal = this.abort.signal;
    this.container.querySelectorAll('[data-rift-lane]').forEach((button) => {
      button.addEventListener('pointerdown', () => this.move(Number(button.dataset.riftLane)), { signal });
    });
    this.container.querySelector('[data-rift-jump]')?.addEventListener('pointerdown', () => this.jump(), { signal });
    this.container.querySelector('[data-rift-exit]')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.finish('ended');
    }, { signal });

    this.container.addEventListener('pointerdown', (event) => {
      if (!this.running || event.target.closest('[data-rift-exit]')) return;
      this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now() };
      this.container.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    }, { signal });

    this.container.addEventListener('pointerup', (event) => {
      if (!this.running || !this.pointer || this.pointer.id !== event.pointerId) return;
      const dx = event.clientX - this.pointer.x;
      const dy = event.clientY - this.pointer.y;
      const elapsed = performance.now() - this.pointer.at;
      const distance = Math.hypot(dx, dy);
      this.pointer = null;

      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.15) {
        this.move(this.lane + (dx > 0 ? 1 : -1));
      } else if (dy <= -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
        this.jump();
      } else if (distance <= TAP_MAX_DISTANCE && elapsed <= TAP_MAX_MS) {
        this.jump();
      }
      event.preventDefault();
    }, { signal });

    this.container.addEventListener('pointercancel', () => { this.pointer = null; }, { signal });
    this.container.addEventListener('contextmenu', (event) => event.preventDefault(), { signal });

    this.container.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.move(this.lane - 1);
      if (event.key === 'ArrowRight') this.move(this.lane + 1);
      if (event.code === 'Space' || event.key === 'ArrowUp') this.jump();
      if (event.key === 'Escape') this.finish('ended');
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(event.code) || ['ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(event.key)) event.preventDefault();
    }, { signal });
  }

  move(lane) {
    if (!this.running) return;
    const safeLane = Math.max(0, Math.min(2, Number(lane)));
    if (!LANES.includes(safeLane) || safeLane === this.lane) return;
    this.lane = safeLane;
    this.renderPlayer();
    this.container.dataset.input = 'move';
    window.setTimeout(() => { if (this.running) delete this.container.dataset.input; }, 110);
  }

  jump() {
    if (!this.running || performance.now() < this.jumpUntil - 320) return;
    this.jumpUntil = performance.now() + 620;
    this.container.classList.add('is-jumping');
    window.setTimeout(() => this.container.classList.remove('is-jumping'), 640);
  }

  currentZone() {
    const cycle = Math.floor(this.zoneNumber / 6);
    return generateRiftZone(this.seed, cycle, this.zoneNumber % 6);
  }

  loadSegment() {
    const zone = this.currentZone();
    if (this.segmentIndex >= zone.segments.length) {
      this.zoneNumber += 1;
      this.segmentIndex = 0;
      return this.loadSegment();
    }
    this.active = zone.segments[this.segmentIndex];
    this.progress = 0;
    this.container.dataset.zone = zone.type;
    this.container.querySelector('[data-rift-zone]').textContent = `${zone.type} · ${this.zoneNumber + 1}`;
    this.renderObstacle();
    this.onUpdate({ score: this.score, round: this.zoneNumber, lives: this.lives, combo: this.combo });
  }

  renderPlayer() {
    const player = this.container.querySelector('[data-rift-player]');
    if (player) player.style.setProperty('--lane', String(this.lane));
  }

  renderObstacle() {
    const obstacle = this.container.querySelector('[data-rift-obstacle]');
    if (!obstacle || !this.active) return;
    const blocked = this.active.obstacle.blockedLanes;
    obstacle.innerHTML = LANES.map((lane) => {
      const isBlocked = blocked.includes(lane);
      const isAnswer = this.active.kind === 'puzzle' && this.active.puzzle?.correctLane === lane;
      return `<span class="rift-gate ${isBlocked ? 'is-blocked' : 'is-open'} ${isAnswer ? 'is-signal' : ''}" data-lane="${lane}"><i></i></span>`;
    }).join('');
    obstacle.style.setProperty('--rift-progress', '0');
    this.container.querySelector('[data-rift-rule]').textContent = this.active.kind === 'puzzle'
      ? `Signal ${this.active.puzzle.cue + 1}: choose the lit route`
      : this.active.riskyRoute ? 'Risk route active' : 'Find the open route';
  }

  tick(time) {
    if (!this.running) return;
    const delta = Math.min(48, Math.max(0, time - this.lastTime));
    this.lastTime = time;
    const zone = this.currentZone();
    const duration = Math.max(720, this.active.obstacle.timing / zone.difficulty.speed);
    this.progress += delta / duration;
    const obstacle = this.container.querySelector('[data-rift-obstacle]');
    obstacle?.style.setProperty('--rift-progress', String(Math.min(1, this.progress)));
    if (this.progress >= 1) this.resolveSegment(time);
    this.frame = requestAnimationFrame((next) => this.tick(next));
  }

  resolveSegment(time) {
    const obstacle = this.active.obstacle;
    const puzzleLane = this.active.kind === 'puzzle' ? this.active.puzzle.correctLane : null;
    const blocked = obstacle.blockedLanes.includes(this.lane);
    const puzzleWrong = puzzleLane !== null && this.lane !== puzzleLane;
    const jumpRequired = obstacle.type === 'low-beam' || obstacle.type === 'gap';
    const jumpMiss = jumpRequired && time > this.jumpUntil;
    const success = !blocked && !puzzleWrong && !jumpMiss;

    if (success) {
      this.combo += 1;
      const points = scoreRiftAction({
        distance: this.zoneNumber + this.segmentIndex,
        accuracy: 1,
        streak: this.combo,
        risk: this.active.rewardMultiplier,
        puzzle: this.active.kind === 'puzzle'
      });
      this.score += points;
      this.onAnnounce({ key: 'riftClear', values: { points } });
      this.container.classList.add('is-success');
    } else {
      this.lives -= 1;
      this.combo = 0;
      this.onAnnounce({ key: 'riftHit', values: {} });
      this.container.classList.add('is-hit');
    }
    window.setTimeout(() => this.container.classList.remove('is-success', 'is-hit'), this.reducedMotion ? 0 : 260);
    this.segmentIndex += 1;
    this.onUpdate({ score: this.score, round: this.zoneNumber, lives: this.lives, combo: this.combo });
    if (this.lives <= 0) return this.finish('failed');
    this.loadSegment();
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.onFinish({ score: this.score, reason, round: this.zoneNumber, combo: this.combo });
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.frame);
    this.abort.abort();
  }
}