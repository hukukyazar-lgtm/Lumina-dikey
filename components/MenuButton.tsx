import React from 'react';
import LetterCube from './LetterCube';

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?: string;
  title?: string;
  animationDelay?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, onClick, disabled, color = 'text-brand-light', title, animationDelay }) => {
  const colorClass = disabled ? 'text-gray-500' : color;
  const dynamicStyle = {
    animationDelay: animationDelay,
  } as React.CSSProperties;

  // Map text color classes to border color classes for the cube faces
  const colorMap: Record<string, string> = {
    'text-brand-accent': 'border-brand-accent/40',
    'text-red-500': 'border-red-500/40',
    'text-brand-accent-secondary': 'border-brand-accent-secondary/40',
    'text-brand-warning': 'border-brand-warning/40',
    'text-purple-500': 'border-purple-500/40',
  };
  const borderColorClass = colorMap[color] || 'border-brand-light/40';
  const faceClassName = `bg-black/20 backdrop-blur-sm ${borderColorClass}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex flex-col items-center gap-2 text-center transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group ${colorClass}`}
      style={{ perspective: '1000px', ...dynamicStyle }}
    >
      <div
        className="transition-transform duration-300 group-hover:rotate-x-[-10deg] group-hover:rotate-y-[15deg] group-hover:translate-z-2"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <LetterCube
          icon={<div className="w-9 h-9 transition-transform duration-200 group-hover:scale-110">{icon}</div>}
          size={61}
          animationDelay="0s" // Let parent button handle animation
          faceClassName={faceClassName}
          disableContentAnimation={true} // Content (icon) shouldn't animate on its own
        />
      </div>
      <span className="text-xs sm:text-sm font-semibold text-brand-light/80 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
};

export default MenuButton;