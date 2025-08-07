import React, { useEffect, useState } from 'react';
import { useContentBuilder, ContentBuilderProvider } from '@/contexts/content-builder/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { SimpleAIServiceIndicator } from './ai/SimpleAIServiceIndicator';

// Step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeAndOutlineStep } from './steps/ContentTypeAndOutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizeAndReviewStep } from './steps/OptimizeAndReviewStep';
import { SerpAnalysisStep } from './steps/SerpAnalysisStep';
import { toast } from "sonner";
import { getApiKey } from '@/services/apiKeyService';
import { migrateExistingAPIKeys } from '@/utils/migrateAIProviders';
import { useTemplateInitialization } from '@/hooks/useTemplateInitialization';
import { TemplateStatus } from '@/components/ui/template-indicator';

interface ContentBuilderProps {
  initialKeyword?: string;
  selectedKeywords?: string[];
  location?: string;
  serpData?: any;
  initialStep?: number;
}

export const ContentBuilder: React.FC<ContentBuilderProps> = ({
  initialKeyword,
  selectedKeywords,
  location,
  serpData,
  initialStep
}) => {
  const { state, dispatch, navigateToStep, addSerpSelections } = useContentBuilder();
  const { activeStep, steps, content } = state;
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'found' | 'not-found' | 'error'>('checking');
  
  // Initialize templates
  const templateStatus = useTemplateInitialization();

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

  // Initialize with preloaded data
  useEffect(() => {
    if (initialKeyword || selectedKeywords || location || serpData || initialStep !== undefined) {
      dispatch({
        type: 'LOAD_PRELOADED_DATA',
        payload: {
          mainKeyword: initialKeyword,
          selectedKeywords,
          location,
          serpData,
          step: initialStep
        }
      });

      // Mark previous steps as completed if starting at a later step
      if (initialStep !== undefined && initialStep > 0) {
        for (let i = 0; i < initialStep; i++) {
          dispatch({ type: 'MARK_STEP_COMPLETED', payload: i });
        }
        
        // If we have SERP data, skip SERP Analysis step (id: 2)
        if (serpData && initialStep >= 2) {
          dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
        }
      }
    }
  }, [initialKeyword, selectedKeywords, location, serpData, initialStep, dispatch]);

  // Calculate progress percentage
  const visibleSteps = steps.filter(step => step.id !== 2); // Exclude SERP Analysis step
  const completedVisibleSteps = visibleSteps.filter(step => step.completed);
  const progressPercentage = completedVisibleSteps.length / visibleSteps.length * 100;
  
  // Check current step status
  const currentStepComplete = steps[activeStep] ? steps[activeStep].completed : false;
  const currentStepId = steps[activeStep] ? steps[activeStep].id : -1;
  const canGoNext = activeStep < steps.length - 1 && (currentStepComplete || state.activeStep === 0);
  
  // Initialize AI provider preferences and check for SERP API key
  useEffect(() => {
    const initializeServices = async () => {
      setApiKeyStatus('checking');
      try {
        // Migrate existing API keys to new system
        await migrateExistingAPIKeys();
        
        // Try to get the SERP API key from the API key service
        const serpApiKey = await getApiKey('serp');
        
        if (serpApiKey) {
          // Store the key in localStorage for use by serpApiService
          localStorage.setItem('serp_api_key', serpApiKey);
          console.log('🔑 SERP API key loaded from settings');
          setApiKeyStatus('found');
        } else {
          console.log('⚠️ No SERP API key found in settings');
          
          // Check localStorage as fallback
          const localStorageKey = localStorage.getItem('serp_api_key');
          if (localStorageKey) {
            setApiKeyStatus('found');
          } else {
            setApiKeyStatus('not-found');
          }
        }
      } catch (error) {
        console.error('Error initializing services:', error);
        setApiKeyStatus('error');
      }
    };
    
    initializeServices();
  }, []);
  
  // Handle next step navigation
  const handleNextStep = () => {
    console.log("Attempting to navigate to next step from", currentStepId);
    console.log("Current step complete:", currentStepComplete);
    
    if (hasUnsavedChanges && currentStepId === 3) { // Writing step (now id 3)
      setPendingNavigation(activeStep + 1);
      setShowUnsavedDialog(true);
    } else {
      navigateToStep(activeStep + 1);
    }
  };
  
  // Handle previous step navigation
  const handlePrevStep = () => {
    if (hasUnsavedChanges && currentStepId === 3) { // Writing step (now id 3)
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
    if (apiKeyStatus === 'not-found' && (activeStep === 0 || currentStepId === 2)) {
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
    } else if (apiKeyStatus === 'error' && (activeStep === 0 || currentStepId === 2)) {
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
      case 0: return <KeywordSelectionStep />;
      case 1: return <ContentTypeAndOutlineStep />;
      case 2: return <SerpAnalysisStep />;
      case 3: return <ContentWritingStep />;
      case 4: return <OptimizeAndReviewStep />;
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
  const isLastStep = activeStep === steps.length - 1 || steps[activeStep].id === 4;
  
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))] bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Content Builder Sidebar */}
      <ContentBuilderSidebar 
        steps={steps} 
        activeStep={activeStep} 
        navigateToStep={(step) => {
          if (hasUnsavedChanges && currentStepId === 3) {
            setPendingNavigation(step);
            setShowUnsavedDialog(true);
          } else {
            navigateToStep(step);
          }
        }} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-accent/5 to-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        {/* Progress indicator */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Content Builder</span>
              </div>
              <div className="h-4 w-px bg-border/40" />
              <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                {steps[activeStep].name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {apiKeyStatus === 'not-found' && (
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/20 px-3 py-1.5 rounded-full border border-amber-800/30 backdrop-blur-sm">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Mock data mode</span>
                </div>
              )}
              <SimpleAIServiceIndicator size="md" />
              <TemplateStatus 
                templateCount={templateStatus.templateCount}
                isLoading={templateStatus.isLoading}
                error={templateStatus.error}
              />
              <div className="text-sm text-muted-foreground px-4 py-1.5 bg-muted/30 rounded-full border border-border/30 backdrop-blur-sm">
                Step {stepInfo.current} of {stepInfo.total}
              </div>
            </div>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2 bg-muted/30 rounded-full overflow-hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm" />
          </div>
        </div>
        
        {/* Step content */}
        <div className="flex-1 p-8 overflow-y-auto relative z-10" id="content-builder-main-content">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
              {renderStepContent()}
            </div>
          </div>
        </div>
        
        {/* Navigation controls */}
        {!isLastStep && (
          <div className="sticky bottom-0 z-20 bg-background/90 backdrop-blur-md border-t border-border/40 p-6 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={activeStep === 0}
                className="gap-2 px-6 py-2.5 bg-background/50 border-border/60 hover:border-border hover:bg-background/70 transition-all duration-200 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              
              <div className="flex items-center gap-3">
                {currentStepComplete && (
                  <div className="flex items-center gap-2 text-sm text-green-400 bg-green-950/20 px-3 py-1.5 rounded-full border border-green-800/30">
                    <CheckCircle className="h-4 w-4" />
                    <span>Step complete</span>
                  </div>
                )}
                
                <Button
                  onClick={handleNextStep}
                  disabled={!canGoNext}
                  className={`gap-2 px-6 py-2.5 transition-all duration-300 ${
                    canGoNext 
                      ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-primary/25' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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

// Safe default export that ensures a Provider is present when this component is mounted directly
export const ContentBuilderWithProvider: React.FC<ContentBuilderProps> = (props) => (
  <ContentBuilderProvider>
    <ContentBuilder {...props} />
  </ContentBuilderProvider>
);

export default ContentBuilderWithProvider;
