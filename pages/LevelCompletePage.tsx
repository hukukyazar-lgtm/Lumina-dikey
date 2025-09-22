import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { soundService } from '../services/soundService';

interface LevelCompletePageProps {
    level: number;
    onContinue: () => void;
}

const LevelCompletePage: React.FC<LevelCompletePageProps> = ({ level, onContinue }) => {
    const { t } = useLanguage();

    const handleContinueClick = () => {
        soundService.play('start');
        onContinue();
    };

    const panelClasses = 'bg-gradient-to-br from-white/10 to-white/5';

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className={`text-center p-8 ${panelClasses} backdrop-blur-sm border-2 border-brand-accent-secondary rounded-2xl shadow-2xl shadow-brand-accent-secondary/30`}>
                <h2 className="text-5xl sm:text-6xl font-extrabold text-brand-accent-secondary mb-4 animate-correct-pop">{t('levelCompleteTitle', { level })}</h2>
                <p className="text-lg sm:text-xl text-brand-light mb-8">{t('levelCompleteMessage')}</p>
                <button
                    onClick={handleContinueClick}
                    className="
                        w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-bevel-inner border text-brand-bg focus:outline-none
                        bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)]
                        hover:bg-brand-accent-secondary hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)]
                        active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)]
                    "
                >
                    {t('continueToNextLevel', { level: level + 1 })}
                </button>
            </div>
        </div>
    );
};

export default LevelCompletePage;