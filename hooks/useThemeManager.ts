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
      // FIX: Ensure value is not undefined before setting the property.
      if (value) {
        root.style.setProperty(key, value);
      }
    });

    // Handle special case for background image
    if (theme['--background-image-override'] && theme['--background-image-override'] !== 'none') {
        document.body.style.backgroundImage = theme['--background-image-override'];
    } else {
        // Fallback to gradient if no override is present
        document.body.style.backgroundImage = `linear-gradient(135deg, ${theme['--brand-bg-gradient-start']} 0%, ${theme['--brand-bg-gradient-end']} 100%)`;
    }

  }, [activeTheme]);
};
