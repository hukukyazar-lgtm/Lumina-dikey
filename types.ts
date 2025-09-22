// FIX: Define and export all necessary types for the application.
// This file was previously misconfigured with constants and a circular import.

export type Language = 'en' | 'tr';
export type Theme = 'dark';

export type Difficulty = 'Novice' | 'Apprentice' | 'Adept' | 'Skilled' | 'Seasoned' | 'Veteran' | 'Master' | 'Grandmaster' | 'Legend' | 'Mythic';

export type WordLength = 5 | 6 | 7 | 8;

export type GameStatus =
  | 'intro'
  | 'menu'
  | 'settings'
  | 'leaderboard'
  | 'continuePrompt'
  | 'loading'
  | 'advancing'
  | 'countdown'
  | 'playing'
  | 'correct'
  | 'incorrect'
  | 'gameOver'
  | 'levelComplete'
  | 'memoryGame'
  | 'duelPlaying'
  | 'duelRoundOver'
  | 'duelGameOver';

export type GameMode = 'progressive' | 'practice' | 'duel' | 'endless' | null;

export interface WordChallenge {
  correctWord: string;
  incorrectWords: string[];
}

export type LevelProgress = Record<Difficulty, number>;

export interface HighScore {
  name: string;
  score: number;
  level: number;
  countryCode: string;
  avatarUrl: string;
  date: string; // Added date as ISO string
}

export interface SavedEndlessState {
    gameMoney: number;
    endlessWordCount: number;
    roundCount: number;
    memoryGameWordData: Array<{ word: string; score: number }>;
    memoryGameAllChoices: string[];
    usedWords: string[];
}

export interface SavedProgress {
    score: number;
    lives: number;
    level: number;
    levelProgress: LevelProgress;
    consecutiveCorrectAnswers: number;
    roundCount: number;
    successfulRoundCount: number;
    memoryGameWordData: Array<{ word: string; score: number }>;
    memoryGameAllChoices: string[];
    usedWords: string[];
    trophyCount: number;
    currentDifficultyIndex: number;
}