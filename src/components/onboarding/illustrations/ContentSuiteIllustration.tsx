import React from 'react';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export const ContentSuiteIllustration = () => {
  const builderSteps = ['Keywords', 'Outline', 'SERP', 'Write', 'Optimize'];
  
  return (
    <div className="relative w-full h-full flex items-center justify-center gap-4 px-4">
      {/* Builder Panel */}
      <motion.div
        className="relative w-32 h-48 rounded-xl bg-slate-800/80 border border-white/10 p-3 flex flex-col"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-neon-purple" />
          <span className="text-xs font-medium text-white/80">Builder</span>
        </div>
        
        {/* Progress steps */}
        <div className="flex-1 space-y-1.5">
          {builderSteps.map((step, index) => (
            <motion.div
              key={step}
              className="flex items-center gap-2"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: index <= 2 ? 1 : 0.3 }}
              transition={{ delay: 0.5 + index * 0.3, duration: 0.5 }}
            >
              <motion.div
                className={`w-3 h-3 rounded-full flex items-center justify-center ${
                  index <= 2 ? 'bg-green-500' : 'bg-white/20'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: index <= 2 ? 1 : 0.8 }}
                transition={{ delay: 0.5 + index * 0.3 }}
              >
                {index <= 2 && <CheckCircle2 className="w-2 h-2 text-white" />}
              </motion.div>
              <span className={`text-[10px] ${index <= 2 ? 'text-white' : 'text-white/40'}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <ArrowRight className="w-5 h-5 text-neon-purple/60" />
      </motion.div>

      {/* Repository Panel */}
      <motion.div
        className="relative w-32 h-48 rounded-xl bg-slate-800/80 border border-white/10 p-3 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <FolderOpen className="w-4 h-4 text-neon-blue" />
          <span className="text-xs font-medium text-white/80">Repository</span>
        </div>
        
        {/* Document cards with versions */}
        <div className="flex-1 space-y-2">
          {[1, 2, 3].map((doc) => (
            <motion.div
              key={doc}
              className="h-10 rounded-lg bg-slate-700/60 border border-white/5 p-2 flex items-center justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + doc * 0.2 }}
            >
              <div className="w-12 h-1.5 rounded bg-white/20" />
              <motion.span
                className="text-[8px] px-1.5 py-0.5 rounded bg-neon-blue/20 text-neon-blue"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: doc * 0.3 }}
              >
                v{doc}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        <ArrowRight className="w-5 h-5 text-neon-purple/60" />
      </motion.div>

      {/* Approvals Panel */}
      <motion.div
        className="relative w-32 h-48 rounded-xl bg-slate-800/80 border border-white/10 p-3 flex flex-col"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-xs font-medium text-white/80">Approvals</span>
        </div>
        
        {/* Approval items */}
        <div className="flex-1 space-y-2">
          {['Review', 'Approved', 'Published'].map((status, index) => (
            <motion.div
              key={status}
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 + index * 0.3 }}
            >
              <motion.div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  index < 2 ? 'bg-green-500' : 'bg-white/20'
                }`}
                animate={index < 2 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.5 }}
              >
                {index < 2 && <CheckCircle2 className="w-3 h-3 text-white" />}
              </motion.div>
              <span className={`text-[10px] ${index < 2 ? 'text-white' : 'text-white/40'}`}>
                {status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Quality score */}
        <motion.div
          className="mt-auto pt-2 border-t border-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/50">Quality</span>
            <motion.span
              className="text-sm font-bold text-green-400"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              92%
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
