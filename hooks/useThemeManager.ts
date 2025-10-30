import { useEffect } from 'react';
import { themes } from '../themes';
import type { ThemePalette, GameStatus, Difficulty, GameBackgrounds } from '../types';

/**
 * Applies a theme palette's CSS variables to the document root.
 * @param palette The theme palette to apply.
 */
const applyTheme = (palette: ThemePalette) => {
  const root = document.documentElement;
  
  Object.entries(palette).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(key, value);
    }
  });

  const defaultKeys = Object.keys(themes.default);
  defaultKeys.forEach(key => {
    if (!palette.hasOwnProperty(key)) {
        if (!key.startsWith('--custom-button') && key !== '--background-image-override') {
             root.style.removeProperty(key);
        }
    }
  });
};

/**
 * Custom hook to manage and apply UI themes, including dynamic backgrounds.
 */
export const useThemeManager = (
    activeThemeId: string, 
    customTheme: ThemePalette | null,
    customMenuBackground: string | null,
    gameStatus: GameStatus,
    difficulty: Difficulty,
    customGameBackgrounds: GameBackgrounds
) => {
  useEffect(() => {
    let themeToApply: ThemePalette | undefined;

    if (activeThemeId === 'custom' && customTheme) {
      themeToApply = customTheme;
    } else {
      themeToApply = themes[activeThemeId];
    }
    
    if (!themeToApply) {
      themeToApply = themes.default;
    }

    applyTheme(themeToApply);

    // --- CENTRALIZED BACKGROUND LOGIC ---
    const body = document.body;
    const isGameActive = ['playing', 'countdown', 'correct', 'incorrect', 'advancing', 'duelPlaying'].includes(gameStatus);
    
    const easy: Difficulty[] = ['Novice', 'Apprentice', 'Adept'];
    const medium: Difficulty[] = ['Skilled', 'Seasoned', 'Veteran'];
    const difficultyGroup = easy.includes(difficulty) ? 'easy' : medium.includes(difficulty) ? 'medium' : 'hard';

    const customGameBg = customGameBackgrounds[difficultyGroup];

    let finalBackgroundImage = '';

    if (isGameActive && customGameBg) {
        finalBackgroundImage = `url(${customGameBg})`;
    } else if (customMenuBackground) {
        finalBackgroundImage = `url(${customMenuBackground})`;
    } else if (themeToApply && themeToApply['--background-image-override']) {
        finalBackgroundImage = themeToApply['--background-image-override'];
    }

    // Apply the chosen background
    body.style.backgroundImage = finalBackgroundImage;
    body.style.backgroundSize = 'cover';
    body.style.backgroundPosition = 'center';

  }, [activeThemeId, customTheme, customMenuBackground, gameStatus, difficulty, customGameBackgrounds]);
};