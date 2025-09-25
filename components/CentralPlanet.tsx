import React from 'react';
import { useLanguage } from './LanguageContext';

interface CentralPlanetProps {
  imageUrl?: string;
  name?: string;
  distance?: string;
  onClose: () => void;
  onPlayEndless: () => void;
}

const CentralPlanet: React.FC<CentralPlanetProps> = ({ imageUrl, name, distance, onClose, onPlayEndless }) => {
  const { t } = useLanguage();
  const isMars = name === t('planet_mars_name');

  const sphereStyle: React.CSSProperties = {
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    position: 'relative',
    backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none',
    backgroundColor: imageUrl ? 'transparent' : '#1d1b31',
    backgroundSize: isMars ? '160%' : 'cover',
    backgroundPosition: 'center',
    filter: 'drop-shadow(0 0 25px var(--brand-accent-secondary-glow)) drop-shadow(0 0 10px rgba(255,255,255,0.5))',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const overlayStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    position: 'absolute',
    top: 0,
    left: 0,
    // This radial gradient simulates a light source, adding to the 3D effect.
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(224,224,224,0.05))',
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-appear"
        onClick={onClose}
        aria-label="Close planet view"
      />
      
      {/* Wrapper for planet and info */}
      <div 
        className="relative flex flex-col items-center gap-4 animate-feedback-pop"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Planet Sphere */}
        <div
          className={`relative animate-star-pulse`}
          style={sphereStyle}
          onClick={onClose}
          role="button"
          aria-label="Planet image, click to close"
        >
          <div style={overlayStyle} />
        </div>
        
        {/* Planet Info */}
        {(name || distance) && (
            <div className="text-center cursor-default">
                {name && <h2 className="text-3xl font-bold text-white tracking-wider" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{name}</h2>}
                {distance && <p className="text-lg text-brand-light/80" style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>{distance}</p>}
            </div>
        )}

        {/* Play Button */}
        <button
          onClick={onPlayEndless}
          className={`
              w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full mt-4
              transform transition-all duration-150 ease-in-out
              backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none
              bg-brand-warning/50 border-brand-warning/80 shadow-[0_4px_0_var(--brand-warning-shadow)] 
              hover:bg-brand-warning/70 hover:shadow-[0_6px_0_var(--brand-warning-shadow)] 
              active:translate-y-1 active:shadow-[0_2px_0_var(--brand-warning-shadow)]
          `}
        >
          {t('play')}
        </button>
      </div>
    </div>
  );
};

export default CentralPlanet;