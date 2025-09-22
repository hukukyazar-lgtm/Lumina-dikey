import React, { useEffect, useRef, useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import Logo from './Logo';
import { soundService } from '../services/soundService';
import { Difficulty } from '../types';
import { difficultyEmojis } from '../config';
import LetterCube from './LetterCube';

interface LoginProps {
  onLogin: (name: string) => void;
  onOpenSettings: () => void;
  trophyCount: number;
  lastPlayedDifficulty: Difficulty | null;
}

const GoogleIcon: React.FC = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z"></path>
  </svg>
);

const GuestIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
);

const AppleIcon: React.FC = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.14,4.24c-1.4-1.42-3.65-1.48-4.91-.19a20,20,0,0,0-4.32,4.64c-1.31,1.8-2.22,4.23-1.89,6.59,0.37,2.74,2.15,5.32,4,5.32,1.21,0,2.1-0.76,3.61-0.76,1.48,0,2.2,0.8,3.65,0.76,2.12-.06,3.89-2.73,4.26-5.49a15.8,15.8,0,0,0-1.84-5.91,12.2,12.2,0,0,0-4.57-4.48ZM14.47,3.13a2.31,2.31,0,0,0-1.94,1.15A2.2,2.2,0,0,0,12,6.36c0,1.28.94,2.28,2,2.31a2.15,2.15,0,0,0,2.24-2,2.41,2.41,0,0,0-1.77-3.54Z" />
    </svg>
);

