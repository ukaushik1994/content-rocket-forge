
import React from 'react';
import { motion } from 'framer-motion';

export const LoadingParticle: React.FC = () => {
  return (
    <motion.div
      className="absolute h-2 w-2 rounded-full bg-primary/60 shadow-glow"
      initial={{
        x: Math.random() * 100 - 50 + "%",
        y: Math.random() * 100 - 50 + "%",
        opacity: 0.4 + Math.random() * 0.6,
        scale: 0.4 + Math.random() * 0.6
      }}
      animate={{
        x: [
          Math.random() * 100 - 50 + "%",
          Math.random() * 100 - 50 + "%",
          Math.random() * 100 - 50 + "%"
        ],
        y: [
          Math.random() * 100 - 50 + "%",
          Math.random() * 100 - 50 + "%",
          Math.random() * 100 - 50 + "%"
        ],
        opacity: [0.4 + Math.random() * 0.6, 0.1, 0.6],
        scale: [0.4 + Math.random() * 0.6, 0.8, 0.3]
      }}
      transition={{
        duration: 8 + Math.random() * 20,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />
  );
};

export const LoadingParticles: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <LoadingParticle key={index} />
      ))}
    </>
  );
};
