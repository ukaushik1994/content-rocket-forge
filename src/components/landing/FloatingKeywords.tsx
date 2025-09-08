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
    <div className="absolute inset-0 overflow-hidden pointer-events-none lg:block hidden">
      {keywords.map((keyword, index) => {
        // Right-side only positioning (50%+ from left, avoiding GlassCard area)
        const positions = [
          { top: '5%', left: '52%' },
          { top: '8%', left: '75%' },
          { top: '12%', left: '68%' },
          { top: '15%', left: '85%' },
          { top: '18%', left: '92%' },
          { top: '82%', left: '55%' },
          { top: '85%', left: '72%' },
          { top: '88%', left: '65%' },
          { top: '90%', left: '82%' },
          { top: '92%', left: '95%' },
          { top: '25%', left: '92%' },
          { top: '35%', left: '95%' },
          { top: '45%', left: '92%' },
          { top: '55%', left: '95%' },
          { top: '65%', left: '92%' },
          { top: '75%', left: '95%' },
          { top: '10%', left: '88%' },
          { top: '95%', left: '88%' }
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