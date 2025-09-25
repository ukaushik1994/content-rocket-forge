import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  AlertCircle, 
  Zap, 
  Brain, 
  Target,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration?: number;
  result?: any;
}

interface WorkflowStreamingProgressProps {
  workflowTitle: string;
  steps: WorkflowStep[];
  currentStep?: string;
  progress?: number;
  isStreaming?: boolean;
  estimatedDuration?: number;
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

export const WorkflowStreamingProgress: React.FC<WorkflowStreamingProgressProps> = ({
  workflowTitle,
  steps,
  currentStep,
  progress,
  isStreaming = false,
  estimatedDuration,
  onCancel,
  onRetry,
  className
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [animatingSteps, setAnimatingSteps] = useState<Set<string>>(new Set());

  // Real-time timer
  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Animate step transitions
  useEffect(() => {
    if (currentStep) {
      setAnimatingSteps(prev => new Set([...prev, currentStep]));
      
      // Remove animation after delay
      setTimeout(() => {
        setAnimatingSteps(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentStep);
          return newSet;
        });
      }, 1000);
    }
  }, [currentStep]);

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

  const getStepBgColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 border-success/30';
      case 'active':
        return 'bg-primary/20 border-primary/30';
      case 'error':
        return 'bg-destructive/20 border-destructive/30';
      default:
        return 'bg-muted/20 border-muted/30';
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const calculatedProgress = progress ?? (completedSteps / totalSteps) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasError = steps.some(step => step.status === 'error');
  const isCompleted = completedSteps === totalSteps && !isStreaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('w-full', className)}
    >
      <Card className="glass-panel bg-glass border border-white/10 p-6 overflow-hidden relative">
        {/* Animated background */}
        <div className="absolute inset-0 bg-grid opacity-5" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10"
          animate={{
            opacity: isStreaming ? [0.3, 0.6, 0.3] : 0.1,
          }}
          transition={{
            duration: 3,
            repeat: isStreaming ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                className={cn(
                  "p-3 rounded-xl border",
                  isCompleted ? "bg-success/20 border-success/30" :
                  hasError ? "bg-destructive/20 border-destructive/30" :
                  "bg-primary/20 border-primary/30"
                )}
                animate={isStreaming ? { 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={{ 
                  duration: 2, 
                  repeat: isStreaming ? Infinity : 0,
                  ease: "easeInOut" 
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : hasError ? (
                  <AlertCircle className="w-6 h-6 text-destructive" />
                ) : isStreaming ? (
                  <Brain className="w-6 h-6 text-primary" />
                ) : (
                  <Target className="w-6 h-6 text-primary" />
                )}
              </motion.div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {workflowTitle}
                  {isStreaming && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span>{completedSteps} of {totalSteps} steps completed</span>
                  {isStreaming && (
                    <>
                      <span>•</span>
                      <span>Elapsed: {formatTime(elapsedTime)}</span>
                      {estimatedDuration && (
                        <>
                          <span>•</span>
                          <span>Est: {formatTime(estimatedDuration)}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "px-3 py-1 text-sm font-medium",
                  isCompleted ? "bg-success/20 text-success border-success/30" :
                  hasError ? "bg-destructive/20 text-destructive border-destructive/30" :
                  "bg-primary/20 text-primary border-primary/30"
                )}
              >
                {Math.round(calculatedProgress)}%
              </Badge>
              
              {hasError && onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Retry
                </Button>
              )}
              
              {isStreaming && onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-primary font-medium">{Math.round(calculatedProgress)}%</span>
            </div>
            
            <div className="relative">
              <Progress value={calculatedProgress} className="h-3" />
              
              {/* Animated progress glow */}
              <motion.div
                className="absolute top-0 h-3 bg-gradient-to-r from-primary/50 to-secondary/30 rounded-full blur-sm"
                initial={{ width: 0 }}
                animate={{ width: `${calculatedProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
              
              {/* Streaming effect */}
              {isStreaming && (
                <motion.div
                  className="absolute top-0 h-3 w-20 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full"
                  animate={{
                    x: [-80, 300],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </div>
          </div>

          {/* Enhanced Steps */}
          <div className="space-y-3">
            <AnimatePresence>
              {steps.map((step, index) => {
                const Icon = getStepIcon(step.status);
                const isActive = currentStep === step.id;
                const isAnimating = animatingSteps.has(step.id);
                
                return (
                  <motion.div
                    key={step.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ 
                      delay: index * 0.1,
                      layout: { duration: 0.3 }
                    }}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-lg transition-all duration-300 border',
                      'group hover:shadow-lg',
                      isActive && 'bg-primary/5 border-primary/20 shadow-neon',
                      step.status === 'completed' && 'bg-success/5 border-success/20',
                      step.status === 'error' && 'bg-destructive/5 border-destructive/20',
                      !isActive && step.status === 'pending' && 'bg-transparent border-transparent hover:bg-muted/5 hover:border-muted/10'
                    )}
                  >
                    {/* Connection line to next step */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-7 top-12 w-0.5 h-6 bg-gradient-to-b from-border to-transparent" />
                    )}
                    
                    {/* Step icon with enhanced animations */}
                    <motion.div
                      className={cn(
                        'relative p-3 rounded-full border z-10',
                        getStepBgColor(step.status)
                      )}
                      animate={isAnimating ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      } : {}}
                      transition={{ 
                        duration: 0.6,
                        ease: "easeInOut"
                      }}
                    >
                      <Icon className={cn('w-5 h-5', getStepColor(step.status))} />
                      
                      {/* Pulse effect for active step */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary/30"
                          animate={{
                            scale: [1, 1.5],
                            opacity: [0.5, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                        />
                      )}
                    </motion.div>
                    
                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn(
                          'font-medium text-sm transition-colors duration-200',
                          step.status === 'completed' && 'text-success',
                          step.status === 'active' && 'text-primary',
                          step.status === 'error' && 'text-destructive',
                          step.status === 'pending' && 'text-muted-foreground'
                        )}>
                          {step.title}
                        </p>
                        
                        {step.duration && (
                          <Badge variant="outline" className="text-xs">
                            {step.duration}ms
                          </Badge>
                        )}
                      </div>
                      
                      {step.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      )}
                      
                      {step.result && step.status === 'completed' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 text-xs text-success/80"
                        >
                          ✓ {typeof step.result === 'string' ? step.result : 'Completed successfully'}
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Active step indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-4 h-4 text-primary" />
                        </motion.div>
                        <ArrowRight className="w-3 h-3 text-primary" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Status footer */}
          {(isCompleted || hasError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-4 border-t border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-success font-medium">Workflow completed successfully</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="text-destructive font-medium">Workflow failed</span>
                    </>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Total time: {formatTime(elapsedTime)}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};