
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-brand-bg bg-opacity-75 z-10">
      <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;
