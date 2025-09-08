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
        // Create varied positioning
        const positions = [
          { top: '10%', left: '5%' },
          { top: '15%', right: '8%' },
          { top: '25%', left: '12%' },
          { top: '35%', right: '15%' },
          { top: '45%', left: '8%' },
          { top: '55%', right: '20%' },
          { top: '65%', left: '15%' },
          { top: '75%', right: '10%' },
          { top: '20%', left: '75%' },
          { top: '40%', left: '80%' },
          { top: '60%', left: '85%' },
          { top: '80%', left: '70%' },
          { top: '30%', left: '25%' },
          { top: '50%', left: '30%' },
          { top: '70%', left: '35%' },
          { top: '85%', left: '25%' },
          { top: '5%', left: '60%' },
          { top: '90%', left: '60%' }
        ];

        const position = positions[index % positions.length];

        // Varied sizes and opacities
        const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
        const size = sizes[index % sizes.length];
        
        // Different animation delays and durations
        const animationDelay = (index * 0.8) % 6;
        const animationDuration = 8 + (index % 4);
        const floatDistance = 10 + (index % 10);

        return (
          <motion.div
            key={keyword}
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
              opacity: [0, 0.15, 0.4, 0.15, 0],
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
                ${index % 3 === 0 ? 'text-primary/30' : 
                  index % 3 === 1 ? 'bg-gradient-to-r from-neon-blue/30 to-neon-pink/30 bg-clip-text text-transparent' : 
                  'text-muted-foreground/20'}
                ${index % 4 === 0 ? 'blur-[1px]' : ''}
              `}
            >
              {keyword}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};