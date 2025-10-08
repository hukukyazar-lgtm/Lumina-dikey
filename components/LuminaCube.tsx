import React from 'react';

interface LuminaCubeProps {
  size?: number;
  animationClass?: string;
  animationDuration?: string;
  animationDelay?: string;
}

const LuminaCube: React.FC<LuminaCubeProps> = ({ 
  size = 84, 
  animationClass = 'animate-tumble-mythic', 
  animationDuration = '12s',
  animationDelay = '0s'
}) => {
  const cubeSize = size;
  const translateZ = cubeSize / 2;
  const contentSize = Math.floor(cubeSize * 0.75);

  const faces = [
    { letter: 'L', transform: `rotateY(0deg) translateZ(${translateZ}px)`, color: 'text-brand-accent' },
    { letter: 'U', transform: `rotateY(90deg) translateZ(${translateZ}px)`, color: 'text-brand-accent-secondary' },
    { letter: 'M', transform: `rotateY(180deg) translateZ(${translateZ}px)`, color: 'text-brand-warning' },
    { letter: 'I', transform: `rotateY(-90deg) translateZ(${translateZ}px)`, color: 'text-brand-tertiary' },
    { letter: 'N', transform: `rotateX(90deg) translateZ(${translateZ}px)`, color: 'text-brand-quaternary' },
    { letter: 'A', transform: `rotateX(-90deg) translateZ(${translateZ}px)`, color: 'text-brand-light' },
  ];
  
  const faceBaseClasses = 'absolute flex items-center justify-center rounded-md border border-white/10 bg-brand-primary backdrop-blur-sm';

  return (
    <div
      className={`relative ${animationClass}`}
      style={{
        width: `${cubeSize}px`,
        height: `${cubeSize}px`,
        transformStyle: 'preserve-3d',
        animationDuration: animationDuration,
        animationDelay: animationDelay,
      }}
    >
      {faces.map((face) => (
        <div
          key={face.letter}
          className={faceBaseClasses}
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: face.transform,
            backfaceVisibility: 'hidden',
          }}
        >
          <span
            className={`font-extrabold ${face.color}`}
            style={{
              fontSize: `${contentSize}px`,
              textShadow: `0 0 8px currentColor, 0 0 16px currentColor`,
              transform: face.letter === 'M' ? 'rotateY(180deg)' : 'none',
            }}
          >
            {face.letter}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LuminaCube;