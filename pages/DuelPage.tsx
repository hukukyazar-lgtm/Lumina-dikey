import React, { useState, useEffect } from 'react';
import type { GameStatus, WordChallenge, Difficulty } from '../types';
import LetterCircle from '../components/LetterCircle';
import ChoiceButton from '../components/ChoiceButton';
import LoadingSpinner from '../components/LoadingSpinner';
import DuelProgressTracker from '../components/DuelProgressTracker';
import CountdownDisplay from '../components/CountdownDisplay';
import { useLanguage } from '../components/LanguageContext';

interface PlayerInterfaceProps {
    playerNumber: 1 | 2;
    score: number;
    roundWinners: Partial<Record<Difficulty, 1 | 2>>;
    choices: string[];
    onChoice: (word: string, player: 1 | 2) => void;
    isRotated: boolean;
    isDisabled: boolean;
    roundTitle: string;
}

// In PlayerInterface, reduce padding and gap to save vertical space.
const PlayerInterface: React.FC<PlayerInterfaceProps> = ({ playerNumber, score, roundWinners, choices, onChoice, isRotated, isDisabled, roundTitle }) => {
    const { t } = useLanguage();
    const scoreColor = playerNumber === 1 ? 'text-brand-accent-secondary' : 'text-brand-accent';
    const scoreLabel = playerNumber === 1 ? t('player1Score') : t('player2Score');

    const scoreElement = (
        <div className={`h-10 flex items-center justify-center bg-brand-primary backdrop-blur-sm border border-brand-light/10 px-4 shadow-bevel-inner rounded-full`} aria-label={scoreLabel}>
            <span className={`text-lg sm:text-2xl font-black ${scoreColor}`}>{score}</span>
        </div>
    );
    
    const progressTrackerElement = <DuelProgressTracker roundWinners={roundWinners} />;
    
    const roundTitleElement = <h2 className="text-xl sm:text-2xl font-black text-brand-light/80">{roundTitle}</h2>;


    return (
        <div className={`w-full flex flex-col items-center gap-1 p-1 sm:p-2 ${isRotated ? 'rotate-180' : ''}`}>
            {/* Score and Progress Tracker */}
            <div className="w-full flex items-center justify-between gap-4">
                 {isRotated ? (
                    <>
                        {scoreElement}
                        {progressTrackerElement}
                        {roundTitleElement}
                    </>
                ) : (
                    <>
                        {roundTitleElement}
                        {progressTrackerElement}
                        {scoreElement}
                    </>
                )}
            </div>
            {/* Choices */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full max-w-2xl">
                {choices.map((word) => (
                    <ChoiceButton
                        key={`${word}-${playerNumber}`}
                        word={word}
                        onClick={(w) => onChoice(w, playerNumber)}
                        disabled={isDisabled}
                        status={'default'}
                    />
                ))}
            </div>
        </div>
    );
};


interface DuelPageProps {
  player1Score: number;
  player2Score: number;
  duelRoundWinners: Partial<Record<Difficulty, 1 | 2>>;
  onChoice: (word: string, player: 1 | 2) => void;
  wordChallenge: WordChallenge;
  difficulty: Difficulty;
  gameStatus: GameStatus;
  choices: string[];
  isPaused: boolean;
  togglePause: () => void;
  onReturnToMenu: () => void;
  duelTurn: 'first' | 1 | 2;
  duelSecondPlayerTimeLeft: number | null;
  duelPointChange: { player: 1 | 2; points: number; key: number } | null;
  duelCurrentRound: number;
  duelRoundWinsCount: { player1: number, player2: number };
  countdownDisplay: number | string | null;
}

const DuelPage: React.FC<DuelPageProps> = ({
  player1Score,
  player2Score,
  duelRoundWinners,
  onChoice,
  wordChallenge,
  difficulty,
  gameStatus,
  choices,
  isPaused,
  togglePause,
  onReturnToMenu,
  duelTurn,
  duelSecondPlayerTimeLeft,
  duelPointChange,
  duelCurrentRound,
  duelRoundWinsCount,
  countdownDisplay
}) => {
    const { t, isTabletMode } = useLanguage();
    const [popup, setPopup] = useState<{ text: string, player: 1 | 2, key: number } | null>(null);
    const isLoading = gameStatus === 'loading' || gameStatus === 'advancing';
    const shouldBlur = gameStatus === 'countdown' || isPaused;

    const isTieBreaker = duelRoundWinsCount.player1 === 2 && duelRoundWinsCount.player2 === 2;
    const roundTitle = isTieBreaker
        ? t('tieBreaker')
        : `T${duelCurrentRound}`;

    useEffect(() => {
        if (duelPointChange) {
            const { player, points, key } = duelPointChange;
            const sign = points > 0 ? '+' : '';
            setPopup({ text: `${sign}${points}`, player, key });
        }
    }, [duelPointChange]);

    const getPopupPositionAndRotation = () => {
        if (!popup) return {};
        const isPlayer1 = popup.player === 1;
        return {
            bottom: isPlayer1 ? '30%' : 'auto',
            top: !isPlayer1 ? '30%' : 'auto',
            transform: isPlayer1 ? 'none' : 'rotate(180deg)',
        };
    };

    // Reduce overall padding and remove vertical margin from the center area to prevent scrolling on smaller tablets.
    return (
        <div className="relative flex flex-col items-center justify-between w-full h-full p-1 sm:p-2 animate-appear">
            {/* Player 2 (Top, Rotated) */}
            <div className={`w-full transition-all duration-300 ${shouldBlur ? 'blur-md pointer-events-none' : ''}`}>
                <PlayerInterface 
                    playerNumber={2}
                    score={player2Score}
                    roundWinners={duelRoundWinners}
                    choices={choices}
                    onChoice={onChoice}
                    isRotated={isTabletMode}
                    isDisabled={isLoading || isPaused || (duelTurn !== 'first' && duelTurn !== 2)}
                    roundTitle={roundTitle}
                />
            </div>

            {/* Center Area */}
            <div className="relative flex-grow flex flex-col items-center justify-center w-full min-h-0">
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div
                        className={`transform scale-75 sm:scale-90 md:scale-100 transition-all duration-300 ${!isPaused ? 'cursor-pointer' : ''} ${shouldBlur ? 'blur-md pointer-events-none' : ''}`}
                        onClick={gameStatus === 'duelPlaying' && !isPaused ? togglePause : undefined}
                        aria-label={t('pauseAria')}
                        role="button"
                    >
                        {/* FIX: Removed the 'questionNumberInDifficulty' prop as it does not exist on the LetterCircle component. */}
                        <LetterCircle
                            key={wordChallenge.correctWord}
                            word={wordChallenge.correctWord}
                            difficulty={difficulty}
                            level={1}
                            gameMode="duel"
                            trophyCount={0}
                        />
                    </div>
                )}
                
                {/* Countdown Display */}
                <CountdownDisplay value={countdownDisplay} />

                {duelSecondPlayerTimeLeft !== null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-brand-bg/40 backdrop-blur-sm border-2 ${duelTurn === 1 ? 'border-brand-accent-secondary' : 'border-brand-accent'}`}>
                            <span className={`text-2xl font-black ${duelTurn === 1 ? 'text-brand-accent-secondary' : 'text-brand-accent'}`}>
                                {duelSecondPlayerTimeLeft}
                            </span>
                        </div>
                    </div>
                )}

                 {isPaused && (gameStatus === 'duelPlaying' || gameStatus === 'countdown') && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-bg/90 backdrop-blur-md z-30 animate-appear">
                        <h2 className="text-3xl font-black text-brand-light mb-8 animate-pulse-slow">{t('paused')}</h2>
                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <button
                                onClick={togglePause}
                                aria-label={t('continue')}
                                className="w-full text-center text-lg sm:text-xl font-black p-3 rounded-full flex items-center justify-center gap-2 transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-bg bg-brand-accent-secondary/80 border-brand-accent-secondary shadow-[0_4px_0_var(--brand-accent-secondary-shadow)] hover:bg-brand-accent-secondary hover:shadow-[0_6px_0_var(--brand-accent-secondary-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-secondary-shadow)]"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                {t('continue')}
                            </button>
                            <button
                                onClick={onReturnToMenu}
                                className="w-full text-center text-lg sm:text-xl font-black p-3 rounded-full flex items-center justify-center gap-2 transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-light bg-brand-warning/50 border-brand-warning/80 shadow-[0_4px_0_var(--brand-warning-shadow)] hover:bg-brand-warning/70 hover:shadow-[0_6px_0_var(--brand-warning-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-warning-shadow)]"
                            >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                               {t('menu')}
                            </button>
                        </div>
                    </div>
                )}
                 {popup && (
                    <div
                        key={popup.key}
                        className="absolute left-10 sm:left-16 pointer-events-none z-20 animate-score-popup-up"
                        style={getPopupPositionAndRotation()}
                    >
                        <span className={`text-5xl font-black ${popup.player === 1 ? 'text-brand-accent-secondary' : 'text-brand-accent'}`}
                              style={{filter: `drop-shadow(0 0 10px currentColor)`}}
                        >
                            {popup.text}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Player 1 (Bottom) */}
            <div className={`w-full transition-all duration-300 ${shouldBlur ? 'blur-md pointer-events-none' : ''}`}>
                 <PlayerInterface 
                    playerNumber={1}
                    score={player1Score}
                    roundWinners={duelRoundWinners}
                    choices={choices}
                    onChoice={onChoice}
                    isRotated={false}
                    isDisabled={isLoading || isPaused || (duelTurn !== 'first' && duelTurn !== 1)}
                    roundTitle={roundTitle}
                />
            </div>
        </div>
    );
};

export default DuelPage;