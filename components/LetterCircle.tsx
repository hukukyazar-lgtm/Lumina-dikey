import React, { useMemo } from 'react';
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
}

const LetterCircle: React.FC<LetterCircleProps> = ({ word, difficulty, level, gameMode, trophyCount, animationClass, animationDurationValue, activeTheme, isSpecialCube, isExiting = false }) => {
  const letters = word.split('');
  const radius = 100; // Radius of the circle on which cubes are placed
  const cubeSize = 56; // Size of each individual letter cube

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

  const finalAnimationClass = isSpecialCube ? '' : (animationClass || internalAnimationClass);
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

          const animationDelay = '0s, 0.8s, 0.8s';

          const transform = isNoviceMode
            ? `rotateY(${angleDeg}deg) translateZ(${radius}px) rotateY(180deg)`
            : `rotateY(${angleDeg}deg) translateZ(${radius}px)`;

          return (
            <div
              key={`${word}-${index}`}
              className="absolute w-full h-full flex justify-center items-center"
              style={{
                transform: transform,
                transformStyle: 'preserve-3d',
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const containerAnimation = isExiting ? 'animate-fly-away' : 'animate-circle-enter';

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