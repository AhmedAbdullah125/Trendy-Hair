export class AudioService {
  private context: AudioContext | null = null;

  constructor() {
    try {
      // Initialize lazily on first user interaction usually, but we handle that in logic
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    } catch (e) {
      console.error('AudioContext not supported');
    }
  }

  private ensureContext() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  playTick() {
    if (!this.context) return;
    this.ensureContext();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  playSuccess() {
    if (!this.context) return;
    this.ensureContext();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.context.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.3);
  }

  playFailure() {
    if (!this.context) return;
    this.ensureContext();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.context.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.context.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.1, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.4);
  }
}

export const audioService = new AudioService();