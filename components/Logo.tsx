import React from 'react';
import LuminaCube from './LuminaCube';

const Logo: React.FC = () => {
  return (
    // A container is used to set the perspective, which is necessary for the 3D effect of the cube to be rendered correctly.
    // It also maintains a consistent size in the layout.
    <div className="flex items-center justify-center w-6 h-6" aria-label="Lumina" style={{ perspective: '200px' }}>
      <LuminaCube 
        size={24} 
        // 'animate-tumble-mythic' uses the 'tumble-xyz' keyframe for a full 3D rotation.
        animationClass="animate-tumble-mythic" 
        // A slower duration for a more subtle, pleasant effect in the UI.
        animationDuration="15s" 
      />
    </div>
  );
};

export default Logo;