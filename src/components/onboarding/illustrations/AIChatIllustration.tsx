import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, TrendingUp, Sparkles, Bot, Send } from 'lucide-react';

export const AIChatIllustration = () => {
  return (
    <div className="relative w-full h-full max-h-full flex items-center justify-center px-2 overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute w-60 h-60 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative w-full max-w-sm space-y-3 z-10 scale-[0.88]">
        {/* Chat container */}
        <motion.div
          className="rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Chat header */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 bg-slate-900/50">
            <motion.div
              className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
              animate={{ boxShadow: ['0 0 12px rgba(155,135,245,0.3)', '0 0 20px rgba(155,135,245,0.5)', '0 0 12px rgba(155,135,245,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bot className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <span className="text-xs font-semibold text-white">AI Strategy Coach</span>
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[9px] text-green-400">Online</span>
              </div>
            </div>
          </div>

          <div className="p-3 space-y-3">
            {/* User message */}
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="max-w-[80%] p-2.5 rounded-xl rounded-br-sm bg-gradient-to-r from-neon-purple to-neon-blue">
                <p className="text-xs text-white font-medium">Show me my campaign performance</p>
              </div>
            </motion.div>

            {/* AI message with avatar */}
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center flex-shrink-0 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-neon-purple" />
              </div>
              <div className="flex-1 space-y-2">
                {/* Text response */}
                <div className="p-2.5 rounded-xl rounded-bl-sm bg-slate-700/60 border border-white/5">
                  <p className="text-xs text-white/90">
                    Here's your campaign performance with key metrics:
                  </p>
                </div>

                {/* Chart */}
                <motion.div
                  className="p-3 rounded-lg bg-slate-700/60 border border-white/5"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <BarChart3 className="w-3 h-3 text-neon-purple" />
                    <span className="text-[10px] font-medium text-white/70">Performance Chart</span>
                  </div>

                  {/* Mini chart */}
                  <div className="flex items-end gap-1.5 h-12">
                    {[30, 50, 40, 70, 55, 85, 65].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-neon-purple/80 via-neon-blue/60 to-cyan-400/40"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1.2 + i * 0.05, duration: 0.4 }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Metric cards */}
                <motion.div
                  className="grid grid-cols-2 gap-1.5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  <div className="p-2 rounded-lg bg-slate-700/60 border border-white/5">
                    <div className="text-[9px] text-white/50 mb-0.5">Impressions</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">12.4K</span>
                      <span className="text-[9px] text-green-400 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        +24%
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-700/60 border border-white/5">
                    <div className="text-[9px] text-white/50 mb-0.5">Clicks</div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">1.8K</span>
                      <span className="text-[9px] text-green-400 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" />
                        +18%
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  className="flex gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <button className="flex-1 text-[10px] py-2 px-3 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-neon-purple border border-neon-purple/30 font-medium">
                    View Campaign
                  </button>
                  <button className="text-[10px] py-2 px-3 rounded-lg bg-slate-700/50 text-white/60 font-medium">
                    Export
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Input area */}
          <div className="px-3 py-2 border-t border-white/5 bg-slate-900/30">
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-700/40 border border-white/5">
              <input
                type="text"
                placeholder="Ask about your content..."
                className="flex-1 bg-transparent text-xs text-white/70 placeholder:text-white/30 outline-none"
                disabled
              />
              <div className="w-6 h-6 rounded bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center">
                <Send className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
