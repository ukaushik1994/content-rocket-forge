import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp } from 'lucide-react';

export const SmartContentVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.0, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="space-y-6"
    >
      {/* AI Learning Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ease: "easeInOut" }}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 w-fit mx-auto shadow-md shadow-primary/20"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]"
        >
          <Brain className="h-4 w-4 text-primary" />
        </motion.div>
        <span className="text-xs font-medium text-primary">Getting Smarter</span>
      </motion.div>

      {/* Progressive Improvement Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
        className="h-48 bg-gradient-to-r from-background/50 to-background/20 rounded-lg border border-border/30 p-6 relative overflow-hidden shadow-lg"
      >
        {/* Chart bars */}
        <div className="flex items-end justify-around h-full gap-2 relative z-10">
          {[
            { height: 45, label: 'Week 1', color: 'from-primary/40 to-primary/60' },
            { height: 52, label: 'Week 2', color: 'from-primary/40 to-primary/60' },
            { height: 58, label: 'Week 3', color: 'from-primary/50 to-primary/70' },
            { height: 65, label: 'Week 4', color: 'from-primary/50 to-primary/70' },
            { height: 72, label: 'Week 5', color: 'from-neon-blue/40 to-neon-blue/60' },
            { height: 80, label: 'Week 6', color: 'from-neon-blue/50 to-neon-blue/70' },
            { height: 88, label: 'Week 7', color: 'from-neon-blue/60 to-neon-blue/80' },
            { height: 95, label: 'Week 8', color: 'from-neon-blue/70 to-neon-blue/90' }
          ].map((bar, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${bar.height}%` }}
                transition={{ duration: 1.5, delay: 0.8 + index * 0.15, ease: "easeInOut" }}
                className={`w-full rounded-t bg-gradient-to-t ${bar.color} relative shadow-lg`}
              >
                {/* Value label */}
                {index === 7 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: -20 }}
                    transition={{ delay: 2.2, ease: "easeInOut" }}
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-neon-blue whitespace-nowrap drop-shadow-[0_0_10px_rgba(var(--neon-blue),0.6)]"
                  >
                    95%
                  </motion.div>
                )}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Trend line overlay */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <motion.path
            d="M 5 55 Q 25 48, 35 42 T 50 35 T 65 28 T 80 20 T 95 5"
            stroke="url(#trendGradient)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, delay: 1.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--neon-blue))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Trend arrow */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-blue/20 border border-neon-blue/30"
        >
          <TrendingUp className="h-4 w-4 text-neon-blue" />
          <span className="text-xs font-medium text-neon-blue">+111%</span>
        </motion.div>
      </motion.div>

      {/* Improvement Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
        className="bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-pink/10 rounded-lg border border-primary/30 p-4 space-y-3"
      >
        <div className="text-xs font-medium text-muted-foreground mb-2">AI Improvements</div>
        {[
          { label: 'Headline Optimization', progress: 85, color: 'bg-primary' },
          { label: 'Audience Targeting', progress: 72, color: 'bg-neon-blue' },
          { label: 'Content Structure', progress: 68, color: 'bg-neon-pink' }
        ].map((insight, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{insight.label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 + index * 0.2 }}
                className="text-primary font-medium"
              >
                {insight.progress}%
              </motion.span>
            </div>
            <div className="h-2 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${insight.color}/60 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${insight.progress}%` }}
                transition={{ duration: 1.5, delay: 2 + index * 0.2 }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
