import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send, Save, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { StepContent } from './dialog/StepContent';
import { StepNavigationItems } from './dialog/StepNavigationItems';
import { ProgressIndicator } from './dialog/ProgressIndicator';
import { LoadingStateWrapper } from './dialog/LoadingStateWrapper';
import { ConfirmationDialog } from './dialog/ConfirmationDialog';
import { ContentBuilderProvider, useContentBuilder } from '@/contexts/ContentBuilderContext';
import { EnhancedSolution } from '@/contexts/content-builder/types';
import { SerpAnalysisStep } from '@/components/content-builder/steps/SerpAnalysisStep';
import { SaveStep } from '@/components/content-builder/steps/save/SaveStep';

interface StrategyBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposal: any;
}

const STEPS = [
  { id: 0, title: 'Select Solution', icon: Send, description: 'Choose the solution to feature' },
  { id: 1, title: 'SERP Analysis', icon: Sparkles, description: 'Analyze search results' },
  { id: 2, title: 'Generate Outline', icon: Sparkles, description: 'Create content structure' },
  { id: 3, title: 'Generate Content', icon: FileText, description: 'Create the content' },
  { id: 4, title: 'Save Content', icon: Save, description: 'Save to repository' }
];

// Content initialization component to set up context
function StrategyContentInit({ proposal }: { proposal: any }) {
  const { 
    setMainKeyword, 
    setContentTitle, 
    setMetaTitle, 
    setMetaDescription,
    setContentType,
    setContentFormat,
    setContentIntent,
    analyzeKeyword,
    state
  } = useContentBuilder();
  
  // Enhanced initialization with error handling and loading states
  useEffect(() => {
    if (!proposal) return;
    
    const initializeStrategy = async () => {
      try {
        
        
        // Initialize content builder context with strategy data
        if (proposal.primary_keyword) {
          setMainKeyword(proposal.primary_keyword);
        }
        
        if (proposal.title) {
          setContentTitle(proposal.title);
          setMetaTitle(proposal.title);
        }
        
        // Set default content settings optimized for strategy content
        setContentType('blog');
        setContentFormat('long-form');
        setContentIntent('inform');
        
        // Set enhanced meta description with strategy context
        const description = proposal.description || 
          `A comprehensive guide about ${proposal.primary_keyword || 'your topic'}. ` +
          `Discover strategies, insights, and solutions to help you succeed.`;
        setMetaDescription(description);
        
        // Auto-trigger SERP analysis for strategy keyword with delay to ensure context is ready
        if (proposal.primary_keyword && !state.serpData) {
          setTimeout(async () => {
            try {
              await analyzeKeyword(proposal.primary_keyword);
            } catch (error) {
              console.error('[StrategyInit] SERP analysis failed:', error);
              // Don't block the flow, user can manually trigger SERP analysis
            }
          }, 500);
        }
        
      } catch (error) {
        console.error('[StrategyInit] Failed to initialize strategy:', error);
        // Don't throw - allow dialog to continue with partial initialization
      }
    };
    
    initializeStrategy();
  }, [proposal, setMainKeyword, setContentTitle, setMetaTitle, setMetaDescription, setContentType, setContentFormat, setContentIntent, analyzeKeyword, state.serpData]);
  
  return null;
}

export function StrategyBuilderDialog({ open, onOpenChange, proposal }: StrategyBuilderDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Reset state when dialog opens with error handling
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setInitializationError(null);
      
      // Validate proposal data
      if (!proposal?.primary_keyword) {
        setInitializationError('Strategy proposal is missing primary keyword');
        return;
      }
      
      
    }
  }, [open, proposal]);

  // Context-aware step validation using ContentBuilder state
  const ContentBuilderStepValidator = ({ children }: { children: React.ReactNode }) => {
    return (
      <ContentBuilderProvider>
        <StrategyContentInit proposal={proposal} />
        <StepValidationWrapper>
          {children}
        </StepValidationWrapper>
      </ContentBuilderProvider>
    );
  };

  const StepValidationWrapper = ({ children }: { children: React.ReactNode }) => {
    const { state } = useContentBuilder();
    const [isValidating, setIsValidating] = useState(true);
    
    // Allow context to initialize
    useEffect(() => {
      const timer = setTimeout(() => setIsValidating(false), 100);
      return () => clearTimeout(timer);
    }, []);

    if (isValidating) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-neon-purple border-t-transparent rounded-full"></div>
        </div>
      );
    }

    return <>{children}</>;
  };

  // Context-aware navigation with validation
  const NavigationController = () => {
    const { state } = useContentBuilder();
    
    const canProceedToStep = (step: number): boolean => {
      switch (step) {
        case 0: return true; // Always can access solution selection
        case 1: return !!state.selectedSolution; // Need solution selected
        case 2: return !!state.selectedSolution && state.serpSelections.some(item => item.selected); // Need solution and SERP selections
        case 3: return !!state.selectedSolution && state.outline.length > 0; // Need solution and outline
        case 4: return !!state.selectedSolution && !!state.content && state.content.length > 100; // Need everything
        default: return false;
      }
    };

    return { canProceedToStep };
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Check if user has made progress that would be lost
    const hasProgress = currentStep > 0;
    
    if (hasProgress) {
      setShowExitConfirmation(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleConfirmExit = () => {
    onOpenChange(false);
    setShowExitConfirmation(false);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Strategy Content Builder
          </DialogTitle>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {STEPS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <ProgressIndicator currentStep={currentStep} />
            </div>
        </DialogHeader>

        {/* Step Navigation */}
        <div className="flex-shrink-0 grid grid-cols-5 gap-2 mb-6">
          <ContentBuilderProvider>
            <StrategyContentInit proposal={proposal} />
            <StepNavigationItems 
              currentStep={currentStep} 
              onStepClick={setCurrentStep}
              steps={STEPS}
            />
          </ContentBuilderProvider>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          <LoadingStateWrapper
            isLoading={false}
            error={initializationError}
            onRetry={() => setInitializationError(null)}
            loadingMessage="Initializing strategy builder..."
          >
            <ContentBuilderStepValidator>
              <StepContent 
                currentStep={currentStep}
                proposal={proposal}
                handleClose={handleClose}
              />
            </ContentBuilderStepValidator>
          </LoadingStateWrapper>
        </div>

        {/* Navigation Footer */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleClose}>
                Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
        title="Exit Strategy Builder?"
        description="You have made progress in this strategy builder. Are you sure you want to exit? Your progress will be lost."
        confirmText="Exit"
        cancelText="Continue Working"
        onConfirm={handleConfirmExit}
        variant="destructive"
      />
    </Dialog>
  );
}