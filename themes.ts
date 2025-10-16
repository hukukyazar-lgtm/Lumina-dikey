


export type ThemePalette = {
  '--brand-bg-gradient-start': string;
  '--brand-bg-gradient-end': string;
  '--brand-primary': string;
  '--brand-secondary': string;
  '--brand-light': string;
  '--brand-accent': string;
  '--brand-accent-secondary': string;
  '--brand-warning': string;
  '--brand-correct': string;
  '--brand-tertiary': string;
  '--brand-quaternary': string;
  '--brand-accent-shadow': string;
  '--brand-accent-secondary-shadow': string;
  '--brand-warning-shadow': string;
  '--brand-correct-shadow': string;
  '--shadow-color-strong': string;
  '--bevel-shadow-dark': string;
  '--bevel-shadow-light': string;
  '--brand-accent-secondary-glow': string;
  '--brand-accent-glow': string;
  '--brand-warning-glow': string;
  // Background-specific properties
  '--background-image-override'?: string;
  // Cube-specific properties
  '--cube-face-bg': string;
  '--cube-face-border': string;
  '--cube-face-text-color': string;
  '--cube-face-text-shadow': string;
  '--cube-face-extra-animation'?: string;
  // Add new glassmorphism variables to the type
  [key: string]: string | undefined;
};

