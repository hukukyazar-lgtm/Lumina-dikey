import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from './LanguageContext';
import { GameStatus } from '../types';

interface FeedbackTextProps {
  status: GameStatus;
}

const FeedbackText: React.FC<FeedbackTextProps> = ({ status }) => {
  const { t } = useLanguage();

  const isCorrect = status === 'correct';
  const text = isCorrect ? t('feedbackCorrect') : t('feedbackIncorrect');
  const colorClass = isCorrect ? 'text-brand-correct' : 'text-brand-accent';
  const shadowClass = isCorrect ? 'drop-shadow-[0_0_15px_var(--brand-correct-glow)]' : 'drop-shadow-[0_0_15px_var(--brand-accent-glow)]';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      exit={{ opacity: 0, scale: 1.3, y: -20, transition: { duration: 0.3 } }}
      className="absolute inset-x-0 bottom-[25%] flex justify-center pointer-events-none z-20"
    >
      <div
        className={`text-6xl font-black ${colorClass} ${shadowClass}`}
      >
        {text}
      </div>
    </motion.div>
  );
};

export default FeedbackText;