
import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContentTemplatesHeaderProps {
  className?: string;
}

export const ContentTemplatesHeader: React.FC<ContentTemplatesHeaderProps> = ({
  className
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-xl font-medium text-gradient">Content Templates</h3>
        </div>
        <div>
          <span className="text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Based on SERP analysis
          </span>
        </div>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground"
      >
        Generate content templates optimized for search rankings based on your SERP analysis.
      </motion.p>
    </>
  );
};
