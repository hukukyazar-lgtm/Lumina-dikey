import React from 'react';
import { useLanguage } from './LanguageContext';
import type { Language } from '../types';
import { soundService } from '../services/soundService';

interface SettingsProps {
  onClose: () => void;
}

// A generic toggle component for switching between options
const OptionToggle: React.FC<{
  value: string;
  onChange: (value: any) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => {
  const activeIndex = options.findIndex(opt => opt.value === value);

  const handleClick = (value: any) => {
    soundService.play('click');
    onChange(value);
  }

  const numOptions = options.length;
  const widthClass = `w-1/${numOptions}`;

  return (
    <div className={`relative flex w-full p-1 bg-black/10 rounded-lg border-2 border-transparent shadow-inner-strong`}>
      {/* Sliding background pill */}
      <div
        className={`absolute top-1 bottom-1 ${widthClass} rounded-md bg-brand-accent-secondary shadow-lg transition-transform duration-300 ease-in-out`}
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => handleClick(option.value)}
          className={`relative z-10 w-1/2 py-2 text-lg font-black transition-colors duration-300 rounded-md focus:outline-none ${
            value === option.value ? 'text-white' : 'text-brand-light/70 hover:text-brand-light'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// A generic slider component for settings
const OptionSlider: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
}> = ({ value, onChange, label }) => {
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(parseFloat(e.target.value));
    };

    const sliderProgress = value * 100;

    const trackStyle = { background: `linear-gradient(to right, var(--brand-accent-secondary) ${sliderProgress}%, rgba(0,0,0,0.1) ${sliderProgress}%)` };

    return (
        <div className="flex items-center gap-4 w-full">
            <span className="w-8 h-8 text-2xl flex items-center justify-center">
                {value > 0.66 ? '🔊' : value > 0.33 ? '🔉' : value > 0 ? '🔈' : '🔇'}
            </span>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={handleVolumeChange}
                aria-label={label}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer range-lg custom-slider"
                style={trackStyle}
            />
        </div>
    );
};


const Settings: React.FC<SettingsProps> = ({ onClose }) => {
    const { 
        uiLanguage, 
        setUiLanguage, 
        gameplayLanguage, 
        setGameplayLanguage,
        sfxVolume,
        setSfxVolume,
        musicVolume,
        setMusicVolume,
        t 
    } = useLanguage();

    const languageOptions = [
        { value: 'en' as Language, label: 'ENGLISH' },
        { value: 'tr' as Language, label: 'TÜRKÇE' },
    ];

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className={`w-full max-w-md text-center p-6 sm:p-8 bg-brand-primary backdrop-blur-sm border-2 border-white/40 rounded-2xl shadow-2xl shadow-black/20 custom-scrollbar overflow-y-auto max-h-[95vh]`}>
                <h2 className="text-4xl sm:text-5xl font-black text-brand-light mb-8">{t('settings')}</h2>

                <div className="space-y-6">
                    {/* UI Language Selection */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-brand-accent-secondary mb-3">{t('uiLanguage')}</h3>
                        <OptionToggle value={uiLanguage} onChange={setUiLanguage} options={languageOptions} />
                    </div>
                    {/* Gameplay Language Selection */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-brand-accent-secondary mb-3">{t('gameplayLanguage')}</h3>
                        <OptionToggle value={gameplayLanguage} onChange={setGameplayLanguage} options={languageOptions} />
                    </div>
                    {/* SFX Volume */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-brand-accent-secondary mb-3">{t('sfxVolume')}</h3>
                        <OptionSlider value={sfxVolume} onChange={setSfxVolume} label={t('sfxVolume')} />
                    </div>
                    {/* Music Volume */}
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-brand-accent-secondary mb-3">{t('musicVolume')}</h3>
                        <OptionSlider value={musicVolume} onChange={setMusicVolume} label={t('musicVolume')} />
                    </div>
                </div>

                <button 
                    onClick={onClose} 
                    className="
                        w-full max-w-xs mt-12 text-center text-xl sm:text-2xl font-black p-4 rounded-lg
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-lg border text-white focus:outline-none
                        bg-brand-accent border-transparent
                        hover:shadow-xl hover:-translate-y-1
                        active:translate-y-0 active:shadow-lg
                    "
                >
                    {t('back')}
                </button>
            </div>
        </div>
    );
};

export default Settings;