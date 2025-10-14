import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, BarChart3, Zap, Target, Users } from 'lucide-react';

export const HeroDashboardPreview = () => {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-neon-blue/20 to-neon-pink/20 blur-3xl animate-pulse" />
      
      {/* Dashboard Container */}
      <div className="relative bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-futuristic-grid opacity-10" />
        
        {/* Dashboard Content */}
        <div className="p-6 md:p-8 space-y-6 relative z-10">
          {/* Header with animated learning indicator */}
          <div className="flex items-center justify-between">
            <motion.div 
              className="h-8 w-48 bg-gradient-to-r from-primary/30 to-neon-blue/30 rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-neon-blue"
                initial={{ width: "0%" }}
                animate={{ width: "75%" }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </motion.div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-xs font-medium text-primary">AI Learning Active</span>
            </div>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: TrendingUp, color: 'primary', value: '67%', label: 'Performance', delay: 0 },
              { icon: Target, color: 'neon-blue', value: '12.4K', label: 'Reach', delay: 0.2 },
              { icon: Users, color: 'neon-pink', value: '8.2K', label: 'Engagement', delay: 0.4 }
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: metric.delay }}
                className={`bg-gradient-to-br from-${metric.color}/20 to-${metric.color}/5 rounded-lg border border-${metric.color}/30 p-3 md:p-4`}
              >
                <metric.icon className={`h-5 w-5 text-${metric.color} mb-2`} />
                <motion.div 
                  className="text-xl md:text-2xl font-bold text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: metric.delay + 0.3 }}
                >
                  {metric.value}
                </motion.div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Animated Chart Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="h-32 md:h-40 bg-gradient-to-r from-background/50 to-background/20 rounded-lg border border-border/30 p-4 relative overflow-hidden"
          >
            {/* Chart bars animation */}
            <div className="flex items-end justify-around h-full gap-2">
              {[45, 60, 55, 75, 70, 85, 90, 95].map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  className={`flex-1 rounded-t ${
                    index < 4 
                      ? 'bg-gradient-to-t from-primary/40 to-primary/60' 
                      : 'bg-gradient-to-t from-neon-blue/40 to-neon-blue/60'
                  }`}
                />
              ))}
            </div>
            
            {/* Trend line overlay */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <motion.path
                d="M 0 80 Q 50 60, 100 50 T 200 30 T 300 10"
                stroke="url(#gradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 1.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--neon-blue))" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          
          {/* AI Insights Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-pink/10 rounded-lg border border-primary/30 p-4 flex items-start gap-3"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2 }}
            >
              <Zap className="h-6 w-6 text-primary flex-shrink-0" />
            </motion.div>
            <div className="flex-1 space-y-2">
              <motion.div 
                className="h-2 bg-primary/40 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1.5, delay: 2 }}
              />
              <motion.div 
                className="h-2 bg-neon-blue/40 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1.5, delay: 2.2 }}
              />
              <motion.div 
                className="h-2 bg-neon-pink/40 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                transition={{ duration: 1.5, delay: 2.4 }}
              />
            </div>
          </motion.div>
        </div>
        
        {/* Floating particles */}
        <motion.div
          className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/4 right-6 w-1.5 h-1.5 bg-neon-blue rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-8 left-1/4 w-1 h-1 bg-neon-pink rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </div>
    </div>
  );
};
