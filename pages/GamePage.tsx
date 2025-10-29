import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GameStatus, WordChallenge, Difficulty, PlayerInventory, GameMode } from '../types';
import LetterCircle from '../components/LetterCircle';
import ChoiceButton from '../components/ChoiceButton';
import Scoreboard from '../components/Scoreboard';
import MoneyDisplay from '../components/MoneyDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import LifeBonusIndicator from '../components/LifeBonusIndicator';
import CountdownDisplay from '../components/CountdownDisplay';
import Timer from '../components/Timer';
import FeedbackText from '../components/CorrectWordDisplay';
import { useLanguage } from '../components/LanguageContext';
import { MEMORY_GAME_INTERVAL, difficultySettings, difficultyEmojis, ENDLESS_TIMER, difficultyPoints } from '../config';
import EndlessHighScoreDisplay from '../components/EndlessHighScoreDisplay';
import GoldCoinIcon from '../components/GoldCoinIcon';
import PressableButton from '../components/PressableButton';
import FlyingScore from '../components/FlyingScore';

interface GamePageProps {
  gameStatus: GameStatus;
  gameMode: GameMode;
  difficulty: Difficulty;
  level: number;
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
  endlessScore: number;
  endlessHighScore: number;
  animationClass: string | null;
  animationDuration: number | null;
  activeTheme: string;
  playerInventory: PlayerInventory;
  answeredWordsHistory: string[];
}

