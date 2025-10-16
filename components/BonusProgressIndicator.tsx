import React from 'react';
import { useLanguage } from './LanguageContext';
import { translations } from '../translations';

type TranslationKey = keyof typeof translations.en;

interface BonusProgressIndicatorProps {
  label?: string; // Make label optional
  icon?: React.ReactNode; // Add an optional icon prop
  current: number;
  total: number;
  ariaLabelKey: 'bonusProgress' | 'memoryBonusProgress';
  size?: 'normal' | 'small';
  layout?: 'horizontal' | 'vertical';
}

const ProgressSegment: React.FC<{ isFilled: boolean; size: 'normal' | 'small' }> = ({ isFilled, size }) => {
  return (
    <div
      className={`w-2 rounded-sm transition-all duration-300 ease-in-out ${
        size === 'small' ? 'h-3' : 'h-4'
      } ${
        isFilled ? 'bg-brand-accent-secondary animate-correct-pop shadow-[0_0_8px] shadow-brand-accent-secondary/50' : 'bg-brand-secondary opacity-40'
      }`}
      aria-hidden="true"
    />
  );
};

const BonusProgressIndicator: React.FC<BonusProgressIndicatorProps> = ({ label, icon, current, total, ariaLabelKey, size = 'normal', layout = 'horizontal' }) => {
  const { t } = useLanguage();

  const panelClasses = 'bg-gradient-to-br from-white/10 to-white/5 border-white/20';

  const isSmall = size === 'small';

  if (layout === 'vertical') {
    return (
      <div className="h-full flex flex-col-reverse items-center justify-between bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-0.5 sm:p-1 shadow-bevel-inner rounded-full"
           aria-label={t(ariaLabelKey, { current, total })}>
        
        {/* Segments (stack from bottom up) */}
        {Array.from({ length: total }).map((_, index) => {
            const isFilled = index < current;

            // If an icon is provided, use it for segments.
            if (icon) {
                return (
                    <div
                        key={index}
                        className={`relative flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-all duration-300 ease-in-out ${
                            isFilled ? 'opacity-100' : 'opacity-30 grayscale'
                        }`}
                        aria-hidden="true"
                    >
                         <span className={`text-sm sm:text-base md:text-lg ${isFilled ? 'animate-correct-pop' : ''}`}>{icon}</span>
                    </div>
                )
            }
            
            // Fallback to original segment dots if no icon
            return (
                <div
                    key={index}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ease-in-out ${
                        isFilled ? 'bg-brand-accent-secondary animate-correct-pop shadow-[0_0_8px] shadow-brand-accent-secondary/50' : 'bg-brand-secondary opacity-40'
                    }`}
                    aria-hidden="true"
                />
            );
        })}
      </div>
    );
  }

  return (
    <div className={`${isSmall ? '' : 'flex-1'} flex items-center justify-center ${panelClasses} backdrop-blur-sm border px-3 shadow-bevel-inner rounded-lg ${isSmall ? 'h-8' : 'h-10'}`}>
      <div className="flex items-center gap-2" aria-label={t(ariaLabelKey, {current, total})}>
        {icon && <span className={`${isSmall ? 'text-lg' : 'text-xl'} font-black`}>{icon}</span>}
        {label && <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-black text-brand-light/70 uppercase tracking-wider`}>{label}</span>}
        <div className="flex items-center gap-1">
          {Array.from({ length: total }).map((_, index) => (
            <ProgressSegment key={index} isFilled={index < current} size={size} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(BonusProgressIndicator);