export const themes: Record<string, ThemePalette> = {
  default: {
    '--brand-bg-gradient-start': '#0f0518',
    '--brand-bg-gradient-end': '#1a0e2a',
    '--brand-primary': 'rgba(26, 14, 42, 0.3)',
    '--brand-secondary': 'rgba(26, 14, 42, 0.2)',
    '--brand-light': '#F0E8FF',
    '--brand-accent': '#FF00A0',
    '--brand-accent-secondary': '#00F0FF',
    '--brand-warning': '#FFC700',
    '--brand-correct': '#00FFA0',
    '--brand-tertiary': '#ff66c4',
    '--brand-quaternary': '#66f6ff',
    '--brand-accent-shadow': '#c0007a',
    '--brand-accent-secondary-shadow': '#00b4c0',
    '--brand-warning-shadow': '#c09500',
    '--brand-correct-shadow': '#00c07a',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.2)',
    '--bevel-shadow-dark': 'rgba(0, 240, 255, 0.1)',
    '--bevel-shadow-light': 'rgba(255, 0, 160, 0.1)',
    '--brand-accent-secondary-glow': 'rgba(0, 240, 255, 0.5)',
    '--brand-accent-glow': 'rgba(255, 0, 160, 0.5)',
    '--brand-warning-glow': 'rgba(255, 199, 0, 0.5)',
    '--background-image-override': `
        radial-gradient(circle at 10% 20%, rgba(255,255,255,0.03) 0px, transparent 1px),
        radial-gradient(circle at 80% 90%, rgba(255,255,255,0.03) 0px, transparent 1px),
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0px, transparent 2px),
        radial-gradient(ellipse at 100% 0%, #be185d 0%, transparent 50%),
        radial-gradient(ellipse at 0% 100%, #00F0FF 0%, transparent 50%),
        linear-gradient(135deg, var(--brand-bg-gradient-start) 0%, var(--brand-bg-gradient-end) 100%)
    `,
    '--cube-face-bg': 'var(--brand-secondary)',
    '--cube-face-border': 'rgba(0, 240, 255, 0.2)',
    '--cube-face-text-color': 'var(--brand-accent-secondary)',
    '--cube-face-text-shadow': '0 0 8px var(--brand-accent-secondary)',
  },
  'crystal-palace': {
    '--brand-bg-gradient-start': '#0c0a24',
    '--brand-bg-gradient-end': '#18153c',
    '--brand-primary': 'rgba(20, 30, 70, 0.4)',
    '--brand-secondary': 'rgba(20, 30, 70, 0.3)',
    '--brand-light': '#E6F7FF',
    '--brand-accent': '#FF66F5',
    '--brand-accent-secondary': '#00FFFF',
    '--brand-warning': '#FFEE00',
    '--brand-correct': '#A0FFEE',
    '--brand-tertiary': '#ff99f8',
    '--brand-quaternary': '#99ffff',
    '--brand-accent-shadow': '#b347ab',
    '--brand-accent-secondary-shadow': '#00b3b3',
    '--brand-warning-shadow': '#b3a600',
    '--brand-correct-shadow': '#70a8a8',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.25)',
    '--bevel-shadow-dark': 'rgba(0, 255, 255, 0.15)',
    '--bevel-shadow-light': 'rgba(230, 247, 255, 0.15)',
    '--brand-accent-secondary-glow': 'rgba(0, 255, 255, 0.6)',
    '--brand-accent-glow': 'rgba(255, 102, 245, 0.6)',
    '--brand-warning-glow': 'rgba(255, 238, 0, 0.6)',
    '--background-image-override': `
      radial-gradient(ellipse at 70% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 80%, rgba(200, 180, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0px, transparent 1.5px),
      linear-gradient(135deg, var(--brand-bg-gradient-start) 0%, var(--brand-bg-gradient-end) 100%)
    `,
    '--cube-face-bg': 'radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, rgba(20, 30, 70, 0.3) 70%)',
    '--cube-face-border': 'rgba(0, 255, 255, 0.4)',
    '--cube-face-text-color': '#FFFFFF',
    '--cube-face-text-shadow': '0 0 12px #00FFFF, 0 0 20px #FFFFFF',
  },
  'quantum-foam': {
    '--brand-bg-gradient-start': '#020024',
    '--brand-bg-gradient-end': '#0c092c',
    '--brand-primary': 'rgba(9, 9, 121, 0.2)',
    '--brand-secondary': 'rgba(9, 9, 121, 0.1)',
    '--brand-light': '#f0f8ff',
    '--brand-accent': '#f0f',
    '--brand-accent-secondary': '#0ff',
    '--brand-warning': '#adff2f',
    '--brand-correct': '#39FF14',
    '--brand-tertiary': '#c77dff',
    '--brand-quaternary': '#7dffee',
    '--brand-accent-shadow': '#a0a',
    '--brand-accent-secondary-shadow': '#0aa',
    '--brand-warning-shadow': '#78b320',
    '--brand-correct-shadow': '#28b30e',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.3)',
    '--bevel-shadow-dark': 'rgba(0, 255, 255, 0.2)',
    '--bevel-shadow-light': 'rgba(255, 0, 255, 0.2)',
    '--brand-accent-secondary-glow': 'rgba(0, 255, 255, 0.7)',
    '--brand-accent-glow': 'rgba(255, 0, 255, 0.7)',
    '--brand-warning-glow': 'rgba(173, 255, 47, 0.7)',
    '--background-image-override': `
      radial-gradient(ellipse at 80% 15%, rgba(0, 255, 255, 0.2) 0%, transparent 40%),
      radial-gradient(ellipse at 20% 85%, rgba(255, 0, 255, 0.2) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 0px, transparent 1px),
      linear-gradient(135deg, #020024 0%, #090979 35%, #0c092c 100%)
    `,
    '--cube-face-bg': 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 80%)',
    '--cube-face-border': 'var(--brand-accent-secondary)',
    '--cube-face-text-color': '#fff',
    '--cube-face-text-shadow': '0 0 10px var(--brand-accent-secondary-glow), 0 0 20px var(--brand-accent-glow)',
    '--cube-face-extra-animation': 'holographic-border-pulse 3s ease-in-out infinite',
  },
  'solar-flare': {
    '--brand-bg-gradient-start': '#1c0c00',
    '--brand-bg-gradient-end': '#3a1c00',
    '--brand-primary': 'rgba(58, 28, 0, 0.3)',
    '--brand-secondary': 'rgba(58, 28, 0, 0.2)',
    '--brand-light': '#FFF2E6',
    '--brand-accent': '#FF4500', // OrangeRed
    '--brand-accent-secondary': '#FFD700', // Gold
    '--brand-warning': '#FF6347', // Tomato
    '--brand-correct': '#ADFF2F', // GreenYellow
    '--brand-tertiary': '#ff8c66',
    '--brand-quaternary': '#ffec66',
    '--brand-accent-shadow': '#b33000',
    '--brand-accent-secondary-shadow': '#b39700',
    '--brand-warning-shadow': '#cc4f38',
    '--brand-correct-shadow': '#79b320',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.2)',
    '--bevel-shadow-dark': 'rgba(255, 215, 0, 0.1)',
    '--bevel-shadow-light': 'rgba(255, 69, 0, 0.1)',
    '--brand-accent-secondary-glow': 'rgba(255, 215, 0, 0.5)',
    '--brand-accent-glow': 'rgba(255, 69, 0, 0.5)',
    '--brand-warning-glow': 'rgba(255, 99, 71, 0.5)',
     '--background-image-override': `
        radial-gradient(circle at 20% 15%, rgba(255,255,255,0.04) 0px, transparent 1px),
        radial-gradient(circle at 75% 85%, rgba(255,255,255,0.04) 0px, transparent 1px),
        radial-gradient(ellipse at 100% 100%, #ff4500 0%, transparent 50%),
        radial-gradient(ellipse at 0% 0%, #FFD700 0%, transparent 50%),
        linear-gradient(135deg, var(--brand-bg-gradient-start) 0%, var(--brand-bg-gradient-end) 100%)
    `,
    '--cube-face-bg': 'var(--brand-secondary)',
    '--cube-face-border': 'rgba(255, 215, 0, 0.2)',
    '--cube-face-text-color': 'var(--brand-accent-secondary)',
    '--cube-face-text-shadow': '0 0 8px var(--brand-accent-secondary)',
  },
  'deep-ocean': {
    '--brand-bg-gradient-start': '#000f1a',
    '--brand-bg-gradient-end': '#002233',
    '--brand-primary': 'rgba(0, 34, 51, 0.3)',
    '--brand-secondary': 'rgba(0, 34, 51, 0.2)',
    '--brand-light': '#E0FFFF', // LightCyan
    '--brand-accent': '#32CD32', // LimeGreen
    '--brand-accent-secondary': '#00BFFF', // DeepSkyBlue
    '--brand-warning': '#FFD700', // Gold
    '--brand-correct': '#39FF14', // Neon Green
    '--brand-tertiary': '#66e066',
    '--brand-quaternary': '#66d9ff',
    '--brand-accent-shadow': '#228c22',
    '--brand-accent-secondary-shadow': '#0084b3',
    '--brand-warning-shadow': '#b39700',
    '--brand-correct-shadow': '#28b30e',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.2)',
    '--bevel-shadow-dark': 'rgba(0, 191, 255, 0.1)',
    '--bevel-shadow-light': 'rgba(50, 205, 50, 0.1)',
    '--brand-accent-secondary-glow': 'rgba(0, 191, 255, 0.5)',
    '--brand-accent-glow': 'rgba(50, 205, 50, 0.5)',
    '--brand-warning-glow': 'rgba(255, 215, 0, 0.5)',
     '--background-image-override': `
        radial-gradient(circle at 5% 95%, rgba(255,255,255,0.03) 0px, transparent 1px),
        radial-gradient(circle at 90% 10%, rgba(255,255,255,0.03) 0px, transparent 1px),
        radial-gradient(ellipse at 100% 0%, #00BFFF 0%, transparent 40%),
        radial-gradient(ellipse at 0% 100%, #32CD32 0%, transparent 40%),
        linear-gradient(135deg, var(--brand-bg-gradient-start) 0%, var(--brand-bg-gradient-end) 100%)
    `,
    '--cube-face-bg': 'var(--brand-secondary)',
    '--cube-face-border': 'rgba(0, 191, 255, 0.2)',
    '--cube-face-text-color': 'var(--brand-accent-secondary)',
    '--cube-face-text-shadow': '0 0 8px var(--brand-accent-secondary)',
  },
  'theme-gold': { // Standalone theme version of the gold cube
    '--brand-bg-gradient-start': '#282008',
    '--brand-bg-gradient-end': '#4a3c11',
    '--brand-primary': 'rgba(74, 44, 0, 0.3)',
    '--brand-secondary': 'rgba(74, 44, 0, 0.2)',
    '--brand-light': '#fff8e1',
    '--brand-accent': '#f8b500',
    '--brand-accent-secondary': '#fceabb',
    '--brand-warning': '#ffc107',
    '--brand-correct': '#c8e6c9',
    '--brand-tertiary': '#ffc83d',
    '--brand-quaternary': '#fff5d4',
    '--brand-accent-shadow': '#ad7e00',
    '--brand-accent-secondary-shadow': '#b3a277',
    '--brand-warning-shadow': '#b38605',
    '--brand-correct-shadow': '#8da88e',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.2)',
    '--bevel-shadow-dark': 'rgba(252, 234, 187, 0.1)',
    '--bevel-shadow-light': 'rgba(248, 181, 0, 0.1)',
    '--brand-accent-secondary-glow': 'rgba(252, 234, 187, 0.5)',
    '--brand-accent-glow': 'rgba(248, 181, 0, 0.5)',
    '--brand-warning-glow': 'rgba(255, 193, 7, 0.5)',
    '--background-image-override': `
        radial-gradient(circle at 50% 50%, rgba(255,215,0,0.05) 0px, transparent 2px),
        linear-gradient(135deg, var(--brand-bg-gradient-start) 0%, var(--brand-bg-gradient-end) 100%)
    `,
    '--cube-face-bg': 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)',
    '--cube-face-border': '#fff2c7',
    '--cube-face-text-color': '#4a2c00',
    '--cube-face-text-shadow': '0 1px 1px rgba(255, 255, 255, 0.5)',
  },
   'theme-holo': { // Standalone theme version of the holo cube
    '--brand-bg-gradient-start': '#051817',
    '--brand-bg-gradient-end': '#0e2a28',
    '--brand-primary': 'rgba(14, 42, 40, 0.3)',
    '--brand-secondary': 'rgba(14, 42, 40, 0.2)',
    '--brand-light': '#E8FFF0',
    '--brand-accent': '#00FFA0',
    '--brand-accent-secondary': '#00F0FF',
    '--brand-warning': '#FFC700',
    '--brand-correct': '#00FFA0',
    '--brand-tertiary': '#66ffc4',
    '--brand-quaternary': '#66f6ff',
    '--brand-accent-shadow': '#00b370',
    '--brand-accent-secondary-shadow': '#00b4c0',
    '--brand-warning-shadow': '#c09500',
    '--brand-correct-shadow': '#00c07a',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.2)',
    '--bevel-shadow-dark': 'rgba(0, 240, 255, 0.1)',
    '--bevel-shadow-light': 'rgba(0, 255, 160, 0.1)',
    '--brand-accent-secondary-glow': 'rgba(0, 240, 255, 0.5)',
    '--brand-accent-glow': 'rgba(0, 255, 160, 0.5)',
    '--brand-warning-glow': 'rgba(255, 199, 0, 0.5)',
    '--background-image-override': `
        linear-gradient(135deg, var(--brand-bg-gradient-start) 0%, var(--brand-bg-gradient-end) 100%)
    `,
    '--cube-face-bg': `
        linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%),
        repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 5px,
          rgba(0, 240, 255, 0.2) 5px,
          rgba(0, 240, 255, 0.2) 10px
        )
    `,
    '--cube-face-border': 'var(--brand-accent-secondary)',
    '--cube-face-text-color': 'var(--brand-quaternary)',
    '--cube-face-text-shadow': '0 0 12px var(--brand-accent-secondary)',
    '--cube-face-extra-animation': 'holo-shift 5s linear infinite',
  },
  'theme-glass-dark': {
    // Glassmorphism variables
    '--bg-primary': 'rgba(15, 23, 42, 0.95)',
    '--bg-secondary': 'rgba(30, 41, 59, 0.8)',
    '--bg-glass': 'rgba(71, 85, 105, 0.25)',
    '--bg-glass-light': 'rgba(148, 163, 184, 0.15)',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#cbd5e1',
    '--text-muted': '#94a3b8',
    '--accent-primary': '#06b6d4',
    '--accent-secondary': '#8b5cf6',
    '--accent-success': '#10b981',
    '--accent-warning': '#f59e0b',
    '--accent-danger': '#ef4444',
    '--glass-blur': 'blur(10px)',
    '--glass-border': '1px solid rgba(148, 163, 184, 0.2)',
    '--glass-shadow': '0 8px 32px rgba(0, 0, 0, 0.1)',
    '--glass-backdrop': 'rgba(15, 23, 42, 0.6)',
    // Mapped to existing --brand variables
    '--brand-bg-gradient-start': '#0f172a',
    '--brand-bg-gradient-end': 'rgba(15, 23, 42, 0.95)',
    '--brand-primary': 'rgba(30, 41, 59, 0.8)',
    '--brand-secondary': 'rgba(71, 85, 105, 0.25)',
    '--brand-light': '#f1f5f9',
    '--brand-accent': '#8b5cf6',
    '--brand-accent-secondary': '#06b6d4',
    '--brand-warning': '#f59e0b',
    '--brand-correct': '#10b981',
    '--brand-tertiary': '#a78bfa',
    '--brand-quaternary': '#67e8f9',
    '--brand-accent-shadow': '#6d28d9',
    '--brand-accent-secondary-shadow': '#0891b2',
    '--brand-warning-shadow': '#b45309',
    '--brand-correct-shadow': '#047857',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.2)',
    '--bevel-shadow-dark': 'rgba(0,0,0,0.2)',
    '--bevel-shadow-light': 'rgba(255, 255, 255, 0.05)',
    '--brand-accent-secondary-glow': 'rgba(6, 182, 212, 0.5)',
    '--brand-accent-glow': 'rgba(139, 92, 246, 0.5)',
    '--brand-warning-glow': 'rgba(245, 158, 11, 0.5)',
    '--background-image-override': `none`,
    // Cube face styling
    '--cube-face-bg': 'rgba(71, 85, 105, 0.4)',
    '--cube-face-border': 'rgba(148, 163, 184, 0.3)',
    '--cube-face-text-color': '#f1f5f9',
    '--cube-face-text-shadow': '0 0 10px rgba(6, 182, 212, 0.3)',
    '--cube-face-extra-animation': 'none',
  },
  'theme-glass-light': {
    // Glassmorphism variables
    '--bg-primary': 'rgba(248, 250, 252, 0.98)',
    '--bg-secondary': 'rgba(226, 232, 240, 0.9)',
    '--bg-glass': 'rgba(226, 232, 240, 0.4)',
    '--bg-glass-light': 'rgba(241, 245, 249, 0.6)',
    '--text-primary': '#1e293b',
    '--text-secondary': '#475569',
    '--text-muted': '#94a3b8',
    '--accent-primary': '#0891b2',
    '--accent-secondary': '#7c3aed',
    '--accent-success': '#059669',
    '--accent-warning': '#d97706',
    '--accent-danger': '#dc2626',
    '--glass-blur': 'blur(12px)',
    '--glass-border': '1px solid rgba(148, 163, 184, 0.3)',
    '--glass-shadow': '0 8px 32px rgba(0, 0, 0, 0.08)',
    '--glass-backdrop': 'rgba(248, 250, 252, 0.7)',
    // Mapped to existing --brand variables
    '--brand-bg-gradient-start': '#f8fafc',
    '--brand-bg-gradient-end': 'rgba(248, 250, 252, 0.98)',
    '--brand-primary': 'rgba(226, 232, 240, 0.9)',
    '--brand-secondary': 'rgba(226, 232, 240, 0.4)',
    '--brand-light': '#1e293b',
    '--brand-accent': '#7c3aed',
    '--brand-accent-secondary': '#0891b2',
    '--brand-warning': '#d97706',
    '--brand-correct': '#059669',
    '--brand-tertiary': '#a78bfa',
    '--brand-quaternary': '#67e8f9',
    '--brand-accent-shadow': '#6d28d9',
    '--brand-accent-secondary-shadow': '#0e7490',
    '--brand-warning-shadow': '#9a3412',
    '--brand-correct-shadow': '#065f46',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.1)',
    '--bevel-shadow-dark': 'rgba(0,0,0,0.1)',
    '--bevel-shadow-light': 'rgba(255, 255, 255, 0.5)',
    '--brand-accent-secondary-glow': 'rgba(8, 145, 178, 0.5)',
    '--brand-accent-glow': 'rgba(124, 58, 237, 0.5)',
    '--brand-warning-glow': 'rgba(217, 119, 6, 0.5)',
    '--background-image-override': `none`,
    // Cube face styling
    '--cube-face-bg': 'rgba(226, 232, 240, 0.5)',
    '--cube-face-border': 'rgba(148, 163, 184, 0.4)',
    '--cube-face-text-color': '#1e293b',
    '--cube-face-text-shadow': '0 0 15px rgba(8, 145, 178, 0.2)',
    '--cube-face-extra-animation': 'none',
  },
  'theme-glass-neon': {
    // Glassmorphism variables
    '--bg-primary': 'rgba(10, 10, 20, 0.98)',
    '--bg-secondary': 'rgba(20, 20, 40, 0.85)',
    '--bg-glass': 'rgba(50, 30, 80, 0.25)',
    '--bg-glass-light': 'rgba(100, 50, 200, 0.1)',
    '--text-primary': '#00ff99',
    '--text-secondary': '#00ffff',
    '--text-muted': '#00cc88',
    '--accent-primary': '#00ff99',
    '--accent-secondary': '#ff00ff',
    '--accent-success': '#00ff99',
    '--accent-warning': '#ffff00',
    '--accent-danger': '#ff0055',
    '--glass-blur': 'blur(15px)',
    '--glass-border': '1px solid rgba(0, 255, 153, 0.3)',
    '--glass-shadow': '0 8px 32px rgba(0, 255, 153, 0.1), inset 0 0 20px rgba(255, 0, 255, 0.05)',
    '--glass-backdrop': 'rgba(10, 10, 20, 0.8)',
    // Mapped to existing --brand variables
    '--brand-bg-gradient-start': '#0a0a14',
    '--brand-bg-gradient-end': 'rgba(10, 10, 20, 0.98)',
    '--brand-primary': 'rgba(20, 20, 40, 0.85)',
    '--brand-secondary': 'rgba(50, 30, 80, 0.25)',
    '--brand-light': '#00ff99',
    '--brand-accent': '#ff00ff',
    '--brand-accent-secondary': '#00ffff',
    '--brand-warning': '#ffff00',
    '--brand-correct': '#00ff99',
    '--brand-tertiary': '#ff66ff',
    '--brand-quaternary': '#66ffff',
    '--brand-accent-shadow': '#cc00cc',
    '--brand-accent-secondary-shadow': '#00cccc',
    '--brand-warning-shadow': '#cccc00',
    '--brand-correct-shadow': '#00cc88',
    '--shadow-color-strong': 'rgba(0, 0, 0, 0.3)',
    '--bevel-shadow-dark': 'rgba(0,0,0,0.3)',
    '--bevel-shadow-light': 'rgba(255, 255, 255, 0.05)',
    '--brand-accent-secondary-glow': 'rgba(0, 255, 255, 0.6)',
    '--brand-accent-glow': 'rgba(255, 0, 255, 0.6)',
    '--brand-warning-glow': 'rgba(255, 255, 0, 0.6)',
    '--background-image-override': `none`,
    // Cube face styling
    '--cube-face-bg': 'rgba(100, 50, 200, 0.3)',
    '--cube-face-border': 'rgba(0, 255, 153, 0.5)',
    '--cube-face-text-color': '#00ff99',
    '--cube-face-text-shadow': '0 0 20px rgba(0, 255, 153, 0.8), 0 0 40px rgba(255, 0, 255, 0.4)',
    '--cube-face-extra-animation': 'none',
  },
};