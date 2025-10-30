import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';

// Types
import type { GameStatus, WordChallenge, Difficulty, SavedProgress, GameMode, PlayerProfile, PlayerInventory, SavedEndlessState, ThemePalette, GameBackgrounds } from './types';

// Services
import * as geminiService from './services/geminiService';
import * as progressService from './services/progressService';
import { soundService } from './services/soundService';

// Config
import { difficultySettings, difficultyProgression, difficultyPoints, STARTING_LIVES, MAX_LIVES, LIFE_BONUS_INTERVAL, MEMORY_GAME_INTERVAL, ENDLESS_TIMER, achievements } from './config';

// Hooks
import { useLanguage } from './components/LanguageContext';
import { useThemeManager } from './hooks/useThemeManager';

// Components & Pages
import IntroAnimation from './components/IntroAnimation';
import GamePage from './pages/GamePage';
import GameOverPage from './pages/GameOverPage';
import MapPage from './pages/MapPage';
import MenuPage from './pages/MenuPage';
import LevelCompletePage from './pages/LevelCompletePage';
import ConfirmationModal from './components/ConfirmationModal';
import MemoryGame from './components/MemoryGame';
import DuelPage from './pages/DuelPage';
import DuelRoundOverPage from './pages/DuelRoundOverPage';
import DuelGameOverPage from './pages/DuelGameOverPage';
import LanguageSelector from './components/LanguageSelector';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import DesignStudioPage from './pages/DesignStudioPage';
import WaterbedBackground from './components/WaterbedBackground';
import LuminaCube from './components/LuminaCube';

