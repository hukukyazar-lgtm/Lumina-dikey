import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Difficulty } from '../types';
import { soundService } from '../services/soundService';
import LetterCube from '../components/LetterCube';
import MenuButton from '../components/MenuButton';
import CentralPlanet from '../components/CentralPlanet';
import { planetImageUrls } from '../config';

// New, more intuitive and colorful icons
const ProgressiveIcon: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="adventure-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
        </defs>
        <g>
            <path d="M6 18L12 12L18 18" stroke="url(#adventure-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 11L12 5L18 11" stroke="url(#adventure-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </svg>
);

const DuelIcon: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
            <path d="M9.5 19C6 17 5 12 5 12C5 7 8 4 9.5 4" stroke="#ec4899" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M14.5 5C18 7 19 12 19 12C19 17 16 20 14.5 20" stroke="#0ea5e9" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
    </svg>
);

const PracticeIcon: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="practice-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
        </defs>
        <g>
            <rect x="2" y="9" width="5" height="6" rx="1.5" fill="url(#practice-grad)" />
            <rect x="17" y="9" width="5" height="6" rx="1.5" fill="url(#practice-grad)" />
            <rect x="7" y="10" width="10" height="4" rx="1" fill="url(#practice-grad)" />
        </g>
    </svg>
);

const EndlessIcon: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="endless-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
        </defs>
        <g transform="rotate(90 12 12)">
            <path d="M12 12C9.23858 12 7 9.76142 7 7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7C17 9.76142 14.7614 12 12 12ZM12 12C14.7614 12 17 14.2386 17 17C17 19.7614 14.7614 22 12 22C9.23858 22 7 19.7614 7 17C7 14.2386 9.23858 12 12 12Z" stroke="url(#endless-grad)" strokeWidth="2.5" />
        </g>
    </svg>
);


const SettingsIcon: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="settings-grad-menu" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
        </defs>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="url(#settings-grad-menu)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="url(#settings-grad-menu)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const LuminaIconForCube: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad-menu-cube" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--brand-accent-secondary)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'var(--brand-accent)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g>
          <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="url(#logo-grad-menu-cube)" strokeWidth="4"/>
          <path d="M18 16V32H30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
);

interface SelectedPlanetInfo {
  name: string;
  distance: string;
  imageUrl: string;
}

interface MenuPageProps {
    onSelect: (level: Difficulty | 'progressive' | 'duel' | 'endless') => void;
    startInPracticeView?: boolean;
    onOpenSettings: () => void;
}

