import React, { useState, useEffect, useRef } from 'react';
import type { GameStatus, WordChallenge, Difficulty, LevelProgress, GameMode } from '../types';
import LetterCircle from '../components/LetterCircle';
import ChoiceButton from '../components/ChoiceButton';
import Scoreboard from '../components/Scoreboard';
import MoneyDisplay from '../components/MoneyDisplay';
import FeedbackIndicator from '../components/FeedbackIndicator';
import LoadingSpinner from '../components/LoadingSpinner';
import BonusProgressIndicator from '../components/BonusProgressIndicator';
import LifeBonusIndicator from '../components/LifeBonusIndicator';
import CountdownDisplay from '../components/CountdownDisplay';
import Timer from '../components/Timer';
import { useLanguage } from '../components/LanguageContext';
import { MEMORY_GAME_INTERVAL, difficultySettings, difficultyEmojis, ENDLESS_TIMER } from '../config';

interface GamePageProps {
  gameStatus: GameStatus;
  gameMode: GameMode;
  difficulty: Difficulty;
  level: number;
  levelProgress: LevelProgress;
  wordChallenge: WordChallenge;
  timeLeft: number;
  lives: number;
  score: number;
  choices: string[];
  selectedChoice: string | null;
  consecutiveCorrectAnswers: number;
  isPaused: boolean;
  roundCount: number;
  successfulRoundCount: number;
  trophyCount: number;
  handleChoice: (word: string) => void;
  togglePause: () => void;
  onReturnToPracticeMenu: () => void;
  onReturnToMenu: () => void;
  countdownDisplay: number | string | null;
  gameMoney: number;
  endlessWordCount: number;
  animationClass: string | null;
  animationDuration: number | null;
}

