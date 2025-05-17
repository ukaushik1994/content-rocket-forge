
import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptySelectionState = () => {
  return (
    <motion.div 
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-8 text-muted-foreground flex flex-col items-center"
    >
      <span className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 flex items-center justify-center mb-3">
        <Search className="h-6 w-6 text-white/40" />
      </span>
      <p className="text-sm font-medium text-white/70">
        No items selected yet
      </p>
      <p className="text-xs mt-2 text-white/50 max-w-[200px]">
        Select keywords, questions, and snippets from the search results to generate your content outline
      </p>
    </motion.div>
  );
};
