import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Send, Save, FileText, Sparkles, Target, Zap, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { StepContent } from './dialog/StepContent';
import { StepNavigationItems } from './dialog/StepNavigationItems';
import { ProgressIndicator } from './dialog/ProgressIndicator';
import { LoadingStateWrapper } from './dialog/LoadingStateWrapper';
import { ConfirmationDialog } from './dialog/ConfirmationDialog';
import { ContentBuilderProvider, useContentBuilder } from '@/contexts/ContentBuilderContext';
import { EnhancedSolution } from '@/contexts/content-builder/types';
import { SerpAnalysisStep } from '@/components/content-builder/steps/SerpAnalysisStep';
import { StrategyContextInitializer } from './dialog/StrategyContextInitializer';
import { StrategyWorkflowProgress } from './dialog/StrategyWorkflowProgress';

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


export function StrategyBuilderDialog({ open, onOpenChange, proposal }: StrategyBuilderDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Reset state and check for saved progress when dialog opens
  useEffect(() => {
    if (open) {
      setInitializationError(null);
      
      // Validate proposal data
      if (!proposal?.primary_keyword) {
        setInitializationError('Strategy proposal is missing primary keyword');
        return;
      }

      // Check for saved progress in localStorage
      const savedProgress = localStorage.getItem(`strategy_builder_draft_${proposal.id}`);
      if (savedProgress) {
        try {
          const { step, completedSteps: saved } = JSON.parse(savedProgress);
          setCurrentStep(step);
          setCompletedSteps(saved || []);
        } catch (error) {
          console.error('Failed to restore progress:', error);
          setCurrentStep(0);
          setCompletedSteps([]);
        }
      } else {
        setCurrentStep(0);
        setCompletedSteps([]);
      }
    }
  }, [open, proposal]);

  // Simplified wrapper without artificial delays
  const StepValidationWrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  // Enhanced navigation validation with detailed error messages
  const getStepValidation = (step: number, state: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (step) {
      case 0:
        // Solution selection - always accessible
        return { valid: true, errors: [] };
        
      case 1:
        // SERP Analysis
        if (!state.selectedSolution && !proposal) {
          errors.push('Select a solution first');
        }
        break;
        
      case 2:
        // Outline Generation
        if (!state.selectedSolution && !proposal) {
          errors.push('Select a solution first');
        }
        if (!state.mainKeyword && !proposal?.primary_keyword) {
          errors.push('Set a primary keyword');
        }
        break;
        
      case 3:
        // Content Generation
        if (!state.selectedSolution && !proposal) {
          errors.push('Select a solution first');
        }
        if (!state.mainKeyword && !proposal?.primary_keyword) {
          errors.push('Set a primary keyword');
        }
        if (!state.outline?.length && !state.serpSelections?.length) {
          errors.push('Generate an outline or select SERP items');
        }
        break;
        
      case 4:
        // Save Content
        if (!state.selectedSolution && !proposal) {
          errors.push('Select a solution first');
        }
        if (!state.mainKeyword && !proposal?.primary_keyword) {
          errors.push('Set a primary keyword');
        }
        if (!state.content && !state.outline?.length) {
          errors.push('Generate content or create an outline');
        }
        break;
    }
    
    return { valid: errors.length === 0, errors };
  };

  const canProceedToStep = (step: number, state: any): boolean => {
    return getStepValidation(step, state).valid;
  };

  const getStepRequirement = (step: number, state: any): string => {
    const validation = getStepValidation(step, state);
    if (validation.valid) {
      return 'Ready';
    }
    return validation.errors.join(', ');
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      // Mark current step as completed
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Save progress to localStorage
      localStorage.setItem(`strategy_builder_draft_${proposal.id}`, JSON.stringify({
        step: nextStep,
        completedSteps: [...new Set([...completedSteps, currentStep])],
        timestamp: Date.now()
      }));
      
      toast(`Moved to ${STEPS[nextStep]?.title || `Step ${nextStep + 1}`}`, { 
        description: 'Step completed successfully' 
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Check if user has made progress that would be lost
    const hasProgress = currentStep > 0 || completedSteps.length > 0;
    
    if (hasProgress) {
      setShowExitConfirmation(true);
    } else {
      // Clear saved progress and close
      localStorage.removeItem(`strategy_builder_draft_${proposal.id}`);
      onOpenChange(false);
    }
  };

  const handleConfirmExit = () => {
    // Clear saved progress when exiting
    localStorage.removeItem(`strategy_builder_draft_${proposal.id}`);
    onOpenChange(false);
    setShowExitConfirmation(false);
    setCompletedSteps([]);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-7xl h-[90vh] flex flex-col bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-xl border-border/50 sm:max-w-[95vw] lg:max-w-6xl xl:max-w-7xl !z-[100]">
        <ContentBuilderProvider>
          <StrategyContextInitializer proposal={proposal}>
          
          {/* Interactive Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated gradient orbs */}
            <motion.div 
              className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                x: [0, 30, 0],
                y: [0, -20, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.5, 0.2],
                x: [0, -30, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            
            {/* Interactive floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 6,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col h-full min-h-0">
            {/* Hero Header Section */}
            <motion.div 
              className="flex-shrink-0 text-center mb-4 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-2xl blur-2xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="relative">
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">AI-Powered Strategy Builder</span>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </motion.div>
                
                <DialogTitle className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent">
                  Strategy Content Builder
                </DialogTitle>
                
                <motion.p 
                  className="text-muted-foreground max-w-2xl mx-auto mb-4 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Transform your content strategy with AI-powered analysis and optimization
                </motion.p>

                {/* Simplified Progress Section */}
                <motion.div 
                  className="max-w-lg mx-auto bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 p-3"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Step {currentStep + 1} of {STEPS.length}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Step Navigation with Progress Tracker */}
            <div className="flex-shrink-0 mb-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="grid grid-cols-5 gap-2">
                    <StepNavigationItems 
                      currentStep={currentStep} 
                      onStepClick={setCurrentStep}
                      steps={STEPS}
                      proposal={proposal}
                    />
                  </div>
                </motion.div>
              </div>
              
              <div className="hidden lg:block">
                <StrategyWorkflowProgress 
                  currentStep={currentStep}
                  steps={STEPS}
                  completedSteps={completedSteps}
                />
              </div>
            </div>

            {/* Enhanced Step Content Area with ScrollArea */}
            <motion.div 
              className="flex-1 min-h-0 bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
              <div className="relative h-full">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
                
                <div className="relative z-10 h-full overflow-auto p-4 md:p-6">
                  <LoadingStateWrapper
                    isLoading={false}
                    error={initializationError}
                    onRetry={() => setInitializationError(null)}
                    loadingMessage="Initializing strategy builder..."
                  >
                    <StepValidationWrapper>
                      <StepContent 
                        currentStep={currentStep}
                        proposal={proposal}
                        handleClose={handleClose}
                      />
                    </StepValidationWrapper>
                      </LoadingStateWrapper>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Navigation Footer */}
                <motion.div 
                  className="flex-shrink-0 flex justify-between items-center pt-6 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="bg-background/60 backdrop-blur-xl border-border/50 hover:bg-background/80"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  </motion.div>

                  <div className="flex gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={handleClose}
                        className="bg-background/60 backdrop-blur-xl border-border/50 hover:bg-background/80"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {currentStep < STEPS.length - 1 ? (
                        <Button 
                          onClick={handleNext}
                          className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleClose}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-500/90 hover:to-emerald-500/90 shadow-lg"
                        >
                          Complete
                        </Button>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </StrategyContextInitializer>
          </ContentBuilderProvider>
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