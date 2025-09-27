import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface InlineProgressProps {
  workflowTitle?: string;
  currentStep?: number;
  totalSteps?: number;
  stepName?: string;
  progress?: number;
  isActive?: boolean;
}

export const InlineProgress: React.FC<InlineProgressProps> = ({
  workflowTitle = "Processing",
  currentStep = 0,
  totalSteps = 0,
  stepName,
  progress = 0,
  isActive = false
}) => {
  const isComplete = currentStep === totalSteps && totalSteps > 0;
  const displayProgress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : progress;

  if (!isActive && currentStep === 0 && totalSteps === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-3 p-3 bg-muted/30 rounded-lg border border-border/50"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={isActive ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "linear" }}
        >
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : isActive ? (
            <Loader2 className="w-4 h-4 text-primary" />
          ) : (
            <Clock className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-foreground">
              {workflowTitle}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalSteps > 0 ? `${currentStep}/${totalSteps}` : `${Math.round(displayProgress)}%`}
            </span>
          </div>
          
          <Progress value={displayProgress} className="h-1.5 mb-1" />
          
          {stepName && (
            <p className="text-xs text-muted-foreground truncate">
              {stepName}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};