import React, { useRef, useMemo, useLayoutEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { soundService } from '../services/soundService';
import { useLanguage } from './LanguageContext';
import type { JourneyItem } from '../types';
import InteractiveStartPlanet from './InteractiveStartPlanet';

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
  size: number;
  color?: string;
  name?: string;
  imageUrl?: string;
  backgroundSize?: string;
  isCurrent?: boolean;
}> = React.memo(({ type, onClick, size, color, name, imageUrl, backgroundSize, isCurrent }) => {
  const { t } = useLanguage();
  const isPlanet = type === 'planet';
  const handleNodeClick = () => {
    soundService.play('select');
    onClick();
  };

  if (isPlanet) {
    const buttonStyle: React.CSSProperties = {
      borderColor: 'transparent',
      boxShadow: isCurrent ? `0 0 25px ${color}, inset 0 0 15px rgba(0,0,0,0.4)` : `inset 0 0 10px rgba(0,0,0,0.3)`,
      width: '100%',
      height: '100%',
    };

    if (imageUrl) {
        buttonStyle.backgroundImage = `url(${imageUrl})`;
        buttonStyle.backgroundSize = backgroundSize || 'cover';
        buttonStyle.backgroundPosition = 'center';
    } else {
        buttonStyle.backgroundColor = color;
    }
    return (
      <div className="relative w-full h-full">
        <motion.div
            className="w-full h-full"
            animate={{ y: ["-2px", "2px"] }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
            <motion.button 
                onClick={handleNodeClick} 
                className="relative border-2 rounded-full w-full h-full" 
                style={buttonStyle} 
                aria-label={name}
                whileHover={{ scale: 1.2, zIndex: 30 }}
                whileTap={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
                <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(255,255,255,0) 70%)` }} />
            </motion.button>
        </motion.div>
        {name && <span className="absolute top-full mt-2 text-sm font-bold text-brand-light/80 tracking-wider whitespace-nowrap" style={{ left: '50%', transform: 'translateX(-50%)', textShadow: '0 0 5px black' }}>{name}</span>}
      </div>
    );
  }

  // Gateway (swirling portal)
  return (
    <motion.button 
        onClick={handleNodeClick} 
        aria-label="Gateway" 
        className="relative flex items-center justify-center group w-full h-full"
        whileHover={{ scale: 1.3, zIndex: 30 }}
        whileTap={{ scale: 1.1 }}
        animate={{ y: ["-3px", "3px"] }}
        transition={{
            y: {
                duration: 2 + Math.random() * 1.5,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
            },
            scale: {
                type: 'spring',
                stiffness: 400,
                damping: 10,
            },
        }}
    >
      <div 
        className="w-full h-full rounded-full relative overflow-hidden shadow-[0_0_8px_var(--brand-accent-secondary-glow)]"
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
    </motion.button>
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
                
                const direction = planetIndex % 2 === 0 ? 1 : -1;

                const tangentialOffset = Math.PI / 18;
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
                const isPlanet = item.type === 'planet';

                if (index === 0) {
                    const planetSize = 512;
                    const style: React.CSSProperties = {
                        position: 'absolute',
                        bottom: `${point.y}px`,
                        left: `${point.x}px`,
                        transform: `translate(-50%, 50%)`,
                        width: `${planetSize}px`,
                        height: `${planetSize}px`,
                        zIndex: 15,
                    };
                    return (
                        <InteractiveStartPlanet
                            key={item.id}
                            style={style}
                            onClick={() => onNodeClick(item)}
                            color={item.color}
                            name={item.nameKey ? t(item.nameKey as any) : undefined}
                            imageUrl={item.imageUrl}
                        />
                    );
                }

                const size = isPlanet ? 97 : 18;
                const style: React.CSSProperties = {
                    position: 'absolute',
                    bottom: `${point.y}px`,
                    left: `${point.x}px`,
                    transform: 'translate(-50%, 50%)',
                    width: `${size}px`,
                    height: `${size}px`,
                    zIndex: isCurrent ? 20 : (isPlanet ? 10 : 5),
                };

                return (
                    <motion.div
                        key={item.id}
                        style={style}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                    >
                        <JourneyNode
                            type={item.type}
                            onClick={() => onNodeClick(item)}
                            size={size}
                            color={item.color}
                            name={isPlanet && item.nameKey ? t(item.nameKey as any) : undefined}
                            isCurrent={isCurrent}
                            imageUrl={item.imageUrl}
                            backgroundSize={item.backgroundSize}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

export default EndlessJourneyBar;