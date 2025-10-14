import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Upload, BarChart3, TrendingUp } from 'lucide-react';

export const WorkflowPipelineVisual = () => {
  const stages = [
    { icon: Search, label: 'Research', color: 'primary', conversion: '100%' },
    { icon: Brain, label: 'AI Writing', color: 'neon-blue', conversion: '87%' },
    { icon: Upload, label: 'Publishing', color: 'neon-pink', conversion: '95%' },
    { icon: BarChart3, label: 'Analytics', color: 'primary', conversion: '82%' },
    { icon: TrendingUp, label: 'ROI', color: 'neon-blue', conversion: '67%' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="space-y-6"
    >
      {/* Pipeline Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.2, ease: "easeInOut" }}
            className="relative"
          >
            {/* Stage Card */}
            <div className={`bg-gradient-to-r from-${stage.color}/20 to-${stage.color}/5 rounded-lg border border-${stage.color}/30 p-4 flex items-center justify-between shadow-md`}>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: index === 1 ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: index * 0.4,
                    ease: "easeInOut"
                  }}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${stage.color} to-${stage.color}/70 flex items-center justify-center shadow-lg`}
                >
                  <stage.icon className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <div className="text-sm font-medium text-foreground">{stage.label}</div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.2, ease: "easeInOut" }}
                    className={`text-xs text-${stage.color}`}
                  >
                    {stage.conversion} Success Rate
                  </motion.div>
                </div>
              </div>

              {/* Data particles */}
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.2, ease: "easeInOut" }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full bg-${stage.color} shadow-[0_0_4px_rgba(var(--${stage.color}),0.6)]`}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 0.3 + index * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Connecting Arrow */}
            {index < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.2, ease: "easeInOut" }}
                className="absolute left-5 top-full w-px h-4 bg-gradient-to-b from-primary/50 to-transparent origin-top"
              >
                {/* Flowing particle */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.6)]"
                  animate={{
                    y: ['0%', '100%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: 1.5 + index * 0.6,
                    ease: 'easeInOut'
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Automation Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 3, ease: "easeInOut" }}
        className="bg-gradient-to-r from-primary/10 via-neon-blue/10 to-neon-pink/10 rounded-lg border border-primary/30 p-4 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium text-foreground">Fully Automated</div>
            <div className="text-xs text-muted-foreground">From research to results</div>
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-neon-blue flex items-center justify-center shadow-lg"
          >
            <span className="text-white text-xs font-bold">AI</span>
          </motion.div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-3 space-y-2">
          <div className="h-2 bg-background/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-neon-blue to-neon-pink shadow-[0_0_8px_rgba(var(--primary),0.3)]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, delay: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
