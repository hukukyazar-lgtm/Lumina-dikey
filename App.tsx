import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import IntroAnimation from './components/IntroAnimation';
import MapPage from './pages/MapPage';
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
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import DesignStudioPage from './pages/ImageStudioPage';
import { useLanguage } from './components/LanguageContext';
import { useThemeManager } from './hooks/useThemeManager';
import { fetchWordChallenge } from './services/geminiService';
import { saveLocalHighScore } from './services/scoreService';
import { soundService } from './services/soundService';
import { saveGuestProgress, loadGuestProgress, clearGuestProgress, saveEndlessHighScore, loadEndlessHighScore, saveEndlessProgress, loadEndlessProgress, clearEndlessProgress, saveTotalMoney, loadTotalMoney, loadPlayerProfile, savePlayerProfile, loadPlayerInventory, savePlayerInventory, saveCustomPlanetImages, loadCustomPlanetImages, saveCustomGameBackground, loadCustomGameBackground, saveCustomButtonTexture, loadCustomButtonTexture, saveCustomMenuBackground, loadCustomMenuBackground, loadCustomButtonStructure, saveCustomCubeStyle, loadCustomCubeStyle, saveCustomCubeTexture, loadCustomCubeTexture } from './services/progressService';
import type { GameStatus, WordChallenge, Difficulty, LevelProgress, GameMode, WordLength, SavedProgress, SavedEndlessState, PlayerProfile, AchievementConditionState, PlayerInventory } from './types';
import { difficultySettings, LIFE_BONUS_INTERVAL, STARTING_LIVES, MEMORY_GAME_INTERVAL, MAX_LIVES, difficultyProgression, difficultyPoints, ENDLESS_TIMER, difficultyAnimations, planetImageUrls, ADVENTURE_GATEWAYS_PER_PLANET, planetBackgroundSizes, achievements, shopItems, cubeColorPalettes, cubeStyles } from './config';
// FIX: Import the 'themes' object to apply cosmetic theme styles to game elements.
import { themes } from './themes';


