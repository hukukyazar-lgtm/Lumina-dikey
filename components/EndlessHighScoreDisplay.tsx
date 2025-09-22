import React from 'react';

interface EndlessHighScoreDisplayProps {
  score: number;
}

const EndlessHighScoreDisplay: React.FC<EndlessHighScoreDisplayProps> = ({ score }) => {
  const panelClasses = 'bg-gradient-to-br from-white/10 to-white/5 border-white/20';

  return (
    <div className={`h-10 flex items-center justify-center ${panelClasses} backdrop-blur-sm border px-4 sm:px-6 shadow-bevel-inner rounded-lg animate-appear`} style={{animationDelay: '0.5s'}}>
      <span className={`text-lg sm:text-xl font-bold text-brand-warning`}>
        🌙{score}
      </span>
    </div>
  );
};

export default React.memo(EndlessHighScoreDisplay);