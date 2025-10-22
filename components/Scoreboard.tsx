import React from 'react';
import { motion } from 'framer-motion';

interface ScoreboardProps {
  score: number;
  onClick?: () => void;
}

const Scoreboard = React.forwardRef<HTMLButtonElement, ScoreboardProps>(({ score, onClick }, ref) => {
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      className="pressable-key"
      whileHover={{ y: -2 }}
      whileTap={{ y: 1, x: [0, -1, 1, -1, 1, 0], transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 600, damping: 15 }}
      style={{
        '--key-edge-color': 'var(--brand-accent-secondary-shadow)',
        '--key-front-border-color': 'rgba(255, 255, 255, 0.2)',
        '--key-front-color': 'var(--brand-accent-secondary)',
        '--key-front-text-color': '#1a0e2a',
      } as React.CSSProperties}
    >
      <div className="pressable-key-shadow" />
      <div className="pressable-key-edge" />
      <div className="pressable-key-front text-lg sm:text-xl font-black">
        <motion.span
          key={score}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          className="block w-16 sm:w-20 text-center"
        >
          {score}
        </motion.span>
      </div>
    </motion.button>
  );
});

export default React.memo(Scoreboard);