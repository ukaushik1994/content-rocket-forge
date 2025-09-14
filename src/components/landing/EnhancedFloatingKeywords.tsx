import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const keywords = [
  // AI & Technology
  'AI Content', 'Machine Learning', 'Neural Networks', 'Deep Learning', 'GPT Models', 'Natural Language',
  // Content Strategy
  'SEO Optimization', 'Keyword Research', 'Content Strategy', 'SERP Analysis', 'Competitor Research',
  // Marketing & Business
  'Growth Hacking', 'Conversion Rate', 'Brand Voice', 'Audience Targeting', 'Performance Metrics',
  // Creative Process
  'Creative Writing', 'Storytelling', 'Visual Content', 'Engagement', 'Viral Content', 'Content Calendar',
  // Analytics & Data
  'Data Analytics', 'Trend Analysis', 'Market Research', 'User Behavior', 'ROI Tracking'
];

interface KeywordPosition {
  top: string;
  left: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  glow: 'blue' | 'purple' | 'cyan' | 'emerald' | 'pink';
  delay: number;
}

const generateEnhancedPositions = (count: number): KeywordPosition[] => {
  const positions: KeywordPosition[] = [];
  const sizes = ['sm', 'md', 'lg', 'xl'] as const;
  const glows = ['blue', 'purple', 'cyan', 'emerald', 'pink'] as const;
  
  // Distribute across different zones with more strategic placement
  const zones = [
    { top: [5, 25], left: [2, 18] },    // Top left
    { top: [5, 25], left: [82, 98] },   // Top right
    { top: [30, 50], left: [0, 15] },   // Mid left
    { top: [30, 50], left: [85, 100] }, // Mid right
    { top: [55, 75], left: [2, 18] },   // Bottom left
    { top: [55, 75], left: [82, 98] },  // Bottom right
    { top: [15, 35], left: [20, 35] },  // Left center
    { top: [15, 35], left: [65, 80] },  // Right center
  ];

  for (let i = 0; i < count; i++) {
    const zone = zones[i % zones.length];
    const minDistance = 80; // Minimum distance between keywords
    let attempts = 0;
    let newPos: { top: string; left: string };
    
    do {
      const topRange = zone.top[1] - zone.top[0];
      const leftRange = zone.left[1] - zone.left[0];
      
      newPos = {
        top: `${zone.top[0] + Math.random() * topRange}%`,
        left: `${zone.left[0] + Math.random() * leftRange}%`
      };
      attempts++;
    } while (attempts < 10 && positions.some(pos => {
      const topDiff = Math.abs(parseFloat(newPos.top) - parseFloat(pos.top));
      const leftDiff = Math.abs(parseFloat(newPos.left) - parseFloat(pos.left));
      return Math.sqrt(topDiff * topDiff + leftDiff * leftDiff) < minDistance;
    }));

    positions.push({
      ...newPos,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      glow: glows[Math.floor(Math.random() * glows.length)],
      delay: Math.random() * 3
    });
  }

  return positions;
};

const getSizeClasses = (size: string) => {
  switch (size) {
    case 'xl': return 'text-xl font-bold';
    case 'lg': return 'text-lg font-semibold';
    case 'md': return 'text-base font-medium';
    default: return 'text-sm font-normal';
  }
};

const getGlowClasses = (glow: string) => {
  switch (glow) {
    case 'blue': return 'text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-400/30';
    case 'purple': return 'text-purple-300 shadow-[0_0_20px_rgba(147,51,234,0.5)] border-purple-400/30';
    case 'cyan': return 'text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] border-cyan-400/30';
    case 'emerald': return 'text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-emerald-400/30';
    case 'pink': return 'text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.5)] border-pink-400/30';
    default: return 'text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-blue-400/30';
  }
};

export const EnhancedFloatingKeywords = () => {
  const keywordPositions = useMemo(() => generateEnhancedPositions(24), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {keywords.slice(0, 24).map((keyword, index) => {
        const position = keywordPositions[index];
        
        return (
          <motion.div
            key={`keyword-${index}`}
            className={`absolute backdrop-blur-sm bg-black/20 border rounded-full px-3 py-1.5 
              ${getSizeClasses(position.size)} ${getGlowClasses(position.glow)} 
              font-['Space_Grotesk'] tracking-wide whitespace-nowrap select-none`}
            style={{
              top: position.top,
              left: position.left,
            }}
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              y: 20
            }}
            animate={{ 
              opacity: [0, 0.8, 0.9, 0.6, 0.8],
              scale: [0.8, 1, 1.05, 1, 1.02],
              y: [20, 0, -5, 0, -2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: position.delay,
            }}
            whileHover={{
              scale: 1.1,
              opacity: 1,
              transition: { duration: 0.2 }
            }}
          >
            {keyword}
          </motion.div>
        );
      })}
      
      {/* Additional floating particles for ambiance */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};