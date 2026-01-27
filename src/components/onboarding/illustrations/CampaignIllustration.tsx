import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Clock, CheckCircle2, Loader2, FileText } from 'lucide-react';

export const CampaignIllustration = () => {
  const queueItems = [
    { title: 'Blog Post', status: 'complete' },
    { title: 'LinkedIn', status: 'processing' },
    { title: 'Twitter Thread', status: 'pending' },
    { title: 'Email Draft', status: 'pending' },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        {/* Campaign Card */}
        <motion.div
          className="rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center flex-shrink-0"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Rocket className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">Product Launch Campaign</div>
              <div className="text-xs text-white/50 mt-0.5">AI-generated strategy</div>
              <div className="flex gap-2 mt-2">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple">
                  8 assets
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  In Progress
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-white/50">Generation Progress</span>
              <span className="text-neon-purple">25%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
                initial={{ width: 0 }}
                animate={{ width: '25%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Content Queue */}
        <motion.div
          className="rounded-xl bg-slate-800/80 border border-white/10 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-neon-blue" />
            <span className="text-xs font-medium text-white/80">Content Queue</span>
          </div>

          <div className="space-y-2">
            {queueItems.map((item, index) => (
              <motion.div
                key={item.title}
                className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/40"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.15 }}
              >
                <FileText className="w-4 h-4 text-white/40" />
                <span className="flex-1 text-[11px] text-white/70">{item.title}</span>
                
                {item.status === 'complete' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + index * 0.15, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </motion.div>
                )}
                {item.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-4 h-4 text-neon-blue" />
                  </motion.div>
                )}
                {item.status === 'pending' && (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Asset Preview */}
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[1, 2, 3].map((_, index) => (
            <motion.div
              key={index}
              className="flex-1 h-16 rounded-lg bg-slate-800/60 border border-white/5 flex items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + index * 0.1 }}
              whileHover={{ y: -3, borderColor: 'rgba(155, 135, 245, 0.3)' }}
            >
              <div className="w-8 h-1 rounded bg-white/20" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
