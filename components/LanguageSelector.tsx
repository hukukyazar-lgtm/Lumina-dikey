import React from 'react';
import { useLanguage } from './LanguageContext';
import type { Language } from '../types';

interface LanguageSelectorProps {
  onLanguageSelect: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelect }) => {
  // FIX: Destructure setUiLanguage and setGameplayLanguage from useLanguage context, as 'setLanguage' does not exist.
  const { setUiLanguage, setGameplayLanguage, t } = useLanguage();

  const handleSelect = (lang: Language) => {
    // FIX: Update both UI and gameplay languages.
    setUiLanguage(lang);
    setGameplayLanguage(lang);
    onLanguageSelect();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 animate-appear p-4">
      <h2 className="text-3xl sm:text-4xl font-black text-brand-accent mb-4 tracking-widest text-center">{t('chooseLanguage')}</h2>
      <button
        onClick={() => handleSelect('en')}
        className="w-full max-w-xs text-center text-xl sm:text-2xl font-black p-4 rounded-lg transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none bg-black/30 border-brand-accent/40 shadow-[0_4px_0_var(--brand-accent-shadow)] hover:bg-black/50 hover:-translate-y-0.5 hover:shadow-[0_6px_0_var(--brand-accent-shadow),0_0_20px_var(--brand-accent)] hover:border-brand-accent active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-shadow)]"
      >
        ENGLISH
      </button>
      <button
        onClick={() => handleSelect('tr')}
        className="w-full max-w-xs text-center text-xl sm:text-2xl font-black p-4 rounded-lg transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-bevel-inner border text-brand-light focus:outline-none bg-black/30 border-brand-accent/40 shadow-[0_4px_0_var(--brand-accent-shadow)] hover:bg-black/50 hover:-translate-y-0.5 hover:shadow-[0_6px_0_var(--brand-accent-shadow),0_0_20px_var(--brand-accent)] hover:border-brand-accent active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-shadow)]"
      >
        TÜRKÇE
      </button>
    </div>
  );
};

export default LanguageSelector;