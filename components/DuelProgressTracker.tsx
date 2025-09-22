import React from 'react';
import { useLanguage } from './LanguageContext';
import { Difficulty } from '../types';
import { difficultyProgression, difficultyEmojis } from '../config';

interface DuelProgressTrackerProps {
  roundWinners: Partial<Record<Difficulty, 1 | 2>>;
}

const DuelProgressTracker: React.FC<DuelProgressTrackerProps> = ({ roundWinners }) => {
    const { t } = useLanguage();

    return (
        <div className="flex items-center justify-center bg-brand-primary backdrop-blur-sm border border-brand-light/10 px-2 h-10 shadow-bevel-inner rounded-full">
            <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                {difficultyProgression.map(difficulty => {
                    const winner = roundWinners[difficulty];
                    
                    let emojiClass = 'grayscale opacity-30';
                    let title = t(difficulty.toLowerCase() as any);

                    if (winner === 1) {
                        // Player 1 uses the 'secondary' accent color (blue/sky)
                        emojiClass = 'drop-shadow-[0_0_5px_var(--brand-accent-secondary)]';
                        title = `${title} (${t('player1')})`;
                    } else if (winner === 2) {
                        // Player 2 uses the primary 'accent' color (red/pink)
                        emojiClass = 'drop-shadow-[0_0_5px_var(--brand-accent)]';
                        title = `${title} (${t('player2')})`;
                    }

                    return (
                        <span 
                            key={difficulty}
                            className={`text-lg sm:text-xl transition-all duration-300 ${emojiClass}`}
                            title={title}
                        >
                            {difficultyEmojis[difficulty]}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default DuelProgressTracker;