import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Send, CheckCircle2, Zap } from 'lucide-react';

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
      className="grid lg:grid-cols-[60%_40%] gap-8 min-h-[500px]"
    >
      {/* Left Side - Workflow Pipeline */}
      <div className="relative flex items-center justify-center">
        <div className="space-y-8 w-full max-w-md">
          {stages.map((stage, index) => (
            <div key={index} className="relative">
              {/* Stage Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.2, type: "spring", stiffness: 150, damping: 12 }}
                    className="relative"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-lg" />
                    <motion.div
                      animate={{
                        rotate: index === 1 ? [0, 360] : 0,
                      }}
                      transition={{
                        duration: 3,
                        repeat: index === 1 ? Infinity : 0,
                        ease: "linear",
                      }}
                      className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/40"
                    >
                      <stage.icon className="h-7 w-7 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Stage Info */}
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.2 }}
                      className="text-base font-semibold text-white mb-2"
                    >
                      {stage.label}
                    </motion.div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg shadow-blue-500/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.progress}%` }}
                        transition={{ delay: 0.6 + index * 0.2, duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Progress Percentage */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.2 }}
                    className="text-sm font-bold text-cyan-400"
                  >
                    {stage.progress}%
                  </motion.div>
                </div>
              </motion.div>

              {/* Connecting Arrow */}
              {index < stages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ delay: 0.5 + index * 0.2, duration: 0.3 }}
                  className="absolute left-7 top-full w-px h-8 bg-gradient-to-b from-cyan-500/50 to-transparent origin-top ml-0.5"
                >
                  {/* Flowing Particle */}
                  <motion.div
                    className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"
                    animate={{
                      y: [0, 32],
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
      </div>

      {/* Right Side - Content Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-50" />
        <div className="relative bg-card/60 backdrop-blur-xl border border-blue-500/20 rounded-xl p-6 shadow-2xl h-full flex flex-col">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-semibold text-blue-300 mb-4 w-fit"
          >
            <Zap className="h-3.5 w-3.5" />
            AUTOMATED
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-white mb-3"
          >
            Fully Automated Pipeline
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-300 leading-relaxed mb-6"
          >
            Your entire workflow runs on autopilot. From SERP research to publishing, everything happens automatically.
          </motion.p>

          {/* Feature List */}
          <div className="space-y-3 mb-6 flex-1">
            {[
              'Research SERP data automatically',
              'AI generates optimized content',
              'Auto-publish to all platforms',
              'Track results in real-time'
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all w-full justify-center"
          >
            See Pipeline in Action
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
