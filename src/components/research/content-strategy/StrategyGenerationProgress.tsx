import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Target, Search, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StrategyGenerationProgressProps {
  isGenerating: boolean;
  currentStep?: string;
  progress?: number;
}

const GENERATION_STEPS = [
  { key: 'keywords', label: 'Generating Keywords', icon: Brain, description: 'AI is discovering untapped keyword opportunities...' },
  { key: 'analysis', label: 'Analyzing SERP Data', icon: Search, description: 'Processing search metrics and competition data...' },
  { key: 'strategy', label: 'Creating Strategy', icon: Target, description: 'Building comprehensive content strategy...' },
  { key: 'complete', label: 'Strategy Ready!', icon: Sparkles, description: 'Your personalized content strategy is complete.' }
];

export function StrategyGenerationProgress({ 
  isGenerating, 
  currentStep = 'keywords',
  progress = 0 
}: StrategyGenerationProgressProps) {
  const currentStepIndex = GENERATION_STEPS.findIndex(step => step.key === currentStep);
  const currentStepData = GENERATION_STEPS[currentStepIndex] || GENERATION_STEPS[0];

  if (!isGenerating) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center transform-none">
      {/* Full-screen overlay */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div className="relative z-[10000] w-full max-w-md bg-background/95 backdrop-blur-sm border border-border rounded-lg p-6 shadow-xl mx-4">
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted/50">
              <Sparkles className="h-6 w-6 text-primary/70" />
            </div>
            
            <h3 className="text-base font-medium text-foreground">
              {currentStepData.label}
            </h3>
            
            <p className="text-sm text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-1.5 bg-muted" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-4">
            {GENERATION_STEPS.slice(0, -1).map((step, index) => {
              const isActive = index === currentStepIndex;
              const isComplete = index < currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`p-1.5 rounded-full border transition-colors ${
                      isComplete 
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : isActive 
                          ? 'bg-muted border-border text-foreground'
                          : 'bg-background border-border/50 text-muted-foreground'
                    }`}
                  >
                    <StepIcon className="h-3.5 w-3.5" />
                  </div>
                  
                  <span className={`text-[10px] text-center max-w-[50px] transition-colors ${
                    isComplete ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}