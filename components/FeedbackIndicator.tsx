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
  
  // Define colors based on game's palette
  const colorClasses = isCorrect
    ? 'text-brand-accent-secondary' // Cyan
    : 'text-brand-accent'; // Orange-Red

  // SVG path length needs to be set for the draw animation
  const pathStyle = {
    strokeDasharray: 100, // Increased for thicker/larger icons
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
        style={{ filter: `drop-shadow(0 0 20px currentColor)` }}
      >
        {/* Background Burst Effect */}
        <svg
          className="absolute w-full h-full animate-feedback-burst"
          viewBox="0 0 100 100"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M50 0L61.2 38.8L100 50L61.2 61.2L50 100L38.8 61.2L0 50L38.8 38.8L50 0Z" />
        </svg>

        {/* Foreground Icon */}
        {isCorrect ? (
          <svg className="relative w-28 h-28 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              className="animate-draw-check"
              style={pathStyle}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3" // Made thicker
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg className="relative w-28 h-28 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              className="animate-draw-cross-1"
              style={pathStyle}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3" // Made thicker
              d="M6 18L18 6"
            />
            <path
              className="animate-draw-cross-2"
              style={pathStyle}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3" // Made thicker
              d="M6 6l12 12"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default FeedbackIndicator;