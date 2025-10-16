import { useState, useEffect } from 'react';

// A common breakpoint for tablets and larger screens where a two-player layout is feasible.
const MIN_WIDTH_FOR_TABLET_LAYOUT = 768;

export const useTabletDetection = (): boolean => {
  const [isTabletLayout, setIsTabletLayout] = useState(
    () => window.innerWidth >= MIN_WIDTH_FOR_TABLET_LAYOUT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsTabletLayout(window.innerWidth >= MIN_WIDTH_FOR_TABLET_LAYOUT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTabletLayout;
};
