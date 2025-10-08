// FIX: Define and export all necessary types for the application.
// This file was previously misconfigured with constants and a circular import.

export type Language = 'en' | 'tr';
export type Theme = 'dark';

export type Difficulty = 'Novice' | 'Apprentice' | 'Adept' | 'Skilled' | 'Seasoned' | 'Veteran' | 'Master' | 'Grandmaster' | 'Legend' | 'Mythic';

export type WordLength = 5 | 6 | 7 | 8;

export type GameStatus =
  | 'intro'
  | 'map'
  | 'practiceMenu'
  | 'profile'
  | 'shop' // Added for the new shop page
  | 'designStudio' // Renamed from imageStudio
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
    consecutiveCorrectAnswers: number;
    roundCount: number;
    successfulRoundCount: number;
    memoryGameWordData: Array<{ word: string; score: number }>;
    memoryGameAllChoices: string[];
    usedWords: string[];
    trophyCount: number;
}

// Types for Profile and Achievements
export interface AchievementConditionState {
    endlessHighScore: number;
    gameMoney: number;
    trophyCount: number;
    playerProfile: PlayerProfile;
}

export interface Achievement {
    id: string;
    titleKey: keyof typeof import('../translations').translations.en;
    descriptionKey: keyof typeof import('../translations').translations.en;
    icon: string;
    condition: (state: AchievementConditionState) => boolean;
}

export interface PlayerProfile {
    name: string;
    avatar: string; // e.g., '🧑‍🚀' or a URL
    stats: {
        totalPracticeWords: number;
        maxPracticeStreak: number;
    };
    unlockedAchievements: string[]; // array of achievement IDs
}

// Types for Shop and Inventory
export type ShopCategory = 'power-ups' | 'upgrades' | 'cosmetics';

export interface ShopItem {
    id: string;
    nameKey: keyof typeof import('../translations').translations.en;
    descriptionKey: keyof typeof import('../translations').translations.en;
    category: ShopCategory;
    icon: string;
    price: number | number[]; // Can be a single price or an array for multiple levels
}

export interface PlayerInventory {
    consumables: Record<string, number>; // e.g., { 'extra-life': 2 }
    upgrades: Record<string, number>; // e.g., { 'score-multiplier': 1 } (level)
    cosmetics: string[]; // e.g., ['theme-gold', 'theme-holo']
    activeTheme: string; // e.g., 'theme-gold'
}

// NEW Type for Endless Journey items
export interface JourneyItem {
    type: 'planet' | 'gate';
    id: string;
    color?: string;
    nameKey?: string;
    imageUrl?: string;
    backgroundSize?: string;
}