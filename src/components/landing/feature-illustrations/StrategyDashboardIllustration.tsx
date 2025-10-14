import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MessageSquare, Sparkles, MousePointer2 } from 'lucide-react';

export const StrategyDashboardIllustration = () => {
  const barData = [
    { height: 60, delay: 0, label: 'Mon' },
    { height: 75, delay: 0.2, label: 'Tue' },
    { height: 55, delay: 0.4, label: 'Wed' },
    { height: 85, delay: 0.6, label: 'Thu' },
    { height: 70, delay: 0.8, label: 'Fri' }
  ];

  const pieSegments = [
    { percent: 35, color: 'hsl(var(--primary))', delay: 0 },
    { percent: 25, color: 'hsl(var(--neon-blue))', delay: 0.3 },
    { percent: 25, color: 'hsl(var(--neon-pink))', delay: 0.6 },
    { percent: 15, color: 'hsl(var(--neon-orange))', delay: 0.9 }
  ];

  const sparklePositions = [
    { x: 20, y: 15, delay: 0 },
    { x: 80, y: 25, delay: 0.5 },
    { x: 50, y: 70, delay: 1 },
    { x: 30, y: 85, delay: 1.5 }
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Interactive Bar Chart */}
        <motion.div
          className="bg-card/60 backdrop-blur-sm border border-primary/30 rounded-xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="text-sm font-semibold">Performance Growth</h4>
          </div>
          
          <div className="flex items-end justify-between gap-3 h-32">
            {barData.map((bar, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full bg-gradient-to-t from-primary to-neon-blue rounded-t-lg"
                  initial={{ height: 0 }}
                  animate={{ height: `${bar.height}%` }}
                  transition={{ 
                    duration: 1, 
                    delay: bar.delay,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeOut" 
                  }}
                />
                <span className="text-xs text-muted-foreground">{bar.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pie Chart with Segments */}
        <motion.div
          className="bg-card/60 backdrop-blur-sm border border-neon-blue/30 rounded-xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-neon-blue" />
            <h4 className="text-sm font-semibold">Content Distribution</h4>
          </div>
          
          <div className="relative w-32 h-32 mx-auto">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {pieSegments.map((segment, index) => {
                const previousPercent = pieSegments
                  .slice(0, index)
                  .reduce((sum, s) => sum + s.percent, 0);
                const circumference = 2 * Math.PI * 40;
                const offset = circumference - (segment.percent / 100) * circumference;
                const rotation = (previousPercent / 100) * 360;

                return (
                  <motion.circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="20"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ 
                      transformOrigin: 'center',
                      transform: `rotate(${rotation}deg)`
                    }}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ 
                      duration: 1.5, 
                      delay: segment.delay,
                      repeat: Infinity,
                      repeatDelay: 4,
                      ease: "easeInOut" 
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </motion.div>

        {/* AI Insights Speech Bubble */}
        <motion.div
          className="bg-gradient-to-r from-neon-pink/20 to-neon-blue/20 backdrop-blur-sm border border-neon-pink/30 rounded-xl p-4 shadow-xl relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-r from-neon-pink to-neon-blue p-2 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1">AI Insight</p>
              <p className="text-xs text-muted-foreground">
                Your engagement peaks on Thursdays. Schedule key content then for +85% reach.
              </p>
            </div>
          </div>
          
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-neon-pink/20 border-l border-b border-neon-pink/30 transform rotate-45" />
        </motion.div>

      </div>

      {/* Animated Cursor */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{ 
          x: [0, 100, 100, 0, 0],
          y: [0, 0, 150, 150, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        style={{ left: '10%', top: '10%' }}
      >
        <MousePointer2 className="h-6 w-6 text-primary drop-shadow-lg" />
      </motion.div>

      {/* Floating Sparkles */}
      {sparklePositions.map((pos, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          animate={{ 
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            delay: pos.delay,
            ease: "easeInOut" 
          }}
        >
          <Sparkles className="h-4 w-4 text-neon-pink" />
        </motion.div>
      ))}
    </div>
  );
};
