import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { translations } from '../translations';
import { useTabletDetection } from '../hooks/useTabletDetection';
import type { Language, Theme } from '../types';

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  uiLanguage: Language;
  setUiLanguage: (language: Language) => void;
  gameplayLanguage: Language;
  setGameplayLanguage: (language: Language) => void;
  theme: Theme;
  sfxVolume: number;
  setSfxVolume: (volume: number) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  isDeviceTablet: boolean;
  isTabletMode: boolean;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// FIX: Changed component signature to use React.FC and an explicit props interface
// to resolve a subtle typing issue causing "missing children" errors in index.tsx.
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [uiLanguage, setUiLanguageState] = useState<Language>('en');
  const [gameplayLanguage, setGameplayLanguageState] = useState<Language>('en');
  const theme: Theme = 'dark';
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.5);
  const [musicVolume, setMusicVolumeState] = useState<number>(0.2);
  const isDeviceTablet = useTabletDetection();
  // Tablet mode is now automatic based on device detection, the setting has been removed.
  const isTabletMode = isDeviceTablet;


  // Effect for initializing language, theme, and volumes from localStorage or browser defaults
  useEffect(() => {
    // Language
    const savedUiLanguage = localStorage.getItem('lumina-ui-language') as Language | null;
    const savedGameplayLanguage = localStorage.getItem('lumina-gameplay-language') as Language | null;
    const browserLang = navigator.language?.split('-')[0];
    const initialLang = browserLang === 'tr' ? 'tr' : 'en';

    setUiLanguageState(savedUiLanguage || initialLang);
    setGameplayLanguageState(savedGameplayLanguage || initialLang);
    
    // Volumes
    const savedSfxVolume = localStorage.getItem('lumina-sfx-volume');
    if (savedSfxVolume) {
        setSfxVolumeState(parseFloat(savedSfxVolume));
    }
    const savedMusicVolume = localStorage.getItem('lumina-music-volume');
    if (savedMusicVolume) {
        setMusicVolumeState(parseFloat(savedMusicVolume));
    }

  }, []);

  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let text = translations[uiLanguage][key] || translations['en'][key];
    if (vars) {
        Object.keys(vars).forEach(varKey => {
            const regex = new RegExp(`{${varKey}}`, 'g');
            text = text.replace(regex, String(vars[varKey]));
        });
    }
    return text;
  };
  
  const setUiLanguage = useCallback((language: Language) => {
    setUiLanguageState(language);
    localStorage.setItem('lumina-ui-language', language);
  }, []);
  
  const setGameplayLanguage = useCallback((language: Language) => {
    setGameplayLanguageState(language);
    localStorage.setItem('lumina-gameplay-language', language);
  }, []);

  const setSfxVolume = useCallback((newVolume: number) => {
    setSfxVolumeState(newVolume);
    localStorage.setItem('lumina-sfx-volume', String(newVolume));
  }, []);

  const setMusicVolume = useCallback((newVolume: number) => {
    setMusicVolumeState(newVolume);
    localStorage.setItem('lumina-music-volume', String(newVolume));
  }, []);

  return (
    <LanguageContext.Provider value={{ uiLanguage, setUiLanguage, gameplayLanguage, setGameplayLanguage, theme, sfxVolume, setSfxVolume, musicVolume, setMusicVolume, isDeviceTablet, isTabletMode, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for easy consumption of the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
