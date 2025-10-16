import React from 'react';

interface GoldCoinIconProps {
  className?: string;
}

const GoldCoinIcon: React.FC<GoldCoinIconProps> = ({ className }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" // It's decorative
    >
      <defs>
        <radialGradient id="gold-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>
      </defs>
      {/* Main coin body */}
      <circle cx="12" cy="12" r="11.5" fill="url(#gold-gradient)" stroke="#DAA520" strokeWidth="1"/>
      {/* Inner bevel */}
      <circle cx="12" cy="12" r="9" fill="transparent" stroke="#B8860B" strokeWidth="1.5"/>
      {/* Letter 'L' */}
      <text 
        x="50%" 
        y="50%" 
        dominantBaseline="central" 
        textAnchor="middle" 
        fill="#4a2c00" 
        fontSize="12" 
        fontFamily="'Orbitron', sans-serif" 
        fontWeight="900"
      >
        L
      </text>
    </svg>
  );
};

export default GoldCoinIcon;
