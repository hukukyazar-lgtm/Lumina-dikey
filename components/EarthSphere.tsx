import React from 'react';

interface EarthSphereProps {
  size: number;
}

const EarthSphere: React.FC<EarthSphereProps> = ({ size }) => {
  const sphereStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    position: 'relative',
    // Fallback color in case the image fails to load
    backgroundColor: '#3a8dce', 
    // A different, high-quality, tileable Earth texture
    backgroundImage: `url(https://imgur.com/a/dYtQiDm)`, 
    // background-size must be 200% wide for a seamless 360-degree rotation animation
    backgroundSize: '200% 100%',
    // Inner shadow for depth and atmospheric glow
    boxShadow: 'inset 6px 0 10px -2px rgba(0,0,0,0.7), 0 0 10px rgba(100, 150, 255, 0.3)',
    overflow: 'hidden', // Ensures overlay gradient doesn't spill out
  };

  const overlayStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    position: 'absolute',
    top: 0,
    left: 0,
    // Simulates specular lighting from a star
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)',
  };

  return (
    // The animate-earth-spin class is defined in index.html and provides the rotation
    <div style={sphereStyle} className="animate-earth-spin">
      <div style={overlayStyle} />
    </div>
  );
};

export default React.memo(EarthSphere);