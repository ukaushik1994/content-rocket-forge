import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
}

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  onAnalysisComplete?: () => void;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  isAnalyzing,
  onAnalysisComplete
}) => {
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: 'content', name: 'Content Quality Analysis', status: 'pending', progress: 0 },
    { id: 'ai', name: 'AI Detection', status: 'pending', progress: 0 },
    { id: 'serp', name: 'SERP Integration', status: 'pending', progress: 0 },
    { id: 'solution', name: 'Solution Analysis', status: 'pending', progress: 0 },
    { id: 'quality', name: 'Quality Checks', status: 'pending', progress: 0 }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      // Reset all steps
      setAnalysisSteps(steps => steps.map(step => ({
        ...step,
        status: 'pending',
        progress: 0
      })));
      setCurrentStepIndex(0);
      setOverallProgress(0);
      return;
    }

    // Simulate progressive analysis
    let stepIndex = 0;
    const totalSteps = analysisSteps.length;
    
    const runNextStep = () => {
      if (stepIndex >= totalSteps) {
        setOverallProgress(100);
        onAnalysisComplete?.();
        return;
      }

      // Mark current step as running
      setAnalysisSteps(prev => prev.map((step, idx) => ({
        ...step,
        status: idx === stepIndex ? 'running' : idx < stepIndex ? 'completed' : 'pending',
        progress: idx === stepIndex ? 0 : idx < stepIndex ? 100 : 0
      })));

      setCurrentStepIndex(stepIndex);

      // Simulate step progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Mark step as completed
          setAnalysisSteps(prev => prev.map((step, idx) => ({
            ...step,
            status: idx === stepIndex ? 'completed' : step.status,
            progress: idx === stepIndex ? 100 : step.progress
          })));

          // Update overall progress
          const newOverallProgress = Math.min(((stepIndex + 1) / totalSteps) * 100, 100);
          setOverallProgress(newOverallProgress);

          // Move to next step after a short delay
          setTimeout(() => {
            stepIndex++;
            runNextStep();
          }, 300);
        } else {
          setAnalysisSteps(prev => prev.map((step, idx) => ({
            ...step,
            progress: idx === stepIndex ? progress : step.progress
          })));
        }
      }, 150);
    };

    // Start analysis after a short delay
    const timeout = setTimeout(runNextStep, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAnalyzing, onAnalysisComplete]);

  if (!isAnalyzing) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Analyzing Content</h4>
                <span className="text-xs text-muted-foreground">
                  {Math.round(overallProgress)}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            <div className="space-y-2">
              {analysisSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: step.status === 'running' ? 1 : step.status === 'completed' ? 0.8 : 0.5,
                    scale: step.status === 'running' ? 1.02 : 1
                  }}
                  className="flex items-center gap-3 p-2 rounded"
                >
                  <div className="flex-shrink-0">
                    {step.status === 'running' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {step.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        step.status === 'running' ? 'font-medium text-foreground' : 
                        step.status === 'completed' ? 'text-muted-foreground' : 
                        'text-muted-foreground'
                      }`}>
                        {step.name}
                      </span>
                      {step.status === 'running' && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(step.progress)}%
                        </span>
                      )}
                    </div>
                    
                    {step.status === 'running' && (
                      <Progress value={step.progress} className="h-1 mt-1" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};