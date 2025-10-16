// Web Audio API context
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicGain: GainNode | null = null;

// Music state
let musicSchedulerId: number | null = null;
let isMusicPlaying = false;
let lastNoteTime = 0; // To prevent note overlaps on resume

/**
 * Initializes the AudioContext. Must be called after a user interaction
 * (e.g., a button click) to comply with browser autoplay policies.
 */
const init = () => {
  if (audioContext) {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return;
  }
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(1.0, audioContext.currentTime);
    masterGain.connect(audioContext.destination);

    sfxGain = audioContext.createGain();
    sfxGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    sfxGain.connect(masterGain);

    musicGain = audioContext.createGain();
    musicGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    musicGain.connect(masterGain);

  } catch (e) {
    console.error("Web Audio API is not supported in this browser.", e);
  }
};

const setSfxVolume = (volume: number) => {
    if (!sfxGain || !audioContext) return;
    sfxGain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), audioContext.currentTime + 0.1);
}

const setMusicVolume = (volume: number) => {
    if (!musicGain || !audioContext) return;
    musicGain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), audioContext.currentTime + 0.1);
    if (volume > 0 && !isMusicPlaying) {
        playMusic();
    } else if (volume <= 0 && isMusicPlaying) {
        stopMusic();
    }
}

// Background Music - Folded Fables theme
const playMusic = () => {
    if (!audioContext || !musicGain || isMusicPlaying) return;
    isMusicPlaying = true;
    
    // C Major Pentatonic scale for a gentle, storybook feel
    const scale = [261.63, 349.23, 392.00, 523.25, 698.46]; 
    
    const scheduleNote = () => {
        if (!audioContext || !isMusicPlaying) return;
        const now = audioContext.currentTime;

        if (now < lastNoteTime) {
            musicSchedulerId = window.setTimeout(scheduleNote, (lastNoteTime - now) * 1000 + 100);
            return;
        }

        const noteFreq = scale[Math.floor(Math.random() * scale.length)];
        const noteDuration = Math.random() * 2.5 + 2.5; // 2.5 to 5 seconds long
        const nextNoteDelay = Math.random() * 3 + 3; // 3 to 6 seconds until next note
        
        lastNoteTime = now + nextNoteDelay;

        const osc = audioContext.createOscillator();
        osc.type = 'sine'; // Soft, pure tone
        osc.frequency.setValueAtTime(noteFreq, now);

        const envelope = audioContext.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.1, now + noteDuration * 0.4); // Slow attack
        envelope.gain.linearRampToValueAtTime(0, now + noteDuration);       // Slow release

        osc.connect(envelope);
        envelope.connect(musicGain!);
        
        osc.start(now);
        osc.stop(now + noteDuration);
        
        musicSchedulerId = window.setTimeout(scheduleNote, nextNoteDelay * 1000);
    };
    
    scheduleNote();
};

const stopMusic = () => {
    if (musicSchedulerId) {
        clearTimeout(musicSchedulerId);
        musicSchedulerId = null;
    }
    isMusicPlaying = false;
};

/**
 * A helper function to generate white noise.
 */
const createWhiteNoise = (duration: number): AudioBufferSourceNode | null => {
    if (!audioContext) return null;
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    return noise;
}

/**
 * Plays a predefined sound effect by name.
 * @param soundName The name of the sound effect to play.
 */
const play = (soundName: 'click' | 'select' | 'start' | 'correct' | 'incorrect' | 'gameOver' | 'bonus' | 'lifeLost' | 'countdownTick' | 'countdownGo') => {
  if (!audioContext || !sfxGain) return;

  const now = audioContext.currentTime;

  switch (soundName) {
    case 'click': { // Sharp digital blip
        const osc = audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      
    case 'select': { // Short digital whoosh
        const noise = createWhiteNoise(0.15);
        if (!noise) break;
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 2;
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(2500, now + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        noise.start(now);
        noise.stop(now + 0.15);
        break;
    }

    case 'start': { // Ascending synth tones
        const arpeggio = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        arpeggio.forEach((freq, i) => {
            const arpOsc = audioContext.createOscillator();
            const arpGain = audioContext.createGain();
            arpOsc.type = 'sawtooth';
            arpOsc.frequency.setValueAtTime(freq, now + i * 0.08);

            arpGain.gain.setValueAtTime(0.3, now + i * 0.08);
            arpGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.2);
            
            arpOsc.connect(arpGain);
            arpGain.connect(sfxGain);
            arpOsc.start(now + i * 0.08);
            arpOsc.stop(now + i * 0.08 + 0.2);
        });
        break;
    }

    case 'correct': { // Positive synth chime (Major 3rd)
        const freqs = [523.25, 659.25]; // C5, E5
        freqs.forEach((freq) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            
            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now);
            osc.stop(now + 0.4);
        });
        break;
    }

    case 'incorrect': { // Low-frequency error buzz
        const freqs = [110, 112]; // A2, slightly detuned
        freqs.forEach(freq => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            
            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now);
            osc.stop(now + 0.2);
        });
        break;
    }
    
    case 'lifeLost': { // Glitchy power-down sound
        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
    }

    case 'gameOver': { // Descending melancholic synth
        const freqs = [261.63, 233.08, 207.65]; // C4, A#3, G#3
        freqs.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.3);

            gain.gain.setValueAtTime(0.4, now + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.3 + 0.6);
            
            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now + i * 0.3);
            osc.stop(now + i * 0.3 + 0.6);
        });
        break;
    }

    case 'bonus': { // Sparkling arpeggio
        const freqs = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
        freqs.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.07);

            gain.gain.setValueAtTime(0, now + i * 0.07);
            gain.gain.linearRampToValueAtTime(0.4, now + i * 0.07 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.2);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.2);
        });
        break;
    }
    case 'countdownTick': { // Precise synth tick
        const osc = audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
    }
    case 'countdownGo': { // Powerful synth chord
        const freqs = [523.25, 659.25, 783.99]; // C Major chord
        freqs.forEach(freq => {
            const osc = audioContext.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            const gain = audioContext.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now);
            osc.stop(now + 0.3);
        });
        break;
    }
  }
};

export const soundService = {
  init,
  play,
  setSfxVolume,
  setMusicVolume,
};