import React from 'react';
import { motion } from 'framer-motion';
import { Brain, FileText, BarChart3, TrendingUp, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';

export const HeroVisual = () => {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-neon-blue/10 to-neon-pink/10 blur-3xl" />
      
      {/* Central AI Brain */}
      <div className="relative z-10">
        {/* Brain Core with pulse */}
        <motion.div
          className="relative flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Outer pulse rings */}
          <motion.div
            className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20 blur-md"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 w-32 h-32 rounded-full bg-neon-blue/20 blur-md"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          
          {/* Brain Icon Container */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 via-neon-blue/30 to-neon-pink/30 backdrop-blur-xl border border-primary/50 flex items-center justify-center">
            <Brain className="w-16 h-16 text-primary" />
            <motion.div
              className="absolute top-2 right-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-neon-blue" />
            </motion.div>
          </div>
        </motion.div>

        {/* Input Sources - Left Side */}
        <div className="absolute -left-48 top-1/2 -translate-y-1/2 space-y-6">
          {/* Research Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/30">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-foreground">Research</div>
              <div className="text-xs text-muted-foreground">SERP Data</div>
            </div>
          </motion.div>

          {/* Analytics Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-blue/10 backdrop-blur-sm border border-neon-blue/30">
              <BarChart3 className="w-5 h-5 text-neon-blue" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-foreground">Analytics</div>
              <div className="text-xs text-muted-foreground">Performance</div>
            </div>
          </motion.div>
        </div>

        {/* Output Results - Right Side */}
        <div className="absolute -right-48 top-1/2 -translate-y-1/2 space-y-6">
          {/* Content Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="flex items-center gap-3"
          >
            <div className="text-sm text-right">
              <div className="font-semibold text-foreground">Content</div>
              <div className="text-xs text-muted-foreground">AI Generated</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-neon-pink/20 to-neon-pink/10 backdrop-blur-sm border border-neon-pink/30">
              <FileText className="w-5 h-5 text-neon-pink" />
            </div>
          </motion.div>

          {/* Results Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-3"
          >
            <div className="text-sm text-right">
              <div className="font-semibold text-foreground">Results</div>
              <div className="text-xs text-muted-foreground">Optimized</div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/30">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
          </motion.div>
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '600px', height: '600px', left: '-250px', top: '-250px' }}>
          {/* Left connections */}
          <motion.path
            d="M 100 220 Q 200 220, 250 300"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, delay: 0.6 }}
          />
          <motion.path
            d="M 100 340 Q 200 340, 250 300"
            stroke="hsl(var(--neon-blue))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          />

          {/* Right connections */}
          <motion.path
            d="M 350 300 Q 400 240, 500 220"
            stroke="hsl(var(--neon-pink))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, delay: 1.0 }}
          />
          <motion.path
            d="M 350 300 Q 400 340, 500 340"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          />

          {/* Animated dots traveling along paths */}
          <motion.circle
            r="4"
            fill="hsl(var(--primary))"
            animate={{
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1
            }}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M 100 220 Q 200 220, 250 300"
            />
          </motion.circle>
          <motion.circle
            r="4"
            fill="hsl(var(--neon-blue))"
            animate={{
              offsetDistance: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1.5
            }}
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M 100 340 Q 200 340, 250 300"
            />
          </motion.circle>
        </svg>

        {/* Learning Feedback Loop Arrow */}
        <motion.div
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <RefreshCw className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">Continuous Learning Loop</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <ArrowRight className="w-4 h-4 text-primary" />
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full"
            style={{
              left: `${Math.random() * 400 - 200}px`,
              top: `${Math.random() * 400 - 200}px`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
};
