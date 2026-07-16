import Phaser from 'phaser';
import Matter from 'matter-js';
import { generateRiftZone, scoreRiftAction } from './rift-relay-model.mjs';

const { Engine, Bodies, Body, Composite, Events } = Matter;
const SWIPE = 34;

const PALETTES = [
  { sky: 0x5ec8f4, haze: 0xbcecff, mountain: 0x6aa59c, forest: 0x24745d, ground: 0x38653b, accent: 0xffd54f },
  { sky: 0x5076c7, haze: 0xaed9ff, mountain: 0x5c6f9c, forest: 0x31568a, ground: 0x284f72, accent: 0x7de8ff },
  { sky: 0x513e75, haze: 0xa98ed1, mountain: 0x514365, forest: 0x274553, ground: 0x243b43, accent: 0xd5a7ff },
  { sky: 0xf08c72, haze: 0xffd6a1, mountain: 0x9a596c, forest: 0x704052, ground: 0x563448, accent: 0xffcf66 }
];

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

        g.fillStyle(0x2d6cdf).fillCircle(28, 30, 24);
        g.fillStyle(0xffffff).fillCircle(36, 23, 10);
        g.fillStyle(0x10233e).fillCircle(39, 23, 4);
        g.fillStyle(0xffd45c).fillTriangle(8, 33, 0, 39, 8, 44);
        g.fillStyle(0xf4f8ff).fillEllipse(28, 51, 26, 14);
        g.generateTexture('runner', 58, 66).clear();

        g.fillStyle(0x2d6cdf).fillEllipse(30, 18, 50, 28);
        g.fillStyle(0xffffff).fillCircle(42, 14, 8);
        g.fillStyle(0x10233e).fillCircle(44, 14, 3);
        g.fillStyle(0xffd45c).fillTriangle(6, 18, 0, 23, 6, 28);
        g.generateTexture('runner-slide', 60, 36).clear();

        g.fillStyle(0x7a4c2c).fillRoundedRect(5, 18, 60, 58, 12);
        g.fillStyle(0xa96d3d).fillEllipse(35, 20, 64, 24);
        g.lineStyle(4, 0x5a351f).strokeEllipse(35, 20, 44, 14);
        g.fillStyle(0x86cf4f).fillCircle(11, 10, 8).fillCircle(24, 8, 9).fillCircle(38, 10, 8).fillCircle(52, 8, 9).fillCircle(63, 11, 8);
        g.generateTexture('hazard', 70, 80).clear();

        g.fillStyle(0xffd65a).fillRoundedRect(5, 4, 60, 72, 18);
        g.fillStyle(0xff9f43).fillRoundedRect(12, 11, 46, 58, 14);
        g.lineStyle(4, 0xffffff, 0.65).strokeRoundedRect(12, 11, 46, 58, 14);
        g.generateTexture('gate', 70, 80).clear();

        g.fillStyle(0x3d6d3e).fillRect(0, 8, 128, 24);
        g.fillStyle(0x75c94f).fillRect(0, 0, 128, 11);
        for (let x = 5; x < 128; x += 13) g.fillStyle(x % 2 ? 0x91df5e : 0x5ead3e).fillTriangle(x, 9, x + 6, 0, x + 12, 9);
        g.generateTexture('platform', 128, 32).clear();

        g.fillStyle(0x8ab8b0).fillTriangle(0, 100, 70, 10, 140, 100);
        g.fillStyle(0xbfe4dd).fillTriangle(40, 100, 102, 34, 164, 100);
        g.generateTexture('mountains', 164, 100).clear();

        g.fillStyle(0x285f45).fillCircle(35, 38, 30).fillCircle(65, 28, 35).fillCircle(92, 42, 28);
        g.fillStyle(0x1e4c38).fillCircle(55, 55, 34).fillCircle(88, 58, 31);
        g.fillStyle(0x795032).fillRect(61, 56, 16, 52);
        g.generateTexture('tree-line', 128, 112).clear();

        g.fillStyle(0xffffff, 0.8).fillCircle(24, 22, 18).fillCircle(47, 15, 23).fillCircle(73, 24, 18).fillEllipse(48, 30, 80, 28);
        g.generateTexture('cloud', 96, 48).clear();

        g.fillStyle(0x94edff, 0.9).fillRect(10, 0, 34, 112);
        g.fillStyle(0xffffff, 0.7).fillRect(17, 0, 7, 112).fillRect(31, 0, 5, 112);
        g.fillStyle(0xbaf5ff, 0.55).fillCircle(13, 108, 11).fillCircle(27, 112, 13).fillCircle(42, 108, 10);
        g.generateTexture('waterfall', 54, 122).clear();

        g.fillStyle(0xb8ef6a).fillEllipse(8, 4, 16, 8);
        g.generateTexture('leaf', 16, 8).clear();

        g.fillStyle(0xffffff).fillCircle(6, 6, 6);
        g.generateTexture('spark', 12, 12).destroy();
      }

      makeWorld() {
        this.sky = this.add.rectangle(0, 0, 100, 100, PALETTES[0].sky).setOrigin(0).setDepth(-20);
        this.sun = this.add.circle(0, 0, 52, 0xffe788, 0.9).setDepth(-19);
        this.clouds = this.add.tileSprite(0, 0, 100, 100, 'cloud').setOrigin(0).setAlpha(0.5).setDepth(-18);
        this.mountains = this.add.tileSprite(0, 0, 100, 100, 'mountains').setOrigin(0).setDepth(-16);
        this.forest = this.add.tileSprite(0, 0, 100, 100, 'tree-line').setOrigin(0).setDepth(-12);
        this.waterfall = this.add.tileSprite(0, 0, 54, 122, 'waterfall').setOrigin(0).setAlpha(0.95).setDepth(-11);
        this.ground = this.add.tileSprite(0, 0, 100, 32, 'platform').setOrigin(0, 1).setDepth(3);
        this.upper = this.add.tileSprite(0, 0, 100, 32, 'platform').setOrigin(0, 1).setDepth(3).setAlpha(0.96);
        this.leaves = this.add.particles(0, 0, 'leaf', {
          x: { min: 0, max: 1000 }, y: -20, speedX: { min: -45, max: -15 }, speedY: { min: 20, max: 65 },
          rotate: { min: 0, max: 360 }, lifespan: { min: 3500, max: 6500 }, frequency: callbacks.reducedMotion ? -1 : 500,
          scale: { min: 0.5, max: 1.1 }, quantity: 1
        }).setDepth(6);
        this.fx = this.add.particles(0, 0, 'spark', { speed: { min: 40, max: 170 }, lifespan: 380, scale: { start: 0.8, end: 0 }, quantity: 0, emitting: false }).setDepth(12);
      }

      makePlayer() {
        this.playerShadow = this.add.ellipse(0, 0, 52, 15, 0x102119, 0.35).setDepth(7);
        this.player = this.add.sprite(0, 0, 'runner').setDepth(10);
        this.playerBody = Bodies.rectangle(0, 0, 38, 58, { label: 'player', friction: 0, frictionAir: 0.015, restitution: 0 });
        Composite.add(this.world, this.playerBody);
        if (!callbacks.reducedMotion) this.tweens.add({ targets: this.player, scaleY: 0.96, scaleX: 1.04, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }

      layout(size) {
        const w = Number(size.width || this.scale.width);
        const h = Number(size.height || this.scale.height);
        this.w = w;
        this.h = h;
        this.cameras.main.setViewport(0, 0, w, h);
        this.sky.setSize(w, h);
        this.sun.setPosition(w * 0.78, h * 0.18).setRadius(Math.max(34, Math.min(58, w * 0.07)));
        this.clouds.setSize(w, h * 0.38).setPosition(0, h * 0.04);
        this.mountains.setSize(w, h * 0.46).setPosition(0, h * 0.23);
        this.forest.setSize(w, h * 0.55).setPosition(0, h * 0.35);
        this.waterfall.setPosition(w * 0.73, h * 0.3).setSize(54, h * 0.48);
        this.ground.setPosition(0, h - 26).setSize(w, 32);
        this.upper.setPosition(0, h * 0.54).setSize(w, 32);
        this.floorY = h - 92;
        this.upperY = h * 0.54 - 42;
        this.leaves.setParticleZone?.({ type: 'random', source: new Phaser.Geom.Rectangle(0, -20, w, 10) });
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
        this.tweens.add({ targets: this.player, angle: 10, duration: 120, yoyo: true });
      }

      switchRoute(route) {
        if (this.finished || this.route === route) return;
        this.route = route;
        Body.setPosition(this.playerBody, { x: this.playerBody.position.x, y: route ? this.upperY : this.floorY });
        Body.setVelocity(this.playerBody, { x: 0, y: 0 });
        this.fx.emitParticleAt(this.player.x, this.player.y, 8);
      }

      slideOrDrop() {
        if (this.route) return this.switchRoute(0);
        if (this.sliding || this.finished) return;
        this.sliding = true;
        this.player.setTexture('runner-slide').setDisplaySize(60, 36);
        this.time.delayedCall(500, () => {
          if (!this.player.active) return;
          this.sliding = false;
          this.player.setTexture('runner').setDisplaySize(58, 66);
        });
      }

      loadStage() {
        this.zone = generateRiftZone(this.seed, this.stage);
        const names = ['FOREST FALLS', 'SKY GARDENS', 'ECHO CAVES', 'SUNSET RIDGE'];
        const palette = PALETTES[this.stage % PALETTES.length];
        this.sky.setFillStyle(palette.sky);
        this.mountains.setTint(palette.mountain);
        this.forest.setTint(palette.forest);
        this.ground.setTint(palette.ground);
        this.upper.setTint(palette.ground);
        this.speed = Math.min(640, 270 + this.zone.difficulty.speed * 90 + this.stage * 10);
        callbacks.container.querySelector('[data-rift-zone]').textContent = `${names[this.stage % names.length]} · ${this.stage + 1}`;
        callbacks.container.querySelector('[data-rift-rule]').textContent = ['TAP: JUMP', 'SWIPE UP: UPPER PATH', 'FOLLOW THE GOLD GATE', 'SWIPE DOWN: SLIDE'][this.stage % 4];
        this.nextSpawnAt = 0;
        this.cameras.main.flash(callbacks.reducedMotion ? 0 : 150, 255, 235, 145, false);
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
        if (gate) body.plugin.symbol = this.add.text(sprite.x, sprite.y, ['◆', '▲', '●', '■'][segment.rule.cue % 4], { fontFamily: 'system-ui', fontSize: '30px', fontStyle: 'bold', color: '#5c3b00' }).setOrigin(0.5).setDepth(9);
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
        this.clouds.tilePositionX += delta * this.speed * 0.000025;
        this.mountains.tilePositionX += delta * this.speed * 0.00008;
        this.forest.tilePositionX += delta * this.speed * 0.00019;
        this.ground.tilePositionX += delta * this.speed * 0.001;
        this.upper.tilePositionX += delta * this.speed * 0.001;
        this.waterfall.tilePositionY -= delta * 0.12;
        const target = this.route ? this.upperY : this.floorY;
        if (this.playerBody.position.y > target) {
          Body.setPosition(this.playerBody, { x: this.playerBody.position.x, y: target });
          Body.setVelocity(this.playerBody, { x: 0, y: 0 });
        }
        Body.setPosition(this.playerBody, { x: Math.max(70, this.w * 0.18), y: this.playerBody.position.y });
        this.player.setPosition(this.playerBody.position.x, this.playerBody.position.y);
        this.playerShadow.setPosition(this.playerBody.position.x, target + 31).setScale(Math.max(0.45, 1 - Math.abs(this.playerBody.position.y - target) / 120), 1);
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
      backgroundColor: '#5ec8f4',
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
