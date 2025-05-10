
import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyState: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12 bg-gradient-to-b from-white/5 to-transparent rounded-xl border border-white/10"
    >
      <Sparkles className="h-16 w-16 text-primary/30 mx-auto" />
      <p className="mt-6 text-lg">Run a SERP analysis first to generate content</p>
      <p className="text-muted-foreground mt-2">Templates will be created based on search results</p>
    </motion.div>
  );
};
