import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, TrendingUp, Sparkles, Bot, Send } from 'lucide-react';

export const AIChatIllustration = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* Background glow */}
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative w-full max-w-md space-y-4 z-10">
        {/* Chat container */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-slate-900/50">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
              animate={{ boxShadow: ['0 0 15px rgba(155,135,245,0.3)', '0 0 25px rgba(155,135,245,0.5)', '0 0 15px rgba(155,135,245,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bot className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <span className="text-sm font-semibold text-white">AI Strategy Coach</span>
              <div className="flex items-center gap-1 mt-0.5">
                <motion.div
                  className="w-2 h-2 rounded-full bg-green-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] text-green-400">Online</span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* User message */}
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="max-w-[80%] p-3.5 rounded-2xl rounded-br-md bg-gradient-to-r from-neon-purple to-neon-blue">
                <p className="text-sm text-white font-medium">Show me my campaign performance</p>
              </div>
            </motion.div>

            {/* AI message with avatar */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div 
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center flex-shrink-0 border border-white/10"
                animate={{ boxShadow: ['0 0 10px rgba(155,135,245,0.2)', '0 0 20px rgba(155,135,245,0.4)', '0 0 10px rgba(155,135,245,0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-neon-purple" />
              </motion.div>
              <div className="flex-1 space-y-3">
                {/* Text response */}
                <div className="p-3.5 rounded-2xl rounded-bl-md bg-slate-700/60 border border-white/5">
                  <p className="text-sm text-white/90">
                    Here's your campaign performance with key metrics:
                  </p>
                  
                  {/* Typing indicator that fades */}
                  <motion.div
                    className="flex gap-1 mt-2"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 1, duration: 0.3 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-white/40"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Chart materializing from message */}
                <motion.div
                  className="p-4 rounded-xl bg-slate-700/60 border border-white/5"
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-neon-purple" />
                    <span className="text-xs font-medium text-white/70">Performance Chart</span>
                  </div>

                  {/* Premium mini chart */}
                  <div className="flex items-end gap-2 h-16">
                    {[30, 50, 40, 70, 55, 85, 65].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-neon-purple/80 via-neon-blue/60 to-cyan-400/40"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1.4 + i * 0.06, duration: 0.5 }}
                        style={{ boxShadow: '0 0 8px rgba(155,135,245,0.3)' }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Metric cards */}
                <motion.div
                  className="grid grid-cols-2 gap-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 }}
                >
                  <div className="p-3 rounded-xl bg-slate-700/60 border border-white/5">
                    <div className="text-[10px] text-white/50 mb-1">Impressions</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">12.4K</span>
                      <motion.span
                        className="text-[10px] text-green-400 flex items-center gap-0.5"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        +24%
                      </motion.span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-700/60 border border-white/5">
                    <div className="text-[10px] text-white/50 mb-1">Clicks</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">1.8K</span>
                      <motion.span
                        className="text-[10px] text-green-400 flex items-center gap-0.5"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        +18%
                      </motion.span>
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 }}
                >
                  <motion.button
                    className="flex-1 text-xs py-2.5 px-4 rounded-xl bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-neon-purple border border-neon-purple/30 font-medium"
                    whileHover={{ scale: 1.02, borderColor: 'rgba(155,135,245,0.5)' }}
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    View Campaign
                  </motion.button>
                  <button className="text-xs py-2.5 px-4 rounded-xl bg-slate-700/50 text-white/60 font-medium hover:bg-slate-700/70 transition-colors">
                    Export
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Input area */}
          <div className="px-4 py-3 border-t border-white/5 bg-slate-900/30">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-700/40 border border-white/5">
              <input
                type="text"
                placeholder="Ask about your content..."
                className="flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/30 outline-none"
                disabled
              />
              <motion.button
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <Send className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
