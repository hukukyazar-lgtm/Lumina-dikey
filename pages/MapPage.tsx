import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useLanguage } from '../components/LanguageContext';
import MoneyDisplay from '../components/MoneyDisplay';
import EndlessHighScoreDisplay from '../components/EndlessHighScoreDisplay';
import { PlayerProfile } from '../types';
import { soundService } from '../services/soundService';
import { ADVENTURE_GATEWAYS_PER_PLANET } from '../config';
import NavButton from '../components/NavButton';

// --- START GATEWAY PROGRESS CIRCLE ---
const TOTAL_SEGMENTS = ADVENTURE_GATEWAYS_PER_PLANET;

const GatewayProgressCircle: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 48;
    const center = 50;

    const getPathForSlice = (index: number): string => {
        const angle = 360 / TOTAL_SEGMENTS;
        const startAngle = -90 + index * angle; // Start from top
        const endAngle = startAngle + angle;

        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startAngleRad);
        const y1 = center + radius * Math.sin(startAngleRad);
        const x2 = center + radius * Math.cos(endAngleRad);
        const y2 = center + radius * Math.sin(endAngleRad);

        return `M ${center},${center} L ${x1},${y1} A ${radius},${radius} 0 0 1 ${x2},${y2} Z`;
    };

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
                const isLit = i < progress;
                return (
                    <motion.path
                        key={i}
                        d={getPathForSlice(i)}
                        stroke="var(--brand-primary)"
                        strokeWidth="1.5"
                        initial={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        animate={{ fill: isLit ? 'var(--brand-accent-secondary)' : 'rgba(255, 255, 255, 0.05)' }}
                        transition={{ duration: 0.5, delay: isLit ? i * 0.1 : 0 }}
                    />
                );
            })}
        </svg>
    );
};
// --- END GATEWAY PROGRESS CIRCLE ---

// --- START IN-PAGE MODAL COMPONENT ---
type StartDifficulty = 'easy' | 'medium' | 'hard';

interface StartGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (difficulty: StartDifficulty) => void;
  title: string;
}

const StartGameModal: React.FC<StartGameModalProps> = ({ isOpen, onClose, onStart, title }) => {
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
        <h2 id="dialog-title" className="text-3xl sm:text-4xl font-black text-brand-light mb-2">{title}</h2>
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

interface MapPageProps {
  playerProfile: PlayerProfile;
  onSelectMode: (mode: 'progressive' | 'duel' | 'endless', startingDifficulty?: 'easy' | 'medium' | 'hard') => void;
  onShowPracticeMenu: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onOpenDesignStudio: () => void;
  gameMoney: number;
  endlessHighScore: number;
  completedGatewayCount: number;
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
    completedGatewayCount
}) => {
  const { t } = useLanguage();
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    
    const handlePlayClick = useCallback(() => {
        soundService.play('select');
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
            <div className="flex items-center gap-4">
                <EndlessHighScoreDisplay score={endlessHighScore} />
                <MoneyDisplay money={gameMoney} />
            </div>
        </header>

        {/* Main content with central button */}
        <main className="w-full flex-grow flex items-center justify-center">
            <motion.button
              onClick={handlePlayClick}
              className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full flex items-center justify-center font-black text-4xl sm:text-5xl tracking-widest text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Glowing border */}
              <div 
                className="absolute inset-[-4px] rounded-full"
                style={{
                    border: '4px solid hsl(180, 100%, 70%)',
                    boxShadow: '0 0 20px hsl(180, 100%, 70%), 0 0 30px hsl(180, 100%, 70%), inset 0 0 10px hsl(180, 100%, 70%)',
                    filter: 'blur(3px)',
                }}
              />
              {/* Main button body */}
              <div className="relative w-full h-full bg-[#008B8B] rounded-full flex items-center justify-center shadow-inner">
                {/* Segment lines */}
                {[0, 60, 120].map(deg => (
                    <div key={deg} className="absolute w-[90%] h-[1px] bg-white/20" style={{ transform: `rotate(${deg}deg)` }} />
                ))}
                <span className="relative z-10 font-orbitron" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>PLAY</span>
              </div>
            </motion.button>
        </main>
        
        <footer className="w-full flex-shrink-0 flex justify-center p-2 z-20">
            <div className="flex justify-around items-center gap-1 sm:gap-2 bg-brand-primary/70 backdrop-blur-sm border border-brand-light/10 rounded-2xl p-1 w-full max-w-2xl">
                <NavButton
                    onClick={() => onSelectMode('progressive')}
                    label={t('adventureMode')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.09-3.1a2 2 0 0 0-2.43-2.43c-.79.61-2.26.61-3.1.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.87 12.87 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>}
                />
                <NavButton
                    onClick={onShowPracticeMenu}
                    label={t('practiceMode')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>}
                />
                <NavButton
                    onClick={() => onSelectMode('duel')}
                    label={t('duelMode')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.5 17.5-10-10" /><path d="m20.5 3.5-10 10" /><path d="M15 3h6v6" /><path d="M9 21H3v-6" /></svg>}
                />
                <NavButton
                    onClick={onOpenDesignStudio}
                    label={t('designStudioTitle')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>}
                />
                <NavButton
                    onClick={onOpenShop}
                    label={t('shopTitle')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" /></svg>}
                />
                <NavButton
                    onClick={onOpenProfile}
                    label={t('profile')}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                />
            </div>
        </footer>

        <AnimatePresence>
            {isStartModalOpen && (
                <motion.div>
                    <StartGameModal
                        isOpen={isStartModalOpen}
                        onClose={() => setIsStartModalOpen(false)}
                        onStart={handleStartGame}
                        title={t('endlessMode')}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default MapPage;