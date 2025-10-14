import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Target, TrendingUp, Clock, CheckCircle2, Brain } from 'lucide-react';

export const AudienceInsightsVisual = () => {
  const metrics = [
    { icon: Heart, label: 'Preferences', value: 94, color: 'from-purple-500 to-pink-500' },
    { icon: Target, label: 'Targeting', value: 89, color: 'from-blue-500 to-cyan-500' },
    { icon: TrendingUp, label: 'Engagement', value: 92, color: 'from-green-500 to-emerald-500' },
    { icon: Clock, label: 'Timing', value: 87, color: 'from-orange-500 to-yellow-500' },
  ];

  const insights = [
    { label: 'Content Preferences', value: 95 },
    { label: 'Engagement Patterns', value: 78 },
    { label: 'Best Publishing Times', value: 88 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="grid lg:grid-cols-[60%_40%] gap-8 min-h-[500px]"
    >
      {/* Left Side - Metrics & Insights */}
      <div className="relative flex flex-col justify-center space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 150, damping: 12 }}
              className="relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-br opacity-30 rounded-xl blur" style={{
                backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
              }} />
              <div className="relative bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-gray-400">{metric.label}</span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-3xl font-bold text-white"
                >
                  {metric.value}%
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Central User Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 150, damping: 15 }}
          className="relative mx-auto"
        >
          {/* Radiating beams */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-16 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent origin-left"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
            />
          ))}

          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40">
            <Users className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        {/* Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-3 max-w-md mx-auto w-full"
        >
          {insights.map((insight, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{insight.label}</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 + index * 0.15 }}
                  className="text-purple-400 font-medium"
                >
                  {insight.value}%
                </motion.span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
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

      {/* Right Side - Content Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-50" />
        <div className="relative bg-card/60 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 shadow-2xl h-full flex flex-col">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-4 w-fit"
          >
            <Brain className="h-3.5 w-3.5" />
            PERSONALIZED FOR YOU
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-white mb-3"
          >
            Deep Audience Insights
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-300 leading-relaxed mb-6"
          >
            AI analyzes YOUR specific audience behavior to understand what content resonates best with them.
          </motion.p>

          {/* Feature List */}
          <div className="space-y-3 mb-6 flex-1">
            {[
              'Learn content preferences deeply',
              'Track engagement patterns',
              'Identify best publishing times',
              'Discover trending topics'
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all w-full justify-center"
          >
            View Insights Dashboard
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
