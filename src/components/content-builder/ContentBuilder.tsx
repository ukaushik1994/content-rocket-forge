
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { useContent } from '@/contexts/content';

// Step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizeAndReviewStep } from './steps/OptimizeAndReviewStep';
import { SaveStep } from './steps/save';

export const ContentBuilder = () => {
  const { state, navigateToStep, setMainKeyword, addKeyword, setContentTitle, setContentType, setContentFormat, setContentIntent, setContent, setMetaTitle, setMetaDescription, setOutline, setOutlineSections, updateContent, setAdditionalInstructions } = useContentBuilder();
  const { contentItems, loading } = useContent();
  const location = useLocation();
  const { steps, currentStep } = state;
  const activeStep = currentStep;

  // Calculate progress percentage
  const visibleSteps = steps.filter(step => step.id !== 2); // Exclude SERP Analysis step
  const completedVisibleSteps = visibleSteps.filter(step => step.completed);
  const progressPercentage = completedVisibleSteps.length / visibleSteps.length * 100;
  
  // Check current step status
  const currentStepComplete = steps[activeStep] ? steps[activeStep].completed : false;
  const currentStepId = steps[activeStep] ? steps[activeStep].id : -1;
  const canGoNext = activeStep < steps.length - 1 && (currentStepComplete || activeStep === 0);
  
  // Handle next step navigation
  const handleNextStep = () => {
    console.log("Attempting to navigate to next step from", currentStepId);
    console.log("Current step complete:", currentStepComplete);
    
    // Before navigation, verify if there are any requirements for the current step
    if (currentStepId === 0 && !state.mainKeyword) {
      console.log("Can't navigate: No main keyword selected");
      return;
    }
    
    if (currentStepId === 3 && (!state.outline || state.outline.length === 0)) {
      console.log("Can't navigate: No outline created");
      return;
    }
    
    navigateToStep(activeStep + 1);
  };
  
  // Handle previous step navigation
  const handlePrevStep = () => {
    navigateToStep(activeStep - 1);
  };
  
  // Debug step completion status
  useEffect(() => {
    console.log("Current step:", steps[activeStep]);
    console.log("Steps status:", steps.map(s => `${s.id}: ${s.name} - Completed: ${s.completed}, Analyzed: ${s.analyzed}`));
  }, [activeStep, steps]);
  
  // Render the current step component
  const renderStepContent = () => {
    // Get step ID of the active step
    const stepID = steps[activeStep].id;
    
    switch (stepID) {
      case 0: return <KeywordSelectionStep />;
      case 1: return <ContentTypeStep />;
      case 3: return <OutlineStep />;
      case 4: return <ContentWritingStep />;
      case 5: return <OptimizeAndReviewStep />;
      default: return <KeywordSelectionStep />;
    }
  };
  
  // Get visible step count and position for UI display
  const getVisibleStepInfo = () => {
    // Calculate the visible step number (excluding the SERP Analysis step)
    const currentStepID = steps[activeStep].id;
    const visibleStepNumber = visibleSteps.findIndex(step => step.id === currentStepID) + 1;
    
    return {
      current: visibleStepNumber,
      total: visibleSteps.length
    };
  };
  
  const stepInfo = getVisibleStepInfo();
  
  // Check if we're on the final step
  const isLastStep = activeStep === steps.length - 1 || steps[activeStep].id === 5;
  
  // --- Load draft data if editing ---
  React.useEffect(() => {
    // Only run on mount and when content items are loaded
    if (loading) return;
    
    const navState = location.state as { contentId?: string } | undefined;
    const contentId = navState?.contentId;
    if (!contentId) return;

    // Find the draft in contentItems
    const draft = contentItems.find(item => item.id === contentId);
    if (!draft) return;

    // Populate context state with draft data
    setMainKeyword(draft.metadata?.mainKeyword || '');
    (draft.metadata?.secondaryKeywords || []).forEach((kw: string) => addKeyword(kw));
    setContentTitle(draft.title || '');
    setContentType(draft.metadata?.contentType || 'article');
    setContentFormat(draft.metadata?.contentFormat || 'long-form');
    setContentIntent(draft.metadata?.contentIntent || 'inform');
    setContent(draft.content || '');
    setMetaTitle(draft.metadata?.metaTitle || '');
    setMetaDescription(draft.metadata?.metaDescription || '');
    if (typeof draft.metadata?.outline !== 'undefined') {
      setOutline(draft.metadata.outline);
    }
    if (typeof draft.metadata?.outlineSections !== 'undefined') {
      setOutlineSections(draft.metadata.outlineSections);
    }
    setAdditionalInstructions(draft.metadata?.additionalInstructions || '');
    // Add more fields as needed
  }, [location.state, contentItems, loading]);
  
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
              Step {stepInfo.current} of {stepInfo.total}
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
        {!isLastStep && (
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
                className={`gap-1 shadow-lg ${canGoNext ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300' : 'opacity-50'}`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
