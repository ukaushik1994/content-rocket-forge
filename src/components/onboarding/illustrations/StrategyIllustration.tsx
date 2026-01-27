import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Lightbulb, TrendingUp } from 'lucide-react';

export const StrategyIllustration = () => {
  const goalProgress = 68;
  const calendarDays = ['M', 'T', 'W', 'T', 'F'];
  const contentBlocks = [true, false, true, true, false];

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {/* Goal Tracker */}
        <motion.div
          className="rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-neon-purple" />
            <span className="text-xs font-medium text-white/80">Goal Progress</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-white/60">Monthly Articles</span>
                <motion.span
                  className="text-neon-purple font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {goalProgress}%
                </motion.span>
              </div>
              <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress}%` }}
                  transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400 font-bold">12</span>
              </div>
              <div>
                <div className="text-white/80">Published</div>
                <div className="text-white/40">of 18 target</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Proposals */}
        <motion.div
          className="rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-medium text-white/80">AI Proposals</span>
          </div>

          <div className="space-y-2">
            {['SEO Guide', 'Case Study', 'How-To'].map((proposal, index) => (
              <motion.div
                key={proposal}
                className="p-2 rounded-lg bg-slate-700/40 border-l-2 border-neon-purple"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.2 }}
              >
                <div className="text-[10px] text-white/80">{proposal}</div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-2.5 h-2.5 text-green-400" />
                  <span className="text-[8px] text-green-400">High impact</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Editorial Calendar */}
        <motion.div
          className="col-span-2 rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-neon-blue" />
            <span className="text-xs font-medium text-white/80">Editorial Calendar</span>
          </div>

          <div className="flex gap-2">
            {calendarDays.map((day, index) => (
              <motion.div
                key={day + index}
                className="flex-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <div className="text-center text-[10px] text-white/50 mb-2">{day}</div>
                <motion.div
                  className={`h-12 rounded-lg flex items-center justify-center ${
                    contentBlocks[index]
                      ? 'bg-gradient-to-b from-neon-purple/30 to-neon-purple/10 border border-neon-purple/30'
                      : 'bg-slate-700/30 border border-dashed border-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  animate={contentBlocks[index] ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                >
                  {contentBlocks[index] && (
                    <div className="w-6 h-1 rounded bg-white/30" />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
