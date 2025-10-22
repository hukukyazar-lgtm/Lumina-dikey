import React from 'react';
import { motion } from 'framer-motion';
import GoldCoinIcon from './GoldCoinIcon';

interface MoneyDisplayProps {
  money: number;
  onClick?: () => void;
}

const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ money, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="pressable-key"
      whileHover={{ y: -2 }}
      whileTap={{ y: 1, x: [0, -1, 1, -1, 1, 0], transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
      style={{
        '--key-edge-color': 'var(--brand-warning-shadow)',
        '--key-front-border-color': 'rgba(255, 255, 255, 0.4)',
        '--key-front-color': 'var(--brand-warning)',
        '--key-front-text-color': '#4a2c00',
      } as React.CSSProperties}
    >
      <div className="pressable-key-shadow" />
      <div className="pressable-key-edge" />
      <div className="pressable-key-front text-lg sm:text-xl font-black">
        <motion.div
          key={money}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          className="flex items-center gap-2"
        >
          <GoldCoinIcon className="w-6 h-6" />
          {money}
        </motion.div>
      </div>
    </motion.button>
  );
};

export default React.memo(MoneyDisplay);