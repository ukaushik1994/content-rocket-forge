
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';

// Step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { SerpAnalysisStep } from './steps/SerpAnalysisStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizationStep } from './steps/OptimizationStep';
import { FinalReviewStep } from './steps/FinalReviewStep';

export const ContentBuilder = () => {
  const { state, dispatch } = useContentBuilder();
  
  // This is a simplified version that works with the current state structure
  const activeStep = state.steps.current;
  const completedSteps = state.steps.completed;
  
  // Calculate progress percentage - simplified for now
  const totalSteps = 7; // Total number of steps
  const progressPercentage = (completedSteps.length / totalSteps) * 100;
  
  // Determine if user can proceed to next step
  const canGoNext = activeStep < totalSteps - 1 && completedSteps.includes(activeStep);
  
  // Handle next step navigation
  const handleNextStep = () => {
    if (canGoNext) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: activeStep + 1 });
    }
  };
  
  // Handle previous step navigation
  const handlePrevStep = () => {
    if (activeStep > 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: activeStep - 1 });
    }
  };
  
  // Render the current step component
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return <KeywordSelectionStep />;
      case 1: return <ContentTypeStep />;
      case 2: return <SerpAnalysisStep />;
      case 3: return <OutlineStep />;
      case 4: return <ContentWritingStep />;
      case 5: return <OptimizationStep />;
      case 6: return <FinalReviewStep />;
      default: return <KeywordSelectionStep />;
    }
  };
  
  // Array of step names for display
  const stepNames = [
    "Keyword Selection",
    "Content Type",
    "SERP Analysis",
    "Outline",
    "Content Writing",
    "Optimization",
    "Final Review"
  ];
  
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))]">
      {/* Content Builder Sidebar - simplified */}
      <div className="w-64 border-r bg-muted/10 p-4 hidden md:block">
        <div className="space-y-2">
          {stepNames.map((name, index) => (
            <div
              key={index}
              className={`p-2 rounded-md cursor-pointer ${
                activeStep === index ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
              }`}
              onClick={() => dispatch({ type: 'SET_CURRENT_STEP', payload: index })}
            >
              <div className="flex items-center gap-2">
                {completedSteps.includes(index) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div 
                    className={`h-4 w-4 rounded-full flex items-center justify-center text-xs ${
                      activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                )}
                <span>{name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Progress indicator */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40 px-6 py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                {stepNames[activeStep]}
              </h1>
            </div>
            <div className="text-xs text-muted-foreground px-3 py-1 bg-white/5 rounded-full border border-white/10">
              Step {activeStep + 1} of {totalSteps}
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
              onClick={handlePrevStep}
              disabled={activeStep === 0}
              className="gap-1 bg-glass border border-white/10 hover:border-white/20 transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <Button
              onClick={handleNextStep}
              disabled={!canGoNext}
              className={`gap-1 shadow-lg ${canGoNext ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'opacity-50'}`}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