const App: React.FC = () => {
    const { gameplayLanguage, t } = useLanguage();
    
    // Core Game State
    const [gameStatus, setGameStatus] = useState<GameStatus>('intro');
    const [gameMode, setGameMode] = useState<GameMode>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>('Novice');
    const [wordChallenge, setWordChallenge] = useState<WordChallenge>({ correctWord: '', incorrectWords: [] });
    const [choices, setChoices] = useState<string[]>([]);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Player & Progression State
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(progressService.loadPlayerProfile);
    const [playerInventory, setPlayerInventory] = useState<PlayerInventory>(progressService.loadPlayerInventory);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(STARTING_LIVES);
    const [level, setLevel] = useState(1);
    const [gameMoney, setGameMoney] = useState(progressService.loadTotalMoney);
    const [trophyCount, setTrophyCount] = useState(0); 
    const [consecutiveCorrectAnswers, setConsecutiveCorrectAnswers] = useState(0);
    const [roundCount, setRoundCount] = useState(0);
    const [successfulRoundCount, setSuccessfulRoundCount] = useState(0);

    // Endless Mode State
    const [endlessScore, setEndlessScore] = useState(0);
    const [endlessWordCount, setEndlessWordCount] = useState(0);
    const [endlessHighScore, setEndlessHighScore] = useState(progressService.loadEndlessHighScore);
    
    // Memory Game State
    const [memoryGameWordData, setMemoryGameWordData] = useState<Array<{ word: string; score: number }>>([]);
    const [memoryGameAllChoices, setMemoryGameAllChoices] = useState<string[]>([]);
    
    // Duel Mode State (simplified for brevity)
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const [duelRoundWinners, setDuelRoundWinners] = useState<Partial<Record<Difficulty, 1 | 2>>>({});
    const [duelTurn, setDuelTurn] = useState<'first' | 1 | 2>('first');
    const [duelSecondPlayerTimeLeft, setDuelSecondPlayerTimeLeft] = useState<number | null>(null);
    const [duelPointChange, setDuelPointChange] = useState<{ player: 1 | 2; points: number; key: number } | null>(null);
    const [duelCurrentRound, setDuelCurrentRound] = useState(1);
    const [duelRoundWinsCount, setDuelRoundWinsCount] = useState({ player1: 0, player2: 0 });

    // UI & Animation State
    const [isPaused, setIsPaused] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [countdownDisplay, setCountdownDisplay] = useState<number | string | null>(null);
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [animationClass, setAnimationClass] = useState<string | null>(null);
    const [animationDuration, setAnimationDuration] = useState<number | null>(null);
    const [answeredWordsHistory, setAnsweredWordsHistory] = useState<string[]>([]);
    const [showIntro, setShowIntro] = useState(true);

    // Customization State
    const [customTheme, setCustomTheme] = useState<ThemePalette | null>(null);
    const [customMenuBackground, setCustomMenuBackground] = useState<string | null>(progressService.loadCustomMenuBackground());
    const [customGameBackgrounds, setCustomGameBackgrounds] = useState<GameBackgrounds>({ easy: null, medium: null, hard: null });
    const [customButtonTexture, setCustomButtonTexture] = useState<string | null>(null);
    const [customCubeTexture, setCustomCubeTexture] = useState<string | null>(null);
    const [activeCubeStyle, setActiveCubeStyle] = useState('default');


    // Refs
    // FIX: Changed NodeJS.Timeout to number, which is the correct type for browser timers.
    const timerRef = useRef<number | null>(null);

    // Initialize Theme Manager
    useThemeManager(
        playerInventory.activeTheme, 
        customTheme,
        customMenuBackground,
        gameStatus,
        difficulty,
        customGameBackgrounds
    );

    // --- EFFECTS ---
    useEffect(() => {
        const introTimer = setTimeout(() => setShowIntro(false), 3500);
        return () => clearTimeout(introTimer);
    }, []);

    // Initial load and setup
    useEffect(() => {
        if (showIntro) return; // Wait for intro to finish

        const savedAdventureGame = progressService.loadGuestProgress();
        if (savedAdventureGame) {
            setGameStatus('continuePrompt');
        } else {
            const hasSelectedLanguage = localStorage.getItem('lumina-ui-language');
            if (hasSelectedLanguage) {
                setGameStatus('map');
            } else {
                setGameStatus('languageSelection'); 
            }
        }
        setIsLoading(false);
    }, [showIntro]);

    // Game Timer Logic
    useEffect(() => {
        if ((gameStatus === 'playing' || gameStatus === 'duelPlaying') && !isPaused) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameStatus, isPaused]);

    // --- CORE GAME LOGIC ---

    const fetchNewWord = useCallback(async (currentDifficulty: Difficulty) => {
        setGameStatus('advancing');
        try {
            const { wordLength } = difficultySettings[currentDifficulty];
            const challenge = await geminiService.fetchWordChallenge(wordLength, gameplayLanguage, usedWords);
            
            setWordChallenge(challenge);
            setChoices([...challenge.incorrectWords, challenge.correctWord].sort(() => Math.random() - 0.5));
            setUsedWords(prev => new Set(prev).add(challenge.correctWord));
            setGameStatus('playing');
        } catch (error) {
            console.error("Failed to fetch new word:", error);
            setGameStatus('map');
        }
    }, [gameplayLanguage, usedWords]);


    const handleChoice = useCallback((word: string) => {
        if (gameStatus !== 'playing') return;

        const isCorrect = word === wordChallenge.correctWord;
        setGameStatus(isCorrect ? 'correct' : 'incorrect');
        setAnsweredWordsHistory(prev => [wordChallenge.correctWord, ...prev].slice(0, 3));

        if (isCorrect) {
            soundService.play('correct');
            const newScore = score + (difficultyPoints[difficulty] * 10) + timeLeft;
            setScore(newScore);
            setConsecutiveCorrectAnswers(prev => prev + 1);
            setSuccessfulRoundCount(prev => prev + 1);
            if (gameMode === 'endless') {
                setEndlessScore(s => s + 1);
                setEndlessWordCount(c => c + 1);
            }
        } else {
            soundService.play('incorrect');
            soundService.play('lifeLost');
            setLives(prev => prev - 1);
            setConsecutiveCorrectAnswers(0);
        }

        setTimeout(() => {
             if (!isCorrect && lives - 1 <= 0) {
                 setGameStatus('gameOver');
             } else {
                 fetchNewWord(difficulty);
             }
        }, 1500);

    }, [gameStatus, wordChallenge.correctWord, score, difficulty, timeLeft, lives, gameMode, fetchNewWord]);

    // --- RENDER LOGIC ---

    const renderContent = () => {
        if (showIntro) return null; // Keep showing nothing until intro timer is done
        if (isLoading && gameStatus !== 'languageSelection') return null;

        switch (gameStatus) {
            case 'languageSelection':
                return <LanguageSelector onLanguageSelect={() => { soundService.init(); setGameStatus('map'); }} />;
            case 'map':
                return <MapPage 
                    playerProfile={playerProfile}
                    onSelectMode={(mode, startDiff) => { /* setup mode */ }}
                    onShowPracticeMenu={() => setGameStatus('practiceMenu')}
                    onOpenProfile={() => setGameStatus('profile')}
                    onOpenShop={() => setGameStatus('shop')}
                    onOpenDesignStudio={() => setGameStatus('designStudio')}
                    gameMoney={gameMoney}
                    endlessHighScore={endlessHighScore}
                    completedGatewayCount={roundCount}
                />;
            case 'practiceMenu':
                return <MenuPage onSelect={(diff) => { /* start practice */ }} onBack={() => setGameStatus('map')} />;
            
            case 'countdown':
            case 'playing':
            case 'correct':
            case 'incorrect':
            case 'advancing':
                return <GamePage
                    gameStatus={gameStatus}
                    gameMode={gameMode}
                    difficulty={difficulty}
                    level={level}
                    wordChallenge={wordChallenge}
                    timeLeft={timeLeft}
                    lives={lives}
                    score={score}
                    choices={choices}
                    selectedChoice={null} // Simplified
                    consecutiveCorrectAnswers={consecutiveCorrectAnswers}
                    isPaused={isPaused}
                    roundCount={roundCount}
                    successfulRoundCount={successfulRoundCount}
                    trophyCount={trophyCount}
                    handleChoice={handleChoice}
                    togglePause={() => setIsPaused(!isPaused)}
                    onReturnToPracticeMenu={() => setGameStatus('practiceMenu')}
                    onReturnToMenu={() => setGameStatus('map')}
                    countdownDisplay={countdownDisplay}
                    gameMoney={gameMoney}
                    endlessWordCount={endlessWordCount}
                    endlessScore={endlessScore}
                    endlessHighScore={endlessHighScore}
                    animationClass={animationClass}
                    animationDuration={animationDuration}
                    activeTheme={playerInventory.activeTheme}
                    playerInventory={playerInventory}
                    answeredWordsHistory={answeredWordsHistory}
                />;
            case 'gameOver':
                return <GameOverPage score={score} level={level} missedWord={wordChallenge.correctWord} onReturnToMenu={() => setGameStatus('map')} gameMode={gameMode} gameMoney={gameMoney} />;
            default:
                return <MapPage 
                    playerProfile={playerProfile}
                    onSelectMode={(mode, startDiff) => { /* setup mode */ }}
                    onShowPracticeMenu={() => setGameStatus('practiceMenu')}
                    onOpenProfile={() => setGameStatus('profile')}
                    onOpenShop={() => setGameStatus('shop')}
                    onOpenDesignStudio={() => setGameStatus('designStudio')}
                    gameMoney={gameMoney}
                    endlessHighScore={endlessHighScore}
                    completedGatewayCount={roundCount}
                />; // Fallback to map
        }
    };

    return (
        <div className="w-screen h-screen bg-brand-bg-gradient-start font-sans text-brand-light overflow-hidden">
             <WaterbedBackground />
             <AnimatePresence>
                {showIntro && <IntroAnimation />}
             </AnimatePresence>
             {!showIntro && (
                <div className="fixed top-4 left-4 z-50 animate-logo-float">
                    <LuminaCube size={32} animationClass="animate-tumble-xyz-slow" animationDuration="20s" />
                </div>
             )}
             
             {renderContent()}
             
             <AnimatePresence>
                 {gameStatus === 'profile' && (
                     <ProfilePage 
                        onClose={() => setGameStatus('map')}
                        playerProfile={playerProfile}
                        setPlayerProfile={setPlayerProfile}
                        endlessHighScore={endlessHighScore}
                        gameMoney={gameMoney}
                        trophyCount={trophyCount}
                     />
                 )}
                 {gameStatus === 'shop' && (
                     <ShopPage 
                        onClose={() => setGameStatus('map')}
                        gameMoney={gameMoney}
                        inventory={playerInventory}
                        onPurchase={(itemId) => { /* handle purchase */ }}
                        onEquip={(themeId) => setPlayerInventory(inv => ({...inv, activeTheme: themeId}))}
                     />
                 )}
                 {gameStatus === 'designStudio' && (
                     <DesignStudioPage 
                        onClose={() => setGameStatus('map')}
                        onSetPlanetImage={(idx, url) => { /* logic */ }}
                        onSetMenuBackground={setCustomMenuBackground}
                        onSetPlayerAvatar={(url) => setPlayerProfile(p => ({...p, avatar: url}))}
                        onSetGameBackground={(diff, url) => setCustomGameBackgrounds(bgs => ({...bgs, [diff]: url}))}
                        onSetCustomButtonTexture={setCustomButtonTexture}
                        onSetCustomCubeTexture={setCustomCubeTexture}
                        onSetCustomCubeStyle={setActiveCubeStyle}
                        activeCubeStyle={activeCubeStyle}
                        onSetCustomTheme={setCustomTheme}
                        customGameBackgrounds={customGameBackgrounds}
                     />
                 )}
             </AnimatePresence>
        </div>
    );
};

export default App;