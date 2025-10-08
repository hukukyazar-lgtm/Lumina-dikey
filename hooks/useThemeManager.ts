
import { useEffect } from 'react';
import { themes } from '../themes';

export const useThemeManager = (activeTheme: string) => {
  useEffect(() => {
    const theme = themes[activeTheme] || themes.default;
    
    const root = document.documentElement;
    
    // Set all CSS variables from the theme object
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Handle special case for background image
    if (theme['--background-image-override']) {
        document.body.style.backgroundImage = theme['--background-image-override'];
    } else {
        // Fallback to gradient if no override is present
        document.body.style.backgroundImage = `linear-gradient(135deg, ${theme['--brand-bg-gradient-start']} 0%, ${theme['--brand-bg-gradient-end']} 100%)`;
    }

  }, [activeTheme]);
};
