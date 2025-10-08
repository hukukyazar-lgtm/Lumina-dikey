import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { PlayerProfile, Language } from '../types';
import { achievements, avatars } from '../config';
import { soundService } from '../services/soundService';
import LeaderboardPage from './LeaderboardPage';

interface ProfilePageProps {
    onClose: () => void;
    playerProfile: PlayerProfile;
    setPlayerProfile: (updater: React.SetStateAction<PlayerProfile>) => void;
    endlessHighScore: number;
    gameMoney: number;
    trophyCount: number;
}

type ProfileTab = 'statistics' | 'achievements' | 'customization' | 'settings' | 'leaderboard';


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
          className={`relative z-10 w-1/2 py-2 text-lg font-extrabold transition-colors duration-300 rounded-md focus:outline-none ${
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


const ProfilePage: React.FC<ProfilePageProps> = ({ onClose, playerProfile, setPlayerProfile, endlessHighScore, gameMoney, trophyCount }) => {
    const { 
        t,
        uiLanguage, 
        setUiLanguage, 
        gameplayLanguage, 
        setGameplayLanguage,
        sfxVolume,
        setSfxVolume,
        musicVolume,
        setMusicVolume,
    } = useLanguage();
    const [activeTab, setActiveTab] = useState<ProfileTab>('statistics');
    const [name, setName] = useState(playerProfile.name);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (name !== playerProfile.name) {
                setPlayerProfile(p => ({ ...p, name }));
            }
        }, 500); // Debounce name saving
        return () => clearTimeout(handler);
    }, [name, playerProfile.name, setPlayerProfile]);
    
    const handleAvatarSelect = (avatarId: string) => {
        soundService.play('select');
        setPlayerProfile(p => ({ ...p, avatar: avatarId }));
    };

    const renderStatistics = () => (
        <div className="space-y-4 animate-appear">
            <div className="bg-brand-secondary/50 p-4 rounded-lg flex justify-between items-center">
                <span className="font-bold text-brand-light/80">{t('endlessHighScoreStat')}</span>
                <span className="text-2xl font-extrabold text-brand-warning">⭐{endlessHighScore}</span>
            </div>
            <div className="bg-brand-secondary/50 p-4 rounded-lg flex justify-between items-center">
                <span className="font-bold text-brand-light/80">{t('totalMoneyStat')}</span>
                <span className="text-2xl font-extrabold text-brand-warning">☄️{gameMoney}</span>
            </div>
        </div>
    );

    const renderAchievements = () => (
        <div className="space-y-3 animate-appear">
            {achievements.map((ach, index) => {
                const isUnlocked = playerProfile.unlockedAchievements.includes(ach.id);
                return (
                    <div key={ach.id} className={`bg-brand-secondary/50 p-3 rounded-lg flex items-center gap-4 transition-all duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-50'}`} style={{animationDelay: `${index * 50}ms`}}>
                        <div className={`text-4xl p-2 rounded-lg ${isUnlocked ? 'bg-brand-primary' : 'bg-black/20'}`}>{ach.icon}</div>
                        <div>
                            <h4 className="font-bold text-brand-light">{t(ach.titleKey)}</h4>
                            <p className="text-sm text-brand-light/70">{t(ach.descriptionKey)}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderCustomization = () => (
        <div className="space-y-6 animate-appear">
            <div>
                <h4 className="text-xl font-bold text-brand-accent-secondary mb-2">{t('changeName')}</h4>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={15}
                    className="w-full p-3 bg-brand-secondary/50 border-2 border-brand-light/20 rounded-lg text-xl text-center font-bold focus:outline-none focus:border-brand-accent-secondary focus:ring-2 focus:ring-brand-accent-secondary/50"
                />
            </div>
            <div>
                <h4 className="text-xl font-bold text-brand-accent-secondary mb-3">{t('selectAvatar')}</h4>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {avatars.map(avatar => {
                        const isUnlocked = !avatar.unlock || playerProfile.unlockedAchievements.includes(avatar.unlock);
                        const isSelected = playerProfile.avatar === avatar.icon;
                        return (
                            <button
                                key={avatar.id}
                                onClick={() => isUnlocked && handleAvatarSelect(avatar.icon)}
                                disabled={!isUnlocked}
                                className={`aspect-square flex items-center justify-center text-4xl rounded-lg border-2 transition-all duration-200
                                    ${!isUnlocked ? 'bg-black/30 border-brand-light/10 grayscale opacity-50 cursor-not-allowed' : 'bg-brand-secondary/50 border-brand-light/20 hover:border-brand-accent-secondary'}
                                    ${isSelected ? 'border-brand-accent-secondary ring-2 ring-brand-accent-secondary/80 scale-105' : ''}
                                `}
                                title={isUnlocked ? t('selectAvatar') : 'Unlock via achievement'}
                            >
                                {avatar.icon}
                                {!isUnlocked && <span className="absolute text-2xl">🔒</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderSettings = () => {
        const languageOptions = [
            { value: 'en' as Language, label: 'ENGLISH' },
            { value: 'tr' as Language, label: 'TÜRKÇE' },
        ];
        return (
            <div className="space-y-6 animate-appear">
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-brand-accent-secondary mb-3">{t('uiLanguage')}</h3>
                    <OptionToggle value={uiLanguage} onChange={setUiLanguage} options={languageOptions} />
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-brand-accent-secondary mb-3">{t('gameplayLanguage')}</h3>
                    <OptionToggle value={gameplayLanguage} onChange={setGameplayLanguage} options={languageOptions} />
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-brand-accent-secondary mb-3">{t('sfxVolume')}</h3>
                    <OptionSlider value={sfxVolume} onChange={setSfxVolume} label={t('sfxVolume')} />
                </div>
                <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-brand-accent-secondary mb-3">{t('musicVolume')}</h3>
                    <OptionSlider value={musicVolume} onChange={setMusicVolume} label={t('musicVolume')} />
                </div>
            </div>
        );
    };
    
    const renderLeaderboard = () => (
      <div className="animate-appear">
          <LeaderboardPage onReturnToMenu={() => {}} isEmbedded />
      </div>
    );

    const avatar = playerProfile.avatar;
    const isAvatarUrl = avatar && (avatar.startsWith('data:') || avatar.startsWith('http'));

    return (
        <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4">
            <div className="w-full max-w-lg text-center p-4 sm:p-6 bg-brand-primary backdrop-blur-sm border-2 border-white/40 rounded-2xl shadow-2xl shadow-black/20 flex flex-col max-h-[95vh]">
                <header className="flex-shrink-0 flex items-center justify-between mb-4">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 text-5xl sm:text-6xl flex items-center justify-center bg-brand-secondary rounded-full border-2 border-brand-light/20 overflow-hidden">
                           {isAvatarUrl ? (
                            <img src={avatar} alt="Player Avatar" className="w-full h-full object-cover" />
                           ) : (
                            <span>{avatar}</span>
                           )}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-light truncate">{playerProfile.name}</h2>
                     </div>
                </header>
                
                <div className="relative flex-shrink-0 flex w-full items-center justify-center p-1 bg-black/20 rounded-full border border-transparent shadow-inner mb-4">
                     {(['statistics', 'achievements', 'leaderboard', 'customization', 'settings'] as ProfileTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { soundService.play('click'); setActiveTab(tab); }}
                            className={`w-1/5 h-10 flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent-secondary/50 ${
                                activeTab === tab ? 'bg-brand-accent-secondary text-white shadow-sm' : 'bg-transparent text-brand-light/60 hover:text-brand-light'
                            }`}
                        >
                            {t(tab)}
                        </button>
                     ))}
                </div>

                <main className="flex-grow overflow-y-auto custom-scrollbar pr-2 py-2">
                    {activeTab === 'statistics' && renderStatistics()}
                    {activeTab === 'achievements' && renderAchievements()}
                    {activeTab === 'leaderboard' && renderLeaderboard()}
                    {activeTab === 'customization' && renderCustomization()}
                    {activeTab === 'settings' && renderSettings()}
                </main>

                <div className="flex-shrink-0 mt-6">
                    <button
                        onClick={onClose}
                        className="w-full max-w-xs text-center text-xl sm:text-2xl font-extrabold p-4 rounded-full transform transition-all duration-150 ease-in-out backdrop-blur-sm shadow-lg border text-white focus:outline-none bg-brand-accent border-transparent hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg"
                    >
                        {t('back')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;