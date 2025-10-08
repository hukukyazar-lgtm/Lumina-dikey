import React from 'react';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, onClick, disabled, title }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex flex-col items-center justify-center gap-1 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl transition-colors duration-200 text-brand-light/70 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed group"
    >
      <div className="w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-200 group-hover:scale-110">{icon}</div>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
};

export default NavButton;
