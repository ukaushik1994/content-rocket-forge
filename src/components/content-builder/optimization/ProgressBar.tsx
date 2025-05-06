
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  appliedCount: number;
  totalCount: number;
  progressPercentage: number;
}

export const ProgressBar = ({ appliedCount, totalCount, progressPercentage }: ProgressBarProps) => {
  if (totalCount === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg p-4 shadow-sm"
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Optimization Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-green-500">{appliedCount}</span>
            <span className="mx-1">/</span>
            <span>{totalCount}</span> applied
          </span>
        </div>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-2 bg-muted" 
        aria-label={`${progressPercentage}% of optimizations applied`}
      />
      
      <div className="mt-1 flex justify-end">
        <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
      </div>
    </motion.div>
  );
};
