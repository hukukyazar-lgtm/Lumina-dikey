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
    case 'click': { // Pencil tap sound
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      
    case 'select': { // Soft paper slide
        const noise = createWhiteNoise(0.15);
        if (!noise) break;
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.Q.value = 2;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        noise.start(now);
        noise.stop(now + 0.15);
        break;
    }

    case 'start': { // Ascending gentle tones
        const arpeggio = [261.63, 392.00, 523.25];
        arpeggio.forEach((freq, i) => {
            const arpOsc = audioContext.createOscillator();
            const arpGain = audioContext.createGain();
            arpOsc.type = 'sine';
            arpOsc.frequency.setValueAtTime(freq, now + i * 0.1);

            arpGain.gain.setValueAtTime(0.4, now + i * 0.1);
            arpGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.2);
            
            arpOsc.connect(arpGain);
            arpGain.connect(sfxGain);
            arpOsc.start(now + i * 0.1);
            arpOsc.stop(now + i * 0.1 + 0.2);
        });
        break;
    }

    case 'correct': { // Gentle page turn/rustle
        const noise = createWhiteNoise(0.2);
        if (!noise) break;
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4000, now);
        filter.Q.value = 1;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        noise.start(now);
        noise.stop(now + 0.2);
        break;
    }

    case 'incorrect': { // Paper crumple
        const noise = createWhiteNoise(0.2);
        if (!noise) break;
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.Q.value = 1.5;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        noise.start(now);
        noise.stop(now + 0.2);
        break;
    }
    
    case 'lifeLost': { // Short paper rip
        const noise = createWhiteNoise(0.15);
        if(!noise) break;
        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(5000, now);
        filter.frequency.linearRampToValueAtTime(500, now + 0.15);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(sfxGain);
        noise.start(now);
        noise.stop(now + 0.15);
        break;
    }

    case 'gameOver': {
        const freqs = [130.81, 123.47]; // C3, B2
        freqs.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.3);

            gain.gain.setValueAtTime(0.4, now + i * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.3 + 0.8);
            
            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now + i * 0.3);
            osc.stop(now + i * 0.3 + 0.8);
        });
        break;
    }

    case 'bonus': {
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((freq, i) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.5, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.3);

            osc.connect(gain);
            gain.connect(sfxGain);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
        break;
    }
    case 'countdownTick': {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5

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
        osc.frequency.setValueAtTime(783.99, now); // G5

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