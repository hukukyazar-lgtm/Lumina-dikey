import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const WaterbedBackground: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out mouse values with spring physics for a fluid feel
  const smoothMouseX = useSpring(mouseX, { stiffness: 75, damping: 100, mass: 3 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 75, damping: 100, mass: 3 });

  // Transform mouse position into 3D rotation
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], ['12deg', '-12deg']);
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], ['-12deg', '12deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    
    // Normalize mouse position to a range of -0.5 to 0.5
    const newMouseX = (clientX - left) / width - 0.5;
    const newMouseY = (clientY - top) / height - 0.5;
    
    mouseX.set(newMouseX);
    mouseY.set(newMouseY);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: -1, // Ensure it's behind everything
        perspective: '1500px', // Create the 3D space
        overflow: 'hidden',
        backgroundColor: 'var(--brand-bg-gradient-end)', // Dark fallback
      }}
    >
      <motion.div
        style={{
          width: '150%',
          height: '150%',
          position: 'absolute',
          top: '-25%',
          left: '-25%',
          rotateX,
          rotateY,
          // Style for the "white cloud" effect
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)',
          filter: 'blur(70px) brightness(1.3)', // Softer and brighter blur for a more cloud-like appearance
        }}
        // Add a slow, continuous undulation to make it feel alive
        animate={{
          scale: [1, 1.03, 1],
        }}
        transition={{
          duration: 22, // Slowed down for a calmer effect
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default WaterbedBackground;
