
import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const SerpLoadingState = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-white/5 to-white/0 rounded-xl border border-white/10 backdrop-blur-xl">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"
          />
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <Sparkles className="text-primary h-8 w-8" />
          </motion.div>
        </div>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue"
        >
          Analyzing search results...
        </motion.p>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-muted-foreground mt-2"
        >
          Extracting insights from top-ranking content
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 max-w-md w-full px-6"
        >
          <div className="space-y-4">
            <motion.div 
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-2 bg-primary/20 rounded-full overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </motion.div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Analyzing keywords</span>
              <span>Extracting insights</span>
              <span>Building recommendations</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
