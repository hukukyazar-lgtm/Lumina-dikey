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
      className="bg-[#FEEA9A] border-[3px] border-[#FDB813] rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 text-[#4A2C00] font-black text-xl"
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
    >
        <motion.div
          key={money}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          className="flex items-center gap-2"
        >
          <GoldCoinIcon className="w-7 h-7" />
          <span>{money}</span>
        </motion.div>
    </motion.button>
  );
};

export default React.memo(MoneyDisplay);