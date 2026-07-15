import Phaser from 'phaser';
import Matter from 'matter-js';
import { generateRiftZone, scoreRiftAction } from './rift-relay-model.mjs';

const { Engine, Bodies, Body, Composite, Events } = Matter;
const SWIPE = 34;

export class RiftRelayGame {
  constructor({ container, reducedMotion = false, onUpdate = () => {}, onAnnounce = () => {}, onFinish = () => {} }) {
    this.container = container;
    this.reducedMotion = reducedMotion;
    this.onUpdate = onUpdate;
    this.onAnnounce = onAnnounce;
    this.onFinish = onFinish;
    this.game = null;
  }

  start(seed) {
    const host = this.container.querySelector('#phaser-game');
    if (!host) throw new Error('Missing Phaser game host');
    host.replaceChildren();
    const callbacks = this;
    const safeSeed = Number(seed) >>> 0;

    class PulseboundScene extends Phaser.Scene {
      constructor() { super('pulsebound'); }

      create() {
        this.seed = safeSeed;
        this.score = 0;
        this.combo = 0;
        this.lives = 3;
        this.stage = 0;
        this.segment = 0;
        this.distance = 0;
        this.route = 0;
        this.sliding = false;
        this.finished = false;
        this.pointerStart = null;
        this.hazards = [];
        this.engine = Engine.create({ gravity: { x: 0, y: 1.25 } });
        this.world = this.engine.world;
        this.makeTextures();
        this.makeWorld();
        this.makePlayer();
        this.bindInput();
        this.scale.on('resize', this.layout, this);
        this.layout(this.scale.gameSize);
        this.loadStage();
        Events.on(this.engine, 'collisionStart', (event) => this.handleCollision(event));
        callbacks.onUpdate({ score: 0, round: 0, lives: 3, combo: 0 });
      }

      makeTextures() {
        const g = this.add.graphics();
        g.fillStyle(0xffffff).fillRoundedRect(0, 0, 54, 66, 16).fillStyle(0x0b2842).fillCircle(27, 24, 9);
        g.generateTexture('runner', 54, 66).clear();
        g.fillStyle(0xffffff).fillRoundedRect(0, 0, 54, 34, 14).fillStyle(0x0b2842).fillRect(10, 12, 34, 8);
        g.generateTexture('runner-slide', 54, 34).clear();
        g.fillStyle(0xff617c).fillRoundedRect(0, 0, 70, 78, 12);
        g.generateTexture('hazard', 70, 78).clear();
        g.fillStyle(0xffce5c).fillRoundedRect(0, 0, 70, 78, 12);
        g.generateTexture('gate', 70, 78).clear();
        g.fillStyle(0x68d8ff).fillRect(0, 0, 96, 18);
        g.generateTexture('platform', 96, 18).destroy();
      }

      makeWorld() {
        this.sky = this.add.rectangle(0, 0, 100, 100, 0x10233e).setOrigin(0);
        this.back = this.add.tileSprite(0, 0, 100, 100, 'platform').setOrigin(0).setTint(0x245c86).setAlpha(0.18);
        this.mid = this.add.tileSprite(0, 0, 100, 100, 'platform').setOrigin(0).setTint(0x3f94b8).setAlpha(0.16);
        this.ground = this.add.rectangle(0, 0, 100, 34, 0x18394d).setOrigin(0, 1);
        this.upper = this.add.rectangle(0, 0, 100, 20, 0x2b6680).setOrigin(0, 1).setAlpha(0.9);
        this.fx = this.add.particles(0, 0, 'platform', { speed: { min: 40, max: 160 }, lifespan: 320, scale: { start: 0.16, end: 0 }, quantity: 0, emitting: false });
      }

      makePlayer() {
        this.player = this.add.sprite(0, 0, 'runner').setDepth(10);
        this.playerBody = Bodies.rectangle(0, 0, 38, 58, { label: 'player', friction: 0, frictionAir: 0.015, restitution: 0 });
        Composite.add(this.world, this.playerBody);
      }

      layout(size) {
        const w = Number(size.width || this.scale.width);
        const h = Number(size.height || this.scale.height);
        this.w = w;
        this.h = h;
        this.cameras.main.setViewport(0, 0, w, h);
        this.sky.setSize(w, h);
        this.back.setSize(w, h);
        this.mid.setSize(w, h);
        this.ground.setPosition(0, h - 26).setSize(w, 34);
        this.upper.setPosition(0, h * 0.54).setSize(w, 20);
        this.floorY = h - 92;
        this.upperY = h * 0.54 - 42;
        if (this.playerBody) {
          Body.setPosition(this.playerBody, { x: Math.max(70, w * 0.18), y: this.route ? this.upperY : this.floorY });
          Body.setVelocity(this.playerBody, { x: 0, y: 0 });
        }
      }

      bindInput() {
        this.input.on('pointerdown', (pointer) => { this.pointerStart = { x: pointer.x, y: pointer.y }; });
        this.input.on('pointerup', (pointer) => {
          if (!this.pointerStart || this.finished) return;
          const dx = pointer.x - this.pointerStart.x;
          const dy = pointer.y - this.pointerStart.y;
          this.pointerStart = null;
          if (dy < -SWIPE && Math.abs(dy) > Math.abs(dx)) this.switchRoute(1);
          else if (dy > SWIPE && Math.abs(dy) > Math.abs(dx)) this.slideOrDrop();
          else this.jump();
        });
        this.input.keyboard?.on('keydown-UP', () => this.jump());
        this.input.keyboard?.on('keydown-SPACE', () => this.jump());
        this.input.keyboard?.on('keydown-DOWN', () => this.slideOrDrop());
        this.input.keyboard?.on('keydown-ESC', () => this.endRun('ended'));
      }

      jump() {
        if (this.finished) return;
        const target = this.route ? this.upperY : this.floorY;
        if (Math.abs(this.playerBody.position.y - target) > 18) return;
        Body.setVelocity(this.playerBody, { x: 0, y: this.route ? -10.5 : -12 });
        this.tweens.add({ targets: this.player, angle: 8, duration: 120, yoyo: true });
      }

      switchRoute(route) {
        if (this.finished || this.route === route) return;
        this.route = route;
        Body.setPosition(this.playerBody, { x: this.playerBody.position.x, y: route ? this.upperY : this.floorY });
        Body.setVelocity(this.playerBody, { x: 0, y: 0 });
      }

      slideOrDrop() {
        if (this.route) return this.switchRoute(0);
        if (this.sliding || this.finished) return;
        this.sliding = true;
        this.player.setTexture('runner-slide').setDisplaySize(54, 34);
        this.time.delayedCall(500, () => {
          if (!this.player.active) return;
          this.sliding = false;
          this.player.setTexture('runner').setDisplaySize(54, 66);
        });
      }

      loadStage() {
        this.zone = generateRiftZone(this.seed, this.stage);
        const names = ['MEADOW', 'SKYWORKS', 'ECHO CAVES', 'MIRAGE CITY', 'STORM CORE', 'MASTER VAULT', 'REST GARDEN'];
        const colors = [0x102f3c, 0x17345d, 0x30244f, 0x4c293f, 0x4b1c28, 0x163c3e, 0x194331];
        this.sky.setFillStyle(colors[this.stage % colors.length]);
        this.speed = Math.min(640, 270 + this.zone.difficulty.speed * 90 + this.stage * 10);
        callbacks.container.querySelector('[data-rift-zone]').textContent = `${names[this.stage % names.length]} · ${this.stage + 1}`;
        callbacks.container.querySelector('[data-rift-rule]').textContent = ['TAP TO JUMP', 'JUMP + CHOOSE ROUTE', 'MATCH THE SYMBOL', 'IGNORE THE DECOY', 'MEMORIZE THE PULSE', 'COMBINE ALL RULES', 'RECOVER AND BREATHE'][this.stage % 7];
        this.nextSpawnAt = 0;
        this.cameras.main.flash(callbacks.reducedMotion ? 0 : 150, 80, 210, 255, false);
      }

      spawnSegment() {
        const segment = this.zone.events[this.segment % this.zone.events.length];
        const route = segment.rule ? segment.rule.correctTrack : (segment.index + this.stage) % 2;
        const y = route ? this.upperY : this.floorY;
        const gate = segment.type === 'gate';
        const sprite = this.add.sprite(this.w + 80, y, gate ? 'gate' : 'hazard').setDepth(8);
        const body = Bodies.rectangle(sprite.x, sprite.y, 62, 70, { isStatic: true, isSensor: true, label: 'hazard' });
        body.plugin = { sprite, route, gate, requiresJump: segment.requiresJump, requiresSlide: segment.requiresSlide, risk: segment.risk, resolved: false, segment };
        Composite.add(this.world, body);
        this.hazards.push(body);
        if (gate) body.plugin.symbol = this.add.text(sprite.x, sprite.y, ['◆', '▲', '●', '■'][segment.rule.cue % 4], { fontFamily: 'system-ui', fontSize: '30px', fontStyle: 'bold', color: '#101722' }).setOrigin(0.5).setDepth(9);
        this.segment += 1;
      }

      handleCollision(event) {
        for (const pair of event.pairs) {
          const other = pair.bodyA === this.playerBody ? pair.bodyB : pair.bodyB === this.playerBody ? pair.bodyA : null;
          if (other?.label === 'hazard') this.resolveObstacle(other);
        }
      }

      resolveObstacle(body) {
        const data = body.plugin;
        if (data.resolved) return;
        data.resolved = true;
        const sameRoute = data.route === this.route;
        const airborne = Math.abs(this.playerBody.position.y - (this.route ? this.upperY : this.floorY)) > 20;
        const success = data.gate ? sameRoute : (!sameRoute || (data.requiresJump && airborne) || (data.requiresSlide && this.sliding));
        if (success) {
          this.combo += 1;
          const points = scoreRiftAction({ distance: this.distance, streak: this.combo, risk: data.risk, puzzle: data.gate, stage: this.stage % 7 });
          this.score += points;
          callbacks.onAnnounce({ key: 'riftClear', values: { points } });
          this.fx.emitParticleAt(this.player.x, this.player.y, 12);
          this.cameras.main.shake(callbacks.reducedMotion ? 0 : 80, 0.004);
        } else {
          this.lives -= 1;
          this.combo = 0;
          callbacks.onAnnounce({ key: 'riftHit', values: {} });
          this.cameras.main.shake(callbacks.reducedMotion ? 0 : 160, 0.015);
          this.cameras.main.flash(callbacks.reducedMotion ? 0 : 100, 255, 60, 90, false);
        }
        callbacks.onUpdate({ score: this.score, round: this.stage, lives: this.lives, combo: this.combo });
        if (this.lives <= 0) this.endRun('failed');
      }

      update(time, delta) {
        if (this.finished) return;
        Engine.update(this.engine, Math.min(delta, 33));
        this.distance += delta * 0.03;
        this.back.tilePositionX += delta * this.speed * 0.00012;
        this.mid.tilePositionX += delta * this.speed * 0.00027;
        const target = this.route ? this.upperY : this.floorY;
        if (this.playerBody.position.y > target) {
          Body.setPosition(this.playerBody, { x: this.playerBody.position.x, y: target });
          Body.setVelocity(this.playerBody, { x: 0, y: 0 });
        }
        Body.setPosition(this.playerBody, { x: Math.max(70, this.w * 0.18), y: this.playerBody.position.y });
        this.player.setPosition(this.playerBody.position.x, this.playerBody.position.y);
        if (time >= this.nextSpawnAt) {
          this.spawnSegment();
          this.nextSpawnAt = time + Math.max(650, this.zone.difficulty.windowMs * 0.72);
        }
        for (const body of [...this.hazards]) {
          Body.translate(body, { x: -this.speed * delta / 1000, y: 0 });
          const sprite = body.plugin.sprite;
          sprite.setPosition(body.position.x, body.position.y);
          body.plugin.symbol?.setPosition(body.position.x, body.position.y);
          if (!body.plugin.resolved && Math.abs(body.position.x - this.playerBody.position.x) < 32) this.resolveObstacle(body);
          if (body.position.x < -100) {
            body.plugin.symbol?.destroy();
            sprite.destroy();
            Composite.remove(this.world, body);
            this.hazards.splice(this.hazards.indexOf(body), 1);
          }
        }
        if (this.segment > 0 && this.segment % this.zone.events.length === 0 && this.hazards.length === 0) {
          if (this.zone.difficulty.recovery && this.lives < 3) this.lives += 1;
          this.stage += 1;
          this.segment = 0;
          this.loadStage();
          callbacks.onUpdate({ score: this.score, round: this.stage, lives: this.lives, combo: this.combo });
        }
      }

      endRun(reason) {
        if (this.finished) return;
        this.finished = true;
        callbacks.onFinish({ score: this.score, reason, round: this.stage, combo: this.combo });
      }

      shutdown() {
        Events.off(this.engine);
        Composite.clear(this.world, false);
        Engine.clear(this.engine);
      }
    }

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      backgroundColor: '#091321',
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
      render: { antialias: true, pixelArt: false, roundPixels: false },
      scene: PulseboundScene,
      input: { activePointers: 2 }
    });

    this.container.querySelector('[data-rift-exit]')?.addEventListener('click', () => this.game?.scene?.getScene('pulsebound')?.endRun('ended'), { once: true });
  }

  destroy() {
    this.game?.destroy(true);
    this.game = null;
    this.container.querySelector('#phaser-game')?.replaceChildren();
  }
}
