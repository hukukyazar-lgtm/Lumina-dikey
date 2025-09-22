import React from 'react';

interface LetterCubeProps {
  letter?: string;
  icon?: React.ReactNode;
  size: number;
  animationDelay: string;
  faceClassName?: string;
  noContent?: boolean;
  disableContentAnimation?: boolean;
}

const LetterCube: React.FC<LetterCubeProps> = ({ letter, icon, size, animationDelay, faceClassName, noContent, disableContentAnimation = false }) => {
  const translateZ = size / 2;
  const contentSize = Math.floor(size * 0.65);

  const faces = [
    { name: 'front', transform: `rotateY(0deg) translateZ(${translateZ}px)` },
    { name: 'right', transform: `rotateY(90deg) translateZ(${translateZ}px)` },
    { name: 'back', transform: `rotateY(180deg) translateZ(${translateZ}px)` },
    { name: 'left', transform: `rotateY(-90deg) translateZ(${translateZ}px)` },
    { name: 'top', transform: `rotateX(90deg) translateZ(${translateZ}px)` },
    { name: 'bottom', transform: `rotateX(-90deg) translateZ(${translateZ}px)` },
  ];

  const faceClasses = faceClassName || 'bg-black/20 backdrop-blur-sm border border-brand-accent-secondary/40';

  const content = icon ? (
    <div
      className="text-brand-light"
      style={{
        width: `${contentSize}px`,
        height: `${contentSize}px`,
        filter: 'drop-shadow(0 0 8px var(--brand-accent))',
      }}
    >
      {icon}
    </div>
  ) : (
    <span
      className={`font-extrabold text-brand-light ${!disableContentAnimation ? 'animate-letter-intro-float-hue' : ''}`}
      style={{
        fontSize: `${contentSize}px`,
        textShadow: '0 0 8px var(--brand-accent), 0 0 16px var(--brand-accent)',
        animationDelay: !disableContentAnimation ? animationDelay : undefined,
      }}
    >
      {letter}
    </span>
  );

  return (
    <div
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transformStyle: 'preserve-3d',
      }}
    >
      {faces.map((face, index) => (
        <div
          key={index}
          className={`absolute flex items-center justify-center rounded-lg shadow-inner-strong ${faceClasses}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transform: face.transform,
            backfaceVisibility: 'hidden',
          }}
        >
          {!noContent && content}
        </div>
      ))}
    </div>
  );
};

export default React.memo(LetterCube);