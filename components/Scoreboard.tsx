import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';

interface ScoreboardProps {
  score: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score }) => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    // Animate only when the score increases from its previous value.
    if (score > prevScoreRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match this duration to the animation duration in CSS.

      return () => clearTimeout(timer);
    }
    
    // Update the ref to the current score for the next comparison.
    prevScoreRef.current = score;
  }, [score]);
  
  const panelClasses = 'bg-gradient-to-br from-brand-secondary/50 to-brand-primary/50 border-brand-light/10';

  return (
    <div className={`h-10 flex items-center justify-center ${panelClasses} backdrop-blur-sm border px-4 sm:px-6 shadow-bevel-inner rounded-lg`}>
      {/* Score */}
      <span className={`text-lg sm:text-xl font-black text-brand-accent-secondary w-16 sm:w-20 text-center transition-transform ${isAnimating ? 'animate-score-pop' : ''}`}>
        {score}
      </span>
    </div>
  );
};

export default React.memo(Scoreboard);