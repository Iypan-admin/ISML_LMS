// ============================================================================
// ISML ENTERPRISE AUDIO ENGINE — OFFICIAL AIRPORT ANNOUNCEMENT CHIME
// Luxury 4-Tone Public Address Tubular Bell Chime (Ding-Dong-Ding)
// 100% Web Audio API Synthesis - Zero Latency 0ms Playback
// ============================================================================

class SoundNotificationEngine {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public initUserInteraction() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  /**
   * ✈️ OFFICIAL LUXURY AIRPORT TERMINAL DING-DONG CHIME
   * 4-Tone Tubular Bell Gong (D5 -> F#5 -> A5 -> D6)
   * High-clarity, authoritative, and instantly recognizable (~2.2s)
   */
  public playHighChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Master Compressor to give clean, professional airport PA broadcast punch
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, now);
      compressor.knee.setValueAtTime(25, now);
      compressor.ratio.setValueAtTime(12, now);
      compressor.attack.setValueAtTime(0.003, now);
      compressor.release.setValueAtTime(0.25, now);
      compressor.connect(ctx.destination);

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.75, now);
      master.connect(compressor);

      // Airport Gong Frequencies: D5 (587Hz), F#5 (740Hz), A5 (880Hz), D6 (1174Hz)
      const gongNotes = [
        { freq: 587.33, time: 0.00, dur: 1.1 },
        { freq: 739.99, time: 0.22, dur: 1.2 },
        { freq: 880.00, time: 0.44, dur: 1.4 },
        { freq: 1174.66, time: 0.68, dur: 1.8 },
      ];

      gongNotes.forEach((n) => {
        const start = now + n.time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.60, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);

        osc.connect(gain);
        gain.connect(master);

        osc.start(start);
        osc.stop(start + n.dur);

        // +2 Octave tubular bell chime sparkle (metallic shimmer overtone)
        const bell = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bell.type = 'triangle';
        bell.frequency.setValueAtTime(n.freq * 2, start);
        bellGain.gain.setValueAtTime(0.001, start);
        bellGain.gain.exponentialRampToValueAtTime(0.22, start + 0.015);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur * 0.5);
        bell.connect(bellGain);
        bellGain.connect(master);
        bell.start(start);
        bell.stop(start + n.dur * 0.5);
      });
    } catch (e) {
      console.warn('Airport chime error:', e);
    }
  }

  public playUrgentAlert() {
    this.playHighChime();
  }

  /**
   * 💬 Crisp, friendly in-app chat pop notification sound
   * Clean dual-tone bell pop (~150ms) perfect for real-time messaging
   */
  public playMessagePop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.28, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }
}

export const soundNotification = new SoundNotificationEngine();
