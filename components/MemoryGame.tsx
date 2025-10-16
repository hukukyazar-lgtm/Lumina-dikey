import React, { useState, useEffect, useMemo } from 'react';
import WordTile from './WordTile';
import { useLanguage } from './LanguageContext';
import { soundService } from '../services/soundService';
import { GameMode } from '../types';
import { ADVENTURE_GATEWAYS_PER_PLANET, planetNameTranslationKeys } from '../config';
import GoldCoinIcon from './GoldCoinIcon';

interface MemoryGameProps {
  wordsToFind: Array<{ word: string; score: number }>;
  allChoices: string[];
  onClose: (bonusScore: number) => void;
  onFailure: () => void;
  gatewayNumber: number | null;
  gameMode: 'progressive' | 'endless';
  endlessWordCount: number;
}

const GAME_DURATION = 30; // seconds

const MemoryGame: React.FC<MemoryGameProps> = ({ wordsToFind, allChoices, onClose, onFailure, gatewayNumber, gameMode, endlessWordCount }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [incorrectSelections, setIncorrectSelections] = useState<string[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [bonusScore, setBonusScore] = useState(0);
  const [pointPopup, setPointPopup] = useState<{ text: string; key: number } | null>(null);

  const correctWordStrings = useMemo(() => wordsToFind.map(w => w.word), [wordsToFind]);
  const isProgressive = gameMode === 'progressive';
  const isCheckpointGateway = !isProgressive;

  const title = useMemo(() => {
    if (gatewayNumber === null) {
      return isProgressive ? t('memoryGatewayProgressiveTitle') : t('memoryGameTitle');
    }

    const gatewaysPerPlanet = ADVENTURE_GATEWAYS_PER_PLANET;
    const planetIndex = Math.floor((gatewayNumber - 1) / gatewaysPerPlanet);
    const gatewayInPlanet = (gatewayNumber - 1) % gatewaysPerPlanet + 1;

    const nameKey = planetNameTranslationKeys[planetIndex % planetNameTranslationKeys.length] as any;
    const planetName = t(nameKey);

    return t('gatewayTitleMinimalist', { planetName, gateway: gatewayInPlanet });
  }, [gatewayNumber, isProgressive, t]);

  // Memoize tile styles to prevent them from changing on every render
  const tileStyles = useMemo(() => {
    const styles: { [key: string]: React.CSSProperties } = {};
    allChoices.forEach(word => {
        const rotation = Math.random() * 8 - 4; // -4 to 4 degrees
        const scale = Math.random() * 0.1 + 0.95; // 0.95 to 1.05 scale
        const translateY = Math.random() * 10 - 5; // -5px to 5px vertical float
        styles[word] = { transform: `rotate(${rotation}deg) scale(${scale}) translateY(${translateY}px)` };
    });
    return styles;
  }, [allChoices]);

  // Setup game on mount
  useEffect(() => {
    setWordPool([...allChoices].sort(() => 0.5 - Math.random()));
  }, [allChoices]);

  // Game-ending logic (timer)
  useEffect(() => {
    if (isClosing || gameWon || gameLost) return;

    if (timeLeft <= 0) {
      soundService.play('gameOver');
      setGameLost(true);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, isClosing, gameWon, gameLost]);

  // Handle perfect bonus calculation
  useEffect(() => {
    if (!gameWon) return;

    // For both modes, a "Perfect" score doubles the bonus earned from the recalled words.
    setTimeout(() => {
        soundService.play('bonus');
        setBonusScore(currentTotal => currentTotal * 2);
        setPointPopup({ text: t('perfectBonus'), key: Date.now() });
    }, 500);
  }, [gameWon, t]);

  const handleWordClick = (word: string) => {
    if (isClosing || gameWon || gameLost || foundWords.includes(word)) {
      return;
    }

    soundService.play('click');
    const newSelectedWords = new Set(selectedWords);
    if (newSelectedWords.has(word)) {
      newSelectedWords.delete(word);
    } else {
      if (newSelectedWords.size < wordsToFind.length) {
        newSelectedWords.add(word);
      }
    }
    setSelectedWords(newSelectedWords);
  };
  
  const handleConfirmSelection = () => {
    if (selectedWords.size !== wordsToFind.length) return;
    
    soundService.play('start');

    const correctWordSet = new Set(correctWordStrings);
    const incorrectSubmissions: string[] = [];
    let allCorrect = true;

    for (const word of selectedWords) {
        if (!correctWordSet.has(word)) {
            allCorrect = false;
            incorrectSubmissions.push(word);
        }
    }

    if (allCorrect && selectedWords.size === correctWordSet.size) {
        setGameWon(true);
        setFoundWords(Array.from(selectedWords));
        const totalBonus = wordsToFind.reduce((total, word) => total + word.score, 0);
        setBonusScore(totalBonus);
    } else {
        setGameLost(true);
        const correctSubmissions = [...selectedWords].filter(w => correctWordSet.has(w));
        setFoundWords(correctSubmissions);
        setIncorrectSelections(incorrectSubmissions);
    }
  };


  const getWordStatus = (word: string): 'default' | 'found' | 'incorrect' | 'missed' | 'distractor' | 'selected' => {
    // After submission logic
    if (gameWon || gameLost) {
        if (foundWords.includes(word)) return 'found';
        if (incorrectSelections.includes(word)) return 'incorrect';

        // Highlight any correct words the player missed during a failure.
        if (correctWordStrings.includes(word)) {
            return 'missed';
        }
        // Fade out any other incorrect words they didn't pick.
        return 'distractor';
    }
    
    // Before submission logic
    if (selectedWords.has(word)) return 'selected';

    return 'default';
  };
  
  const timerProgress = (timeLeft / GAME_DURATION) * 100;
  
  const handleSuccessContinue = () => {
    soundService.play('click');
    setIsClosing(true);
    onClose(bonusScore);
  };

  const handleFailureContinue = () => {
    soundService.play('click');
    onFailure();
  };

  const passButtonClasses = `
    w-full max-w-xs text-center text-xl sm:text-2xl font-black p-4 rounded-full
    transform transition-all duration-150 ease-in-out
    backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none`;

  const wonButtonClasses = `
    bg-brand-accent-secondary/50 border-brand-accent-secondary/80 shadow-[0_4px_0_var(--brand-accent-secondary-shadow)]
    hover:bg-brand-accent-secondary/70 hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)]
    active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)]`;
  
  const lostButtonClasses = `
    bg-brand-accent/50 border-brand-accent/80 shadow-[0_4px_0_var(--brand-accent-shadow)]
    hover:bg-brand-accent/70 hover:shadow-[0_6px_0_var(--brand-accent-shadow)]
    active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-shadow)]`;

  return (
    <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex items-center justify-center animate-appear p-2 sm:p-4">
      <div className={`w-full max-w-5xl h-full max-h-[90vh] bg-brand-primary backdrop-blur-sm border-2 border-brand-accent rounded-2xl shadow-2xl shadow-brand-accent/20 p-2 sm:p-6 flex flex-col`}>
        <header className="text-center mb-2">
          <h2 className="text-2xl sm:text-3xl font-black text-brand-accent tracking-wider font-mono uppercase">{title}</h2>
          {isProgressive && (
            <p className="text-sm text-brand-light/70 mt-1">{t('memoryGatewayProgressiveDescription')}</p>
          )}
        </header>

        <div className="relative w-full h-8 bg-brand-secondary rounded-full overflow-hidden border border-white/10 shadow-inner mb-4">
            <div 
                className="absolute top-0 left-0 h-full bg-brand-accent-secondary transition-all"
                style={{ width: `${timerProgress}%`, transitionDuration: '1s', transitionTimingFunction: 'linear' }}
            ></div>
             <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg font-black text-brand-light z-10">
                {timeLeft}{t('timeRemainingSuffix')}
            </span>
        </div>

        <main className={`flex-grow p-2 sm:p-4 bg-brand-secondary rounded-lg shadow-inner-strong overflow-hidden overflow-y-auto relative`}>
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
                {wordPool.map(word => (
                    <WordTile
                        key={word}
                        word={word}
                        onClick={handleWordClick}
                        status={getWordStatus(word)}
                        style={tileStyles[word] || {}}
                    />
                ))}
            </div>
            
            {pointPopup && !gameLost && (
                <div key={pointPopup.key} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <span className="text-5xl font-black text-brand-accent-secondary drop-shadow-[0_0_10px_var(--brand-accent-secondary)] animate-score-popup-up">
                        {pointPopup.text}
                    </span>
                </div>
            )}
        </main>
        
        <div className="mt-6 flex justify-center">
            {!gameWon && !gameLost && (
                <button
                    onClick={handleConfirmSelection}
                    disabled={selectedWords.size !== wordsToFind.length}
                    className={`
                        ${passButtonClasses}
                        ${selectedWords.size !== wordsToFind.length
                            ? 'bg-gray-600/50 border-gray-500/80 shadow-none cursor-not-allowed'
                            : 'bg-brand-correct/50 border-brand-correct/80 shadow-[0_4px_0_var(--brand-correct-shadow)] hover:bg-brand-correct/70 hover:shadow-[0_6px_0_var(--brand-correct-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-correct-shadow)]'
                        }
                    `}
                >
                    {t('continue')} ({selectedWords.size}/{wordsToFind.length})
                </button>
            )}
            {gameWon && (
                <button
                    onClick={handleSuccessContinue}
                    className={`${passButtonClasses} ${wonButtonClasses} animate-appear`}
                >
                    {gameMode === 'progressive' ? (
                        t('continueWithBonus', { bonusScore })
                    ) : (
                        <>
                            {t('continue')}{' '}
                            <span className="inline-flex items-center">
                                ({bonusScore >= 0 ? '+' : ''}{bonusScore} <GoldCoinIcon className="inline-block w-5 h-5 ml-1" />)
                            </span>
                        </>
                    )}
                </button>
            )}
            {gameLost && (
                <button
                    onClick={handleFailureContinue}
                    className={`${passButtonClasses} ${lostButtonClasses} animate-appear`}
                >
                    {t('tryAgain')}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;
