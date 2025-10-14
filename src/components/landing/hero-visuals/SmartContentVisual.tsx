import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUp } from 'lucide-react';

export const SmartContentVisual = () => {
  const metrics = [
    { label: 'Quality', value: 45 },
    { label: 'Engagement', value: 67 },
    { label: 'Reach', value: 23 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="min-h-[500px] flex items-center justify-center"
    >
      <div className="relative w-full max-w-2xl mx-auto space-y-8">
        {/* Top Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Overall Performance</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm font-bold text-blue-400"
            >
              92%
            </motion.span>
          </div>
          <div className="h-2 bg-muted/20 rounded-full overflow-hidden max-w-md mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Center Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 150, damping: 15 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40"
          >
            <TrendingUp className="h-16 w-16 text-white" />
          </motion.div>
        </motion.div>

        {/* Bottom Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-8"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
              className="text-center"
            >
              <div className="flex items-center gap-1 justify-center mb-1">
                <ArrowUp className="h-4 w-4 text-green-400" />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                  className="text-2xl font-bold text-foreground"
                >
                  +{metric.value}%
                </motion.span>
              </div>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
