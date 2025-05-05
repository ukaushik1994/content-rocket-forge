
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { ContentBuilderSidebar } from './sidebar/ContentBuilderSidebar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// Step components
import { KeywordSelectionStep } from './steps/KeywordSelectionStep';
import { ContentTypeStep } from './steps/ContentTypeStep';
import { SerpAnalysisStep } from './steps/SerpAnalysisStep';
import { OutlineStep } from './steps/OutlineStep';
import { ContentWritingStep } from './steps/ContentWritingStep';
import { OptimizationStep } from './steps/OptimizationStep';
import { FinalReviewStep } from './steps/FinalReviewStep';
import { SaveStep } from './steps/SaveStep';

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  // Render the current step component
  const renderStepContent = () => {
    const stepIndex = steps[activeStep].id;
    switch (stepIndex) {
      case 0: return <KeywordSelectionStep />;
      case 1: return <ContentTypeStep />;
      case 2: return <SerpAnalysisStep />;
      case 3: return <OutlineStep />;
      case 4: return <ContentWritingStep />;
      case 5: return <OptimizationStep />;
      case 6: return <FinalReviewStep />; 
      case 7: return <SaveStep />;
      default: return <KeywordSelectionStep />;
    }
  };
  
  // Calculate the next logical step based on current progress
  const getNextLogicalStep = () => {
    // If we're on step 0 (keywords) and step 2 (SERP) is completed, skip step 2
    if (activeStep === 0 && steps[2].completed) {
      return 1; // Go to Content Type (step 1)
    }
    
    // If we're on step 2 (SERP) and step 3 (Outline) is not yet started,
    // but we have SERP selections, auto-generate outline
    if (activeStep === 2) {
      return 3; // Go to Outline step
    }
    
    // Default behavior: go to next step
    return activeStep + 1;
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
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h1 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">
                {steps[activeStep].name}
              </h1>
              
              {steps[activeStep].completed && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
              )}
            </div>
            
            {/* Visual step indicator */}
            <div className="hidden md:flex items-center gap-3">
              {steps.map((step, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center ${idx > 0 ? 'ml-1' : ''}`}
                  onClick={() => navigateToStep(idx)}
                >
                  <div 
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                      idx < activeStep 
                        ? 'bg-neon-blue' 
                        : idx === activeStep 
                          ? 'bg-neon-purple w-3 h-3' 
                          : 'bg-white/20'
                    }`}
                  />
                  
                  {idx < steps.length - 1 && (
                    <div className="w-4 h-[1px] bg-white/20" />
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
        
        {/* Step content */}
        <motion.div 
          key={activeStep}
          className="flex-1 p-6 overflow-y-auto"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-5xl mx-auto space-y-6">
            {renderStepContent()}
          </div>
        </motion.div>
        
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
          </div>
          
          {/* Contextual help */}
          {!steps[activeStep].completed && (
            <div className="max-w-5xl mx-auto mt-2">
              <motion.div 
                className="text-xs text-muted-foreground flex items-center justify-end gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <ArrowRight className="h-3 w-3" />
                <span>Complete this step to continue</span>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
