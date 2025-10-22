import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { soundService } from '../services/soundService';

interface PressableButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'accent' | 'warning' | 'correct';
  className?: string;
  size?: 'normal' | 'large';
}

const PressableButton = forwardRef<HTMLButtonElement, PressableButtonProps>(({ children, onClick, disabled = false, color = 'primary', className = '', size = 'normal' }, ref) => {
  const styleVars: React.CSSProperties = {};

  switch (color) {
    case 'correct':
      styleVars['--key-edge-color'] = 'var(--brand-correct-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-correct)';
      styleVars['--key-front-text-color'] = '#1a0e2a';
      styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.4)';
      break;
    case 'accent':
      styleVars['--key-edge-color'] = 'var(--brand-accent-shadow)';
      styleVars['--key-front-color'] = 'var(--brand-accent)';
      styleVars['--key-front-text-color'] = 'var(--brand-light)';
      styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.3)';
      break;
    case 'warning':
        styleVars['--key-edge-color'] = 'var(--brand-warning-shadow)';
        styleVars['--key-front-color'] = 'var(--brand-warning)';
        styleVars['--key-front-text-color'] = '#4a2c00'; // Darker for contrast on yellow
        styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.4)';
        break;
    case 'secondary':
        styleVars['--key-edge-color'] = 'var(--brand-accent-secondary-shadow)';
        styleVars['--key-front-color'] = 'var(--brand-accent-secondary)';
        styleVars['--key-front-text-color'] = '#1a0e2a';
        styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.2)';
        break;
    case 'primary':
    default:
        styleVars['--key-edge-color'] = 'var(--bevel-shadow-dark)';
        styleVars['--key-front-color'] = 'var(--brand-secondary)';
        styleVars['--key-front-text-color'] = 'var(--brand-light)';
        styleVars['--key-front-border-color'] = 'rgba(255, 255, 255, 0.1)';
      break;
  }
  
  const textSizeClass = size === 'large' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';

  const handleClick = () => {
    if (!disabled) {
      soundService.play('click');
      onClick();
    }
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`pressable-key ${className} ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
      style={styleVars}
      whileHover={!disabled ? { y: -2 } : {}}
      whileTap={!disabled ? { y: 1 } : {}}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
    >
      <div className="pressable-key-shadow" />
      <div className="pressable-key-edge" />
      <div className={`pressable-key-front font-sans font-black ${textSizeClass}`}>
        {children}
      </div>
    </motion.button>
  );
});

export default PressableButton;