const MenuPage: React.FC<MenuPageProps> = ({ onSelect, startInPracticeView = false, onOpenSettings }) => {
    const [selected, setSelected] = useState<Difficulty | 'progressive' | 'duel' | 'endless' | null>(null);
    const [showPractice, setShowPractice] = useState(startInPracticeView);
    const [selectedPlanet, setSelectedPlanet] = useState<SelectedPlanetInfo | null>(null);
    const { t, isTabletMode } = useLanguage();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const luminaLetters = useMemo(() => 'LUMINA'.split(''), []);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            // On mount, scroll to the bottom to start the journey from Earth
            container.scrollTop = container.scrollHeight;
        }
    }, [showPractice]); // Re-run if we switch back to the journey view

    const planetData = useMemo(() => {
        const definitions = [
            { nameKey: 'planet_earth_name' },
            { nameKey: 'planet_venus_name', distanceKey: 'planetDistanceAU', distanceVal: '0.7' },
            { nameKey: 'planet_mars_name', distanceKey: 'planetDistanceAU', distanceVal: '1.5' },
            { nameKey: 'planet_mercury_name', distanceKey: 'planetDistanceAU', distanceVal: '0.4' },
            { nameKey: 'planet_ceres_name', distanceKey: 'planetDistanceAU', distanceVal: '2.8' },
            { nameKey: 'planet_jupiter_name', distanceKey: 'planetDistanceAU', distanceVal: '5.2' },
            { nameKey: 'planet_saturn_name', distanceKey: 'planetDistanceAU', distanceVal: '9.5' },
            { nameKey: 'planet_uranus_name', distanceKey: 'planetDistanceAU', distanceVal: '19.2' },
            { nameKey: 'planet_neptune_name', distanceKey: 'planetDistanceAU', distanceVal: '30.1' },
            { nameKey: 'planet_pluto_name', distanceKey: 'planetDistanceAU', distanceVal: '39.5' },
            { nameKey: 'planet_haumea_name', distanceKey: 'planetDistanceAU', distanceVal: '43' },
            { nameKey: 'planet_makemake_name', distanceKey: 'planetDistanceAU', distanceVal: '45.8' },
            { nameKey: 'planet_eris_name', distanceKey: 'planetDistanceAU', distanceVal: '68' },
            { nameKey: 'planet_proxima_b_name', distanceKey: 'planetDistanceLY', distanceVal: '4.24' },
            { nameKey: 'planet_trappist1_name', distanceKey: 'planetDistanceLY', distanceVal: '40' },
            { nameKey: 'planet_55_cancri_e_name', distanceKey: 'planetDistanceLY', distanceVal: '41' },
            { nameKey: 'planet_51_pegasi_b_name', distanceKey: 'planetDistanceLY', distanceVal: '50.9' },
            { nameKey: 'planet_hd_189733b_name', distanceKey: 'planetDistanceLY', distanceVal: '64.5' },
            { nameKey: 'planet_hd_209458b_name', distanceKey: 'planetDistanceLY', distanceVal: '159' },
            { nameKey: 'planet_kepler_186f_name', distanceKey: 'planetDistanceLY', distanceVal: '500' },
            { nameKey: 'planet_tres_2b_name', distanceKey: 'planetDistanceLY', distanceVal: '750' },
            { nameKey: 'planet_kepler_452b_name', distanceKey: 'planetDistanceLY', distanceVal: '1,800' },
            { nameKey: 'planet_psr_b1257_name', distanceKey: 'planetDistanceLY', distanceVal: '2,300' },
            { nameKey: 'planet_m51_uls_1b_name', distanceKey: 'planetDistanceLY', distanceVal: '28M' }
        ];
        return definitions.map((def: any, index) => ({
            name: t(def.nameKey as any),
            distance: def.distanceKey && def.distanceVal ? t(def.distanceKey as any, { distance: def.distanceVal }) : '',
            imageUrl: planetImageUrls[index],
        }));
    }, [t]);
    
    const handleSelect = (level: Difficulty | 'progressive' | 'duel' | 'endless') => {
        soundService.play('select');
        setSelected(level);
        onSelect(level);
    };

    const handlePlanetClick = (planet: SelectedPlanetInfo) => {
        soundService.play('click');
        setSelectedPlanet(planet);
    };

    const handleClosePlanet = () => {
        soundService.play('click');
        setSelectedPlanet(null);
    };

    const isDuelEnabled = isTabletMode;

    const menuItems = [
        { icon: <PracticeIcon />, color: 'text-brand-accent-secondary', action: () => { soundService.play('click'); setShowPractice(true); }, label: t('practice'), disabled: !!selected },
        { icon: <DuelIcon />, color: 'text-red-500', action: () => handleSelect('duel'), label: t('duel'), disabled: !!selected || !isDuelEnabled },
        { icon: <ProgressiveIcon />, color: 'text-brand-accent', action: () => handleSelect('progressive'), label: t('adventure'), disabled: !!selected },
        { icon: <EndlessIcon />, color: 'text-brand-warning', action: () => handleSelect('endless'), label: t('endless'), disabled: !!selected },
        { icon: <SettingsIcon />, color: 'text-purple-500', action: () => { soundService.play('click'); onOpenSettings(); }, label: t('settings'), disabled: !!selected },
    ];
        
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
        Mythic: '👑'
    };
        
    const practiceButtonClasses = `
        w-full text-center text-xl font-bold p-4 rounded-xl
        transform transition-all duration-150 ease-in-out
        backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none
    `;

    return (
        <div className={`relative flex flex-col items-center justify-between w-full h-full py-4 animate-appear`} style={{ perspective: '2000px' }}>
            {selectedPlanet && (
                <CentralPlanet 
                    imageUrl={selectedPlanet.imageUrl}
                    name={selectedPlanet.name}
                    distance={selectedPlanet.distance}
                    onClose={handleClosePlanet} 
                    onPlayEndless={() => handleSelect('endless')}
                />
            )}
            {!showPractice ? (
                <>
                    <div className="flex-grow w-full flex items-center justify-center relative overflow-hidden">
                        <div 
                            className="max-h-full w-48 py-8"
                        >
                            <div ref={scrollContainerRef} className="h-full overflow-y-auto custom-scrollbar pr-4">
                                <div className="relative flex justify-center">
                                    <div className="absolute top-0 bottom-0 w-1 bg-brand-accent-secondary/20 rounded-full"></div>
                                    <div 
                                        className="flex flex-col items-center gap-6 py-4"
                                    >
                                        <div key="lumina-cube" className="z-10 animate-gem-pulse" title="Lumina">
                                            <LetterCube
                                                size={128}
                                                icon={<LuminaIconForCube />}
                                                animationDelay="0s"
                                                faceClassName="bg-black/40 backdrop-blur-sm border border-brand-accent/60 shadow-[0_0_15px_var(--brand-accent)]"
                                                disableContentAnimation={true}
                                            />
                                        </div>
                                        <div key="gateways-to-lumina" className="flex flex-col items-center gap-4 z-0">
                                            {luminaLetters.map((letter, i) => (
                                                <div 
                                                    key={i} 
                                                    className="animate-tumble-gentle-xy" 
                                                    style={{ 
                                                        animationDelay: `${i * 200}ms`,
                                                        animationDuration: '10s',
                                                        transformStyle: 'preserve-3d',
                                                    }}
                                                >
                                                    <LetterCube
                                                        size={12}
                                                        letter={letter}
                                                        animationDelay="0s"
                                                        faceClassName="bg-black/20 backdrop-blur-sm border border-brand-light/40"
                                                        disableContentAnimation={true}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {[...planetData].reverse().flatMap((planet, index, arr) => {
                                             const isMars = planet.name === t('planet_mars_name');
                                             const planetElement = (
                                                <div 
                                                    key={planet.name} 
                                                    className="z-10 flex flex-col items-center gap-1"
                                                >
                                                    <button
                                                        onClick={() => handlePlanetClick(planet)}
                                                        disabled={!!selected}
                                                        title={planet.name}
                                                        className="focus:outline-none relative w-24 h-24 flex items-center justify-center transition-transform duration-200 ease-in-out hover:scale-[1.75]"
                                                    >
                                                        <div 
                                                            className="w-full h-full rounded-full bg-cover bg-center shadow-inner"
                                                            style={{ 
                                                                backgroundImage: `url("${planet.imageUrl}")`,
                                                                backgroundSize: isMars ? '160%' : 'cover',
                                                                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.7), 0 0 10px var(--brand-accent-secondary-glow)'
                                                            }}
                                                        >
                                                        </div>
                                                    </button>
                                                    <p className="text-xs text-center font-semibold text-brand-light/80 -mt-1">
                                                        {planet.name}
                                                    </p>
                                                </div>
                                            );
                                            
                                            // After the last planet (Earth), add a spacer to vertically center it
                                            // when scrolled to the bottom, but no gateways.
                                            if (index === arr.length - 1) {
                                                // This spacer pushes the Earth element up from the bottom of the scroll container.
                                                const spacer = <div key="bottom-spacer" className="h-[45vh]" aria-hidden="true" />;
                                                return [planetElement, spacer];
                                            }

                                            const gateways = (
                                                <div key={`gateways-${index}`} className="flex flex-col items-center gap-4 z-0">
                                                    {luminaLetters.map((letter, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="animate-tumble-gentle-xy" 
                                                            style={{ 
                                                                animationDelay: `${i * 200}ms`,
                                                                animationDuration: '10s',
                                                                transformStyle: 'preserve-3d',
                                                            }}
                                                        >
                                                            <LetterCube
                                                                size={12}
                                                                letter={letter}
                                                                animationDelay="0s"
                                                                faceClassName="bg-black/20 backdrop-blur-sm border border-brand-light/40"
                                                                disableContentAnimation={true}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                            return [planetElement, gateways];
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full px-1 sm:px-4 pb-6 -translate-y-10">
                        <div className="flex items-start justify-center gap-x-2 sm:gap-x-6">
                            {menuItems.map((item, index) => (
                                <MenuButton
                                    key={index}
                                    icon={item.icon}
                                    label={item.label}
                                    onClick={item.action}
                                    disabled={item.disabled}
                                    color={item.color}
                                    title={item.disabled && item.label === t('duel') && !isDuelEnabled ? t('tabletModeDesc') : item.label}
                                    animationDelay={`${index * 150}ms`}
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
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
                                    <h3 className="text-sm sm:text-base font-extrabold tracking-wider">{difficultyLabels[level]}</h3>
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
                            onClick={() => { soundService.play('click'); setShowPractice(false); }}
                            className={`${practiceButtonClasses} max-w-xs bg-brand-secondary border-brand-light/20 shadow-[0_4px_0_rgba(0,0,0,0.4)] hover:bg-brand-light/10 hover:shadow-[0_6px_0_rgba(0,0,0,0.4)] active:translate-y-0 active:shadow-[0_2px_0_rgba(0,0,0,0.4)]`}
                        >
                            {t('back')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuPage;