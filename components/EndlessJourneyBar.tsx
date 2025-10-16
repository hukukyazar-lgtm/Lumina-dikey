import React, { useRef, useMemo, useState, useLayoutEffect } from 'react';
import { soundService } from '../services/soundService';
import { useLanguage } from './LanguageContext';
import type { JourneyItem } from '../types';

interface EndlessJourneyBarProps {
  onNodeClick: (node: JourneyItem) => void;
  scrollContainerRef: React.RefObject<HTMLElement>;
  currentProgressIndex: number;
  journeyItems: JourneyItem[];
}

const GATES_PER_PLANET = 6;
const NODES_PER_PLANET = GATES_PER_PLANET + 1;

// This single constant creates a uniform vertical distance between all nodes (planets and gateways),
// ensuring the visual "rope length" between planets is consistent.
const NODE_SPACING = 40; 
const PLANET_CONNECTION_SPACING = NODE_SPACING * 1.5; // Increased spacing for planet entry/exit points
const START_PADDING = 0;
const END_PADDING = 200;

// --- START CHILD COMPONENTS ---

const JourneyNode: React.FC<{ 
  type: 'planet' | 'gate'; 
  onClick: () => void; 
  color?: string;
  className?: string; 
  name?: string;
  style?: React.CSSProperties;
  isCurrent?: boolean;
  animationDelay?: string;
  imageUrl?: string;
  backgroundSize?: string;
  isFirstPlanet?: boolean;
}> = React.memo(({ type, onClick, color, className, name, style, isCurrent, animationDelay, imageUrl, backgroundSize, isFirstPlanet }) => {
  const { t } = useLanguage();
  const isPlanet = type === 'planet';
  const handleNodeClick = () => {
    soundService.play('select');
    onClick();
  };

  if (isFirstPlanet) {
    const planetSize = 512;
// FIX: Cast the style object to React.CSSProperties to allow for custom CSS properties.
    const buttonStyle = {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: '200% auto', // Sized for horizontal panning
        backgroundPosition: 'center',
        // The glow color is dynamically set from the planet's data
        '--glow-color': color,
    } as React.CSSProperties;

    return (
      <div style={{...style, width: `${planetSize}px`, height: `${planetSize}px` }} className="absolute">
        <div className={`relative w-full h-full ${className}`}>
          <button 
            onClick={handleNodeClick} 
            className="relative w-full h-full rounded-full focus:scale-105 transition-transform duration-300 animate-rotate-bg animate-subtle-glow-pulse"
            style={buttonStyle} 
            aria-label={name}
          >
            <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0) 60%)` }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
                
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (isPlanet) {
    const planetSize = 97;
    const buttonStyle: React.CSSProperties = {
        borderColor: 'transparent',
        boxShadow: isCurrent ? `0 0 25px ${color}, inset 0 0 15px rgba(0,0,0,0.4)` : `inset 0 0 10px rgba(0,0,0,0.3)`,
    };

    if (imageUrl) {
        buttonStyle.backgroundImage = `url(${imageUrl})`;
        buttonStyle.backgroundSize = backgroundSize || 'cover';
        buttonStyle.backgroundPosition = 'center';
    } else {
        buttonStyle.backgroundColor = color;
    }
    return (
      <div style={{...style, width: `${planetSize}px`, height: `${planetSize}px` }} className="absolute">
        <div className={`relative w-full h-full transition-shadow duration-500 ease-in-out ${className}`}>
          <button 
            onClick={handleNodeClick} 
            className="relative w-full h-full border-2 rounded-full hover:scale-110 hover:shadow-xl focus:scale-110 focus:shadow-xl transition-transform" 
            style={buttonStyle} 
            aria-label={name}
          >
            <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(255,255,255,0) 70%)` }} />
          </button>
          {name && <span className="absolute top-full mt-2 text-sm font-bold text-brand-light/80 tracking-wider whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)', textShadow: '0 0 5px black' }}>{name}</span>}
        </div>
      </div>
    );
  }

  // Gateway (swirling portal)
  return (
    <div style={style} className="absolute">
      <div className={`${className}`}>
        <button onClick={handleNodeClick} aria-label="Gateway" className="relative flex items-center justify-center group">
          <div 
            className="w-[18px] h-[18px] rounded-full relative overflow-hidden transition-transform duration-300 group-hover:scale-110 shadow-[0_0_8px_var(--brand-accent-secondary-glow)]"
            style={{ animationDelay: animationDelay }}
          >
            {/* Swirling background layer */}
            <div 
              className="absolute inset-[-5px] animate-spin" 
              style={{
                background: `conic-gradient(from 0deg, var(--brand-accent-secondary) 0%, var(--brand-quaternary) 25%, var(--brand-accent-secondary) 50%, transparent 75%, var(--brand-accent-secondary) 100%)`,
                animationDuration: '4s',
              }}
            ></div>
            {/* Inner hole that masks the center */}
            <div 
              className="absolute inset-[3px] rounded-full"
              style={{
                background: `radial-gradient(circle, var(--brand-primary) 0%, var(--brand-bg-gradient-end) 100%)`,
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
              }}
            ></div>
          </div>
        </button>
      </div>
    </div>
  );
});

// --- END CHILD COMPONENTS ---

const EndlessJourneyBar: React.FC<EndlessJourneyBarProps> = ({ onNodeClick, scrollContainerRef, currentProgressIndex, journeyItems }) => {
    const { t } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    
    useLayoutEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const { nodePoints, pathD, containerHeight } = useMemo(() => {
        if (!containerWidth) return { nodePoints: [], pathD: '', containerHeight: 800 };

        const centerX = containerWidth / 2;
        const amplitude = Math.min(containerWidth / 3, 120);

        const yPositions: number[] = [];
        let currentY = START_PADDING;
        journeyItems.forEach((_, index) => {
            if (index > 0) {
                if (index === 1) { // Special large gap after the new giant Earth
                    const earthRadius = 512 / 2;
                    const desiredGap = 40; // Visual space between Earth and first gateway
                    currentY += earthRadius + desiredGap;
                } else {
                    const prevItemIsPlanet = (index - 1) % NODES_PER_PLANET === 0;
                    const currentItemIsPlanet = index % NODES_PER_PLANET === 0;

                    if (prevItemIsPlanet || currentItemIsPlanet) {
                        currentY += PLANET_CONNECTION_SPACING;
                    } else {
                        currentY += NODE_SPACING;
                    }
                }
            }
            yPositions.push(currentY);
        });

        const finalContainerHeight = (yPositions.length > 0 ? yPositions[yPositions.length - 1] : START_PADDING) + END_PADDING;

        const finalNodePoints: ({ x: number; y: number; scale: number; zIndex: number })[] = [];
        journeyItems.forEach((item, index) => {
            const y = yPositions[index];
            
            let x: number;
            if (item.type === 'planet') {
                if (index === 0) {
                    x = 0;
                } else {
                    x = centerX;
                }
            } else { // It's a gateway
                const planetIndex = Math.floor(index / NODES_PER_PLANET);
                const progressWithinPlanet = (index % NODES_PER_PLANET) - 1; // 0 to 5 for gates
                
                // Alternating sine wave direction for each planet system
                const direction = planetIndex % 2 === 0 ? 1 : -1;

                // Create a small tangential offset for the start and end of the sine wave
                // This makes the path curve around the planets instead of going straight in.
                const tangentialOffset = Math.PI / 18; // 10 degrees, small offset from center
                const angleRange = Math.PI - (2 * tangentialOffset);
                const scaledProgress = progressWithinPlanet / (GATES_PER_PLANET - 1);
                const angle = tangentialOffset + (scaledProgress * angleRange);

                x = centerX + direction * amplitude * Math.sin(angle);
            }
            
            const scale = 1;
            const zIndex = 10;
            finalNodePoints.push({ x, y, scale, zIndex });
        });


        let pathData = '';
        for (let i = 0; i < finalNodePoints.length - 1; i++) {
            const p1 = finalNodePoints[i];
            const p2 = finalNodePoints[i+1];
            
            const midY = (p1.y + p2.y) / 2;
            pathData += `M ${p1.x} ${finalContainerHeight - p1.y} C ${p1.x} ${finalContainerHeight - midY}, ${p2.x} ${finalContainerHeight - midY}, ${p2.x} ${finalContainerHeight - p2.y} `;
        }


        return { 
            nodePoints: finalNodePoints, 
            pathD: pathData,
            containerHeight: finalContainerHeight 
        };
    
    }, [journeyItems, containerWidth]);

    useLayoutEffect(() => {
        const scrollEl = scrollContainerRef.current;
        if (scrollEl && containerHeight > 0) {
            setTimeout(() => {
                scrollEl.scrollTop = scrollEl.scrollHeight;
            }, 0);
        }
    }, [containerHeight, scrollContainerRef]);
    
    const randomAnimationDelays = useMemo(() => {
        return journeyItems.map(() => `-${(Math.random() * 20).toFixed(2)}s`);
    }, [journeyItems]);

    return (
        <div ref={containerRef} className="relative w-full" style={{ height: `${containerHeight}px` }}>
            <svg width={containerWidth} height={containerHeight} className="absolute top-0 left-0 pointer-events-none z-0">
                <defs>
                    <filter id="journey-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="spiral-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--brand-accent)" />
                        <stop offset="100%" stopColor="var(--brand-accent-secondary)" />
                    </linearGradient>
                </defs>
                <path
                    d={pathD}
                    fill="none"
                    stroke="url(#spiral-gradient)"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                    filter="url(#journey-glow)"
                    strokeLinecap="round"
                />
            </svg>
            
            {journeyItems.map((item, index) => {
                const point = nodePoints[index];
                if (!point) return null;

                const isCurrent = index === currentProgressIndex;
                const scale = item.type === 'planet' ? 1.0 : 0.8;

                const style: React.CSSProperties = {
                    position: 'absolute',
                    bottom: `${point.y}px`,
                    left: `${point.x}px`,
                    transform: `translate(-50%, 50%) scale(${point.scale * scale})`,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, left 0.5s ease-in-out',
                    zIndex: isCurrent ? 20 : point.zIndex,
                };

                return (
                    <JourneyNode
                        key={item.id}
                        type={item.type}
                        onClick={() => onNodeClick(item)}
                        color={item.color}
                        className="animate-appear"
                        name={item.nameKey ? t(item.nameKey as any) : undefined}
                        style={style}
                        isCurrent={isCurrent}
                        animationDelay={randomAnimationDelays[index]}
                        imageUrl={item.imageUrl}
                        backgroundSize={item.backgroundSize}
                        isFirstPlanet={index === 0}
                    />
                );
            })}
        </div>
    );
};

export default EndlessJourneyBar;