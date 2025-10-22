import React from 'react';
// FIX: Import Variants type to fix framer-motion type error.
import { motion, type Variants } from 'framer-motion';
import { useLanguage } from './LanguageContext';
import { translations } from '../translations';
import PressableButton from './PressableButton';

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
  
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { scale: 0.9, opacity: 0, y: 20 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-brand-bg/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description"
    >
        <motion.div
            variants={modalVariants}
            className={`w-full max-w-md text-center p-6 sm:p-8 bg-brand-primary backdrop-blur-sm border-2 border-brand-warning/80 rounded-2xl shadow-2xl shadow-brand-warning/20`}
        >
            <h2 id="dialog-title" className="text-3xl sm:text-4xl font-black text-brand-warning mb-4">{title}</h2>
            <p id="dialog-description" className="text-brand-light/90 text-base sm:text-lg mb-8">{message}</p>
            <div className="flex justify-center gap-4">
                <PressableButton onClick={onCancel} color="primary" className="w-full">
                    <span>{t(cancelTextKey)}</span>
                </PressableButton>
                <PressableButton onClick={onConfirm} color="accent" className="w-full">
                    <span>{t(confirmTextKey)}</span>
                </PressableButton>
            </div>
        </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;
