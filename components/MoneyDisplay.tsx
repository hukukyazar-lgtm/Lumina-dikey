import React, { useState, useEffect, useRef } from 'react';

interface MoneyDisplayProps {
  money: number;
}

const MoneyDisplay: React.FC<MoneyDisplayProps> = ({ money }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const prevMoneyRef = useRef(money);

  useEffect(() => {
    // Animate only when the money increases from its previous value.
    if (money > prevMoneyRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match this duration to the animation duration in CSS.

      return () => clearTimeout(timer);
    }
    
    // Update the ref to the current money for the next comparison.
    prevMoneyRef.current = money;
  }, [money]);
  
  const panelClasses = 'bg-gradient-to-br from-brand-secondary/50 to-brand-primary/50 border-brand-light/10';

  return (
    <div className={`h-10 flex items-center justify-center ${panelClasses} backdrop-blur-sm border px-4 sm:px-6 shadow-bevel-inner rounded-lg`}>
      {/* Money */}
      <span className={`text-lg sm:text-xl font-bold text-brand-warning transition-transform ${isAnimating ? 'animate-score-pop' : ''}`}>
        <span className="inline-block mr-1">☄️</span>{money}
      </span>
    </div>
  );
};

export default React.memo(MoneyDisplay);