
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center mb-8">
      <div className="relative">
        {/* Outer spinning circle */}
        <motion.div 
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
        />
        
        {/* Middle spinning circle */}
        <motion.div 
          className="absolute inset-1 rounded-full border-t-2 border-l-2 border-blue-400/60"
          animate={{ rotate: -360 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />
        
        {/* Inner spinner */}
        <motion.div 
          className="h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md border border-white/10 shadow-xl"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Search className="text-primary h-8 w-8" />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Animated sparkles */}
      <motion.div
        className="absolute"
        animate={{ 
          opacity: [0.4, 1, 0.4],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
        }}
      >
        <Sparkles className="absolute top-0 right-0 translate-x-8 -translate-y-4 text-primary h-6 w-6 transform rotate-12" />
        <Sparkles className="absolute bottom-0 left-0 -translate-x-8 translate-y-4 text-blue-400 h-6 w-6 transform -rotate-12" />
      </motion.div>
    </div>
  );
};
