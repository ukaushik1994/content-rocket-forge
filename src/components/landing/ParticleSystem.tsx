import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'dot' | 'line' | 'triangle' | 'plus';
  color: 'blue' | 'purple' | 'cyan' | 'emerald' | 'pink';
  speed: number;
  direction: number;
}

const generateParticles = (count: number): Particle[] => {
  const particles: Particle[] = [];
  const types: Particle['type'][] = ['dot', 'line', 'triangle', 'plus'];
  const colors: Particle['color'][] = ['blue', 'purple', 'cyan', 'emerald', 'pink'];
  
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      type: types[Math.floor(Math.random() * types.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 0.5,
      direction: Math.random() * Math.PI * 2
    });
  }
  
  return particles;
};

const getColorClass = (color: Particle['color']) => {
  switch (color) {
    case 'blue': return 'text-blue-400';
    case 'purple': return 'text-purple-400';
    case 'cyan': return 'text-cyan-400';
    case 'emerald': return 'text-emerald-400';
    case 'pink': return 'text-pink-400';
    default: return 'text-blue-400';
  }
};

const ParticleShape: React.FC<{ particle: Particle }> = ({ particle }) => {
  const colorClass = getColorClass(particle.color);
  const size = `${particle.size * 4}px`;
  
  switch (particle.type) {
    case 'dot':
      return (
        <div 
          className={`rounded-full ${colorClass} opacity-60`}
          style={{
            width: size,
            height: size,
            backgroundColor: 'currentColor',
            filter: 'blur(0.5px)'
          }}
        />
      );
    
    case 'line':
      return (
        <div 
          className={`${colorClass} opacity-40`}
          style={{
            width: `${particle.size * 8}px`,
            height: '1px',
            backgroundColor: 'currentColor',
            transform: `rotate(${particle.direction}rad)`
          }}
        />
      );
    
    case 'triangle':
      return (
        <div 
          className={`${colorClass} opacity-50`}
          style={{
            width: 0,
            height: 0,
            borderLeft: `${particle.size * 2}px solid transparent`,
            borderRight: `${particle.size * 2}px solid transparent`,
            borderBottom: `${particle.size * 3}px solid currentColor`,
            transform: `rotate(${particle.direction}rad)`
          }}
        />
      );
    
    case 'plus':
      return (
        <div className={`${colorClass} opacity-50 relative`}>
          <div 
            className="absolute bg-current"
            style={{
              width: `${particle.size * 6}px`,
              height: '1px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div 
            className="absolute bg-current"
            style={{
              width: '1px',
              height: `${particle.size * 6}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>
      );
    
    default:
      return null;
  }
};

export const ParticleSystem: React.FC<{ density?: 'low' | 'medium' | 'high' }> = ({ 
  density = 'medium' 
}) => {
  const particleCount = useMemo(() => {
    switch (density) {
      case 'low': return 15;
      case 'medium': return 25;
      case 'high': return 35;
      default: return 25;
    }
  }, [density]);
  
  const particles = useMemo(() => generateParticles(particleCount), [particleCount]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            opacity: 0,
            scale: 0
          }}
          animate={{
            x: [
              `${particle.x}%`,
              `${(particle.x + Math.cos(particle.direction) * 10) % 100}%`,
              `${(particle.x + Math.cos(particle.direction) * 20) % 100}%`
            ],
            y: [
              `${particle.y}%`,
              `${(particle.y + Math.sin(particle.direction) * 10) % 100}%`,
              `${(particle.y + Math.sin(particle.direction) * 20) % 100}%`
            ],
            opacity: [0, 0.8, 0.4, 0.8, 0],
            scale: [0, 1, 0.8, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        >
          <ParticleShape particle={particle} />
        </motion.div>
      ))}
      
      {/* Connection lines between nearby particles */}
      <svg className="absolute inset-0 w-full h-full">
        {particles.slice(0, 8).map((particle, index) => {
          const nextParticle = particles[(index + 1) % 8];
          return (
            <motion.line
              key={`connection-${index}`}
              x1={`${particle.x}%`}
              y1={`${particle.y}%`}
              x2={`${nextParticle.x}%`}
              y2={`${nextParticle.y}%`}
              stroke="rgba(59, 130, 246, 0.1)"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};