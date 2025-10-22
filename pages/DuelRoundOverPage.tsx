import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { soundService } from '../services/soundService';
import PressableButton from '../components/PressableButton';

interface DuelRoundOverPageProps {
    roundNumber: number;
    roundWinner: 1 | 2 | 'draw' | null;
    player1Score: number;
    player2Score: number;
    roundWinsCount: { player1: number, player2: number };
    onContinue: () => void;
}

const DuelRoundOverPage: React.FC<DuelRoundOverPageProps> = ({ roundNumber, roundWinner, player1Score, player2Score, roundWinsCount, onContinue }) => {
    const { t } = useLanguage();

    const handleContinueClick = () => {
        soundService.play('start');
        onContinue();
    };
    
    const panelClasses = 'bg-gradient-to-br from-white/10 to-white/5';

    const getTitle = () => {
        if (roundWinner === 'draw') {
            return t('roundDraw');
        }
        if (roundWinner) {
            return t('roundWinner', { playerNumber: roundWinner });
        }
        return t('roundComplete'); // Fallback
    };
    
    const getButtonText = () => {
        if (roundWinsCount.player1 >= 3 || roundWinsCount.player2 >= 3) {
            return t('finalResults');
        }
        if (roundWinsCount.player1 === 2 && roundWinsCount.player2 === 2) {
            return t('tieBreakerButton');
        }
        return t('nextRound');
    }

    const titleColor = roundWinner === 1 ? 'text-brand-accent-secondary' : roundWinner === 2 ? 'text-brand-accent' : 'text-brand-warning';
    const borderColor = roundWinner === 1 ? 'border-brand-accent-secondary' : roundWinner === 2 ? 'border-brand-accent' : 'border-brand-warning';
    const shadowColor = roundWinner === 1 ? 'shadow-brand-accent-secondary/30' : roundWinner === 2 ? 'shadow-brand-accent/30' : 'shadow-brand-warning/30';

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className={`w-full max-w-lg text-center p-8 ${panelClasses} backdrop-blur-sm border-2 ${borderColor} rounded-2xl shadow-2xl ${shadowColor}`}>
                <h3 className="text-2xl font-black text-brand-light/70">{t('roundTitle', { round: roundNumber })}</h3>
                <h2 className={`text-5xl sm:text-6xl font-black ${titleColor} my-4 animate-correct-pop`}>
                    {getTitle()}
                </h2>
                
                <div className="text-lg text-brand-light/80 mb-2">{t('roundScore')}</div>
                <div className="flex justify-around items-center mb-6 bg-brand-secondary/30 p-4 rounded-xl">
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-brand-light/80">{t('player1')}</span>
                        <span className="text-4xl font-black text-brand-accent-secondary">{player1Score}</span>
                    </div>
                    <div className="w-px h-16 bg-brand-light/20"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-brand-light/80">{t('player2')}</span>
                        <span className="text-4xl font-black text-brand-accent">{player2Score}</span>
                    </div>
                </div>

                <div className="text-lg text-brand-light/80 mb-2">{t('overallScore')}</div>
                 <div className="flex justify-around items-center mb-8 bg-brand-secondary/30 p-4 rounded-xl">
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-brand-light/80">{t('player1')}</span>
                        <span className="text-4xl font-black text-brand-accent-secondary">{roundWinsCount.player1}</span>
                    </div>
                    <div className="w-px h-16 bg-brand-light/20"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-black text-brand-light/80">{t('player2')}</span>
                        <span className="text-4xl font-black text-brand-accent">{roundWinsCount.player2}</span>
                    </div>
                </div>

                <PressableButton
                    onClick={handleContinueClick}
                    color="secondary"
                    size="large"
                    className="w-full max-w-xs"
                >
                    <span>{getButtonText()}</span>
                </PressableButton>
            </div>
        </div>
    );
};

export default DuelRoundOverPage;