const ColorfulSettingsIcon: React.FC = () => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="url(#settings-grad)" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="settings-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--brand-accent)' }} />
                <stop offset="50%" style={{ stopColor: '#a855f7' }} />
                <stop offset="100%" style={{ stopColor: 'var(--brand-accent-secondary)' }} />
            </linearGradient>
        </defs>
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.48,0.41L9.12,5.22C8.53,5.46,8,5.78,7.5,6.16L5.11,5.2c-0.22-0.08-0.47,0-0.59,0.22L2.6,8.74 c-0.11,0.2-0.06,0.47,0.12,0.61l2.03,1.58C4.7,11.36,4.68,11.68,4.68,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.48,2.41 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48,0.41l0.48-2.41c0.59-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.11-0.2,0.06-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
    </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin, onOpenSettings, trophyCount, lastPlayedDifficulty }) => {
  const { t } = useLanguage();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const isGoogleConfigured = !!clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  const handleCredentialResponse = useCallback((response: any /* google.accounts.id.CredentialResponse */) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      soundService.init();
      soundService.play('select');
      onLogin(payload.name || 'Google User');
    } catch (e) {
      console.error('Error decoding Google credential:', e);
      handleLoginClick(() => onLogin('Google User'));
    }
  }, [onLogin]);

  useEffect(() => {
    if (!isGoogleConfigured) {
      console.info(
`[DEV INFO] Google Client ID is not configured. Google Sign-In is in mock mode.
To enable real Google Sign-In, set the GOOGLE_CLIENT_ID environment variable.`
      );
      return;
    }

    let intervalId: number;
    const initializeGsi = () => {
      if ((window as any).google && (window as any).google.accounts && googleButtonRef.current) {
        clearInterval(intervalId);

        (window as any).google.accounts.id.initialize({
          client_id: clientId, // Use the configured client ID
          callback: handleCredentialResponse,
        });

        (window as any).google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: "filled_black",
            size: "large",
            type: "standard",
            text: "continue_with",
            shape: "pill",
            width: "290"
          }
        );
      }
    };

    intervalId = window.setInterval(initializeGsi, 100);
    initializeGsi();

    return () => {
      clearInterval(intervalId);
      if ((window as any).google && (window as any).google.accounts) {
        (window as any).google.accounts.id.cancel();
      }
    };
  }, [handleCredentialResponse, isGoogleConfigured, clientId]);


  const handleLoginClick = (loginFunction: () => void) => {
    soundService.init();
    soundService.play('click');
    loginFunction();
  };
  
  const handleOpenSettingsClick = () => {
    soundService.init();
    soundService.play('click');
    onOpenSettings();
  };

  const handleSocialLogin = (provider: 'Facebook' | 'Apple') => {
    console.log(`Login initiated with ${provider}. In a real application, this would trigger the OAuth flow.`);
    onLogin(`${provider} User`);
  };

  const handleGuestLogin = () => {
    onLogin('Guest');
  };

  const baseButtonClasses = `
    w-full max-w-xs text-center text-xl font-bold p-3 rounded-lg
    transform transition-all duration-150 ease-in-out
    backdrop-blur-sm shadow-bevel-inner border focus:outline-none flex items-center justify-center gap-4
  `;
  
  const socialButtonClasses = `
    text-gray-800 bg-white border-gray-300 shadow-[0_4px_0_#d1d5db] hover:bg-gray-50 active:translate-y-1 active:shadow-[0_2px_0_#d1d5db]
    dark:text-white dark:bg-[#1A1C20] dark:border-brand-light/20 dark:shadow-[0_4px_0_#0a0a0c] dark:hover:bg-[#24262b] dark:active:shadow-[0_2px_0_#0a0a0c]
  `;

  return (
    <div className="relative flex flex-col items-center min-h-screen h-full bg-brand-bg text-brand-light font-sans p-2 sm:p-4 overflow-hidden">
        <button 
            onClick={handleOpenSettingsClick}
            aria-label={t('settings')}
            className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 transition-transform duration-150 ease-in-out hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-lg"
        >
            <div className="animate-settings-cube-pulse">
                <LetterCube
                    icon={<ColorfulSettingsIcon />}
                    size={40}
                    animationDelay="0s, 0s, 0s"
                    faceClassName="bg-black/50 backdrop-blur-sm border border-purple-500/60"
                />
            </div>
        </button>
        <header className={`w-full flex justify-center items-center p-2 sm:p-4 bg-brand-primary backdrop-blur-sm border-b border-brand-accent-secondary/20 rounded-b-xl shadow-inner-strong`}>
            <div className="flex items-center gap-2">
                <Logo />
                {/* Difficulty Emoji */}
                {lastPlayedDifficulty && (
                    <span className="text-2xl" title={t(lastPlayedDifficulty.toLowerCase() as any)}>
                        {difficultyEmojis[lastPlayedDifficulty]}
                    </span>
                )}
                {/* Trophy */}
                <div 
                    className={`flex items-center transition-all duration-500 ${trophyCount > 0 ? 'opacity-100' : 'opacity-30 grayscale'}`}
                    title={trophyCount > 0 ? `Trophies x${trophyCount}` : "Complete all difficulties to earn a trophy"}
                >
                    <span className="text-2xl" style={trophyCount > 0 ? { filter: 'drop-shadow(0 0 8px #FFD700)' } : {}}>
                        🏆
                    </span>
                    {trophyCount > 1 && (
                        <span className="text-sm font-bold text-yellow-300 relative -ml-1" style={{ textShadow: '0 0 4px black' }}>
                            x{trophyCount}
                        </span>
                    )}
                </div>
            </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-sm animate-appear p-4">
                <div className="w-full flex flex-col items-center gap-4 mt-8">
                    {/* Guest Login Button */}
                    <button
                        onClick={() => handleLoginClick(handleGuestLogin)}
                        className={`${baseButtonClasses} text-brand-light bg-brand-accent/50 border-brand-accent/80 shadow-[0_4px_0_var(--brand-accent-shadow)] hover:bg-brand-accent/70 hover:shadow-[0_6px_0_var(--brand-accent-shadow)] active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-shadow)]`}
                    >
                        <GuestIcon />
                        <span className="flex-grow text-center">{t('continueAsGuest')}</span>
                    </button>

                    {/* Google Login Button Container */}
                    {isGoogleConfigured ? (
                        <div ref={googleButtonRef} className="w-full max-w-xs flex justify-center" />
                    ) : (
                        <button
                          onClick={() => handleLoginClick(() => onLogin('Dev User'))}
                          className={`${baseButtonClasses} ${socialButtonClasses} hover:border-gray-400/60`}
                        >
                            <GoogleIcon />
                            <span className="flex-grow text-center">{`${t('continueWithGoogle')} (Dev)`}</span>
                        </button>
                    )}

                    {/* Apple Login Button */}
                    <button
                        onClick={() => handleLoginClick(() => handleSocialLogin('Apple'))}
                        className={`${baseButtonClasses} ${socialButtonClasses} hover:border-gray-400/60 hover:shadow-[0_6px_0_#d1d5db,0_0_15px_rgba(100,100,100,0.4)] dark:hover:shadow-[0_6px_0_#0a0a0c,0_0_15px_rgba(200,200,200,0.4)]`}
                    >
                        <div className="text-black dark:text-white">
                            <AppleIcon />
                        </div>
                        <span className="flex-grow text-center">{t('continueWithApple')}</span>
                    </button>

                    {/* Facebook Login Button */}
                    <button
                        onClick={() => handleLoginClick(() => handleSocialLogin('Facebook'))}
                        className={`${baseButtonClasses} ${socialButtonClasses} hover:border-brand-accent/60 hover:shadow-[0_6px_0_#d1d5db,0_0_15px_rgba(255,77,0,0.4)] dark:hover:shadow-[0_6px_0_#0a0a0c,0_0_15px_rgba(255,77,0,0.4)]`}
                    >
                         <div className="text-[#1877F2] dark:text-white">
                            <FacebookIcon />
                        </div>
                        <span className="flex-grow text-center">{t('continueWithFacebook')}</span>
                    </button>
                </div>
            </div>
        </main>
    </div>
  );
};

export default Login;