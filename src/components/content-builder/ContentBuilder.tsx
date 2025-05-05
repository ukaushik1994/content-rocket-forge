
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';

// Step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
// We're skipping the dedicated SERP Analysis step and integrating it into KeywordSelectionStep
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizationStep } from './steps/OptimizationStep';
import { FinalReviewStep } from './steps/FinalReviewStep';
import { SaveStep } from './steps/SaveStep';

export const ContentBuilder = () => {
  const { state, navigateToStep, dispatch } = useContentBuilder();
  const { activeStep, steps } = state;

  // Calculate progress percentage based on visible steps
  const visibleSteps = steps.filter(step => step.id !== 2); // Exclude SERP Analysis step (index 2)
  const progressPercentage = visibleSteps.filter(step => step.completed).length / visibleSteps.length * 100;
  
  // Update step mapping to skip SERP Analysis
  const getStepIndex = (activeStepId) => {
    // If activeStep > 2, subtract 1 to skip the SERP Analysis step
    return activeStepId > 2 ? activeStepId - 1 : activeStepId;
  };
  
  // Determine if user can proceed to next step
  const canGoNext = activeStep < steps.length - 1 && steps[activeStep].completed;
  
  // Handle next step navigation
  const handleNextStep = () => {
    if (canGoNext) {
      // Skip step 2 (SERP Analysis) when navigating from step 1
      if (activeStep === 1) {
        navigateToStep(3);
      } else {
        navigateToStep(activeStep + 1);
      }
    }
  };
  
  // Handle previous step navigation
  const handlePreviousStep = () => {
    // Skip step 2 (SERP Analysis) when navigating back from step 3
    if (activeStep === 3) {
      navigateToStep(1);
    } else {
      navigateToStep(activeStep - 1);
    }
  };
  
  // Render the current step component
  const renderStepContent = () => {
    const stepIndex = steps[activeStep].id;
    switch (stepIndex) {
      case 0: return <KeywordSelectionStep />;
      case 1: return <ContentTypeStep />;
      // We skip case 2 (SERP Analysis)
      case 3: return <OutlineStep />;
      case 4: return <ContentWritingStep />;
      case 5: return <OptimizationStep />;
      case 6: return <FinalReviewStep />; 
      case 7: return <SaveStep />;
      default: return <KeywordSelectionStep />;
    }
  };
  
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))]">
      {/* Content Builder Sidebar - We pass filtered steps to hide SERP Analysis */}
      <ContentBuilderSidebar 
        steps={steps.filter(step => step.id !== 2)} 
        activeStep={getStepIndex(activeStep)} 
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
              Step {getStepIndex(activeStep) + 1} of {visibleSteps.length}
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
              onClick={handlePreviousStep}
              disabled={activeStep === 0}
              className="gap-1 bg-glass border border-white/10 hover:border-white/20 transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <Button
              onClick={handleNextStep}
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
