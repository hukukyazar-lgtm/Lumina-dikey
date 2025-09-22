import React from 'react';
import { useLanguage } from './LanguageContext';
import { Difficulty, LevelProgress } from '../types';
import { difficultyProgression, difficultyEmojis } from '../config';

interface LevelProgressTrackerProps {
  progress: LevelProgress;
}

const LevelProgressTracker: React.FC<LevelProgressTrackerProps> = React.memo(({ progress }) => {
    const { t } = useLanguage();

    const renderGateway = (difficultyForUnlock: Difficulty) => {
        const isUnlocked = progress[difficultyForUnlock] >= 1;
        return (
            <div 
                className="relative flex items-center justify-center text-sm sm:text-base md:text-lg h-4 sm:h-5 md:h-6"
                title={t('memoryGameTitle')}
            >
                <span className={`transition-all duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-75 animate-pulse-warning'}`}>
                    🕳️
                </span>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col items-center justify-between bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-0.5 sm:p-1 shadow-bevel-inner rounded-full"
             aria-label={t('levelProgress')}>
            {[...difficultyProgression].reverse().map(difficulty => {
                const isCompleted = progress[difficulty] >= 1;
                
                let styles = 'text-sm sm:text-base md:text-lg transition-all duration-300 ease-in-out';
                
                if (!isCompleted) {
                    styles += ' opacity-30 grayscale';
                } else {
                    styles += ' opacity-100';
                }

                const showGatewayBefore = difficulty === 'Mythic';
                const showGatewayAfter = difficulty === 'Veteran';

                return (
                    <React.Fragment key={difficulty}>
                        {showGatewayBefore && renderGateway(difficulty)}
                        <div className="relative flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                             title={`${difficulty}: ${isCompleted ? '1' : '0'}/1`}>
                            <span className={styles}>{difficultyEmojis[difficulty]}</span>
                            {isCompleted && (
                                <svg className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-brand-accent-secondary animate-correct-pop"
                                     style={{filter: 'drop-shadow(0 0 4px currentColor)'}}
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        {showGatewayAfter && renderGateway(difficulty)}
                    </React.Fragment>
                );
            })}
        </div>
    );
});

export default LevelProgressTracker;