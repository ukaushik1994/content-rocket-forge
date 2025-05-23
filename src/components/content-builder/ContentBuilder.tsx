import React, { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { motion } from 'framer-motion';

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
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'found' | 'not-found' | 'error'>('checking');

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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="flex min-h-[calc(100vh-theme(spacing.20))]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
      <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background to-background/95">
        {/* Enhanced Progress indicator */}
        <motion.div 
          variants={itemVariants}
          className="sticky top-0 z-10 glass-panel bg-background/80 backdrop-blur-sm border-b border-white/10 px-6 py-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-6 w-6 text-neon-purple" />
              </motion.div>
              <div>
                <h1 className="text-xl font-semibold text-gradient">
                  {steps[activeStep].name}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Step {stepInfo.current} of {stepInfo.total}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {apiKeyStatus === 'not-found' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-800/30 backdrop-blur-sm"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Using mock data</span>
                </motion.div>
              )}
              <div className="text-xs text-muted-foreground px-4 py-2 glass-panel rounded-full border border-white/10 backdrop-blur-sm">
                Progress: {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden" />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 rounded-full"
              animate={{ 
                background: [
                  "linear-gradient(to right, rgba(155, 135, 245, 0.2), rgba(51, 195, 240, 0.2))",
                  "linear-gradient(to right, rgba(155, 135, 245, 0.3), rgba(51, 195, 240, 0.3))",
                  "linear-gradient(to right, rgba(155, 135, 245, 0.2), rgba(51, 195, 240, 0.2))"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
        </motion.div>
        
        {/* Step content with enhanced styling */}
        <motion.div 
          variants={itemVariants}
          className="flex-1 p-6 overflow-y-auto custom-scrollbar" 
          id="content-builder-main-content"
        >
          <div className="max-w-5xl mx-auto space-y-6">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Enhanced Navigation controls */}
        {!isLastStep && (
          <motion.div 
            variants={itemVariants}
            className="sticky bottom-0 z-10 glass-panel bg-background/90 backdrop-blur-sm border-t border-white/10 p-6"
          >
            <div className="flex justify-between max-w-5xl mx-auto">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={activeStep === 0}
                className="gap-2 glass-panel border border-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              
              <Button
                onClick={handleNextStep}
                disabled={!canGoNext}
                className={`gap-2 shadow-lg transition-all duration-300 ${
                  canGoNext 
                    ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple hover:shadow-[0_0_20px_rgba(155,135,245,0.5)]' 
                    : 'opacity-50'
                }`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Unsaved changes dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onClose={() => setShowUnsavedDialog(false)}
        onSave={handleSaveBeforeNavigation}
        onDiscard={handleDiscardChanges}
      />
    </motion.div>
  );
};
