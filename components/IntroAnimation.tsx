import React from 'react';
import Logo from './Logo';
import LetterCube from './LetterCube';

const IntroAnimation: React.FC = () => {
  const introWord = 'LUMINA';
  const letters = introWord.split('');
  const radius = 112;
  const cubeSize = 64;

  return (
    <div className="fixed inset-0 bg-brand-bg flex flex-col items-center justify-center animate-intro-sequence" role="presentation">
      {/* Logo appears after a short delay */}
      <div className="absolute animate-appear" style={{ animationDelay: '200ms' }}>
        <Logo />
      </div>

      {/* Letters appear after logo, with a spin */}
      <div 
        className="relative w-80 h-80 flex items-center justify-center animate-appear" 
        style={{ perspective: '1200px', animationDelay: '500ms' }}
      >
        <div
          className="relative w-full h-full animate-intro-spin"
          style={{ 
            transformStyle: 'preserve-3d', 
            animationDelay: '800ms'
          }}
        >
          {letters.map((letter, index) => {
            const angleDeg = (index / letters.length) * 360;
            // Have them face outwards for variety
            const transform = `rotateY(${angleDeg}deg) translateZ(${radius}px)`;

            return (
              <div
                key={index}
                className="absolute w-full h-full flex justify-center items-center"
                style={{
                  transform: transform,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Stagger the letter cube's built-in intro animation */}
                <LetterCube letter={letter} size={cubeSize} animationDelay={`${0.8 + index * 0.15}s, ${1.8 + index * 0.15}s, ${1.8 + index * 0.15}s`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;