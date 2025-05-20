
import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';

// Step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizeAndReviewStep } from './steps/OptimizeAndReviewStep';
import { SaveStep } from './steps/save';
import { SerpAnalysisStep } from './steps/SerpAnalysisStep';
import { toast } from "sonner";
import { getApiKey } from '@/services/apiKeyService';

export const ContentBuilder = () => {
  const { state, navigateToStep } = useContentBuilder();
  const { activeStep, steps, content } = state;
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for unsaved changes
  useEffect(() => {
    const hasDraft = localStorage.getItem('content_builder_draft') !== null;
    setHasUnsavedChanges(hasDraft);
  }, [content]);

  // Calculate progress percentage
  const visibleSteps = steps.filter(step => step.id !== 2); // Exclude SERP Analysis step
  const completedVisibleSteps = visibleSteps.filter(step => step.completed);
  const progressPercentage = completedVisibleSteps.length / visibleSteps.length * 100;
  
  // Check current step status
  const currentStepComplete = steps[activeStep] ? steps[activeStep].completed : false;
  const currentStepId = steps[activeStep] ? steps[activeStep].id : -1;
  const canGoNext = activeStep < steps.length - 1 && (currentStepComplete || state.activeStep === 0);
  
  // Check for SERP API key in settings
  useEffect(() => {
    const checkSerpApiKey = async () => {
      try {
        // Try to get the SERP API key from the API key service
        const serpApiKey = await getApiKey('serp');
        
        if (serpApiKey) {
          // Store the key in localStorage for use by serpApiService
          localStorage.setItem('serp_api_key', serpApiKey);
          console.log('SERP API key loaded from settings');
        } else {
          console.log('No SERP API key found in settings');
        }
      } catch (error) {
        console.error('Error checking for SERP API key:', error);
      }
    };
    
    checkSerpApiKey();
  }, []);
  
  // Handle next step navigation
  const handleNextStep = () => {
    console.log("Attempting to navigate to next step from", currentStepId);
    console.log("Current step complete:", currentStepComplete);
    
    if (hasUnsavedChanges && currentStepId === 4) { // Writing step
      setPendingNavigation(activeStep + 1);
      setShowUnsavedDialog(true);
    } else {
      navigateToStep(activeStep + 1);
    }
  };
  
  // Handle previous step navigation
  const handlePrevStep = () => {
    if (hasUnsavedChanges && currentStepId === 4) { // Writing step
      setPendingNavigation(activeStep - 1);
      setShowUnsavedDialog(true);
    } else {
      navigateToStep(activeStep - 1);
    }
  };
  
  // Handle save before navigation
  const handleSaveBeforeNavigation = () => {
    // Save the current content to localStorage
    if (content && content.trim().length > 0) {
      localStorage.setItem('content_builder_draft', content);
      localStorage.setItem('content_builder_timestamp', new Date().toISOString());
      toast.success("Content saved");
    }
    
    // Continue with navigation
    if (pendingNavigation !== null) {
      navigateToStep(pendingNavigation);
      setPendingNavigation(null);
      setShowUnsavedDialog(false);
    }
  };
  
  // Handle discard changes
  const handleDiscardChanges = () => {
    // Clear the draft from localStorage
    localStorage.removeItem('content_builder_draft');
    localStorage.removeItem('content_builder_timestamp');
    
    // Continue with navigation
    if (pendingNavigation !== null) {
      navigateToStep(pendingNavigation);
      setPendingNavigation(null);
      setShowUnsavedDialog(false);
      setHasUnsavedChanges(false);
    }
  };
  
  // Debug step completion status
  useEffect(() => {
    console.log("Current step:", steps[activeStep]);
    console.log("Steps status:", steps.map(s => `${s.id}: ${s.name} - Completed: ${s.completed}, Analyzed: ${s.analyzed}`));
  }, [activeStep, steps]);

  // Check if SERP API key is set up
  useEffect(() => {
    // If on SERP analysis step or moving to it, check for API key
    if (steps[activeStep]?.id === 2 || currentStepId === 2) {
      // First check settings through the service, then fall back to localStorage
      const checkApiKey = async () => {
        try {
          const settingsApiKey = await getApiKey('serp');
          const localApiKey = localStorage.getItem('serp_api_key');
          
          // If we have either key, we're good
          if (settingsApiKey || localApiKey) {
            // If we found a key in settings but not in localStorage, store it
            if (settingsApiKey && !localApiKey) {
              localStorage.setItem('serp_api_key', settingsApiKey);
            }
            
            console.log('SERP API key found, can proceed with analysis');
          } else {
            // No API key found, show warning
            toast.warning(
              "No SERP API key found. Please add your API key in Settings to see real data.",
              {
                duration: 5000,
                action: {
                  label: "Go to Settings",
                  onClick: () => {
                    window.location.href = "/settings/api";
                  }
                }
              }
            );
          }
        } catch (error) {
          console.error('Error checking for SERP API key:', error);
        }
      };
      
      checkApiKey();
    }
  }, [activeStep, currentStepId, steps]);
  
  // Render the current step component
  const renderStepContent = () => {
    // Get step ID of the active step
    const stepID = steps[activeStep].id;
    
    switch (stepID) {
      case 0: return <KeywordSelectionStep />;
      case 1: return <ContentTypeStep />;
      case 2: return <SerpAnalysisStep />;
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
  
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))]">
      {/* Content Builder Sidebar */}
      <ContentBuilderSidebar 
        steps={steps} 
        activeStep={activeStep} 
        navigateToStep={(step) => {
          if (hasUnsavedChanges && currentStepId === 4) {
            setPendingNavigation(step);
            setShowUnsavedDialog(true);
          } else {
            navigateToStep(step);
          }
        }} 
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
        <div className="flex-1 p-6 overflow-y-auto" id="content-builder-main-content">
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
      
      {/* Unsaved changes dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onClose={() => setShowUnsavedDialog(false)}
        onSave={handleSaveBeforeNavigation}
        onDiscard={handleDiscardChanges}
      />
    </div>
  );
};
