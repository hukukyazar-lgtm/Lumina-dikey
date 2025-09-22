import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 sm:gap-3 animate-logo-float" aria-label="Lumina">
      <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--brand-accent-secondary)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--brand-accent)', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g style={{ filter: 'url(#logo-glow)' }}>
            <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="url(#logo-grad-1)" strokeWidth="4"/>
            <path d="M18 16V32H30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      </svg>
      <span className="text-xl sm:text-2xl font-extrabold text-brand-light tracking-widest">LUMINA</span>
    </div>
  );
};

export default Logo;