interface FlyingCoin {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface FlyingScoreItem {
  id: number;
  score: number;
  startX: number;
  startY: number;
}

const GamePage: React.FC<GamePageProps> = ({
  gameStatus,
  gameMode,
  difficulty,
  level,
  wordChallenge,
  timeLeft,
  lives,
  score,
  choices,
  selectedChoice,
  consecutiveCorrectAnswers,
  isPaused,
  roundCount,
  trophyCount,
  handleChoice,
  togglePause,
  onReturnToPracticeMenu,
  onReturnToMenu,
  countdownDisplay,
  gameMoney,
  endlessWordCount,
  endlessScore,
  endlessHighScore,
  animationClass,
  animationDuration,
  playerInventory,
  activeTheme,
  answeredWordsHistory,
}) => {
  const { t } = useLanguage();
  const [displayLives, setDisplayLives] = useState(lives);
  const [isStreakAnimating, setIsStreakAnimating] = useState(false);
  const prevStreakRef = useRef(consecutiveCorrectAnswers);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [flyingScores, setFlyingScores] = useState<FlyingScoreItem[]>([]);
  const choiceButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // FIX: Updated ref type to HTMLDivElement as it is attached to a div wrapper.
  const moneyDisplayRef = useRef<HTMLDivElement | null>(null);
  const scoreboardRef = useRef<HTMLButtonElement | null>(null);

  const difficultyGroup = useMemo<'easy' | 'medium' | 'hard'>(() => {
    const easy: Difficulty[] = ['Novice', 'Apprentice', 'Adept'];
    const medium: Difficulty[] = ['Skilled', 'Seasoned', 'Veteran'];
    if (easy.includes(difficulty)) {
      return 'easy';
    }
    if (medium.includes(difficulty)) {
      return 'medium';
    }
    return 'hard';
  }, [difficulty]);

  const isFeedbackState = gameStatus === 'correct' || gameStatus === 'incorrect';
  const shouldBlur = gameStatus === 'countdown' || isPaused;
  const completedGatewayCount = gameMode === 'endless' ? Math.floor(endlessWordCount / MEMORY_GAME_INTERVAL) : 0;
  
  const headerBaseClasses = "w-full h-16 flex items-center justify-between gap-2 sm:gap-4 p-2 z-10";
  const headerBoxClasses = "bg-brand-primary backdrop-blur-sm border-b border-brand-light/10 rounded-b-xl shadow-inner-strong";

  // Condition for the special cube: Progressive mode, on Earth (level 1), during the second gateway (rounds 5-9)
  const isSpecialCube = gameMode === 'progressive' && level === 1 && roundCount >= 5 && roundCount < 10;
  
  const timerDuration = gameMode === 'endless' ? ENDLESS_TIMER : difficultySettings[difficulty].timer;

  // Calculate reveal percentage based on time
  const revealPercentage = useMemo(() => {
    // Fully revealed in the last 3 seconds, or if the timer is very short
    if (timeLeft <= 3 || timerDuration <= 3) {
      return 100;
    }

    const totalRevealDuration = timerDuration - 3;
    const timeElapsedInReveal = timerDuration - timeLeft;

    // Don't reveal if time hasn't started moving yet
    if (timeElapsedInReveal < 0) return 0;
    
    // Calculate percentage and cap at 100
    return Math.min(100, (timeElapsedInReveal / totalRevealDuration) * 100);
  }, [timeLeft, timerDuration]);

  const isEasyMode = useMemo(() => difficulty === 'Novice' || difficulty === 'Apprentice', [difficulty]);
  const showWordHistory = useMemo(() => (gameMode === 'progressive' || gameMode === 'practice') && isEasyMode && answeredWordsHistory.length > 0, [gameMode, isEasyMode, answeredWordsHistory]);
  
  const listVariants = {
    visible: {
      transition: { staggerChildren: 0.1 }
    },
    hidden: {}
  };

  const itemVariants = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -20 }
  };


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
  
  const handleChoiceWrapper = (word: string) => {
    const isCorrect = word === wordChallenge.correctWord;
    if (isCorrect && gameMode === 'progressive') {
      const scoreMultiplierLevel = playerInventory.upgrades['score-multiplier'] || 0;
      const basePoints = difficulty ? difficultyPoints[difficulty] : 1;
      const timeBonus = timeLeft;
      const rawPoints = basePoints + timeBonus;
      const finalPoints = Math.round(rawPoints * (1 + scoreMultiplierLevel * 0.1));

      const correctChoiceIndex = choices.findIndex(c => c === word);
      const correctButton = choiceButtonRefs.current[correctChoiceIndex];

      if (correctButton) {
        const buttonRect = correctButton.getBoundingClientRect();
        const startX = buttonRect.left + buttonRect.width / 2;
        const startY = buttonRect.top + buttonRect.height / 2;

        setFlyingScores(prev => [...prev, {
            id: Date.now() + Math.random(),
            score: finalPoints,
            startX,
            startY
        }]);
      }
    }
    handleChoice(word);
  };

  const getChoiceStatus = (word: string): 'correct' | 'incorrect' | 'default' => {
    if (!selectedChoice) {
      return 'default';
    }
    if (selectedChoice === word) {
      return word === wordChallenge.correctWord ? 'correct' : 'incorrect';
    }
    return 'default';
  };
  
  const handleMenuReturn = gameMode === 'practice' ? onReturnToPracticeMenu : onReturnToMenu;

  return (
    <div className="relative w-full h-full">
      <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-4">

      {showWordHistory && (
        <motion.div 
            className="glass-panel absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 z-20 p-2 sm:p-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
        >
            <h3 className="text-xs sm:text-sm font-bold text-brand-light/70 mb-2">{t('previousWords')}</h3>
            <motion.ul 
                className="space-y-1"
                variants={listVariants}
                initial="hidden"
                animate="visible"
            >
                {answeredWordsHistory.map((word, index) => (
                    <motion.li 
                        key={`${word}-${index}`} 
                        variants={itemVariants} 
                        className={
                            index === answeredWordsHistory.length - 1
                            ? "text-lg sm:text-xl font-mono font-bold text-brand-accent-secondary"
                            : "text-base sm:text-lg font-mono text-brand-light/50"
                        }
                    >
                        {word}
                    </motion.li>
                ))}
            </motion.ul>
        </motion.div>
      )}

      {/* Flying Coins for Endless/Practice Mode */}
      {flyingCoins.map(coin => {
          const tx = coin.endX - coin.startX;
          const ty = coin.endY - coin.startY;
          return (
              <div
                  key={coin.id}
                  className="fixed z-50 pointer-events-none animate-fly-to-corner"
                  style={{
                      left: `${coin.startX}px`,
                      top: `${coin.startY}px`,
                      '--tx': `${tx}px`,
                      '--ty': `${ty}px`,
                  } as React.CSSProperties}
                  onAnimationEnd={() => setFlyingCoins(prev => prev.filter(c => c.id !== coin.id))}
              >
                  <GoldCoinIcon className="w-6 h-6" />
              </div>
          );
      })}
      
      <AnimatePresence>
        {flyingScores.map(fs => (
            <FlyingScore
                key={fs.id}
                score={fs.score}
                startX={fs.startX}
                startY={fs.startY}
                targetRef={scoreboardRef}
                onComplete={() => {
                    setFlyingScores(prev => prev.filter(f => f.id !== fs.id));
                }}
            />
        ))}
      </AnimatePresence>

      {/* New Unified Header */}
      <header className={`${headerBaseClasses} ${gameMode !== 'endless' ? headerBoxClasses : ''}`}>
        {gameMode === 'endless' ? (
          <>
            {/* Empty div to push content to the right due to justify-between */}
            <div />

            {/* Right: Score Displays */}
            <div className="flex items-center gap-2 sm:gap-4">
              <EndlessHighScoreDisplay score={endlessScore} />
              <div ref={moneyDisplayRef}><MoneyDisplay money={gameMoney} /></div>
            </div>
          </>
        ) : (
          <>
            {/* Left Section (Progressive/Practice) */}
            <div className="flex-1 flex justify-start">
              {gameMode === 'progressive' && (
                <LifeBonusIndicator
                  lives={lives}
                  displayLives={displayLives}
                  consecutiveCorrectAnswers={consecutiveCorrectAnswers}
                />
              )}
              {gameMode === 'practice' && (
                <div ref={moneyDisplayRef}><MoneyDisplay money={gameMoney} /></div>
              )}
            </div>

            {/* Center Section (Progressive/Practice) */}
            <div className="flex-1 flex justify-center">
              {gameMode === 'progressive' && (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-black text-brand-light/80">{t('levelAbbr')} {level}</div>
                  <div className="text-2xl -mt-1">{difficultyEmojis[difficulty]}</div>
                </div>
              )}
              {gameMode === 'practice' && (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-lg font-black text-brand-light/80">{t(difficulty.toLowerCase() as any)}</div>
                  <div className="text-2xl -mt-1">{difficultyEmojis[difficulty]}</div>
                </div>
              )}
            </div>

            {/* Right Section (Progressive/Practice) */}
            <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
              {gameMode === 'progressive' && <Scoreboard ref={scoreboardRef} score={score} />}
              {gameMode === 'practice' && (
                <div className={`h-10 flex items-center justify-center bg-gradient-to-br from-brand-secondary/50 to-brand-primary/50 border-brand-light/10 backdrop-blur-sm border px-4 shadow-bevel-inner rounded-lg`}>
                  <span className="text-sm sm:text-base font-black text-brand-light/80 mr-2">{t('correctStreak')}</span>
                  <span className={`text-lg sm:text-xl font-black text-brand-accent-secondary w-8 text-left transition-transform ${isStreakAnimating ? 'animate-score-pop' : ''}`}>
                    {consecutiveCorrectAnswers}
                  </span>
                </div>
              )}
              <button
                onClick={togglePause}
                aria-label={t('pauseAria')}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-brand-light/10 rounded-full shadow-bevel-inner transition-transform hover:scale-110 active:scale-100"
              >
                <svg className="w-6 h-6 text-brand-light" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
              </button>
              <button
                onClick={handleMenuReturn}
                aria-label={t('menu')}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-brand-light/10 rounded-full shadow-bevel-inner transition-transform hover:scale-110 active:scale-100"
              >
                <svg className="w-6 h-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
            </div>
          </>
        )}
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
                    trophyCount={trophyCount}
                    animationClass={animationClass || undefined}
                    animationDurationValue={animationDuration ?? undefined}
                    activeTheme={activeTheme}
                    isSpecialCube={isSpecialCube}
                    isExiting={isFeedbackState}
                    showCorrectAnimation={gameStatus === 'correct'}
                    showIncorrectAnimation={gameStatus === 'incorrect'}
                />
            </div>
            {/* Countdown Display is also an overlay */}
            <CountdownDisplay value={countdownDisplay} />
            <AnimatePresence>
              {(gameStatus === 'correct' || gameStatus === 'incorrect') && (
                <FeedbackText status={gameStatus} />
              )}
            </AnimatePresence>
        </div>
      </main>

      {/* Timer Bar */}
      <div className={`w-full max-w-2xl px-2 sm:px-4 mb-2 sm:mb-4 transition-all duration-300 ${shouldBlur ? 'blur-md pointer-events-none' : ''}`}>
          <Timer 
              duration={timerDuration} 
              timeLeft={timeLeft} 
          />
      </div>

      {/* Footer (Choices) */}
      <footer className={`w-full max-w-2xl px-2 sm:px-4 transition-all duration-300 ${shouldBlur ? 'blur-md pointer-events-none' : ''}`}>
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {choices.map((word, index) => (
            <ChoiceButton
              ref={el => { if (el) choiceButtonRefs.current[index] = el; }}
              key={word}
              word={word}
              onClick={handleChoiceWrapper}
              disabled={!!selectedChoice}
              status={getChoiceStatus(word)}
              revealPercentage={revealPercentage}
              revealDirection={difficultyGroup}
            />
          ))}
        </div>
      </footer>

      {isPaused && (gameStatus === 'playing' || gameStatus === 'countdown') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/90 backdrop-blur-md z-30 animate-appear">
          <h2 className="text-3xl font-black text-brand-light/80 mb-8 animate-pulse-slow">{t('paused')}</h2>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <PressableButton onClick={togglePause} color="secondary" className="w-full">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
                {t('continue')}
              </span>
            </PressableButton>
            <PressableButton onClick={handleMenuReturn} color="warning" className="w-full">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                {t('returnToMenu')}
              </span>
            </PressableButton>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default GamePage;