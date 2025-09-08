import React from 'react';
import { motion } from 'framer-motion';

const keywords = [
  { text: "ROI", size: "text-2xl", delay: 0 },
  { text: "Content Creation", size: "text-lg", delay: 0.5 },
  { text: "Content Strategy", size: "text-xl", delay: 1 },
  { text: "SERP Analysis", size: "text-md", delay: 1.5 },
  { text: "Content Repurposing", size: "text-lg", delay: 2 },
  { text: "AI Writing", size: "text-xl", delay: 2.5 },
  { text: "Multi-Platform", size: "text-md", delay: 3 },
  { text: "Analytics", size: "text-lg", delay: 3.5 },
  { text: "Performance Tracking", size: "text-md", delay: 4 },
  { text: "SEO Optimization", size: "text-xl", delay: 4.5 },
];

export const FloatingKeywords = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {keywords.map((keyword, index) => (
        <motion.div
          key={index}
          className={`absolute ${keyword.size} font-medium text-muted-foreground/20 select-none whitespace-nowrap`}
          initial={{ 
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{ 
            opacity: [0, 0.6, 0],
            y: [null, -50, -100],
            x: [null, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            delay: keyword.delay,
            repeat: Infinity,
            repeatDelay: 2 + Math.random() * 3,
            ease: "easeInOut"
          }}
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
        >
          {keyword.text}
        </motion.div>
      ))}
    </div>
  );
};