
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';

// Step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { SerpAnalysisStep } from './steps/SerpAnalysisStep';
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizationStep } from './steps/OptimizationStep';
import { PublishStep } from './steps/PublishStep';

export const ContentBuilder = () => {
  const { state, navigateToStep } = useContentBuilder();
  const { activeStep, steps } = state;

  // Calculate progress percentage
  const progressPercentage = steps.filter(step => step.completed).length / steps.length * 100;
  
  // Determine if user can proceed to next step
  const canGoNext = activeStep < steps.length - 1 && steps[activeStep].completed;
  
  // Render the current step component
  const renderStepContent = () => {
    const stepIndex = steps[activeStep].id;
    switch (stepIndex) {
      case 0: return <KeywordSelectionStep />;
      case 1: return <ContentTypeStep />;
      case 2: return <SerpAnalysisStep />;
      case 3: return <OutlineStep />;
      case 4: return <ContentWritingStep />;
      case 5: return <OptimizationStep />;
      case 6: return <PublishStep />;
      default: return <KeywordSelectionStep />;
    }
  };
  
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))]">
      {/* Content Builder Sidebar */}
      <ContentBuilderSidebar 
        steps={steps} 
        activeStep={activeStep} 
        navigateToStep={navigateToStep} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Progress indicator */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40 px-6 py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
                {steps[activeStep].name}
              </h1>
            </div>
            <div className="text-xs text-muted-foreground px-3 py-1 bg-white/5 rounded-full border border-white/10">
              Step {activeStep + 1} of {steps.length}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-1.5 bg-white/5" />
        </div>
        
        {/* Step content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            {renderStepContent()}
          </div>
        </div>
        
        {/* Navigation controls */}
        <div className="sticky bottom-0 z-10 bg-background/80 backdrop-blur-sm border-t border-border/40 p-4">
          <div className="flex justify-between max-w-5xl mx-auto">
            <Button
              variant="outline"
              onClick={() => navigateToStep(activeStep - 1)}
              disabled={activeStep === 0}
              className="gap-1 bg-glass border border-white/10 hover:border-white/20 transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <Button
              onClick={() => navigateToStep(activeStep + 1)}
              disabled={!canGoNext}
              className={`gap-1 shadow-lg ${canGoNext ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300' : 'opacity-50'}`}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
