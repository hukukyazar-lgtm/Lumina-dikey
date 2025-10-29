import React, { useMemo } from 'react';

interface LetterCubeProps {
  letter?: string;
  icon?: React.ReactNode;
  size: number;
  animationDelay: string;
  faceClassName?: string;
  noContent?: boolean;
  disableContentAnimation?: boolean;
  activeTheme?: string; // Prop name clarified
  isSpecialCube?: boolean;
  speed?: number;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}

const LetterCube: React.FC<LetterCubeProps> = ({ letter, icon, size, animationDelay, faceClassName, noContent, disableContentAnimation = false, activeTheme = 'default', isSpecialCube, speed, isCorrect, isIncorrect }) => {
  const translateZ = size / 2;

  // Generate random visual properties once per cube instance.
  // The useMemo hook ensures these values are calculated only when the component mounts.
  // Since the parent LetterCircle component gets a new key for each word, these cubes
  // will re-mount and get new random values for each question.
  const randomValues = useMemo(() => {
    const selfRotateAnimations = [
        'animate-self-rotate-x',
        'animate-self-rotate-y',
        'animate-self-rotate-z',
        'animate-self-rotate-xy',
        'animate-none'
    ];
    
    return {
      opacity: Math.random() * 0.4 + 0.6, // Opacity from 0.6 to 1.0
      borderWidth: Math.floor(Math.random() * 3) + 1, // Border width from 1px to 3px
      selfRotationClass: selfRotateAnimations[Math.floor(Math.random() * selfRotateAnimations.length)],
      selfRotationDuration: Math.random() * 10 + 8, // Duration from 8s to 18s
    };
  }, []);


  if (isSpecialCube) {
    const contentSize = Math.floor(size * 0.65);
    const specialFaceStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backfaceVisibility: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${contentSize}px`,
        fontWeight: 'bold',
        borderWidth: '2px',
        borderStyle: 'solid',
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(26, 14, 42, 0.4) 80%)',
        borderRadius: '8px',
        color: 'var(--brand-quaternary)',
    };
    const specialSymbolStyle: React.CSSProperties = {
        textShadow: '0 0 8px var(--brand-accent-secondary), 0 0 16px var(--brand-accent-secondary-glow)',
    };

    const faces = [
      { transform: `rotateY(0deg) translateZ(${translateZ}px)`, content: letter },
      { transform: `rotateY(180deg) translateZ(${translateZ}px)`, content: '✧' },
      { transform: `rotateX(90deg) translateZ(${translateZ}px)`, content: '✦' },
      { transform: `rotateX(-90deg) translateZ(${translateZ}px)`, content: '⊹' },
      { transform: `rotateY(-90deg) translateZ(${translateZ}px)`, content: '※' },
      { transform: `rotateY(90deg) translateZ(${translateZ}px)`, content: '✢' },
    ];

    return (
        <div className="relative" style={{width: `${size}px`, height: `${size}px`, transformStyle: 'preserve-3d'}}>
            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d', animation: `self-rotate ${speed}s linear infinite` }}>
              {faces.map((face, index) => (
                <div key={index} className="animate-holographic-border-pulse" style={{...specialFaceStyle, transform: face.transform }}>
                  <span style={specialSymbolStyle}>{face.content}</span>
                </div>
              ))}
            </div>
        </div>
    );
  }


  const contentSize = Math.floor(size * 0.65);

  const faces = [
    { name: 'front', transform: `rotateY(0deg) translateZ(${translateZ}px)` },
    { name: 'right', transform: `rotateY(90deg) translateZ(${translateZ}px)` },
    { name: 'back', transform: `rotateY(180deg) translateZ(${translateZ}px)` },
    { name: 'left', transform: `rotateY(-90deg) translateZ(${translateZ}px)` },
    { name: 'top', transform: `rotateX(90deg) translateZ(${translateZ}px)` },
    { name: 'bottom', transform: `rotateX(-90deg) translateZ(${translateZ}px)` },
  ];

  const baseFaceClasses = faceClassName || 'face-theme-dynamic';
  const feedbackClass = isCorrect ? 'face-correct' : (isIncorrect ? 'face-incorrect' : '');

  const content = icon ? (
    <div
      className="text-brand-light"
      style={{
        width: `${contentSize}px`,
        height: `${contentSize}px`,
      }}
    >
      {icon}
    </div>
  ) : (
    <span
      className={`font-black ${!disableContentAnimation ? 'animate-appear' : ''}`}
      style={{
        fontSize: `${contentSize}px`,
        animationDelay: !disableContentAnimation ? animationDelay : undefined,
      }}
    >
      {letter}
    </span>
  );

  const selfRotationClass = (isCorrect || isIncorrect) ? 'animate-none' : randomValues.selfRotationClass;

  return (
    <div
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* This new inner div handles the individual rotation of each cube */}
      <div
          className={`relative w-full h-full ${selfRotationClass}`}
          style={{
              transformStyle: 'preserve-3d',
              animationDuration: `${randomValues.selfRotationDuration}s`,
          }}
      >
        {faces.map((face, index) => {
            const faceStyle: React.CSSProperties = {
              width: `${size}px`,
              height: `${size}px`,
              transform: face.transform,
              backfaceVisibility: 'hidden',
              boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)',
              opacity: (isCorrect || isIncorrect) ? 1 : randomValues.opacity,
              borderWidth: `${randomValues.borderWidth}px`,
            };

            return (
              <div
                key={index}
                className={`absolute flex items-center justify-center rounded-lg ${baseFaceClasses} ${feedbackClass}`}
                style={faceStyle}
              >
                {!noContent && content}
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default React.memo(LetterCube);