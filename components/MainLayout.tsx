import React from 'react';
import Logo from './Logo';
import { useLanguage } from './LanguageContext';
import { GameStatus, Difficulty, GameMode } from '../types';
import { difficultyEmojis } from '../config';
import MoneyDisplay from './MoneyDisplay';

interface MainLayoutProps {
  children: React.ReactNode;
  gameStatus: GameStatus;
  gameMode: GameMode | null;
  onOpenLeaderboard: () => void;
  onReturnToMenu: () => void;
  difficulty: Difficulty | null;
  gameMoney: number;
  trophyCount: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, gameStatus, gameMode, onOpenLeaderboard, onReturnToMenu, difficulty, gameMoney, trophyCount }) => {
    const { t } = useLanguage();

    // FIX: Removed unused 'isGameActive' variable that caused a type error because 'login' is not a valid GameStatus.
    // Hide the main header container on the primary game screens (practice, progressive, endless)
    // as they will now have their own integrated header elements.
    const showHeader = gameStatus !== 'menu' && gameMode !== 'practice' && gameMode !== 'progressive' && gameMode !== 'endless';

    return (
        <div className="relative w-full h-full flex flex-col">
            <button
                onClick={onOpenLeaderboard}
                aria-label={t('leaderboard')}
                className="group relative top-2 left-2 sm:top-4 sm:left-4 z-50 p-2 rounded-lg transition-all duration-150 ease-in-out hover:bg-white/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-accent-secondary/50"
            >
                <Logo />
                {trophyCount > 0 && gameStatus === 'menu' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-brand-primary border-2 border-yellow-400 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
                        <span className="text-xs sm:text-sm font-bold text-yellow-300" style={{ textShadow: '0 0 5px black' }}>
                            x{trophyCount}
                        </span>
                    </div>
                )}
            </button>
            {/* Money Display */}
            {gameStatus === 'menu' && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
                    <MoneyDisplay money={gameMoney} />
                </div>
            )}
            
            {showHeader && (
                <header className="w-full flex justify-center items-center p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                        <Logo />
                        {difficulty && (
                            <span className="text-2xl" title={t(difficulty.toLowerCase() as any)}>
                                {difficultyEmojis[difficulty]}
                            </span>
                        )}
                    </div>
                </header>
            )}
            
            <main className="w-full h-full flex-grow flex flex-col items-center">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;