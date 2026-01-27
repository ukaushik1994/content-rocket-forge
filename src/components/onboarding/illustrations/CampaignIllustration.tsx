import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Clock, CheckCircle2, Loader2, FileText, Sparkles, Zap } from 'lucide-react';

export const CampaignIllustration = () => {
  const queueItems = [
    { title: 'Blog Post', status: 'complete' },
    { title: 'LinkedIn Article', status: 'processing' },
    { title: 'Twitter Thread', status: 'pending' },
    { title: 'Email Draft', status: 'pending' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* Background rocket trail */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative w-full max-w-lg space-y-5 z-10">
        {/* Campaign Card - Premium */}
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-[length:200%_100%]"
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900" />
          
          <div className="relative p-5">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ['0 0 25px rgba(244,63,94,0.4)', '0 0 45px rgba(244,63,94,0.6)', '0 0 25px rgba(244,63,94,0.4)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Rocket className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-white">Product Launch Campaign</span>
                  <motion.div
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </motion.div>
                </div>
                <div className="text-xs text-white/50 mt-1">AI-generated strategy • Multi-channel</div>
                <div className="flex gap-2 mt-3">
                  <motion.span 
                    className="text-xs px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    8 assets
                  </motion.span>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                    In Progress
                  </span>
                </div>
              </div>
            </div>

            {/* Premium progress bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/60">Generation Progress</span>
                <motion.span 
                  className="font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  25%
                </motion.span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-700/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 bg-[length:200%_100%]"
                  initial={{ width: 0 }}
                  animate={{ width: '25%', backgroundPosition: ['0% 0%', '100% 0%'] }}
                  transition={{ 
                    width: { duration: 1.5, delay: 0.5 },
                    backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                  }}
                  style={{ boxShadow: '0 0 20px rgba(244,63,94,0.5)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Queue - Enhanced */}
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-5 overflow-hidden"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 20px rgba(30,174,219,0.4)', '0 0 35px rgba(30,174,219,0.6)', '0 0 20px rgba(30,174,219,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Clock className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <span className="text-sm font-semibold text-white">Content Queue</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-amber-400">Real-time updates</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            {queueItems.map((item, index) => (
              <motion.div
                key={item.title}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  item.status === 'complete' ? 'bg-green-500/10' :
                  item.status === 'processing' ? 'bg-cyan-500/10' : 'bg-slate-700/40'
                }`}
                style={{
                  borderLeft: item.status === 'complete' ? '3px solid rgb(74,222,128)' :
                              item.status === 'processing' ? '3px solid rgb(30,174,219)' : '3px solid transparent'
                }}
                initial={{ opacity: 0, x: -25 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.12 }}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white/50" />
                </div>
                <span className="flex-1 text-sm text-white/80 font-medium">{item.title}</span>
                
                {item.status === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.15, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </motion.div>
                )}
                {item.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                )}
                {item.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Asset Preview Cards */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={index}
              className="flex-1 h-20 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 flex items-center justify-center overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + index * 0.1 }}
              whileHover={{ y: -5, borderColor: 'rgba(244,63,94,0.4)' }}
            >
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
              >
                <div className="w-8 h-1.5 rounded bg-white/20" />
                <div className="w-5 h-1 rounded bg-white/10" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
