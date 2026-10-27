// Web Audio API Synthesizer for ambient music & birthday sound effects
// Does not require external audio files, works completely offline and lag-free!

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private musicTimeout: any = null;
  private musicGainNode: GainNode | null = null;
  private isMuted = false;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play a soft bell/music-box chime tone
  private playNote(freq: number, duration: number, timeOffset = 0, gain = 0.15) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + timeOffset);

    // Warm music box envelope
    const startTime = this.ctx.currentTime + timeOffset;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Add subtle shimmer with slight second harmonic
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, startTime);
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(gain * 0.25, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6);

    osc.connect(gainNode);
    osc2.connect(gain2);

    if (this.musicGainNode) {
      gainNode.connect(this.musicGainNode);
      gain2.connect(this.musicGainNode);
    } else {
      gainNode.connect(this.ctx.destination);
      gain2.connect(this.ctx.destination);
    }

    osc.start(startTime);
    osc.stop(startTime + duration);
    osc2.start(startTime);
    osc2.stop(startTime + duration);
  }

  // Happy Birthday Melody notes (Frequencies in Hz)
  // "Happy Birthday To You..."
  public toggleMusic(onStateChange?: (playing: boolean) => void) {
    this.initCtx();
    if (this.isMusicPlaying) {
      this.stopMusic();
      onStateChange?.(false);
      return false;
    } else {
      this.startMusic();
      onStateChange?.(true);
      return true;
    }
  }

  public startMusic() {
    this.initCtx();
    if (!this.ctx) return;
    this.isMusicPlaying = true;

    if (!this.musicGainNode) {
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.musicGainNode.connect(this.ctx.destination);
    }

    // Hogwarts Hedwig's Theme & Happy Birthday Celesta Melodies (Frequencies in Hz)
    const melody = [
      // --- HOGWARTS HEDWIG'S THEME INTRO (Magical Celesta) ---
      { f: 493.88, d: 0.45, pause: 0.5 }, // B4
      { f: 659.25, d: 0.7, pause: 0.75 }, // E5
      { f: 783.99, d: 0.35, pause: 0.4 }, // G5
      { f: 739.99, d: 0.45, pause: 0.5 }, // F#5
      { f: 659.25, d: 0.9, pause: 0.95 }, // E5
      { f: 987.77, d: 0.5, pause: 0.55 }, // B5
      { f: 880.0, d: 1.0, pause: 1.1 }, // A5
      { f: 739.99, d: 1.1, pause: 1.25 }, // F#5

      { f: 659.25, d: 0.7, pause: 0.75 }, // E5
      { f: 783.99, d: 0.35, pause: 0.4 }, // G5
      { f: 739.99, d: 0.45, pause: 0.5 }, // F#5
      { f: 622.25, d: 0.9, pause: 0.95 }, // D#5
      { f: 698.46, d: 0.5, pause: 0.55 }, // F5
      { f: 493.88, d: 1.2, pause: 1.5 }, // B4

      // --- HAPPY BIRTHDAY CELEBRATION MELODY ---
      // Hap-py Birth-day to you
      { f: 261.63, d: 0.35, pause: 0.4 },
      { f: 261.63, d: 0.2, pause: 0.25 },
      { f: 293.66, d: 0.5, pause: 0.6 },
      { f: 261.63, d: 0.5, pause: 0.6 },
      { f: 349.23, d: 0.5, pause: 0.6 },
      { f: 329.63, d: 1.0, pause: 1.1 },

      // Hap-py Birth-day to you
      { f: 261.63, d: 0.35, pause: 0.4 },
      { f: 261.63, d: 0.2, pause: 0.25 },
      { f: 293.66, d: 0.5, pause: 0.6 },
      { f: 261.63, d: 0.5, pause: 0.6 },
      { f: 392.0, d: 0.5, pause: 0.6 },
      { f: 349.23, d: 1.0, pause: 1.1 },

      // Hap-py Birth-day dear [Friend]
      { f: 261.63, d: 0.35, pause: 0.4 },
      { f: 261.63, d: 0.2, pause: 0.25 },
      { f: 523.25, d: 0.5, pause: 0.6 },
      { f: 440.0, d: 0.5, pause: 0.6 },
      { f: 349.23, d: 0.5, pause: 0.6 },
      { f: 329.63, d: 0.5, pause: 0.6 },
      { f: 293.66, d: 0.9, pause: 1.0 },

      // Hap-py Birth-day to you!
      { f: 466.16, d: 0.35, pause: 0.4 },
      { f: 466.16, d: 0.2, pause: 0.25 },
      { f: 440.0, d: 0.5, pause: 0.6 },
      { f: 349.23, d: 0.5, pause: 0.6 },
      { f: 392.0, d: 0.5, pause: 0.6 },
      { f: 349.23, d: 1.2, pause: 1.6 }
    ];

    const playSequence = () => {
      if (!this.isMusicPlaying) return;
      let accumTime = 0;
      melody.forEach(note => {
        this.playNote(note.f, note.d, accumTime, 0.12);
        accumTime += note.pause;
      });

      // Loop after full song + gentle silence
      this.musicTimeout = setTimeout(() => {
        if (this.isMusicPlaying) {
          playSequence();
        }
      }, (accumTime + 1.5) * 1000);
    };

    playSequence();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  public getIsPlaying() {
    return this.isMusicPlaying;
  }

  // Sound Effect: Luxury Gift Unboxing Swoosh & Sparkle
  public playGiftUnbox() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Upward sparkle chime chord (Cmaj9 arpeggio)
    const arpeggio = [261.63, 329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 1046.5];
    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.85);
    });
  }

  // Sound Effect: Candle Blow Out (Gentle wind whoosh + magical chime)
  public playCandleBlow() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Filtered noise buffer for gentle breath/wind
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(200, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);

    // After blowout, fairy chime
    setTimeout(() => {
      [880, 1046.5, 1318.5, 1760].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
        g.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + i * 0.08 + 0.6);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.65);
      });
    }, 300);
  }

  // Sound Effect: Slide / Shutter Click
  public playSlideClick() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Sound Effect: Confetti Pop
  public playPop() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }
}

export const sound = new SoundEngine();
