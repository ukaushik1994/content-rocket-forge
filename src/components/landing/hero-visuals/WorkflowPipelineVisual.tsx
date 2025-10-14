import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Send } from 'lucide-react';

export const WorkflowPipelineVisual = () => {
  const stages = [
    { icon: Search, label: 'Research', progress: 100 },
    { icon: Brain, label: 'AI Generate', progress: 75 },
    { icon: Send, label: 'Publish', progress: 30 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="min-h-[500px] flex items-center justify-center"
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {stages.map((stage, index) => (
          <div key={index} className="relative">
            {/* Stage Row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.2, type: "spring", stiffness: 150, damping: 12 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl blur-lg" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/40">
                  <stage.icon className="h-7 w-7 text-white" />
                </div>
              </motion.div>

              {/* Label & Progress */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.2 }}
                    className="text-sm text-muted-foreground"
                  >
                    {stage.label}
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.2 }}
                    className="text-sm font-medium text-cyan-400"
                  >
                    {stage.progress}%
                  </motion.span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/50"
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.progress}%` }}
                    transition={{ delay: 0.7 + index * 0.2, duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Connecting Arrow */}
            {index < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 0.6 + index * 0.2, duration: 0.3 }}
                className="absolute left-7 top-full w-px h-6 bg-gradient-to-b from-cyan-500/50 to-transparent origin-top"
              >
                {/* Flowing Particle */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                  animate={{
                    y: [0, 24],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 1 + index * 0.5,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
