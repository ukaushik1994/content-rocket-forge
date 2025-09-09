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

// Generate randomized positions with collision detection and full corner coverage
const generateRandomPositions = (count: number) => {
  const positions: { top: string; left: string }[] = [];
  const minDistance = 8; // Minimum distance between elements (in percentage)
  
  // Define the 8 zones for better distribution with 1-inch spacing from center
  const zones = [
    // 4 Corner zones (expanded exclusion: 20-80%)
    { name: 'top-left', leftRange: [0, 20], topRange: [0, 20] },
    { name: 'top-right', leftRange: [80, 100], topRange: [0, 20] },
    { name: 'bottom-left', leftRange: [0, 20], topRange: [80, 100] },
    { name: 'bottom-right', leftRange: [80, 100], topRange: [80, 100] },
    // 4 Edge zones (avoiding center content area: 20-80% both axes)
    { name: 'top-edge', leftRange: [20, 80], topRange: [0, 20] },
    { name: 'bottom-edge', leftRange: [20, 80], topRange: [80, 100] },
    { name: 'left-edge', leftRange: [0, 20], topRange: [20, 80] },
    { name: 'right-edge', leftRange: [80, 100], topRange: [20, 80] }
  ];
  
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let position;
    
    do {
      // Select a random zone with equal probability
      const selectedZone = zones[Math.floor(Math.random() * zones.length)];
      
      // Generate position within the selected zone
      const leftMin = selectedZone.leftRange[0];
      const leftMax = selectedZone.leftRange[1];
      const topMin = selectedZone.topRange[0];
      const topMax = selectedZone.topRange[1];
      
      const left = leftMin + Math.random() * (leftMax - leftMin);
      const top = topMin + Math.random() * (topMax - topMin);
      
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

        // Multi-word detection for dynamic sizing
        const wordCount = keyword.split(' ').length;
        const isMultiWord = wordCount > 1;
        
        // Size arrays based on word count to prevent wrapping
        const singleWordSizes = ['text-sm', 'text-base', 'text-lg'];
        const multiWordSizes = ['text-xs', 'text-sm', 'text-base']; // Smaller for multi-word
        const size = isMultiWord 
          ? multiWordSizes[index % multiWordSizes.length]
          : singleWordSizes[index % singleWordSizes.length];
        
        // Limited to 2 fonts only (as requested)
        const fonts = ['font-space', 'font-playfair'];
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
            className={`absolute ${size} ${font} font-medium select-none whitespace-nowrap`}
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