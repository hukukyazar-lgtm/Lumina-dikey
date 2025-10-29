import React from 'react';
import { motion } from 'framer-motion';

interface EndlessHighScoreDisplayProps {
  score: number;
  onClick?: () => void;
}

const EndlessHighScoreDisplay: React.FC<EndlessHighScoreDisplayProps> = ({ score, onClick }) => {
  const StarIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#FDB813" stroke="#B47D09" strokeWidth="1">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
    </svg>
  );

  return (
    <motion.button
      onClick={onClick}
      className="bg-[#FEEA9A] border-[3px] border-[#FDB813] rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 text-[#4A2C00] font-black text-xl"
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
    >
      <motion.span
        key={score}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
        className="flex items-center gap-2"
      >
        <StarIcon />
        <span>{score}</span>
      </motion.span>
    </motion.button>
  );
};

export default React.memo(EndlessHighScoreDisplay);