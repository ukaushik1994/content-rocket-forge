import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Upload, Zap } from 'lucide-react';

export const WorkflowPipelineVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="space-y-6"
    >
      {/* Fully Automated Badge */}
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
          <Zap className="h-4 w-4 text-primary" />
        </motion.div>
        <span className="text-xs font-medium text-primary">Fully Automated</span>
      </motion.div>

      {/* Central Workflow Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.5, ease: "easeInOut" }}
        className="flex justify-center"
      >
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-neon-pink mx-auto flex items-center justify-center shadow-2xl shadow-primary/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Zap className="h-10 w-10 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Workflow Stage Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Search, value: '100%', label: 'Research Ready' },
          { icon: Brain, value: '87%', label: 'AI Complete' },
          { icon: Upload, value: '95%', label: 'Publish Success' }
        ].map((stage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + index * 0.1, ease: "easeInOut" }}
            className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-xl"
          >
            <stage.icon className="h-5 w-5 text-primary mb-2" />
            <motion.div 
              className="text-2xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              {stage.value}
            </motion.div>
            <div className="text-xs text-muted-foreground">{stage.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Status Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 space-y-3 shadow-xl"
      >
        <div className="text-sm font-medium text-foreground mb-3">Pipeline Status</div>
        
        {[
          { label: 'Research Phase', progress: 100 },
          { label: 'AI Processing', progress: 75 },
          { label: 'Publishing Queue', progress: 30 }
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
