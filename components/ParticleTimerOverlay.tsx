import React, { useState, useEffect, useRef } from 'react';

const MAX_PARTICLES = 75;

interface Particle {
  id: number;
  x: string; // vw percentage
  y: number; // vh
  size: number; // px
  speed: number;
  opacity: number;
  color: string;
}

interface ParticleTimerOverlayProps {
  duration: number;
  timeLeft: number;
}

const ParticleTimerOverlay: React.FC<ParticleTimerOverlayProps> = ({ duration, timeLeft }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationFrameId = useRef<number>();
  const lastSpawnTimeRef = useRef(0);
  const timeLeftRef = useRef(timeLeft);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    const createParticle = (): Particle => {
      const progress = Math.max(0, timeLeftRef.current) / duration;
      
      let color = 'var(--brand-accent-secondary)'; // Blue
      let baseSpeed = 0.3; // vh per frame

      if (progress <= 0.3) { // Red zone
        color = 'var(--brand-accent)';
        baseSpeed = 0.8;
      } else if (progress <= 0.6) { // Yellow zone
        color = 'var(--brand-warning)';
        baseSpeed = 0.5;
      }

      return {
        id: Date.now() + Math.random(),
        x: `${Math.random() * 100}vw`,
        y: -5,
        size: Math.random() * 2.5 + 1.5,
        speed: (Math.random() * 0.5 + 0.5) * baseSpeed,
        opacity: Math.random() * 0.5 + 0.3,
        color,
      };
    };

    const animate = (timestamp: number) => {
      setParticles(prevParticles => {
        const newParticles = prevParticles
          .map(p => ({ ...p, y: p.y + p.speed }))
          .filter(p => p.y < 105);

        const progress = Math.max(0, timeLeftRef.current) / duration;
        const targetParticleCount = (1.0 - progress) * MAX_PARTICLES * 1.2;
        const spawnInterval = 50;

        if (timestamp - lastSpawnTimeRef.current > spawnInterval) {
          lastSpawnTimeRef.current = timestamp;
          const particlesToSpawn = Math.max(0, Math.ceil(targetParticleCount / 20));
          
          if (newParticles.length < MAX_PARTICLES) {
            for (let i = 0; i < particlesToSpawn; i++) {
              if (newParticles.length < MAX_PARTICLES) {
                newParticles.push(createParticle());
              }
            }
          }
        }
        
        return newParticles;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      setParticles([]);
    };
  }, [duration]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 6px ${p.color}`,
            transition: 'background-color 0.5s linear',
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(ParticleTimerOverlay);