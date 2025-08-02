import React from 'react';
import { useGlossaryBuilder } from '@/contexts/glossary-builder/GlossaryBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Import step components
import { TermDiscoveryStep } from './steps/TermDiscoveryStep';
import { TermSelectionStep } from './steps/TermSelectionStep';
import { SolutionContextStep } from './steps/SolutionContextStep';
import { DefinitionGenerationStep } from './steps/DefinitionGenerationStep';
import { GlossarySaveStep } from './steps/GlossarySaveStep';
import { GlossaryBuilderSidebar } from './sidebar/GlossaryBuilderSidebar';

export const EnhancedGlossaryBuilder = () => {
  const { state, navigateToStep } = useGlossaryBuilder();
  const { activeStep, steps } = state;

  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.completed);
  const progressPercentage = completedSteps.length / steps.length * 100;
  
  // Check current step status
  const currentStep = steps[activeStep];
  const canGoNext = activeStep < steps.length - 1 && (currentStep?.completed || activeStep === 0);
  const isLastStep = activeStep === steps.length - 1;

  // Handle navigation
  const handleNextStep = () => {
    if (canGoNext) {
      navigateToStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      navigateToStep(activeStep - 1);
    }
  };

  // Render the current step component
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return <TermDiscoveryStep />;
      case 1: return <TermSelectionStep />;
      case 2: return <SolutionContextStep />;
      case 3: return <DefinitionGenerationStep />;
      case 4: return <GlossarySaveStep />;
      default: return <TermDiscoveryStep />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.20))]">
      {/* Glossary Builder Sidebar */}
      <GlossaryBuilderSidebar 
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
                {currentStep?.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {state.lastError && (
                <div className="flex items-center gap-1 text-xs text-red-400 bg-red-950/30 px-2 py-1 rounded-full border border-red-800/30">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Error occurred</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground px-3 py-1 bg-white/5 rounded-full border border-white/10">
                Step {activeStep + 1} of {steps.length}
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-1.5 bg-white/5" />
        </div>
        
        {/* Step content with animation */}
        <div className="flex-1 p-6 overflow-y-auto" id="glossary-builder-main-content">
          <div className="max-w-5xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
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