import type { SavedProgress, SavedEndlessState } from '../types';

const GUEST_PROGRESS_KEY = 'lumina-guest-progress';
const ENDLESS_HIGH_SCORE_KEY = 'lumina-endless-high-score';
const ENDLESS_PROGRESS_KEY = 'lumina-endless-progress';
const TOTAL_MONEY_KEY = 'lumina-total-money';

export const saveTotalMoney = (money: number): void => {
    try {
        localStorage.setItem(TOTAL_MONEY_KEY, String(money));
    } catch (error) {
        console.error("Failed to save total money:", error);
    }
};

export const loadTotalMoney = (): number => {
    try {
        const money = localStorage.getItem(TOTAL_MONEY_KEY);
        return money ? parseInt(money, 10) : 0;
    } catch (error) {
        console.error("Failed to load total money:", error);
        return 0;
    }
};

export const saveGuestProgress = (progress: SavedProgress): void => {
  try {
    const data = JSON.stringify(progress);
    localStorage.setItem(GUEST_PROGRESS_KEY, data);
  } catch (error) {
    console.error("Failed to save guest progress:", error);
  }
};

export const loadGuestProgress = (): SavedProgress | null => {
  try {
    const data = localStorage.getItem(GUEST_PROGRESS_KEY);
    if (data) {
      return JSON.parse(data) as SavedProgress;
    }
    return null;
  } catch (error) {
    console.error("Failed to load guest progress:", error);
    return null;
  }
};

export const clearGuestProgress = (): void => {
  try {
    localStorage.removeItem(GUEST_PROGRESS_KEY);
  } catch (error) {
    console.error("Failed to clear guest progress:", error);
  }
};

// Functions for Endless mode high score
export const saveEndlessHighScore = (wordCount: number): void => {
    try {
        const currentHighScore = loadEndlessHighScore();
        if (wordCount > currentHighScore) {
            localStorage.setItem(ENDLESS_HIGH_SCORE_KEY, String(wordCount));
        }
    } catch (error) {
        console.error("Failed to save endless high score:", error);
    }
};

export const loadEndlessHighScore = (): number => {
    try {
        const score = localStorage.getItem(ENDLESS_HIGH_SCORE_KEY);
        return score ? parseInt(score, 10) : 0;
    } catch (error) {
        console.error("Failed to load endless high score:", error);
        return 0;
    }
};

// Functions for Endless mode persistent progress
export const saveEndlessProgress = (progress: SavedEndlessState): void => {
  try {
    const data = JSON.stringify(progress);
    localStorage.setItem(ENDLESS_PROGRESS_KEY, data);
  } catch (error) {
    console.error("Failed to save endless progress:", error);
  }
};

export const loadEndlessProgress = (): SavedEndlessState | null => {
  try {
    const data = localStorage.getItem(ENDLESS_PROGRESS_KEY);
    if (data) {
      return JSON.parse(data) as SavedEndlessState;
    }
    return null;
  } catch (error) {
    console.error("Failed to load endless progress:", error);
    return null;
  }
};

export const clearEndlessProgress = (): void => {
  try {
    localStorage.removeItem(ENDLESS_PROGRESS_KEY);
  } catch (error) {
    console.error("Failed to clear endless progress:", error);
  }
};