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

    // FIX: Replaced 'menu' with 'practiceMenu' which is a valid GameStatus.
    // The previous value 'menu' was not a defined status, causing a type error.
    // 'practiceMenu' is the status used when displaying the difficulty selection menu, which aligns with the component's logic.
    // Hide the main header container on the primary game screens (practice, progressive, endless)
    // as they will now have their own integrated header elements.
    const showHeader = gameStatus !== 'practiceMenu' && gameMode !== 'practice' && gameMode !== 'progressive' && gameMode !== 'endless';

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Money Display */}
            {/* FIX: Replaced 'menu' with 'practiceMenu' to match a valid GameStatus type. */}
            {gameStatus === 'practiceMenu' && (
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