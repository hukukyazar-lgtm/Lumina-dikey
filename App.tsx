import React, { useState, useEffect, useCallback, useRef } from 'react';
import Settings from './components/Settings';
import IntroAnimation from './components/IntroAnimation';
import MainLayout from './components/MainLayout';
import MenuPage from './pages/MenuPage';
import GamePage from './pages/GamePage';
import GameOverPage from './pages/GameOverPage';
import LevelCompletePage from './pages/LevelCompletePage';
import DuelPage from './pages/DuelPage';
import DuelGameOverPage from './pages/DuelGameOverPage';
import DuelRoundOverPage from './pages/DuelRoundOverPage';
import MemoryGame from './components/MemoryGame';
import ConfirmationModal from './components/ConfirmationModal';
import LeaderboardPage from './pages/LeaderboardPage';
import { useLanguage } from './components/LanguageContext';
import { fetchWordChallenge } from './services/geminiService';
import { saveLocalHighScore } from './services/scoreService';
import { soundService } from './services/soundService';
import { saveGuestProgress, loadGuestProgress, clearGuestProgress, saveEndlessHighScore, loadEndlessHighScore, saveEndlessProgress, loadEndlessProgress, clearEndlessProgress, saveTotalMoney, loadTotalMoney } from './services/progressService';
import type { GameStatus, WordChallenge, Difficulty, LevelProgress, GameMode, WordLength, SavedProgress, SavedEndlessState } from './types';
import { difficultySettings, LIFE_BONUS_INTERVAL, STARTING_LIVES, MEMORY_GAME_INTERVAL, MAX_LIVES, difficultyProgression, difficultyPoints, difficultyBackgrounds, ENDLESS_TIMER, endlessAnimations, planetImageUrls, MENU_BACKGROUND_URL } from './config';


// Helper to get all unique background images
const allBackgrounds = Object.values(difficultyBackgrounds).flat();
const allUniqueBackgrounds = [...new Set(allBackgrounds)];

// Helper to shuffle the choices array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Helper to create initial progress object
const initialLevelProgress = (): LevelProgress => ({
  Novice: 0, Apprentice: 0, Adept: 0, Skilled: 0, Seasoned: 0,
  Veteran: 0, Master: 0, Grandmaster: 0, Legend: 0, Mythic: 0,
});

