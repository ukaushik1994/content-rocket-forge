import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, MousePointer, ArrowUpRight, PieChart } from 'lucide-react';
import { CountingNumber } from '../ui/CountingNumber';

export const AnalyticsIllustration = () => {
  const metrics = [
    { label: 'Views', value: 24500, suffix: 'K', displayValue: '24.5', change: '+12%', icon: Eye, color: 'from-purple-400 to-purple-600' },
    { label: 'Clicks', value: 3200, suffix: 'K', displayValue: '3.2', change: '+8%', icon: MousePointer, color: 'from-cyan-400 to-blue-500' },
    { label: 'Sessions', value: 8700, suffix: 'K', displayValue: '8.7', change: '+15%', icon: PieChart, color: 'from-green-400 to-emerald-500' },
    { label: 'Bounce', value: 32, suffix: '%', displayValue: '32', change: '-5%', icon: TrendingUp, color: 'from-amber-400 to-orange-500', isNegativeGood: true },
  ];

  const chartBars = [35, 55, 40, 75, 50, 90, 65];

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* Background glow */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative w-full max-w-lg space-y-5 z-10">
        {/* Metric Cards - 4 column grid */}
        <div className="grid grid-cols-4 gap-3">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-3 overflow-hidden"
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 rounded-xl`}
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <metric.icon className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[10px] text-white/50 font-medium">{metric.label}</span>
                </div>
                <motion.div
                  className="text-lg font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {metric.displayValue}{metric.suffix === 'K' ? 'K' : metric.suffix === '%' ? '%' : ''}
                </motion.div>
                <motion.div
                  className={`flex items-center gap-0.5 mt-1 ${metric.isNegativeGood ? 'text-green-400' : 'text-green-400'}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-[10px] font-semibold">{metric.change}</span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Chart - Premium */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-5 overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(155,135,245,0.4)', '0 0 35px rgba(155,135,245,0.6)', '0 0 20px rgba(155,135,245,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BarChart3 className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-white">Performance Trend</span>
          </div>

          <div className="flex items-end gap-3 h-28 relative z-10">
            {chartBars.map((height, index) => (
              <motion.div
                key={index}
                className="flex-1 rounded-t-lg bg-gradient-to-t from-neon-purple via-neon-blue to-cyan-400 relative overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.8 + index * 0.08,
                  ease: 'easeOut',
                }}
                style={{ boxShadow: '0 0 15px rgba(155,135,245,0.3)' }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={{ translateX: ['100%', '-100%'] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 + index * 0.1 }}
                />
              </motion.div>
            ))}
          </div>

          <div className="flex justify-between mt-3 relative z-10">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day} className="text-[10px] text-white/40 font-medium">{day}</span>
            ))}
          </div>
        </motion.div>

        {/* ROI Badge - Premium */}
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
        >
          {/* Animated border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 bg-[length:200%_100%]"
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10" />
          
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: ['0 0 25px rgba(74,222,128,0.4)', '0 0 45px rgba(74,222,128,0.6)', '0 0 25px rgba(74,222,128,0.4)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <div className="text-sm font-semibold text-white">Content ROI</div>
                  <div className="text-xs text-white/50">Based on GA4 + GSC data</div>
                </div>
              </div>
              <motion.div
                className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
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
