
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export function SerpEmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue/50 flex items-center justify-center mb-4 animate-pulse">
          <Search className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
          No Analysis Data Yet
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter a keyword and click "Analyze" to get search insights and content recommendations.
        </p>
      </div>
    </motion.div>
  );
}
