import React from 'react';
import { motion } from 'framer-motion';

export const FuturisticGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Horizontal lines */}
        {[20, 40, 60, 80].map((y, index) => (
          <motion.line
            key={`h-${index}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="url(#gridGradient)"
            strokeWidth="0.1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: index * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Vertical lines */}
        {[15, 35, 65, 85].map((x, index) => (
          <motion.line
            key={`v-${index}`}
            x1={x}
            y1="0"
            x2={x}
            y2="100"
            stroke="url(#gridGradient)"
            strokeWidth="0.1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 2 + index * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="50%" stopColor="rgba(59,130,246,1)" />
            <stop offset="100%" stopColor="rgba(147,51,234,0)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Corner accent lines */}
      <div className="absolute top-0 left-0 w-32 h-32">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400/50 to-transparent" />
        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-blue-400/50 to-transparent" />
      </div>
      
      <div className="absolute top-0 right-0 w-32 h-32">
        <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-purple-400/50 to-transparent" />
        <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-purple-400/50 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 w-32 h-32">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-t from-cyan-400/50 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-emerald-400/50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-t from-emerald-400/50 to-transparent" />
      </div>
    </div>
  );
};