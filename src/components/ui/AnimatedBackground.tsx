import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  intensity = 'medium',
  className = ""
}) => {
  const getIntensityValues = () => {
    switch (intensity) {
      case 'low':
        return {
          particleCount: 8,
          orbSize: { sm: 'w-64 h-64', lg: 'w-80 h-80' },
          opacity: { base: 0.2, particles: 0.3 }
        };
      case 'high':
        return {
          particleCount: 20,
          orbSize: { sm: 'w-80 h-80', lg: 'w-96 h-96' },
          opacity: { base: 0.4, particles: 0.6 }
        };
      default: // medium
        return {
          particleCount: 15,
          orbSize: { sm: 'w-72 h-72', lg: 'w-96 h-96' },
          opacity: { base: 0.3, particles: 0.4 }
        };
    }
  };

  const config = getIntensityValues();

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Animated gradient orbs */}
      <motion.div 
        className={`absolute top-20 left-20 ${config.orbSize.sm} bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl`}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [config.opacity.base, config.opacity.base * 2, config.opacity.base],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className={`absolute bottom-40 right-20 ${config.orbSize.lg} bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl`}
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [config.opacity.base * 0.7, config.opacity.base * 1.7, config.opacity.base * 0.7],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Interactive floating particles */}
      {Array.from({ length: config.particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -200, 0],
            opacity: [0, config.opacity.particles, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};