
import React from 'react';
import { motion } from 'framer-motion';

interface LoadingParticleProps {
  delay: number;
  top: string;
  left: string;
}

export const LoadingParticle: React.FC<LoadingParticleProps> = ({ delay, top, left }) => {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
      style={{ top, left }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0]
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatType: "loop"
      }}
    />
  );
};
