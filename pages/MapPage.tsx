import React, { useRef, useState, useLayoutEffect, useCallback, useEffect } from 'react';
// FIX: Import Variants type to fix framer-motion type error.
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';
import MoneyDisplay from '../components/MoneyDisplay';
import EndlessHighScoreDisplay from '../components/EndlessHighScoreDisplay';
import EndlessJourneyBar from '../components/EndlessJourneyBar';
import { PlayerProfile, JourneyItem } from '../types';
import { soundService } from '../services/soundService';
import { planetNameTranslationKeys, planetImageUrls, planetBackgroundSizes } from '../config';

// --- START IN-PAGE MODAL COMPONENT ---
type StartDifficulty = 'easy' | 'medium' | 'hard';

interface StartGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (difficulty: StartDifficulty) => void;
  planetName: string;
}

const StartGameModal: React.FC<StartGameModalProps> = ({ isOpen, onClose, onStart, planetName }) => {
  const { t } = useLanguage();

  const handleStart = (difficulty: StartDifficulty) => {
    soundService.play('start');
    onStart(difficulty);
  };
  
  const handleClose = () => {
    soundService.play('click');
    onClose();
  }
  
  const backdropVariants: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { scale: 0.9, opacity: 0, y: 20 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <motion.div
        variants={modalVariants}
        className="w-full max-w-md text-center p-6 sm:p-8 bg-brand-primary backdrop-blur-sm border-2 border-brand-accent-secondary rounded-2xl shadow-2xl shadow-brand-accent-secondary/20">
        <h2 id="dialog-title" className="text-3xl sm:text-4xl font-black text-brand-light mb-2">{planetName}</h2>
        <p className="text-brand-light/80 mb-6">{t('endlessModeStartTitle')}</p>
        
        <div className="flex flex-col gap-4">
          <motion.button
            onClick={() => handleStart('easy')}
            className="pressable-key w-full"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ y: 1, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            style={{
              '--key-edge-color': 'var(--brand-correct-shadow)',
              '--key-front-color': 'var(--brand-correct)',
              '--key-front-text-color': 'var(--brand-bg-gradient-end)',
              '--key-front-border-color': 'rgba(255, 255, 255, 0.4)',
            } as React.CSSProperties}
          >
            <div className="pressable-key-shadow" />
            <div className="pressable-key-edge" />
            <div className="pressable-key-front text-xl sm:text-2xl font-black">
              <span>{t('difficultyEasy')}</span>
            </div>
          </motion.button>
          
          <motion.button
            onClick={() => handleStart('medium')}
            className="pressable-key w-full animate-default-pulse"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ y: 1, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            style={{
              '--key-edge-color': 'var(--brand-warning-shadow)',
              '--key-front-color': 'var(--brand-warning)',
              '--key-front-text-color': '#4a2c00',
              '--key-front-border-color': 'rgba(255, 255, 255, 0.4)',
            } as React.CSSProperties}
          >
            <div className="pressable-key-shadow" />
            <div className="pressable-key-edge" />
            <div className="pressable-key-front text-xl sm:text-2xl font-black">
              <span>{t('difficultyMedium')}</span>
            </div>
          </motion.button>

          <motion.button
            onClick={() => handleStart('hard')}
            className="pressable-key w-full"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ y: 1, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
            style={{
              '--key-edge-color': 'var(--brand-accent-shadow)',
              '--key-front-color': 'var(--brand-accent)',
              '--key-front-text-color': 'var(--brand-bg-gradient-end)',
              '--key-front-border-color': 'rgba(255, 255, 255, 0.3)',
            } as React.CSSProperties}
          >
            <div className="pressable-key-shadow" />
            <div className="pressable-key-edge" />
            <div className="pressable-key-front text-xl sm:text-2xl font-black">
              <span>{t('difficultyHard')}</span>
            </div>
          </motion.button>
        </div>

        <button 
          onClick={handleClose} 
          className="w-full max-w-xs mt-8 text-center text-lg sm:text-xl font-black p-3 rounded-full transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-light bg-brand-secondary border-brand-light/20 shadow-[0_4px_0_var(--bevel-shadow-dark)] hover:bg-brand-light/10 hover:shadow-[0_6px_0_var(--bevel-shadow-dark)] active:translate-y-1 active:shadow-[0_2px_0_var(--bevel-shadow-dark)]"
        >
          {t('back')}
        </button>
      </motion.div>
    </motion.div>
  );
};
// --- END IN-PAGE MODAL COMPONENT ---


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

interface MapPageProps {
  playerProfile: PlayerProfile;
  onSelectMode: (mode: 'progressive' | 'duel' | 'endless', startingDifficulty?: 'easy' | 'medium' | 'hard') => void;
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
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<JourneyItem | null>(null);
    
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
    
    const handleNodeClick = useCallback((node: JourneyItem) => {
        setSelectedNode(node);
        setIsStartModalOpen(true);
    }, []);

    const handleStartGame = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
        setIsStartModalOpen(false);
        onSelectMode('endless', difficulty);
    }, [onSelectMode]);


  return (
    <div className="relative w-full h-screen text-brand-light font-mono flex flex-col overflow-hidden">
        
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
                <button onClick={onOpenShop} aria-label={t('endlessHighScore')}>
                    <EndlessHighScoreDisplay score={endlessHighScore} />
                </button>
                 <button onClick={onOpenProfile} aria-label={t('gameMoney')}>
                    <MoneyDisplay money={gameMoney} />
                </button>
            </div>
        </header>

        {/* Main scrollable content */}
        <main ref={scrollContainerRef} className="w-full flex-grow relative overflow-y-auto overflow-x-hidden custom-scrollbar pb-32">
            <EndlessJourneyBar 
                onNodeClick={handleNodeClick}
                scrollContainerRef={scrollContainerRef}
                currentProgressIndex={endlessProgressCount}
                journeyItems={journeyItems}
            />
        </main>
        
        <AnimatePresence>
            {isStartModalOpen && (
                <motion.div>
                    <StartGameModal
                        isOpen={isStartModalOpen}
                        onClose={() => setIsStartModalOpen(false)}
                        onStart={handleStartGame}
                        planetName={selectedNode?.nameKey ? t(selectedNode.nameKey as any) : t('endless')}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default MapPage;