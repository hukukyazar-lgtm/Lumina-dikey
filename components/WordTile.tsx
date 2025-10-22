import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageContext';

interface WordTileProps {
  word: string;
  onClick: (word: string) => void;
  status: 'default' | 'found' | 'incorrect' | 'missed' | 'distractor' | 'selected';
  style: React.CSSProperties; // This is for the random transform from parent
}

const WordTile: React.FC<WordTileProps> = ({ word, onClick, status, style }) => {
  const { t } = useLanguage();

  const isDisabled = status === 'found' || status === 'incorrect' || status === 'missed' || status === 'distractor';
  const isClickable = status === 'default' || status === 'selected';

  const styleVars: React.CSSProperties = { ...style };
  let frontTextColor = 'var(--brand-bg-gradient-end)';

  switch (status) {
    case 'found':
      styleVars['--key-edge-color'] = 'var(--brand-correct-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-correct)';
      break;
    case 'incorrect':
      styleVars['--key-edge-color'] = 'var(--brand-accent-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-accent)';
      break;
    case 'missed':
      styleVars['--key-edge-color'] = 'var(--brand-warning-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-warning)';
      frontTextColor = '#4a2c00'; // Darker text for better contrast on yellow
      break;
    case 'selected':
      // Using a different color to distinguish from incorrect
      styleVars['--key-edge-color'] = 'hsl(262, 83%, 40%)'; // Dark purple
      styleVars['--key-front-color'] = 'hsl(262, 83%, 60%)'; // Bright purple
      break;
    case 'default':
    default:
      styleVars['--key-edge-color'] = 'var(--brand-accent-secondary-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-accent-secondary)';
      break;
  }
  
  styleVars['--key-front-text-color'] = frontTextColor;
  styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.3)';

  const getFontSizeClass = (wordLength: number): string => {
    if (wordLength <= 5) return 'text-xl sm:text-2xl';
    if (wordLength === 6) return 'text-lg sm:text-xl';
    if (wordLength === 7) return 'text-base sm:text-lg';
    return 'text-sm sm:text-base';
  };
  const fontSizeClass = getFontSizeClass(word.length);

  const buttonAnimationVariants = {
    incorrect: { x: [0, -4, 4, -4, 4, 0], transition: { duration: 0.4 } },
    default: { x: 0 }
  };
  
  const frontAnimationVariants = {
    selected: { y: -6 },
    default: { y: -4 },
  };

  return (
    <motion.button
        onClick={() => isClickable && onClick(word)}
        disabled={isDisabled}
        className={`pressable-key transition-opacity duration-300 ${isDisabled ? 'cursor-default' : ''} ${status === 'distractor' ? 'opacity-30' : 'opacity-100'}`}
        style={styleVars}
        aria-label={`${t('selectWord')} ${word}`}
        variants={buttonAnimationVariants}
        animate={status === 'incorrect' ? 'incorrect' : 'default'}
        whileHover={isClickable ? { y: -2 } : {}}
        whileTap={isClickable ? { y: 1 } : {}}
        transition={{ type: 'spring', stiffness: 600, damping: 15 }}
    >
        <span className="pressable-key-shadow" />
        <span className={`pressable-key-edge ${status === 'missed' ? 'animate-missed-word-glow' : ''}`} />
        <motion.div 
          className={`pressable-key-front font-sans font-black px-4 sm:px-5 ${fontSizeClass}`}
          variants={frontAnimationVariants}
          animate={status === 'selected' ? 'selected' : 'default'}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
            <span>{word}</span>
        </motion.div>
    </motion.button>
  );
};

export default WordTile;
