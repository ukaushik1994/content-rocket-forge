import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, PlayCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface WorkflowProgressIndicatorProps {
  workflowTitle: string;
  steps: WorkflowStep[];
  currentStep?: string;
  progress?: number;
  className?: string;
}

export const WorkflowProgressIndicator: React.FC<WorkflowProgressIndicatorProps> = ({
  workflowTitle,
  steps,
  currentStep,
  progress,
  className
}) => {
  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'active':
        return PlayCircle;
      case 'error':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'active':
        return 'text-primary';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const calculatedProgress = progress ?? (completedSteps / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full', className)}
    >
      <Card className="glass-panel bg-glass border border-white/10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {workflowTitle}
            </h3>
            <p className="text-sm text-muted-foreground">
              {completedSteps} of {steps.length} steps completed
            </p>
          </div>
          
          <Badge 
            variant="secondary" 
            className="bg-primary/20 text-primary border-primary/30"
          >
            {Math.round(calculatedProgress)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary font-medium">{Math.round(calculatedProgress)}%</span>
          </div>
          
          <div className="relative">
            <Progress value={calculatedProgress} className="h-3" />
            <motion.div
              className="absolute top-0 h-3 bg-gradient-to-r from-primary/50 to-primary/30 rounded-full blur-sm"
              initial={{ width: 0 }}
              animate={{ width: `${calculatedProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step.status);
            const isActive = currentStep === step.id;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  'border border-transparent',
                  isActive && 'bg-primary/5 border-primary/20',
                  step.status === 'completed' && 'bg-success/5',
                  step.status === 'error' && 'bg-destructive/5'
                )}
              >
                <motion.div
                  className={cn(
                    'p-2 rounded-full border',
                    step.status === 'completed' && 'bg-success/20 border-success/30',
                    step.status === 'active' && 'bg-primary/20 border-primary/30',
                    step.status === 'error' && 'bg-destructive/20 border-destructive/30',
                    step.status === 'pending' && 'bg-muted/20 border-muted/30'
                  )}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className={cn('w-4 h-4', getStepColor(step.status))} />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'font-medium text-sm',
                    step.status === 'completed' && 'text-success',
                    step.status === 'active' && 'text-primary',
                    step.status === 'error' && 'text-destructive',
                    step.status === 'pending' && 'text-muted-foreground'
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
                
                {step.status === 'active' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
};