import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';

interface MenuPageProps {
    onSelect: (level: Difficulty) => void;
    onBack: () => void;
}

const MenuPage: React.FC<MenuPageProps> = ({ onSelect, onBack }) => {
    const [selected, setSelected] = useState<Difficulty | null>(null);
    const { t } = useLanguage();

    const handleSelect = (level: Difficulty) => {
        soundService.play('select');
        setSelected(level);
        onSelect(level);
    };

    const difficultyKeys: Difficulty[] = [
        'Novice', 'Apprentice', 'Adept', 'Skilled', 'Seasoned', 
        'Veteran', 'Master', 'Grandmaster', 'Legend', 'Mythic'
    ];

    const difficultyLabels: Record<Difficulty, string> = {
        Novice: t('novice'),
        Apprentice: t('apprentice'),
        Adept: t('adept'),
        Skilled: t('skilled'),
        Seasoned: t('seasoned'),
        Veteran: t('veteran'),
        Master: t('master'),
        Grandmaster: t('grandmaster'),
        Legend: t('legend'),
        Mythic: t('mythic'),
    };
    const difficultyDescriptions: Record<Difficulty, string> = {
        Novice: t('noviceDesc'),
        Apprentice: t('apprenticeDesc'),
        Adept: t('adeptDesc'),
        Skilled: t('skilledDesc'),
        Seasoned: t('seasonedDesc'),
        Veteran: t('veteranDesc'),
        Master: t('masterDesc'),
        Grandmaster: t('grandmasterDesc'),
        Legend: t('legendDesc'),
        Mythic: t('mythicDesc'),
    };
    const difficultyEmojis: Record<Difficulty, string> = {
        Novice: '😊',
        Apprentice: '🙂',
        Adept: '💪',
        Skilled: '😉',
        Seasoned: '🔥',
        Veteran: '😎',
        Master: '😈',
        Grandmaster: '🤯',
        Legend: '💀',
        Mythic: '💎'
    };
        
    const practiceButtonClasses = `
        w-full text-center text-xl font-black p-4 rounded-xl
        transform transition-all duration-150 ease-in-out
        backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none
    `;

    return (
        <div className={`relative flex flex-col items-center justify-center w-full h-full p-4 animate-appear`}>
            <div className="w-full max-w-2xl animate-appear">
                <div className="w-full grid grid-cols-2 gap-3 sm:gap-4">
                    {difficultyKeys.map((level) => (
                        <button
                            key={level}
                            onClick={() => handleSelect(level)}
                            disabled={!!selected}
                            className={`
                                relative w-full h-24 sm:h-28 p-1 sm:p-2 rounded-2xl border-2
                                flex flex-col items-center justify-center
                                transform transition-all duration-300 ease-in-out
                                backdrop-blur-sm text-brand-light focus:outline-none
                                bg-brand-primary border-brand-secondary
                                hover:border-brand-accent-secondary hover:scale-105 hover:shadow-[0_0_25px_var(--brand-accent-secondary-glow)]
                                disabled:cursor-not-allowed
                                ${selected === level ? 'animate-select-difficulty-pop' : ''}
                                ${selected && selected !== level ? 'opacity-0 scale-95' : ''}
                            `}
                        >
                            <div className="text-center">
                                <h3 className="text-sm sm:text-base font-black tracking-wider">{difficultyLabels[level]}</h3>
                                <p className="text-xs font-normal text-brand-light/70 mt-1 px-1">
                                    {difficultyDescriptions[level]}
                                </p>
                            </div>
                            <div className="text-xl sm:text-2xl mt-2">{difficultyEmojis[level]}</div>
                        </button>
                    ))}
                </div>
                <div className="w-full flex justify-center mt-6">
                    <button
                        onClick={() => { soundService.play('click'); onBack(); }}
                        className={`${practiceButtonClasses} max-w-xs bg-brand-secondary border-brand-light/20 shadow-[0_4px_0_rgba(0,0,0,0.4)] hover:bg-brand-light/10 hover:shadow-[0_6px_0_rgba(0,0,0,0.4)] active:translate-y-0 active:shadow-[0_2px_0_rgba(0,0,0,0.4)]`}
                    >
                        {t('back')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuPage;