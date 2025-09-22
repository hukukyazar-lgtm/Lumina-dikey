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

// Background Music - more ambient and procedural
const playMusic = () => {
    if (!audioContext || !musicGain || isMusicPlaying) return;
    isMusicPlaying = true;
    
    // C Minor Pentatonic scale for a calm, moody atmosphere
    const scale = [261.63, 311.13, 349.23, 392.00, 466.16, 523.25]; // C4 to C5
    
    const scheduleNote = () => {
        if (!audioContext || !isMusicPlaying) return;
        const now = audioContext.currentTime;

        // Prevent scheduling notes in the past if audio context was suspended
        if (now < lastNoteTime) {
            musicSchedulerId = window.setTimeout(scheduleNote, (lastNoteTime - now) * 1000 + 100);
            return;
        }

        const noteFreq = scale[Math.floor(Math.random() * scale.length)];
        const noteDuration = Math.random() * 2 + 2; // 2 to 4 seconds long
        const nextNoteDelay = Math.random() * 2 + 2.5; // 2.5 to 4.5 seconds until next note
        
        lastNoteTime = now + nextNoteDelay;

        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq * 0.5, now); // Start at lower octave
        osc.frequency.exponentialRampToValueAtTime(noteFreq, now + noteDuration * 0.3);

        const envelope = audioContext.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.12, now + noteDuration * 0.4); // Slow attack
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
    case 'click': {
        // A very short, sharp, and clean click
        const osc = audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, now);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      
    case 'select': {
        // A pleasant rising tone for selection
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.1); // G5
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }

    case 'start': {
        // An epic rising sweep with a chord to start the game
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);

        const arpeggio = [261.63, 392.00, 523.25]; // C Major
        arpeggio.forEach((freq, i) => {
            const arpOsc = audioContext.createOscillator();
            const arpGain = audioContext.createGain();
            arpOsc.type = 'triangle';
            arpOsc.frequency.setValueAtTime(freq, now + 0.3 + i * 0.08);

            arpGain.gain.setValueAtTime(0.6, now + 0.3 + i * 0.08);
            arpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3 + i * 0.08 + 0.15);
            
            arpOsc.connect(arpGain);
            arpGain.connect(sfxGain);
            arpOsc.start(now + 0.3 + i * 0.08);
            arpOsc.stop(now + 0.3 + i * 0.08 + 0.15);
        });
        break;
    }

    case 'correct': {
        // A brighter, happier C major arpeggio
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.07);

            gain.gain.setValueAtTime(0, now + i * 0.07);
            gain.gain.linearRampToValueAtTime(0.4, now + i * 0.07 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.25);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now + i * 0.07);
            osc.stop(now + i * 0.07 + 0.25);
        });
        break;
    }

    case 'incorrect': {
        // A less jarring, low-frequency "thump"
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
    }
    
    case 'lifeLost': {
        // A quick descending tone, less harsh
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
    }

    case 'gameOver': {
        // A dramatic, descending sound with noise
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.8);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 1.5);
        
        const noise = createWhiteNoise(1.5);
        if(!noise) break;
        const noiseGain = audioContext.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        
        noise.connect(noiseGain);
        noiseGain.connect(sfxGain);
        noise.start(now);
        noise.stop(now + 1.5);
        break;
    }

    case 'bonus': {
        // A sparkly arpeggio with an echo effect for rewards
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // Cmaj7 arpeggio
        const delay = audioContext.createDelay(0.3);
        const feedback = audioContext.createGain();
        feedback.gain.value = 0.4;

        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(sfxGain);

        freqs.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq * 2, now + i * 0.08);

            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.6, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(sfxGain);
            gain.connect(delay); // Send to delay line as well
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.2);
        });
        break;
    }
    case 'countdownTick': {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880.00, now); // A5

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }
    case 'countdownGo': {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.50, now); // C6

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
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