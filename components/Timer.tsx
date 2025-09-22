import React from 'react';

interface TimerProps {
  duration: number;
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ duration, timeLeft }) => {
  const size = 48; // Made smaller
  const strokeWidth = 4; // Adjusted stroke width
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = duration > 0 ? timeLeft / duration : 0;
  const offset = circumference - progress * circumference;

  const getColor = () => {
    if (progress <= 0.3) return 'var(--brand-accent)';
    if (progress <= 0.6) return 'var(--brand-warning)';
    return 'var(--brand-accent-secondary)';
  };

  const color = getColor();

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      role="progressbar"
      aria-valuenow={timeLeft}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-label="Time remaining"
    >
      <svg width={size} height={size} className="-rotate-90" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="var(--brand-secondary)"
          fill="var(--brand-primary)"
          className="opacity-60"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            // The `stroke-dashoffset` transition is set to 1s linear to create a smooth, 
            // continuous drain effect that matches the 1-second interval of the game timer.
            // This eliminates the "ticking" or stuttering effect.
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease-in-out',
          }}
        />
      </svg>
    </div>
  );
};

export default Timer;