/**
 * Web Audio API synthesized sound generator for trading desk alerts.
 * Uses native AudioContext with graceful fallback and no external audio files.
 */

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!sharedAudioContext && AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Plays an alert sound synthesized through high-fidelity oscillators.
 * @param type 'high' (bullish/high breakout chime), 'low' (bearish/drop chime), or 'test'
 */
export function playAlertSound(type: 'high' | 'low' | 'test' = 'high'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    // Master volume envelope to avoid clipping
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    if (type === 'high') {
      // Ascending crisp trading bell (880Hz A5 -> 1320Hz E6)
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.18);

      osc2.frequency.setValueAtTime(1760, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.35);
    } else if (type === 'low') {
      // Warning double chime (660Hz -> 440Hz)
      osc1.frequency.setValueAtTime(659.25, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.22);

      osc2.frequency.setValueAtTime(587.33, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(392, now + 0.35);
    } else {
      // Test chime: smooth arpeggio
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2); // C6

      osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6
    }

    osc1.connect(gainNode);
    osc2.connect(gainNode);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('Audio playback not permitted or failed:', err);
  }
}
