const CUES = Object.freeze({
  cue: { frequency: 520, duration: 0.045, gain: 0.035, type: 'sine', limitMs: 55 },
  move: { frequency: 350, duration: 0.04, gain: 0.03, type: 'triangle', limitMs: 45 },
  correct: { frequency: 720, duration: 0.09, gain: 0.045, type: 'sine', limitMs: 120 },
  wrong: { frequency: 145, duration: 0.12, gain: 0.04, type: 'square', limitMs: 180 },
  zone: { frequency: 430, duration: 0.14, gain: 0.035, type: 'triangle', limitMs: 350 },
  finish: { frequency: 120, duration: 0.16, gain: 0.035, type: 'sine', limitMs: 400 }
});

export class PlatformAudio {
  constructor() {
    this.context = null;
    this.muted = true;
    this.lastPlayed = new Map();
  }

  setMuted(value) {
    this.muted = Boolean(value);
    if (this.muted) this.suspend();
  }

  async unlock() {
    if (this.muted || typeof window === 'undefined') return false;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    if (!this.context || this.context.state === 'closed') this.context = new AudioContextClass();
    if (this.context.state === 'suspended') {
      try { await this.context.resume(); } catch { return false; }
    }
    return this.context.state === 'running';
  }

  play(name, variation = 0) {
    if (this.muted) return false;
    const cue = CUES[name];
    if (!cue) return false;
    const nowMs = typeof performance === 'undefined' ? Date.now() : performance.now();
    const previous = this.lastPlayed.get(name) ?? -Infinity;
    if (nowMs - previous < cue.limitMs) return false;
    this.lastPlayed.set(name, nowMs);
    void this.unlock().then((ready) => {
      if (!ready || this.muted || !this.context) return;
      const start = this.context.currentTime;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = cue.type;
      oscillator.frequency.setValueAtTime(cue.frequency + clampVariation(variation), start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(cue.gain, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + cue.duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(start + cue.duration + 0.02);
    });
    return true;
  }

  suspend() {
    if (this.context?.state === 'running') this.context.suspend().catch(() => {});
  }

  close() {
    const context = this.context;
    this.context = null;
    this.lastPlayed.clear();
    if (context && context.state !== 'closed') context.close().catch(() => {});
  }
}

function clampVariation(value) {
  const number = Number(value) || 0;
  return Math.max(-120, Math.min(180, number));
}

export const platformAudio = new PlatformAudio();
