import React, { useEffect, useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { soundService } from '../services/soundService';
import LetterCube from '../components/LetterCube';
import type { GameMode } from '../types';

interface GameOverPageProps {
    score: number;
    level: number;
    missedWord: string | null;
    onReturnToMenu: () => void;
    gameMode: GameMode;
    gameMoney: number;
}

const useCountUp = (target: number, duration = 1500) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const end = target;
        if (start === end) {
            setCount(end);
            return;
        };

        const totalFrames = duration / (1000 / 60);
        let increment = (end - start) / totalFrames;
        
        if (increment === 0) {
            setCount(end);
            return;
        }

        const counter = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(counter);
            } else {
                setCount(Math.ceil(start));
            }
        }, 16);

        return () => clearInterval(counter);
    }, [target, duration]);
    return count;
};

const GameOverPage: React.FC<GameOverPageProps> = ({ score, level, missedWord, onReturnToMenu, gameMode, gameMoney }) => {
    const { t, theme } = useLanguage();
    const finalScore = useCountUp(score);
    const finalMoney = useCountUp(gameMoney);

    const handleReturnClick = () => {
        soundService.play('click');
        onReturnToMenu();
    };

    // Logic to dynamically size cubes for long words to prevent overflow.
    const CUBE_GAP = 8; // from `gap-2`
    // Available width calculation: max-w-md (448px) - parent p-8 (64px) - self p-4 (32px)
    const MAX_CONTENT_WIDTH = 448 - (2 * 32) - (2 * 16); // = 352px
    let cubeSize = 48; // Default size

    if (missedWord) {
        const wordLength = missedWord.length;
        const requiredWidth = (wordLength * cubeSize) + ((wordLength - 1) * CUBE_GAP);
        if (requiredWidth > MAX_CONTENT_WIDTH) {
            // Recalculate cubeSize to fit within the container
            const totalGapWidth = (wordLength - 1) * CUBE_GAP;
            cubeSize = Math.floor((MAX_CONTENT_WIDTH - totalGapWidth) / wordLength);
        }
    }
    
    const isEndless = gameMode === 'endless';

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className={`w-full max-w-md text-center p-8 bg-brand-primary backdrop-blur-sm border-2 ${isEndless ? 'border-brand-warning' : 'border-brand-accent'} rounded-2xl shadow-2xl ${isEndless ? 'shadow-brand-warning/20' : 'shadow-brand-accent/20'}`}>
                <h2 className={`text-5xl sm:text-6xl font-extrabold mb-4 animate-shake-horizontal ${isEndless ? 'text-brand-warning' : 'text-brand-accent'}`}>
                    {isEndless ? t('runEnded') : t('gameOver')}
                </h2>
                
                {!isEndless && missedWord && (
                    <div className="w-full mb-6 bg-brand-secondary/50 rounded-lg p-4 border border-brand-warning/50 animate-appear flex flex-col items-center gap-3" style={{ animationDelay: '200ms' }}>
                        <p className="text-base sm:text-lg text-brand-light/80">{t('theCorrectWordWas')}</p>
                        <div className="flex justify-center items-center gap-2" style={{ perspective: '800px' }}>
                            {missedWord.split('').map((letter, index) => (
                                <LetterCube
                                    key={index}
                                    letter={letter}
                                    size={cubeSize}
                                    animationDelay={`${0.4 + index * 0.1}s, ${1.2 + index * 0.2}s, ${1.2 + index * 0.2}s`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-center items-baseline gap-6 mb-8">
                    {isEndless ? (
                        <div className="flex-1">
                            <p className="text-lg sm:text-xl text-brand-light/80">{t('totalEarnings')}</p>
                            <p className="text-4xl sm:text-5xl font-bold text-brand-light">
                                <span className="inline-block mr-2">☄️</span>{finalMoney}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1">
                                <p className="text-lg sm:text-xl text-brand-light/80">{t('finalScore')}</p>
                                <p className="text-4xl sm:text-5xl font-bold text-brand-accent-secondary">{finalScore}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-lg sm:text-xl text-brand-light/80">{t('level')}</p>
                                <p className="text-4xl sm:text-5xl font-bold text-brand-accent-secondary">{level}</p>
                            </div>
                        </>
                    )}
                </div>
                <button
                    onClick={handleReturnClick}
                    className={`
                        w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none
                        ${isEndless 
                            ? 'bg-brand-warning/50 border-brand-warning/80 shadow-[0_4px_0_var(--brand-warning-shadow)] hover:bg-brand-warning/70 hover:shadow-[0_6px_0_var(--brand-warning-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-warning-shadow)]' 
                            : 'bg-brand-accent/50 border-brand-accent/80 shadow-[0_4px_0_var(--brand-accent-shadow)] hover:bg-brand-accent/70 hover:shadow-[0_6px_0_var(--brand-accent-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-shadow)]'
                        }
                    `}
                >
                    {t('returnToMenu')}
                </button>
            </div>
        </div>
    );
};

export default GameOverPage;