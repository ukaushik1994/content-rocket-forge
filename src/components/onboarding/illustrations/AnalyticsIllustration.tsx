import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, MousePointer, ArrowUpRight } from 'lucide-react';

export const AnalyticsIllustration = () => {
  const metrics = [
    { label: 'Views', value: '24.5K', change: '+12%', icon: Eye },
    { label: 'Clicks', value: '3.2K', change: '+8%', icon: MousePointer },
  ];

  const chartBars = [40, 65, 45, 80, 55, 90, 70];

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="rounded-xl bg-slate-800/80 border border-white/10 p-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className="w-4 h-4 text-white/50" />
                <span className="text-[10px] text-white/50">{metric.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <motion.span
                  className="text-xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.15 }}
                >
                  {metric.value}
                </motion.span>
                <motion.div
                  className="flex items-center gap-0.5 text-green-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.15 }}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[10px] font-medium">{metric.change}</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bar Chart */}
        <motion.div
          className="rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-neon-purple" />
            <span className="text-xs font-medium text-white/80">Performance Trend</span>
          </div>

          <div className="flex items-end gap-2 h-24">
            {chartBars.map((height, index) => (
              <motion.div
                key={index}
                className="flex-1 rounded-t bg-gradient-to-t from-neon-purple/80 to-neon-blue/60"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + index * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          <div className="flex justify-between mt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day} className="text-[8px] text-white/30">{day}</span>
            ))}
          </div>
        </motion.div>

        {/* ROI Badge */}
        <motion.div
          className="rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-green-400" />
              </motion.div>
              <div>
                <div className="text-xs font-medium text-white/80">Content ROI</div>
                <div className="text-[10px] text-white/50">Based on GA4 data</div>
              </div>
            </div>
            <motion.div
              className="text-2xl font-bold text-green-400"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              342%
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
