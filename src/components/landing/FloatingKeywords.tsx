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

// Helper function to generate safe positions that avoid main content
const generateSafePosition = () => {
  // Define exclusion zones (content areas to avoid)
  const exclusionZones = [
    // Desktop left content area (headline, CTA, trust indicators)
    { top: 20, bottom: 80, left: 0, right: 50 },
    // Desktop right content area (GlassCard)
    { top: 10, bottom: 90, left: 50, right: 100 },
    // Mobile stats area (bottom section)
    { top: 80, bottom: 100, left: 0, right: 100 }
  ];

  // Define safe zones
  const safeZones = [
    // Top margin
    { top: 0, bottom: 15, left: 0, right: 100 },
    // Bottom margin
    { top: 85, bottom: 100, left: 0, right: 100 },
    // Left side margin
    { top: 15, bottom: 85, left: 0, right: 8 },
    // Right side margin
    { top: 15, bottom: 85, left: 92, right: 100 },
    // Center gaps (between content blocks)
    { top: 15, bottom: 20, left: 8, right: 92 },
    { top: 80, bottom: 85, left: 8, right: 92 }
  ];

  // Try to find a position in safe zones first
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Choose a random safe zone
    const safeZone = safeZones[Math.floor(Math.random() * safeZones.length)];
    
    const top = safeZone.top + Math.random() * (safeZone.bottom - safeZone.top);
    const horizontal = safeZone.left + Math.random() * (safeZone.right - safeZone.left);
    const useLeft = Math.random() > 0.5;
    
    return {
      top: `${top}%`,
      [useLeft ? 'left' : 'right']: `${horizontal}%`,
    };
  }
  
  // Fallback: random position with some margin
  return {
    top: `${5 + Math.random() * 10}%`, // Top 15% only as fallback
    left: `${5 + Math.random() * 10}%`, // Left 15% only as fallback
  };
};

export const FloatingKeywords = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {keywords.map((keyword, index) => {
        // Generate safe positioning for each keyword
        const position = generateSafePosition();

        // Varied sizes and opacities
        const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
        const size = sizes[index % sizes.length];
        
        // Random animation properties
        const animationDelay = Math.random() * 6; // 0 to 6 seconds delay
        const animationDuration = 8 + Math.random() * 4; // 8 to 12 seconds
        const floatDistance = 5 + Math.random() * 15; // 5 to 20px float distance
        const opacity = 0.4 + Math.random() * 0.3; // 0.4 to 0.7 opacity range for better visibility

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