import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Sparkles, TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export const LearningEngineVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Central Brain - Pulsing */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <Brain className="w-16 h-16 text-primary relative z-10" strokeWidth={1.5} />
        </motion.div>
      </div>

      <h3 className="text-lg font-semibold text-center mb-8">AI Learning Engine</h3>

      {/* Before/After Visual Comparison */}
      <div className="grid grid-cols-3 gap-4 mb-8 items-center">
        {/* Before - Dim */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6 text-center opacity-40">
            <Lightbulb className="w-12 h-12 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground">Before</p>
          </GlassCard>
        </motion.div>

        {/* Animated Arrow */}
        <div className="flex justify-center">
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex gap-1"
          >
            <div className="w-2 h-0.5 bg-primary/40 rounded-full" />
            <div className="w-2 h-0.5 bg-primary/60 rounded-full" />
            <div className="w-2 h-0.5 bg-primary rounded-full" />
          </motion.div>
        </div>

        {/* After - Bright */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 text-center border-primary/50 relative">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-xl" />
            <Sparkles className="w-12 h-12 mx-auto mb-2 text-primary relative z-10" strokeWidth={1.5} />
            <p className="text-xs text-primary relative z-10">After</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Learning Cycle Flow */}
      <GlassCard className="p-6">
        <div className="grid grid-cols-4 gap-4 relative">
          {/* Connecting line */}
          <svg className="absolute top-8 left-0 w-full h-0.5 -z-10" style={{ height: '2px' }}>
            <motion.line
              x1="10%"
              y1="0"
              x2="90%"
              y2="0"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="text-primary/20"
              animate={{ strokeDashoffset: [0, -8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Step 1: Create */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </motion.div>
            <p className="text-xs text-muted-foreground">Create</p>
          </motion.div>

          {/* Step 2: Analyze */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <BarChart3 className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </motion.div>
            <p className="text-xs text-muted-foreground">Analyze</p>
          </motion.div>

          {/* Step 3: Learn */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Brain className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </motion.div>
            <p className="text-xs text-muted-foreground">Learn</p>
          </motion.div>

          {/* Step 4: Optimize */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Target className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </motion.div>
            <p className="text-xs text-muted-foreground">Optimize</p>
          </motion.div>

          {/* Flowing particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-8 w-1 h-1 rounded-full bg-primary"
              initial={{ left: '10%', opacity: 0 }}
              animate={{ 
                left: ['10%', '90%'],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};
