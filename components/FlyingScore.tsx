import React, { useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FlyingScoreProps {
  score: number;
  startX: number;
  startY: number;
  targetRef: React.RefObject<HTMLElement>;
  onComplete: () => void;
}

const FlyingScore: React.FC<FlyingScoreProps> = ({ score, startX, startY, targetRef, onComplete }) => {
  const [targetPos, setTargetPos] = useState({ x: startX, y: startY });

  useLayoutEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setTargetPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  }, [targetRef, startX, startY]);

  if (targetPos.x === startX) {
      // Don't render until target is ready to avoid a flash at the start point
      return null;
  }

  return (
    <motion.div
      className="fixed text-3xl sm:text-4xl font-black text-brand-accent-secondary z-50 pointer-events-none"
      style={{ textShadow: '0 0 10px var(--brand-accent-secondary-glow)' }}
      initial={{ x: startX, y: startY, scale: 0.5, opacity: 0 }}
      animate={{
        y: [startY, startY - 60, targetPos.y],
        x: [startX, startX, targetPos.x],
        scale: [0.5, 1.5, 0.1],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 1.2,
        ease: "easeInOut",
        times: [0, 0.4, 1], // Popup happens in the first 40% of the animation
      }}
      onAnimationComplete={onComplete}
    >
      +{score}
    </motion.div>
  );
};

export default FlyingScore;