interface FlyingCoin {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const GamePage: React.FC<GamePageProps> = ({
  gameStatus,
  gameMode,
  difficulty,
  level,
  levelProgress,
  wordChallenge,
  timeLeft,
  lives,
  score,
  choices,
  selectedChoice,
  consecutiveCorrectAnswers,
  isPaused,
  trophyCount,
  handleChoice,
  togglePause,
  onReturnToPracticeMenu,
  onReturnToMenu,
  countdownDisplay,
  gameMoney,
  endlessWordCount,
  animationClass,
  animationDuration,
}) => {
  const { t } = useLanguage();
  const [displayLives, setDisplayLives] = useState(lives);
  const [isStreakAnimating, setIsStreakAnimating] = useState(false);
  const prevStreakRef = useRef(consecutiveCorrectAnswers);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const choiceButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const moneyDisplayRef = useRef<HTMLDivElement | null>(null);

  const shouldBlur = gameStatus === 'countdown' || isPaused;
  const completedGatewayCount = gameMode === 'endless' ? Math.floor(endlessWordCount / MEMORY_GAME_INTERVAL) : 0;


  useEffect(() => {
    let shouldFlyCoin = false;
    if (gameStatus === 'correct' && selectedChoice) {
      if (gameMode === 'endless') {
        shouldFlyCoin = true;
      } else if (gameMode === 'practice' && consecutiveCorrectAnswers > 0 && consecutiveCorrectAnswers % 10 === 0) {
        shouldFlyCoin = true;
      }
    }

    if (shouldFlyCoin) {
        const correctChoiceIndex = choices.findIndex(c => c === selectedChoice);
        const correctButton = choiceButtonRefs.current[correctChoiceIndex];
        const moneyDisplay = moneyDisplayRef.current;

        if (correctButton && moneyDisplay) {
            const buttonRect = correctButton.getBoundingClientRect();
            const moneyRect = moneyDisplay.getBoundingClientRect();
            
            const startX = buttonRect.left + buttonRect.width / 2;
            const startY = buttonRect.top;
            
            const endX = moneyRect.left + moneyRect.width / 2;
            const endY = moneyRect.top + moneyRect.height / 2;
            
            // Create a burst of coins
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    setFlyingCoins(prev => [...prev, {
                        id: Date.now() + Math.random(),
                        startX: startX + (Math.random() - 0.5) * buttonRect.width * 0.6, // randomize start X
                        startY: startY,
                        endX: endX,
                        endY: endY,
                    }]);
                }, i * 60); // Stagger the coins
            }
        }
    }
  }, [gameStatus, gameMode, selectedChoice, choices, consecutiveCorrectAnswers]);


  // This effect synchronizes the visually rendered hearts with the actual `lives` prop,
  // but introduces a delay on decrease to allow the 'heart-break' animation to play.
  useEffect(() => {
    // If lives are decreasing (a life was lost)
    if (lives < displayLives) {
        // Don't update the display immediately. Wait for the animation to finish.
        const timer = setTimeout(() => {
            setDisplayLives(lives);
        }, 500); // Duration of the 'heart-break' animation
        return () => clearTimeout(timer);
    } else {
        // If lives are increasing (bonus) or it's the initial render, update immediately.
        setDisplayLives(lives);
    }
  }, [lives, displayLives]);

  // Effect to trigger animation on streak increase
  useEffect(() => {
    if (consecutiveCorrectAnswers > prevStreakRef.current) {
      setIsStreakAnimating(true);
      const timer = setTimeout(() => setIsStreakAnimating(false), 300); // match animation duration
      return () => clearTimeout(timer);
    }
    // Reset animation if streak is broken
    if (consecutiveCorrectAnswers === 0 && prevStreakRef.current > 0) {
      setIsStreakAnimating(false);
    }
    prevStreakRef.current = consecutiveCorrectAnswers;
  }, [consecutiveCorrectAnswers]);

  const getChoiceStatus = (word: string): 'correct' | 'incorrect' | 'default' => {
    if (!selectedChoice) return 'default';
    if (word === wordChallenge.correctWord && (selectedChoice === word || gameStatus === 'incorrect')) {
      return 'correct';
    }
    if (word !== wordChallenge.correctWord && selectedChoice === word) {
      return 'incorrect';
    }
    return 'default';
  };
  
  const handleMenuReturn = gameMode === 'practice' ? onReturnToPracticeMenu : onReturnToMenu;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-4 animate-appear">
      {/* Flying Coins for Endless/Practice Mode */}
      {flyingCoins.map(coin => {
          const tx = coin.endX - coin.startX;
          const ty = coin.endY - coin.startY;
          return (
              <div
                  key={coin.id}
                  className="fixed text-2xl z-50 pointer-events-none animate-fly-to-corner"
                  style={{
                      left: `${coin.startX}px`,
                      top: `${coin.startY}px`,
                      '--tx': `${tx}px`,
                      '--ty': `${ty}px`,
                  } as React.CSSProperties}
                  onAnimationEnd={() => setFlyingCoins(prev => prev.filter(c => c.id !== coin.id))}
              >
                  <span>☄️</span>
              </div>
          );
      })}

      {/* New Unified Header */}
      <header className="w-full h-16 flex items-center justify-between gap-2 sm:gap-4 p-2 bg-brand-primary backdrop-blur-sm border-b border-brand-accent-secondary/20 rounded-b-xl shadow-inner-strong">
        {/* Left Section */}
        <div className="flex-1 flex justify-start">
            {gameMode === 'progressive' && (
                <LifeBonusIndicator
                    lives={lives}
                    displayLives={displayLives}
                    consecutiveCorrectAnswers={consecutiveCorrectAnswers}
                />
            )}
            {(gameMode === 'practice' || gameMode === 'endless') && (
                <div ref={moneyDisplayRef}><MoneyDisplay money={gameMoney} /></div>
            )}
        </div>

        {/* Center Section */}
        <div className="flex-1 flex justify-center">
            {gameMode === 'progressive' && (
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-lg font-bold text-brand-light/80">{t('levelAbbr')} {level}</div>
                    <div className="text-2xl -mt-1">{difficultyEmojis[difficulty]}</div>
                </div>
            )}
            {gameMode === 'practice' && (
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-lg font-bold text-brand-light/80">{t(difficulty.toLowerCase() as any)}</div>
                    <div className="text-2xl -mt-1">{difficultyEmojis[difficulty]}</div>
                </div>
            )}
        </div>

        {/* Right Section */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
            {gameMode === 'progressive' && <Scoreboard score={score} />}
            {gameMode === 'practice' && (
                 <div className={`h-10 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm border px-4 shadow-bevel-inner rounded-lg`}>
                    <span className="text-sm sm:text-base font-semibold text-brand-light/80 mr-2">{t('correctStreak')}</span>
                    <span className={`text-lg sm:text-xl font-bold text-brand-accent-secondary w-8 text-left transition-transform ${isStreakAnimating ? 'animate-score-pop' : ''}`}>
                        {consecutiveCorrectAnswers}
                    </span>
                </div>
            )}
             {gameMode === 'endless' && (
                <div className={`h-10 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm border px-4 shadow-bevel-inner rounded-lg`}>
                    <span className={`text-lg sm:text-xl font-bold text-brand-accent-secondary w-16 text-center`}>
                        {endlessWordCount}
                    </span>
                </div>
            )}
            <button
              onClick={togglePause}
              aria-label={t('pauseAria')}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-full shadow-bevel-inner transition-transform hover:scale-110 active:scale-100"
            >
              <svg className="w-6 h-6 text-brand-light" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
            </button>
            <button
              onClick={handleMenuReturn}
              aria-label={t('menu')}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-full shadow-bevel-inner transition-transform hover:scale-110 active:scale-100"
            >
              <svg className="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>
      </header>


      {/* Main Content Area */}
      <main className="w-full flex-grow flex flex-col items-center justify-center relative">
        <div className="flex-grow flex items-center justify-center">
            {(gameStatus === 'loading' || gameStatus === 'advancing') && <LoadingSpinner />}
            <div
                className={`transition-all duration-300 ${shouldBlur ? 'blur-md pointer-events-none' : ''} ${gameStatus === 'playing' ? 'cursor-pointer' : ''}`}
                onClick={gameStatus === 'playing' ? togglePause : undefined}
                aria-label={gameStatus === 'playing' ? t('pauseAria') : undefined}
                role={gameStatus === 'playing' ? 'button' : undefined}
            >
                <LetterCircle
                    key={wordChallenge.correctWord} // Re-mount when the word changes
                    word={wordChallenge.correctWord}
                    difficulty={difficulty}
                    level={level}
                    gameMode={gameMode}
                    questionNumberInDifficulty={gameMode === 'progressive' ? levelProgress[difficulty] : 0}
                    trophyCount={trophyCount}
                    animationClass={animationClass ?? undefined}
                    animationDurationValue={animationDuration ?? undefined}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Timer 
                      duration={gameMode === 'endless' ? ENDLESS_TIMER : difficultySettings[difficulty].timer} 
                      timeLeft={timeLeft} 
                  />
                </div>
            </div>
            {/* Feedback Indicator is an overlay */}
            <FeedbackIndicator status={gameStatus} />
            {/* Countdown Display is also an overlay */}
            <CountdownDisplay value={countdownDisplay} />
        </div>
        {gameMode === 'endless' && (
            <div className="w-full max-w-md mb-2 sm:mb-4 px-2 sm:px-0">
                <BonusProgressIndicator
                    label={t('gatewayLabel', { count: completedGatewayCount + 1 })}
                    icon="🕳️"
                    current={endlessWordCount % MEMORY_GAME_INTERVAL}
                    total={MEMORY_GAME_INTERVAL}
                    ariaLabelKey="memoryBonusProgress"
                />
            </div>
        )}
      </main>

      {/* Footer (Choices) */}
      <footer className={`w-full max-w-2xl px-2 sm:px-4 transition-all duration-300 ${shouldBlur ? 'blur-md pointer-events-none' : ''}`}>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {choices.map((word, index) => (
            <ChoiceButton
              ref={el => { if (el) choiceButtonRefs.current[index] = el; }}
              key={word}
              word={word}
              onClick={handleChoice}
              disabled={!!selectedChoice}
              status={getChoiceStatus(word)}
            />
          ))}
        </div>
      </footer>

      {isPaused && (gameStatus === 'playing' || gameStatus === 'countdown') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/90 backdrop-blur-md z-30 animate-appear">
          <h2 className="text-3xl font-extrabold text-brand-light mb-8 animate-pulse-slow">{t('paused')}</h2>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={togglePause}
              aria-label={t('continue')}
              className="w-full text-center text-lg sm:text-xl font-extrabold p-3 rounded-full flex items-center justify-center gap-2 transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z"></path>
              </svg>
              {t('continue')}
            </button>
            <button
              onClick={handleMenuReturn}
              className="w-full text-center text-lg sm:text-xl font-extrabold p-3 rounded-full flex items-center justify-center gap-2 transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-light bg-brand-warning/50 border-brand-warning/80 shadow-[0_4px_0_var(--brand-warning-shadow)] hover:bg-brand-warning/70 hover:shadow-[0_6px_0_var(--brand-warning-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-warning-shadow)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              {t('returnToMenu')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;