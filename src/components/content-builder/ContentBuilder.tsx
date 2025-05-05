
import React, { useEffect, Suspense, lazy } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load step components
const KeywordSelectionStep = lazy(() => import('./steps/KeywordSelectionStep').then(mod => ({ default: mod.KeywordSelectionStep })));
const ContentTypeStep = lazy(() => import('./steps/ContentTypeStep').then(mod => ({ default: mod.ContentTypeStep })));
const SerpAnalysisStep = lazy(() => import('./steps/SerpAnalysisStep').then(mod => ({ default: mod.SerpAnalysisStep })));
const OutlineStep = lazy(() => import('./steps/OutlineStep').then(mod => ({ default: mod.OutlineStep })));
const ContentWritingStep = lazy(() => import('./steps/ContentWritingStep').then(mod => ({ default: mod.ContentWritingStep })));
const OptimizationStep = lazy(() => import('./steps/OptimizationStep').then(mod => ({ default: mod.OptimizationStep })));
const FinalReviewStep = lazy(() => import('./steps/FinalReviewStep').then(mod => ({ default: mod.FinalReviewStep })));
const SaveStep = lazy(() => import('./steps/SaveStep').then(mod => ({ default: mod.SaveStep })));

// Loading component for suspense fallback
const StepLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center py-24">
    <div className="relative">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-primary" />
      </div>
    </div>
    <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
  </div>
);

export const ContentBuilder = () => {
  const { state, navigateToStep } = useContentBuilder();
  const { activeStep, steps } = state;

  // Calculate progress percentage
  const progressPercentage = steps.filter(step => step.completed).length / steps.length * 100;
  
  // Determine if user can proceed to next step
  const canGoNext = activeStep < steps.length - 1 && steps[activeStep].completed;
  
  // Animation variants
  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };
  
  // Render the current step component
  const renderStepContent = () => {
    const stepIndex = steps[activeStep].id;
    
    return (
      <Suspense fallback={<StepLoadingFallback />}>
        {stepIndex === 0 && <KeywordSelectionStep />}
        {stepIndex === 1 && <ContentTypeStep />}
        {stepIndex === 2 && <SerpAnalysisStep />}
        {stepIndex === 3 && <OutlineStep />}
        {stepIndex === 4 && <ContentWritingStep />}
        {stepIndex === 5 && <OptimizationStep />}
        {stepIndex === 6 && <FinalReviewStep />}
        {stepIndex === 7 && <SaveStep />}
      </Suspense>
    );
  };
  
  // Calculate the next logical step based on current progress
  const getNextLogicalStep = () => {
    const currentStep = steps[activeStep].id;
    
    // If we're on keywords (step 0) and SERP (step 2) is completed
    // Skip SERP analysis and go to content type (step 1)
    if (currentStep === 0 && steps[2].completed) {
      return 1; // Go to Content Type
    }
    
    // If we're on content type (step 1) and outline (step 3) is completed
    // Skip outline and go directly to writing (step 4)
    if (currentStep === 1 && steps[3].completed) {
      return 4; // Go to Content Writing
    }
    
    // If we're on SERP analysis (step 2) and have selected items
    // Generate outline and go to outline step (step 3)
    if (currentStep === 2 && state.serpSelections?.some(s => s.selected)) {
      return 3; // Go to Outline step
    }
    
    // Default behavior: go to next step
    return activeStep + 1;
  };

  // Helper function to get step status color
  const getStepStatusColor = (index: number) => {
    if (index < activeStep && steps[index].completed) return "bg-green-400";
    if (index === activeStep) return "bg-neon-purple";
    if (index > activeStep && steps[index].completed) return "bg-neon-blue/60";
    return "bg-white/20";
  };
  
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
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                  repeatDelay: 5
                }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>
              <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
                {steps[activeStep].name}
              </h1>
              
              {steps[activeStep].completed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                </motion.div>
              )}
            </div>
            
            {/* Visual step indicator - Enhanced with clearer active state */}
            <div className="hidden md:flex items-center gap-3">
              {steps.map((step, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center ${idx > 0 ? 'ml-1' : ''}`}
                  onClick={() => steps[idx].completed || idx <= activeStep ? navigateToStep(idx) : null}
                >
                  <motion.div 
                    className={`rounded-full cursor-pointer transition-all duration-300 ${
                      idx === activeStep ? 'w-3 h-3 ring-2 ring-neon-purple/30 ring-offset-1 ring-offset-black' : 'w-2 h-2'
                    } ${getStepStatusColor(idx)}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    title={step.name}
                    initial={false}
                    animate={idx === activeStep ? { 
                      scale: [1, 1.1, 1], 
                      opacity: [0.9, 1, 0.9] 
                    } : {}}
                    transition={idx === activeStep ? { 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse" 
                    } : {}}
                  />
                  
                  {idx < steps.length - 1 && (
                    <motion.div 
                      className={`w-4 h-[1px] ${
                        idx < activeStep && steps[idx].completed 
                          ? "bg-green-400/60" 
                          : idx === activeStep 
                            ? "bg-neon-purple/40" 
                            : "bg-white/20"
                      }`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground px-3 py-1 bg-white/5 rounded-full border border-white/10">
              Step {activeStep + 1} of {steps.length}
            </div>
          </div>
          
          {/* Enhanced progress bar */}
          <div className="relative">
            <Progress value={progressPercentage} className="h-1.5 bg-white/5" />
            
            {/* Animated progress indicator */}
            {progressPercentage < 100 && (
              <motion.div 
                className="absolute top-0 right-0 h-1.5 w-3 bg-white/30 rounded-full"
                animate={{
                  x: [0, 10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </div>
        </div>
        
        {/* Step content with improved transitions */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeStep}
            className="flex-1 p-6 overflow-y-auto"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="max-w-5xl mx-auto space-y-6">
              {renderStepContent()}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation controls */}
        <div className="sticky bottom-0 z-10 bg-background/80 backdrop-blur-sm border-t border-border/40 p-4">
          <div className="flex justify-between max-w-5xl mx-auto">
            <Button
              variant="outline"
              onClick={() => navigateToStep(activeStep - 1)}
              disabled={activeStep === 0}
              className="gap-1 bg-glass border border-white/10 hover:border-white/20 transition-all"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            {/* Context-aware next button */}
            <motion.div
              whileHover={canGoNext ? { scale: 1.02 } : {}}
              whileTap={canGoNext ? { scale: 0.98 } : {}}
            >
              <Button
                onClick={() => navigateToStep(getNextLogicalStep())}
                disabled={!canGoNext}
                className={`gap-1 shadow-lg ${
                  canGoNext 
                    ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300' 
                    : 'opacity-50'
                }`}
              >
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'} 
                {activeStep === steps.length - 1 ? <CheckCircle className="h-4 w-4 ml-1" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </motion.div>
          </div>
          
          {/* Contextual help */}
          <AnimatePresence>
            {!steps[activeStep].completed && (
              <motion.div 
                className="max-w-5xl mx-auto mt-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ delay: 1 }}
              >
                <div 
                  className="text-xs text-muted-foreground flex items-center justify-end gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  <span>Complete this step to continue</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ContentBuilder;
