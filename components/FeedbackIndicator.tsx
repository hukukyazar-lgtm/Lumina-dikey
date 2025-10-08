import React from 'react';
import type { GameStatus } from '../types';

interface FeedbackIndicatorProps {
  status: GameStatus;
}

const FeedbackIndicator: React.FC<FeedbackIndicatorProps> = ({ status }) => {
  if (status !== 'correct' && status !== 'incorrect') {
    return null;
  }

  const isCorrect = status === 'correct';

  const animationContainerClass = 'animate-feedback-pop';
  
  const colorClasses = isCorrect
    ? 'text-brand-accent-secondary' // Cyan
    : 'text-brand-accent'; // Magenta

  const pathStyle = {
    strokeDasharray: 100,
    strokeDashoffset: 100,
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${
        status === 'correct' || status === 'incorrect' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
    >
      <div
        className={`relative flex items-center justify-center w-40 h-40 ${animationContainerClass} ${colorClasses}`}
      >
        {/* Background Burst Effect */}
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="20" strokeWidth="2" className="animate-digital-burst" />
        </svg>

        {/* Foreground Icon */}
        {isCorrect ? (
          <svg className="relative w-28 h-28" style={{filter: 'drop-shadow(0 0 10px currentColor)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              className="animate-draw-check"
              style={pathStyle}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg className="relative w-28 h-28 animate-glitch-shake" style={{filter: 'drop-shadow(0 0 10px currentColor)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              className="animate-draw-cross-1"
              style={pathStyle}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 18L18 6"
            />
            <path
              className="animate-draw-cross-2"
              style={pathStyle}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M6 6l12 12"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default FeedbackIndicator;