import { generateRiftZone, scoreRiftAction } from './rift-relay-model.mjs';

const SWIPE = 36;

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
    const Phaser = globalThis.Phaser;
    if (!Phaser) throw new Error('Phaser 4.2.1 failed to load');
    const host = this.container.querySelector('#phaser-game');
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
        this.pointerStart = null;
        this.sliding = false;
        this.finished = false;
        this.nextSpawnAt = 0;
        this.speed = 300;
        this.route = 0;
        this.palette = ['0x68d8ff', '0xffce5c', '0xff617c', '0x8ef0bc'];

        this.makeTextures();
        this.makeWorld();
        this.makePlayer();
        this.bindInput();
        this.scale.on('resize', this.layout, this);
        this.layout(this.scale.gameSize);
        this.loadStage();
        callbacks.onUpdate({ score: 0, round: 0, lives: 3, combo: 0 });
      }

      makeTextures() {
        const g = this.add.graphics();
        g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 54, 66, 16).fillStyle(0x08223a, 1).fillCircle(27, 24, 9);
        g.generateTexture('runner', 54, 66).clear();
        g.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 54, 34, 14).fillStyle(0x08223a, 1).fillRect(10, 12, 34, 8);
        g.generateTexture('runner-slide', 54, 34).clear();
        g.fillStyle(0xff617c, 1).fillRoundedRect(0, 0, 70, 78, 12).lineStyle(6, 0x4b1322, 1).strokeRoundedRect(0, 0, 70, 78, 12);
        g.generateTexture('hazard', 70, 78).clear();
        g.fillStyle(0xffce5c, 1).fillRoundedRect(0, 0, 70, 78, 12).lineStyle(6, 0x5c4510, 1).strokeRoundedRect(0, 0, 70, 78, 12);
        g.generateTexture('gate', 70, 78).clear();
        g.fillStyle(0x68d8ff, 1).fillRect(0, 0, 96, 18);
        g.generateTexture('platform', 96, 18).destroy();
      }

      makeWorld() {
        this.sky = this.add.rectangle(0, 0, 100, 100, 0x10233e).setOrigin(0);
        this.back = this.add.tileSprite(0, 0, 100, 100, 'platform').setOrigin(0).setTint(0x245c86).setAlpha(0.2);
        this.mid = this.add.tileSprite(0, 0, 100, 100, 'platform').setOrigin(0).setTint(0x3f94b8).setAlpha(0.18);
        this.ground = this.add.rectangle(0, 0, 100, 34, 0x18394d).setOrigin(0, 1);
        this.upper = this.add.rectangle(0, 0, 100, 20, 0x2b6680).setOrigin(0, 1).setAlpha(0.9);
        this.hazards = this.physics.add.group({ allowGravity: false, immovable: true });
        this.fx = this.add.particles(0, 0, 'platform', { speed: { min: 40, max: 180 }, lifespan: 350, scale: { start: 0.18, end: 0 }, quantity: 0, emitting: false });
      }

      makePlayer() {
        this.player = this.physics.add.sprite(0, 0, 'runner');
        this.player.setCollideWorldBounds(true).setBounce(0).setDepth(10);
        this.player.body.setSize(38, 58).setOffset(8, 8);
      }

      layout(size) {
        const w = Number(size.width || this.scale.width);
        const h = Number(size.height || this.scale.height);
        this.cameras.main.setViewport(0, 0, w, h);
        this.physics.world.setBounds(0, 0, w, h);
        this.sky.setSize(w, h);
        this.back.setSize(w, h);
        this.mid.setSize(w, h);
        this.ground.setPosition(0, h - 26).setSize(w, 34);
        this.upper.setPosition(0, h * 0.54).setSize(w, 20);
        if (this.player) this.player.setPosition(Math.max(70, w * 0.18), this.route ? h * 0.54 - 42 : h - 92);
      }

      bindInput() {
        this.input.on('pointerdown', (p) => { this.pointerStart = { x: p.x, y: p.y, at: this.time.now }; });
        this.input.on('pointerup', (p) => {
          if (!this.pointerStart || this.finished) return;
          const dx = p.x - this.pointerStart.x;
          const dy = p.y - this.pointerStart.y;
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
        if (this.finished || !this.player.body) return;
        const floor = this.route ? this.scale.height * 0.54 - 42 : this.scale.height - 92;
        if (Math.abs(this.player.y - floor) > 18) return;
        this.player.setVelocityY(this.route ? -430 : -510);
        this.tweens.add({ targets: this.player, angle: 8, duration: 120, yoyo: true });
      }

      switchRoute(route) {
        if (this.finished || this.route === route) return;
        this.route = route;
        this.player.setVelocityY(0);
        const y = route ? this.scale.height * 0.54 - 42 : this.scale.height - 92;
        this.tweens.add({ targets: this.player, y, duration: callbacks.reducedMotion ? 0 : 240, ease: 'Sine.easeOut' });
      }

      slideOrDrop() {
        if (this.route) return this.switchRoute(0);
        if (this.sliding || this.finished) return;
        this.sliding = true;
        this.player.setTexture('runner-slide').setDisplaySize(54, 34);
        this.player.body.setSize(46, 28).setOffset(4, 4);
        this.time.delayedCall(520, () => {
          if (!this.player?.active) return;
          this.sliding = false;
          this.player.setTexture('runner').setDisplaySize(54, 66);
          this.player.body.setSize(38, 58).setOffset(8, 8);
        });
      }

      loadStage() {
        this.zone = generateRiftZone(this.seed, this.stage);
        const names = ['MEADOW', 'SKYWORKS', 'ECHO CAVES', 'MIRAGE CITY', 'STORM CORE', 'MASTER VAULT', 'REST GARDEN'];
        const colors = [0x102f3c, 0x17345d, 0x30244f, 0x4c293f, 0x4b1c28, 0x163c3e, 0x194331];
        this.sky.setFillStyle(colors[this.stage % colors.length]);
        this.speed = Math.min(640, 270 + this.zone.difficulty.speed * 90 + this.stage * 10);
        callbacks.container.querySelector('[data-rift-zone]').textContent = `${names[this.stage % names.length]} · ${this.stage + 1}`;
        callbacks.container.querySelector('[data-rift-rule]').textContent = this.ruleText();
        this.cameras.main.flash(callbacks.reducedMotion ? 0 : 180, 80, 210, 255, false);
      }

      ruleText() {
        const stage = this.stage % 7;
        return ['TAP TO JUMP', 'JUMP + CHOOSE ROUTE', 'MATCH THE SYMBOL', 'IGNORE THE DECOY', 'MEMORIZE THE PULSE', 'COMBINE ALL RULES', 'RECOVER AND BREATHE'][stage];
      }

      spawnSegment() {
        const segment = this.zone.segments[this.segment % this.zone.segments.length];
        const route = segment.rule ? segment.rule.correctLane % 2 : (segment.index + this.stage) % 2;
        const y = route ? this.scale.height * 0.54 - 48 : this.scale.height - 98;
        const gate = segment.kind === 'puzzle';
        const sprite = this.hazards.create(this.scale.width + 80, y, gate ? 'gate' : 'hazard');
        sprite.setDataEnabled();
        sprite.data.set({ route, gate, requiresJump: segment.obstacle.requiresJump, risk: segment.risk, segment });
        sprite.setVelocityX(-this.speed).setDepth(8);
        if (gate) {
          const symbol = this.add.text(sprite.x, sprite.y, ['◆', '▲', '●', '■'][segment.rule.cue % 4], { fontFamily: 'system-ui', fontSize: '30px', fontStyle: 'bold', color: '#101722' }).setOrigin(0.5).setDepth(9);
          sprite.data.set('symbol', symbol);
        }
        this.segment += 1;
      }

      resolveCollision(sprite) {
        if (!sprite.active || sprite.data.get('resolved')) return;
        sprite.data.set('resolved', true);
        const sameRoute = sprite.data.get('route') === this.route;
        const airborne = this.player.body.velocity.y < -40 || Math.abs(this.player.y - (this.route ? this.scale.height * 0.54 - 42 : this.scale.height - 92)) > 20;
        const needsJump = sprite.data.get('requiresJump');
        const gate = sprite.data.get('gate');
        const success = gate ? sameRoute : (!sameRoute || (needsJump && airborne) || (!needsJump && this.sliding));
        if (success) {
          this.combo += 1;
          const points = scoreRiftAction({ distance: this.distance, accuracy: 1, streak: this.combo, risk: sprite.data.get('risk'), puzzle: gate, stage: this.stage % 7 });
          this.score += points;
          callbacks.onAnnounce({ key: 'riftClear', values: { points } });
          this.fx.emitParticleAt(this.player.x, this.player.y, 14);
          this.cameras.main.shake(callbacks.reducedMotion ? 0 : 90, 0.004);
        } else {
          this.lives -= 1;
          this.combo = 0;
          callbacks.onAnnounce({ key: 'riftHit', values: {} });
          this.cameras.main.shake(callbacks.reducedMotion ? 0 : 180, 0.015);
          this.cameras.main.flash(callbacks.reducedMotion ? 0 : 120, 255, 60, 90, false);
        }
        callbacks.onUpdate({ score: this.score, round: this.stage, lives: this.lives, combo: this.combo });
        if (this.lives <= 0) this.endRun('failed');
      }

      update(time, delta) {
        if (this.finished) return;
        this.distance += delta * 0.03;
        this.back.tilePositionX += delta * this.speed * 0.00012;
        this.mid.tilePositionX += delta * this.speed * 0.00027;
        const floor = this.route ? this.scale.height * 0.54 - 42 : this.scale.height - 92;
        if (!this.player.body.velocity.y && Math.abs(this.player.y - floor) < 12) this.player.y = floor;
        if (time >= this.nextSpawnAt) {
          this.spawnSegment();
          this.nextSpawnAt = time + Math.max(620, this.zone.difficulty.decisionMs * 0.72);
        }
        this.hazards.children.each((sprite) => {
          if (!sprite?.active) return;
          const symbol = sprite.data.get('symbol');
          if (symbol) symbol.setPosition(sprite.x, sprite.y);
          if (!sprite.data.get('resolved') && sprite.x < this.player.x + 36 && sprite.x > this.player.x - 44) this.resolveCollision(sprite);
          if (sprite.x < -100) { symbol?.destroy(); sprite.destroy(); }
        });
        if (this.segment > 0 && this.segment % Math.max(5, this.zone.segments.length) === 0 && this.hazards.countActive(true) === 0) {
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
    }

    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      backgroundColor: '#091321',
      transparent: false,
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH, width: '100%', height: '100%' },
      physics: { default: 'arcade', arcade: { gravity: { y: 1150 }, debug: false } },
      render: { antialias: true, pixelArt: false, roundPixels: false },
      scene: PulseboundScene,
      input: { activePointers: 2 }
    });

    this.container.querySelector('[data-rift-exit]')?.addEventListener('click', () => {
      const scene = this.game?.scene?.getScene('pulsebound');
      scene?.endRun('ended');
    }, { once: true });
  }

  destroy() {
    this.game?.destroy(true);
    this.game = null;
    const host = this.container.querySelector('#phaser-game');
    if (host) host.replaceChildren();
  }
}
