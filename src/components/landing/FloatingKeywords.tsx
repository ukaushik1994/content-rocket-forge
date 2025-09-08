import React from 'react';
import { motion } from 'framer-motion';

const keywords = [
  'ROI',
  'Content Creation',
  'Content Strategy',
  'Content Repurposing',
  'SERP Analysis',
  'AI Writing',
  'Multi-Platform',
  'Analytics',
  'Performance Tracking',
  'Engagement',
  'Conversion',
  'SEO Optimization',
  'Brand Voice',
  'Content Calendar',
  'Social Media',
  'Blog Posts',
  'Email Marketing',
  'Lead Generation'
];

export const FloatingKeywords = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {keywords.map((keyword, index) => {
        // Generate random positioning for each keyword
        const randomTop = 5 + Math.random() * 85; // 5% to 90%
        const randomHorizontal = 5 + Math.random() * 85; // 5% to 90%
        const useLeft = Math.random() > 0.5; // Randomly choose left or right positioning
        
        const position = {
          top: `${randomTop}%`,
          [useLeft ? 'left' : 'right']: `${randomHorizontal}%`,
        };

        // Varied sizes and opacities
        const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
        const size = sizes[index % sizes.length];
        
        // Random animation properties
        const animationDelay = Math.random() * 6; // 0 to 6 seconds delay
        const animationDuration = 8 + Math.random() * 4; // 8 to 12 seconds
        const floatDistance = 5 + Math.random() * 15; // 5 to 20px float distance
        const opacity = 0.1 + Math.random() * 0.2; // 0.1 to 0.3 opacity range

        return (
          <motion.div
            key={`${keyword}-${index}`}
            className={`absolute ${size} font-medium select-none`}
            style={{
              ...position,
              zIndex: -1,
            }}
            initial={{ 
              opacity: 0,
              y: floatDistance
            }}
            animate={{
              opacity: [0, opacity, opacity * 1.5, opacity, 0],
              y: [floatDistance, -floatDistance, floatDistance],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              delay: animationDelay,
              ease: "easeInOut"
            }}
          >
            <span 
              className={`
                text-white
                ${index % 4 === 0 ? 'blur-[1px]' : ''}
              `}
              style={{ opacity }}
            >
              {keyword}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};