import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface InteractiveStartPlanetProps {
  style: React.CSSProperties;
  imageUrl?: string;
  color?: string;
  name?: string;
  onClick: () => void;
}

const InteractiveStartPlanet: React.FC<InteractiveStartPlanetProps> = ({ style, imageUrl, color, name, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0.5); // Start at center
  const mouseY = useMotionValue(0.5);

  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 20, mass: 0.5 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 20, mass: 0.5 });

  const rotateY = useTransform(smoothMouseX, [0, 1], ['-15deg', '15deg']);
  const rotateX = useTransform(smoothMouseY, [0, 1], ['15deg', '-15deg']);
  
  // New transforms for inner layers for enhanced parallax
  const innerRotateY1 = useTransform(smoothMouseX, [0, 1], ['10deg', '-10deg']);
  const innerRotateX1 = useTransform(smoothMouseY, [0, 1], ['-10deg', '10deg']);
  const innerRotateY2 = useTransform(smoothMouseX, [0, 1], ['5deg', '-5deg']);
  const innerRotateX2 = useTransform(smoothMouseY, [0, 1], ['-5deg', '5deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    mouseX.set((clientX - left) / width);
    mouseY.set((clientY - top) / height);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // FIX: Cast the style object to React.CSSProperties to allow for custom CSS properties like '--glow-color'.
  const buttonStyle = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'auto 115%',
    backgroundPosition: 'center 45%',
    '--glow-color': color,
    transformStyle: 'preserve-3d', // Needed for children to inherit 3D space
  } as React.CSSProperties;

  return (
    <div style={style} ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.6, 0.01, 0.05, 0.95] }}
      >
        <motion.button 
          onClick={onClick} 
          className="relative w-full h-full rounded-full animate-spin-slow animate-subtle-glow-pulse"
          style={buttonStyle} 
          aria-label={name}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Inner layers for parallax effect */}
          <motion.div 
            className="absolute inset-0 rounded-full" 
            style={{ 
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0) 60%)`,
              transform: 'translateZ(20px)',
              rotateX: innerRotateX1,
              rotateY: innerRotateY1,
            }} 
          />
           <motion.div 
            className="absolute inset-0 rounded-full" 
            style={{ 
              boxShadow: 'inset 0 0 80px 20px rgba(0,0,0,0.5)',
              transform: 'translateZ(10px)',
              rotateX: innerRotateX2,
              rotateY: innerRotateY2,
            }} 
          />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default InteractiveStartPlanet;