import type { SavedProgress, SavedEndlessState, PlayerProfile, PlayerInventory, ThemePalette } from '../types';

const GUEST_PROGRESS_KEY = 'lumina-guest-progress';
const ENDLESS_HIGH_SCORE_KEY = 'lumina-endless-high-score';
const ENDLESS_PROGRESS_KEY = 'lumina-endless-progress';
const TOTAL_MONEY_KEY = 'lumina-total-money';
const PLAYER_PROFILE_KEY = 'lumina-player-profile';
const PLAYER_INVENTORY_KEY = 'lumina-player-inventory';
// FIX: Add keys for design studio features
const GENERATED_IMAGES_KEY = 'lumina-generated-images';
const CUSTOM_BUTTON_STRUCTURE_KEY = 'lumina-custom-button-structure';
const CUSTOM_THEME_KEY = 'lumina-custom-theme';

// --- Player Inventory ---
const defaultInventory: PlayerInventory = {
    consumables: {},
    upgrades: {},
    cosmetics: [],
    activeTheme: 'quantum-foam',
};

export const savePlayerInventory = (inventory: PlayerInventory): void => {
    try {
        localStorage.setItem(PLAYER_INVENTORY_KEY, JSON.stringify(inventory));
    } catch (error) {
        console.error("Failed to save player inventory:", error);
    }
};

export const loadPlayerInventory = (): PlayerInventory => {
    try {
        const data = localStorage.getItem(PLAYER_INVENTORY_KEY);
        if (data) {
            const loaded = JSON.parse(data);
            // Merge with default to handle new fields in future updates
            return { ...defaultInventory, ...loaded };
        }
    } catch (error) {
        console.error("Failed to load player inventory:", error);
    }
    return defaultInventory;
};


// --- Player Profile ---
const defaultProfile: PlayerProfile = {
    name: 'Explorer',
    avatar: '🧑‍🚀',
    stats: {
        totalPracticeWords: 0,
        maxPracticeStreak: 0,
    },
    unlockedAchievements: [],
};

export const savePlayerProfile = (profile: PlayerProfile): void => {
    try {
        localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error("Failed to save player profile:", error);
    }
};

export const loadPlayerProfile = (): PlayerProfile => {
    try {
        const data = localStorage.getItem(PLAYER_PROFILE_KEY);
        if (data) {
            const loadedProfile = JSON.parse(data);
            // Merge with default to handle missing fields from older versions
            return {
                ...defaultProfile,
                ...loadedProfile,
                stats: {
                    ...defaultProfile.stats,
                    ...(loadedProfile.stats || {}),
                }
            };
        }
    } catch (error) {
        console.error("Failed to load player profile:", error);
    }
    return defaultProfile;
};


// --- Total Money ---
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

// --- Adventure Mode (Guest Progress) ---
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

// --- Endless Mode High Score ---
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

// --- Endless Mode Persistent Progress ---
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

// FIX: Add functions for saving and loading design studio assets to local storage.
export const saveGeneratedImages = (images: string[]): void => {
    try {
        localStorage.setItem(GENERATED_IMAGES_KEY, JSON.stringify(images));
    } catch (error) {
        console.error("Failed to save generated images:", error);
    }
};

export const loadGeneratedImages = (): string[] => {
    try {
        const data = localStorage.getItem(GENERATED_IMAGES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load generated images:", error);
        return [];
    }
};

export const saveCustomButtonStructure = (structure: Record<string, string>): void => {
    try {
        localStorage.setItem(CUSTOM_BUTTON_STRUCTURE_KEY, JSON.stringify(structure));
    } catch (error) {
        console.error("Failed to save custom button structure:", error);
    }
};

export const saveCustomTheme = (theme: ThemePalette): void => {
    try {
        localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(theme));
    } catch (error) {
        console.error("Failed to save custom theme:", error);
    }
};
