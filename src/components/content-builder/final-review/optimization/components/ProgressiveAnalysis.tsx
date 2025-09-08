import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, AlertCircle, FileText, Target, Zap, BarChart3 } from 'lucide-react';

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'running' | 'completed' | 'error';
  suggestions?: number;
}

interface ProgressiveAnalysisProps {
  isAnalyzing: boolean;
  steps: AnalysisStep[];
  onStepComplete?: (stepId: string, suggestions: any[]) => void;
}

export function ProgressiveAnalysis({ isAnalyzing, steps, onStepComplete }: ProgressiveAnalysisProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStepIndex(0);
      setAnimatedProgress(0);
      return;
    }

    // Simulate progressive analysis
    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextIndex = Math.min(prev + 1, steps.length);
        if (nextIndex < steps.length) {
          // Mark current step as completed and next as running
          steps[prev].status = 'completed';
          if (steps[nextIndex]) {
            steps[nextIndex].status = 'running';
          }
        }
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing, steps]);

  useEffect(() => {
    const targetProgress = isAnalyzing 
      ? Math.min((currentStepIndex / steps.length) * 100, 95)
      : 100;
    
    const progressInterval = setInterval(() => {
      setAnimatedProgress(prev => {
        const diff = targetProgress - prev;
        if (Math.abs(diff) < 0.5) {
          clearInterval(progressInterval);
          return targetProgress;
        }
        return prev + diff * 0.1;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex, isAnalyzing, steps.length]);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSuggestions = steps.reduce((sum, step) => sum + (step.suggestions || 0), 0);

  if (!isAnalyzing && completedSteps === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">AI Content Analysis</h3>
              <p className="text-sm text-muted-foreground">
                {isAnalyzing 
                  ? 'Analyzing your content with multiple AI models...' 
                  : `Analysis complete! Found ${totalSuggestions} optimization opportunities.`
                }
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(animatedProgress)}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={animatedProgress} className="h-2" />

          {/* Analysis Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStepIndex && isAnalyzing;
              const isCompleted = step.status === 'completed';
              const isError = step.status === 'error';
              
              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    isActive 
                      ? 'border-primary/50 bg-primary/10 shadow-md scale-105' 
                      : isCompleted
                      ? 'border-green-500/30 bg-green-500/10'
                      : isError
                      ? 'border-red-500/30 bg-red-500/10'
                      : 'border-border/30 bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : isError ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                    
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-primary' : 
                      isCompleted ? 'text-green-600' :
                      isError ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                  
                  {isCompleted && step.suggestions && step.suggestions > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {step.suggestions} suggestions
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {!isAnalyzing && completedSteps > 0 && (
            <div className="mt-4 p-3 bg-background/40 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Analysis Complete! Ready to optimize your content.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Default analysis steps configuration
export const defaultAnalysisSteps: AnalysisStep[] = [
  {
    id: 'content_quality',
    title: 'Content Quality',
    description: 'Analyzing readability and engagement',
    icon: FileText,
    status: 'pending'
  },
  {
    id: 'seo_analysis',
    title: 'SEO Analysis',
    description: 'Checking keyword usage and structure',
    icon: BarChart3,
    status: 'pending'
  },
  {
    id: 'serp_integration',
    title: 'SERP Integration',
    description: 'Finding competitor insights',
    icon: Target,
    status: 'pending'
  },
  {
    id: 'ai_detection',
    title: 'AI Detection',
    description: 'Humanizing AI-generated content',
    icon: Zap,
    status: 'pending'
  }
];