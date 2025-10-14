import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';

export const LearningEngineVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="space-y-6"
    >
      {/* AI Learning Active Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, ease: "easeInOut" }}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-neon-blue/20 border border-primary/30 w-fit mx-auto shadow-md"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain className="h-4 w-4 text-primary" />
        </motion.div>
        <span className="text-xs font-medium text-primary">AI Learning Active</span>
      </motion.div>

      {/* Central Brain Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.5, ease: "easeInOut" }}
        className="flex justify-center"
      >
        <div className="relative">
          {/* Glow rings */}
          <motion.div
            className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-neon-blue mx-auto flex items-center justify-center shadow-2xl shadow-primary/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Brain className="h-10 w-10 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, value: '67%', target: '85%', label: 'Performance' },
          { icon: Target, value: '12.4K', target: '18.2K', label: 'Engagement' },
          { icon: Zap, value: '8.2K', target: '12.8K', label: 'Quality' }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: "easeInOut" }}
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-xl"
          >
            <metric.icon className="h-5 w-5 text-primary mb-2" />
            <motion.div 
              className="text-2xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              {metric.value}
            </motion.div>
            <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
            <motion.div
              className="text-xs text-primary font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              → {metric.target}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Learning Progress Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 space-y-3 shadow-xl"
      >
        <div className="text-sm font-medium text-foreground mb-3">Learning Progress</div>
        
        {[
          { label: 'Data Analysis', progress: 75, color: 'primary' },
          { label: 'Pattern Recognition', progress: 60, color: 'neon-blue' },
          { label: 'Strategy Optimization', progress: 85, color: 'primary' }
        ].map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{item.label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 + index * 0.15 }}
                className="text-primary font-medium"
              >
                {item.progress}%
              </motion.span>
            </div>
            <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 1.3, delay: 1.0 + index * 0.15, ease: "easeInOut" }}
              />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
