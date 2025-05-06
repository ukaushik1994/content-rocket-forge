
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  appliedCount: number;
  totalCount: number;
  progressPercentage: number;
}

export const ProgressBar = ({ appliedCount, totalCount, progressPercentage }: ProgressBarProps) => {
  if (totalCount === 0) return null;
  
  return (
    <div className="mt-4 pt-4 border-t border-purple-500/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Optimizations Applied</span>
        <span className="text-xs font-medium">{appliedCount}/{totalCount}</span>
      </div>
      <div className="h-1.5 w-full bg-purple-900/20 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
          style={{ width: `${progressPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};
