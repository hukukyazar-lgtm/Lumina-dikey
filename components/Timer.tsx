import React from 'react';

interface TimerProps {
  duration: number;
  timeLeft: number;
}

const Timer: React.FC<TimerProps> = ({ duration, timeLeft }) => {
  const progress = duration > 0 ? timeLeft / duration : 0;
  const progressPercent = progress * 100;

  const getColor = () => {
    if (progress <= 0.3) return 'var(--brand-accent)';
    if (progress <= 0.6) return 'var(--brand-warning)';
    return 'var(--brand-accent-secondary)';
  };

  const color = getColor();

  return (
    <div
      className="w-full h-3 bg-brand-secondary rounded-full overflow-hidden border border-brand-light/10 shadow-inner-strong"
      role="progressbar"
      aria-valuenow={timeLeft}
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-label="Time remaining"
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${progressPercent}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          // The `width` transition is set to 1s linear to create a smooth, 
          // continuous drain effect that matches the 1-second interval of the game timer.
          transition: 'width 1s linear, background-color 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default Timer;