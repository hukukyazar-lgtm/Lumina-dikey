import type { SavedProgress, SavedEndlessState, PlayerProfile, PlayerInventory } from '../types';

const GUEST_PROGRESS_KEY = 'lumina-guest-progress';
const ENDLESS_HIGH_SCORE_KEY = 'lumina-endless-high-score';
const ENDLESS_PROGRESS_KEY = 'lumina-endless-progress';
const TOTAL_MONEY_KEY = 'lumina-total-money';
const PLAYER_PROFILE_KEY = 'lumina-player-profile';
const PLAYER_INVENTORY_KEY = 'lumina-player-inventory';
const CUSTOM_PLANET_IMAGES_KEY = 'lumina-custom-planet-images'; // Renamed from CUSTOM_WORLD_IMAGE_KEY
const CUSTOM_MENU_BACKGROUND_KEY = 'lumina-custom-menu-background'; // New key for menu bg
const CUSTOM_GAME_BACKGROUND_KEY = 'lumina-custom-game-background';
const CUSTOM_BUTTON_TEXTURE_KEY = 'lumina-custom-button-texture';
const CUSTOM_BUTTON_STRUCTURE_KEY = 'lumina-custom-button-structure';
const CUSTOM_CUBE_STYLE_KEY = 'lumina-custom-cube-style'; // New key
const CUSTOM_GENERATED_IMAGES_KEY = 'lumina-generated-images';


// --- Custom Cube Style --- (NEW)
export const saveCustomCubeStyle = (styleId: string): void => {
    try {
        localStorage.setItem(CUSTOM_CUBE_STYLE_KEY, styleId);
    } catch (error) {
        console.error("Failed to save custom cube style:", error);
    }
};

export const loadCustomCubeStyle = (): string | null => {
    try {
        return localStorage.getItem(CUSTOM_CUBE_STYLE_KEY);
    } catch (error) {
        console.error("Failed to load custom cube style:", error);
        return null;
    }
};


// --- Custom Button Structure ---
export const saveCustomButtonStructure = (structure: object): void => {
    try {
        localStorage.setItem(CUSTOM_BUTTON_STRUCTURE_KEY, JSON.stringify(structure));
    } catch (error) {
        console.error("Failed to save custom button structure:", error);
    }
};

export const loadCustomButtonStructure = (): object | null => {
    try {
        const data = localStorage.getItem(CUSTOM_BUTTON_STRUCTURE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Failed to load custom button structure:", error);
        return null;
    }
};


// --- Custom Button Style / Texture ---
export const saveCustomButtonTexture = (imageUrl: string): void => {
    try {
        localStorage.setItem(CUSTOM_BUTTON_TEXTURE_KEY, imageUrl);
    } catch (error) {
        console.error("Failed to save custom button style:", error);
    }
};

export const loadCustomButtonTexture = (): string | null => {
    try {
        return localStorage.getItem(CUSTOM_BUTTON_TEXTURE_KEY);
    } catch (error) {
        console.error("Failed to load custom button style:", error);
        return null;
    }
};


// --- Custom Game Background ---
export const saveCustomGameBackground = (imageUrl: string): void => {
    try {
        localStorage.setItem(CUSTOM_GAME_BACKGROUND_KEY, imageUrl);
    } catch (error) {
        console.error("Failed to save custom game background:", error);
    }
};

export const loadCustomGameBackground = (): string | null => {
    try {
        return localStorage.getItem(CUSTOM_GAME_BACKGROUND_KEY);
    } catch (error) {
        console.error("Failed to load custom game background:", error);
        return null;
    }
};


// --- Custom Menu Background --- (NEW)
export const saveCustomMenuBackground = (imageUrl: string): void => {
    try {
        localStorage.setItem(CUSTOM_MENU_BACKGROUND_KEY, imageUrl);
    } catch (error) {
        console.error("Failed to save custom menu background:", error);
    }
};

export const loadCustomMenuBackground = (): string | null => {
    try {
        return localStorage.getItem(CUSTOM_MENU_BACKGROUND_KEY);
    } catch (error) {
        console.error("Failed to load custom menu background:", error);
        return null;
    }
};

// --- Custom Planet Images --- (MODIFIED)
export const saveCustomPlanetImages = (images: Record<number, string>): void => {
    try {
        localStorage.setItem(CUSTOM_PLANET_IMAGES_KEY, JSON.stringify(images));
    } catch (error) {
        console.error("Failed to save custom planet images:", error);
    }
};

export const loadCustomPlanetImages = (): Record<number, string> => {
    try {
        const data = localStorage.getItem(CUSTOM_PLANET_IMAGES_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Failed to load custom planet images:", error);
        return {};
    }
};

// --- Generated Images Gallery ---
export const saveGeneratedImages = (images: string[]): void => {
    try {
        localStorage.setItem(CUSTOM_GENERATED_IMAGES_KEY, JSON.stringify(images));
    } catch (error) {
        console.error("Failed to save generated images:", error);
    }
};

export const loadGeneratedImages = (): string[] => {
    try {
        const data = localStorage.getItem(CUSTOM_GENERATED_IMAGES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load generated images:", error);
        return [];
    }
};


// --- Player Inventory ---
const defaultInventory: PlayerInventory = {
    consumables: {},
    upgrades: {},
    cosmetics: [],
    activeTheme: 'default',
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
