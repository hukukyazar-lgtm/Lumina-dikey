import React, { useRef, useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import MoneyDisplay from '../components/MoneyDisplay';
import EndlessHighScoreDisplay from '../components/EndlessHighScoreDisplay';
import EndlessJourneyBar from '../components/EndlessJourneyBar';
import { PlayerProfile, JourneyItem } from '../types';
import LuminaCube from '../components/LuminaCube';
import { soundService } from '../services/soundService';
import { planetNameTranslationKeys, planetImageUrls, planetBackgroundSizes } from '../config';

// --- START CONSTANTS & HELPERS (Moved from EndlessJourneyBar) ---
const PLANETS_PER_UNIVERSE = 24;
const GATES_PER_PLANET = 6;
const NODES_PER_PLANET = GATES_PER_PLANET + 1;

const planetColors = [
    '#004E64', '#8B0000', '#D2691E', '#006400', '#4B0082',
    '#f97316', '#38bdf8', '#0ea5e9', '#6d28d9', '#be185d',
    '#16a34a', '#ca8a04', '#ea580c', '#0284c7', '#7c3aed',
    '#db2777', '#10b981', '#eab308', '#f59e0b', '#0ea5e9',
    '#8b5cf6', '#ec4899', '#22c55e', '#fde047'
];

const generateUniverseItems = (universeIndex: number, customPlanetImages: Record<number, string>): JourneyItem[] => {
    const items: JourneyItem[] = [];
    const startIndex = universeIndex * PLANETS_PER_UNIVERSE * NODES_PER_PLANET;
    for (let i = 0; i < PLANETS_PER_UNIVERSE * NODES_PER_PLANET; i++) {
        const globalIndex = startIndex + i;
        if (i % NODES_PER_PLANET === 0) {
            const planetNumber = universeIndex * PLANETS_PER_UNIVERSE + Math.floor(i / NODES_PER_PLANET);
            items.push({ 
                type: 'planet', 
                id: `planet-${globalIndex}`, 
                color: planetColors[planetNumber % planetColors.length], 
                nameKey: planetNameTranslationKeys[planetNumber % planetNameTranslationKeys.length],
                imageUrl: customPlanetImages[planetNumber] || planetImageUrls[planetNumber % planetImageUrls.length],
                backgroundSize: planetBackgroundSizes[planetNumber % planetBackgroundSizes.length]
            });
        } else {
            items.push({ type: 'gate', id: `gate-${globalIndex}` });
        }
    }
    return items;
};
// --- END CONSTANTS & HELPERS ---


// --- START SVG ICONS ---
const ImageStudioIcon: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5.67-1.5 1.5S5.67 15 6.5 15s1.5-.67 1.5-1.5S7.33 12 6.5 12zm3-4C8.67 8 8 8.67 8 9.5S8.67 11 9.5 11s1.5-.67 1.5-1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
    </svg>
);
// --- END SVG IONS ---

const PortalLuminaCube: React.FC<{ 
    style: React.CSSProperties; 
    isUnlocked: boolean; 
    onClick: () => void; 
}> = ({ style, isUnlocked, onClick }) => {
    const { t } = useLanguage();
    const handleClick = () => {
        if (isUnlocked) {
            soundService.play('bonus');
            onClick();
        } else {
            soundService.play('incorrect');
        }
    };
    
    return (
        <div style={style} className="absolute animate-appear flex flex-col items-center">
            <button
                onClick={handleClick}
                disabled={!isUnlocked}
                className={`transition-all duration-700 ease-in-out ${isUnlocked ? 'filter-none cursor-pointer' : 'filter grayscale brightness-50 cursor-not-allowed'}`}
                style={{ perspective: '800px' }}
                title={isUnlocked ? 'Enter Next Universe' : 'Complete the final gateway to unlock'}
            >
                <div className={`${isUnlocked ? 'animate-gem-pulse' : ''}`}>
                    <LuminaCube size={64} animationClass="animate-tumble-mythic" animationDuration="45s" />
                </div>
                 <p className={`mt-2 text-center text-sm font-bold tracking-widest transition-all duration-700 ease-in-out ${isUnlocked ? 'text-brand-accent animate-pulse' : 'text-brand-light/30'}`} style={{textShadow: isUnlocked ? '0 0 10px var(--brand-accent)' : 'none'}}>
                    {t('portalSlogan')}
                </p>
            </button>
        </div>
    );
};


