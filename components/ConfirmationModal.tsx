import React from 'react';
import { useLanguage } from './LanguageContext';
import { translations } from '../translations';

type TranslationKey = keyof typeof translations.en;

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmTextKey?: TranslationKey;
  cancelTextKey?: TranslationKey;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title, 
  message,
  confirmTextKey = 'confirmQuit',
  cancelTextKey = 'cancelQuit'
}) => {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-appear p-4" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <div className={`w-full max-w-md text-center p-6 sm:p-8 bg-brand-primary backdrop-blur-sm border-2 border-brand-warning/80 rounded-2xl shadow-2xl shadow-brand-warning/20`}>
            <h2 id="dialog-title" className="text-3xl sm:text-4xl font-extrabold text-brand-warning mb-4">{title}</h2>
            <p id="dialog-description" className="text-brand-light/90 text-base sm:text-lg mb-8">{message}</p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={onCancel}
                    className="
                        w-full text-center text-lg sm:text-xl font-extrabold p-3 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-light
                        bg-brand-secondary border-brand-light/20 shadow-[0_4px_0_var(--bevel-shadow-dark)]
                        hover:bg-brand-light/10 hover:shadow-[0_6px_0_var(--bevel-shadow-dark)]
                        active:translate-y-1 active:shadow-[0_2px_0_var(--bevel-shadow-dark)]
                    "
                >
                    {t(cancelTextKey)}
                </button>
                <button
                    onClick={onConfirm}
                    className="
                        w-full text-center text-lg sm:text-xl font-extrabold p-3 rounded-full
                        transform transition-all duration-150 ease-in-out
                        backdrop-blur-sm shadow-bevel-inner border focus:outline-none text-brand-light
                        bg-brand-accent/50 border-brand-accent/80 shadow-[0_4px_0_var(--brand-accent-shadow)]
                        hover:bg-brand-accent/70 hover:shadow-[0_6px_0_var(--brand-accent-shadow)]
                        active:translate-y-1 active:shadow-[0_2px_0_var(--brand-accent-shadow)]
                    "
                >
                    {t(confirmTextKey)}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmationModal;
