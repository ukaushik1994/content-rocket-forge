
import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const InitialStateView = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key="initial-state"
    >
      <div className="rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 p-6 mb-4">
        <Sparkles className="h-8 w-8 text-neon-purple" />
      </div>
      <h3 className="text-xl font-medium mb-2">Search to analyze your keyword</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Enter your main keyword above to see search insights, 
        related keywords, and content suggestions from top-ranking pages
      </p>
    </motion.div>
  );
};
