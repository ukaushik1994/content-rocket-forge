
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  appliedCount: number;
  totalCount: number;
  progressPercentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  appliedCount, 
  totalCount, 
  progressPercentage 
}) => {
  return (
    <div className="bg-white/50 border border-gray-100 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">Optimization Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{appliedCount}</span>
          <span className="text-sm text-muted-foreground">of</span>
          <span className="text-sm font-medium">{totalCount}</span>
          <span className="text-xs text-muted-foreground">optimizations applied</span>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="flex justify-end mt-1">
        <span className="text-xs text-muted-foreground">
          {progressPercentage}% complete
        </span>
      </div>
    </div>
  );
};
