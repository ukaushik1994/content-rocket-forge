
import React from 'react';
import { motion } from 'framer-motion';

export const Particles: React.FC<{ type: 'cosmic' | 'content' | 'data' | 'ai' | 'sparkles' }> = ({ type }) => {
  const getParticleConfig = () => {
    switch (type) {
      case 'cosmic':
        return { count: 15, colors: ['#9b87f5', '#33c3f0', '#d946ef'], size: [1, 3] };
      case 'content':
        return { count: 12, colors: ['#10b981', '#f59e0b', '#ef4444'], size: [2, 4] };
      case 'data':
        return { count: 10, colors: ['#06b6d4', '#8b5cf6', '#ec4899'], size: [1, 2] };
      case 'ai':
        return { count: 18, colors: ['#f472b6', '#a855f7', '#6366f1'], size: [2, 5] };
      case 'sparkles':
      default:
        return { count: 8, colors: ['#9b87f5'], size: [1, 2] };
    }
  };

  const config = getParticleConfig();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(config.count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-60"
          style={{
            backgroundColor: config.colors[i % config.colors.length],
            width: Math.random() * (config.size[1] - config.size[0]) + config.size[0],
            height: Math.random() * (config.size[1] - config.size[0]) + config.size[0],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 60 - 30],
            y: [0, Math.random() * 60 - 30],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
};
