import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export const AudienceInsightsVisual = () => {
  const topMetrics = [
    { label: 'Prefer', value: 94 },
    { label: 'Target', value: 72 },
    { label: 'Engage', value: 89 },
  ];

  const insights = [
    { label: 'Content Pref', value: 95 },
    { label: 'Engagement', value: 78 },
    { label: 'Best Times', value: 88 },
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
        {/* Top Metrics */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-12"
        >
          {topMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-3xl font-bold text-foreground mb-1"
              >
                {metric.value}%
              </motion.div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Central User Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 150, damping: 15 }}
          className="relative flex items-center justify-center"
        >
          {/* Radiating beams */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-purple-500/40 to-transparent origin-left"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
            />
          ))}

          <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
            <Users className="h-12 w-12 text-white" />
          </div>
        </motion.div>

        {/* Bottom Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-3 max-w-md mx-auto"
        >
          {insights.map((insight, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{insight.label}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 + index * 0.15 }}
                  className="text-purple-400 font-medium"
                >
                  {insight.value}%
                </motion.span>
              </div>
              <div className="h-1.5 bg-muted/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${insight.value}%` }}
                  transition={{ delay: 1.1 + index * 0.15, duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
