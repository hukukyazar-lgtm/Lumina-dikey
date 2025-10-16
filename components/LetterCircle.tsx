import React, { useMemo, useState, useEffect } from 'react';
import type { Difficulty } from '../types';
import LetterCube from './LetterCube';
import { difficultySettings, ENDLESS_TIMER } from '../config';

interface LetterCircleProps {
  word: string;
  difficulty: Difficulty;
  level: number;
  gameMode: 'progressive' | 'practice' | 'duel' | 'endless' | null;
  trophyCount: number;
  animationClass?: string;
  animationDurationValue?: number;
  activeTheme?: string;
  isSpecialCube?: boolean;
  isExiting?: boolean;
  customCubeTextureUrl?: string | null;
  showCorrectAnimation?: boolean;
  showIncorrectAnimation?: boolean;
}

const LetterCircle: React.FC<LetterCircleProps> = ({ word, difficulty, level, gameMode, trophyCount, animationClass, animationDurationValue, activeTheme, isSpecialCube, isExiting = false, customCubeTextureUrl, showCorrectAnimation = false, showIncorrectAnimation = false }) => {
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const letters = word.split('');
  const radius = 100; // Radius of the circle on which cubes are placed
  const originalCubeSize = 56; // Default size of each individual letter cube

  // Dynamically calculate cube size for the horizontal layout to prevent overflow.
  const { dynamicCubeSize, dynamicLetterSpacing } = useMemo(() => {
    const maxLayoutWidth = viewportWidth * 0.9; // Use 90% of viewport width
    const wordLength = letters.length;
    if (wordLength === 0) return { dynamicCubeSize: originalCubeSize, dynamicLetterSpacing: 8 };

    // The total width is approximately wordLength * (cubeSize + letterSpacing).
    // Let's define spacing as a ratio of the size to maintain proportion.
    const spacingRatio = 0.15; // e.g., spacing is 15% of cube size
    // Total width ≈ wordLength * cubeSize * (1 + spacingRatio)
    const calculatedSize = maxLayoutWidth / (wordLength * (1 + spacingRatio));

    // We only want to shrink the cubes, not make them larger than their default size.
    const newSize = Math.min(originalCubeSize, calculatedSize);
    const newSpacing = newSize * spacingRatio;

    return { dynamicCubeSize: newSize, dynamicLetterSpacing: newSpacing };
  }, [letters.length, viewportWidth]);


  const randomStartOffset = useMemo(() => Math.random() * 360, []);

  const internalAnimationClass = useMemo(() => {
    switch (difficulty) {
      case 'Novice': return 'animate-spin-novice';
      case 'Apprentice': return 'animate-spin-apprentice';
      case 'Adept': return 'animate-spin-adept';
      case 'Skilled': return 'animate-spin-skilled';
      case 'Seasoned': return 'animate-spin-seasoned';
      case 'Veteran': return 'animate-spin-veteran';
      case 'Master': return 'animate-tumble-master';
      case 'Grandmaster': return 'animate-tumble-grandmaster';
      case 'Legend': return 'animate-tumble-legend';
      case 'Mythic': return 'animate-tumble-mythic';
      default: return 'animate-spin-novice';
    }
  }, [difficulty]);

  const internalAnimationDuration = useMemo(() => {
    const baseDuration = difficultySettings[difficulty].baseAnimationDuration;
    // Speed increases by 10% per level, so duration decreases.
    const levelAdjustedDuration = baseDuration / (1 + 0.1 * (level - 1));

    // Speed increases by 15% for each trophy earned.
    const trophySpeedFactor = 1 + (trophyCount * 0.15);
    const trophyAdjustedDuration = levelAdjustedDuration / trophySpeedFactor;
    
    return trophyAdjustedDuration;
  }, [difficulty, level, trophyCount]);

  const finalAnimationClass = (showCorrectAnimation || showIncorrectAnimation) ? '' : (isSpecialCube ? '' : (animationClass || internalAnimationClass));
  const finalAnimationDuration = animationDurationValue || internalAnimationDuration;

  const animationContainer = (
    <div
      key={word} // FIX: Add key here to force re-mount and restart animation
      className={`relative w-full h-full ${finalAnimationClass}`}
      style={{
        transformStyle: 'preserve-3d',
        animationDuration: isSpecialCube ? undefined : `${finalAnimationDuration}s`,
      }}
    >
      <div className="absolute w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {letters.map((letter, index) => {
          const angleDeg = (index / letters.length) * 360 + randomStartOffset;
          const isNoviceMode = difficulty === 'Novice';
          const isHorizontalLayout = showCorrectAnimation || showIncorrectAnimation;

          const animationDelay = '0s, 0.8s, 0.8s';

          // Use dynamic size for horizontal layout, original size otherwise
          const cubeSize = isHorizontalLayout ? dynamicCubeSize : originalCubeSize;
          const letterSpacing = isHorizontalLayout ? dynamicLetterSpacing : 8;

          const transform = isHorizontalLayout
            ? `translateX(${(index - (letters.length - 1) / 2) * (cubeSize + letterSpacing)}px)`
            : isNoviceMode
              ? `rotateY(${angleDeg}deg) translateZ(${radius}px) rotateY(180deg)`
              : `rotateY(${angleDeg}deg) translateZ(${radius}px)`;

          return (
            <div
              key={`${word}-${index}`}
              className="absolute w-full h-full flex justify-center items-center transition-transform duration-700 ease-out"
              style={{
                transform: transform,
                transformStyle: 'preserve-3d',
                transitionDelay: (showCorrectAnimation || showIncorrectAnimation) ? `${index * 60}ms` : '0ms',
              }}
            >
              {/* FIX: Changed prop 'theme' to 'activeTheme' to match the LetterCube component's props. */}
              <LetterCube 
                letter={letter} 
                size={cubeSize} 
                animationDelay={animationDelay} 
                activeTheme={activeTheme}
                isSpecialCube={isSpecialCube}
                speed={finalAnimationDuration}
                customTextureUrl={customCubeTextureUrl}
                isCorrect={showCorrectAnimation}
                isIncorrect={showIncorrectAnimation}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const containerAnimation = isExiting && !showCorrectAnimation && !showIncorrectAnimation ? 'animate-fly-away' : 'animate-circle-enter';

  return (
    <div className={`relative w-72 h-72 flex items-center justify-center ${containerAnimation}`} style={{ perspective: '1000px' }}>
      {difficulty === 'Novice' && gameMode !== 'endless' ? (
        <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg)', width: '100%', height: '100%' }}>
          {animationContainer}
        </div>
      ) : (
        animationContainer
      )}
    </div>
  );
};

export default React.memo(LetterCircle);