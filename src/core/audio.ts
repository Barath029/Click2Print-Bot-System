/**
 * Web Audio API Synthesizer for Click2Print Micro-interactions
 */

export class SoundFX {
  private ctx: AudioContext | null = null;
  private muted: boolean;

  constructor() {
    this.muted = localStorage.getItem('click2print_muted') === 'true';
  }

  private init(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('click2print_muted', String(this.muted));
    return this.muted;
  }

  public playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, gainVal: number = 0.15): void {
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
    } catch {
      // Audio autoplay policy catch
    }
  }

  public click(): void {
    this.playTone(880, 'triangle', 0.04, 0.08);
  }

  public printStart(): void {
    if (this.muted) return;
    this.playTone(320, 'sawtooth', 0.18, 0.08);
    setTimeout(() => this.playTone(440, 'sine', 0.15, 0.08), 100);
  }

  public printDone(): void {
    if (this.muted) return;
    this.playTone(523.25, 'sine', 0.12, 0.1);
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.1), 100);
    setTimeout(() => this.playTone(783.99, 'sine', 0.25, 0.1), 200);
  }

  public success(): void {
    if (this.muted) return;
    this.playTone(440, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(554.37, 'sine', 0.08, 0.1), 80);
    setTimeout(() => this.playTone(659.25, 'sine', 0.08, 0.1), 160);
    setTimeout(() => this.playTone(880, 'sine', 0.3, 0.12), 240);
  }

  public error(): void {
    if (this.muted) return;
    this.playTone(220, 'sawtooth', 0.2, 0.15);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.25, 0.15), 150);
  }
}

export const sound = new SoundFX();
