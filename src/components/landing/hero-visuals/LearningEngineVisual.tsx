import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Target, RefreshCw } from 'lucide-react';

export const LearningEngineVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="space-y-6"
    >
      {/* AI Learning Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: "easeInOut" }}
        className="flex items-center justify-between"
      >
        <div className="h-10 w-48 bg-gradient-to-r from-primary/30 to-neon-blue/30 rounded-lg overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-neon-blue shadow-[0_0_10px_rgba(var(--primary),0.3)]"
            initial={{ width: "0%" }}
            animate={{ width: "75%" }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 shadow-md shadow-primary/20">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]"
          >
            <Brain className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-primary">AI Learning</span>
        </div>
      </motion.div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, value: '67%', target: '85%', label: 'Performance', delay: 0.3 },
          { icon: Target, value: '12.4K', target: '18.2K', label: 'Engagement', delay: 0.4 },
          { icon: Brain, value: '8.2K', target: '12.8K', label: 'Quality', delay: 0.5 }
        ].map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: "easeInOut" }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/30 p-6 shadow-md min-h-[140px]"
          >
            <metric.icon className="h-6 w-6 text-primary mb-2" />
            <motion.div 
              className="text-3xl md:text-4xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: "easeInOut" }}
            >
              {metric.value}
            </motion.div>
            <div className="text-sm text-muted-foreground mb-1">{metric.label}</div>
            <motion.div
              className="text-sm text-neon-blue font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, ease: "easeInOut" }}
            >
              → {metric.target}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Feedback Loop Visualization */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5, ease: "easeInOut" }}
        className="bg-gradient-to-r from-background/50 to-background/20 rounded-lg border border-border/30 p-8 relative overflow-hidden shadow-lg min-h-[120px]"
      >
        <div className="flex items-center justify-between relative z-10">
          {['Input', 'AI', 'Output', 'Learn'].map((label, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.15, type: "spring", stiffness: 150, damping: 12 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    '0 0 0px rgba(var(--primary), 0)',
                    '0 0 20px rgba(var(--primary), 0.5)',
                    '0 0 0px rgba(var(--primary), 0)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.4, ease: "easeInOut" }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center shadow-lg"
              >
                <span className="text-sm font-bold text-white">{label}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Connecting arrows */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {[0, 1, 2].map((index) => (
            <motion.path
              key={index}
              d={`M ${25 + index * 25}% 50% L ${50 + index * 25}% 50%`}
              stroke="url(#flowGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1, delay: 0.9 + index * 0.2, ease: "easeInOut" }}
            />
          ))}
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--neon-blue))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Flowing particles */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_6px_rgba(var(--primary),0.6)]"
            style={{ left: `${25 + index * 25}%` }}
            animate={{
              x: ['0%', '100%'],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.2 + index * 0.4,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>

      {/* Continuous Learning Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.4, ease: "easeInOut" }}
        className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-pink/10 border border-primary/30 shadow-md shadow-primary/20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="drop-shadow-[0_0_6px_rgba(var(--primary),0.4)]"
        >
          <RefreshCw className="h-6 w-6 text-primary" />
        </motion.div>
        <span className="text-base font-medium text-foreground">Continuous Learning Active</span>
      </motion.div>
    </motion.div>
  );
};
