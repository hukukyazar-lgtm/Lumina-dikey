import React from 'react';
import { useLanguage } from './LanguageContext';
import { LIFE_BONUS_INTERVAL } from '../config';

interface LifeBonusIndicatorProps {
  lives: number;
  displayLives: number;
  consecutiveCorrectAnswers: number;
}

const LifeBonusIndicator: React.FC<LifeBonusIndicatorProps> = ({
  lives,
  displayLives,
  consecutiveCorrectAnswers,
}) => {
  const { t } = useLanguage();
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use modulo to ensure the progress bar resets correctly after a bonus
  const progress = (consecutiveCorrectAnswers % LIFE_BONUS_INTERVAL) / LIFE_BONUS_INTERVAL;
  const offset = circumference - progress * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center" aria-label={t('livesRemaining', { count: lives })}>
      {/* Circular progress bar */}
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="var(--brand-secondary)"
          fill="transparent"
          className="opacity-50"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="var(--brand-accent-secondary)"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>

      {/* Hearts overlay */}
      <div className="absolute flex items-center justify-center">
        <span className="text-2xl" role="img" aria-label={t('fullHeart')}>❤️</span>
        <span className="text-xl font-bold text-white" style={{ textShadow: '0 1px 3px black' }}>
          &times;{displayLives}
        </span>
        {/* Simple overlay for the heart break animation. Triggered when displayLives is lagging behind actual lives. */}
        {lives < displayLives && (
          <span className="absolute text-3xl animate-heart-break" role="img">❤️</span>
        )}
      </div>
    </div>
  );
};

export default LifeBonusIndicator;
