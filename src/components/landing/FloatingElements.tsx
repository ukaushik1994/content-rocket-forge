import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElement {
  icon: React.ReactNode;
  position: { top: string; left?: string; right?: string };
  delay: number;
  duration: number;
}

interface FloatingElementsProps {
  elements: FloatingElement[];
  className?: string;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ 
  elements,
  className = '' 
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ 
            top: element.position.top, 
            left: element.position.left,
            right: element.position.right
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-primary/40">
            {element.icon}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
