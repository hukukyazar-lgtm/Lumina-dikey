import React from 'react';
import { useLanguage } from './LanguageContext';

interface WordTileProps {
  word: string;
  onClick: (word: string) => void;
  status: 'default' | 'found' | 'incorrect' | 'missed' | 'distractor';
  style: React.CSSProperties;
}

const WordTile: React.FC<WordTileProps> = ({ word, onClick, status, style }) => {
  const { t } = useLanguage();
  const baseClasses = `
    px-4 sm:px-5 py-2 sm:py-3 rounded-full cursor-pointer transition-all duration-200
    backdrop-blur-sm shadow-bevel-inner border text-center
    text-lg sm:text-xl font-bold text-brand-light shadow-[0_5px_15px_rgba(0,0,0,0.3)]
  `;

  const defaultBgClasses = 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10';

  const statusStyles = {
    default: `${defaultBgClasses} border-brand-accent-secondary/50 hover:border-brand-accent-secondary`,
    found: 'bg-brand-accent-secondary/50 border-brand-accent-secondary cursor-default',
    incorrect: 'bg-brand-accent/50 border-brand-accent animate-shake-horizontal',
    missed: 'bg-brand-warning/40 border-brand-warning cursor-default animate-missed-word-glow z-10',
    distractor: 'opacity-40 cursor-default',
  };

  return (
    <div
      onClick={() => status === 'default' && onClick(word)}
      className={`${baseClasses} ${statusStyles[status]}`}
      style={style}
      role="button"
      aria-label={`${t('selectWord')} ${word}`}
    >
      {word}
    </div>
  );
};

export default WordTile;