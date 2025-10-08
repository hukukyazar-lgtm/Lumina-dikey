import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { HighScore } from '../types';
import { getGlobalHighScores, getLocalHighScores } from '../services/scoreService';
import { soundService } from '../services/soundService';

interface LeaderboardPageProps {
  onReturnToMenu: () => void;
  isEmbedded?: boolean;
}

// Reusable segmented control for filters
const FilterControl: React.FC<{
    options: { value: string; label: string }[];
    selectedValue: string;
    onChange: (value: any) => void;
}> = ({ options, selectedValue, onChange }) => {
    return (
        <div className="relative flex w-full max-w-xs items-center justify-center p-1 bg-black/10 rounded-full border border-transparent shadow-inner">
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

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onReturnToMenu, isEmbedded }) => {
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
    
    const content = (
        <>
            {!isEmbedded && <h2 className="text-4xl sm:text-5xl font-extrabold text-brand-light mb-4">{t('highScoresTitle')}</h2>}
            
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
            
            <div className={`flex flex-col overflow-y-auto custom-scrollbar pr-2 ${isEmbedded ? '' : 'h-[40vh] sm:h-[50vh] max-h-[500px] mb-6'}`}>
                {highScores.length > 0 ? (
                    <ol className="space-y-2">
                        {highScores.map((score, index) => (
                            <li 
                                key={`${scope}-${timeFrame}-${index}`}
                                className="flex justify-between items-center text-lg py-2 px-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors animate-appear"
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

            {!isEmbedded && 
                <button
                    onClick={handleReturnClick}
                    className="
                        w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-lg border text-white focus:outline-none
                        bg-brand-accent border-transparent
                        hover:shadow-xl hover:-translate-y-1
                        active:translate-y-0 active:shadow-lg
                    "
                >
                    {t('back')}
                </button>
            }
        </>
    );

    if (isEmbedded) {
        return content;
    }

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className="w-full max-w-2xl text-center p-4 sm:p-6 bg-brand-primary backdrop-blur-sm border-2 border-white/40 rounded-2xl shadow-2xl shadow-black/20">
                {content}
            </div>
        </div>
    );
};

export default LeaderboardPage;