// Helper to shuffle the choices array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function App() {
  const { gameplayLanguage, t, sfxVolume, musicVolume } = useLanguage();
  const [wordChallenge, setWordChallenge] = useState<WordChallenge | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(loadPlayerProfile());
  const [playerInventory, setPlayerInventory] = useState<PlayerInventory>(loadPlayerInventory());
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [lastPlayedDifficulty, setLastPlayedDifficulty] = useState<Difficulty | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('intro');
  const [previousGameStatus, setPreviousGameStatus] = useState<GameStatus>('map');
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
  
  // States for Endless Mode
  const [gameMoney, setGameMoney] = useState(0);
  const [endlessWordCount, setEndlessWordCount] = useState(0);
  const [endlessHighScore, setEndlessHighScore] = useState(0);
  const [currentAnimationClass, setCurrentAnimationClass] = useState<string | null>(null);
  const [currentAnimationDuration, setCurrentAnimationDuration] = useState<number | null>(null);
  const [endlessCheckpoint, setEndlessCheckpoint] = useState<SavedEndlessState | null>(null);
  const [endlessStartingDifficulty, setEndlessStartingDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');

  // State for custom images
  const [customPlanetImages, setCustomPlanetImages] = useState<Record<number, string>>(loadCustomPlanetImages());
  const [customMenuBackgroundUrl, setCustomMenuBackgroundUrl] = useState<string | null>(loadCustomMenuBackground());
  const [customGameBackgroundUrl, setCustomGameBackgroundUrl] = useState<string | null>(loadCustomGameBackground());
  const [customButtonTextureUrl, setCustomButtonTextureUrl] = useState<string | null>(loadCustomButtonTexture());
  const [customCubeTextureUrl, setCustomCubeTextureUrl] = useState<string | null>(loadCustomCubeTexture());
  const [activeCubeStyle, setActiveCubeStyle] = useState<string>(loadCustomCubeStyle() || 'default');

  const usedWords = useRef<Set<string>>(new Set());
  const isFirstQuestionOfSession = useRef(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Apply the selected theme dynamically
  useThemeManager(playerInventory.activeTheme);

  // Load custom button structure on app start
  useEffect(() => {
    const savedStructure = loadCustomButtonStructure();
    if (savedStructure && typeof savedStructure === 'object') {
      Object.entries(savedStructure).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value as string);
      });
    }
  }, []);

  // Apply custom cube style on change
  useEffect(() => {
    const styleData = cubeStyles.find(s => s.id === activeCubeStyle);
    if (styleData) {
        const root = document.documentElement;
        Object.entries(styleData.variables).forEach(([key, value]) => {
            root.style.setProperty(key, value as string);
        });
    }
  }, [activeCubeStyle]);


    const updatePlayerProfile = useCallback((updater: React.SetStateAction<PlayerProfile>) => {
        setPlayerProfile(prevProfile => {
            const newProfile = typeof updater === 'function' ? updater(prevProfile) : updater;
            savePlayerProfile(newProfile);
            return newProfile;
        });
    }, []);

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
    
    // Wrapper for inventory updates
    const updatePlayerInventory = useCallback((updater: React.SetStateAction<PlayerInventory>) => {
        setPlayerInventory(prev => {
            const newInventory = typeof updater === 'function' ? updater(prev) : updater;
            savePlayerInventory(newInventory);
            return newInventory;
        });
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
                
                const scoreMultiplierLevel = playerInventory.upgrades['score-multiplier'] || 0;
                const basePoints = difficulty ? difficultyPoints[difficulty] : 1;
                const points = basePoints * (1 + scoreMultiplierLevel * 0.1); // 10% bonus per level
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
            } else {
                soundService.play('lifeLost');
                setGameStatus('incorrect');
                const newLives = lives - 1;
                setLives(newLives);
                setConsecutiveCorrectAnswers(0);
            }
        } else if (gameMode === 'endless') {
            const coinsPerWord = endlessStartingDifficulty === 'hard' ? 3 : endlessStartingDifficulty === 'medium' ? 2 : 1;
            setRoundCount(r => r + 1);

            // Always record the data for the memory game, regardless of outcome.
            if (wordChallenge) {
                // The 'score' property is used as the coin value in the memory game
                setMemoryGameWordData(prev => [...prev, { word: wordChallenge.correctWord, score: coinsPerWord }]);
            }
            setMemoryGameAllChoices(prev => shuffleArray([...new Set([...prev, ...choices])]));
             
             if (isCorrect) {
                soundService.play('correct');
                setGameStatus('correct');
                updateGameMoney(m => m + coinsPerWord);
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
                     updatePlayerProfile(p => ({
                        ...p,
                        stats: {
                            ...p.stats,
                            totalPracticeWords: p.stats.totalPracticeWords + 1,
                            maxPracticeStreak: Math.max(p.stats.maxPracticeStreak, newStreak),
                        }
                    }));
                    return newStreak;
                 });
            } else {
                soundService.play('incorrect');
                setGameStatus('incorrect');
                setConsecutiveCorrectAnswers(0);
            }
        }
    }, [gameStatus, stopTimer, wordChallenge, gameMode, difficulty, lives, consecutiveCorrectAnswers, choices, updateGameMoney, updatePlayerProfile, playerInventory, endlessStartingDifficulty]);

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


  const handleReturnToMenu = useCallback(() => {
    stopTimer();
    setGameStatus('map');
    setGameMode(null);
    setDifficulty(null);
    setIsPaused(false);
  }, [stopTimer]);

  const togglePause = useCallback(() => {
    if (gameStatus === 'playing' || gameStatus === 'duelPlaying') {
      setIsPaused(p => !p);
      soundService.play('click');
    }
  }, [gameStatus]);

    const handleSelectMode = useCallback((mode: Difficulty | 'progressive' | 'duel' | 'endless', startingDifficulty?: 'easy' | 'medium' | 'hard') => {
        // Reset animations for the new game session
        setCurrentAnimationClass(null);
        setCurrentAnimationDuration(null);
        
        const specialThemes = ['theme-gold', 'theme-holo'];
        // Only randomize cube color if no special UI theme or special cube style is active.
        if (!specialThemes.includes(playerInventory.activeTheme) && activeCubeStyle === 'default') {
            const randomPalette = cubeColorPalettes[Math.floor(Math.random() * cubeColorPalettes.length)];
            const root = document.documentElement;
            // Apply only the color variables from the random palette, not font etc.
            root.style.setProperty('--cube-face-bg', randomPalette['--cube-face-bg']);
            root.style.setProperty('--cube-face-border', randomPalette['--cube-face-border']);
            root.style.setProperty('--cube-face-text-color', randomPalette['--cube-face-text-color']);
            root.style.setProperty('--cube-face-text-shadow', randomPalette['--cube-face-text-shadow']);

        } else if (specialThemes.includes(playerInventory.activeTheme)) {
            const activeThemeData = themes[playerInventory.activeTheme];
            if (activeThemeData) {
                const root = document.documentElement;
                root.style.setProperty('--cube-face-bg', activeThemeData['--cube-face-bg']);
                root.style.setProperty('--cube-face-border', activeThemeData['--cube-face-border']);
                root.style.setProperty('--cube-face-text-color', activeThemeData['--cube-face-text-color']);
                root.style.setProperty('--cube-face-text-shadow', activeThemeData['--cube-face-text-shadow']);
                root.style.setProperty('--cube-face-extra-animation', activeThemeData['--cube-face-extra-animation'] || 'none');
            }
        }
        // If a custom cube style is active, the useEffect for activeCubeStyle handles it, so no specific action is needed here.


        if (mode === 'endless') {
            setGameMode('endless');
            setDifficulty('Novice'); // Base difficulty, will be overridden by word count
            
            setEndlessStartingDifficulty(startingDifficulty || 'easy');
            
            // Reset game state for a new run based on selected difficulty
            let initialWordCount = 0;
            if (startingDifficulty === 'medium') {
                initialWordCount = 15; // Corresponds to 'Skilled'
            } else if (startingDifficulty === 'hard') {
                initialWordCount = 30; // Corresponds to 'Master'
            }
    
            setEndlessWordCount(initialWordCount);
            setRoundCount(initialWordCount); // Sync round count for memory game logic
            setMemoryGameWordData([]);
            setMemoryGameAllChoices([]);
            setEndlessCheckpoint(null); // No checkpoints when starting fresh
            usedWords.current.clear();
            isFirstQuestionOfSession.current = true; // A new game.
            clearEndlessProgress(); // Clear any previously saved run

        } else if (mode === 'progressive') {
            clearGuestProgress();
            const extraLives = playerInventory.consumables['extra-life'] || 0;
            setGameMode('progressive');
            setDifficulty('Novice'); // Initial difficulty
            setScore(0);
            setLives(STARTING_LIVES + extraLives);
            setLevel(1);
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
    }, [playerInventory, activeCubeStyle]);

  const handleOpenProfile = useCallback(() => {
    setPreviousGameStatus(gameStatus);
    setGameStatus('profile');
  }, [gameStatus]);
  
  const handleOpenShop = useCallback(() => {
    setPreviousGameStatus(gameStatus);
    setGameStatus('shop');
  }, [gameStatus]);

  const handleOpenDesignStudio = useCallback(() => {
    setPreviousGameStatus(gameStatus);
    setGameStatus('designStudio');
  }, [gameStatus]);

  const handleSetPlanetImage = useCallback((planetIndex: number, imageUrl: string) => {
    setCustomPlanetImages(prev => {
        const newImages = { ...prev, [planetIndex]: imageUrl };
        saveCustomPlanetImages(newImages);
        return newImages;
    });
  }, []);

  const handleSetMenuBackground = useCallback((imageUrl: string) => {
    setCustomMenuBackgroundUrl(imageUrl);
    saveCustomMenuBackground(imageUrl);
  }, []);

  const handleSetPlayerAvatar = useCallback((imageUrl: string) => {
    updatePlayerProfile(p => ({ ...p, avatar: imageUrl }));
  }, [updatePlayerProfile]);

  const handleSetGameBackground = useCallback((imageUrl: string) => {
    setCustomGameBackgroundUrl(imageUrl);
    saveCustomGameBackground(imageUrl);
  }, []);

  const handleSetCustomButtonTexture = useCallback((imageUrl: string) => {
    setCustomButtonTextureUrl(imageUrl);
    saveCustomButtonTexture(imageUrl);
  }, []);

  const handleSetCustomCubeTexture = useCallback((imageUrl: string) => {
    setCustomCubeTextureUrl(imageUrl);
    saveCustomCubeTexture(imageUrl);
  }, []);

  const handleSetCustomCubeStyle = useCallback((styleId: string) => {
    setActiveCubeStyle(styleId);
    saveCustomCubeStyle(styleId);
  }, []);
  
    const handlePurchaseItem = useCallback((itemId: string) => {
        const item = shopItems.find(i => i.id === itemId);
        if (!item) return;

        let currentPrice: number;
        if (typeof item.price === 'number') {
            currentPrice = item.price;
        } else {
            const currentLevel = playerInventory.upgrades[item.id] || 0;
            if (currentLevel >= item.price.length) return; // Max level reached
            currentPrice = item.price[currentLevel];
        }

        if (gameMoney >= currentPrice) {
            soundService.play('bonus');
            updateGameMoney(m => m - currentPrice);
            updatePlayerInventory(inv => {
                const newInv = { ...inv };
                if (item.category === 'power-ups') {
                    newInv.consumables = { ...newInv.consumables };
                    newInv.consumables[item.id] = (newInv.consumables[item.id] || 0) + 1;
                } else if (item.category === 'upgrades') {
                    newInv.upgrades = { ...newInv.upgrades };
                    newInv.upgrades[item.id] = (newInv.upgrades[item.id] || 0) + 1;
                } else if (item.category === 'cosmetics') {
                    newInv.cosmetics = [...newInv.cosmetics, item.id];
                }
                return newInv;
            });
        } else {
            soundService.play('incorrect');
        }
    }, [gameMoney, playerInventory, updateGameMoney, updatePlayerInventory]);

    const handleEquipTheme = useCallback((themeId: string) => {
        soundService.play('select');
        updatePlayerInventory(inv => ({...inv, activeTheme: themeId}));
    }, [updatePlayerInventory]);

    useEffect(() => {
        if (gameStatus === 'intro') {
            const timer = setTimeout(() => {
                soundService.init();
                // Load global stats that don't depend on other state
                setEndlessHighScore(loadEndlessHighScore());
                
                // Load master money record and handle one-time migration from old system
                const savedTotalMoney = loadTotalMoney();
                const savedEndless = loadEndlessProgress();
                const initialMoney = Math.max(savedTotalMoney, savedEndless?.gameMoney ?? 0);
                updateGameMoney(initialMoney); // This sets state and saves to localStorage
                
                if (savedEndless) {
                    setEndlessCheckpoint(savedEndless);
                    setRoundCount(savedEndless.roundCount);
                    if (savedEndless.startingDifficulty) {
                        setEndlessStartingDifficulty(savedEndless.startingDifficulty);
                    }
                }
                
                setGameStatus('map');
            }, 3500);
            return () => clearTimeout(timer);
        }

        if (gameStatus === 'loading' || gameStatus === 'advancing') {
            const fetchNewWord = async () => {
                let currentDifficulty = difficulty;

                if (gameMode === 'progressive') {
                    const totalGatewaysPassed = Math.floor(roundCount / MEMORY_GAME_INTERVAL);
                    // Difficulty increases every 2 gateways (10 questions)
                    const difficultyIdx = Math.min(Math.floor(totalGatewaysPassed / 2), difficultyProgression.length - 1);
                    currentDifficulty = difficultyProgression[difficultyIdx];
                    setDifficulty(currentDifficulty);
                } else if (gameMode === 'duel' && gameStatus === 'advancing') {
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
                    
                    const animationPool = difficultyAnimations[currentDifficulty];
                    const animClass = animationPool[Math.floor(Math.random() * animationPool.length)];
                    const animDuration = difficultySettings[currentDifficulty].baseAnimationDuration;
                    
                    setCurrentAnimationClass(animClass);
                    setCurrentAnimationDuration(animDuration);
                }
                
                if (!currentDifficulty) return;
                
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
    }, [gameStatus, difficulty, gameplayLanguage, gameMode, duelDifficultyIndex, endlessWordCount, roundCount]);

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
            saveLocalHighScore(playerProfile.name, score, level);

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
  }, [gameStatus, lives, gameMode, playerProfile.name, score, level, roundCount, updateGameMoney]);

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
            
            if (endlessWordCount > endlessHighScore) {
                 saveEndlessHighScore(endlessWordCount);
                 setEndlessHighScore(endlessWordCount);
            }
            
            // Save checkpoint AFTER successful gateway completion
            const progressToSave: SavedEndlessState = {
                gameMoney: newMoney,
                endlessWordCount: endlessWordCount,
                roundCount: roundCount,
                memoryGameWordData: [], // This data is for the next round, so start fresh
                memoryGameAllChoices: [],
                usedWords: Array.from(usedWords.current),
                startingDifficulty: endlessStartingDifficulty,
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

            // Check if this gateway completion also completes the planet
            if (roundCount > 0 && roundCount % (MEMORY_GAME_INTERVAL * ADVENTURE_GATEWAYS_PER_PLANET) === 0) {
                 setGameStatus('levelComplete');
            } else {
                 setGameStatus('advancing');
            }
        }
    }, [endlessWordCount, gameMode, gameMoney, roundCount, usedWords, updateGameMoney, endlessHighScore, endlessStartingDifficulty]);

    const handleMemoryGameFailure = useCallback(() => {
        if (gameMode === 'progressive') {
            soundService.play('gameOver');
            saveLocalHighScore(playerProfile.name, score, level);
            clearGuestProgress();

            // Convert points to money and save to master record
            const moneyEarned = Math.floor(score / 100);
            if (moneyEarned > 0) {
                updateGameMoney(m => m + moneyEarned);
            }

            setGameStatus('gameOver');
            return;
        }

        if (gameMode === 'endless') {
            soundService.play('lifeLost');
            if (endlessCheckpoint) {
                // Restore from the last successful checkpoint
                updateGameMoney(endlessCheckpoint.gameMoney);
                setEndlessWordCount(endlessCheckpoint.endlessWordCount);
                setRoundCount(endlessCheckpoint.roundCount);
                usedWords.current = new Set(endlessCheckpoint.usedWords);
                if (endlessCheckpoint.startingDifficulty) {
                    setEndlessStartingDifficulty(endlessCheckpoint.startingDifficulty);
                }
            } else {
                // Failed the very first gateway, reset to starting difficulty
                let initialWordCount = 0;
                if (endlessStartingDifficulty === 'medium') {
                    initialWordCount = 15;
                } else if (endlessStartingDifficulty === 'hard') {
                    initialWordCount = 30;
                }
                setEndlessWordCount(initialWordCount);
                setRoundCount(initialWordCount);
                usedWords.current.clear();
                clearEndlessProgress(); // Clear saved progress as well, but money is safe.
            }
            // Clear memory game data for the next attempt and continue
            setMemoryGameWordData([]);
            setMemoryGameAllChoices([]);
            setGameStatus('advancing');
        }
    }, [endlessCheckpoint, gameMode, playerProfile.name, score, level, updateGameMoney, endlessStartingDifficulty]);

    // --- Achievement Unlocking Logic ---
    const checkAndUnlockAchievements = useCallback(() => {
        const achievementState: AchievementConditionState = {
            endlessHighScore,
            gameMoney,
            trophyCount,
            playerProfile,
        };
        
        const newlyUnlocked = achievements.filter(ach => 
            !playerProfile.unlockedAchievements.includes(ach.id) && ach.condition(achievementState)
        );

        if (newlyUnlocked.length > 0) {
            console.log("Achievements unlocked: ", newlyUnlocked.map(a => a.id));
            updatePlayerProfile(p => ({
                ...p,
                unlockedAchievements: [...p.unlockedAchievements, ...newlyUnlocked.map(a => a.id)]
            }));
            // In a full implementation, a visual notification would be shown here.
        }
    }, [endlessHighScore, gameMoney, trophyCount, playerProfile, updatePlayerProfile]);

    // Check achievements on relevant state changes
    useEffect(() => {
        checkAndUnlockAchievements();
    }, [checkAndUnlockAchievements]);


  const renderContent = () => {
    switch (gameStatus) {
        case 'map':
            return <MapPage 
                playerProfile={playerProfile}
                onSelectMode={handleSelectMode}
                onShowPracticeMenu={() => setGameStatus('practiceMenu')}
                onOpenProfile={handleOpenProfile}
                onOpenShop={handleOpenShop}
                onOpenDesignStudio={handleOpenDesignStudio}
                gameMoney={gameMoney}
                endlessHighScore={endlessHighScore}
                endlessProgressCount={roundCount}
                customPlanetImages={customPlanetImages}
                customMenuBackgroundUrl={customMenuBackgroundUrl}
            />;
        case 'profile':
            return <ProfilePage
                onClose={() => setGameStatus(previousGameStatus)}
                playerProfile={playerProfile}
                setPlayerProfile={updatePlayerProfile}
                endlessHighScore={endlessHighScore}
                gameMoney={gameMoney}
                trophyCount={trophyCount}
            />;
        case 'shop':
            return <ShopPage
                onClose={() => setGameStatus(previousGameStatus)}
                gameMoney={gameMoney}
                inventory={playerInventory}
                onPurchase={handlePurchaseItem}
                onEquip={handleEquipTheme}
            />;
        case 'designStudio':
            return <DesignStudioPage
                onClose={() => setGameStatus(previousGameStatus)}
                onSetPlanetImage={handleSetPlanetImage}
                onSetMenuBackground={handleSetMenuBackground}
                onSetPlayerAvatar={handleSetPlayerAvatar}
                onSetGameBackground={handleSetGameBackground}
                onSetCustomButtonTexture={handleSetCustomButtonTexture}
                onSetCustomCubeTexture={handleSetCustomCubeTexture}
                onSetCustomCubeStyle={handleSetCustomCubeStyle}
                activeCubeStyle={activeCubeStyle}
            />;
        case 'practiceMenu':
             return (
                <MainLayout
                    gameStatus={gameStatus}
                    gameMode={gameMode}
                    onReturnToMenu={handleReturnToMenu}
                    onOpenLeaderboard={handleOpenProfile}
                    difficulty={difficulty}
                    gameMoney={gameMoney}
                    trophyCount={trophyCount}
                >
                    <MenuPage 
                        onSelect={handleSelectMode}
                        onBack={handleReturnToMenu}
                    />
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
                    endlessHighScore={endlessHighScore}
                    animationClass={currentAnimationClass}
                    animationDuration={currentAnimationDuration}
                    activeTheme={playerInventory.activeTheme}
                    customGameBackgroundUrl={customGameBackgroundUrl}
                    customButtonTextureUrl={customButtonTextureUrl}
                    customCubeTextureUrl={customCubeTextureUrl}
                />
            );
        case 'gameOver':
            return <GameOverPage score={score} level={level} missedWord={wordChallenge?.correctWord ?? null} onReturnToMenu={handleReturnToMenu} gameMode={gameMode} gameMoney={gameMoney} />;
        case 'levelComplete':
            return <LevelCompletePage level={level} onContinue={() => { 
                setTrophyCount(t => t + 1);
                setLevel(l => l + 1);
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
                  setConsecutiveCorrectAnswers(saved.consecutiveCorrectAnswers);
                  setRoundCount(saved.roundCount);
                  setSuccessfulRoundCount(saved.successfulRoundCount);
                  setMemoryGameWordData(saved.memoryGameWordData);
                  setMemoryGameAllChoices(saved.memoryGameAllChoices);
                  usedWords.current = new Set(saved.usedWords);
                  setTrophyCount(saved.trophyCount);
                  isFirstQuestionOfSession.current = false; // Skip countdown on continue
                  setGameStatus('loading');
              } else {
                clearGuestProgress();
                setGameStatus('map');
              }
            }}
            onCancel={() => {
              clearGuestProgress();
              setGameStatus('map');
            }}
            title={t('continuePromptTitle')}
            message={t('continuePromptMessage')}
            confirmTextKey="confirmContinue"
            cancelTextKey="cancelContinue"
         />
      )}
    </div>
  );
}