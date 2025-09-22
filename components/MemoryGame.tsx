import React, { useState, useEffect, useMemo } from 'react';
import WordTile from './WordTile';
import { useLanguage } from './LanguageContext';
import { soundService } from '../services/soundService';
import { GameMode } from '../types';

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
const STARTING_LIVES = 2;

const MemoryGame: React.FC<MemoryGameProps> = ({ wordsToFind, allChoices, onClose, onFailure, gatewayNumber, gameMode, endlessWordCount }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [incorrectSelections, setIncorrectSelections] = useState<string[]>([]);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [isClosing, setIsClosing] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [bonusScore, setBonusScore] = useState(0);
  const [pointPopup, setPointPopup] = useState<{ text: string; key: number } | null>(null);

  const correctWordStrings = useMemo(() => wordsToFind.map(w => w.word), [wordsToFind]);
  const isProgressive = gameMode === 'progressive';
  const isCheckpointGateway = !isProgressive;

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

  // Game-ending logic (timer or lives)
  useEffect(() => {
    if (isClosing || gameWon || gameLost) return;

    if (timeLeft <= 0 || lives <= 0) {
      soundService.play('gameOver');
      setGameLost(true);
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, lives, isClosing, gameWon, gameLost]);

  // Handle perfect bonus calculation
  useEffect(() => {
    if (!gameWon) return;

    if (gameMode === 'endless' && endlessWordCount) {
        soundService.play('bonus');
        const perfectBonus = endlessWordCount * 2;
        setBonusScore(perfectBonus); // This overwrites the per-word score, which is correct
        setPointPopup({ text: t('perfectBonus'), key: Date.now() });
    } else if (gameMode === 'progressive') {
        // Progressive mode doubles the score earned within the bonus round
        setTimeout(() => {
            soundService.play('bonus');
            setBonusScore(currentTotal => currentTotal * 2);
            setPointPopup({ text: t('perfectBonus'), key: Date.now() });
        }, 500);
    }
  }, [gameWon, gameMode, endlessWordCount, t]);


  const handleWordClick = (word: string) => {
    if (isClosing || foundWords.includes(word) || gameWon || gameLost) {
      return;
    }

    if (correctWordStrings.includes(word)) {
        soundService.play('correct');

        const scoreForThisWord = gameMode === 'endless' ? 1 : (wordsToFind.find(w => w.word === word)?.score ?? 0);
        
        setBonusScore(prev => prev + scoreForThisWord);
        setPointPopup({ text: `+${scoreForThisWord}`, key: Date.now() });

        const newFoundWords = [...foundWords, word];
        setFoundWords(newFoundWords);

        if (newFoundWords.length === wordsToFind.length) {
            setGameWon(true);
        }
    } else {
      soundService.play('incorrect');
      setLives(prev => prev - 1);
      if (gameMode === 'endless') {
        setBonusScore(prev => prev - 1); // Deduct 1 for incorrect selection
      }
      setIncorrectSelections(prev => [...prev, word]);
      setTimeout(() => {
        setIncorrectSelections(prev => prev.filter(w => w !== word));
      }, 500); // Duration of the shake animation
    }
  };

  const getWordStatus = (word: string) => {
    if (foundWords.includes(word)) return 'found';
    if (incorrectSelections.includes(word)) return 'incorrect';

    // After the game is over, highlight missed words and fade distractors.
    if (gameWon || gameLost) {
        const isTargetWord = correctWordStrings.includes(word);
        if (isTargetWord && !foundWords.includes(word)) {
            return 'missed';
        }
        if (!isTargetWord) {
            return 'distractor';
        }
    }
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-accent tracking-wider">{isProgressive ? t('memoryGatewayProgressiveTitle') : t('memoryGameTitle')}</h2>
          <p className="text-sm text-brand-light/70 mt-1">{isProgressive ? t('memoryGatewayProgressiveDescription') : t('memoryGameDescription')}</p>
        </header>

        <div className="relative w-full h-8 bg-brand-secondary rounded-full overflow-hidden border border-white/10 shadow-inner mb-4">
            <div 
                className="absolute top-0 left-0 h-full bg-brand-accent-secondary transition-all"
                style={{ width: `${timerProgress}%`, transitionDuration: '1s', transitionTimingFunction: 'linear' }}
            ></div>
             <span className="absolute inset-0 flex items-center justify-center text-base sm:text-lg font-bold text-brand-light z-10">
                {timeLeft}{t('timeRemainingSuffix')}
            </span>
        </div>

        <div className="flex justify-center items-center mb-4">
            <div className="flex items-center gap-2" aria-label={t('livesRemaining', {count: lives})}>
                {Array.from({ length: STARTING_LIVES }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`text-2xl transition-all duration-300 ${i < lives ? 'text-brand-accent' : 'text-gray-600 opacity-50'}`} 
                      role="img" 
                      aria-label={i < lives ? t('fullHeart') : t('emptyHeart')}
                    >
                        ❤️
                    </span>
                ))}
            </div>
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
                    <span className="text-5xl font-extrabold text-brand-accent-secondary drop-shadow-[0_0_10px_var(--brand-accent-secondary)] animate-score-popup-up">
                        {pointPopup.text}
                    </span>
                </div>
            )}

            {(gameWon || gameLost) && (
                <div className="absolute inset-0 bg-black/60 z-10 rounded-lg animate-appear flex flex-col items-center justify-center p-4">
                    {gameLost && (
                        <div className="text-center animate-appear">
                            <h3 className="text-4xl font-extrabold text-brand-accent animate-shake-horizontal">{t('memoryGameFailedTitle')}</h3>
                            <p className="mt-4 text-lg text-brand-light">
                                {isProgressive
                                    ? t('progressiveMemoryGameFailedMessage')
                                    : isCheckpointGateway
                                    ? t('memoryGameFailedMessage') 
                                    : t('memoryGameFailedMessageRestart')}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </main>
        
        <div className="mt-6 flex justify-center">
            {gameWon && (
                <button
                    onClick={handleSuccessContinue}
                    className={`
                        w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none
                        ${wonButtonClasses}
                        animate-appear
                    `}
                >
                    {gameMode === 'progressive' ? (
                        t('continueWithBonus', { bonusScore })
                    ) : (
                        <>
                            {t('continue')}{' '}
                            <span>
                                ({bonusScore >= 0 ? '+' : ''}{bonusScore}
                                <span style={{ marginLeft: '0.25rem' }} className="inline-block">☄️</span>)
                            </span>
                        </>
                    )}
                </button>
            )}
            {gameLost && (
                <button
                    onClick={handleFailureContinue}
                    className={`
                        w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none
                        ${lostButtonClasses}
                        animate-appear
                    `}
                >
                    {isProgressive
                        ? t('returnToMenu')
                        : isCheckpointGateway ? t('continue') : t('restartGame')}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default MemoryGame;