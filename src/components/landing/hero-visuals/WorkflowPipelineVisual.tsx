import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Upload, BarChart3, TrendingUp, Clock, FileEdit, Edit, Zap, Target, ArrowDown, ArrowRight } from 'lucide-react';
import { CustomBadge } from '@/components/ui/custom-badge';

export const WorkflowPipelineVisual = () => {
  const manualStages = [
    { icon: Search, label: 'Research', time: '60min' },
    { icon: FileEdit, label: 'Writing', time: '90min' },
    { icon: Edit, label: 'Editing', time: '45min' },
    { icon: Upload, label: 'Publishing', time: '30min' },
    { icon: BarChart3, label: 'Analytics', time: '45min' }
  ];

  const automatedStages = [
    { icon: Search, label: 'Research', time: '5min', color: 'primary' },
    { icon: Brain, label: 'AI Writing', time: '8min', color: 'neon-blue' },
    { icon: Zap, label: 'Auto-Edit', time: '3min', color: 'neon-pink' },
    { icon: Upload, label: 'Publishing', time: '2min', color: 'primary' },
    { icon: TrendingUp, label: 'Analytics', time: '0min', color: 'neon-blue' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="space-y-6"
    >
      {/* Manual Process Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="opacity-60"
      >
        <div className="flex items-center justify-between mb-3">
          <CustomBadge className="bg-muted text-muted-foreground border-border">
            Manual Process
          </CustomBadge>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">5 hours</span>
          </div>
        </div>
        
        {/* Manual workflow compact view */}
        <div className="flex items-center gap-2 mb-3">
          {manualStages.map((stage, i) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-card/50 border border-border/50 rounded-lg p-2"
              >
                <stage.icon className="h-4 w-4 text-muted-foreground" />
              </motion.div>
              {i < manualStages.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Slow progress bar */}
        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-muted-foreground/40 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '25%' }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          />
        </div>
      </motion.div>

      {/* Transformation Arrow */}
      <motion.div 
        className="relative flex flex-col items-center gap-2 py-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-8 w-8 text-primary" />
        </motion.div>
        
        <motion.div 
          className="px-4 py-2 rounded-full bg-gradient-to-r from-primary via-neon-blue to-neon-pink shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Automation
          </span>
        </motion.div>
        
        {/* Flowing particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_6px_rgba(var(--primary),0.6)]"
            style={{ left: `${40 + i * 10}%` }}
            animate={{
              y: [-10, 60],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Automated Process Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <CustomBadge className="bg-primary text-primary-foreground border-primary">
            Automated
          </CustomBadge>
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4 text-neon-blue" />
            <span className="text-sm font-bold">30 minutes</span>
          </div>
        </div>
        
        {/* Automated workflow with colors */}
        <div className="flex items-center gap-2 mb-3">
          {automatedStages.map((stage, i) => (
            <React.Fragment key={i}>
              <motion.div 
                className={`bg-gradient-to-br from-${stage.color}/20 to-${stage.color}/5 border border-${stage.color}/30 rounded-lg p-2 shadow-md`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
              >
                <stage.icon className={`h-4 w-4 text-${stage.color}`} />
              </motion.div>
              {i < automatedStages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    x: [0, 3, 0]
                  }}
                  transition={{ 
                    opacity: { delay: 1 + i * 0.1 },
                    x: { duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }
                  }}
                >
                  <ArrowRight className="h-3 w-3 text-primary" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Fast progress bar */}
        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-neon-blue to-neon-pink shadow-[0_0_8px_rgba(var(--primary),0.3)]"
            initial={{ width: 0 }}
            animate={{ width: '95%' }}
            transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Improvement Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        {[
          { label: 'Time Saved', value: '-90%', icon: Clock, color: 'primary' },
          { label: 'Quality', value: '+45%', icon: TrendingUp, color: 'neon-blue' },
          { label: 'Output', value: '+300%', icon: Zap, color: 'neon-pink' },
          { label: 'Effort', value: '-75%', icon: Target, color: 'primary' }
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 + i * 0.15, duration: 0.4 }}
            className={`bg-gradient-to-br from-${metric.color}/20 to-${metric.color}/5 border border-${metric.color}/30 rounded-lg p-3 hover:shadow-md transition-shadow`}
          >
            <metric.icon className={`h-4 w-4 text-${metric.color} mb-2`} />
            <motion.div 
              className={`text-2xl font-bold text-${metric.color}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2 + i * 0.15, duration: 0.3 }}
            >
              {metric.value}
            </motion.div>
            <div className="text-xs text-muted-foreground">{metric.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
