import { useEffect } from 'react';
import { themes } from '../themes';
import { loadCustomTheme } from '../services/progressService';

export const useThemeManager = (activeTheme: string) => {
  useEffect(() => {
    let theme;
    if (activeTheme === 'custom-generated') {
      theme = loadCustomTheme() || themes['quantum-foam']; // Fallback to default if custom theme isn't found
    } else {
      theme = themes[activeTheme] || themes['quantum-foam']; // Default to quantum-foam
    }
    
    const root = document.documentElement;
    
    // Set data-theme attribute for CSS-based theme switching
    root.setAttribute('data-theme', activeTheme);

    // Set all CSS variables from the theme object
    Object.entries(theme).forEach(([key, value]) => {
      // FIX: Use a `typeof` check as a type guard to satisfy TypeScript that `value` is a string.
      // This correctly handles `undefined` values from the theme object and allows empty strings.
      if (typeof value === 'string') {
        root.style.setProperty(key, value);
      }
    });

  }, [activeTheme]);
};