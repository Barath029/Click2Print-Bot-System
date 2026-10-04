// Web Audio API Synthesizer for SmartPrint Micro-interactions
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('smartprint_muted') === 'true';
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('smartprint_muted', this.muted);
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  click() {
    this.playTone(800, 'triangle', 0.04, 0.08);
  }

  printStart() {
    if (this.muted) return;
    this.playTone(320, 'sawtooth', 0.18, 0.08);
    setTimeout(() => this.playTone(440, 'sine', 0.15, 0.08), 100);
  }

  printDone() {
    if (this.muted) return;
    this.playTone(523.25, 'sine', 0.12, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.1), 200); // G5
  }

  rackStaged() {
    if (this.muted) return;
    this.playTone(587.33, 'triangle', 0.1, 0.12); // D5
    setTimeout(() => this.playTone(880, 'sine', 0.35, 0.15), 120); // A5
  }

  success() {
    if (this.muted) return;
    this.playTone(440, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(554.37, 'sine', 0.08, 0.1), 80);
    setTimeout(() => this.playTone(659.25, 'sine', 0.08, 0.1), 160);
    setTimeout(() => this.playTone(880, 'sine', 0.3, 0.12), 240);
  }

  error() {
    if (this.muted) return;
    this.playTone(220, 'sawtooth', 0.2, 0.15);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.25, 0.15), 150);
  }
}

window.soundFx = new SoundFX();
