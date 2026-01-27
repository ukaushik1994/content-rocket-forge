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
    <div className="relative w-full h-full max-h-full flex items-center justify-center px-2 overflow-hidden">
      {/* Background rocket trail */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative w-full max-w-md space-y-3 z-10 scale-[0.9]">
        {/* Campaign Card */}
        <motion.div
          className="relative rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 bg-[length:200%_100%]"
            animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[1px] rounded-xl bg-gradient-to-br from-slate-800 to-slate-900" />
          
          <div className="relative p-4">
            <div className="flex items-start gap-3">
              <motion.div
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Rocket className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white">Product Launch Campaign</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">AI-generated strategy • Multi-channel</div>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-medium">
                    8 assets
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                    In Progress
                  </span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-white/60">Generation Progress</span>
                <span className="font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  25%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 bg-[length:200%_100%]"
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Queue */}
        <motion.div
          className="rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-3 overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
              animate={{ boxShadow: ['0 0 15px rgba(30,174,219,0.4)', '0 0 25px rgba(30,174,219,0.6)', '0 0 15px rgba(30,174,219,0.4)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Clock className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <span className="text-xs font-semibold text-white">Content Queue</span>
              <div className="flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[9px] text-amber-400">Real-time updates</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            {queueItems.map((item, index) => (
              <motion.div
                key={item.title}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  item.status === 'complete' ? 'bg-green-500/10' :
                  item.status === 'processing' ? 'bg-cyan-500/10' : 'bg-slate-700/40'
                }`}
                style={{
                  borderLeft: item.status === 'complete' ? '2px solid rgb(74,222,128)' :
                              item.status === 'processing' ? '2px solid rgb(30,174,219)' : '2px solid transparent'
                }}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="w-6 h-6 rounded bg-slate-700/60 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-white/50" />
                </div>
                <span className="flex-1 text-xs text-white/80 font-medium">{item.title}</span>
                
                {item.status === 'complete' && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
                {item.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                )}
                {item.status === 'pending' && (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Asset Preview Cards */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={index}
              className="flex-1 h-14 rounded-lg bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.08 }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-1 rounded bg-white/20" />
                <div className="w-4 h-0.5 rounded bg-white/10" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