interface MapPageProps {
  playerProfile: PlayerProfile;
  onSelectMode: (mode: 'progressive' | 'duel' | 'endless') => void;
  onShowPracticeMenu: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onOpenDesignStudio: () => void;
  gameMoney: number;
  endlessHighScore: number;
  endlessProgressCount: number;
  customPlanetImages: Record<number, string>;
  customMenuBackgroundUrl: string | null;
}

const MapPage: React.FC<MapPageProps> = ({ 
    playerProfile,
    onSelectMode, 
    onShowPracticeMenu, 
    onOpenProfile,
    onOpenShop,
    onOpenDesignStudio,
    gameMoney, 
    endlessHighScore,
    endlessProgressCount,
    customPlanetImages,
    customMenuBackgroundUrl,
}) => {
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>(() => generateUniverseItems(0, customPlanetImages));
    
    useEffect(() => {
        if (!customPlanetImages) return;
        setJourneyItems(prevItems => {
            let hasChanged = false;
            const newItems = prevItems.map((item, index) => {
                if (item.type === 'planet') {
                    const planetNumber = Math.floor(index / NODES_PER_PLANET);
                    const customImage = customPlanetImages[planetNumber];
                    const defaultImage = planetImageUrls[planetNumber % planetImageUrls.length];
                    const newImageUrl = customImage || defaultImage;
                    if (item.imageUrl !== newImageUrl) {
                        hasChanged = true;
                        return { ...item, imageUrl: newImageUrl };
                    }
                }
                return item;
            });
            return hasChanged ? newItems : prevItems;
        });
    }, [customPlanetImages]);
    
    const expandJourney = useCallback(() => {
        setJourneyItems(prevItems => {
            const currentUniverseCount = prevItems.length / (PLANETS_PER_UNIVERSE * NODES_PER_PLANET);
            return [...prevItems, ...generateUniverseItems(currentUniverseCount, customPlanetImages)];
        });
    }, [customPlanetImages]);

    const finalGatewayIndex = journeyItems.length - 1;
    const isPortalUnlocked = endlessProgressCount >= finalGatewayIndex;
  

  return (
    <div className="relative w-full h-screen text-brand-light font-mono flex flex-col overflow-hidden animate-appear">
        <PortalLuminaCube
            isUnlocked={isPortalUnlocked}
            onClick={expandJourney}
            style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 20,
            }}
        />

        {customMenuBackgroundUrl && (
            <div
                className="absolute inset-0 bg-cover bg-center -z-10 animate-appear"
                style={{ backgroundImage: `url(${customMenuBackgroundUrl})` }}
            >
                <div className="absolute inset-0 bg-brand-bg/80"></div>
            </div>
        )}

        {/* Header */}
        <header className="w-full flex justify-end items-start p-4 z-20 flex-shrink-0">
            <div className="flex items-center gap-2">
                <button 
                    onClick={onOpenDesignStudio}
                    className="h-10 flex items-center justify-center bg-gradient-to-br from-brand-secondary/50 to-brand-primary/50 border-brand-light/10 text-purple-400 backdrop-blur-sm border px-3 shadow-bevel-inner rounded-lg transition-transform duration-150 ease-in-out hover:scale-105 active:scale-100"
                    aria-label={t('designStudioTitle')}
                    title={t('designStudioTitle')}
                >
                    <div className="w-7 h-7"><ImageStudioIcon /></div>
                </button>
                <button 
                    onClick={onOpenShop}
                    className="transition-transform duration-150 ease-in-out hover:scale-105 active:scale-100"
                    aria-label={t('shopTitle')}
                    title={t('shopTitle')}
                >
                    <EndlessHighScoreDisplay score={endlessHighScore} />
                </button>
                <button 
                  onClick={onOpenProfile} 
                  className="transition-transform duration-150 ease-in-out hover:scale-105 active:scale-100"
                  aria-label={t('profile')}
                  title={t('profile')}
                >
                  <MoneyDisplay money={gameMoney} />
                </button>
            </div>
        </header>

        {/* Main scrollable content */}
        <main ref={scrollContainerRef} className="w-full flex-grow relative overflow-y-auto overflow-x-hidden custom-scrollbar pb-32">
            <EndlessJourneyBar 
                onStartEndless={() => onSelectMode('endless')} 
                scrollContainerRef={scrollContainerRef}
                currentProgressIndex={endlessProgressCount}
                journeyItems={journeyItems}
            />
        </main>
    </div>
  );
};

export default MapPage;