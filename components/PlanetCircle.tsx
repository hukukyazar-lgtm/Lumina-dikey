import React, { useState, useRef, useEffect, useCallback } from 'react';
import './PlanetCircle.css';
import LetterCube from './LetterCube';

// Props for the planet data
interface Planet {
  name: string;
  distance: string;
  icon: React.ReactNode;
}

interface PlanetCircleProps {
  planetData: Planet[];
  onPlanetClick: (planet: Planet) => void;
  onMagnifyStart: (index: number) => void;
  onMagnifyEnd: () => void;
  magnifiedIndex: number | null;
  disabled: boolean;
}

const CIRCLE_RADIUS = 160; // Radius of the circle in pixels, matching original `10rem`
const FRICTION = 0.95; // Damping factor for inertia, value between 0 and 1. Closer to 1 means longer spin.
const MIN_VELOCITY = 0.1; // Velocity threshold to stop the animation loop.

const CUBE_BORDER_CLASSES = [
  'border-brand-accent-secondary/40', // Sky Blue
  'border-brand-warning/40',          // Yellow
  'border-brand-accent/40',           // Pink
  'border-purple-500/40',             // Purple
];


const PlanetCircle: React.FC<PlanetCircleProps> = ({
  planetData,
  onPlanetClick,
  onMagnifyStart,
  onMagnifyEnd,
  magnifiedIndex,
  disabled
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const circleRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const dragStartInfo = useRef({ startPointerAngle: 0, startCircleAngle: 0, isClick: true });
  
  // Refs for inertia physics
  const velocityRef = useRef(0);
  const lastPointerAngle = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Calculate center on mount and resize
  useEffect(() => {
    const updateCenter = () => {
      if (circleRef.current) {
        const rect = circleRef.current.getBoundingClientRect();
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  const NUM_PLANETS = 24;

  const planets = Array.from({ length: NUM_PLANETS }).map((_, index) => {
    const angleRad = (index / NUM_PLANETS) * 2 * Math.PI;
    const x = CIRCLE_RADIUS * Math.cos(angleRad);
    const y = CIRCLE_RADIUS * Math.sin(angleRad);

    return {
      id: index,
      style: {
        transform: `translate(${x}px, ${y}px)`,
      },
    };
  });

  const stopInertia = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const animateInertia = useCallback(() => {
    if (Math.abs(velocityRef.current) < MIN_VELOCITY) {
      velocityRef.current = 0;
      animationFrameRef.current = null;
      return;
    }
    
    setRotationAngle(prevAngle => prevAngle + velocityRef.current);
    velocityRef.current *= FRICTION;
    
    animationFrameRef.current = requestAnimationFrame(animateInertia);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    stopInertia();

    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const startPointerAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    dragStartInfo.current = {
      startPointerAngle,
      startCircleAngle: rotationAngle,
      isClick: true,
    };
    lastPointerAngle.current = startPointerAngle;
    velocityRef.current = 0;
  }, [rotationAngle, disabled, stopInertia]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;
    const currentPointerAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    let deltaAngle = currentPointerAngle - dragStartInfo.current.startPointerAngle;
    
    // Handle angle wrapping (e.g., from 179 to -179 degrees)
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    const dragThreshold = 5; // 5 degrees
    if (Math.abs(deltaAngle) > dragThreshold) {
        dragStartInfo.current.isClick = false;
    }
    
    const newAngle = dragStartInfo.current.startCircleAngle + deltaAngle;
    
    // Velocity calculation
    let velocityDelta = currentPointerAngle - lastPointerAngle.current;
    if (velocityDelta > 180) velocityDelta -= 360;
    if (velocityDelta < -180) velocityDelta += 360;
    
    velocityRef.current = velocityDelta;
    lastPointerAngle.current = currentPointerAngle;
    setRotationAngle(newAngle);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (!dragStartInfo.current.isClick && Math.abs(velocityRef.current) > MIN_VELOCITY) {
      velocityRef.current *= 1.5; // Give it a little boost for a better flick
      animationFrameRef.current = requestAnimationFrame(animateInertia);
    }
  }, [animateInertia]);

  useEffect(() => {
    const moveHandler = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const endHandler = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('touchmove', moveHandler);
      window.addEventListener('mouseup', endHandler);
      window.addEventListener('touchend', endHandler);
    }

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('mouseup', endHandler);
      window.removeEventListener('touchend', endHandler);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);
  
  // Ensure animation stops on component unmount
  useEffect(() => {
    return stopInertia;
  }, [stopInertia]);

  const handlePlanetClick = (index: number) => {
    if (disabled || !dragStartInfo.current.isClick) return;
    const planet = index < planetData.length ? planetData[index] : null;
    if (planet) {
        onPlanetClick(planet);
    }
  }

  return (
    <div className="universe-container">
      <div
        className={`planet-circle-container ${isDragging ? 'dragging' : ''}`}
        ref={circleRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Central, non-rotating cube */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="animate-cube-orbit-float">
             <LetterCube
                size={40}
                letter={"25"}
                animationDelay="0s"
                faceClassName="bg-brand-secondary backdrop-blur-sm border border-brand-light/60"
                disableContentAnimation={true}
            />
          </div>
        </div>

        <div
          className="planets-wrapper"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotationAngle}deg)`,
            // Removed transition to allow requestAnimationFrame to control movement smoothly
          }}
        >
          {planets.map((planet, i) => {
            const planetInfo = i < planetData.length ? planetData[i] : null;
            const borderColorClass = CUBE_BORDER_CLASSES[i % CUBE_BORDER_CLASSES.length];
            const faceClassName = `bg-transparent backdrop-blur-sm border ${borderColorClass}`;
            return (
                <div key={planet.id} className="planet-orbit">
                    <div className="planet-container" style={planet.style}>
                        <button
                            onMouseDown={() => onMagnifyStart(i)}
                            onMouseUp={onMagnifyEnd}
                            onMouseLeave={onMagnifyEnd}
                            onTouchStart={() => onMagnifyStart(i)}
                            onTouchEnd={onMagnifyEnd}
                            onClick={() => handlePlanetClick(i)}
                            disabled={disabled}
                            title={planetInfo ? planetInfo.name : ''}
                            className="focus:outline-none relative"
                        >
                            <div
                                className="transition-transform duration-200 ease-in-out relative"
                                style={{
                                    transform: magnifiedIndex === i ? 'scale(1.75)' : 'scale(1)',
                                    zIndex: magnifiedIndex === i ? 10 : 1,
                                }}
                            >
                                <div
                                    style={{
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    {planetInfo ? (
                                        <LetterCube
                                            size={29}
                                            icon={planetInfo.icon}
                                            animationDelay="0s"
                                            faceClassName={faceClassName}
                                            disableContentAnimation={true}
                                        />
                                    ) : (
                                        <LetterCube
                                            size={29}
                                            letter={String(i + 1)}
                                            animationDelay={`${i * 100}ms`}
                                            faceClassName="bg-brand-light/20 backdrop-blur-sm border border-brand-light/60"
                                            disableContentAnimation={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanetCircle;