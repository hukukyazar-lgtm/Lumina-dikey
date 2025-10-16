import React from 'react';

const GoldCoinStackIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="gold-gradient-stack" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>
      </defs>
      
      {/* Bottom coin */}
      <circle cx="12" cy="16" r="8" fill="url(#gold-gradient-stack)" stroke="#DAA520" strokeWidth="0.5"/>
      {/* Middle coin */}
      <circle cx="12" cy="12" r="8" fill="url(#gold-gradient-stack)" stroke="#DAA520" strokeWidth="0.5"/>
      {/* Top coin */}
      <circle cx="12" cy="8" r="8" fill="url(#gold-gradient-stack)" stroke="#DAA520" strokeWidth="0.5"/>
      <circle cx="12" cy="8" r="6" fill="transparent" stroke="#B8860B" strokeWidth="1"/>
      <text 
        x="50%" y="8" dominantBaseline="central" textAnchor="middle" fill="#4a2c00" 
        fontSize="7" fontFamily="'Orbitron', sans-serif" fontWeight="900">
        L
      </text>
    </svg>
  );
};

export default GoldCoinStackIcon;
