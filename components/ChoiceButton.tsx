import React, { forwardRef } from 'react';
import { useLanguage } from './LanguageContext';
import { soundService } from '../services/soundService';

interface ChoiceButtonProps {
  word: string;
  onClick: (word: string) => void;
  disabled: boolean;
  status: 'default' | 'correct' | 'incorrect';
}

const ChoiceButton = forwardRef<HTMLButtonElement, ChoiceButtonProps>(({ word, onClick, disabled, status }, ref) => {
  // Dynamically adjust font size based on word length to maximize size without overflow.
  const getFontSizeClass = (wordLength: number): string => {
    if (wordLength <= 5) return 'text-4xl sm:text-5xl';
    if (wordLength === 6) return 'text-3xl sm:text-4xl';
    if (wordLength === 7) return 'text-2xl sm:text-3xl';
    return 'text-xl sm:text-2xl'; // For 8+ characters
  };

  const fontSizeClass = getFontSizeClass(word.length);

  const baseClasses = `
    w-full text-center font-extrabold p-3 sm:p-4 rounded-full
    transform transition-all duration-150 ease-in-out
    shadow-bevel-inner border
    text-brand-light focus:outline-none
  `;

  const defaultBgClasses = 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10';

  // Define styles for different states
  const statusStyles = {
    default: {
      bg: defaultBgClasses,
      border: 'border-brand-accent-secondary/40',
      shadow: 'shadow-[0_4px_0_var(--brand-accent-secondary-shadow)]',
      hover: 'hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)]',
      active: 'active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)]',
      animation: '',
    },
    correct: {
      bg: 'bg-brand-accent-secondary/30',
      border: 'border-brand-accent-secondary/60',
      shadow: 'shadow-[0_4px_0_var(--brand-accent-secondary-shadow)]',
      hover: '',
      active: '',
      animation: 'animate-correct-pop',
    },
    incorrect: {
      bg: 'bg-brand-accent/30',
      border: 'border-brand-accent/60',
      shadow: 'shadow-[0_4px_0_var(--brand-accent-shadow)]',
      hover: '',
      active: '',
      animation: 'animate-shake-horizontal',
    },
  };

  const currentStatus = statusStyles[status];

  // Combine classes, only applying hover/active effects for the default state
  const combinedClasses = `
    ${baseClasses}
    ${fontSizeClass}
    backdrop-blur-sm
    ${currentStatus.bg}
    ${currentStatus.border}
    ${currentStatus.shadow}
    ${status === 'default' ? currentStatus.hover : ''}
    ${status === 'default' ? currentStatus.active : ''}
    ${currentStatus.animation}
  `;

  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  const handleClick = () => {
    soundService.play('click');
    onClick(word);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      className={`${combinedClasses} ${disabledClasses}`}
    >
      {word}
    </button>
  );
});

export default React.memo(ChoiceButton);