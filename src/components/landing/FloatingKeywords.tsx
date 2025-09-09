import React from 'react';
import { motion } from 'framer-motion';

const keywords = [
  'ROI',
  'Creation',
  'Strategy',
  'Repurposing',
  'SERP Analysis',
  'AI Writing',
  'Multi-Platform',
  'Analytics',
  'Tracking',
  'Engagement',
  'Conversion',
  'SEO',
  'Brand Voice',
  'Calendar',
  'Social Media',
  'Blog Posts',
  'Email',
  'Leads'
];

// Generate randomized positions with collision detection
const generateRandomPositions = (count: number) => {
  const positions: { top: string; left: string }[] = [];
  const minDistance = 8; // Minimum distance between elements (in percentage)
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let position;
    
    do {
      // Generate position across full screen, avoiding center area (20-80% left, 35-65% top)
      let left, top;
      
      // Randomly choose left or right side, or top/bottom areas
      const zone = Math.random();
      
      if (zone < 0.3) {
        // Left side
        left = 5 + Math.random() * 15; // 5% to 20%
        top = 5 + Math.random() * 90;  // 5% to 95%
      } else if (zone < 0.6) {
        // Right side  
        left = 80 + Math.random() * 15; // 80% to 95%
        top = 5 + Math.random() * 90;   // 5% to 95%
      } else if (zone < 0.8) {
        // Top area
        left = 20 + Math.random() * 60; // 20% to 80%
        top = 5 + Math.random() * 25;   // 5% to 30%
      } else {
        // Bottom area
        left = 20 + Math.random() * 60; // 20% to 80%
        top = 70 + Math.random() * 25;  // 70% to 95%
      }
      
      position = { 
        top: `${top}%`, 
        left: `${left}%` 
      };
      attempts++;
    } while (
      attempts < 50 && // Prevent infinite loops
      positions.some(pos => {
        const existingLeft = parseFloat(pos.left);
        const existingTop = parseFloat(pos.top);
        const newLeft = parseFloat(position.left);
        const newTop = parseFloat(position.top);
        
        // Check if too close to existing position
        const distance = Math.sqrt(
          Math.pow(existingLeft - newLeft, 2) + 
          Math.pow(existingTop - newTop, 2)
        );
        return distance < minDistance;
      })
    );
    
    positions.push(position);
  }
  return positions;
};

export const FloatingKeywords = () => {
  const positions = React.useMemo(() => generateRandomPositions(keywords.length), []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none lg:block hidden">
      {keywords.map((keyword, index) => {
        const position = positions[index];

        // Consistent sizing with only 3 variations
        const sizes = ['text-sm', 'text-base', 'text-lg'];
        const size = sizes[index % sizes.length];
        
        // Random font families
        const fonts = ['font-inter', 'font-playfair', 'font-space', 'font-mono', 'font-crimson'];
        const font = fonts[index % fonts.length];
        
        // Opacity variations for white text
        const opacities = ['text-white/10', 'text-white/20', 'text-white/30'];
        const opacity = opacities[index % opacities.length];
        
        // Longer, simpler animation - just fade in/out
        const animationDelay = (index * 1.2) % 8;
        const animationDuration = 12 + (index % 4); // 12-15 seconds

        return (
          <motion.div
            key={keyword}
            className={`absolute ${size} ${font} font-medium select-none`}
            style={{
              ...position,
              zIndex: -1,
            }}
            initial={{ 
              opacity: 0
            }}
            animate={{
              opacity: [0, 0.1, 0.3, 0.1, 0],
            }}
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              delay: animationDelay,
              ease: "easeInOut"
            }}
          >
            <span className={opacity}>
              {keyword}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};