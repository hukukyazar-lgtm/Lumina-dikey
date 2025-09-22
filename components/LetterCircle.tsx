import React, { useMemo } from 'react';
import type { Difficulty } from '../types';
import LetterCube from './LetterCube';
import { difficultySettings } from '../config';

interface LetterCircleProps {
  word: string;
  difficulty: Difficulty;
  level: number;
  gameMode: 'progressive' | 'practice' | 'duel' | 'endless' | null;
  questionNumberInDifficulty: number;
  trophyCount: number;
  animationClass?: string;
  animationDurationValue?: number;
}

const LetterCircle: React.FC<LetterCircleProps> = ({ word, difficulty, level, gameMode, questionNumberInDifficulty, trophyCount, animationClass, animationDurationValue }) => {
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

    // In progressive mode, if it's the second question of the same difficulty (progress is 1),
    // increase speed further (decrease duration by dividing by 2.25).
    if (gameMode === 'progressive' && questionNumberInDifficulty === 1) {
      return trophyAdjustedDuration / 2.25;
    }
    
    return trophyAdjustedDuration;
  }, [difficulty, level, gameMode, questionNumberInDifficulty, trophyCount]);

  const finalAnimationClass = animationClass || internalAnimationClass;
  const finalAnimationDuration = animationDurationValue || internalAnimationDuration;

  const animationContainer = (
    <div
      className={`relative w-full h-full ${finalAnimationClass}`}
      style={{
        transformStyle: 'preserve-3d',
        animationDuration: `${finalAnimationDuration}s`,
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
              <LetterCube letter={letter} size={cubeSize} animationDelay={animationDelay} />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative w-72 h-72 flex items-center justify-center animate-circle-enter" style={{ perspective: '1000px' }}>
      {/* Timer is now rendered in GamePage.tsx to prevent re-renders */}
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