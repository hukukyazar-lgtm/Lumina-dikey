import React from 'react';
import { useLanguage } from './LanguageContext';

interface WordTileProps {
  word: string;
  onClick: (word: string) => void;
  status: 'default' | 'found' | 'incorrect' | 'missed' | 'distractor' | 'selected';
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
    selected: 'bg-brand-accent/20 border-brand-accent scale-105 shadow-lg',
    found: 'bg-brand-correct/80 border-brand-correct text-white shadow-[0_0_10px_var(--brand-correct)] cursor-default',
    incorrect: 'bg-brand-accent/80 border-brand-accent text-white shadow-[0_0_10px_var(--brand-accent)] animate-shake-horizontal',
    missed: 'bg-brand-warning/60 border-brand-warning text-white cursor-default animate-missed-word-glow z-10',
    distractor: 'opacity-20 cursor-default',
  };

  return (
    <div
      onClick={() => (status === 'default' || status === 'selected') && onClick(word)}
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