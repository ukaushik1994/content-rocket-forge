import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, TrendingUp, Search, Brain, FileText, Zap, Target, AlertTriangle } from 'lucide-react';
import { useProgressPolling } from '@/hooks/useProgressPolling';

export interface EnhancedGenerationStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress?: number;
  metrics?: {
    keywordsFound?: number;
    serpDataPoints?: number;
    proposalsGenerated?: number;
    totalVolume?: number;
  };
}

interface EnhancedStrategyGenerationModalProps {
  open: boolean;
  sessionId: string;
  onComplete?: (data?: any) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

const STEP_DEFINITIONS: Omit<EnhancedGenerationStep, 'status' | 'progress' | 'metrics'>[] = [
  {
    id: 'initialization',
    label: 'Initializing Strategy Engine',
    description: 'Setting up AI models and preparing analysis framework',
    icon: <Sparkles className="h-5 w-5" />,
    estimatedTime: '5-10s'
  },
  {
    id: 'keyword_research',
    label: 'Keyword Discovery & Analysis',
    description: 'Finding high-opportunity keywords based on your goals',
    icon: <Search className="h-5 w-5" />,
    estimatedTime: '15-20s'
  },
  {
    id: 'serp_analysis',
    label: 'SERP Intelligence Gathering',
    description: 'Analyzing search results and competitor landscapes',
    icon: <TrendingUp className="h-5 w-5" />,
    estimatedTime: '20-30s'
  },
  {
    id: 'ai_processing',
    label: 'AI Strategy Generation',
    description: 'Processing data through advanced AI models',
    icon: <Brain className="h-5 w-5" />,
    estimatedTime: '10-15s'
  },
  {
    id: 'content_planning',
    label: 'Content Strategy Planning',
    description: 'Creating content recommendations and roadmaps',
    icon: <FileText className="h-5 w-5" />,
    estimatedTime: '8-12s'
  },
  {
    id: 'optimization',
    label: 'Strategy Optimization',
    description: 'Fine-tuning proposals for maximum impact',
    icon: <Target className="h-5 w-5" />,
    estimatedTime: '5-8s'
  },
  {
    id: 'finalization',
    label: 'Finalizing Proposals',
    description: 'Preparing comprehensive strategy proposals',
    icon: <Zap className="h-5 w-5" />,
    estimatedTime: '3-5s'
  }
];

export function EnhancedStrategyGenerationModal({ 
  open, 
  sessionId, 
  onComplete, 
  onCancel, 
  onError 
}: EnhancedStrategyGenerationModalProps) {
  const [steps, setSteps] = useState<EnhancedGenerationStep[]>(
    STEP_DEFINITIONS.map(step => ({ ...step, status: 'pending' }))
  );
  const [totalProgress, setTotalProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState('60-90 seconds');
  const [error, setError] = useState<string | null>(null);

  const { 
    steps: pollingSteps, 
    currentStep, 
    isPolling, 
    startPolling 
  } = useProgressPolling({
    sessionId,
    onComplete: (data) => {
      setTotalProgress(100);
      setTimeout(() => onComplete?.(data), 1000);
    },
    onError: (errorMsg) => {
      setError(errorMsg);
      onError?.(errorMsg);
    },
    pollInterval: 1500
  });

  // Start polling when modal opens
  useEffect(() => {
    if (open && sessionId && !isPolling) {
      startPolling();
    }
  }, [open, sessionId]);

  // Update steps based on polling data
  useEffect(() => {
    if (pollingSteps.length > 0) {
      setSteps(prevSteps => {
        return prevSteps.map((step, index) => {
          const pollingStep = pollingSteps.find(ps => ps.step === index);
          if (pollingStep) {
            return {
              ...step,
              status: pollingStep.status === 'error' ? 'error' : 
                     pollingStep.status === 'completed' ? 'completed' :
                     pollingStep.status === 'active' ? 'active' : 'pending',
              progress: pollingStep.progressPercentage,
              metrics: pollingStep.stepData?.metrics
            };
          }
          return step;
        });
      });

      // Calculate total progress
      const completedSteps = pollingSteps.filter(s => s.status === 'completed').length;
      const activeStep = pollingSteps.find(s => s.status === 'active');
      const activeProgress = activeStep ? activeStep.progressPercentage / 100 : 0;
      const progress = ((completedSteps + activeProgress) / STEP_DEFINITIONS.length) * 100;
      setTotalProgress(Math.min(progress, 95)); // Cap at 95% until truly complete
      
      // Update time estimate
      const remainingSteps = STEP_DEFINITIONS.length - completedSteps;
      if (remainingSteps <= 1) {
        setEstimatedTimeRemaining('Almost done...');
      } else if (remainingSteps <= 3) {
        setEstimatedTimeRemaining('15-25 seconds');
      } else {
        setEstimatedTimeRemaining('30-45 seconds');
      }
    }
  }, [pollingSteps]);

  if (error) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
              className="relative w-full max-w-2xl mx-4 rounded-xl border border-destructive/20 bg-card shadow-xl overflow-hidden"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
            >
              <div className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generation Failed</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button 
                  onClick={onCancel}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
          <motion.div
            className="relative w-full max-w-4xl mx-4 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-blue-500/5">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">Generating AI Content Strategy</div>
                  <div className="text-sm text-muted-foreground">
                    Creating personalized content proposals based on your goals and market analysis
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</div>
                  <div className="text-xs text-muted-foreground">
                    Est. {estimatedTimeRemaining}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-blue-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${
                      step.status === 'active' 
                        ? 'border-primary/20 bg-primary/5' 
                        : step.status === 'completed'
                        ? 'border-green-500/20 bg-green-500/5'
                        : step.status === 'error'
                        ? 'border-destructive/20 bg-destructive/5'
                        : 'border-border bg-muted/20'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {step.status === 'completed' ? (
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        </motion.div>
                      ) : step.status === 'active' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="h-6 w-6 text-primary" />
                        </motion.div>
                      ) : step.status === 'error' ? (
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                          {step.icon}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className={`font-medium ${step.status === 'active' ? 'text-primary' : ''}`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {step.estimatedTime}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </div>
                      
                      {/* Progress bar for active step */}
                      {step.status === 'active' && step.progress !== undefined && (
                        <div className="mb-2">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: '0%' }}
                              animate={{ width: `${step.progress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Metrics */}
                      {step.metrics && (
                        <div className="flex gap-4 text-xs">
                          {step.metrics.keywordsFound && (
                            <span className="text-blue-600">
                              {step.metrics.keywordsFound} keywords found
                            </span>
                          )}
                          {step.metrics.serpDataPoints && (
                            <span className="text-green-600">
                              {step.metrics.serpDataPoints} SERP insights
                            </span>
                          )}
                          {step.metrics.proposalsGenerated && (
                            <span className="text-purple-600">
                              {step.metrics.proposalsGenerated} proposals ready
                            </span>
                          )}
                          {step.metrics.totalVolume && (
                            <span className="text-orange-600">
                              {step.metrics.totalVolume.toLocaleString()} search volume
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            {onCancel && (
              <div className="p-4 border-t border-border bg-muted/20 flex justify-end">
                <button 
                  onClick={onCancel} 
                  className="text-sm px-4 py-2 rounded-md border border-border text-foreground/80 hover:bg-muted transition-colors"
                >
                  Cancel Generation
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}