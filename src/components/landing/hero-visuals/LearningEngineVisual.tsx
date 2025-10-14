import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Sparkles, Zap, Eye, CheckCircle, ArrowRight } from 'lucide-react';

export const LearningEngineVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="space-y-6"
    >
      {/* Neural Brain Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ease: "easeInOut" }}
        className="relative"
      >
        <div className="bg-gradient-to-br from-primary/20 via-neon-blue/20 to-primary/10 rounded-xl border border-primary/40 p-6 relative overflow-hidden">
          {/* Animated background glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-neon-blue/10 to-primary/10"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <div className="relative z-10 flex items-center gap-4">
            {/* Pulsing Brain Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-primary/30 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <Brain className="h-12 w-12 text-primary relative z-10" />
            </motion.div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">Neural Learning Engine</h3>
              <p className="text-sm text-muted-foreground">Learning from <span className="text-primary font-semibold">847 posts</span> • <span className="text-neon-blue font-semibold">24 creators</span></p>
            </div>

            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">Active</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Before/After Comparison Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Card 1: First Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeInOut" }}
          className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border border-border p-4 shadow-md"
        >
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">First Post</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-foreground">234</div>
            <div className="text-xs text-muted-foreground">views</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>4 hours to create</span>
            </div>
            <div className="text-xs text-amber-500 font-medium mt-2">Below average</div>
          </div>
        </motion.div>

        {/* Card 2: After Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeInOut" }}
          className="bg-gradient-to-br from-primary/20 to-neon-blue/10 rounded-lg border border-primary/40 p-4 shadow-md shadow-primary/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase">After 30 Days</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-foreground">2,847</div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xs font-bold text-green-500"
              >
                +1,117%
              </motion.div>
            </div>
            <div className="text-xs text-muted-foreground">views</div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <Zap className="h-3 w-3" />
              <span className="font-medium">45 min to create</span>
            </div>
            <div className="text-xs text-green-500 font-medium mt-2">Top 10% in niche</div>
          </div>
        </motion.div>

        {/* Card 3: AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeInOut" }}
          className="bg-gradient-to-br from-neon-blue/20 to-neon-pink/10 rounded-lg border border-neon-blue/40 p-4 shadow-md"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-neon-blue" />
            <span className="text-xs font-semibold text-neon-blue uppercase">Key Insights</span>
          </div>
          <div className="space-y-2.5">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-start gap-1.5"
            >
              <CheckCircle className="h-3 w-3 text-neon-blue mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground leading-tight">Best time: 7 AM</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-start gap-1.5"
            >
              <CheckCircle className="h-3 w-3 text-neon-blue mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground leading-tight">Questions boost +67%</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-start gap-1.5"
            >
              <CheckCircle className="h-3 w-3 text-neon-blue mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground leading-tight">Tech founders engage 3x</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Learning Cycle Flow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6, ease: "easeInOut" }}
        className="bg-gradient-to-r from-background/50 to-background/20 rounded-lg border border-border/30 p-6 relative overflow-hidden shadow-lg"
      >
        <div className="flex items-center justify-between relative z-10">
          {[
            { label: 'Create', icon: Sparkles },
            { label: 'Analyze', icon: Brain },
            { label: 'Learn', icon: TrendingUp },
            { label: 'Optimize', icon: Zap }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.15, type: "spring", stiffness: 150, damping: 12 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    '0 0 0px rgba(var(--primary), 0)',
                    '0 0 20px rgba(var(--primary), 0.5)',
                    '0 0 0px rgba(var(--primary), 0)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.6, ease: "easeInOut" }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center shadow-lg"
              >
                <step.icon className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xs font-medium text-foreground">{step.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Connecting line */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {[0, 1, 2].map((index) => (
            <motion.path
              key={index}
              d={`M ${25 + index * 25}% 50% L ${50 + index * 25}% 50%`}
              stroke="url(#cycleGradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1, delay: 1 + index * 0.2, ease: "easeInOut" }}
            />
          ))}
          <defs>
            <linearGradient id="cycleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--neon-blue))" />
            </linearGradient>
          </defs>
        </svg>

        {/* Flowing data particles */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]"
            style={{ left: `${25 + index * 25}%` }}
            animate={{
              x: ['0%', '150%'],
              opacity: [0, 1, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 1.5 + index * 0.5,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.div>

      {/* Learning Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.5, ease: "easeInOut" }}
        className="bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-pink/10 rounded-lg border border-primary/30 p-5 shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-foreground">Learning Progress</h4>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-1.5 text-xs text-primary"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-medium">New insight 23 min ago</span>
          </motion.div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-neon-blue to-neon-pink" />
          
          <div className="relative flex justify-between">
            {[
              { month: 'Sept', posts: '50 posts', metric: '2.1K avg views', status: 'completed' },
              { month: 'Oct', posts: '200 posts', metric: '5.4K avg views', status: 'completed' },
              { month: 'Nov', posts: '400 posts', metric: '8.7K avg views', status: 'active' }
            ].map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 + index * 0.15 }}
                className="flex flex-col items-center gap-2 relative z-10"
              >
                <motion.div
                  animate={milestone.status === 'active' ? {
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      '0 0 0px rgba(var(--primary), 0)',
                      '0 0 15px rgba(var(--primary), 0.6)',
                      '0 0 0px rgba(var(--primary), 0)'
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    milestone.status === 'active' 
                      ? 'bg-primary border-primary shadow-lg shadow-primary/50' 
                      : 'bg-primary/20 border-primary'
                  }`}
                >
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <Brain className="h-5 w-5 text-white" />
                  )}
                </motion.div>
                <div className="text-center">
                  <div className="text-xs font-bold text-foreground">{milestone.month}</div>
                  <div className="text-xs text-muted-foreground mt-1">{milestone.posts}</div>
                  <div className="text-xs text-primary font-medium mt-0.5">{milestone.metric}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next optimization preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between"
        >
          <span className="text-xs text-muted-foreground">Next optimization:</span>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 text-xs text-neon-blue font-medium"
          >
            <span>Headline A/B testing</span>
            <ArrowRight className="h-3 w-3" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
