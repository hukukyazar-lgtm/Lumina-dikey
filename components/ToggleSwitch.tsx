import React from 'react';
import { soundService } from '../services/soundService';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, ariaLabel }) => {
  const handleClick = () => {
    soundService.play('click');
    onChange(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-accent-secondary focus:ring-offset-2 focus:ring-offset-brand-secondary ${
        checked ? 'bg-brand-accent-secondary' : 'bg-brand-secondary'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-8' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;
