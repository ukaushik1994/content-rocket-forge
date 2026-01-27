import React from 'react';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, CheckCircle2, ArrowRight, Sparkles, Star } from 'lucide-react';

export const ContentSuiteIllustration = () => {
  const builderSteps = ['Keywords', 'Outline', 'SERP', 'Write', 'Optimize'];
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="flex items-center gap-3 scale-90">
        {/* Builder Panel */}
        <motion.div
          className="relative w-32 h-48 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-3 flex flex-col overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-white">Builder</span>
          </div>
          
          <div className="flex-1 space-y-1.5 relative z-10">
            {builderSteps.map((step, index) => (
              <motion.div
                key={step}
                className="flex items-center gap-2"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index <= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  index <= 2 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-white/10 border border-white/20'
                }`}>
                  {index <= 2 && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`text-[10px] font-medium ${index <= 2 ? 'text-white' : 'text-white/40'}`}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight className="w-5 h-5 text-neon-purple" />
        </motion.div>

        {/* Repository Panel */}
        <motion.div
          className="relative w-32 h-48 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-3 flex flex-col overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent rounded-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <FolderOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-white">Repository</span>
          </div>
          
          <div className="flex-1 space-y-2 relative z-10">
            {[1, 2, 3].map((doc) => (
              <motion.div
                key={doc}
                className="h-10 rounded-lg bg-slate-700/50 border border-white/5 p-2 flex items-center justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + doc * 0.1 }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-slate-600 flex items-center justify-center">
                    <FileText className="w-2.5 h-2.5 text-white/60" />
                  </div>
                  <div className="w-10 h-1 rounded bg-white/20" />
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium">
                  v{doc}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        >
          <ArrowRight className="w-5 h-5 text-neon-purple" />
        </motion.div>

        {/* Approvals Panel */}
        <motion.div
          className="relative w-32 h-48 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-3 flex flex-col overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-xl"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
          />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-semibold text-white">Approvals</span>
          </div>
          
          <div className="flex-1 space-y-2 relative z-10">
            {['Review', 'Approved', 'Published'].map((status, index) => (
              <div
                key={status}
                className={`flex items-center gap-2 p-1.5 rounded-lg ${index < 2 ? 'bg-green-500/10' : 'bg-slate-700/30'}`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  index < 2 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-white/10 border border-white/20'
                }`}>
                  {index < 2 && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </div>
                <span className={`text-[10px] font-medium ${index < 2 ? 'text-white' : 'text-white/40'}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-2 border-t border-white/5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] text-white/60">Quality</span>
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                92%
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
