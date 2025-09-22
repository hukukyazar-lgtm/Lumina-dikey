import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { soundService } from '../services/soundService';

interface DuelGameOverPageProps {
    winner: 1 | 2 | 'draw' | null;
    player1RoundWins: number;
    player2RoundWins: number;
    onPlayAgain: () => void;
    onReturnToMenu: () => void;
}

const DuelGameOverPage: React.FC<DuelGameOverPageProps> = ({ winner, player1RoundWins, player2RoundWins, onPlayAgain, onReturnToMenu }) => {
    const { t } = useLanguage();

    const handlePlayAgainClick = () => {
        soundService.play('start');
        onPlayAgain();
    };

    const handleReturnClick = () => {
        soundService.play('click');
        onReturnToMenu();
    };
    
    const panelClasses = 'bg-gradient-to-br from-white/10 to-white/5';

    const getTitle = () => {
        if (winner === 'draw') {
            return t('playerWinsDraw');
        }
        if (winner) {
            return t('playerWins', { playerNumber: winner });
        }
        return t('gameOver'); // Fallback
    };
    
    const titleColor = winner === 1 ? 'text-brand-accent-secondary' : winner === 2 ? 'text-brand-accent' : 'text-brand-warning';

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className={`w-full max-w-lg text-center p-8 ${panelClasses} backdrop-blur-sm border-2 ${winner === 1 ? 'border-brand-accent-secondary' : winner === 2 ? 'border-brand-accent' : 'border-brand-warning'} rounded-2xl shadow-2xl ${winner === 1 ? 'shadow-brand-accent-secondary/30' : winner === 2 ? 'shadow-brand-accent/30' : 'shadow-brand-warning/30'}`}>
                <h2 className={`text-5xl sm:text-6xl font-extrabold ${titleColor} mb-6 animate-correct-pop`}>
                    {getTitle()}
                </h2>
                
                <div className="flex justify-around items-center mb-8 bg-brand-secondary/30 p-4 rounded-xl">
                    {/* Player 1 Score */}
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-brand-light/80">{t('player1')}</span>
                        <span className="text-4xl font-bold text-brand-accent-secondary">{player1RoundWins}</span>
                    </div>
                    
                    {/* Separator */}
                    <div className="w-px h-16 bg-brand-light/20"></div>

                    {/* Player 2 Score */}
                     <div className="flex flex-col items-center">
                        <span className="text-lg font-semibold text-brand-light/80">{t('player2')}</span>
                        <span className="text-4xl font-bold text-brand-accent">{player2RoundWins}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={handleReturnClick}
                        className="
                            w-full text-center text-lg sm:text-xl font-extrabold p-3 rounded-full
                            transform transition-all duration-150 ease-in-out
                            backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-light
                            bg-brand-secondary border-brand-light/20 shadow-[0_4px_0_var(--bevel-shadow-dark)]
                            hover:bg-brand-light/10 hover:shadow-[0_6px_0_var(--bevel-shadow-dark)]
                            active:translate-y-1 active:shadow-[0_2px_0_var(--bevel-shadow-dark)]
                        "
                    >
                        {t('returnToMenu')}
                    </button>
                    <button
                        onClick={handlePlayAgainClick}
                        className="
                            w-full text-center text-lg sm:text-xl font-extrabold p-3 rounded-full
                            transform transition-all duration-150 ease-in-out
                            backdrop-blur-sm shadow-bevel-inner border text-brand-bg focus:outline-none
                            bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)]
                            hover:bg-brand-accent-secondary hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)]
                            active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)]
                        "
                    >
                        {t('playAgain')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DuelGameOverPage;