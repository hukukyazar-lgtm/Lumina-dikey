import React from 'react';

interface CorrectWordDisplayProps {
  word: string;
  isCorrect: boolean;
}

const CorrectWordDisplay: React.FC<CorrectWordDisplayProps> = ({ word, isCorrect }) => {
  const colorClass = isCorrect ? 'text-brand-correct' : 'text-brand-accent';
  const shadowClass = isCorrect ? 'drop-shadow-[0_0_15px_var(--brand-correct-glow)]' : 'drop-shadow-[0_0_15px_var(--brand-accent-glow)]';

  // Dynamically adjust font size based on word length
  const getFontSizeClass = (length: number) => {
    if (length <= 5) return 'text-8xl';
    if (length <= 6) return 'text-7xl';
    if (length <= 7) return 'text-6xl';
    return 'text-5xl';
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
      <div
        key={word} // Re-trigger animation on word change
        className={`font-extrabold animate-grow-and-fade ${colorClass} ${shadowClass} ${getFontSizeClass(word.length)}`}
      >
        {word}
      </div>
    </div>
  );
};

export default CorrectWordDisplay;
