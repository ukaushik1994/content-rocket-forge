import React from 'react';
import { motion } from 'framer-motion';
import { FileText, FolderOpen, CheckCircle2, ArrowRight, Sparkles, Star } from 'lucide-react';

export const ContentSuiteIllustration = () => {
  const builderSteps = ['Keywords', 'Outline', 'SERP', 'Write', 'Optimize'];
  
  return (
    <div className="relative w-full h-full flex items-center justify-center gap-6 px-4">
      {/* Flowing document animation */}
      <motion.div
        className="absolute z-20 w-8 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
        initial={{ x: -120, y: 0, opacity: 0, scale: 0.5 }}
        animate={{
          x: [-120, 0, 120],
          y: [0, -20, 0],
          opacity: [0, 1, 1, 1, 0],
          scale: [0.5, 1, 1, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
      >
        <FileText className="w-4 h-4 text-white" />
        {/* Particle trail */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-neon-purple/60"
            initial={{ x: 0, opacity: 0 }}
            animate={{
              x: [-10 - i * 8],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 4,
            }}
          />
        ))}
      </motion.div>

      {/* Builder Panel */}
      <motion.div
        className="relative w-40 h-56 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-4 flex flex-col overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent rounded-2xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <motion.div
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center"
            animate={{ boxShadow: ['0 0 15px rgba(155,135,245,0.3)', '0 0 25px rgba(155,135,245,0.5)', '0 0 15px rgba(155,135,245,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FileText className="w-4 h-4 text-white" />
          </motion.div>
          <span className="text-sm font-semibold text-white">Builder</span>
        </div>
        
        {/* Progress steps with celebration */}
        <div className="flex-1 space-y-2 relative z-10">
          {builderSteps.map((step, index) => (
            <motion.div
              key={step}
              className="flex items-center gap-3"
              initial={{ opacity: 0.3, x: -10 }}
              animate={{ opacity: index <= 2 ? 1 : 0.3, x: 0 }}
              transition={{ delay: 0.5 + index * 0.2, duration: 0.4 }}
            >
              <motion.div
                className={`relative w-5 h-5 rounded-full flex items-center justify-center ${
                  index <= 2 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-white/10 border border-white/20'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + index * 0.2, type: 'spring', stiffness: 400 }}
              >
                {index <= 2 && (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    {/* Celebration burst */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-green-400"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                    />
                  </>
                )}
              </motion.div>
              <span className={`text-xs font-medium ${index <= 2 ? 'text-white' : 'text-white/40'}`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Animated Arrow */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          animate={{ x: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight className="w-8 h-8 text-neon-purple" />
        </motion.div>
        {/* Glow */}
        <motion.div
          className="absolute inset-0 bg-neon-purple/30 rounded-full blur-lg"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      {/* Repository Panel */}
      <motion.div
        className="relative w-40 h-56 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-4 flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent rounded-2xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <motion.div
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"
            animate={{ boxShadow: ['0 0 15px rgba(30,174,219,0.3)', '0 0 25px rgba(30,174,219,0.5)', '0 0 15px rgba(30,174,219,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FolderOpen className="w-4 h-4 text-white" />
          </motion.div>
          <span className="text-sm font-semibold text-white">Repository</span>
        </div>
        
        {/* Document cards with versions */}
        <div className="flex-1 space-y-2.5 relative z-10">
          {[1, 2, 3].map((doc) => (
            <motion.div
              key={doc}
              className="h-12 rounded-xl bg-slate-700/50 border border-white/5 p-2.5 flex items-center justify-between hover:border-neon-blue/30 transition-colors"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + doc * 0.15 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-white/60" />
                </div>
                <div className="w-14 h-1.5 rounded bg-white/20" />
              </div>
              <motion.span
                className="text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 font-medium"
                animate={{ opacity: [0.6, 1, 0.6] }}
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
        className="relative"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
          <ArrowRight className="w-8 h-8 text-neon-purple" />
        </motion.div>
      </motion.div>

      {/* Approvals Panel */}
      <motion.div
        className="relative w-40 h-56 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-4 flex flex-col overflow-hidden"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 2 }}
        />
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <motion.div
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
            animate={{ boxShadow: ['0 0 15px rgba(74,222,128,0.3)', '0 0 25px rgba(74,222,128,0.5)', '0 0 15px rgba(74,222,128,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
          </motion.div>
          <span className="text-sm font-semibold text-white">Approvals</span>
        </div>
        
        {/* Approval items */}
        <div className="flex-1 space-y-2.5 relative z-10">
          {['Review', 'Approved', 'Published'].map((status, index) => (
            <motion.div
              key={status}
              className={`flex items-center gap-3 p-2 rounded-lg ${index < 2 ? 'bg-green-500/10' : 'bg-slate-700/30'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 + index * 0.25 }}
            >
              <motion.div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  index < 2 ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-white/10 border border-white/20'
                }`}
                animate={index < 2 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              >
                {index < 2 && <CheckCircle2 className="w-3 h-3 text-white" />}
              </motion.div>
              <span className={`text-xs font-medium ${index < 2 ? 'text-white' : 'text-white/40'}`}>
                {status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Quality score with ring */}
        <motion.div
          className="mt-auto pt-3 border-t border-white/5 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-white/60">Quality</span>
            </div>
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                92%
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
