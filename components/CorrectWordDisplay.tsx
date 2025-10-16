import React from 'react';
import { useLanguage } from './LanguageContext';
import { GameStatus } from '../types';

interface FeedbackTextProps {
  status: GameStatus;
}

const FeedbackText: React.FC<FeedbackTextProps> = ({ status }) => {
  const { t } = useLanguage();

  if (status !== 'correct' && status !== 'incorrect') {
    return null;
  }

  const isCorrect = status === 'correct';
  const text = isCorrect ? t('feedbackCorrect') : t('feedbackIncorrect');
  const colorClass = isCorrect ? 'text-brand-correct' : 'text-brand-accent';
  const shadowClass = isCorrect ? 'drop-shadow-[0_0_15px_var(--brand-correct-glow)]' : 'drop-shadow-[0_0_15px_var(--brand-accent-glow)]';

  return (
    <div className="absolute inset-x-0 bottom-[25%] flex justify-center pointer-events-none z-20">
      <div
        key={text} // Re-trigger animation on text change
        className={`text-6xl font-black animate-grow-and-fade-text ${colorClass} ${shadowClass}`}
      >
        {text}
      </div>
    </div>
  );
};

export default FeedbackText;