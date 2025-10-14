import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export const LearningEngineVisual = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="min-h-[500px] flex items-center justify-center"
    >
      <div className="relative w-full max-w-2xl mx-auto flex items-center justify-center">
        {/* Orbiting dots */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-purple-400/30"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((i * Math.PI * 2) / 6) * 160 - 6,
              y: Math.sin((i * Math.PI * 2) / 6) * 160 - 6,
              rotate: 360,
            }}
            transition={{
              x: { duration: 15, repeat: Infinity, ease: "linear" },
              y: { duration: 15, repeat: Infinity, ease: "linear" },
              rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            }}
          />
        ))}

        {/* Central Brain */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 15 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/40"
          >
            <Brain className="h-20 w-20 text-white" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};
