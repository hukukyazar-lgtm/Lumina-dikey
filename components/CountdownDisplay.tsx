import React from 'react';

interface CountdownDisplayProps {
  value: number | string | null;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ value }) => {
  if (value === null) return null;

  // For "GO!", use a smaller text size.
  const textSizeClass = typeof value === 'string' ? 'text-6xl' : 'text-9xl';

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-brand-bg/60 backdrop-blur-sm z-20 pointer-events-none">
      <div
        key={value} // Force re-render and re-animation on change
        className={`${textSizeClass} font-black text-white animate-countdown-pop`}
        style={{
          textShadow: '0 0 15px var(--brand-accent-secondary), 0 0 30px var(--brand-accent-secondary)',
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default CountdownDisplay;