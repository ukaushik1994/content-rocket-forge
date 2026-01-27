import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, TrendingUp, Sparkles } from 'lucide-react';

export const AIChatIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-3">
        {/* User message */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-[80%] p-3 rounded-2xl rounded-br-md bg-gradient-to-r from-neon-purple to-neon-blue">
            <p className="text-[11px] text-white">Show me my campaign performance</p>
          </div>
        </motion.div>

        {/* AI message with typing indicator */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-neon-purple" />
          </div>
          <div className="max-w-[85%] space-y-2">
            <div className="p-3 rounded-2xl rounded-bl-md bg-slate-800/80 border border-white/10">
              <p className="text-[11px] text-white/80">
                Here's your campaign performance with key metrics:
              </p>
            </div>

            {/* Chart emerging from message */}
            <motion.div
              className="p-3 rounded-xl bg-slate-800/80 border border-white/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-3 h-3 text-neon-purple" />
                <span className="text-[9px] text-white/60">Performance Chart</span>
              </div>

              {/* Mini chart */}
              <div className="flex items-end gap-1.5 h-12">
                {[30, 50, 40, 70, 55, 85, 65].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-neon-purple/70 to-neon-blue/50"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1 + i * 0.08, duration: 0.4 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Metric cards */}
            <motion.div
              className="grid grid-cols-2 gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <div className="p-2 rounded-lg bg-slate-800/80 border border-white/10">
                <div className="text-[8px] text-white/40">Impressions</div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-white">12.4K</span>
                  <motion.span
                    className="text-[8px] text-green-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    +24%
                  </motion.span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-white/10">
                <div className="text-[8px] text-white/40">Clicks</div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-white">1.8K</span>
                  <motion.span
                    className="text-[8px] text-green-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  >
                    +18%
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Action button */}
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <motion.button
                className="flex-1 text-[9px] py-1.5 px-3 rounded-lg bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                whileHover={{ scale: 1.02 }}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                View Campaign
              </motion.button>
              <button className="text-[9px] py-1.5 px-3 rounded-lg bg-slate-700/50 text-white/60">
                Export
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
