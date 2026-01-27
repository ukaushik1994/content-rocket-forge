import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, MousePointer, ArrowUpRight, PieChart } from 'lucide-react';

export const AnalyticsIllustration = () => {
  const metrics = [
    { label: 'Views', value: '24.5K', change: '+12%', icon: Eye, color: 'from-purple-400 to-purple-600' },
    { label: 'Clicks', value: '3.2K', change: '+8%', icon: MousePointer, color: 'from-cyan-400 to-blue-500' },
    { label: 'Sessions', value: '8.7K', change: '+15%', icon: PieChart, color: 'from-green-400 to-emerald-500' },
    { label: 'Bounce', value: '32%', change: '-5%', icon: TrendingUp, color: 'from-amber-400 to-orange-500' },
  ];

  const chartBars = [35, 55, 40, 75, 50, 90, 65];

  return (
    <div className="relative w-full h-full max-h-full flex items-center justify-center px-2 overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute w-60 h-60 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative w-full max-w-md space-y-3 z-10 scale-[0.9]">
        {/* Metric Cards - 4 column grid */}
        <div className="grid grid-cols-4 gap-2">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="rounded-lg bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-2 overflow-hidden"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-1 mb-1.5">
                  <metric.icon className="w-3 h-3 text-white/50" />
                  <span className="text-[9px] text-white/50 font-medium">{metric.label}</span>
                </div>
                <div className="text-sm font-bold text-white">{metric.value}</div>
                <div className="flex items-center gap-0.5 mt-0.5 text-green-400">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  <span className="text-[9px] font-semibold">{metric.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Chart */}
        <motion.div
          className="rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-4 overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
              animate={{ boxShadow: ['0 0 15px rgba(155,135,245,0.4)', '0 0 25px rgba(155,135,245,0.6)', '0 0 15px rgba(155,135,245,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-xs font-semibold text-white">Performance Trend</span>
          </div>

          <div className="flex items-end gap-2 h-20 relative z-10">
            {chartBars.map((height, index) => (
              <motion.div
                key={index}
                className="flex-1 rounded-t bg-gradient-to-t from-neon-purple via-neon-blue to-cyan-400 relative overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + index * 0.06,
                  ease: 'easeOut',
                }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={{ translateX: ['100%', '-100%'] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 + index * 0.08 }}
                />
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between mt-2 relative z-10">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
              <span key={day} className="text-[9px] text-white/40 font-medium">{day}</span>
            ))}
          </div>
        </motion.div>

        {/* ROI Badge */}
        <motion.div
          className="relative rounded-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: 'spring' }}
        >
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 bg-[length:200%_100%]"
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10" />
          
          <div className="relative p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <div className="text-xs font-semibold text-white">Content ROI</div>
                  <div className="text-[10px] text-white/50">Based on GA4 + GSC data</div>
                </div>
              </div>
              <motion.div
                className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                342%
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
