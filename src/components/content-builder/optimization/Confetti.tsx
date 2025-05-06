
import React from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  show: boolean;
}

export const Confetti = ({ show }: ConfettiProps) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none flex justify-center">
      <div className="w-full h-full max-w-5xl">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
              top: `${Math.random() * -20}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: ['0vh', '100vh'],
              x: [`${Math.random() * 10 - 5}px`, `${Math.random() * 100 - 50}px`]
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              ease: "easeOut",
              delay: Math.random() * 0.5
            }}
          />
        ))}
      </div>
    </div>
  );
};
