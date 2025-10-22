import React, { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { soundService } from '../services/soundService';

interface ChoiceButtonProps {
  word: string;
  onClick: (word: string) => void;
  disabled: boolean;
  status: 'default' | 'correct' | 'incorrect';
  revealPercentage: number;
  revealDirection: 'easy' | 'medium' | 'hard';
}

const ChoiceButton = forwardRef<HTMLButtonElement, ChoiceButtonProps>(({ word, onClick, disabled, status, revealPercentage, revealDirection }, ref) => {
  // Dynamically adjust font size based on word length to maximize size without overflow.
  const getFontSizeClass = (wordLength: number): string => {
    if (wordLength <= 5) return 'text-3xl sm:text-4xl';
    if (wordLength === 6) return 'text-2xl sm:text-3xl';
    if (wordLength === 7) return 'text-xl sm:text-2xl';
    return 'text-lg sm:text-xl'; // For 8+ characters
  };

  const fontSizeClass = getFontSizeClass(word.length);

  const styleVars: React.CSSProperties = {};

  switch (status) {
    case 'correct':
      styleVars['--key-edge-color'] = 'var(--brand-correct-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-correct)';
      styleVars['--key-front-text-color'] = '#1a0e2a';
      styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.4)';
      break;
    case 'incorrect':
      styleVars['--key-edge-color'] = 'var(--brand-accent-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-accent)';
      styleVars['--key-front-text-color'] = '#1a0e2a';
      styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.3)';
      break;
    default:
      styleVars['--key-edge-color'] = 'var(--brand-accent-secondary-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-accent-secondary)';
      styleVars['--key-front-text-color'] = '#1a0e2a';
      styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.2)';
      break;
  }

  const handleClick = () => {
    if (!disabled) {
      soundService.play('click');
      onClick(word);
    }
  };

  const clipPathStyle = useMemo(() => {
    const revealAmount = 100 - revealPercentage;
    switch (revealDirection) {
      case 'hard': // right to left
        return `inset(0 0 0 ${revealAmount}%)`;
      case 'medium': // from sides to middle
        const sideAmount = revealAmount / 2;
        return `inset(0 ${sideAmount}% 0 ${sideAmount}%)`;
      case 'easy': // left to right
      default:
        return `inset(0 ${revealAmount}% 0 0)`;
    }
  }, [revealPercentage, revealDirection]);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`pressable-key w-full ${disabled && status === 'default' ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={styleVars}
      whileHover={!disabled && status === 'default' ? { y: -2 } : {}}
      whileTap={!disabled && status === 'default' ? { y: 1 } : {}}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
    >
      <div className="pressable-key-shadow" />
      <div className="pressable-key-edge" />
      <div className={`pressable-key-front font-sans font-black ${fontSizeClass}`}>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Invisible placeholder to ensure button has correct width from the start */}
          <span className="opacity-0 pointer-events-none">{word}</span>
          {/* Visible, clipped word that reveals over time */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-200 ease-linear"
            style={{ clipPath: clipPathStyle }}
          >
            <span>{word}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
});

export default React.memo(ChoiceButton);