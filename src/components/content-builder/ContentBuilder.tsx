import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { cn } from '@/lib/utils';

// Step components
import { EnhancedContentStrategyStep } from './steps/EnhancedContentStrategyStep';
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeAndOutlineStep } from './steps/ContentTypeAndOutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizeAndReviewStep } from './steps/OptimizeAndReviewStep';
import { SerpAnalysisStep } from './steps/SerpAnalysisStep';
import { toast } from "sonner";
import { getApiKey } from '@/services/apiKeyService';

export const ContentBuilder = () => {
  const { state, navigateToStep, addSerpSelections } = useContentBuilder();
  const { activeStep, steps, content } = state;
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'found' | 'not-found' | 'error'>('checking');

  // Check for unsaved changes
  useEffect(() => {
    const hasDraft = localStorage.getItem('content_builder_draft') !== null;
    setHasUnsavedChanges(hasDraft);
  }, [content]);

  // Check for pending SERP selections from Answer the People
  useEffect(() => {
    const pendingSelections = localStorage.getItem('pendingSerpSelections');
    if (pendingSelections) {
      try {
        const selections = JSON.parse(pendingSelections);
        if (Array.isArray(selections) && selections.length > 0) {
          addSerpSelections(selections);
          localStorage.removeItem('pendingSerpSelections');
          toast.success(`Imported ${selections.length} questions from Answer the People`, {
            description: "Questions have been added to your SERP selections"
          });
        }
      } catch (error) {
        console.error('Error processing pending SERP selections:', error);
        localStorage.removeItem('pendingSerpSelections');
      }
    }
  }, [addSerpSelections]);

  // Calculate progress percentage
  const strategyStep = steps.find(step => step.id === 0);
  const keywordStep = steps.find(step => step.id === 1);
  const contentSteps = steps.filter(step => step.id >= 2 && step.id !== 3); // Filter out strategy, keywords, and SERP Analysis
  const completedContentSteps = contentSteps.filter(step => step.completed).length;
  
  // Progressive progress calculation
  const progressPercentage = (() => {
    if (!strategyStep?.completed) return 0;
    if (!keywordStep?.completed) return 33;
    return 33 + Math.round((completedContentSteps / contentSteps.length) * 67);
  })();
  
  // Check current step status
  const currentStepComplete = steps[activeStep] ? steps[activeStep].completed : false;
  const currentStepId = steps[activeStep] ? steps[activeStep].id : -1;
  const canGoNext = activeStep < steps.length - 1 && (currentStepComplete || state.activeStep === 0);
  
  // Check for SERP API key in settings with better error handling
  useEffect(() => {
    const checkSerpApiKey = async () => {
      setApiKeyStatus('checking');
      try {
        // Try to get the SERP API key from the API key service
        const serpApiKey = await getApiKey('serp');
        
        if (serpApiKey) {
          // Store the key in localStorage for use by serpApiService
          localStorage.setItem('serp_api_key', serpApiKey);
          console.log('SERP API key loaded from settings');
          setApiKeyStatus('found');
        } else {
          console.log('No SERP API key found in settings');
          
          // Check localStorage as fallback
          const localStorageKey = localStorage.getItem('serp_api_key');
          if (localStorageKey) {
            setApiKeyStatus('found');
          } else {
            setApiKeyStatus('not-found');
          }
        }
      } catch (error) {
        console.error('Error checking for SERP API key:', error);
        setApiKeyStatus('error');
      }
    };
    
    checkSerpApiKey();
  }, []);
  
  // Handle next step navigation
  const handleNextStep = () => {
    console.log("Attempting to navigate to next step from", currentStepId);
    console.log("Current step complete:", currentStepComplete);
    
    if (hasUnsavedChanges && currentStepId === 4) { // Writing step (now id 4)
      setPendingNavigation(activeStep + 1);
      setShowUnsavedDialog(true);
    } else {
      navigateToStep(activeStep + 1);
    }
  };
  
  // Handle previous step navigation
  const handlePrevStep = () => {
    if (hasUnsavedChanges && currentStepId === 4) { // Writing step (now id 4)
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

  // Display API key status warning when needed
  useEffect(() => {
    if (apiKeyStatus === 'not-found' && (activeStep === 1 || currentStepId === 3)) {
      toast.warning(
        "No SERP API key found. Please add your API key in Settings to see real data.",
        {
          duration: 8000,
          action: {
            label: "Go to Settings",
            onClick: () => {
              window.location.href = "/settings/api";
            }
          }
        }
      );
    } else if (apiKeyStatus === 'error' && (activeStep === 1 || currentStepId === 3)) {
      toast.error(
        "Error checking for SERP API key. You'll see mock data instead.",
        {
          duration: 8000
        }
      );
    }
  }, [apiKeyStatus, activeStep, currentStepId]);
  
  // Render the current step component
  const renderStepContent = () => {
    // Get step ID of the active step
    const stepID = steps[activeStep].id;
    
    switch (stepID) {
      case 0: return <EnhancedContentStrategyStep />;
      case 1: return <KeywordSelectionStep />;
      case 2: return <ContentTypeAndOutlineStep />;
      case 3: return <SerpAnalysisStep />;
      case 4: return <ContentWritingStep />;
      case 5: return <OptimizeAndReviewStep />;
      default: return <EnhancedContentStrategyStep />;
    }
  };
  
  // Get visible step count and position for UI display
  const getVisibleStepInfo = () => {
    // Calculate the visible step number (excluding the SERP Analysis step)
    const currentStepID = steps[activeStep].id;
    const visibleSteps = steps.filter(step => step.id !== 3); // Exclude SERP Analysis step
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
              {activeStep === 0 ? (
                <div className="p-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              ) : activeStep === 1 ? (
                <div className="p-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              )}
              <h1 className={cn(
                "text-lg font-semibold bg-clip-text text-transparent",
                activeStep === 0 
                  ? "bg-gradient-to-r from-amber-400 to-orange-500"
                  : activeStep === 1
                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                    : "bg-gradient-to-r from-neon-purple to-neon-blue"
              )}>
                {activeStep === 0 ? 'Strategy Studio' : 
                 activeStep === 1 ? 'Keyword Research' : 
                 steps[activeStep].name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {apiKeyStatus === 'not-found' && (
                <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/30 px-2 py-1 rounded-full border border-amber-800/30">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Using mock data</span>
                </div>
              )}
              <div className={cn(
                "text-xs px-3 py-1 rounded-full border",
                activeStep === 0
                  ? "text-amber-300 bg-amber-950/30 border-amber-800/30"
                  : activeStep === 1
                    ? "text-green-300 bg-green-950/30 border-green-800/30"
                    : "text-muted-foreground bg-white/5 border-white/10"
              )}>
                {activeStep === 0 
                  ? 'Foundation Phase'
                  : activeStep === 1
                    ? 'Research Phase'
                    : `Step ${stepInfo.current} of ${stepInfo.total}`
                }
              </div>
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
