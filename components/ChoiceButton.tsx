import React, { forwardRef } from 'react';
import { useLanguage } from './LanguageContext';
import { soundService } from '../services/soundService';

interface ChoiceButtonProps {
  word: string;
  onClick: (word: string) => void;
  disabled: boolean;
  status: 'default' | 'correct' | 'incorrect';
  customTextureUrl?: string | null;
}

const ChoiceButton = forwardRef<HTMLButtonElement, ChoiceButtonProps>(({ word, onClick, disabled, status, customTextureUrl }, ref) => {
  // Dynamically adjust font size based on word length to maximize size without overflow.
  const getFontSizeClass = (wordLength: number): string => {
    if (wordLength <= 5) return 'text-4xl sm:text-5xl';
    if (wordLength === 6) return 'text-3xl sm:text-4xl';
    if (wordLength === 7) return 'text-2xl sm:text-3xl';
    return 'text-xl sm:text-2xl'; // For 8+ characters
  };

  const fontSizeClass = getFontSizeClass(word.length);

  const baseClasses = `
    w-full text-center font-sans font-black p-3 sm:p-4
    transform transition-all duration-200 ease-in-out
    border
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-warning
  `;

  const statusStyles = {
    default: {
      animation: '',
    },
    correct: {
      bg: 'bg-brand-correct/80',
      border: 'border-[var(--brand-correct-shadow)]',
      shadow: 'shadow-md shadow-brand-correct/30',
      text: 'text-[var(--brand-bg-gradient-end)]',
      animation: 'animate-correct-pop',
    },
    incorrect: {
      bg: 'bg-brand-accent/80',
      border: 'border-[var(--brand-accent-shadow)]',
      shadow: 'shadow-md shadow-brand-accent/30',
      text: 'text-[var(--brand-bg-gradient-end)]',
      animation: 'animate-hand-shake',
    },
  };

  // In default state, we apply the custom structure. In correct/incorrect states, we use the theme's feedback styles.
  const buttonStyle: React.CSSProperties = status === 'default'
    ? {
        borderRadius: 'var(--custom-button-border-radius)',
        boxShadow: `var(--custom-button-box-shadow), inset 0 1px 1px rgba(255, 255, 255, var(--custom-button-highlight-intensity)), inset 0 -1px 1px rgba(0, 0, 0, calc(var(--custom-button-highlight-intensity) * 0.5))`,
        background: `var(--custom-button-bg)`,
        borderColor: `var(--custom-button-border-color)`,
        color: `var(--custom-button-text-color)`,
      }
    : {};
  
  let effectiveTextClass = '';
  let textWrapperClass = '';

  // Texture is applied on top of the structural background
  const useCustomTexture = status === 'default' && customTextureUrl;
  if (useCustomTexture) {
      buttonStyle.backgroundImage = `linear-gradient(rgba(26, 14, 42, 0.7), rgba(26, 14, 42, 0.7)), url(${customTextureUrl}), var(--custom-button-bg)`;
      buttonStyle.backgroundSize = 'cover';
      buttonStyle.backgroundPosition = 'center';
      buttonStyle.color = 'var(--brand-light)'; // Ensure high contrast
      textWrapperClass = 'drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]';
// FIX: Use statusStyles[status] directly to allow TypeScript to correctly narrow the type.
  } else if (status !== 'default') {
      effectiveTextClass = statusStyles[status].text;
  }
  
  const combinedClasses = `
    ${baseClasses}
    ${fontSizeClass}
    ${status !== 'default' ? statusStyles[status].bg : ''}
    ${status !== 'default' ? statusStyles[status].border : ''}
    ${status !== 'default' ? statusStyles[status].shadow : ''}
    ${effectiveTextClass}
    ${status === 'default' ? 'hover:brightness-110 active:translate-y-0.5' : ''}
    ${statusStyles[status].animation}
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
      style={buttonStyle}
    >
      <span className={textWrapperClass}>{word}</span>
    </button>
  );
});

export default React.memo(ChoiceButton);