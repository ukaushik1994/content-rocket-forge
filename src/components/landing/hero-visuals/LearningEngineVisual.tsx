import React from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, RefreshCw } from 'lucide-react';

export const LearningEngineVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="grid lg:grid-cols-[60%_40%] gap-8 min-h-[500px]"
    >
      {/* Left Side - Orbital Visual */}
      <div className="relative flex items-center justify-center">
        {/* Orbital dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-purple-500/40 blur-sm"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((i * Math.PI * 2) / 6) * 140 - 6,
              y: Math.sin((i * Math.PI * 2) / 6) * 140 - 6,
              rotate: 360,
            }}
            transition={{
              x: { duration: 12, repeat: Infinity, ease: "linear" },
              y: { duration: 12, repeat: Infinity, ease: "linear" },
              rotate: { duration: 12, repeat: Infinity, ease: "linear" },
            }}
          />
        ))}

        {/* Central Brain Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 15 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-600/30 rounded-full blur-2xl" />
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/40"
          >
            <Brain className="h-16 w-16 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Content Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-50" />
        <div className="relative bg-card/60 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 shadow-2xl h-full flex flex-col">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-4 w-fit"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            SELF-LEARNING
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-2xl font-bold text-white mb-3"
          >
            Self-Learning Intelligence Engine
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-gray-300 leading-relaxed mb-6"
          >
            Creates content, tracks performance, and automatically improves based on what works for YOUR audience.
          </motion.p>

          {/* Feature List */}
          <div className="space-y-3 mb-6 flex-1">
            {[
              'Learns from YOUR performance data',
              'Improves content quality over time',
              'Adapts to YOUR audience preferences',
              'Personalizes strategy automatically'
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-300"
              >
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all w-full justify-center"
          >
            Try This Feature
            <span>→</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
