import React from 'react';

interface LuminaSphereProps {
  size: number;
  imageUrl?: string;
  bgColor?: string;
  icon?: React.ReactNode;
}

const LuminaSphere: React.FC<LuminaSphereProps> = ({ size, imageUrl, bgColor, icon }) => {
  const sphereStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    position: 'relative',
    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
    backgroundColor: bgColor || '#333',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6), 0 4px 8px rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures the icon doesn't spill out if it has sharp corners
  };

  const overlayStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(224,224,224,0.1))',
    backdropFilter: 'blur(1px)',
    WebkitBackdropFilter: 'blur(1px)',
  };

  return (
    <div style={sphereStyle}>
      <div style={overlayStyle} />
      {icon && <div style={{ zIndex: 1, width: '100%', height: '100%' }}>{icon}</div>}
    </div>
  );
};

export default React.memo(LuminaSphere);