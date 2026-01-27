import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Lightbulb, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const StrategyIllustration = () => {
  const goalProgress = 68;
  const calendarDays = ['M', 'T', 'W', 'T', 'F'];
  const contentBlocks = [true, false, true, true, false];

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative grid grid-cols-2 gap-5 w-full max-w-lg z-10">
        {/* Goal Tracker with Circular Progress */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-5 overflow-hidden"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(155,135,245,0.4)', '0 0 35px rgba(155,135,245,0.6)', '0 0 20px rgba(155,135,245,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-white">Goal Progress</span>
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/60">Monthly Articles</span>
                <motion.span
                  className="font-bold bg-gradient-to-r from-neon-purple to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {goalProgress}%
                </motion.span>
              </div>
              <div className="h-3 rounded-full bg-slate-700/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-neon-purple via-pink-500 to-neon-purple bg-[length:200%_100%]"
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress}%`, backgroundPosition: ['0% 0%', '100% 0%'] }}
                  transition={{ 
                    width: { duration: 1.5, delay: 0.5, ease: 'easeOut' },
                    backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                  }}
                  style={{ boxShadow: '0 0 15px rgba(155,135,245,0.5)' }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-lg font-bold text-green-400">12</span>
              </motion.div>
              <div>
                <div className="text-sm font-medium text-white">Published</div>
                <div className="text-xs text-white/50">of 18 target</div>
              </div>
              <motion.div
                className="ml-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: 'spring' }}
              >
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* AI Proposals */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-5 overflow-hidden"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(251,191,36,0.4)', '0 0 35px rgba(251,191,36,0.6)', '0 0 20px rgba(251,191,36,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <span className="text-sm font-semibold text-white">AI Proposals</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-400">3 new</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 relative z-10">
            {['SEO Guide', 'Case Study', 'How-To'].map((proposal, index) => (
              <motion.div
                key={proposal}
                className="p-3 rounded-xl bg-slate-700/40 border-l-3 border-l-amber-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
                style={{ borderLeftWidth: '3px' }}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.15 }}
                whileHover={{ x: 5 }}
              >
                <div className="text-xs font-medium text-white">{proposal}</div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400 font-medium">High impact</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Editorial Calendar - Full Width */}
        <motion.div
          className="col-span-2 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-5 overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
          />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(30,174,219,0.4)', '0 0 35px rgba(30,174,219,0.6)', '0 0 20px rgba(30,174,219,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calendar className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-white">Editorial Calendar</span>
          </div>

          <div className="flex gap-3 relative z-10">
            {calendarDays.map((day, index) => (
              <motion.div
                key={day + index}
                className="flex-1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.08 }}
              >
                <div className="text-center text-xs text-white/50 mb-2 font-medium">{day}</div>
                <motion.div
                  className={`h-16 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                    contentBlocks[index]
                      ? 'bg-gradient-to-b from-neon-purple/30 to-neon-blue/10 border border-neon-purple/40'
                      : 'bg-slate-700/30 border border-dashed border-white/10'
                  }`}
                  whileHover={{ scale: 1.05, y: -3 }}
                  animate={contentBlocks[index] ? { 
                    y: [0, -4, 0],
                    boxShadow: ['0 0 0 rgba(155,135,245,0)', '0 0 15px rgba(155,135,245,0.3)', '0 0 0 rgba(155,135,245,0)']
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                >
                  {contentBlocks[index] && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-1.5 rounded bg-white/30" />
                      <div className="w-5 h-1 rounded bg-white/20" />
                    </div>
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