export default function App() {
  const { gameplayLanguage, t, sfxVolume, musicVolume } = useLanguage();
  const [wordChallenge, setWordChallenge] = useState<WordChallenge | null>(null);
  const [playerName] = useState('Guest');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [lastPlayedDifficulty, setLastPlayedDifficulty] = useState<Difficulty | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('intro');
  const [previousGameStatus, setPreviousGameStatus] = useState<GameStatus>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  const [isPaused, setIsPaused] = useState(false);
  const [isQuitConfirmVisible, setIsQuitConfirmVisible] = useState(false);
  const [startInPracticeView, setStartInPracticeView] = useState(false);
  const [roundCount, setRoundCount] = useState(0);
  const [successfulRoundCount, setSuccessfulRoundCount] = useState(0);
  const [consecutiveCorrectAnswers, setConsecutiveCorrectAnswers] = useState(0);
  const [memoryGameWordData, setMemoryGameWordData] = useState<Array<{ word: string; score: number }>>([]);
  const [memoryGameAllChoices, setMemoryGameAllChoices] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>(null);

  // New states for level-based progression and crowning
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState<LevelProgress>(initialLevelProgress());
  const [currentDifficultyIndex, setCurrentDifficultyIndex] = useState(0);
  const [trophyCount, setTrophyCount] = useState(0);
  const [currentGatewayNumber, setCurrentGatewayNumber] = useState<number | null>(null);
  
  // New state for countdown
  const [countdownDisplay, setCountdownDisplay] = useState<number | string | null>(null);

  // States for Duel Mode
  const [player1Score, setPlayer1Score] = useState(0); // Score within a round
  const [player2Score, setPlayer2Score] = useState(0); // Score within a round
  const [duelWinner, setDuelWinner] = useState<1 | 2 | 'draw' | null>(null); // Final game winner
  const [duelDifficultyIndex, setDuelDifficultyIndex] = useState(0); // Question index (0-9)
  const [duelRoundWinners, setDuelRoundWinners] = useState<Partial<Record<Difficulty, 1 | 2>>>({});
  const [duelTurn, setDuelTurn] = useState<'first' | 1 | 2>('first');
  const [duelSecondPlayerTimeLeft, setDuelSecondPlayerTimeLeft] = useState<number | null>(null);
  const [duelPointChange, setDuelPointChange] = useState<{ player: 1 | 2; points: number; key: number } | null>(null);
  
  // New states for multi-round duel
  const [duelCurrentRound, setDuelCurrentRound] = useState(1);
  const [duelRoundWinsCount, setDuelRoundWinsCount] = useState({ player1: 0, player2: 0 });
  const [duelCurrentRoundWinner, setDuelCurrentRoundWinner] = useState<1 | 2 | 'draw' | null>(null);
  
  // States for background image cross-fading to prevent lag
  const [bgIndex, setBgIndex] = useState(0); // 0 or 1, indicates the active background div
  const [bgUrls, setBgUrls] = useState<(string | null)[]>([null, null]);
  
  // States for Endless Mode
  const [gameMoney, setGameMoney] = useState(0);
  const [endlessWordCount, setEndlessWordCount] = useState(0);
  const [endlessHighScore, setEndlessHighScore] = useState(0);
  const [currentAnimationClass, setCurrentAnimationClass] = useState<string | null>(null);
  const [currentAnimationDuration, setCurrentAnimationDuration] = useState<number | null>(null);
  const [endlessCheckpoint, setEndlessCheckpoint] = useState<SavedEndlessState | null>(null);

  const usedWords = useRef<Set<string>>(new Set());
  const isFirstQuestionOfSession = useRef(true);
  const visibleBgUrl = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

    // Wrapper function to update money in state and persistent storage
    const updateGameMoney = useCallback((updater: React.SetStateAction<number>) => {
        setGameMoney(prevMoney => {
            const newMoney = typeof updater === 'function' ? updater(prevMoney) : updater;
            saveTotalMoney(newMoney);
            return newMoney;
        });
    }, []);

    const updateBackground = useCallback((newBgUrl: string) => {
        if (newBgUrl === visibleBgUrl.current) return;

        // Create an image element to ensure it's loaded before we transition.
        const img = new Image();
        img.src = newBgUrl;

        img.onload = () => {
            // The image is now in the browser cache and ready to be displayed without lag.
            const nextBgIndex = (bgIndex + 1) % 2;
            
            // This sets the background on the hidden div
            setBgUrls(currentUrls => {
                const newUrls = [...currentUrls];
                newUrls[nextBgIndex] = newBgUrl;
                return newUrls;
            });

            // This short timeout allows React to commit the state update to the DOM.
            // After this, we trigger the next state update which starts the CSS opacity transition.
            setTimeout(() => {
                setBgIndex(nextBgIndex);
                visibleBgUrl.current = newBgUrl;
            }, 50);
        };
        
        img.onerror = () => {
            console.error(`Background image failed to load: ${newBgUrl}`);
        };
    }, [bgIndex]);

    useEffect(() => {
        // Preload all unique background images to warm up the cache.
        allUniqueBackgrounds.forEach(bgUrl => {
            const img = new Image();
            img.src = bgUrl;
        });
        // Preload all planet images for the menu
        planetImageUrls.forEach(planetUrl => {
            const img = new Image();
            img.src = planetUrl;
        });
        // Set the initial background.
        updateBackground(MENU_BACKGROUND_URL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChoice = useCallback((word: string, player?: 1 | 2) => {
        if (gameStatus !== 'playing' && gameStatus !== 'duelPlaying') return;

        stopTimer();
        setSelectedChoice(word);
        const isCorrect = word === wordChallenge?.correctWord;

        if (gameMode === 'duel') {
            if (!player || !difficulty) return;
            soundService.play(isCorrect ? 'correct' : 'incorrect');
            const points = isCorrect ? (10 + timeLeftRef.current) : 0;

            if (player === 1) {
                setPlayer1Score(points);
                setDuelPointChange({ player: 1, points, key: Date.now() });
                setDuelTurn(2);
                setTimeLeft(difficultySettings[difficulty].timer);
            } else { // Player 2
                setPlayer2Score(points);
                setDuelPointChange({ player: 2, points, key: Date.now() });
                setGameStatus('duelRoundOver');
            }
            return;
        }

        if (gameMode === 'progressive') {
            setRoundCount(r => r + 1);
            if (isCorrect) {
                soundService.play('correct');
                setGameStatus('correct');
                const points = difficulty ? difficultyPoints[difficulty] : 1;
                setScore(s => s + points);
                setSuccessfulRoundCount(c => c + 1);
                
                // Add data for memory game
                setMemoryGameWordData(prev => [...prev, {word, score: points}]);
                setMemoryGameAllChoices(prev => shuffleArray([...new Set([...prev, ...choices])]));

                const newConsecutive = consecutiveCorrectAnswers + 1;
                if (newConsecutive >= LIFE_BONUS_INTERVAL) {
                    setLives(l => Math.min(l + 1, MAX_LIVES));
                    setConsecutiveCorrectAnswers(0);
                } else {
                    setConsecutiveCorrectAnswers(newConsecutive);
                }

                setLevelProgress(prev => {
                    const newProgress = { ...prev };
                    if (difficulty) {
                        newProgress[difficulty] = (newProgress[difficulty] || 0) + 1;
                    }
                    return newProgress;
                });
            } else {
                soundService.play('lifeLost');
                setGameStatus('incorrect');
                const newLives = lives - 1;
                setLives(newLives);
                setConsecutiveCorrectAnswers(0);
            }
        } else if (gameMode === 'endless') {
             setRoundCount(r => r + 1);

            // Always record the data for the memory game, regardless of outcome.
            if (wordChallenge) {
                setMemoryGameWordData(prev => [...prev, { word: wordChallenge.correctWord, score: 1 }]);
            }
            setMemoryGameAllChoices(prev => shuffleArray([...new Set([...prev, ...choices])]));
             
             if (isCorrect) {
                soundService.play('correct');
                setGameStatus('correct');
                updateGameMoney(m => m + 1);
                setEndlessWordCount(c => c + 1);
                usedWords.current.add(word);
            } else {
                soundService.play('incorrect');
                setGameStatus('incorrect');
            }
        } else { // Practice
            if (isCorrect) {
                soundService.play('correct');
                setGameStatus('correct');
                setConsecutiveCorrectAnswers(c => {
                    const newStreak = c + 1;
                    if (newStreak > 0 && newStreak % 10 === 0) {
                        updateGameMoney(m => m + 1);
                    }
                    return newStreak;
                 });
            } else {
                soundService.play('incorrect');
                setGameStatus('incorrect');
                setConsecutiveCorrectAnswers(0);
            }
        }
    }, [gameStatus, stopTimer, wordChallenge, gameMode, difficulty, lives, consecutiveCorrectAnswers, choices, updateGameMoney]);

    useEffect(() => {
        if ((gameStatus === 'playing' || gameStatus === 'duelPlaying') && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        stopTimer();
                        handleChoice('', undefined);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [gameStatus, isPaused, stopTimer, handleChoice]);


  const handleOpenSettings = useCallback(() => {
    setPreviousGameStatus(gameStatus);
    setGameStatus('settings');
  }, [gameStatus]);

  const handleReturnToMenu = useCallback(() => {
    stopTimer();
    updateBackground(MENU_BACKGROUND_URL);
    setGameStatus('menu');
    setGameMode(null);
    setDifficulty(null);
    setIsPaused(false);
  }, [stopTimer, updateBackground]);

  const togglePause = useCallback(() => {
    if (gameStatus === 'playing' || gameStatus === 'duelPlaying') {
      setIsPaused(p => !p);
      soundService.play('click');
    }
  }, [gameStatus]);

    const handleSelectMode = useCallback((mode: Difficulty | 'progressive' | 'duel' | 'endless') => {
        if (mode === 'endless') {
            setGameMode('endless');
            setDifficulty('Novice');
            const savedState = loadEndlessProgress();
            if (savedState) {
                // Money is already loaded globally, just load game state
                setEndlessWordCount(savedState.endlessWordCount);
                setRoundCount(savedState.roundCount);
                setMemoryGameWordData(savedState.memoryGameWordData);
                setMemoryGameAllChoices(savedState.memoryGameAllChoices);
                setEndlessCheckpoint(savedState);
                savedState.usedWords.forEach(w => usedWords.current.add(w));
                isFirstQuestionOfSession.current = false; // Continuing, so no countdown.
            } else {
                // Money is preserved, just reset game state
                setEndlessWordCount(0);
                setRoundCount(0);
                setMemoryGameWordData([]);
                setMemoryGameAllChoices([]);
                setEndlessCheckpoint(null);
                usedWords.current.clear();
                isFirstQuestionOfSession.current = true; // A new game.
            }
        } else if (mode === 'progressive') {
            clearGuestProgress();
            setGameMode('progressive');
            setDifficulty('Novice');
            setScore(0);
            setLives(STARTING_LIVES);
            setLevel(1);
            setLevelProgress(initialLevelProgress());
            setCurrentDifficultyIndex(0);
            setConsecutiveCorrectAnswers(0);
            setRoundCount(0);
            setSuccessfulRoundCount(0);
            setMemoryGameWordData([]);
            setMemoryGameAllChoices([]);
            usedWords.current.clear();
            isFirstQuestionOfSession.current = true; // A new game.
        } else if (mode === 'duel') {
            setGameMode('duel');
            setPlayer1Score(0);
            setPlayer2Score(0);
            setDuelCurrentRound(1);
            setDuelRoundWinsCount({ player1: 0, player2: 0 });
            setDuelWinner(null);
            setDuelDifficultyIndex(0);
            setDifficulty(difficultyProgression[0]);
            setDuelRoundWinners({});
            isFirstQuestionOfSession.current = true; // A new game.
        } else {
            setGameMode('practice');
            setDifficulty(mode);
            setConsecutiveCorrectAnswers(0);
            isFirstQuestionOfSession.current = true; // A new game.
        }
        setGameStatus('loading');
    }, []);

  const handleOpenLeaderboard = useCallback(() => {
    setGameStatus('leaderboard');
  }, []);
  
    useEffect(() => {
        if (gameStatus === 'intro') {
            const timer = setTimeout(() => {
                soundService.init();
                // Load global stats
                setEndlessHighScore(loadEndlessHighScore());
                
                // Load master money record and handle one-time migration from old system
                const savedTotalMoney = loadTotalMoney();
                const savedEndless = loadEndlessProgress();
                const initialMoney = Math.max(savedTotalMoney, savedEndless?.gameMoney ?? 0);
                updateGameMoney(initialMoney); // This sets state and saves to localStorage
                
                if (savedEndless) {
                    setEndlessCheckpoint(savedEndless);
                }
                
                const savedProgress = loadGuestProgress();
                if (savedProgress) {
                    setGameStatus('continuePrompt');
                } else {
                    setGameStatus('menu');
                }
            }, 3500);
            return () => clearTimeout(timer);
        }

        if (gameStatus === 'loading' || gameStatus === 'advancing') {
            const fetchNewWord = async () => {
                let currentDifficulty = difficulty;
                 if (gameMode === 'duel' && gameStatus === 'advancing') {
                    setPlayer1Score(0);
                    setPlayer2Score(0);
                    setDuelCurrentRoundWinner(null);
                    const nextIndex = (duelDifficultyIndex + 1) % difficultyProgression.length;
                    setDuelDifficultyIndex(nextIndex);
                    const nextDifficulty = difficultyProgression[nextIndex];
                    setDifficulty(nextDifficulty);
                    currentDifficulty = nextDifficulty;
                } else if (gameMode === 'endless') {
                    const gateway = Math.floor(endlessWordCount / MEMORY_GAME_INTERVAL);
                    const difficultyIdx = Math.min(gateway, difficultyProgression.length - 1);
                    currentDifficulty = difficultyProgression[difficultyIdx];
                    setDifficulty(currentDifficulty);
                    
                    const animClass = endlessAnimations[Math.floor(Math.random() * endlessAnimations.length)];
                    const animDuration = (Math.random() * 4) + 4;
                    setCurrentAnimationClass(animClass);
                    setCurrentAnimationDuration(animDuration);
                } else if (gameMode === 'progressive' && gameStatus === 'advancing' && difficulty) {
                    // Check if current difficulty is completed
                    if (levelProgress[difficulty] >= 1) {
                        const nextDifficultyIndex = currentDifficultyIndex + 1;
                        if (nextDifficultyIndex >= difficultyProgression.length) {
                            setGameStatus('levelComplete');
                            return; // Stop fetching
                        } else {
                            setCurrentDifficultyIndex(nextDifficultyIndex);
                            const nextDifficulty = difficultyProgression[nextDifficultyIndex];
                            setDifficulty(nextDifficulty);
                            currentDifficulty = nextDifficulty;
                        }
                    }
                }
                
                if (!currentDifficulty) return;

                const availableBgs = difficultyBackgrounds[currentDifficulty];
                const randomBg = availableBgs[Math.floor(Math.random() * availableBgs.length)];
                updateBackground(randomBg);
                
                const wordLen = difficultySettings[currentDifficulty].wordLength;
                const challenge = await fetchWordChallenge(wordLen, gameplayLanguage, usedWords.current);

                setWordChallenge(challenge);
                const allWordsForChoices = shuffleArray([challenge.correctWord, ...challenge.incorrectWords]);
                setChoices(allWordsForChoices);

                setSelectedChoice(null);

                if (isFirstQuestionOfSession.current) {
                    setGameStatus('countdown');
                    isFirstQuestionOfSession.current = false;
                } else {
                    setGameStatus(gameMode === 'duel' ? 'duelPlaying' : 'playing');
                    if (gameMode === 'duel') {
                        setDuelTurn(1);
                    }
                    const timerDuration = gameMode === 'endless' ? ENDLESS_TIMER : difficultySettings[currentDifficulty].timer;
                    setTimeLeft(timerDuration);
                }
            };
            fetchNewWord();
        }
    }, [gameStatus, difficulty, gameplayLanguage, gameMode, duelDifficultyIndex, updateBackground, endlessWordCount, levelProgress, currentDifficultyIndex]);

    useEffect(() => {
        if (gameStatus === 'countdown') {
            soundService.play('countdownTick');
            setCountdownDisplay(3);
            const timers = [
                setTimeout(() => { setCountdownDisplay(2); soundService.play('countdownTick'); }, 1000),
                setTimeout(() => { setCountdownDisplay(1); soundService.play('countdownTick'); }, 2000),
                setTimeout(() => { setCountdownDisplay(t('countdownGo')); soundService.play('countdownGo'); }, 3000),
                setTimeout(() => {
                    setCountdownDisplay(null);
                    setGameStatus(gameMode === 'duel' ? 'duelPlaying' : 'playing');
                    if (gameMode === 'duel') {
                        setDuelTurn(1);
                    }
                    if (difficulty) {
                        const timerDuration = gameMode === 'endless' ? ENDLESS_TIMER : difficultySettings[difficulty].timer;
                        setTimeLeft(timerDuration);
                    }
                }, 3500)
            ];
            return () => timers.forEach(clearTimeout);
        }
    }, [gameStatus, difficulty, t, gameMode]);

  useEffect(() => {
    if (gameStatus !== 'correct' && gameStatus !== 'incorrect') {
      return;
    }

    const timer = setTimeout(() => {
      if (gameMode === 'practice') {
        setGameStatus('advancing');
      } else if (gameMode === 'endless') {
        if (roundCount > 0 && (roundCount % MEMORY_GAME_INTERVAL === 0)) {
            const gatewayNumber = roundCount / MEMORY_GAME_INTERVAL;
            setCurrentGatewayNumber(gatewayNumber);
            setGameStatus('memoryGame');
        } else {
            setGameStatus('advancing');
        }
      } else if (gameMode === 'progressive') {
        // First, check for game over condition
        if (gameStatus === 'incorrect' && lives < 1) {
            soundService.play('gameOver');
            saveLocalHighScore(playerName, score, level);

            // Convert points to money and save to the master record
            const moneyEarned = Math.floor(score / 100);
            if (moneyEarned > 0) {
                updateGameMoney(m => m + moneyEarned);
            }

            setGameStatus('gameOver');
        }
        // Second, check for Memory Gateway trigger (on ANY question)
        else if (roundCount > 0 && roundCount % MEMORY_GAME_INTERVAL === 0) {
            const gatewayNumber = roundCount / MEMORY_GAME_INTERVAL;
            setCurrentGatewayNumber(gatewayNumber);
            setGameStatus('memoryGame');
        }
        // Otherwise, advance to the next question
        else {
            setGameStatus('advancing');
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [gameStatus, lives, gameMode, playerName, score, level, roundCount, updateGameMoney]);

    useEffect(() => {
        if (gameStatus === 'duelRoundOver') {
            soundService.play('bonus');
            let roundWinner: 1 | 2 | 'draw';
            if (player1Score > player2Score) roundWinner = 1;
            else if (player2Score > player1Score) roundWinner = 2;
            else roundWinner = 'draw';

            setDuelCurrentRoundWinner(roundWinner);

            const newWins = { ...duelRoundWinsCount };
            if (roundWinner === 1) {
                newWins.player1++;
                setDuelRoundWinners(prev => ({ ...prev, [difficulty!]: 1 }));
            }
            if (roundWinner === 2) {
                newWins.player2++;
                setDuelRoundWinners(prev => ({ ...prev, [difficulty!]: 2 }));
            }
            setDuelRoundWinsCount(newWins);
        }
    }, [gameStatus, player1Score, player2Score, difficulty, duelRoundWinsCount]);

    const handleDuelContinue = useCallback(() => {
        soundService.play('click');
        if (duelRoundWinsCount.player1 >= 3 || duelRoundWinsCount.player2 >= 3) {
            let gameWinner: 1 | 2 | 'draw' | null = null;
            if (duelRoundWinsCount.player1 > duelRoundWinsCount.player2) gameWinner = 1;
            else if (duelRoundWinsCount.player2 > duelRoundWinsCount.player1) gameWinner = 2;
            else gameWinner = 'draw';
            setDuelWinner(gameWinner);
            soundService.play('gameOver');
            setGameStatus('duelGameOver');
        } else {
            setDuelCurrentRound(r => r + 1);
            setGameStatus('advancing');
        }
    }, [duelRoundWinsCount]);

    const handleMemoryGameClose = useCallback((bonus: number) => {
        if (gameMode === 'endless') {
            const newMoney = gameMoney + bonus;
            updateGameMoney(newMoney);
            
            if (newMoney > endlessHighScore) {
                 saveEndlessHighScore(newMoney);
                 setEndlessHighScore(newMoney);
            }
            
            // Save checkpoint AFTER successful gateway completion
            const progressToSave: SavedEndlessState = {
                gameMoney: newMoney,
                endlessWordCount: endlessWordCount,
                roundCount: roundCount,
                memoryGameWordData: [], // This data is for the next round, so start fresh
                memoryGameAllChoices: [],
                usedWords: Array.from(usedWords.current)
            };
            saveEndlessProgress(progressToSave);
            setEndlessCheckpoint(progressToSave);
            
            setMemoryGameWordData([]);
            setMemoryGameAllChoices([]);
            setGameStatus('advancing');

        } else if (gameMode === 'progressive') {
            setScore(s => s + bonus);
            setMemoryGameWordData([]);
            setMemoryGameAllChoices([]);
            setGameStatus('advancing');
        }
    }, [endlessWordCount, gameMode, gameMoney, roundCount, usedWords, updateGameMoney, endlessHighScore]);

    const handleMemoryGameFailure = useCallback(() => {
        if (gameMode === 'progressive') {
            soundService.play('gameOver');
            saveLocalHighScore(playerName, score, level);
            clearGuestProgress();

            // Convert points to money and save to master record
            const moneyEarned = Math.floor(score / 100);
            if (moneyEarned > 0) {
                updateGameMoney(m => m + moneyEarned);
            }

            setGameStatus('gameOver');
            return;
        }

        // Endless mode logic: Every gateway failure sends you back to the previous successful one.
        if (gameMode === 'endless') {
            soundService.play('lifeLost');
            if (endlessCheckpoint) {
                // Restore from the last successful checkpoint
                updateGameMoney(endlessCheckpoint.gameMoney);
                setEndlessWordCount(endlessCheckpoint.endlessWordCount);
                setRoundCount(endlessCheckpoint.roundCount);
                usedWords.current = new Set(endlessCheckpoint.usedWords);
            } else {
                // Failed the very first gateway, so reset progress but PRESERVE money.
                setEndlessWordCount(0);
                setRoundCount(0);
                usedWords.current.clear();
                clearEndlessProgress(); // Clear saved progress as well, but money is safe.
            }
            // Clear memory game data for the next attempt and continue
            setMemoryGameWordData([]);
            setMemoryGameAllChoices([]);
            setGameStatus('advancing');
        }
    }, [endlessCheckpoint, gameMode, playerName, score, level, updateGameMoney]);


  const renderContent = () => {
    switch (gameStatus) {
        case 'settings':
            return <Settings onClose={() => setGameStatus(previousGameStatus)} playerName={playerName} />;
        case 'menu':
        case 'leaderboard':
            return (
                <MainLayout
                    gameStatus={gameStatus}
                    gameMode={gameMode}
                    onOpenLeaderboard={handleOpenLeaderboard}
                    onReturnToMenu={handleReturnToMenu}
                    difficulty={difficulty}
                    gameMoney={gameMoney}
                    trophyCount={trophyCount}
                >
                    {gameStatus === 'menu' && <MenuPage 
                        onSelect={handleSelectMode} 
                        startInPracticeView={startInPracticeView}
                        onOpenSettings={handleOpenSettings}
                    />}
                    {gameStatus === 'leaderboard' && <LeaderboardPage onReturnToMenu={handleReturnToMenu} />}
                </MainLayout>
            );
        case 'loading':
        case 'advancing':
        case 'countdown':
        case 'playing':
        case 'correct':
        case 'incorrect':
            if (!difficulty || !wordChallenge) {
                return <div className="flex items-center justify-center h-full">Loading...</div>;
            }
            return (
                <GamePage
                    gameStatus={gameStatus}
                    gameMode={gameMode}
                    difficulty={difficulty}
                    level={level}
                    levelProgress={levelProgress}
                    wordChallenge={wordChallenge}
                    timeLeft={timeLeft}
                    lives={lives}
                    score={score}
                    choices={choices}
                    selectedChoice={selectedChoice}
                    consecutiveCorrectAnswers={consecutiveCorrectAnswers}
                    isPaused={isPaused}
                    roundCount={roundCount}
                    successfulRoundCount={successfulRoundCount}
                    trophyCount={trophyCount}
                    handleChoice={handleChoice}
                    togglePause={togglePause}
                    onReturnToPracticeMenu={handleReturnToMenu}
                    onReturnToMenu={handleReturnToMenu}
                    countdownDisplay={countdownDisplay}
                    gameMoney={gameMoney}
                    endlessWordCount={endlessWordCount}
                    animationClass={currentAnimationClass}
                    animationDuration={currentAnimationDuration}
                />
            );
        case 'gameOver':
            return <GameOverPage score={score} level={level} missedWord={wordChallenge?.correctWord ?? null} onReturnToMenu={handleReturnToMenu} gameMode={gameMode} gameMoney={gameMoney} />;
        case 'levelComplete':
            return <LevelCompletePage level={level} onContinue={() => { 
                setLevel(l => l + 1);
                setTrophyCount(t => t + 1);
                setLevelProgress(initialLevelProgress());
                setCurrentDifficultyIndex(0);
                setDifficulty(difficultyProgression[0]);
                setGameStatus('advancing');
            }} />;
        case 'duelPlaying':
            if (!difficulty || !wordChallenge) return <div className="flex items-center justify-center h-full">Loading Duel...</div>;
            return <DuelPage 
              player1Score={player1Score}
              player2Score={player2Score}
              duelRoundWinners={duelRoundWinners}
              onChoice={handleChoice}
              wordChallenge={wordChallenge}
              difficulty={difficulty}
              gameStatus={gameStatus}
              choices={choices}
              isPaused={isPaused}
              togglePause={togglePause}
              onReturnToMenu={handleReturnToMenu}
              duelTurn={duelTurn}
              duelSecondPlayerTimeLeft={duelSecondPlayerTimeLeft}
              duelPointChange={duelPointChange}
              duelCurrentRound={duelCurrentRound}
              duelRoundWinsCount={duelRoundWinsCount}
              countdownDisplay={countdownDisplay}
            />;
        case 'duelRoundOver':
             return <DuelRoundOverPage 
                roundNumber={duelCurrentRound}
                roundWinner={duelCurrentRoundWinner}
                player1Score={player1Score}
                player2Score={player2Score}
                roundWinsCount={duelRoundWinsCount}
                onContinue={handleDuelContinue}
             />;
        case 'duelGameOver':
            return <DuelGameOverPage 
                winner={duelWinner}
                player1RoundWins={duelRoundWinsCount.player1}
                player2RoundWins={duelRoundWinsCount.player2}
                onPlayAgain={() => { handleSelectMode('duel'); }}
                onReturnToMenu={handleReturnToMenu}
            />;
        case 'memoryGame':
            return <MemoryGame 
                wordsToFind={memoryGameWordData}
                allChoices={memoryGameAllChoices}
                onClose={handleMemoryGameClose}
                onFailure={handleMemoryGameFailure}
                gatewayNumber={currentGatewayNumber}
                gameMode={gameMode as 'progressive' | 'endless'}
                endlessWordCount={endlessWordCount}
            />;
        default:
            return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 w-full h-full transition-opacity duration-1000" style={{ backgroundImage: `url("${bgUrls[0]}")`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: bgIndex === 0 ? 1 : 0 }} />
      <div className="fixed inset-0 w-full h-full transition-opacity duration-1000" style={{ backgroundImage: `url("${bgUrls[1]}")`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: bgIndex === 1 ? 1 : 0 }} />
      <div className="fixed inset-0 bg-black/30" />
      
      <div className="relative w-full h-screen font-sans text-brand-light overflow-hidden">
        {gameStatus === 'intro' ? (
          <IntroAnimation />
        ) : (
          renderContent()
        )}
        <ConfirmationModal
          isOpen={isQuitConfirmVisible}
          onConfirm={() => {
            setIsQuitConfirmVisible(false);
            handleReturnToMenu();
          }}
          onCancel={() => setIsQuitConfirmVisible(false)}
          title={t('quitConfirmationTitle')}
          message={t('quitConfirmationMessage')}
          confirmTextKey="confirmQuit"
          cancelTextKey="cancelQuit"
        />
        {gameStatus === 'continuePrompt' && (
           <ConfirmationModal
              isOpen={true}
              onConfirm={() => {
                const saved = loadGuestProgress();
                if (saved) {
                    setGameMode('progressive');
                    setScore(saved.score);
                    setLives(saved.lives);
                    setLevel(saved.level);
                    setLevelProgress(saved.levelProgress);
                    setConsecutiveCorrectAnswers(saved.consecutiveCorrectAnswers);
                    setRoundCount(saved.roundCount);
                    setSuccessfulRoundCount(saved.successfulRoundCount);
                    setMemoryGameWordData(saved.memoryGameWordData);
                    setMemoryGameAllChoices(saved.memoryGameAllChoices);
                    usedWords.current = new Set(saved.usedWords);
                    setTrophyCount(saved.trophyCount);
                    const savedDifficultyIndex = saved.currentDifficultyIndex;
                    setCurrentDifficultyIndex(savedDifficultyIndex);
                    setDifficulty(difficultyProgression[savedDifficultyIndex]);
                    isFirstQuestionOfSession.current = false; // Skip countdown on continue
                    setGameStatus('loading');
                } else {
                  clearGuestProgress();
                  setGameStatus('menu');
                }
              }}
              onCancel={() => {
                clearGuestProgress();
                setGameStatus('menu');
              }}
              title={t('continuePromptTitle')}
              message={t('continuePromptMessage')}
              confirmTextKey="confirmContinue"
              cancelTextKey="cancelContinue"
           />
        )}
      </div>
    </>
  );
}