import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { HighScore } from '../types';
import { getGlobalHighScores, getLocalHighScores } from '../services/scoreService';
import { soundService } from '../services/soundService';

interface LeaderboardPageProps {
  onReturnToMenu: () => void;
}

// Reusable segmented control for filters
const FilterControl: React.FC<{
    options: { value: string; label: string }[];
    selectedValue: string;
    onChange: (value: any) => void;
}> = ({ options, selectedValue, onChange }) => {
    return (
        <div className="relative flex w-full max-w-xs items-center justify-center p-1 bg-brand-secondary rounded-full border border-brand-secondary/50 shadow-inner">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => {
                        soundService.play('click');
                        onChange(option.value);
                    }}
                    className={`w-1/2 h-8 flex items-center justify-center text-sm font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent-secondary/50 ${
                        selectedValue === option.value
                            ? 'bg-brand-accent-secondary text-white shadow-sm'
                            : 'bg-transparent text-brand-light/60 hover:text-brand-light'
                    }`}
                    aria-pressed={selectedValue === option.value}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};


const countryCodeToEmoji = (code: string): string => {
    if (!code || code.length !== 2) return '🌐';
    try {
        const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    } catch (e) {
        console.error("Failed to convert country code to emoji", e);
        return '🌐';
    }
};

const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (e) {
        return '';
    }
};

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onReturnToMenu }) => {
    const { t } = useLanguage();
    const [highScores, setHighScores] = useState<HighScore[]>([]);
    const [scope, setScope] = useState<'world' | 'region'>('world');
    const [timeFrame, setTimeFrame] = useState<'allTime' | 'thisMonth'>('allTime');

    useEffect(() => {
        let scores: HighScore[] = scope === 'world' ? getGlobalHighScores() : getLocalHighScores();

        if (timeFrame === 'thisMonth') {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            scores = scores.filter(score => {
                if (!score.date) return false;
                try {
                    const scoreDate = new Date(score.date);
                    return scoreDate.getMonth() === currentMonth && scoreDate.getFullYear() === currentYear;
                } catch(e) {
                    return false;
                }
            });
        }
        
        scores.sort((a, b) => b.score - a.score);
        setHighScores(scores);
    }, [scope, timeFrame]);

    const handleReturnClick = () => {
        soundService.play('click');
        onReturnToMenu();
    };

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className="w-full max-w-2xl text-center p-4 sm:p-6 bg-brand-primary backdrop-blur-sm border-2 border-brand-light/20 rounded-2xl shadow-2xl shadow-black/50">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-light mb-4">{t('highScoresTitle')}</h2>
                
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
                    <FilterControl 
                        options={[
                            { value: 'world', label: t('world') },
                            { value: 'region', label: t('region') }
                        ]}
                        selectedValue={scope}
                        onChange={setScope}
                    />
                    <FilterControl 
                        options={[
                            { value: 'allTime', label: t('allTime') },
                            { value: 'thisMonth', label: t('thisMonth') }
                        ]}
                        selectedValue={timeFrame}
                        onChange={setTimeFrame}
                    />
                </div>
                
                <div className="h-[40vh] sm:h-[50vh] max-h-[500px] flex flex-col overflow-y-auto custom-scrollbar pr-2 mb-6">
                    {highScores.length > 0 ? (
                        <ol className="space-y-2">
                            {highScores.map((score, index) => (
                                <li 
                                    key={`${scope}-${timeFrame}-${index}`}
                                    className="flex justify-between items-center text-lg py-2 px-4 rounded-full bg-brand-secondary/50 hover:bg-brand-accent-secondary/10 transition-colors animate-appear"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center flex-1 min-w-0">
                                        <span className="font-bold text-brand-light/70 w-8 text-center">{index + 1}.</span>
                                        <img src={score.avatarUrl} alt={`${score.name}'s avatar`} className="w-8 h-8 rounded-full object-cover ml-1 mr-2 flex-shrink-0" />
                                        <span className="font-semibold text-brand-light truncate">{score.name}</span>
                                        <span className="ml-2 text-xl" aria-label={`Country: ${score.countryCode}`}>{countryCodeToEmoji(score.countryCode)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 ml-2">
                                        <span className="text-xs font-semibold bg-brand-primary text-brand-accent-secondary px-2 py-1 rounded-full">
                                            {t('levelAbbr')} {score.level}
                                        </span>
                                        <span className="hidden sm:inline-block font-mono text-xs text-brand-light/50 w-24 text-center">{formatDate(score.date)}</span>
                                        <span className="font-bold text-brand-accent-secondary w-16 text-right">{score.score}</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <div className="flex-grow flex items-center justify-center h-full">
                            <p className="text-brand-light/60 text-center">{t('noHighScores')}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleReturnClick}
                    className="
                        w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none
                        bg-brand-accent/50 border-brand-accent/80 shadow-[0_4px_0_var(--brand-accent-shadow)]
                        hover:bg-brand-accent/70 hover:shadow-[0_6px_0_var(--brand-accent-shadow)]
                        active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-shadow)]
                    "
                >
                    {t('back')}
                </button>
            </div>
        </div>
    );
};

export default LeaderboardPage;